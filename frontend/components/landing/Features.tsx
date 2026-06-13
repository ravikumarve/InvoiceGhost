'use client';

import { useEffect, useState } from 'react';

const features = [
  {
    num: '01. AI Engine',
    title: 'Dual-Model Processing',
    description: 'Primary extraction via Gemini 2.0 Flash. If it fails, the system automatically falls back to Groq Llama 3.2 90B Vision for maximum reliability.',
  },
  {
    num: '02. Authentication',
    title: 'Zero Account Policy',
    description: 'Login forms kill conversion. No user tables, no JWTs, no email verification. Just drop the file and get the data immediately.',
  },
  {
    num: '03. Confidence',
    title: 'Heuristic Scoring',
    description: 'Returns a 0.0-1.0 confidence score per extraction. Low scores (< 0.8) automatically flag the UI to suggest human review for blurry scans.',
  },
  {
    num: '04. Format',
    title: 'Mixed-Language Support',
    description: 'Seamlessly handles Indian invoice quirks, including English headers mixed with Hindi product descriptions without parsing failure.',
  },
  {
    num: '05. Output',
    title: 'CSV Export Safe',
    description: 'One-click CSV generation with full line items and tax summary rows. Protected against CSV injection (neutralizes =,+,-,@ prefixes).',
  },
  {
    num: '06. Testing',
    title: '56/56 Tests Passing',
    description: 'Backend fortified with robust Pytest coverage spanning MIME spoofing rejection, confidence score clamping, and FastAPI rate limiting.',
  },
];

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById('features-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features-section" className="px-6 md:px-8 py-16 border-b border-[var(--grid-color)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold mb-2">System Architecture</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-[600px]">
            A utilitarian extraction engine built on FastAPI, secured by strict file validation and powered by dual LLM fallbacks.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-main)] border border-[var(--border-main)] transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--bg-base)] p-8 hover:bg-[var(--bg-panel)] transition-colors"
            >
              <span className="mono text-xs text-[var(--accent-cyan)] block mb-4">{feature.num}</span>
              <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
