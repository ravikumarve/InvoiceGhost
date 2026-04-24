import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Hero from '@/components/landing/Hero';
import Marquee from '@/components/landing/Marquee';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Architecture from '@/components/landing/Architecture';
import QuickStart from '@/components/landing/QuickStart';
import DataModel from '@/components/landing/DataModel';
import ApiReference from '@/components/landing/ApiReference';
import NoLogin from '@/components/landing/NoLogin';
import ProjectStructure from '@/components/landing/ProjectStructure';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'InvoiceGhost — Parse invoices instantly. Zero storage.',
  description: 'Upload PDF or image invoices, get structured data instantly. No login. Zero data retention. GST-ready for Indian accounting workflows.',
  keywords: ['invoice parser', 'GST invoice', 'invoice extraction', 'PDF parser', 'Indian accounting', 'invoice OCR'],
  openGraph: {
    title: 'InvoiceGhost — Parse invoices instantly. Zero storage.',
    description: 'Upload PDF or image invoices, get structured data instantly. No login. Zero data retention.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceGhost — Parse invoices instantly. Zero storage.',
    description: 'Upload PDF or image invoices, get structured data instantly. No login. Zero data retention.',
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-amber-50/50">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10">
        <Navigation />
        <div className="pt-16">
          <Hero />
        </div>
        <Marquee />
        
        <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
          {/* How It Works */}
          <section className="py-20 border-b border-zinc-200/10">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
              How It Works
            </span>
            <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
              Three steps. Under 30 seconds.
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-0 items-center mt-12 bg-white/70 border border-zinc-200/10 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-9 text-center">
                <div className="font-serif text-[52px] font-black leading-none text-zinc-200 mb-3">
                  01
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-1.5">
                  Drop Your Invoice
                </h3>
                <p className="text-sm text-zinc-600 m-0">
                  PDF or image. Drag-and-drop or click to browse. Up to 10MB.
                </p>
              </div>
              <div className="text-amber-600 text-xl px-2">→</div>
              <div className="p-9 text-center">
                <div className="font-serif text-[52px] font-black leading-none text-zinc-200 mb-3">
                  02
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-1.5">
                  AI Extracts Everything
                </h3>
                <p className="text-sm text-zinc-600 m-0">
                  Gemini Flash parses every field. Groq kicks in as fallback automatically.
                </p>
              </div>
              <div className="text-amber-600 text-xl px-2">→</div>
              <div className="p-9 text-center">
                <div className="font-serif text-[52px] font-black leading-none text-zinc-200 mb-3">
                  03
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-1.5">
                  Export Clean Data
                </h3>
                <p className="text-sm text-zinc-600 m-0">
                  Download CSV, copy raw JSON. File deleted immediately after processing.
                </p>
              </div>
            </div>
          </section>
        </div>

        <Features />
        <DataModel />
        <Architecture />
        <ApiReference />
        <Pricing />
        <QuickStart />
        <NoLogin />
        <ProjectStructure />
        <Footer />
      </div>
    </main>
  );
}