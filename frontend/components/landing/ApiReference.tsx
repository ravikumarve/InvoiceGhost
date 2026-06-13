'use client';

import { useEffect, useState } from 'react';

export default function ApiReference() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById('api-section');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="api-section" className="px-6 md:px-8 py-16 border-b border-[var(--grid-color)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold mb-2">Developer API</h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-[600px]">
            Use the /api/parse endpoint to integrate InvoiceGhost directly into your own ERP, Tally workflow, or custom internal tools.
          </p>
        </div>

        <div className={`crosshair-panel grid grid-cols-1 md:grid-cols-2 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Left: API Info */}
          <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-[var(--border-main)] bg-[var(--bg-panel)]">
            <h3 className="text-2xl font-semibold mb-2">POST /api/parse</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              Uploads the invoice as multipart/form-data. Triggers strict MIME type and magic bytes validation before converting to a 300DPI image array for the extraction model.
            </p>
            
            <ul className="space-y-0">
              {[
                { label: 'Rate Limit', value: '10 req / min' },
                { label: 'Max Payload', value: '10 MB' },
                { label: 'Allowed Formats', value: 'PDF, PNG, JPG, WEBP' },
                { label: 'Response Header', value: 'X-Processing-Time-Ms' },
              ].map((item, i) => (
                <li key={i} className="flex justify-between py-3 border-b border-[var(--border-main)] last:border-b-0 mono text-xs">
                  <span className="text-[var(--text-secondary)]">{item.label}</span>
                  <span className="text-[var(--accent-cyan)]">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right: Code Block */}
          <div className="p-8 md:p-10 bg-[#000] overflow-x-auto">
            <div className="mono text-xs leading-[1.8] text-[var(--text-secondary)]">
              <span className="text-[#666]">// Strict Pydantic v2 JSON Response</span><br /><br />
              {'{'}<br />
              &nbsp;&nbsp;<span className="text-white">"invoice_number"</span>: <span className="text-[var(--accent-green)]">"INV-2023-042"</span>,<br />
              &nbsp;&nbsp;<span className="text-white">"invoice_date"</span>: <span className="text-[var(--accent-green)]">"2023-10-15"</span>,<br />
              &nbsp;&nbsp;<span className="text-white">"vendor_name"</span>: <span className="text-[var(--accent-green)]">"TechCorp India Pvt Ltd"</span>,<br />
              &nbsp;&nbsp;<span className="text-white">"vendor_gstin"</span>: <span className="text-[var(--accent-green)]">"27AADCB2230M1Z2"</span>,<br />
              &nbsp;&nbsp;<span className="text-white">"line_items"</span>: [<br />
              &nbsp;&nbsp;&nbsp;&nbsp;{'{'}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-white">"description"</span>: <span className="text-[var(--accent-green)]">"Software Consulting"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-white">"hsn_sac"</span>: <span className="text-[var(--accent-green)]">"998311"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-white">"amount"</span>: <span className="text-[var(--accent-amber)]">50000.00</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-white">"tax_rate"</span>: <span className="text-[var(--accent-amber)]">18.0</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br />
              &nbsp;&nbsp;],<br />
              &nbsp;&nbsp;<span className="text-white">"cgst"</span>: <span className="text-[var(--accent-amber)]">4500.00</span>,<br />
              &nbsp;&nbsp;<span className="text-white">"sgst"</span>: <span className="text-[var(--accent-amber)]">4500.00</span>,<br />
              &nbsp;&nbsp;<span className="text-white">"grand_total"</span>: <span className="text-[var(--accent-amber)]">59000.00</span>,<br />
              &nbsp;&nbsp;<span className="text-white">"confidence_score"</span>: <span className="text-[var(--accent-amber)]">0.98</span><br />
              {'}'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
