import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const alerts = await prisma.auditAlert.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(alerts);
  } catch (error: any) {
    console.error("Audit GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, message, severity } = body;

    if (!type || !message) {
      return NextResponse.json({ error: "Xabar va tur kiritilishi shart!" }, { status: 400 });
    }

    const alert = await prisma.auditAlert.create({
      data: {
        type,
        message,
        severity: severity || "MEDIUM",
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
