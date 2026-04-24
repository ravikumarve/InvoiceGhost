'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-amber-500">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-100">Page Not Found</h2>
        <p className="text-zinc-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-medium rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
