'use client';

import { useEffect, useState } from 'react';
import { Github } from 'lucide-react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-8 py-20 md:px-16 lg:px-20 overflow-hidden border-b border-zinc-200/10">
      {/* Amber orb glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-500/12 to-transparent -top-[100px] right-[100px] pointer-events-none" />

      {/* Decorative large ghost letter */}
      <div className="absolute -right-10 top-1/2 -translate-y-1/2 font-serif text-[480px] font-black text-transparent stroke-amber-500/8 pointer-events-none select-none tracking-tighter hidden lg:block" style={{ WebkitTextStroke: '1px rgba(212,132,10,0.08)' }}>
        IG
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Eyebrow */}
        <div className={`inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] uppercase text-amber-600 mb-7 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Privacy-first invoice parser · GST-ready · Zero data retention
        </div>

        {/* Logo and title */}
        <div className={`flex items-center gap-6 mb-8 transition-all duration-700 delay-75 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'}`}>
          {/* SVG Logo Mark */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            {/* Ghost body */}
            <path d="M16 28 C16 17.5 23.2 10 32 10 C40.8 10 48 17.5 48 28 L48 54 L41 48 L35 54 L32 50 L29 54 L23 48 L16 54 Z" fill="#1a1612" stroke="rgba(212,132,10,0.6)" strokeWidth="1.5"/>
            {/* Eyes */}
            <circle cx="25" cy="30" r="3.5" fill="#d4840a"/>
            <circle cx="39" cy="30" r="3.5" fill="#d4840a"/>
            {/* Shine dots */}
            <circle cx="26.5" cy="28.5" r="1" fill="rgba(255,255,255,0.6)"/>
            <circle cx="40.5" cy="28.5" r="1" fill="rgba(255,255,255,0.6)"/>
            {/* Invoice lines on body */}
            <line x1="24" y1="38" x2="40" y2="38" stroke="rgba(212,132,10,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="24" y1="42" x2="36" y2="42" stroke="rgba(212,132,10,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Outer ring */}
            <circle cx="32" cy="32" r="30" stroke="rgba(212,132,10,0.12)" strokeWidth="1" strokeDasharray="3 4"/>
          </svg>

          <h1 className="font-serif text-[clamp(56px,9vw,96px)] font-black leading-[0.95] tracking-tight text-zinc-900">
            Invoice<em className="italic text-amber-600">Ghost</em>
          </h1>
        </div>

        {/* Tagline */}
        <p className={`text-lg md:text-xl text-zinc-700 max-w-lg leading-relaxed mt-5 mb-10 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'}`}>
          Drop an invoice. Get clean data.<br className="hidden md:block" />No accounts, no storage, no drama.
        </p>

        {/* CTA buttons */}
        <div className={`flex gap-3 items-center flex-wrap transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'}`}>
          <a
            href="https://github.com/ravikumarve/InvoiceGhost"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-amber-50 rounded-lg text-sm font-semibold tracking-wide hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-180"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
          <a
            href="https://gumroad.com/l/invoiceghost"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-zinc-700 border border-zinc-200/10 rounded-lg text-sm font-semibold tracking-wide hover:border-amber-500 hover:text-amber-600 hover:-translate-y-0.5 transition-all duration-180"
          >
            Get Batch Mode — $19
          </a>
        </div>

        {/* Badges */}
        <div className={`flex gap-2.5 flex-wrap mt-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'}`}>
          <span className="font-mono text-[10.5px] px-3 py-1.5 rounded border border-zinc-200/10 text-zinc-600 bg-white/70 backdrop-blur-sm">
            18/18 tests passing
          </span>
          <span className="font-mono text-[10.5px] px-3 py-1.5 rounded border border-amber-500/25 text-amber-600 bg-amber-50">
            MIT License
          </span>
          <span className="font-mono text-[10.5px] px-3 py-1.5 rounded border border-zinc-200/10 text-zinc-600 bg-white/70 backdrop-blur-sm">
            Python 3.12+
          </span>
          <span className="font-mono text-[10.5px] px-3 py-1.5 rounded border border-zinc-200/10 text-zinc-600 bg-white/70 backdrop-blur-sm">
            FastAPI · Gemini Flash
          </span>
          <span className="font-mono text-[10.5px] px-3 py-1.5 rounded border border-zinc-200/10 text-zinc-600 bg-white/70 backdrop-blur-sm">
            GST-ready
          </span>
          <span className="font-mono text-[10.5px] px-3 py-1.5 rounded border border-zinc-200/10 text-zinc-600 bg-white/70 backdrop-blur-sm">
            Zero data retention
          </span>
        </div>
      </div>
    </section>
  );
}