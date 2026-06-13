'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="mono text-7xl font-extrabold text-[var(--accent-alert)]">404</h1>
        <h2 className="text-2xl font-semibold">Route Not Found</h2>
        <p className="text-[var(--text-secondary)]">
          The requested endpoint does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-tech btn-primary-tech inline-flex"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}
