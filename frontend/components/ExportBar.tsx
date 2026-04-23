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
      alert('Failed to export CSV. Please try again.');
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
    const gumroadUrl = process.env.NEXT_PUBLIC_GUMROAD_URL || 'https://gumroad.com/l/invoiceghost';
    window.open(gumroadUrl, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleCopyJSON}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 rounded-lg">
            <Lock className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Batch Mode</span>
          </div>
          
          <button
            onClick={handleUnlockBatchMode}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-500 rounded-lg font-medium transition-colors"
          >
            <span>Unlock</span>
          </button>
        </div>
      </div>
    </div>
  );
}