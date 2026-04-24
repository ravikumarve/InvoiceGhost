'use client';

import { useEffect, useState } from 'react';

const endpoints = [
  {
    method: 'POST',
    path: '/api/parse',
    title: 'Upload & parse invoice',
    fields: [
      { label: 'Request', value: 'multipart/form-data with file field' },
      { label: 'Response', value: 'InvoiceData JSON object' },
      { label: 'Header returned', value: 'X-Processing-Time-Ms' },
      { label: 'Rate limit', value: '10 req/min per IP' },
    ],
  },
  {
    method: 'POST',
    path: '/api/export/csv',
    title: 'Export to CSV',
    fields: [
      { label: 'Request', value: 'InvoiceData JSON body' },
      { label: 'Response', value: 'CSV file download' },
      { label: 'Filename', value: 'invoice_{invoice_number}.csv' },
    ],
  },
  {
    method: 'POST',
    path: '/api/validate-key',
    title: 'License key check',
    fields: [
      { label: 'Request', value: '{ "license_key": "XXXX-XXXX-XXXX-XXXX" }' },
      { label: 'Response', value: '{ "valid": true, "tier": "agency" }' },
      { label: 'Validation', value: 'HMAC-based, fully local — no external call, no DB write' },
    ],
  },
];

export default function ApiReference() {
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

    const element = document.getElementById('api-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="api-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          API Reference
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          Three endpoints. That's it.
        </h2>

        <div className={`mt-8 space-y-7 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {endpoints.map((endpoint, index) => (
            <div key={index} className="mb-7">
              <h3 className="text-base font-semibold text-zinc-900 mb-2.5 pb-2 border-b border-zinc-200/10">
                <span className="font-mono text-sm font-bold text-amber-600 mr-2">
                  {endpoint.method}
                </span>
                {endpoint.path} — {endpoint.title}
              </h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-zinc-600 py-2.5 px-3.5 text-left border-b-2 border-zinc-200/10">
                      Field
                    </th>
                    <th className="font-mono text-[9.5px] tracking-[0.12em] uppercase text-zinc-600 py-2.5 px-3.5 text-left border-b-2 border-zinc-200/10">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.fields.map((field, fieldIndex) => (
                    <tr key={fieldIndex} className="hover:bg-amber-500/3">
                      <td className="py-3 px-3.5 border-b border-zinc-200/10 text-zinc-700 align-top">
                        {field.label}
                      </td>
                      <td className="py-3 px-3.5 border-b border-zinc-200/10 text-zinc-700 align-top">
                        <code className="font-mono text-[11.5px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-500/15">
                          {field.value}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}