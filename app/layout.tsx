import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CotaVisu — Comparador de Comunicação Visual",
  description: "Compare preços e prazos de serviços de comunicação visual. Banners, adesivos, fachadas, ACM e muito mais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} min-h-screen bg-white text-gray-900`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
