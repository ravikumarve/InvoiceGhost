'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
          <div className="text-center space-y-6">
            <h1 className="mono text-7xl font-extrabold text-[var(--accent-alert)]">ERROR</h1>
            <h2 className="text-2xl font-semibold">System Failure</h2>
            <p className="text-[var(--text-secondary)] mono text-sm">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="btn-tech btn-primary-tech inline-flex"
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
