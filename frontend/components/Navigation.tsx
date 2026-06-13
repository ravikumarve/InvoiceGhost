'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/batch', label: 'Batch' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-8 py-4 border-b border-[var(--border-main)] bg-[rgba(3,3,3,0.85)] backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-6 h-6 border-2 border-[var(--accent-cyan)] flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-[var(--accent-cyan)]" />
        </div>
        <span className="mono font-extrabold text-lg tracking-tight text-white">
          InvoiceGhost
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-5">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`mono text-xs uppercase tracking-widest transition-colors ${
              pathname === link.href
                ? 'text-[var(--accent-cyan)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]'
            }`}
          >
            {link.label}
          </Link>
        ))}
        <a
          href="https://github.com/ravikumarve/InvoiceGhost"
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-xs uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
        >
          GitHub
        </a>
        <a
          href={process.env.NEXT_PUBLIC_GUMROAD_URL || 'https://gumroad.com/l/invoiceghost'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-tech btn-outline-tech text-xs py-2 px-3"
        >
          Batch Mode ($19)
        </a>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </nav>
  );
}
