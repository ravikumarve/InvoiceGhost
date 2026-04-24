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
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold text-red-500">Error</h1>
            <h2 className="text-2xl font-semibold text-zinc-100">Something went wrong</h2>
            <p className="text-zinc-400">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-medium rounded-lg transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
