'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/landing/Footer';
import { parseInvoice, validateLicenseKey } from '@/lib/api';
import { InvoiceData } from '@/lib/types';
import {
  Lock, Unlock, Upload, FileText, Loader2, CheckCircle,
  XCircle, AlertCircle, Download, Trash2, ArrowRight, Shield
} from 'lucide-react';

const MAX_BATCH_FILES = 20;

interface BatchResult {
  filename: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  data?: InvoiceData;
  error?: string;
}

export default function BatchPage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLicensed, setIsLicensed] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Check localStorage for existing license on mount
  useEffect(() => {
    const stored = localStorage.getItem('invoiceghost_license');
    if (stored) {
      setLicenseKey(stored);
      setIsLicensed(true);
    }
  }, []);

  const handleValidateKey = async () => {
    if (!licenseKey.trim()) {
      setValidationError('License key is required.');
      return;
    }
    if (licenseKey.trim().length < 20) {
      setValidationError('License key must be at least 20 characters.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    const valid = await validateLicenseKey(licenseKey.trim());
    if (valid) {
      localStorage.setItem('invoiceghost_license', licenseKey.trim());
      setIsLicensed(true);
    } else {
      setValidationError('Invalid license key. Check your Gumroad purchase email.');
    }
    setIsValidating(false);
  };

  const handleRemoveLicense = () => {
    localStorage.removeItem('invoiceghost_license');
    setLicenseKey('');
    setIsLicensed(false);
    setFiles([]);
    setResults([]);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isLicensed) return;

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(f.type)
    );
    const combined = [...files, ...droppedFiles].slice(0, MAX_BATCH_FILES);
    setFiles(combined);
    setResults(combined.map((f) => ({ filename: f.name, status: 'pending' as const })));
  }, [files, isLicensed]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !isLicensed) return;
    const selected = Array.from(e.target.files);
    const combined = [...files, ...selected].slice(0, MAX_BATCH_FILES);
    setFiles(combined);
    setResults(combined.map((f) => ({ filename: f.name, status: 'pending' as const })));
  }, [files, isLicensed]);

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newResults = results.filter((_, i) => i !== index);
    setFiles(newFiles);
    setResults(newResults);
  };

  const handleProcessBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const newResults = [...results];

    for (let i = 0; i < files.length; i++) {
      newResults[i] = { ...newResults[i], status: 'processing' };
      setResults([...newResults]);

      const result = await parseInvoice(files[i]);

      if (result.success && result.data) {
        newResults[i] = { ...newResults[i], status: 'success', data: result.data };
      } else {
        newResults[i] = { ...newResults[i], status: 'error', error: result.error || 'Extraction failed' };
      }
      setResults([...newResults]);
    }

    setIsProcessing(false);
  };

  const handleExportMasterCSV = () => {
    const successful = results.filter((r) => r.status === 'success' && r.data);
    if (successful.length === 0) return;

    const allData = successful.map((r) => r.data!);

    // Build a combined CSV with all line items from all invoices
    const headers = [
      'Invoice Number', 'Invoice Date', 'Vendor', 'Vendor GSTIN',
      'Buyer', 'Buyer GSTIN', 'Description', 'HSN/SAC',
      'Quantity', 'Unit', 'Rate', 'Amount', 'Tax Rate',
      'Subtotal', 'CGST', 'SGST', 'IGST', 'Total Tax', 'Grand Total',
      'Confidence'
    ];

    const rows: string[][] = [];

    for (const inv of allData) {
      const baseFields = [
        inv.invoice_number || '',
        inv.invoice_date || '',
        inv.vendor_name || '',
        inv.vendor_gstin || '',
        inv.buyer_name || '',
        inv.buyer_gstin || '',
      ];

      for (const item of inv.line_items) {
        rows.push([
          ...baseFields,
          item.description || '',
          item.hsn_sac || '',
          item.quantity?.toString() || '',
          item.unit || '',
          item.rate?.toString() || '',
          item.amount?.toString() || '',
          item.tax_rate?.toString() || '',
          inv.subtotal?.toString() || '',
          inv.cgst?.toString() || '',
          inv.sgst?.toString() || '',
          inv.igst?.toString() || '',
          inv.total_tax?.toString() || '',
          inv.grand_total?.toString() || '',
          inv.confidence_score?.toFixed(2) || '',
        ]);
      }
    }

    // Escape CSV fields (handle commas, quotes, newlines)
    const escape = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      // CSV injection protection — prefix dangerous chars with single quote
      if (/^[=+\-@]/.test(val)) {
        return `'${val}`;
      }
      return val;
    };

    const csvContent = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-block px-3 py-1 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] mono text-xs uppercase mb-6 bg-[rgba(0,240,255,0.05)]">
              Batch Mode
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight mb-4">
              Multi-File Extraction
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-[600px]">
              Process up to {MAX_BATCH_FILES} invoices in a single run. Combined CSV export. Requires a Gumroad license key.
            </p>
          </div>

          {/* License Gate */}
          {!isLicensed ? (
            <div className="crosshair-panel max-w-lg mb-12">
              <div className="meta-bar">
                <span>ACCESS: LOCKED</span>
                <span>REQUIRES LICENSE</span>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-6 h-6 text-[var(--accent-amber)]" />
                  <h2 className="text-xl font-semibold">Enter License Key</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Purchase Batch Mode on Gumroad for $19 lifetime. You'll receive a license key via email.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="mono text-xs uppercase text-[var(--text-secondary)] block mb-2">License Key</label>
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => { setLicenseKey(e.target.value); setValidationError(null); }}
                      placeholder="Enter your Gumroad license key..."
                      className="w-full bg-[var(--bg-base)] border border-[var(--border-main)] px-4 py-3 mono text-sm text-white placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-cyan)] focus:outline-none transition-colors"
                    />
                    {validationError && (
                      <p className="mono text-xs text-[var(--accent-alert)] mt-2 flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5" />
                        {validationError}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleValidateKey}
                    disabled={isValidating}
                    className="btn-tech btn-primary-tech w-full flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Validate Key
                      </>
                    )}
                  </button>

                  <a
                    href="https://gumroad.com/l/invoiceghost"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tech btn-outline-tech w-full text-center block"
                  >
                    Purchase License Key — $19
                    <ArrowRight className="w-4 h-4 inline ml-2" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="crosshair-panel max-w-lg mb-12">
              <div className="meta-bar">
                <span className="text-[var(--accent-green)]">ACCESS: UNLOCKED</span>
                <span>BATCH MODE ACTIVE</span>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Unlock className="w-5 h-5 text-[var(--accent-green)]" />
                  <div>
                    <div className="mono text-sm font-semibold text-[var(--accent-green)]">License Verified</div>
                    <div className="mono text-xs text-[var(--text-tertiary)]">
                      {licenseKey.substring(0, 8)}{'*'.repeat(12)}
                    </div>
                  </div>
                </div>
                <button onClick={handleRemoveLicense} className="mono text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-alert)] transition-colors flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Upload Zone — only visible when licensed */}
          {isLicensed && (
            <>
              <div
                className={`crosshair-panel mb-8 transition-colors ${isDragOver ? 'border-[var(--accent-cyan)]' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
              >
                <div className="meta-bar">
                  <span>FILE QUEUE</span>
                  <span>{files.length}/{MAX_BATCH_FILES} SLOTS</span>
                </div>
                <div className="p-8 text-center">
                  <div className="w-12 h-12 border border-[var(--border-main)] flex items-center justify-center mx-auto mb-4 text-[var(--accent-cyan)]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-lg font-medium mb-1">Drop invoice files here</p>
                  <p className="mono text-xs text-[var(--text-tertiary)] uppercase mb-4">
                    PDF, PNG, JPG, WEBP · Max 10MB each · Up to {MAX_BATCH_FILES} files
                  </p>
                  <label className="btn-tech btn-outline-tech cursor-pointer inline-block">
                    Browse Files
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* File Queue */}
              {files.length > 0 && (
                <div className="crosshair-panel mb-8">
                  <div className="meta-bar">
                    <span>QUEUE</span>
                    <span>{files.length} FILES</span>
                  </div>
                  <div className="divide-y divide-[var(--border-main)]">
                    {files.map((file, i) => (
                      <div key={i} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                          <span className="mono text-sm">{file.name}</span>
                          <span className="mono text-xs text-[var(--text-tertiary)]">
                            ({(file.size / 1024).toFixed(0)}KB)
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {results[i]?.status === 'success' && <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />}
                          {results[i]?.status === 'error' && <XCircle className="w-4 h-4 text-[var(--accent-alert)]" />}
                          {results[i]?.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-cyan)]" />}
                          {!isProcessing && results[i]?.status === 'pending' && (
                            <button onClick={() => handleRemoveFile(i)} className="text-[var(--text-tertiary)] hover:text-[var(--accent-alert)] transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {files.length > 0 && (
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={handleProcessBatch}
                    disabled={isProcessing || files.length === 0}
                    className="btn-tech btn-primary-tech flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing ({successCount + errorCount}/{files.length})...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Extract All ({files.length})
                      </>
                    )}
                  </button>

                  {successCount > 0 && !isProcessing && (
                    <button
                      onClick={handleExportMasterCSV}
                      className="btn-tech btn-outline-tech flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV ({successCount})
                    </button>
                  )}
                </div>
              )}

              {/* Results Summary */}
              {results.length > 0 && !isProcessing && (successCount > 0 || errorCount > 0) && (
                <div className="crosshair-panel p-6 bg-[var(--bg-panel)]">
                  <h3 className="mono text-sm font-semibold mb-4">Extraction Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="mono text-2xl font-bold">{results.length}</div>
                      <div className="mono text-xs text-[var(--text-tertiary)] uppercase">Total</div>
                    </div>
                    <div>
                      <div className="mono text-2xl font-bold text-[var(--accent-green)]">{successCount}</div>
                      <div className="mono text-xs text-[var(--text-tertiary)] uppercase">Success</div>
                    </div>
                    <div>
                      <div className="mono text-2xl font-bold text-[var(--accent-alert)]">{errorCount}</div>
                      <div className="mono text-xs text-[var(--text-tertiary)] uppercase">Failed</div>
                    </div>
                  </div>

                  {/* Error details */}
                  {errorCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-main)]">
                      {results.filter((r) => r.status === 'error').map((r, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 text-sm">
                          <AlertCircle className="w-3.5 h-3.5 text-[var(--accent-alert)] flex-shrink-0" />
                          <span className="mono text-xs text-[var(--text-secondary)]">{r.filename}:</span>
                          <span className="mono text-xs text-[var(--accent-alert)]">{r.error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Not Licensed CTA */}
          {!isLicensed && (
            <div className="crosshair-panel p-8 bg-[var(--bg-panel)] max-w-lg">
              <div className="text-center">
                <Lock className="w-10 h-10 text-[var(--accent-amber)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Batch Mode is a Premium Feature</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                  Process up to 20 invoices at once with combined CSV export. One-time payment of $19 via Gumroad.
                </p>
                <a
                  href="https://gumroad.com/l/invoiceghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tech btn-primary-tech inline-flex items-center gap-2"
                >
                  Purchase Batch Mode — $19
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="mono text-xs text-[var(--text-tertiary)] mt-4">
                  Or use the <a href="/workspace" className="text-[var(--accent-cyan)] hover:underline">free single-file workspace</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
