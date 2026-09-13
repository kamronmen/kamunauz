import { prisma } from "./prisma";

export async function ensureInitialData() {
  try {
    const productCount = await prisma.product.count();
    if (productCount > 0) return;

    console.log("Databazada tovarlar topilmadi. Avtomatik boshlang'ich ma'lumotlar yuklanmoqda...");

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
      { barcode: "5000159461122", name: "Snickers Super 80g", costPrice: 7500, sellingPrice: 10000, stockQuantity: 36, minStockAlert: 10, category: "Non va qandolat" },
      { barcode: "4780088990011", name: "Lays Chips Tuzli 70g", costPrice: 8500, sellingPrice: 11000, stockQuantity: 25, minStockAlert: 8, category: "Non va qandolat" },
    ];

    for (const p of products) {
      await prisma.product.create({ data: p });
    }

    const customers = [
      { name: "Akmal aka (14-uy)", phone: "+998 90 123 45 67", address: "Bog' ko'chasi 14-uy", notes: "Doimiy qo'shni, oylik tushsa to'laydi", totalDebt: 345000 },
      { name: "Dilshod usta", phone: "+998 93 987 65 43", address: "Avtomoyka yonidagi usta", notes: "Hafta oxirida hisob-kitob qiladi", totalDebt: 185000 },
      { name: "Malika opa (O'qituvchi)", phone: "+998 97 555 44 33", address: "24-maktab yonida", notes: "Avans kunlari beradi", totalDebt: 92000 },
      { name: "Jasur (Taksist)", phone: "+998 94 333 22 11", address: "3-dom 12-kvartira", notes: "Kechqurun kirib to'laydi", totalDebt: 0 },
    ];

    for (const c of customers) {
      await prisma.customer.create({ data: c });
    }

    const expenses = [
      { title: "Do'kon oylik ijarasi", category: "RENT", amount: 1500000, date: new Date() },
      { title: "Elektr energiyasi (Svet) to'lovi", category: "UTILITY", amount: 280000, date: new Date() },
      { title: "Sotuvchi bolaga oylik avansi", category: "SALARY", amount: 800000, date: new Date() },
    ];

    for (const exp of expenses) {
      await prisma.expense.create({ data: exp });
    }

    console.log("Boshlang'ich ma'lumotlar avtomatik yaratildi!");
  } catch (err) {
    console.error("AutoSeed Error:", err);
  }
}
