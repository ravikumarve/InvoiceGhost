export default function Footer() {
  return (
    <footer className="bg-zinc-900 py-16 relative overflow-hidden">
      {/* Large IG watermark */}
      <div className="absolute -right-8 -bottom-10 font-serif text-[280px] font-black text-transparent stroke-amber-500/7 leading-none hidden md:block" style={{ WebkitTextStroke: '1px rgba(212,132,10,0.07)' }}>
        IG
      </div>

      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20 relative z-10">
        <div className="font-serif text-[clamp(22px,3vw,32px)] font-bold italic text-amber-50 mb-2">
          Built for Indian freelancers<br className="hidden md:block" />drowning in GST paperwork.
        </div>
        <div className="text-sm text-zinc-400/60 mb-8">
          MIT License · Python 3.12+ · FastAPI · Gemini Flash · Zero data retention
        </div>

        <div className="flex gap-6 flex-wrap">
          <a
            href="https://github.com/ravikumarve/InvoiceGhost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400/50 hover:text-amber-400 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://gumroad.com/l/invoiceghost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400/50 hover:text-amber-400 transition-colors"
          >
            Gumroad — Batch Mode $19
          </a>
          <a
            href="https://invoiceghost.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400/50 hover:text-amber-400 transition-colors"
          >
            API Docs
          </a>
          <a
            href="https://github.com/ravikumarve/InvoiceGhost/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400/50 hover:text-amber-400 transition-colors"
          >
            Report Issues
          </a>
        </div>

        <div className="mt-12 pt-6 border-t border-white/7 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400/25">
          <span>© 2025 InvoiceGhost · MIT License</span>
          <span>Drop an invoice. Get clean data. No drama.</span>
        </div>
      </div>
    </footer>
  );
}