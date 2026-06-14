import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace — InvoiceGhost',
  description: 'Upload a single invoice or receipt for AI-powered extraction. PDF, PNG, JPG, WEBP accepted. No account required.',
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
