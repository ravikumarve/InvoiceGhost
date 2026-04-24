export default function Marquee() {
  const items = [
    'Standard GST Invoices',
    'Non-GST Receipts',
    'Foreign Currency Invoices',
    'Scanned Documents',
    'Handwritten Receipts',
    'HSN / SAC Codes',
    'CGST / SGST / IGST',
    'PDF + Image Support',
  ];

  return (
    <div className="border-y border-zinc-200/10 bg-zinc-100 py-3.5 overflow-hidden whitespace-nowrap">
      <div className="inline-flex gap-12 animate-marquee">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="font-mono text-xs tracking-[0.08em] uppercase text-zinc-600 inline-flex items-center gap-3"
          >
            <span className="text-amber-600 text-[8px]">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}