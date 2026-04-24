'use client';

import { useEffect, useState } from 'react';

export default function DataModel() {
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

    const element = document.getElementById('datamodel-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="datamodel-section" className="py-20 border-b border-zinc-200/10">
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-600 block mb-3.5">
          Data Model
        </span>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-bold leading-[1.15] tracking-tight text-zinc-900 mb-4.5">
          Every parse returns this <em className="italic text-amber-600">exact</em> structure.
        </h2>
        <p className="text-zinc-700">
          Validated Pydantic model. All fields typed. No surprises in production.
        </p>

        <div className={`bg-zinc-900 rounded-2xl overflow-hidden mt-9 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="px-6 py-4 border-b border-white/8 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-1.5" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 ml-1.5" />
            <span className="font-mono text-[11px] text-white/40 ml-2">
              backend/models/invoice.py
            </span>
          </div>
          <pre className="p-7 font-mono text-[12.5px] leading-relaxed text-amber-100/80 overflow-x-auto bg-transparent">
            <code>
              <span className="text-amber-400">class</span> <span className="text-blue-400">InvoiceData</span>(BaseModel):
              <br />
              &nbsp;&nbsp;invoice_number:   Optional[str]
              <br />
              &nbsp;&nbsp;invoice_date:     Optional[str]        <span className="text-zinc-600"># ISO 8601</span>
              <br />
              &nbsp;&nbsp;due_date:         Optional[str]
              <br />
              &nbsp;&nbsp;vendor_name:      Optional[str]
              <br />
              &nbsp;&nbsp;vendor_gstin:     Optional[str]        <span className="text-zinc-600"># 15-char Indian GST number</span>
              <br />
              &nbsp;&nbsp;vendor_address:   Optional[str]
              <br />
              &nbsp;&nbsp;buyer_name:       Optional[str]
              <br />
              &nbsp;&nbsp;buyer_gstin:      Optional[str]
              <br />
              &nbsp;&nbsp;buyer_address:    Optional[str]
              <br />
              &nbsp;&nbsp;line_items:       List[<span className="text-blue-400">LineItem</span>]
              <br />
              &nbsp;&nbsp;subtotal:         Optional[float]
              <br />
              &nbsp;&nbsp;cgst:             Optional[float]
              <br />
              &nbsp;&nbsp;sgst:             Optional[float]
              <br />
              &nbsp;&nbsp;igst:             Optional[float]
              <br />
              &nbsp;&nbsp;total_tax:        Optional[float]
              <br />
              &nbsp;&nbsp;grand_total:      Optional[float]
              <br />
              &nbsp;&nbsp;currency:         str = <span className="text-green-400">"INR"</span>
              <br />
              &nbsp;&nbsp;payment_terms:    Optional[str]
              <br />
              &nbsp;&nbsp;notes:            Optional[str]
              <br />
              &nbsp;&nbsp;confidence_score: float                <span className="text-zinc-600"># 0.0–1.0</span>
              <br />
              <br />
              <span className="text-amber-400">class</span> <span className="text-blue-400">LineItem</span>(BaseModel):
              <br />
              &nbsp;&nbsp;description: str
              <br />
              &nbsp;&nbsp;hsn_sac:     Optional[str]            <span className="text-zinc-600"># GST compliance code</span>
              <br />
              &nbsp;&nbsp;quantity:    Optional[float]
              <br />
              &nbsp;&nbsp;unit:        Optional[str]
              <br />
              &nbsp;&nbsp;rate:        Optional[float]
              <br />
              &nbsp;&nbsp;amount:      Optional[float]
              <br />
              &nbsp;&nbsp;tax_rate:    Optional[float]
            </code>
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">
          <div className="p-6 rounded-xl border text-center bg-green-500/6 border-green-500/20">
            <div className="font-serif text-[28px] font-bold leading-none mb-1.5 text-green-700">
              ≥ 0.8
            </div>
            <div className="text-sm font-semibold mb-1">
              High Confidence
            </div>
            <div className="text-xs text-zinc-600">
              Safe to use directly
            </div>
          </div>
          <div className="p-6 rounded-xl border text-center bg-amber-500/6 border-amber-500/20">
            <div className="font-serif text-[28px] font-bold leading-none mb-1.5 text-amber-600">
              0.5–0.8
            </div>
            <div className="text-sm font-semibold mb-1">
              Review Recommended
            </div>
            <div className="text-xs text-zinc-600">
              Check key figures
            </div>
          </div>
          <div className="p-6 rounded-xl border text-center bg-red-500/5 border-red-500/15">
            <div className="font-serif text-[28px] font-bold leading-none mb-1.5 text-red-600">
              {'< 0.5'}
            </div>
            <div className="text-sm font-semibold mb-1">
              Low Confidence
            </div>
            <div className="text-xs text-zinc-600">
              Manual verification advised
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}