export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-main)] px-6 md:px-8 py-8">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <a href="/" className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-[var(--text-secondary)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[var(--text-secondary)]" />
            </div>
            <span className="mono font-extrabold text-lg text-white">InvoiceGhost</span>
          </a>
          <div className="mono text-xs text-[var(--text-tertiary)] mt-2">
            Built for Indian freelancers. Licensed under MIT.
          </div>
        </div>
        
        <div className="flex gap-6">
          <a href="https://github.com/ravikumarve/InvoiceGhost" target="_blank" rel="noopener noreferrer" className="mono text-xs uppercase text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors">
            GitHub Source
          </a>
          <a href="https://invoiceghost.onrender.com/docs" target="_blank" rel="noopener noreferrer" className="mono text-xs uppercase text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors">
            Swagger UI
          </a>
          <a href="https://gumroad.com/l/invoiceghost" target="_blank" rel="noopener noreferrer" className="mono text-xs uppercase text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors">
            Purchase Batch Mode
          </a>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-8 pt-4 border-t border-[var(--grid-color)] flex flex-col md:flex-row justify-between items-center gap-2 mono text-xs text-[var(--text-tertiary)]">
        <span>© 2026 INVOICEGHOST. ALL RIGHTS RESERVED.</span>
        <span>SYSTEM: NOMINAL</span>
      </div>
    </footer>
  );
}
