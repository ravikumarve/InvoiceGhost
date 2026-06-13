'use client';

import { useEffect, useState } from 'react';

const securityItems = [
  {
    title: 'MIME Spoofing Protection',
    description: 'Magic bytes validation ensures a file claiming to be a PDF is not actually an executable before processing.',
  },
  {
    title: 'EXIF Leakage Stripped',
    description: 'All embedded image metadata (location, device info) is aggressively stripped before transmission to external AI APIs.',
  },
  {
    title: 'Zero Data Retention',
    description: 'Files are processed entirely in memory. Temp files are deleted in strict `finally` blocks using `shutil.rmtree`.',
  },
  {
    title: 'Constant-Time HMAC',
    description: 'License keys for Batch Mode are validated using `hmac.compare_digest()` to prevent timing side-channel attacks.',
  },
];

export default function Security() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById('security-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="security-section" className="px-6 md:px-8 py-16 border-b border-[var(--grid-color)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold mb-2">Hardened Security</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-[600px]">
            Designed with a security-first mindset for a tool handling sensitive financial documents.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {securityItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 border border-[var(--border-main)] bg-[var(--bg-panel)]"
            >
              <span className="mono text-xs text-[var(--accent-green)] flex-shrink-0 mt-1">[PROTECTED]</span>
              <div>
                <h4 className="mono text-sm font-semibold mb-1.5">{item.title}</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
