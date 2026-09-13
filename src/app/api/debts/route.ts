import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (customerId) {
      where.customerId = customerId;
    }

    const transactions = await prisma.debtTransaction.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Debts GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, type, amount, description, dueDate } = body;

    if (!customerId || !type || amount === undefined || Number(amount) <= 0) {
      return NextResponse.json({ error: "Mijoz, to'lov turi va to'g'ri summa kiritilishi shart!" }, { status: 400 });
    }

    const numAmount = Number(amount);
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Mijoz topilmadi!" }, { status: 404 });
    }

    // Execute in a transaction to guarantee data integrity
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.debtTransaction.create({
        data: {
          customerId,
          type: type === "PAYMENT" ? "PAYMENT" : "BORROW",
          amount: numAmount,
          description: description ? description.trim() : null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });

      const newTotalDebt =
        type === "PAYMENT"
          ? Math.max(0, customer.totalDebt - numAmount)
          : customer.totalDebt + numAmount;

      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          totalDebt: newTotalDebt,
        },
      });

      return { transaction, updatedCustomer };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Debts POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
