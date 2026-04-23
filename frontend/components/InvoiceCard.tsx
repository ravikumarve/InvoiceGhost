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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with confidence badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              {invoiceData.invoice_number || 'Invoice'}
            </h2>
            <p className="text-sm text-zinc-400">
              {formatDate(invoiceData.invoice_date)}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-800 ${confidenceColor}`}>
          <ConfidenceIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {confidenceLabel} ({Math.round(invoiceData.confidence_score * 100)}%)
          </span>
        </div>
      </div>

      {/* Vendor and Buyer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor */}
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
          <div className="flex items-center space-x-2 mb-3">
            <Building className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-zinc-100">Vendor</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-100">{invoiceData.vendor_name || 'N/A'}</p>
            {invoiceData.vendor_gstin && (
              <p className="text-xs text-zinc-400">GSTIN: {invoiceData.vendor_gstin}</p>
            )}
            {invoiceData.vendor_address && (
              <p className="text-xs text-zinc-400">{invoiceData.vendor_address}</p>
            )}
          </div>
        </div>

        {/* Buyer */}
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-zinc-100">Buyer</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-zinc-100">{invoiceData.buyer_name || 'N/A'}</p>
            {invoiceData.buyer_gstin && (
              <p className="text-xs text-zinc-400">GSTIN: {invoiceData.buyer_gstin}</p>
            )}
            {invoiceData.buyer_address && (
              <p className="text-xs text-zinc-400">{invoiceData.buyer_address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      {invoiceData.line_items && invoiceData.line_items.length > 0 && (
        <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900/50">
          <div className="px-4 py-3 border-b border-zinc-700 bg-zinc-800/50">
            <h3 className="text-sm font-semibold text-zinc-100">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="px-4 py-2 text-left text-xs font-medium text-zinc-400">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-400">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-400">Rate</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-zinc-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.line_items.map((item, index) => (
                  <tr key={index} className="border-b border-zinc-700 last:border-b-0">
                    <td className="px-4 py-2 text-sm text-zinc-100">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        {item.hsn_sac && (
                          <p className="text-xs text-zinc-400">HSN/SAC: {item.hsn_sac}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-zinc-100 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-2 text-sm text-zinc-100 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-4 py-2 text-sm text-zinc-100 text-right font-medium">
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
      <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-zinc-100">Summary</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span className="text-zinc-100">{formatCurrency(invoiceData.subtotal)}</span>
          </div>
          
          {(invoiceData.cgst || invoiceData.sgst || invoiceData.igst) && (
            <div className="space-y-1 pt-2 border-t border-zinc-700">
              {invoiceData.cgst && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">CGST</span>
                  <span className="text-zinc-100">{formatCurrency(invoiceData.cgst)}</span>
                </div>
              )}
              {invoiceData.sgst && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">SGST</span>
                  <span className="text-zinc-100">{formatCurrency(invoiceData.sgst)}</span>
                </div>
              )}
              {invoiceData.igst && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">IGST</span>
                  <span className="text-zinc-100">{formatCurrency(invoiceData.igst)}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between text-base font-semibold pt-3 border-t border-zinc-700">
            <span className="text-zinc-100">Grand Total</span>
            <span className="text-amber-500">{formatCurrency(invoiceData.grand_total)}</span>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {(invoiceData.payment_terms || invoiceData.notes) && (
        <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/50">
          <div className="space-y-3">
            {invoiceData.payment_terms && (
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1">Payment Terms</p>
                <p className="text-sm text-zinc-100">{invoiceData.payment_terms}</p>
              </div>
            )}
            {invoiceData.notes && (
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-1">Notes</p>
                <p className="text-sm text-zinc-100">{invoiceData.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}