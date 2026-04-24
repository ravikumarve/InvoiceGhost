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
    // Retrieve the invoice data from sessionStorage
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
    router.push('/');
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <Navigation />

        {/* Error Content */}
        <main className="flex-1 flex items-center justify-center p-4 pt-20">
          <div className="w-full max-w-md">
            <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
            
            <button
              onClick={handleBack}
              className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>
          </div>
        </main>

        <GumroadBadge />
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950">
        <Navigation />

        {/* Loading Content */}
        <main className="flex-1 flex items-center justify-center p-4 pt-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-400">Loading invoice data...</p>
          </div>
        </main>

        <GumroadBadge />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Invoice Card */}
          <InvoiceCard invoiceData={invoiceData} />
          
          {/* Export Bar */}
          <ExportBar invoiceData={invoiceData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-zinc-500">
            <p>Built with privacy in mind. No data retention. No tracking.</p>
          </div>
        </div>
      </footer>

      {/* Gumroad Badge */}
      <GumroadBadge />
    </div>
  );
}