import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Delete in reverse order of foreign keys
    await prisma.saleItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.debtTransaction.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.expense.deleteMany({});

    const products = [
      { barcode: "4780001001", name: "Qolipli non (Buxanka)", costPrice: 2500, sellingPrice: 3500, stockQuantity: 45, minStockAlert: 10, category: "Non va qandolat" },
      { barcode: "4780001002", name: "Samarqand noni (Patir)", costPrice: 5000, sellingPrice: 7500, stockQuantity: 20, minStockAlert: 5, category: "Non va qandolat" },
      { barcode: "5449000000996", name: "Coca-Cola Classic 1.5L", costPrice: 12000, sellingPrice: 15000, stockQuantity: 32, minStockAlert: 8, category: "Ichimliklar" },
      { barcode: "5449000011527", name: "Fanta Orange 1.5L", costPrice: 12000, sellingPrice: 15000, stockQuantity: 18, minStockAlert: 6, category: "Ichimliklar" },
      { barcode: "4780054001201", name: "Musaffo Sut 3.2% 1L", costPrice: 10500, sellingPrice: 13500, stockQuantity: 25, minStockAlert: 5, category: "Sut mahsulotlari" },
      { barcode: "7613035987654", name: "Nestle Pure Life Suv 1.5L", costPrice: 3800, sellingPrice: 5000, stockQuantity: 48, minStockAlert: 12, category: "Ichimliklar" },
      { barcode: "4780023456789", name: "Kungaboqar yog'i 'Oila tanlovi' 1L", costPrice: 14500, sellingPrice: 18000, stockQuantity: 40, minStockAlert: 10, category: "Oziq-ovqat" },
      { barcode: "4780098765432", name: "Shakar (Xorazm) 1kg", costPrice: 10500, sellingPrice: 13000, stockQuantity: 85, minStockAlert: 15, category: "Oziq-ovqat" },
      { barcode: "4780045612345", name: "Guruch 'Alanga' 1kg", costPrice: 18000, sellingPrice: 23000, stockQuantity: 60, minStockAlert: 10, category: "Oziq-ovqat" },
      { barcode: "4780077889900", name: "Tuxum 1-nav (10 dona)", costPrice: 14000, sellingPrice: 17500, stockQuantity: 30, minStockAlert: 8, category: "Oziq-ovqat" },
      { barcode: "054881007278", name: "Ahmad Tea English Tea No.1 100g", costPrice: 17000, sellingPrice: 22000, stockQuantity: 15, minStockAlert: 4, category: "Ichimliklar" },
      { barcode: "4607009581122", name: "Makaron Rollton Spiral 400g", costPrice: 6200, sellingPrice: 8500, stockQuantity: 42, minStockAlert: 10, category: "Oziq-ovqat" },
      { barcode: "9414200123456", name: "Sariq sariyog' 'Anchor' 200g", costPrice: 25000, sellingPrice: 31000, stockQuantity: 14, minStockAlert: 4, category: "Sut mahsulotlari" },
      { barcode: "4780011223344", name: "Pishloq Gollandskiy 250g", costPrice: 27000, sellingPrice: 34000, stockQuantity: 8, minStockAlert: 3, category: "Sut mahsulotlari" },
      { barcode: "4780066554433", name: "Rozmetov Doktorskaya Kolbasa Halol", costPrice: 42000, sellingPrice: 53000, stockQuantity: 12, minStockAlert: 3, category: "Go'sht va kolbasa" },
      { barcode: "4780099887766", name: "Qora maydalangan qalampir 50g", costPrice: 3200, sellingPrice: 5000, stockQuantity: 2, minStockAlert: 5, category: "Oziq-ovqat" },
      { barcode: "4015600889911", name: "Tide Kir yuvish kukuni Avtomat 450g", costPrice: 15500, sellingPrice: 20000, stockQuantity: 16, minStockAlert: 5, category: "Xo'jalik mollari" },
      { barcode: "8718951234567", name: "Colgate Tish pastasi Max Fresh 100ml", costPrice: 13500, sellingPrice: 17500, stockQuantity: 22, minStockAlert: 5, category: "Gigiyena" },
      { barcode: "7322540123456", name: "Zewa Tualet qog'ozi 4 dona", costPrice: 14000, sellingPrice: 18500, stockQuantity: 24, minStockAlert: 6, category: "Gigiyena" },
      { barcode: "5000159461122", name: "Snickers Super 80g", costPrice: 7500, sellingPrice: 10000, stockQuantity: 36, minStockAlert: 10, category: "Non va qandolat" },
      { barcode: "4780088990011", name: "Lays Chips Tuzli 70g", costPrice: 8500, sellingPrice: 11000, stockQuantity: 25, minStockAlert: 8, category: "Non va qandolat" },
      { barcode: "4780022334455", name: "Kartoshka (mahalliy) 1kg", costPrice: 4500, sellingPrice: 6000, stockQuantity: 120, minStockAlert: 20, category: "Meva va sabzavotlar" },
      { barcode: "4780033445566", name: "Piyoz (mahalliy) 1kg", costPrice: 3000, sellingPrice: 4500, stockQuantity: 100, minStockAlert: 20, category: "Meva va sabzavotlar" },
    ];

    const createdProducts = [];
    for (const p of products) {
      const cp = await prisma.product.create({ data: p });
      createdProducts.push(cp);
    }

    const customers = [
      { name: "Akmal aka (14-uy)", phone: "+998 90 123 45 67", address: "Bog' ko'chasi 14-uy", notes: "Doimiy qo'shni, oylik tushsa to'laydi", totalDebt: 345000 },
      { name: "Dilshod usta", phone: "+998 93 987 65 43", address: "Avtomoyka yonidagi usta", notes: "Hafta oxirida hisob-kitob qiladi", totalDebt: 185000 },
      { name: "Malika opa (O'qituvchi)", phone: "+998 97 555 44 33", address: "24-maktab yonida", notes: "Avans kunlari beradi", totalDebt: 92000 },
      { name: "Jasur (Taksist)", phone: "+998 94 333 22 11", address: "3-dom 12-kvartira", notes: "Kechqurun kirib to'laydi", totalDebt: 0 },
    ];

    const createdCustomers = [];
    for (const c of customers) {
      const cc = await prisma.customer.create({ data: c });
      createdCustomers.push(cc);
    }

    const akmal = createdCustomers[0];
    const dilshod = createdCustomers[1];
    const malika = createdCustomers[2];

    const dateYesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const date3DaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const date5DaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    await prisma.debtTransaction.create({
      data: { customerId: akmal.id, type: "BORROW", amount: 250000, description: "Oziq-ovqat va go'sht mahsulotlari", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), createdAt: date5DaysAgo },
    });
    await prisma.debtTransaction.create({
      data: { customerId: akmal.id, type: "PAYMENT", amount: 100000, description: "Qisman to'landi (Karta orqali)", createdAt: date3DaysAgo },
    });
    await prisma.debtTransaction.create({
      data: { customerId: akmal.id, type: "BORROW", amount: 195000, description: "Yog', shakar, un va ichimliklar", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), createdAt: dateYesterday },
    });
    await prisma.debtTransaction.create({
      data: { customerId: dilshod.id, type: "BORROW", amount: 185000, description: "Coca-Cola, sigaret, qandolat", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), createdAt: dateYesterday },
    });
    await prisma.debtTransaction.create({
      data: { customerId: malika.id, type: "BORROW", amount: 92000, description: "Sut, non, tuxum, shakar", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), createdAt: new Date() },
    });

    const sampleSales = [
      {
        totalAmount: 48500,
        totalCost: 38000,
        profit: 10500,
        paymentType: "CASH",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: [
          { productId: createdProducts[0].id, quantity: 2, costPrice: 2500, sellingPrice: 3500, subtotal: 7000 },
          { productId: createdProducts[2].id, quantity: 1, costPrice: 12000, sellingPrice: 15000, subtotal: 15000 },
          { productId: createdProducts[8].id, quantity: 1, costPrice: 18000, sellingPrice: 23000, subtotal: 23000 },
          { productId: createdProducts[15].id, quantity: 1, costPrice: 3200, sellingPrice: 5000, subtotal: 3500 },
        ],
      },
      {
        totalAmount: 124000,
        totalCost: 98000,
        profit: 26000,
        paymentType: "CARD",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        items: [
          { productId: createdProducts[6].id, quantity: 2, costPrice: 14500, sellingPrice: 18000, subtotal: 36000 },
          { productId: createdProducts[7].id, quantity: 2, costPrice: 10500, sellingPrice: 13000, subtotal: 26000 },
          { productId: createdProducts[14].id, quantity: 1, costPrice: 42000, sellingPrice: 53000, subtotal: 53000 },
          { productId: createdProducts[9].id, quantity: 1, costPrice: 14000, sellingPrice: 17500, subtotal: 17500 },
        ],
      },
      {
        totalAmount: 92000,
        totalCost: 71000,
        profit: 21000,
        paymentType: "DEBT",
        customerId: malika.id,
        createdAt: new Date(),
        items: [
          { productId: createdProducts[4].id, quantity: 2, costPrice: 10500, sellingPrice: 13500, subtotal: 27000 },
          { productId: createdProducts[0].id, quantity: 3, costPrice: 2500, sellingPrice: 3500, subtotal: 10500 },
          { productId: createdProducts[9].id, quantity: 2, costPrice: 14000, sellingPrice: 17500, subtotal: 35000 },
          { productId: createdProducts[7].id, quantity: 1, costPrice: 10500, sellingPrice: 13000, subtotal: 13000 },
        ],
      },
      {
        totalAmount: 67500,
        totalCost: 52000,
        profit: 15500,
        paymentType: "CASH",
        createdAt: new Date(),
        items: [
          { productId: createdProducts[2].id, quantity: 2, costPrice: 12000, sellingPrice: 15000, subtotal: 30000 },
          { productId: createdProducts[19].id, quantity: 3, costPrice: 7500, sellingPrice: 10000, subtotal: 30000 },
          { productId: createdProducts[1].id, quantity: 1, costPrice: 5000, sellingPrice: 7500, subtotal: 7500 },
        ],
      },
    ];

    for (let index = 0; index < sampleSales.length; index += 1) {
      const s = sampleSales[index];
      const { items, profit, ...saleData } = s;
      const sale = await prisma.sale.create({
        data: {
          ...saleData,
          receiptNo: `SEED-${Date.now()}-${index}`,
          netProfit: profit,
          status: "COMPLETED",
        },
      });
      for (const item of items) {
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            subtotal: item.subtotal,
          },
        });
      }
    }

    const expenses = [
      { title: "Do'kon oylik ijarasi", category: "RENT", amount: 1500000, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { title: "Elektr energiyasi (Svet) to'lovi", category: "UTILITY", amount: 280000, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { title: "Sotuvchi bolaga oylik avansi", category: "SALARY", amount: 800000, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { title: "Kassadan olingan (Uyga go'sht va dori uchun)", category: "PERSONAL", amount: 150000, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { title: "Paketlar va chek lentasi xaridi", category: "OTHER", amount: 45000, date: new Date() },
    ];

    for (const exp of expenses) {
      await prisma.expense.create({ data: exp });
    }

    return NextResponse.json({ success: true, message: "Demo ma'lumotlar qayta yuklandi!" });
  } catch (error: any) {
    console.error("Seed POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
