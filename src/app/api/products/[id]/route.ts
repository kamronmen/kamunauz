import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { barcode, name, costPrice, sellingPrice, stockQuantity, minStockAlert, category } = body;
    const numericFields = { costPrice, sellingPrice, stockQuantity, minStockAlert };

    for (const [field, value] of Object.entries(numericFields)) {
      if (value !== undefined && value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
        return NextResponse.json({ error: `${field} qiymati to'g'ri son bo'lishi kerak!` }, { status: 400 });
      }
    }

    // Check barcode uniqueness if changed
    if (barcode && barcode.trim() !== "") {
      const existing = await prisma.product.findUnique({
        where: { barcode: barcode.trim() },
      });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: "Bu shtrix-kod boshqa mahsulotga tegishli!" }, { status: 400 });
      }
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        barcode: barcode && barcode.trim() !== "" ? barcode.trim() : null,
        name: name !== undefined ? name.trim() : undefined,
        costPrice: costPrice !== undefined && costPrice !== "" ? Number(costPrice) : undefined,
        sellingPrice: sellingPrice !== undefined && sellingPrice !== "" ? Number(sellingPrice) : undefined,
        stockQuantity: stockQuantity !== undefined && stockQuantity !== "" ? Number(stockQuantity) : undefined,
        minStockAlert: minStockAlert !== undefined && minStockAlert !== "" ? Number(minStockAlert) : undefined,
        category: category !== undefined ? category : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Product PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Product DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
