'use client';

import { useEffect, useState } from 'react';
import { Github } from 'lucide-react';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="px-6 md:px-8 py-16 md:py-24 border-b border-[var(--grid-color)]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Hero Text */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-block px-3 py-1 border border-[var(--border-main)] text-[var(--text-secondary)] mono text-xs uppercase mb-6 bg-[var(--bg-panel)]">
            Gemini 2.0 Flash Core
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-tight mb-6">
            Drop an invoice.<br />Get clean data.
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[500px]">
            No accounts. No storage. No drama. Instantly extract GST numbers, HSN/SAC codes, and tax splits into structured JSON and CSV formats. Built for Indian freelancers drowning in paperwork.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="/workspace" className="btn-tech btn-primary-tech">
              Open Workspace
            </a>
            <a
              href="https://github.com/ravikumarve/InvoiceGhost"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tech btn-outline-tech inline-flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              View GitHub
            </a>
          </div>

          {/* Badges */}
          <div className="flex gap-2.5 flex-wrap mt-10">
            <span className="mono text-[10.5px] px-3 py-1.5 border border-[var(--border-main)] text-[var(--text-secondary)] bg-[var(--bg-panel)]">
              56/56 tests passing
            </span>
            <span className="mono text-[10.5px] px-3 py-1.5 border border-[var(--accent-cyan)]/25 text-[var(--accent-cyan)] bg-[rgba(0,240,255,0.05)]">
              MIT License
            </span>
            <span className="mono text-[10.5px] px-3 py-1.5 border border-[var(--border-main)] text-[var(--text-secondary)] bg-[var(--bg-panel)]">
              Python 3.12+
            </span>
            <span className="mono text-[10.5px] px-3 py-1.5 border border-[var(--border-main)] text-[var(--text-secondary)] bg-[var(--bg-panel)]">
              FastAPI · Gemini Flash
            </span>
            <span className="mono text-[10.5px] px-3 py-1.5 border border-[var(--border-main)] text-[var(--text-secondary)] bg-[var(--bg-panel)]">
              GST-ready
            </span>
            <span className="mono text-[10.5px] px-3 py-1.5 border border-[var(--border-main)] text-[var(--text-secondary)] bg-[var(--bg-panel)]">
              Zero data retention
            </span>
          </div>
        </div>

        {/* Right: Technical Dropzone Preview */}
        <div className={`crosshair-panel transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="meta-bar">
            <span>STATUS: READY</span>
            <span>MEM_ALLOC: 0MB</span>
          </div>
          <div className="border border-dashed border-[var(--border-highlight)] bg-[rgba(10,10,10,0.8)] p-16 text-center">
            <div className="w-12 h-12 border border-[var(--border-main)] flex items-center justify-center mx-auto mb-4 text-[var(--accent-cyan)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p className="text-lg font-medium mb-1">Initialize Extraction</p>
            <p className="mono text-xs text-[var(--text-tertiary)] uppercase">Drag & Drop PDF, PNG, JPG (Max 10MB)</p>
          </div>
          <div className="meta-bar">
            <span className="text-[var(--accent-green)]">[PROTECTED] Files deleted post-processing</span>
          </div>
        </div>
      </div>
    </section>
  );
}
