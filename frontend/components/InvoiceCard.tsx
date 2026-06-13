'use client';

import { InvoiceData } from '@/lib/types';
import { formatCurrency, formatDate, getConfidenceColor, getConfidenceLabel } from '@/lib/api';
import { CheckCircle, AlertCircle, XCircle, FileText, Building, User, Calendar, DollarSign } from 'lucide-react';

interface InvoiceCardProps {
  invoiceData: InvoiceData;
}

export default function InvoiceCard({ invoiceData }: InvoiceCardProps) {
  const confidenceColor = getConfidenceColor(invoiceData.confidence_score);
  const confidenceLabel = getConfidenceLabel(invoiceData.confidence_score);
  
  const ConfidenceIcon = invoiceData.confidence_score >= 0.8 ? CheckCircle : 
                        invoiceData.confidence_score >= 0.5 ? AlertCircle : XCircle;

  // Map confidence to accent colors
  const confidenceAccent = invoiceData.confidence_score >= 0.8 
    ? 'var(--accent-green)' 
    : invoiceData.confidence_score >= 0.5 
      ? 'var(--accent-amber)' 
      : 'var(--accent-alert)';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header with confidence badge */}
      <div className="crosshair-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-[var(--border-main)] flex items-center justify-center text-[var(--accent-cyan)]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {invoiceData.invoice_number || 'Invoice'}
            </h2>
            <p className="mono text-xs text-[var(--text-tertiary)]">
              {formatDate(invoiceData.invoice_date)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border-main)] bg-[var(--bg-base)]">
          <ConfidenceIcon className="w-4 h-4" style={{ color: confidenceAccent }} />
          <span className="mono text-xs font-bold uppercase" style={{ color: confidenceAccent }}>
            {confidenceLabel} ({Math.round(invoiceData.confidence_score * 100)}%)
          </span>
        </div>
      </div>

      {/* Vendor and Buyer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-main)] border border-[var(--border-main)]">
        {/* Vendor */}
        <div className="bg-[var(--bg-base)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="mono text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Vendor</h3>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{invoiceData.vendor_name || 'N/A'}</p>
            {invoiceData.vendor_gstin && (
              <p className="mono text-xs text-[var(--accent-cyan)]">GSTIN: {invoiceData.vendor_gstin}</p>
            )}
            {invoiceData.vendor_address && (
              <p className="text-xs text-[var(--text-secondary)]">{invoiceData.vendor_address}</p>
            )}
          </div>
        </div>

        {/* Buyer */}
        <div className="bg-[var(--bg-base)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="mono text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Buyer</h3>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">{invoiceData.buyer_name || 'N/A'}</p>
            {invoiceData.buyer_gstin && (
              <p className="mono text-xs text-[var(--accent-cyan)]">GSTIN: {invoiceData.buyer_gstin}</p>
            )}
            {invoiceData.buyer_address && (
              <p className="text-xs text-[var(--text-secondary)]">{invoiceData.buyer_address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      {invoiceData.line_items && invoiceData.line_items.length > 0 && (
        <div className="border border-[var(--border-main)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-main)] bg-[var(--bg-panel)]">
            <h3 className="mono text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-main)] bg-[var(--bg-base)]">
                  <th className="px-4 py-2 text-left mono text-xs uppercase text-[var(--text-tertiary)] tracking-wider">Description</th>
                  <th className="px-4 py-2 text-right mono text-xs uppercase text-[var(--text-tertiary)] tracking-wider">Qty</th>
                  <th className="px-4 py-2 text-right mono text-xs uppercase text-[var(--text-tertiary)] tracking-wider">Rate</th>
                  <th className="px-4 py-2 text-right mono text-xs uppercase text-[var(--text-tertiary)] tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.line_items.map((item, index) => (
                  <tr key={index} className="border-b border-[var(--border-main)] last:border-b-0 bg-[var(--bg-base)] hover:bg-[var(--bg-panel)] transition-colors">
                    <td className="px-4 py-2 text-sm">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        {item.hsn_sac && (
                          <p className="mono text-xs text-[var(--accent-cyan)]">HSN/SAC: {item.hsn_sac}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 mono text-sm text-right text-[var(--text-secondary)]">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-2 mono text-sm text-right text-[var(--text-secondary)]">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-4 py-2 mono text-sm text-right font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="crosshair-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-[var(--accent-cyan)]" />
          <h3 className="mono text-xs uppercase tracking-widest text-[var(--text-tertiary)]">Summary</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span className="mono text-sm">{formatCurrency(invoiceData.subtotal)}</span>
          </div>
          
          {(invoiceData.cgst || invoiceData.sgst || invoiceData.igst) && (
            <div className="space-y-1 pt-2 border-t border-[var(--border-main)]">
              {invoiceData.cgst && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">CGST</span>
                  <span className="mono text-sm">{formatCurrency(invoiceData.cgst)}</span>
                </div>
              )}
              {invoiceData.sgst && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">SGST</span>
                  <span className="mono text-sm">{formatCurrency(invoiceData.sgst)}</span>
                </div>
              )}
              {invoiceData.igst && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">IGST</span>
                  <span className="mono text-sm">{formatCurrency(invoiceData.igst)}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between text-base font-semibold pt-3 border-t border-[var(--border-main)]">
            <span>Grand Total</span>
            <span className="mono text-[var(--accent-cyan)]">{formatCurrency(invoiceData.grand_total)}</span>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {(invoiceData.payment_terms || invoiceData.notes) && (
        <div className="border border-[var(--border-main)] bg-[var(--bg-panel)] p-4">
          <div className="space-y-3">
            {invoiceData.payment_terms && (
              <div>
                <p className="mono text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Payment Terms</p>
                <p className="text-sm">{invoiceData.payment_terms}</p>
              </div>
            )}
            {invoiceData.notes && (
              <div>
                <p className="mono text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-1">Notes</p>
                <p className="text-sm text-[var(--text-secondary)]">{invoiceData.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
