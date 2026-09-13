import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let config = await prisma.storeConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.storeConfig.create({
        data: {
          id: "default",
          storeName: "Baraka Savdo",
          phone: "+998 90 123 45 67",
          address: "Toshkent sh., Chilonzor 19-mavze",
          receiptFooter: "Xaridingiz uchun rahmat!",
          telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "8808098016:AAFCiEI0ikDo5KIIFFzpbv-nCTmKDFXz9So",
          telegramChatId: process.env.TELEGRAM_CHAT_ID || "8501604479",
        },
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Settings GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storeName, phone, address, receiptFooter, telegramBotToken, telegramChatId } = body;

    const config = await prisma.storeConfig.upsert({
      where: { id: "default" },
      update: {
        storeName: storeName ? storeName.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        address: address ? address.trim() : undefined,
        receiptFooter: receiptFooter ? receiptFooter.trim() : undefined,
        telegramBotToken: telegramBotToken !== undefined ? telegramBotToken.trim() : undefined,
        telegramChatId: telegramChatId !== undefined ? telegramChatId.trim() : undefined,
      },
      create: {
        id: "default",
        storeName: storeName ? storeName.trim() : "Baraka Savdo",
        phone: phone ? phone.trim() : "+998 90 123 45 67",
        address: address ? address.trim() : "Toshkent sh., Chilonzor 19-mavze",
        receiptFooter: receiptFooter ? receiptFooter.trim() : "Xaridingiz uchun rahmat!",
        telegramBotToken: telegramBotToken ? telegramBotToken.trim() : "8808098016:AAFCiEI0ikDo5KIIFFzpbv-nCTmKDFXz9So",
        telegramChatId: telegramChatId ? telegramChatId.trim() : "8501604479",
      },
    });

    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Settings POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
