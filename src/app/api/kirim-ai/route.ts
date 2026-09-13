import { NextResponse } from "next/server";
import { ParsedInvoiceItem } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, markupPercent = 20 } = body;

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json({ error: "Nakladnoy matni yoki rasmi yuborilmadi!" }, { status: 400 });
    }

    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsedItems: ParsedInvoiceItem[] = [];

    const categoryKeywords: Record<string, string> = {
      ichimlik: "Ichimliklar",
      cola: "Ichimliklar",
      fanta: "Ichimliklar",
      pepsi: "Ichimliklar",
      suv: "Ichimliklar",
      sut: "Sut mahsulotlari",
      qatiq: "Sut mahsulotlari",
      pishloq: "Sut mahsulotlari",
      qaymoq: "Sut mahsulotlari",
      non: "Non va qandolat",
      buxanka: "Non va qandolat",
      patir: "Non va qandolat",
      shirinlik: "Non va qandolat",
      pechenye: "Non va qandolat",
      konfet: "Non va qandolat",
      yog: "Oziq-ovqat",
      shakar: "Oziq-ovqat",
      guruch: "Oziq-ovqat",
      un: "Oziq-ovqat",
      tuz: "Oziq-ovqat",
      makaron: "Oziq-ovqat",
      choy: "Ichimliklar",
      tuxum: "Oziq-ovqat",
      gosht: "Go'sht va kolbasa",
      kolbasa: "Go'sht va kolbasa",
      sosiska: "Go'sht va kolbasa",
      sabzi: "Meva va sabzavotlar",
      kartoshka: "Meva va sabzavotlar",
      piyoz: "Meva va sabzavotlar",
      sovun: "Gigiyena",
      pasta: "Gigiyena",
      poroshok: "Xo'jalik mollari",
      tozalash: "Xo'jalik mollari",
    };

    const multiplier = 1 + (Number(markupPercent) || 20) / 100;

    for (const line of lines) {
      // Regex parsing for lines like:
      // "1. Coca-Cola 1.5L - 24 dona x 12,000 so'm"
      // "Shakar 50kg 10500"
      // "Sut Musaffo 3.2% 1L 20 dona 10500"
      // "Non buxanka 50 2500"
      const cleaned = line.replace(/^\d+[\.\)\-]\s*/, ""); // remove bullet/number
      
      // Try extract numbers at end (quantity & price)
      const numberMatches = cleaned.match(/(\d+[\.,]?\d*)\s*(ta|dona|kg|litr|blok|pachka|x)?\s*[\*x\-]?\s*(\d+[\s\.,]?\d*)/i);

      let name = cleaned;
      let quantity = 10;
      let costPrice = 10000;

      if (numberMatches) {
        // Try parsing extracted numbers
        const rawQty = numberMatches[1]?.replace(/[^\d\.]/g, "");
        const rawCost = numberMatches[3]?.replace(/[^\d]/g, "");

        if (rawQty && !isNaN(parseFloat(rawQty))) {
          quantity = parseFloat(rawQty);
        }
        if (rawCost && !isNaN(parseFloat(rawCost))) {
          costPrice = parseFloat(rawCost);
        }

        // Clean name
        const matchIndex = cleaned.indexOf(numberMatches[0]);
        if (matchIndex > 0) {
          name = cleaned.substring(0, matchIndex).replace(/[\-\:\,\;]$/, "").trim();
        }
      } else {
        // Fallback split by comma or tab
        const parts = cleaned.split(/[\t\,\-]/);
        if (parts.length >= 2) {
          name = parts[0].trim();
          const p2 = parts[1].replace(/[^\d]/g, "");
          if (p2) costPrice = parseFloat(p2);
        }
      }

      if (name.length < 2) continue;

      // Detect category
      const lowerName = name.toLowerCase().replace(/['`]/g, "");
      let detectedCategory = "Umumiy";
      for (const [kw, cat] of Object.entries(categoryKeywords)) {
        if (lowerName.includes(kw)) {
          detectedCategory = cat;
          break;
        }
      }

      // Calculate selling price with rounded 500/1000 so'm step
      let calculatedSelling = Math.ceil((costPrice * multiplier) / 500) * 500;
      if (calculatedSelling <= costPrice) {
        calculatedSelling = costPrice + 1000;
      }

      parsedItems.push({
        name,
        quantity,
        costPrice,
        sellingPrice: calculatedSelling,
        category: detectedCategory,
      });
    }

    return NextResponse.json({
      success: true,
      itemsCount: parsedItems.length,
      items: parsedItems,
    });
  } catch (error: any) {
    console.error("Kirim AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
