'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import InvoiceCard from '@/components/InvoiceCard';
import ExportBar from '@/components/ExportBar';
import GumroadBadge from '@/components/GumroadBadge';
import { InvoiceData } from '@/lib/types';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('invoiceghost_result');
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as InvoiceData;
        setInvoiceData(data);
      } catch (err) {
        setError('Failed to load invoice data');
      }
    } else {
      setError('No invoice data found. Please upload an invoice first.');
    }
  }, []);

  const handleBack = () => {
    router.push('/workspace');
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4 pt-20">
          <div className="w-full max-w-md">
            <div className="crosshair-panel p-4 flex items-center gap-3 border-[var(--accent-alert)]">
              <AlertCircle className="w-5 h-5 text-[var(--accent-alert)]" />
              <p className="mono text-sm text-[var(--accent-alert)]">{error}</p>
            </div>
            
            <button
              onClick={handleBack}
              className="mt-4 w-full btn-tech btn-outline-tech py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workspace
            </button>
          </div>
        </main>
        <GumroadBadge />
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4 pt-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="mono text-sm text-[var(--text-secondary)]">Loading extraction data...</p>
          </div>
        </main>
        <GumroadBadge />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-8 px-6 md:px-8 pt-20">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="btn-tech btn-outline-tech text-xs py-2 px-3 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Extraction
          </button>

          {/* Invoice Card */}
          <InvoiceCard invoiceData={invoiceData} />
          
          {/* Export Bar */}
          <ExportBar invoiceData={invoiceData} />
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

      <GumroadBadge />
    </div>
  );
}
