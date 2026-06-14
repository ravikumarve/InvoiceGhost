import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Batch Mode — InvoiceGhost',
  description: 'Process up to 20 invoices at once with combined CSV export. Requires a Gumroad license key — $19 lifetime.',
};

export default function BatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
