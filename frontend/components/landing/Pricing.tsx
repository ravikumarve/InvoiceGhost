'use client';

import { useEffect, useState } from 'react';

export default function Pricing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById('pricing-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing-section" className="px-6 md:px-8 py-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold mb-2">Execution Modes</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-[600px]">
            The free tier handles one file at a time. Unlock Batch Mode to process multi-file directories.
          </p>
        </div>

        <div className={`crosshair-panel grid grid-cols-1 md:grid-cols-2 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Free Tier */}
          <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-[var(--border-main)] bg-[var(--bg-base)]">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-1">Single Parse</h3>
              <p className="text-[var(--text-secondary)] text-sm">For individual freelancers.</p>
            </div>
            <div className="mono text-4xl font-bold mb-6">$0<span className="text-base text-[var(--text-secondary)] font-normal"> / forever</span></div>
            <ul className="space-y-0 mb-8">
              {[
                '1 invoice per upload',
                'Full JSON/CSV export',
                'Standard rate limits (10/min)',
                'Browser-based access',
              ].map((feature, index) => (
                <li key={index} className="py-3 border-b border-[var(--border-main)] last:border-b-0 text-sm text-[var(--text-secondary)] flex gap-2.5">
                  <span className="text-white mono">+</span>
                  {feature}
                </li>
              ))}
            </ul>
            <a href="/" className="btn-tech btn-outline-tech w-full text-center">
              Use Free Version
            </a>
          </div>

          {/* Batch Mode */}
          <div className="p-8 md:p-10 bg-[var(--bg-panel)] relative">
            <div className="absolute top-0 right-0 bg-[var(--accent-cyan)] text-black mono text-xs font-bold px-3 py-1.5">
              GUMROAD EXCLUSIVE
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-1 text-[var(--accent-cyan)]">Batch Mode</h3>
              <p className="text-[var(--text-secondary)] text-sm">For agencies clearing backlogs.</p>
            </div>
            <div className="mono text-4xl font-bold mb-6">$19<span className="text-base text-[var(--text-secondary)] font-normal"> / lifetime</span></div>
            <ul className="space-y-0 mb-8">
              {[
                { text: 'Up to 20 invoices per run', highlight: true },
                { text: 'Combined Master CSV export', highlight: true },
                { text: '1 License Key (HMAC Validated)', highlight: false },
                { text: 'No subscriptions, no renewals', highlight: false },
              ].map((feature, index) => (
                <li key={index} className={`py-3 border-b border-[var(--border-main)] last:border-b-0 text-sm flex gap-2.5 ${feature.highlight ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-secondary)]'}`}>
                  <span className="mono">+</span>
                  {feature.text}
                </li>
              ))}
            </ul>
            <a
              href="https://gumroad.com/l/invoiceghost"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tech btn-primary-tech w-full text-center"
            >
              Acquire License
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
