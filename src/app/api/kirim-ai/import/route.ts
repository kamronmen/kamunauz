import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ParsedInvoiceItem } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: ParsedInvoiceItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Import qilish uchun tovarlar ro'yxati bo'sh!" }, { status: 400 });
    }

    const importedResults = [];

    for (const item of items) {
      if (!item.name || !item.costPrice) continue;

      // Check if product already exists by exact name or barcode
      let existing = null;
      if (item.barcode) {
        existing = await prisma.product.findUnique({ where: { barcode: item.barcode } });
      }
      if (!existing) {
        existing = await prisma.product.findFirst({
          where: { name: { equals: item.name } },
        });
      }

      if (existing) {
        // Update existing product stock and cost price
        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: {
            stockQuantity: {
              increment: Number(item.quantity) || 0,
            },
            costPrice: Number(item.costPrice),
            sellingPrice: item.sellingPrice ? Number(item.sellingPrice) : existing.sellingPrice,
            category: item.category || existing.category,
          },
        });
        importedResults.push({ action: "UPDATED", product: updated });
      } else {
        // Create new product
        const created = await prisma.product.create({
          data: {
            name: item.name.trim(),
            barcode: item.barcode || null,
            costPrice: Number(item.costPrice),
            sellingPrice: Number(item.sellingPrice) || Math.ceil((item.costPrice * 1.2) / 500) * 500,
            stockQuantity: Number(item.quantity) || 0,
            category: item.category || "Umumiy",
            minStockAlert: 5,
          },
        });
        importedResults.push({ action: "CREATED", product: created });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${importedResults.length} ta mahsulot muvaffaqiyatli qabul qilindi!`,
      results: importedResults,
    });
  } catch (error: any) {
    console.error("Kirim AI Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
