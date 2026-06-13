'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import UploadZone from '@/components/UploadZone';
import { parseInvoice } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function WorkspacePage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseInvoice(file);

      if (result.success && result.data) {
        sessionStorage.setItem('invoiceghost_result', JSON.stringify(result.data));
        router.push('/result');
      } else {
        setError(result.error || 'Extraction failed. Try a clearer scan.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Workspace Header */}
      <main className="flex-1 px-6 md:px-8 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Extraction Workspace</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Upload a single invoice or receipt for AI-powered extraction. PDF, PNG, JPG, WEBP accepted.
            </p>
          </div>

          {/* Dropzone */}
          <div className="crosshair-panel max-w-2xl">
            <div className="meta-bar">
              <span>STATUS: {isProcessing ? 'PROCESSING' : 'READY'}</span>
              <span>MEM_ALLOC: {isProcessing ? '~2MB' : '0MB'}</span>
            </div>
            <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            <div className="meta-bar">
              <span className="text-[var(--accent-green)]">[PROTECTED] Files deleted post-processing</span>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="max-w-2xl mt-6">
              <div className="crosshair-panel p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-cyan)]" />
                <span className="mono text-sm text-[var(--text-secondary)]">Processing extraction pipeline...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="max-w-2xl mt-6">
              <div className="crosshair-panel p-4 flex items-center gap-3 border-[var(--accent-alert)]">
                <AlertCircle className="w-5 h-5 text-[var(--accent-alert)]" />
                <span className="mono text-sm text-[var(--accent-alert)]">{error}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-main)] px-6 md:px-8 py-6">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div className="mono text-xs text-[var(--text-tertiary)]">
            Built with privacy in mind. No data retention. No tracking.
          </div>
          <div className="mono text-xs text-[var(--text-tertiary)]">
            SYSTEM: NOMINAL
          </div>
        </div>
      </footer>
    </div>
  );
}
