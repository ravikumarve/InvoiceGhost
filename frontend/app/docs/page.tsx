import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/landing/Footer';
import { Terminal, FileText, Key, Shield, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'API Documentation — InvoiceGhost',
  description: 'Complete API reference for InvoiceGhost invoice extraction endpoints. Parse, export, and validate license keys.',
};

const endpoints = [
  {
    method: 'POST',
    path: '/api/parse',
    description: 'Upload a PDF or image invoice and receive structured JSON data with AI-extracted fields.',
    icon: FileText,
    request: {
      type: 'multipart/form-data',
      fields: [
        { name: 'file', type: 'File', required: true, description: 'PDF, PNG, JPG, JPEG, or WEBP. Max 10MB.' },
      ],
    },
    response: `{
  "invoice_number": "GST-2024-0847",
  "invoice_date": "2024-03-15",
  "due_date": "2024-04-14",
  "vendor_name": "Tata Consultancy Services",
  "vendor_gstin": "27AABCT1332L1ZF",
  "buyer_name": "Acme Corp",
  "buyer_gstin": "29AABCA1234F1ZP",
  "line_items": [
    {
      "description": "Software Development Services",
      "hsn_sac": "998314",
      "quantity": 160,
      "unit": "hours",
      "rate": 2500.00,
      "amount": 400000.00,
      "tax_rate": 18.0
    }
  ],
  "subtotal": 400000.00,
  "cgst": 36000.00,
  "sgst": 36000.00,
  "total_tax": 72000.00,
  "grand_total": 472000.00,
  "currency": "INR",
  "confidence_score": 0.92
}`,
    errors: [
      { code: 'unsupported_format', message: 'Only PDF, PNG, JPG, WEBP accepted', status: 400 },
      { code: 'file_too_large', message: 'Max file size is 10MB', status: 413 },
      { code: 'extraction_failed', message: 'Could not parse invoice. Try a clearer scan.', status: 422 },
    ],
    headers: [
      { name: 'X-Processing-Time-Ms', description: 'Server-side processing time in milliseconds' },
      { name: 'X-Request-ID', description: 'Unique request identifier for debugging' },
    ],
  },
  {
    method: 'POST',
    path: '/api/export/csv',
    description: 'Convert structured invoice data into a downloadable CSV file with tax breakdown rows.',
    icon: Terminal,
    request: {
      type: 'application/json',
      fields: [
        { name: 'invoice_data', type: 'InvoiceData', required: true, description: 'Full InvoiceData JSON object from /api/parse response' },
      ],
    },
    response: `Content-Type: text/csv
Content-Disposition: attachment; filename=invoice_GST-2024-0847.csv

Description,HSN/SAC,Quantity,Unit,Rate,Amount,Tax Rate
Software Development Services,998314,160,hours,2500.00,400000.00,18.0
,,,Subtotal,,400000.00,
,,,CGST (9%),,36000.00,
,,,SGST (9%),,36000.00,
,,,Grand Total,,472000.00`,
    errors: [
      { code: 'validation_error', message: 'Invalid invoice data structure', status: 422 },
    ],
    headers: [
      { name: 'Content-Disposition', description: 'attachment; filename=invoice_{number}.csv' },
    ],
  },
  {
    method: 'POST',
    path: '/api/validate-key',
    description: 'Validate a Gumroad license key for Batch Mode access. Uses HMAC-SHA256 constant-time comparison. No external API calls.',
    icon: Key,
    request: {
      type: 'application/json',
      fields: [
        { name: 'license_key', type: 'string', required: true, description: 'Gumroad license key (20-256 chars)' },
      ],
    },
    response: `{
  "valid": true,
  "tier": "batch"
}`,
    errors: [
      { code: 'invalid_key', message: 'Invalid license key', status: 403 },
      { code: 'missing_key', message: 'License key is required', status: 400 },
      { code: 'key_too_short', message: 'License key must be at least 20 characters', status: 400 },
    ],
    headers: [],
  },
];

