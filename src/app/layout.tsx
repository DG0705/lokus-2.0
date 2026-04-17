import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LOKUS | Premium Footwear",
  description: "Premium footwear ecommerce with OTP auth and Razorpay.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-lokus-background text-lokus-text`}>
        <Providers>
          <Header />
          <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
