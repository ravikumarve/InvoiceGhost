'use client';

import { useEffect, useState } from 'react';

const steps = [
  {
    num: '01',
    title: 'Clone and install backend',
    description: 'Python 3.12+ required. Uses pdf2image, so ffmpeg and poppler-utils must be available.',
    code: `git clone https://github.com/ravikumarve/InvoiceGhost.git
cd invoiceghost/backend
python3.12 -m venv venv && source venv/bin/activate
pip install -r requirements.txt`,
  },
  {
    num: '02',
    title: 'Configure environment',
    description: 'Add your Gemini API key. Groq is optional — used automatically as fallback only.',
    code: `cp .env.example .env
# Set GEMINI_API_KEY in .env
# Set LICENSE_KEY_HMAC_SECRET=$(openssl rand -hex 32)`,
  },
  {
    num: '03',
    title: 'Start the backend',
    description: '',
    code: `uvicorn main:app --reload
# API running at http://localhost:8000
# Interactive docs at http://localhost:8000/docs`,
  },
  {
    num: '04',
    title: 'Start the frontend',
    description: '',
    code: `cd ../frontend && npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# Open http://localhost:3000`,
  },
];

export default function QuickStart() {
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

    const element = document.getElementById('quickstart-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="quickstart-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          Quick Start
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          Running in 4 commands.
        </h2>

        <div className={`flex flex-col gap-0 mt-9 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-6 py-6 border-b border-zinc-200/10 last:border-b-0"
            >
              <div className="font-serif text-[36px] font-black leading-none text-zinc-200 flex-shrink-0 w-11 text-right pt-0.5">
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-sm text-zinc-600 mb-2.5">
                    {step.description}
                  </p>
                )}
                <code className="font-mono text-[11.5px] bg-zinc-900 text-amber-100 px-4 py-2.5 rounded-lg block mt-2 leading-relaxed whitespace-pre-wrap">
                  {step.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}