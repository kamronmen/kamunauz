import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialData } from "@/lib/autoSeed";

export async function GET(request: Request) {
  try {
    await ensureInitialData();
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const paymentType = searchParams.get("paymentType");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (paymentType) where.paymentType = paymentType;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(sales);
  } catch (error: any) {
    console.error("Sales GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialData();
    const body = await request.json();
    const { items, paymentType, customerId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Savat bo'sh bo'lishi mumkin emas!" }, { status: 400 });
    }

    if (!paymentType || !["CASH", "CARD", "DEBT"].includes(paymentType)) {
      return NextResponse.json({ error: "To'lov turi noto'g'ri ko'rsatilgan!" }, { status: 400 });
    }

    if (paymentType === "DEBT" && !customerId) {
      return NextResponse.json({ error: "Nasiyaga sotish uchun xaridorni tanlash shart!" }, { status: 400 });
    }

    // Generate unique receipt number
    const count = await prisma.sale.count();
    const receiptNo = `SP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    // Process transaction atomically
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      let totalCost = 0;
      const saleItemsToCreate = [];
      const stockAlertsToSend: { name: string; remaining: number }[] = [];

      for (const item of items) {
        // Resilient lookup: first by id, then barcode, then name
        let product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product && item.barcode) {
          product = await tx.product.findUnique({
            where: { barcode: item.barcode },
          });
        }

        if (!product && item.name) {
          product = await tx.product.findFirst({
            where: { name: item.name },
          });
        }

        if (!product) {
          throw new Error(
            `"${item.name || 'Mahsulot'}" omborda topilmadi. Iltimos, savatni tozalab, tovarlarni qayta tanlang.`
          );
        }

        const qty = Number(item.quantity) || 1;

        // Check if out of stock or insufficient
        if (product.stockQuantity <= 0) {
          throw new Error(
            `"${product.name}" mahsuloti omborda qolmagan (0 dona)!`
          );
        }

        if (product.stockQuantity < qty) {
          throw new Error(
            `"${product.name}" mahsulotidan omborda yetarli qolmagan! Mavjud qoldiq: ${product.stockQuantity} dona, siz esa ${qty} dona tanladingiz.`
          );
        }

        const sellingPrice = item.sellingPrice !== undefined ? Number(item.sellingPrice) : product.sellingPrice;
        const costPrice = item.costPrice !== undefined ? Number(item.costPrice) : product.costPrice;
        const subtotal = qty * sellingPrice;
        const itemCost = qty * costPrice;

        totalAmount += subtotal;
        totalCost += itemCost;

        saleItemsToCreate.push({
          productId: product.id,
          quantity: qty,
          costPrice,
          sellingPrice,
          subtotal,
        });

        // Deduct stock quantity
        const newStock = Math.max(0, product.stockQuantity - qty);
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: newStock,
          },
        });

        // If out of stock or low stock, record for alert
        if (newStock <= product.minStockAlert) {
          stockAlertsToSend.push({ name: product.name, remaining: newStock });
        }
      }

      const netProfit = totalAmount - totalCost;

      // Create Sale
      const sale = await tx.sale.create({
        data: {
          receiptNo,
          totalAmount,
          totalCost,
          netProfit,
          paymentType,
          status: "COMPLETED",
          customerId: customerId || null,
          items: {
            create: saleItemsToCreate,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // If Debt, record debt transaction and increase customer totalDebt
      if (paymentType === "DEBT" && customerId) {
        const itemSummary = items.length === 1 
          ? `Savdo: ${items[0].name || "Mahsulot"}` 
          : `Kassadan xarid (${items.length} xil mahsulot, chek: ${receiptNo})`;

        await tx.debtTransaction.create({
          data: {
            customerId,
            type: "BORROW",
            amount: totalAmount,
            description: itemSummary,
          },
        });

        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalDebt: {
              increment: totalAmount,
            },
          },
        });
      }

      // Audit check: large cash transaction or unusual debt
      if (totalAmount >= 2000000) {
        await tx.auditAlert.create({
          data: {
            type: "PRICE_OVERRIDE",
            message: `Katta summali savdo amalga oshirildi: ${receiptNo} (${totalAmount.toLocaleString("uz-UZ")} so'm)`,
            severity: "LOW",
          },
        });
      }

      return { sale, stockAlertsToSend };
    });

    // Send Telegram notifications asynchronously in the background (zero lag for user)
    try {
      const { notifySaleCompleted, notifyLowStock } = await import("@/lib/telegram");
      notifySaleCompleted(result.sale);
      for (const alert of result.stockAlertsToSend) {
        notifyLowStock(alert.name, alert.remaining);
      }
    } catch (e) {
      console.error("Telegram notification error:", e);
    }

    return NextResponse.json(result.sale, { status: 201 });
  } catch (error: any) {
    console.error("Sales POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