const dataModel = {
  invoice: [
    { field: 'invoice_number', type: 'string?', description: 'Invoice/receipt number' },
    { field: 'invoice_date', type: 'string?', description: 'ISO format date preferred' },
    { field: 'due_date', type: 'string?', description: 'Payment due date' },
    { field: 'vendor_name', type: 'string?', description: 'Seller/company name' },
    { field: 'vendor_gstin', type: 'string?', description: '15-char Indian GST number' },
    { field: 'vendor_address', type: 'string?', description: 'Seller address' },
    { field: 'buyer_name', type: 'string?', description: 'Purchaser name' },
    { field: 'buyer_gstin', type: 'string?', description: 'Buyer GST number' },
    { field: 'buyer_address', type: 'string?', description: 'Buyer address' },
    { field: 'line_items', type: 'LineItem[]', description: 'At least 1 item required' },
    { field: 'subtotal', type: 'float?', description: 'Pre-tax total (≥0)' },
    { field: 'cgst', type: 'float?', description: 'Central GST amount' },
    { field: 'sgst', type: 'float?', description: 'State GST amount' },
    { field: 'igst', type: 'float?', description: 'Integrated GST amount' },
    { field: 'total_tax', type: 'float?', description: 'Sum of all taxes' },
    { field: 'grand_total', type: 'float?', description: 'Final amount payable' },
    { field: 'currency', type: 'string', description: 'Default: "INR"' },
    { field: 'payment_terms', type: 'string?', description: 'Net 30, etc.' },
    { field: 'notes', type: 'string?', description: 'Additional notes' },
    { field: 'confidence_score', type: 'float', description: 'AI confidence 0.0-1.0' },
  ],
  lineItem: [
    { field: 'description', type: 'string', description: 'Product/service name (required)' },
    { field: 'hsn_sac', type: 'string?', description: 'HSN/SAC code for GST' },
    { field: 'quantity', type: 'float?', description: 'Quantity (≥0)' },
    { field: 'unit', type: 'string?', description: 'Unit of measurement' },
    { field: 'rate', type: 'float?', description: 'Per-unit price (≥0)' },
    { field: 'amount', type: 'float?', description: 'Line total (≥0)' },
    { field: 'tax_rate', type: 'float?', description: 'Tax percentage (0-100)' },
  ],
};

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-block px-3 py-1 border border-[var(--border-main)] text-[var(--text-secondary)] mono text-xs uppercase mb-6 bg-[var(--bg-panel)]">
              API Reference v1.0
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight mb-4">
              API Documentation
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-[600px]">
              Three endpoints. Zero auth. Full structured extraction. Base URL: <code className="mono text-[var(--accent-cyan)] text-base">https://invoiceghost.onrender.com</code>
            </p>
          </div>

          {/* Quick Reference */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {[
              { icon: FileText, label: 'Parse Invoice', method: 'POST', path: '/api/parse' },
              { icon: Terminal, label: 'Export CSV', method: 'POST', path: '/api/export/csv' },
              { icon: Key, label: 'Validate Key', method: 'POST', path: '/api/validate-key' },
            ].map((ep, i) => (
              <a key={i} href={`#endpoint-${i}`} className="crosshair-panel p-5 bg-[var(--bg-panel)] hover:bg-[rgba(0,240,255,0.03)] transition-colors">
                <ep.icon className="w-5 h-5 text-[var(--accent-cyan)] mb-3" />
                <div className="mono text-xs text-[var(--accent-cyan)] mb-1">{ep.method}</div>
                <div className="mono text-sm font-semibold mb-1">{ep.path}</div>
                <div className="text-xs text-[var(--text-secondary)]">{ep.label}</div>
              </a>
            ))}
          </div>

          {/* Endpoints */}
          <div className="space-y-16">
            {endpoints.map((ep, i) => {
              const Icon = ep.icon;
              return (
                <section key={i} id={`endpoint-${i}`} className="scroll-mt-24">
                  {/* Endpoint Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 border border-[var(--accent-cyan)] flex items-center justify-center text-[var(--accent-cyan)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="mono text-xs px-2 py-1 bg-[var(--accent-cyan)] text-black font-bold">{ep.method}</span>
                        <span className="mono text-lg font-semibold">{ep.path}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{ep.description}</p>
                    </div>
                  </div>

                  {/* Request */}
                  <div className="crosshair-panel mb-6">
                    <div className="meta-bar">
                      <span>REQUEST</span>
                      <span>Content-Type: {ep.request.type}</span>
                    </div>
                    <div className="p-5">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border-main)]">
                            <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Field</th>
                            <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Type</th>
                            <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Required</th>
                            <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.request.fields.map((field, j) => (
                            <tr key={j} className="border-b border-[var(--border-main)] last:border-b-0">
                              <td className="mono text-sm py-2.5 text-[var(--accent-cyan)]">{field.name}</td>
                              <td className="mono text-sm py-2.5 text-[var(--text-secondary)]">{field.type}</td>
                              <td className="mono text-sm py-2.5">{field.required ? <span className="text-[var(--accent-green)]">YES</span> : <span className="text-[var(--text-tertiary)]">NO</span>}</td>
                              <td className="text-sm py-2.5 text-[var(--text-secondary)]">{field.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Response */}
                  <div className="crosshair-panel mb-6">
                    <div className="meta-bar">
                      <span>RESPONSE 200</span>
                      <span>application/json</span>
                    </div>
                    <pre className="p-5 overflow-x-auto mono text-xs leading-relaxed text-[var(--text-secondary)]">
                      {ep.response}
                    </pre>
                  </div>

                  {/* Error Responses */}
                  {ep.errors.length > 0 && (
                    <div className="crosshair-panel mb-6">
                      <div className="meta-bar">
                        <span>ERROR RESPONSES</span>
                      </div>
                      <div className="p-5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--border-main)]">
                              <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Error Code</th>
                              <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Message</th>
                              <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ep.errors.map((err, j) => (
                              <tr key={j} className="border-b border-[var(--border-main)] last:border-b-0">
                                <td className="mono text-sm py-2.5 text-[var(--accent-alert)]">{err.code}</td>
                                <td className="text-sm py-2.5 text-[var(--text-secondary)]">{err.message}</td>
                                <td className="mono text-sm py-2.5 text-[var(--accent-amber)]">{err.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Response Headers */}
                  {ep.headers.length > 0 && (
                    <div className="crosshair-panel">
                      <div className="meta-bar">
                        <span>RESPONSE HEADERS</span>
                      </div>
                      <div className="p-5">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--border-main)]">
                              <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Header</th>
                              <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ep.headers.map((h, j) => (
                              <tr key={j} className="border-b border-[var(--border-main)] last:border-b-0">
                                <td className="mono text-sm py-2.5 text-[var(--accent-cyan)]">{h.name}</td>
                                <td className="text-sm py-2.5 text-[var(--text-secondary)]">{h.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Data Model */}
          <div className="mt-20">
            <h2 className="text-2xl font-semibold mb-2">Data Model</h2>
            <p className="text-[var(--text-secondary)] mb-8">Pydantic-validated schemas with <code className="mono text-[var(--accent-cyan)]">extra="ignore"</code> to handle AI output gracefully.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* InvoiceData */}
              <div className="crosshair-panel">
                <div className="meta-bar">
                  <span>InvoiceData</span>
                  <span>20 fields</span>
                </div>
                <div className="p-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-main)]">
                        <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Field</th>
                        <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Type</th>
                        <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataModel.invoice.map((field, j) => (
                        <tr key={j} className="border-b border-[var(--border-main)] last:border-b-0">
                          <td className="mono text-xs py-2 text-[var(--accent-cyan)]">{field.field}</td>
                          <td className="mono text-xs py-2 text-[var(--accent-amber)]">{field.type}</td>
                          <td className="text-xs py-2 text-[var(--text-secondary)]">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LineItem */}
              <div className="crosshair-panel">
                <div className="meta-bar">
                  <span>LineItem</span>
                  <span>7 fields</span>
                </div>
                <div className="p-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-main)]">
                        <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Field</th>
                        <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Type</th>
                        <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataModel.lineItem.map((field, j) => (
                        <tr key={j} className="border-b border-[var(--border-main)] last:border-b-0">
                          <td className="mono text-xs py-2 text-[var(--accent-cyan)]">{field.field}</td>
                          <td className="mono text-xs py-2 text-[var(--accent-amber)]">{field.type}</td>
                          <td className="text-xs py-2 text-[var(--text-secondary)]">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limits & Security */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="crosshair-panel p-6 bg-[var(--bg-panel)]">
              <Clock className="w-5 h-5 text-[var(--accent-cyan)] mb-3" />
              <h3 className="mono text-sm font-semibold mb-2">Rate Limits</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex gap-2"><span className="text-[var(--accent-cyan)] mono">→</span> 10 requests per minute per IP</li>
                <li className="flex gap-2"><span className="text-[var(--accent-cyan)] mono">→</span> 429 Too Many Requests on exceed</li>
                <li className="flex gap-2"><span className="text-[var(--accent-cyan)] mono">→</span> Max file size: 10MB</li>
                <li className="flex gap-2"><span className="text-[var(--accent-cyan)] mono">→</span> Max request body: 11MB</li>
              </ul>
            </div>
            <div className="crosshair-panel p-6 bg-[var(--bg-panel)]">
              <Shield className="w-5 h-5 text-[var(--accent-green)] mb-3" />
              <h3 className="mono text-sm font-semibold mb-2">Security Headers</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex gap-2"><span className="text-[var(--accent-green)] mono">→</span> X-Content-Type-Options: nosniff</li>
                <li className="flex gap-2"><span className="text-[var(--accent-green)] mono">→</span> X-Frame-Options: DENY</li>
                <li className="flex gap-2"><span className="text-[var(--accent-green)] mono">→</span> X-XSS-Protection: 0 (CSP handles it)</li>
                <li className="flex gap-2"><span className="text-[var(--accent-green)] mono">→</span> Referrer-Policy: strict-origin-when-cross-origin</li>
              </ul>
            </div>
          </div>

          {/* Try It CTA */}
          <div className="mt-16 text-center">
            <a href="/workspace" className="btn-tech btn-primary-tech inline-flex items-center gap-2">
              Try the API
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="mono text-xs text-[var(--text-tertiary)] mt-3">
              Or visit <a href="https://invoiceghost.onrender.com/docs" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline">Swagger UI</a> for interactive testing
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
