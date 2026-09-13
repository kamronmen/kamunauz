import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Fetch Today's Sales
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "COMPLETED",
      },
    });

    // Fetch Today's Debt Payments
    const debtPayments = await prisma.debtTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: "PAYMENT",
      },
    });

    // Fetch Today's Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
    });

    const cashSales = sales.filter((s) => s.paymentType === "CASH").reduce((sum, s) => sum + s.totalAmount, 0);
    const cardSales = sales.filter((s) => s.paymentType === "CARD").reduce((sum, s) => sum + s.totalAmount, 0);
    const debtSales = sales.filter((s) => s.paymentType === "DEBT").reduce((sum, s) => sum + s.totalAmount, 0);
    const totalSales = cashSales + cardSales + debtSales;

    const debtPaymentsTotal = debtPayments.reduce((sum, p) => sum + p.amount, 0);
    const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Expected Cash In Drawer = Cash Sales + Cash Debt Repayments - Expenses
    const expectedCashInDrawer = Math.max(0, cashSales + debtPaymentsTotal - expensesTotal);

    const totalCost = sales.reduce((sum, s) => sum + s.totalCost, 0);
    const todayNetProfit = totalSales - totalCost - expensesTotal;

    return NextResponse.json({
      shiftDate: now.toLocaleDateString("uz-UZ"),
      totalSales,
      salesCount: sales.length,
      cashSales,
      cardSales,
      debtSales,
      debtPaymentsTotal,
      expensesTotal,
      expectedCashInDrawer,
      todayNetProfit,
    });
  } catch (error: any) {
    console.error("Shift GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
