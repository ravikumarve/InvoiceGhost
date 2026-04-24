'use client';

import { useEffect, useState } from 'react';

export default function Pricing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('pricing-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          Pricing
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          Free to use. Pay once for <em className="italic text-amber-600">batch.</em>
        </h2>
        <p className="text-zinc-700 mb-4">
          Single file parsing is free forever with no account required. Batch mode is a one-time Gumroad purchase — no subscription, no renewal, key stored locally.
        </p>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Free Plan */}
          <div className="rounded-2xl p-9 border border-zinc-200/10 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-amber-600 block mb-3.5">
              Free
            </span>
            <div className="font-serif text-[48px] font-black leading-none tracking-tight mb-1">
              $0
            </div>
            <div className="text-sm text-zinc-600 mb-5">
              forever · no account needed
            </div>
            <ul className="space-y-0">
              {[
                'Single file per upload',
                'Full InvoiceData JSON output',
                'CSV export',
                'Copy raw JSON',
                'Zero data retention',
              ].map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-zinc-700 py-2 border-b border-zinc-200/10 flex items-center gap-2.5 last:border-b-0"
                >
                  <span className="text-amber-600 text-sm flex-shrink-0">✦</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Batch Mode */}
          <div className="rounded-2xl p-9 border border-transparent bg-zinc-900 text-amber-50 relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
            <div className="absolute -top-px right-6 bg-amber-600 text-white font-mono text-[10px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-b">
              Most Popular
            </div>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-amber-400 block mb-3.5">
              Batch Mode
            </span>
            <div className="font-serif text-[48px] font-black leading-none tracking-tight mb-1 text-amber-400">
              $19
            </div>
            <div className="text-sm text-zinc-400 mb-5">
              one-time · individual license
            </div>
            <ul className="space-y-0">
              {[
                'Up to 20 files per run',
                'Combined CSV export',
                '1 license key',
                'Everything in Free',
                'No subscription ever',
              ].map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-zinc-300 py-2 border-b border-zinc-700/30 flex items-center gap-2.5 last:border-b-0"
                >
                  <span className="text-amber-400 text-sm flex-shrink-0">✦</span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="https://gumroad.com/l/invoiceghost"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-amber-600 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-amber-500 transition-all duration-180 mt-6"
            >
              Get on Gumroad →
            </a>
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-600 text-center">
          Agency license (5 keys) available for $49 ·{' '}
          <a
            href="https://gumroad.com/l/invoiceghost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline"
          >
            see Gumroad listing
          </a>
        </p>
      </div>
    </section>
  );
}