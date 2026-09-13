import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("Expenses GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, amount, date } = body;

    if (!title || !category || amount === undefined || Number(amount) <= 0) {
      return NextResponse.json({ error: "Xarajat nomi, toifasi va summasi majburiy!" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        category,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error("Expenses POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
