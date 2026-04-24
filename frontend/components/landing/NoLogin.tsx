'use client';

import { useEffect, useState } from 'react';

export default function NoLogin() {
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

    const element = document.getElementById('nologin-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="nologin-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          Philosophy
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          Why no login?
        </h2>

        <div className={`bg-zinc-100 border border-amber-500/25 rounded-2xl p-10 md:p-12 mt-9 relative overflow-hidden transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Large quote mark */}
          <div className="absolute -top-5 left-5 font-serif text-[200px] font-black text-amber-500/6 leading-none">
            "
          </div>

          <div className="relative z-10">
            <p className="text-base leading-relaxed text-zinc-700">
              Because every login form is a conversion killer. The people who need this tool — Indian freelancers, small agencies, one-person consultancies — are not going to create an account to parse an invoice. They'll close the tab.
            </p>
            <p className="text-base leading-relaxed text-zinc-700 mt-4">
              No login means no user table, no password reset flow, no email verification, no JWT refresh tokens, no session management. The codebase is smaller, the attack surface is smaller, and the conversion rate is higher.
            </p>
            <p className="font-serif text-lg font-bold italic text-zinc-900 mt-5">
              "Your invoice data is yours. We process it and delete it. That's the entire privacy policy."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}