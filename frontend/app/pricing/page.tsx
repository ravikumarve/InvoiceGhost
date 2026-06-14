import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/landing/Footer';
import { Check, Zap, Shield, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — InvoiceGhost',
  description: 'Free single invoice parsing. Batch Mode for agencies — $19 lifetime license via Gumroad.',
};

const freeFeatures = [
  '1 invoice per upload',
  'Full structured JSON output',
  'CSV export with tax breakdown',
  'GSTIN, HSN/SAC extraction',
  'Confidence scoring per field',
  'No account required',
  'Rate limit: 10 requests/min',
  'Browser-based access',
];

const batchFeatures = [
  'Up to 20 invoices per run',
  'Combined Master CSV export',
  'Priority extraction queue',
  '1 lifetime license key',
  'HMAC-validated key (no server call)',
  'No subscriptions, no renewals',
  'Same privacy guarantees',
  'Gumroad purchase protection',
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="inline-block px-3 py-1 border border-[var(--border-main)] text-[var(--text-secondary)] mono text-xs uppercase mb-6 bg-[var(--bg-panel)]">
              Execution Modes
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight mb-4">
              Pay once. Parse forever.
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto">
              The free tier handles individual invoices. Batch Mode unlocks multi-file processing for agencies clearing backlogs.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-[900px] mx-auto">
            {/* Free Tier */}
            <div className="crosshair-panel">
              <div className="p-8 md:p-10 bg-[var(--bg-base)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Single Parse</h3>
                    <p className="text-[var(--text-secondary)] text-xs mono uppercase">For individual freelancers</p>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="mono text-5xl font-bold">$0</span>
                  <span className="mono text-base text-[var(--text-secondary)] ml-2">/ forever</span>
                </div>

                <ul className="space-y-0 mb-8">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="py-3 border-b border-[var(--border-main)] last:border-b-0 text-sm text-[var(--text-secondary)] flex items-start gap-3">
                      <Check className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a href="/workspace" className="btn-tech btn-outline-tech w-full text-center block">
                  Use Free Version
                </a>
              </div>
            </div>

            {/* Batch Mode */}
            <div className="crosshair-panel relative">
              <div className="absolute top-0 right-0 bg-[var(--accent-cyan)] text-black mono text-xs font-bold px-3 py-1.5 z-10">
                GUMROAD EXCLUSIVE
              </div>
              <div className="p-8 md:p-10 bg-[var(--bg-panel)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 border border-[var(--accent-cyan)] flex items-center justify-center text-[var(--accent-cyan)]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--accent-cyan)]">Batch Mode</h3>
                    <p className="text-[var(--text-secondary)] text-xs mono uppercase">For agencies clearing backlogs</p>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="mono text-5xl font-bold text-[var(--accent-cyan)]">$19</span>
                  <span className="mono text-base text-[var(--text-secondary)] ml-2">/ lifetime</span>
                </div>

                <ul className="space-y-0 mb-8">
                  {batchFeatures.map((feature, index) => (
                    <li key={index} className="py-3 border-b border-[var(--border-main)] last:border-b-0 text-sm text-[var(--accent-cyan)] flex items-start gap-3">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://gumroad.com/l/invoiceghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tech btn-primary-tech w-full text-center block"
                >
                  Acquire License
                  <ArrowRight className="w-4 h-4 inline ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-[700px] mx-auto">
            <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>

            <div className="space-y-0">
              {[
                {
                  q: 'Is the free tier really free forever?',
                  a: 'Yes. Single invoice parsing, JSON output, and CSV export are completely free. No account, no credit card, no time limit.',
                },
                {
                  q: 'How does the license key work?',
                  a: 'After purchasing Batch Mode on Gumroad, you receive a license key. Enter it in the Batch page — it\'s validated locally using HMAC. No server call, no data sent externally.',
                },
                {
                  q: 'Can I use Batch Mode on multiple devices?',
                  a: 'One license key per purchase. The key is stored in your browser\'s localStorage. For multiple devices, purchase additional keys.',
                },
                {
                  q: 'What happens to my invoices after processing?',
                  a: 'Nothing is stored. Files are processed in memory and deleted immediately in finally blocks. No database, no logs, no retention.',
                },
                {
                  q: 'Is there a refund policy?',
                  a: 'Gumroad handles all purchases and refunds. If Batch Mode doesn\'t work for you, request a refund through Gumroad\'s support.',
                },
              ].map((item, index) => (
                <div key={index} className="py-5 border-b border-[var(--border-main)]">
                  <h4 className="mono text-sm font-semibold mb-2">{item.q}</h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
