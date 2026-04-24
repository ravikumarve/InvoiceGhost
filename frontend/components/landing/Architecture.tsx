'use client';

import { useEffect, useState } from 'react';

export default function Architecture() {
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

    const element = document.getElementById('architecture-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="architecture-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          Architecture
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          Simple. Stateless. Fast.
        </h2>
        <p className="text-zinc-700">
          No database. No user sessions. Every request is independent — file in, structured data out, file deleted.
        </p>

        <div className={`bg-zinc-900 rounded-2xl p-10 mt-9 relative overflow-hidden transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: `
              linear-gradient(rgba(212,132,10,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,132,10,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />

          <svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[800px] mx-auto relative z-10">
            {/* Box 1: Frontend */}
            <rect x="0" y="40" width="160" height="80" rx="8" fill="#1f1a12" stroke="rgba(212,132,10,0.3)" strokeWidth="1"/>
            <text x="80" y="72" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgba(250,247,242,0.6)" textAnchor="middle">Next.js 14</text>
            <text x="80" y="90" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(212,132,10,0.6)" textAnchor="middle">UploadZone</text>
            <text x="80" y="106" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(212,132,10,0.6)" textAnchor="middle">InvoiceCard · ExportBar</text>

            {/* Arrow 1 */}
            <path d="M162 80 L218 80" stroke="rgba(212,132,10,0.4)" strokeWidth="1.5" markerEnd="url(#a1)"/>
            <text x="190" y="74" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="rgba(250,247,242,0.3)" textAnchor="middle">POST</text>

            {/* Box 2: FastAPI */}
            <rect x="220" y="20" width="200" height="120" rx="8" fill="#1f1a12" stroke="rgba(212,132,10,0.5)" strokeWidth="1.5"/>
            <text x="320" y="52" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgba(250,247,242,0.7)" textAnchor="middle">FastAPI Backend</text>
            <text x="320" y="72" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(212,132,10,0.5)" textAnchor="middle">/api/parse</text>
            <text x="320" y="88" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(212,132,10,0.5)" textAnchor="middle">/api/export/csv</text>
            <text x="320" y="104" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(212,132,10,0.5)" textAnchor="middle">/api/validate-key</text>
            <text x="320" y="120" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(250,247,242,0.2)" textAnchor="middle">pdf2image · slowapi · HMAC</text>

            {/* Arrow 2: primary */}
            <path d="M422 65 L518 50" stroke="rgba(212,132,10,0.4)" strokeWidth="1.5" markerEnd="url(#a1)"/>
            <text x="470" y="48" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(250,247,242,0.3)" textAnchor="middle">primary</text>

            {/* Arrow 3: fallback */}
            <path d="M422 100 L518 118" stroke="rgba(250,247,242,0.15)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#a2)"/>
            <text x="470" y="124" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(250,247,242,0.2)" textAnchor="middle">fallback</text>

            {/* Box 3a: Gemini */}
            <rect x="520" y="20" width="130" height="52" rx="8" fill="#1f1a12" stroke="rgba(212,132,10,0.4)" strokeWidth="1"/>
            <text x="585" y="44" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgba(212,132,10,0.9)" textAnchor="middle">Gemini Flash</text>
            <text x="585" y="60" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="rgba(250,247,242,0.25)" textAnchor="middle">primary</text>

            {/* Box 3b: Groq */}
            <rect x="520" y="88" width="130" height="52" rx="8" fill="#1f1a12" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            <text x="585" y="112" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="rgba(250,247,242,0.4)" textAnchor="middle">Groq</text>
            <text x="585" y="128" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="rgba(250,247,242,0.2)" textAnchor="middle">auto-fallback</text>

            {/* Arrow back: JSON */}
            <path d="M162 90 L218 90" stroke="rgba(250,247,242,0.15)" strokeWidth="1.5" strokeDasharray="3 3"/>
            <text x="190" y="106" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="rgba(250,247,242,0.2)" textAnchor="middle">JSON</text>

            {/* Delete note */}
            <rect x="660" y="55" width="130" height="50" rx="6" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
            <text x="725" y="76" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(239,68,68,0.7)" textAnchor="middle">file deleted</text>
            <text x="725" y="92" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(239,68,68,0.5)" textAnchor="middle">immediately</text>

            <path d="M652 80 L660 80" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" markerEnd="url(#a3)"/>

            <defs>
              <marker id="a1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="rgba(212,132,10,0.6)"/></marker>
              <marker id="a2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="rgba(250,247,242,0.2)"/></marker>
              <marker id="a3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="rgba(239,68,68,0.4)"/></marker>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}