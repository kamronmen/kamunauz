import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        debts: {
          orderBy: { createdAt: "desc" },
        },
        sales: {
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("Customer detail GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, phone, address, notes } = body;

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        address: address !== undefined ? address.trim() : undefined,
        notes: notes !== undefined ? notes.trim() : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Customer PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.customer.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Customer DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
