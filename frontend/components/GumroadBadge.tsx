'use client';

import { ExternalLink } from 'lucide-react';

export default function GumroadBadge() {
  const handleGumroadClick = () => {
    const gumroadUrl = process.env.NEXT_PUBLIC_GUMROAD_URL || 'https://gumroad.com/l/invoiceghost';
    window.open(gumroadUrl, '_blank');
  };

  return (
    <button
      onClick={handleGumroadClick}
      className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 border border-[var(--border-main)] bg-[var(--bg-panel)] backdrop-blur-md text-white hover:border-[var(--accent-cyan)] transition-all duration-200 z-50"
    >
      <span className="mono text-xs uppercase text-[var(--text-secondary)]">Powered by</span>
      <span className="mono text-xs font-bold text-[var(--accent-cyan)]">InvoiceGhost</span>
      <ExternalLink className="w-3 h-3 text-[var(--text-tertiary)]" />
    </button>
  );
}
