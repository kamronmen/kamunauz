import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialData } from "@/lib/autoSeed";

export async function GET(request: Request) {
  try {
    await ensureInitialData();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const withDebtOnly = searchParams.get("withDebt") === "true";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { address: { contains: search } },
      ];
    }
    if (withDebtOnly) {
      where.totalDebt = { gt: 0 };
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        debts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [
        { totalDebt: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("Customers GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address, notes, initialDebt } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Mijoz ismi va telefon raqami kiritilishi shart!" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        address: address ? address.trim() : null,
        notes: notes ? notes.trim() : null,
        totalDebt: Number(initialDebt) || 0,
      },
    });

    if (initialDebt && Number(initialDebt) > 0) {
      await prisma.debtTransaction.create({
        data: {
          customerId: customer.id,
          type: "BORROW",
          amount: Number(initialDebt),
          description: "Boshlang'ich qarz balansi",
        },
      });
    }

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("Customers POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
