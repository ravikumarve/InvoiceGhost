'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import UploadZone from '@/components/UploadZone';
import { parseInvoice } from '@/lib/api';
import { InvoiceData } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseInvoice(file);

      if (result.success && result.data) {
        // Store the result in sessionStorage
        sessionStorage.setItem('invoiceghost_result', JSON.stringify(result.data));
        
        // Navigate to result page
        router.push('/result');
      } else {
        setError(result.error || 'Failed to parse invoice. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-20">
        <div className="w-full max-w-4xl space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">
              Parse invoices instantly
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Upload your PDF or image invoice and get structured data in seconds. 
              No login required. Zero data retention.
            </p>
          </div>

          {/* Upload Zone */}
          <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />

          {/* Processing State */}
          {isProcessing && (
            <div className="flex items-center justify-center space-x-3 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span>Processing your invoice...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
              <div className="text-amber-500 font-semibold mb-2">No Login</div>
              <p className="text-sm text-zinc-400">Start parsing immediately without creating an account</p>
            </div>
            <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
              <div className="text-amber-500 font-semibold mb-2">Privacy First</div>
              <p className="text-sm text-zinc-400">Your data is processed and deleted instantly</p>
            </div>
            <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
              <div className="text-amber-500 font-semibold mb-2">Instant Export</div>
              <p className="text-sm text-zinc-400">Download structured data as CSV or JSON</p>
            </div>
          </div>
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
    </div>
  );
}
