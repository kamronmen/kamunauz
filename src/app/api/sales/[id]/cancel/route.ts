import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Savdo cheki topilmadi" }, { status: 404 });
    }

    if (sale.status === "CANCELLED") {
      return NextResponse.json({ error: "Bu savdo allaqachon bekor qilingan" }, { status: 400 });
    }

    // Process reversal in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Restore product stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // 2. Reverse customer debt if it was debt
      if (sale.paymentType === "DEBT" && sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            totalDebt: {
              decrement: sale.totalAmount,
            },
          },
        });

        await tx.debtTransaction.create({
          data: {
            customerId: sale.customerId,
            type: "PAYMENT",
            amount: sale.totalAmount,
            description: `Savdo bekor qilindi (Chek: ${sale.receiptNo})`,
          },
        });
      }

      // 3. Mark sale as CANCELLED
      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: "CANCELLED",
        },
      });

      // 4. Create Loss/Theft Audit Alert
      await tx.auditAlert.create({
        data: {
          type: "CANCELLED_SALE",
          message: `Diqqat: Chek #${sale.receiptNo} bekor qilindi! Summasi: ${sale.totalAmount.toLocaleString("uz-UZ")} so'm (${sale.paymentType}). Mahsulotlar omborga qaytarildi.`,
          severity: "HIGH",
        },
      });

      return updatedSale;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Sale Cancel Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
