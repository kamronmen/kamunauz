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

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Mahsulot topilmadi: ${item.productId}`);
        }

        const qty = Number(item.quantity) || 1;
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
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: qty,
            },
          },
        });
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

      return sale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Sales POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
