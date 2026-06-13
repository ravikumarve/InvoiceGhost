import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvoiceGhost — AI Invoice Extraction",
  description: "Drop an invoice. Get clean data. No accounts. No storage. No drama. Instantly extract GST numbers, HSN/SAC codes, and tax splits into structured JSON and CSV.",
  keywords: ["invoice parser", "GST invoice", "invoice extraction", "PDF parser", "Indian accounting", "invoice OCR", "HSN SAC", "CGST SGST"],
  openGraph: {
    title: "InvoiceGhost — AI Invoice Extraction",
    description: "Drop an invoice. Get clean data. No accounts. No storage. No drama.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceGhost — AI Invoice Extraction",
    description: "Drop an invoice. Get clean data. No accounts. No storage. No drama.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
