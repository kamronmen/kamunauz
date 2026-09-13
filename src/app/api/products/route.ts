import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const lowStock = searchParams.get("lowStock") === "true";
    const barcode = searchParams.get("barcode") || "";

    if (barcode) {
      const product = await prisma.product.findUnique({
        where: { barcode },
      });
      return NextResponse.json(product);
    }

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    if (category && category !== "Barchasi") {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    const filtered = lowStock
      ? products.filter((p) => p.stockQuantity <= p.minStockAlert)
      : products;

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Products GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, name, costPrice, sellingPrice, stockQuantity, minStockAlert, category } = body;
    const parsedCostPrice = Number(costPrice);
    const parsedSellingPrice = Number(sellingPrice);
    const parsedStockQuantity = stockQuantity === undefined || stockQuantity === "" ? 0 : Number(stockQuantity);
    const parsedMinStockAlert = minStockAlert === undefined || minStockAlert === "" ? 5 : Number(minStockAlert);

    if (!name || costPrice === undefined || sellingPrice === undefined) {
      return NextResponse.json({ error: "Mahsulot nomi, tannarxi va sotish narxi majburiy!" }, { status: 400 });
    }

    if (!Number.isFinite(parsedCostPrice) || !Number.isFinite(parsedSellingPrice) || !Number.isFinite(parsedStockQuantity) || !Number.isFinite(parsedMinStockAlert) || parsedCostPrice < 0 || parsedSellingPrice < 0 || parsedStockQuantity < 0 || parsedMinStockAlert < 0) {
      return NextResponse.json({ error: "Narx va qoldiq qiymatlari to'g'ri son bo'lishi kerak!" }, { status: 400 });
    }

    // Check duplicate barcode if provided
    if (barcode && barcode.trim() !== "") {
      const existing = await prisma.product.findUnique({
        where: { barcode: barcode.trim() },
      });
      if (existing) {
        return NextResponse.json({ error: "Bu shtrix-kodga ega mahsulot allaqachon mavjud!" }, { status: 400 });
      }
    }

    const product = await prisma.product.create({
      data: {
        barcode: barcode && barcode.trim() !== "" ? barcode.trim() : null,
        name: name.trim(),
        costPrice: parsedCostPrice,
        sellingPrice: parsedSellingPrice,
        stockQuantity: parsedStockQuantity,
        minStockAlert: parsedMinStockAlert,
        category: category || "Boshqa",
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Products POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
