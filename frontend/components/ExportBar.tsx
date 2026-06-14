'use client';

import { useState } from 'react';
import { InvoiceData } from '@/lib/types';
import { exportToCSV } from '@/lib/api';
import { Download, Copy, Check, Lock } from 'lucide-react';

interface ExportBarProps {
  invoiceData: InvoiceData;
}

export default function ExportBar({ invoiceData }: ExportBarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await exportToCSV(invoiceData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoiceData.invoice_number || 'export'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJSON = () => {
    const json = JSON.stringify(invoiceData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUnlockBatchMode = () => {
    window.location.href = '/batch';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="crosshair-panel flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="btn-tech btn-primary-tech text-xs py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--bg-base)] border-t-transparent rounded-full animate-spin mr-2" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                <span>Export CSV</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleCopyJSON}
            className="btn-tech btn-outline-tech text-xs py-2 px-4"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-[var(--accent-green)]" />
                <span className="text-[var(--accent-green)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 border border-[var(--border-main)] bg-[var(--bg-base)]">
            <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span className="mono text-xs text-[var(--text-tertiary)] uppercase">Batch Mode</span>
          </div>
          
          <button
            onClick={handleUnlockBatchMode}
            className="btn-tech btn-outline-tech text-xs py-2 px-4 hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}
