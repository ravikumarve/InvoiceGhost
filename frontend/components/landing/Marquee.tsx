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
    <div className="border-y border-[var(--border-main)] bg-[var(--bg-panel)] py-3 overflow-hidden whitespace-nowrap">
      <div className="inline-flex gap-12 animate-marquee">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="mono text-xs uppercase tracking-wider text-[var(--text-secondary)] inline-flex items-center gap-3"
          >
            <span className="text-[var(--accent-cyan)] text-[8px]">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
