'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import UploadZone from '@/components/UploadZone';
import { parseInvoice } from '@/lib/api';
import { saveExtractionHistory, getExtractionHistory, clearExtractionHistory, type HistoryEntry } from '@/lib/history';
import { Loader2, AlertCircle, Upload, Cpu, Download, Clock, Trash2, ChevronRight } from 'lucide-react';

export default function WorkspacePage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load extraction history from localStorage on mount
  useEffect(() => {
    setHistory(getExtractionHistory());
  }, []);

  const loadHistoryEntry = (entry: HistoryEntry) => {
    sessionStorage.setItem('invoiceghost_result', JSON.stringify(entry.data));
    router.push('/result');
  };

  const handleClearHistory = () => {
    clearExtractionHistory();
    setHistory([]);
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseInvoice(file);

      if (result.success && result.data) {
        // Save to localStorage history
        saveExtractionHistory(file.name, result.data);
        setHistory(getExtractionHistory());
        // Save to session for the result page
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

      <main className="flex-1 px-6 md:px-8 py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Zone */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Extraction Workspace</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Upload a single invoice or receipt for AI-powered extraction. PDF, PNG, JPG, WEBP accepted.
            </p>
            <div className="meta-bar mt-4">
              <span>MODULE: EXTRACT_V2</span>
              <span>STATUS: {isProcessing ? 'PROCESSING' : 'READY'}</span>
            </div>
          </div>

          {/* Two-Column Layout: Zone A + Zone B */}
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
            {/* ZONE A: Upload Panel */}
            <div>
              <div className="crosshair-panel">
                <div className="meta-bar">
                  <span>STATUS: {isProcessing ? 'PROCESSING' : 'READY'}</span>
                  <span>MEM_ALLOC: {isProcessing ? '~2MB' : '0MB'}</span>
                </div>
                <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                <div className="meta-bar">
                  <span className="text-[var(--accent-green)]">[PROTECTED] Files deleted post-processing</span>
                </div>
              </div>

              {isProcessing && (
                <div className="mt-6">
                  <div className="crosshair-panel p-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-cyan)]" />
                    <span className="mono text-sm text-[var(--text-secondary)]">Processing extraction pipeline...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6">
                  <div className="crosshair-panel p-4 flex items-center gap-3 border-[var(--accent-alert)]">
                    <AlertCircle className="w-5 h-5 text-[var(--accent-alert)]" />
                    <span className="mono text-sm text-[var(--accent-alert)]">{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ZONE B: How It Works */}
            <div className="crosshair-panel p-6">
              <h2 className="mono text-sm text-[var(--accent-cyan)] mb-6 tracking-wider">PIPELINE_OVERVIEW</h2>

              <div className="space-y-0">
                {/* Step 01 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border border-[var(--accent-cyan)] flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4 text-[var(--accent-cyan)]" />
                    </div>
                    <div className="w-px flex-1 border-l border-dashed border-[var(--border-highlight)] my-2" />
                  </div>
                  <div className="pb-6">
                    <p className="mono text-xs text-[var(--accent-cyan)] mb-1 tracking-wider">STEP 01:</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">UPLOAD</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Drop PDF, PNG, JPG, or WEBP. Validated client-side before processing.
                    </p>
                  </div>
                </div>

                {/* Step 02 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border border-[var(--accent-cyan)] flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4 text-[var(--accent-cyan)]" />
                    </div>
                    <div className="w-px flex-1 border-l border-dashed border-[var(--border-highlight)] my-2" />
                  </div>
                  <div className="pb-6">
                    <p className="mono text-xs text-[var(--accent-cyan)] mb-1 tracking-wider">STEP 02:</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">EXTRACT</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Gemini 2.0 Flash parses every field. Auto-fallback to Groq Llama 3.2 on failure.
                    </p>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border border-[var(--accent-cyan)] flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4 text-[var(--accent-cyan)]" />
                    </div>
                  </div>
                  <div>
                    <p className="mono text-xs text-[var(--accent-cyan)] mb-1 tracking-wider">STEP 03:</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">EXPORT</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Structured JSON + CSV download. Zero data retained after processing completes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="meta-bar mt-6">
                <span>PIPELINE: 3-STAGE</span>
                <span>STATUS: ACTIVE</span>
              </div>
            </div>
          </div>

          {/* ZONE C: Format Strip + Quick Stats */}
          <div className="mt-6 border border-[var(--border-main)] px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 bg-[var(--bg-panel)]">
            {['PDF', 'PNG', 'JPG', 'WEBP'].map((fmt) => (
              <span
                key={fmt}
                className="mono text-xs px-2 py-0.5 border border-[var(--border-main)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
              >
                {fmt}
              </span>
            ))}
            <span className="mx-1 text-[var(--text-tertiary)]">•</span>
            <span className="mono text-xs text-[var(--text-tertiary)]">10MB max</span>
            <span className="mx-1 text-[var(--text-tertiary)]">•</span>
            <span className="mono text-xs text-[var(--text-tertiary)]">~15s avg</span>
          </div>

          {/* ZONE D: Recent Extractions History */}
          {history.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--accent-cyan)]" />
                  <h2 className="mono text-sm text-[var(--text-secondary)] tracking-wider">RECENT_EXTRACTIONS</h2>
                  <span className="mono text-xs text-[var(--text-tertiary)]">({history.length})</span>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="mono text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-alert)] transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  CLEAR
                </button>
              </div>

              <div className="border border-[var(--border-main)] divide-y divide-[var(--border-main)]">
                {history.map((entry) => {
                  const date = new Date(entry.timestamp);
                  const timeStr = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  }) + ' ' + date.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });

                  const confColor =
                    entry.confidence_score >= 0.8
                      ? 'text-[var(--accent-green)]'
                      : entry.confidence_score >= 0.5
                        ? 'text-[var(--accent-amber)]'
                        : 'text-[var(--accent-alert)]';

                  return (
                    <button
                      key={entry.id}
                      onClick={() => loadHistoryEntry(entry)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--bg-panel)] hover:bg-[var(--bg-elevated)] transition-colors text-left group"
                    >
                      <div className="w-8 h-8 border border-[var(--border-main)] flex items-center justify-center shrink-0 bg-[var(--bg-elevated)]">
                        <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="mono text-xs text-[var(--text-tertiary)]">{timeStr}</span>
                          <span className="mono text-xs text-[var(--accent-cyan)]">
                            {entry.invoice_number || '—'}
                          </span>
                        </div>
                        <p className="text-sm truncate mt-0.5">{entry.filename}</p>
                      </div>

                      <div className="text-right shrink-0">
                        {entry.grand_total != null && (
                          <p className="mono text-sm">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: entry.currency,
                            }).format(entry.grand_total)}
                          </p>
                        )}
                        <p className={`mono text-xs ${confColor}`}>
                          {entry.confidence_score.toFixed(2)}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-cyan)] transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

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
