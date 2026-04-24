'use client';

import { useEffect, useState } from 'react';

export default function ProjectStructure() {
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

    const element = document.getElementById('structure-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="structure-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          Project Structure
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          The full monorepo layout.
        </h2>

        <div className={`bg-zinc-900 rounded-xl p-7 md:p-8 mt-7 font-mono text-[12.5px] leading-8 text-white/45 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="text-blue-400">invoiceghost/</div>
          <div className="pl-4">
            <div className="text-blue-400">├── backend/</div>
            <div className="pl-4">
              <div className="text-white/45">│   ├── main.py</div>
              <div className="text-zinc-600 pl-4"># FastAPI app, CORS, health check</div>
              <div className="text-blue-400">│   ├── routers/</div>
              <div className="pl-4">
                <div className="text-white/45">│   │   ├── parse.py</div>
                <div className="text-zinc-600 pl-4"># POST /api/parse</div>
                <div className="text-white/45">│   │   └── export.py</div>
                <div className="text-zinc-600 pl-4"># POST /api/export/csv</div>
              </div>
              <div className="text-blue-400">│   ├── services/</div>
              <div className="pl-4">
                <div className="text-white/45">│   │   ├── extractor.py</div>
                <div className="text-zinc-600 pl-4"># Gemini/Groq extraction logic</div>
                <div className="text-white/45">│   │   ├── pdf_handler.py</div>
                <div className="text-zinc-600 pl-4"># PDF → image via pdf2image</div>
                <div className="text-white/45">│   │   └── validator.py</div>
                <div className="text-zinc-600 pl-4"># Pydantic output validation</div>
              </div>
              <div className="text-blue-400">│   ├── models/</div>
              <div className="pl-4">
                <div className="text-white/45">│   │   └── invoice.py</div>
                <div className="text-zinc-600 pl-4"># InvoiceData + LineItem models</div>
              </div>
              <div className="text-blue-400">│   ├── prompts/</div>
              <div className="pl-4">
                <div className="text-white/45">│   │   └── extraction.txt</div>
                <div className="text-zinc-600 pl-4"># Structured extraction system prompt</div>
              </div>
              <div className="text-white/45">│   └── tests/</div>
              <div className="text-zinc-600 pl-4"># 18/18 passing</div>
            </div>
            <div className="text-blue-400">├── frontend/</div>
            <div className="pl-4">
              <div className="text-blue-400">│   ├── app/</div>
              <div className="pl-4">
                <div className="text-white/45">│   │   ├── page.tsx</div>
                <div className="text-zinc-600 pl-4"># Upload UI (drag-drop zone)</div>
                <div className="text-white/45">│   │   └── result/page.tsx</div>
                <div className="text-zinc-600 pl-4"># Result display + export</div>
              </div>
              <div className="text-blue-400">│   ├── components/</div>
              <div className="pl-4">
                <div className="text-white/45">│   │   ├── UploadZone.tsx</div>
                <div className="text-zinc-600 pl-4"># Drag-drop upload</div>
                <div className="text-white/45">│   │   ├── InvoiceCard.tsx</div>
                <div className="text-zinc-600 pl-4"># Structured result display</div>
                <div className="text-white/45">│   │   ├── ExportBar.tsx</div>
                <div className="text-zinc-600 pl-4"># CSV / Copy JSON / Batch CTA</div>
                <div className="text-white/45">│   │   └── GumroadBadge.tsx</div>
                <div className="text-zinc-600 pl-4"># Upgrade badge</div>
              </div>
              <div className="text-blue-400">│   └── lib/</div>
              <div className="pl-4">
                <div className="text-white/45">│       └── api.ts</div>
                <div className="text-zinc-600 pl-4"># Backend API client</div>
              </div>
            </div>
            <div className="text-white/45">├── AGENTS.md</div>
            <div className="text-white/45">└── README.md</div>
          </div>
        </div>
      </div>
    </section>
  );
}