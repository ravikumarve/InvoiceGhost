'use client';

import { useEffect } from 'react';

export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Result error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <h1 className="mono text-4xl font-extrabold text-[var(--accent-alert)]">RENDER_ERR</h1>
        <h2 className="text-xl font-semibold">Result Display Failed</h2>
        <p className="text-[var(--text-secondary)] mono text-sm">
          {error.message || 'Could not render the extracted invoice data.'}
        </p>
        <button
          onClick={reset}
          className="btn-tech btn-primary-tech inline-flex"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
