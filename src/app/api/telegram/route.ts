import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8808098016:AAFCiEI0ikDo5KIIFFzpbv-nCTmKDFXz9So";
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "8501604479";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { chatId, token, text, reportPeriod = "today" } = body;

    // Load store config dynamically
    const storeConfig = await prisma.storeConfig.findUnique({
      where: { id: "default" },
    });

    const storeName = storeConfig?.storeName || "Baraka Savdo";
    const botToken = token || storeConfig?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || BOT_TOKEN;
    let targetChatId = chatId || storeConfig?.telegramChatId || process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;

    if (!botToken) {
      return NextResponse.json({ error: "Telegram Bot Token sozlanmagan!" }, { status: 400 });
    }

    // Auto-resolve @username to numeric Chat ID via getUpdates if username provided
    if (typeof targetChatId === "string" && targetChatId.startsWith("@")) {
      const cleanUsername = targetChatId.replace("@", "").toLowerCase();
      try {
        const updatesRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
        const updatesData = await updatesRes.json();

        if (updatesData.ok && Array.isArray(updatesData.result)) {
          const matchedUpdate = updatesData.result.reverse().find(
            (u: any) =>
              u.message?.chat?.username?.toLowerCase() === cleanUsername ||
              u.message?.from?.username?.toLowerCase() === cleanUsername
          );
          if (matchedUpdate) {
            targetChatId = matchedUpdate.message.chat.id;
          } else {
            targetChatId = DEFAULT_CHAT_ID;
          }
        } else {
          targetChatId = DEFAULT_CHAT_ID;
        }
      } catch {
        targetChatId = DEFAULT_CHAT_ID;
      }
    }

    // Auto-generate rich HTML report (Daily or Monthly)
    if (!text) {
      const now = new Date();
      let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      let periodTitle = "KUNLIK HISOBOT (BUGUN)";

      if (reportPeriod === "yesterday") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        periodTitle = "KUNLIK HISOBOT (KECHA)";
      } else if (reportPeriod === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        periodTitle = `OYLIK HISOBOT (${now.toLocaleString("uz-UZ", { month: "long" }).toUpperCase()} OYI)`;
      } else if (reportPeriod === "all") {
        startDate = new Date(2020, 0, 1);
        periodTitle = "UMUMIY TIZIM HISOBOTI";
      }

      // Fetch Sales with items
      const sales = await prisma.sale.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Fetch Expenses
      const expenses = await prisma.expense.findMany({
        where: { date: { gte: startDate, lte: endDate } },
      });

      // Fetch Customers Debt
      const customers = await prisma.customer.findMany({ select: { totalDebt: true } });
      const uncollectedDebt = customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);

      // Calculations
      const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalCost = sales.reduce((sum, s) => sum + s.totalCost, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = totalSales - totalCost - totalExpenses;

      // Total quantity of items sold & Top 3 products calculation
      let totalItemsQty = 0;
      const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};

      sales.forEach((s) => {
        s.items.forEach((item) => {
          totalItemsQty += item.quantity;
          const pName = item.product?.name || "Mahsulot";
          if (!productSalesMap[pName]) {
            productSalesMap[pName] = { name: pName, qty: 0, revenue: 0 };
          }
          productSalesMap[pName].qty += item.quantity;
          productSalesMap[pName].revenue += item.subtotal;
        });
      });

      const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);

      const topProductsText = topProducts.length > 0
        ? topProducts.map((p, idx) => `   ${idx + 1}. <b>${p.name}</b> — ${p.qty} dona`).join("\n")
        : "   Ma'lumot yo'q";

      const formatMoneyUz = (num: number) =>
        Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";

      text = `📊 <b>"${storeName.toUpperCase()}" — ${periodTitle}</b>\n\n` +
        `💰 <b>Jami Savdo (Tushum):</b> ${formatMoneyUz(totalSales)}\n` +
        `📦 <b>Jami Tannarx (COGS):</b> ${formatMoneyUz(totalCost)}\n` +
        `💸 <b>Jami Xarajatlar:</b> ${formatMoneyUz(totalExpenses)}\n` +
        `🏆 <b>HAQIQIY SOF FOYDA:</b> <u>${formatMoneyUz(netProfit)}</u>\n\n` +
        `🛒 <b>Sotilgan Tovar Miqdori:</b> <b>${totalItemsQty} dona</b> (${sales.length} ta chek)\n` +
        `🔝 <b>Eng Ko'p Sotilgan Tovar Top 3:</b>\n${topProductsText}\n\n` +
        `📒 <b>Nasiyadagi Yig'iladigan Mablag':</b> ${formatMoneyUz(uncollectedDebt)}\n\n` +
        `🤖 <i>SAVDOPRO AI Retail OS System</i>`;
    }

    // Call Telegram Bot API
    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok || !telegramData.ok) {
      console.error("Telegram API Error:", telegramData);
      return NextResponse.json(
        {
          error: `Telegramga yuborib bo'lmadi (${telegramData.description || "Xatolik"}).`,
          details: telegramData,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `"${storeName}" hisoboti Telegram bot orqali muvaffaqiyatli yuborildi!`,
      result: telegramData.result,
    });
  } catch (error: any) {
    console.error("Telegram Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
