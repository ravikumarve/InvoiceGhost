'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ghost, FileText } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Check if we're on a dark theme page (app pages)
  const isDarkTheme = pathname.startsWith('/app') || pathname === '/result';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b ${
      isDarkTheme 
        ? 'bg-zinc-900/50 border-zinc-800' 
        : 'bg-amber-50/80 border-zinc-200/10'
    }`}>
      <div className="max-w-5xl mx-auto px-8 md:px-16 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Ghost className={`w-6 h-6 ${isDarkTheme ? 'text-amber-500' : 'text-amber-600'}`} />
            <span className={`font-serif font-bold ${isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'}`}>
              InvoiceGhost
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-amber-600' 
                  : isDarkTheme 
                    ? 'text-zinc-400 hover:text-amber-500' 
                    : 'text-zinc-700 hover:text-amber-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/app"
              className={`text-sm font-medium transition-colors ${
                isActive('/app') 
                  ? 'text-amber-600' 
                  : isDarkTheme 
                    ? 'text-zinc-400 hover:text-amber-500' 
                    : 'text-zinc-700 hover:text-amber-600'
              }`}
            >
              Parse Invoice
            </Link>
            <a
              href="https://github.com/ravikumarve/InvoiceGhost"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isDarkTheme 
                  ? 'text-zinc-400 hover:text-amber-500' 
                  : 'text-zinc-700 hover:text-amber-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}