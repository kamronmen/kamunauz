import { prisma } from "./prisma";

const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8808098016:AAFCiEI0ikDo5KIIFFzpbv-nCTmKDFXz9So";
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "8501604479";

/**
 * Sends a Telegram message in the background without blocking execution or slowing down the UI.
 */
export function sendTelegramBackground(messageHtml: string) {
  // Run asynchronously without awaiting to ensure ultra-fast response (<50ms)
  (async () => {
    try {
      const config = await prisma.storeConfig.findUnique({ where: { id: "default" } }).catch(() => null);
      const token = config?.telegramBotToken || DEFAULT_BOT_TOKEN;
      const chatId = config?.telegramChatId || DEFAULT_CHAT_ID;

      if (!token || !chatId) return;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout max

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageHtml,
          parse_mode: "HTML",
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
    } catch (err) {
      console.error("Background Telegram Send Error:", err);
    }
  })();
}

const formatMoneyUz = (num: number) =>
  Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";

/**
 * Notifies Telegram about a completed sale.
 */
export function notifySaleCompleted(sale: any, storeName = "Baraka Savdo") {
  const payTypeUz =
    sale.paymentType === "CASH"
      ? "💵 Naqd pul"
      : sale.paymentType === "CARD"
      ? "💳 Karta / Click"
      : "📒 Nasiya (Qarz)";

  const itemsList = Array.isArray(sale.items)
    ? sale.items
        .map((it: any, idx: number) => {
          const name = it.product?.name || it.name || "Mahsulot";
          return `  ${idx + 1}. <b>${name}</b> — ${it.quantity} dona (${formatMoneyUz(it.subtotal || it.sellingPrice * it.quantity)})`;
        })
        .join("\n")
    : "  Ma'lumot yo'q";

  const customerText = sale.customer ? `\n👤 <b>Xaridor:</b> ${sale.customer.name} (${sale.customer.phone})` : "";

  const text =
    `🛍 <b>YANGI SAVDO — ${storeName.toUpperCase()}</b>\n\n` +
    `🧾 <b>Chek №:</b> <code>${sale.receiptNo}</code>\n` +
    `💰 <b>Jami Summa:</b> <b>${formatMoneyUz(sale.totalAmount)}</b>\n` +
    `💳 <b>To'lov usuli:</b> ${payTypeUz}${customerText}\n\n` +
    `📦 <b>Sotilgan tovarlar (${sale.items?.length || 0} xil):</b>\n${itemsList}\n\n` +
    `📈 <b>Sof Foyda:</b> +${formatMoneyUz(sale.netProfit || 0)}\n` +
    `🕒 <i>${new Date().toLocaleTimeString("uz-UZ")} | SavdoPro AI</i>`;

  sendTelegramBackground(text);
}

/**
 * Notifies Telegram when a product runs out of stock or is critically low.
 */
export function notifyLowStock(productName: string, remainingQty: number) {
  const text =
    remainingQty <= 0
      ? `🚨 <b>DIQQAT! OMBORDA TOVAR TUGADI:</b>\n\n` +
        `❌ Mahsulot: <b>"${productName}"</b>\n` +
        `⚠️ <b>Qoldiq: 0 dona!</b>\n\n` +
        `Iltimos, do'konda savdo to'xtab qolmasligi uchun zudlik bilan ushbu tovardan yangi partiya buyurtma bering!`
      : `⚠️ <b>DIQQAT! TOVAR KAM QOLDI:</b>\n\n` +
        `📦 Mahsulot: <b>"${productName}"</b>\n` +
        `📉 <b>Qoldiq: ${remainingQty} dona</b> qoldi.\n` +
        `Yaqin kunlarda ta'minotchi bilan bog'laning!`;

  sendTelegramBackground(text);
}

/**
 * Notifies Telegram about recorded expenses.
 */
export function notifyExpense(expense: any, storeName = "Baraka Savdo") {
  const text =
    `💸 <b>KASSADAN XARAJAT CHIQDI — ${storeName.toUpperCase()}</b>\n\n` +
    `📋 <b>Nomi:</b> ${expense.title}\n` +
    `💵 <b>Summasi:</b> <b>${formatMoneyUz(expense.amount)}</b>\n` +
    `📂 <b>Kategoriya:</b> ${expense.category}\n` +
    `🕒 <i>${new Date().toLocaleTimeString("uz-UZ")} | SavdoPro AI</i>`;

  sendTelegramBackground(text);
}

/**
 * Notifies Telegram when a customer pays debt.
 */
export function notifyDebtPayment(customerName: string, amount: number, remainingDebt: number) {
  const text =
    `✅ <b>NASIYA TO'LOVI QABUL QILINDI!</b>\n\n` +
    `👤 <b>Mijoz:</b> ${customerName}\n` +
    `💵 <b>To'langan summa:</b> <b>${formatMoneyUz(amount)}</b>\n` +
    `📒 <b>Qolgan qarzi:</b> ${formatMoneyUz(remainingDebt)}\n` +
    `🕒 <i>${new Date().toLocaleTimeString("uz-UZ")} | SavdoPro AI</i>`;

  sendTelegramBackground(text);
}
