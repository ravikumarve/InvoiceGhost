'use client';

import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

export default function ProblemSolution() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById('pipeline-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pipeline-section" className="px-6 md:px-8 py-16 border-b border-[var(--grid-color)]">
      <div className={`max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 border border-[var(--border-main)] transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Problem */}
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[var(--border-main)] bg-[rgba(255,51,102,0.02)]">
          <div className="flex items-center gap-2.5 mb-6">
            <X className="w-4 h-4 text-[var(--accent-alert)]" />
            <span className="mono text-sm uppercase text-[var(--accent-alert)]">The Problem</span>
          </div>
          <h3 className="text-2xl font-semibold mb-4">Manual Data Entry</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Every Indian freelancer has a pile of vendor invoices. Keying GST numbers, 6-digit HSN codes, and splitting CGST/SGST into Tally or Excel manually is tedious and highly error-prone.
          </p>
        </div>

        {/* Solution */}
        <div className="p-8 md:p-12 bg-[rgba(0,255,102,0.02)]">
          <div className="flex items-center gap-2.5 mb-6">
            <Check className="w-4 h-4 text-[var(--accent-green)]" />
            <span className="mono text-sm uppercase text-[var(--accent-green)]">The Solution</span>
          </div>
          <h3 className="text-2xl font-semibold mb-4">Automated Extraction</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            InvoiceGhost handles standard GST invoices, non-GST receipts, foreign currency invoices, and even mixed-language (Hindi/English) formats. Drag, drop, export to CSV.
          </p>
        </div>
      </div>
    </section>
  );
}
