import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Result — InvoiceGhost',
  description: 'View your extracted invoice data with confidence scores, line items, and tax breakdown. Export to CSV or copy JSON.',
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
