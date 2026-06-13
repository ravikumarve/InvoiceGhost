import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Hero from '@/components/landing/Hero';
import Marquee from '@/components/landing/Marquee';
import ProblemSolution from '@/components/landing/ProblemSolution';
import Features from '@/components/landing/Features';
import ApiReference from '@/components/landing/ApiReference';
import Security from '@/components/landing/Security';
import Pricing from '@/components/landing/Pricing';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'InvoiceGhost — AI Invoice Extraction',
  description: 'Drop an invoice. Get clean data. No accounts. No storage. No drama. Instantly extract GST numbers, HSN/SAC codes, and tax splits into structured JSON and CSV.',
  keywords: ['invoice parser', 'GST invoice', 'invoice extraction', 'PDF parser', 'Indian accounting', 'invoice OCR'],
  openGraph: {
    title: 'InvoiceGhost — AI Invoice Extraction',
    description: 'Drop an invoice. Get clean data. No accounts. No storage. No drama.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceGhost — AI Invoice Extraction',
    description: 'Drop an invoice. Get clean data. No accounts. No storage. No drama.',
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Marquee />
      <ProblemSolution />
      <Features />
      <ApiReference />
      <Security />
      <Pricing />
      <Footer />
    </main>
  );
}
