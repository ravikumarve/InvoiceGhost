'use client';

import { useEffect, useState } from 'react';
import { Box, FileText, Clock, Globe, CheckCircle, Shield } from 'lucide-react';

const features = [
  {
    icon: Box,
    color: 'amber',
    title: 'Gemini Flash Extraction',
    description: 'Primary AI layer using your free Gemini allocation. Groq auto-fallback on failure. 85%+ accuracy on clean scans.',
  },
  {
    icon: FileText,
    color: 'green',
    title: 'Full GST Support',
    description: 'GSTIN validation, HSN/SAC code extraction, line-level CGST/SGST/IGST breakdown. Built for Indian tax law.',
  },
  {
    icon: Clock,
    color: 'red',
    title: 'Zero Data Retention',
    description: 'Files processed in-memory, deleted in the finally block. EXIF stripped before any external API call. No logs, no database.',
  },
  {
    icon: Globe,
    color: 'purple',
    title: 'Mixed-Language Parsing',
    description: 'English headers + Hindi line item descriptions. Common in Indian vendor invoices — handled natively.',
  },
  {
    icon: CheckCircle,
    color: 'amber',
    title: 'Confidence Scoring',
    description: 'Every parse returns a 0.0–1.0 confidence score. Low-quality scans flagged automatically before you rely on bad data.',
  },
  {
    icon: Shield,
    color: 'green',
    title: 'Rate Limited & Safe',
    description: '10 req/min per IP via slowapi. X-Processing-Time-Ms header on every response. 18/18 pytest tests passing.',
  },
];

const colorMap = {
  amber: { bg: 'bg-amber-500/10', stroke: 'stroke-amber-600' },
  green: { bg: 'bg-green-500/8', stroke: 'stroke-green-700' },
  red: { bg: 'bg-red-500/7', stroke: 'stroke-red-600' },
  purple: { bg: 'bg-purple-500/8', stroke: 'stroke-purple-600' },
};

export default function Features() {
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

    const element = document.getElementById('features-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          Features
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          Built for <em className="italic text-amber-600">Indian</em> accounting workflows.
        </h2>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200/10 border border-zinc-200/10 rounded-2xl overflow-hidden mt-10 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color as keyof typeof colorMap];
            
            return (
              <div
                key={index}
                className="bg-amber-50/50 p-8 hover:bg-white/70 transition-colors duration-150"
              >
                <div className={`w-9 h-9 mb-4 rounded-lg flex items-center justify-center ${colors.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${colors.stroke}`} strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed m-0">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}