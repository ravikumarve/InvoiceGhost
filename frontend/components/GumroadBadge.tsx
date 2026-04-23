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
      className="fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 z-50"
    >
      <span className="text-sm font-medium">Powered by</span>
      <span className="text-sm font-semibold text-amber-500">InvoiceGhost</span>
      <ExternalLink className="w-4 h-4 text-zinc-400" />
    </button>
  );
}