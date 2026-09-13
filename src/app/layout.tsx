import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "DOKONPRO — Do'kon Boshqaruvi, Kassa va Nasiya Daftari",
  description: "Mahalla do'konlari uchun tezkor POS, qarz daftari va haqiqiy sof foyda hisobi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
