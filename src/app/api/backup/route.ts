import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({});
    const customers = await prisma.customer.findMany({ include: { debts: true } });
    const sales = await prisma.sale.findMany({ include: { items: true } });
    const expenses = await prisma.expense.findMany({});
    const auditAlerts = await prisma.auditAlert.findMany({});

    const backupData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      storeName: "Baraka Savdo",
      products,
      customers,
      sales,
      expenses,
      auditAlerts,
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="dokonpro_backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Backup Export Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products, customers, expenses } = body;

    if (!products && !customers) {
      return NextResponse.json({ error: "Zaxira fayli ma'lumotlari xato!" }, { status: 400 });
    }

    let importedProductsCount = 0;
    if (products && Array.isArray(products)) {
      for (const p of products) {
        if (!p.name || !p.sellingPrice) continue;
        await prisma.product.upsert({
          where: { id: p.id || "non-existing-id" },
          update: {
            name: p.name,
            costPrice: p.costPrice || 0,
            sellingPrice: p.sellingPrice || 0,
            stockQuantity: p.stockQuantity || 0,
            category: p.category || "Umumiy",
          },
          create: {
            name: p.name,
            barcode: p.barcode || null,
            costPrice: p.costPrice || 0,
            sellingPrice: p.sellingPrice || 0,
            stockQuantity: p.stockQuantity || 0,
            category: p.category || "Umumiy",
          },
        });
        importedProductsCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Zaxiradan ${importedProductsCount} ta mahsulot va ma'lumotlar tiklandi!`,
    });
  } catch (error: any) {
    console.error("Backup Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
