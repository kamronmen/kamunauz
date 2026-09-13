import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EXPENSE_CATEGORIES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // "today", "yesterday", "week", "month", "all"
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      switch (period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          break;
        case "yesterday":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
          break;
        case "week":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          break;
        case "all":
        default:
          startDate = new Date(2020, 0, 1);
          break;
      }
    }

    // Fetch sales within date range
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Fetch expenses within date range
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Fetch total debt across all customers
    const customers = await prisma.customer.findMany({
      select: { totalDebt: true },
    });
    const uncollectedDebt = customers.reduce((sum, c) => sum + (c.totalDebt || 0), 0);

    // Calculate core metrics
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCost = sales.reduce((sum, s) => sum + s.totalCost, 0);
    const grossProfit = totalSales - totalCost;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    // Payment breakdown
    const paymentBreakdown = {
      CASH: 0,
      CARD: 0,
      DEBT: 0,
    };
    for (const s of sales) {
      if (s.paymentType in paymentBreakdown) {
        paymentBreakdown[s.paymentType as keyof typeof paymentBreakdown] += s.totalAmount;
      }
    }

    // Top selling products
    const productStats: Record<string, { id: string; name: string; quantity: number; revenue: number; profit: number }> = {};
    for (const s of sales) {
      for (const item of s.items) {
        const pId = item.productId;
        const pName = item.product?.name || "Noma'lum";
        if (!productStats[pId]) {
          productStats[pId] = { id: pId, name: pName, quantity: 0, revenue: 0, profit: 0 };
        }
        productStats[pId].quantity += item.quantity;
        productStats[pId].revenue += item.subtotal;
        productStats[pId].profit += item.subtotal - (item.costPrice * item.quantity);
      }
    }

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Daily Trend calculation (last 7 or 14 points or days in range)
    const dailyMap: Record<string, { date: string; label: string; sales: number; cost: number; profit: number; expenses: number; netProfit: number }> = {};

    sales.forEach((s) => {
      const d = new Date(s.createdAt);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { date: dayKey, label, sales: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 };
      }
      dailyMap[dayKey].sales += s.totalAmount;
      dailyMap[dayKey].cost += s.totalCost;
      dailyMap[dayKey].profit += s.netProfit;
    });

    expenses.forEach((e) => {
      const d = new Date(e.date);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { date: dayKey, label, sales: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 };
      }
      dailyMap[dayKey].expenses += e.amount;
    });

    // Compute net profit for daily map
    const dailyTrend = Object.keys(dailyMap)
      .sort()
      .map((k) => {
        const item = dailyMap[k];
        item.netProfit = item.profit - item.expenses;
        return item;
      });

    // Expense category breakdown
    const expCatMap: Record<string, number> = {};
    expenses.forEach((e) => {
      expCatMap[e.category] = (expCatMap[e.category] || 0) + e.amount;
    });

    const expenseCategories = EXPENSE_CATEGORIES.map((cat) => ({
      category: cat.id,
      label: cat.label,
      total: expCatMap[cat.id] || 0,
    })).filter((c) => c.total > 0);

    return NextResponse.json({
      period,
      totalSales,
      totalCost,
      grossProfit,
      totalExpenses,
      netProfit,
      salesCount: sales.length,
      uncollectedDebt,
      paymentBreakdown,
      dailyTrend,
      topProducts,
      expenseCategories,
    });
  } catch (error: any) {
    console.error("Analytics GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
