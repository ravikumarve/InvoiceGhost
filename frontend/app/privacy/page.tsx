import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/landing/Footer';
import { Shield, Eye, Trash2, Lock, Server, Clock, FileText, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — InvoiceGhost',
  description: 'InvoiceGhost privacy policy. Zero data retention, no cookies, no tracking, EXIF stripping, HMAC license validation.',
};

const sections = [
  {
    icon: Eye,
    title: 'Data Collection',
    status: 'NONE',
    statusColor: 'text-[var(--accent-green)]',
    content: [
      'InvoiceGhost does not collect, store, or transmit any personal data.',
      'No user accounts, no email addresses, no passwords.',
      'No cookies are set. No tracking scripts (Google Analytics, Meta Pixel, etc.) are loaded.',
      'No database exists. The backend is entirely stateless.',
      'IP addresses are used solely for rate limiting (10 requests/min) and are never logged or persisted.',
    ],
  },
  {
    icon: FileText,
    title: 'File Processing',
    status: 'EPHEMERAL',
    statusColor: 'text-[var(--accent-cyan)]',
    content: [
      'Uploaded files (PDF, PNG, JPG, WEBP) are processed entirely in memory or temporary storage.',
      'Temporary files are deleted in strict `finally` blocks using `shutil.rmtree()` — guaranteed cleanup even on exceptions.',
      'File contents are never logged. Server logs contain only metadata: file extension, size, and processing time.',
      'Files are sent to Google Gemini API or Groq API for AI extraction. These third-party services have their own privacy policies.',
      'No file data is cached, queued, or persisted between requests.',
    ],
  },
  {
    icon: Trash2,
    title: 'EXIF Data Handling',
    status: 'STRIPPED',
    statusColor: 'text-[var(--accent-green)]',
    content: [
      'All embedded image metadata (GPS coordinates, camera model, timestamps, device info) is aggressively stripped before transmission to external AI APIs.',
      'This prevents accidental leakage of location data or device fingerprints through uploaded receipt photos.',
      'EXIF stripping occurs server-side before any API call is made.',
    ],
  },
  {
    icon: Lock,
    title: 'License Key Validation',
    status: 'LOCAL-ONLY',
    statusColor: 'text-[var(--accent-cyan)]',
    content: [
      'Batch Mode license keys (purchased via Gumroad) are validated locally using HMAC-SHA256.',
      'The server computes `HMAC-SHA256(secret, license_key)` and compares against pre-computed hashes using `hmac.compare_digest()` — constant-time comparison prevents timing side-channel attacks.',
      'License keys are never sent to external APIs for validation.',
      'Keys are stored in the user\'s browser `localStorage` only. InvoiceGhost servers never store keys.',
      'Key length must be 20-256 characters. Keys shorter than 20 characters are rejected immediately.',
    ],
  },
  {
    icon: Server,
    title: 'Infrastructure',
    status: 'MINIMAL',
    statusColor: 'text-[var(--accent-amber)]',
    content: [
      'Backend: Deployed on Render (free tier). Render\'s privacy policy applies to infrastructure-level logging.',
      'Frontend: Deployed on Vercel. Vercel\'s privacy policy applies to CDN-level access logs.',
      'No custom analytics, no error tracking services (Sentry, etc.), no APM tools are integrated.',
      'The only external API calls are to Google Gemini and Groq for AI extraction.',
    ],
  },
  {
    icon: Clock,
    title: 'Data Retention',
    status: 'ZERO',
    statusColor: 'text-[var(--accent-green)]',
    content: [
      'No data is retained after processing completes. This is enforced at the code level, not just policy level.',
      'Session data (parsed invoice JSON) is stored in `sessionStorage` in the user\'s browser — cleared when the tab closes.',
      'License keys are stored in `localStorage` — users can clear this at any time via browser settings.',
      'No server-side session state exists. Each request is independent.',
    ],
  },
];

const thirdParties = [
  {
    name: 'Google Gemini API',
    purpose: 'Primary AI model for invoice extraction',
    dataSent: 'Invoice image/PDF content',
    policy: 'https://ai.google.dev/terms',
    retention: 'Google\'s API data usage policies apply',
  },
  {
    name: 'Groq API',
    purpose: 'Fallback AI model when Gemini fails',
    dataSent: 'Invoice image/PDF content',
    policy: 'https://groq.com/terms/',
    retention: 'Groq\'s API data usage policies apply',
  },
  {
    name: 'Gumroad',
    purpose: 'Payment processing for Batch Mode license',
    dataSent: 'Email, payment info (handled entirely by Gumroad)',
    policy: 'https://gumroad.com/privacy',
    retention: 'Gumroad handles all payment data — InvoiceGhost never sees it',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-block px-3 py-1 border border-[var(--accent-green)] text-[var(--accent-green)] mono text-xs uppercase mb-6 bg-[rgba(0,255,102,0.05)]">
              Privacy-First Architecture
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-[600px]">
              InvoiceGhost is built on a simple premise: your financial documents are nobody else's business. This policy is enforced in code, not just words.
            </p>
            <div className="mono text-xs text-[var(--text-tertiary)] mt-4">
              Last updated: June 14, 2026 · Effective: June 13, 2026
            </div>
          </div>

          {/* Core Promise */}
          <div className="crosshair-panel p-6 mb-16 bg-[var(--bg-panel)]">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-[var(--accent-green)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="mono text-sm font-semibold text-[var(--accent-green)] mb-2">CORE PROMISE</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  InvoiceGhost does not collect, store, log, or transmit any personal data. No database exists. No cookies are set. No tracking scripts are loaded. Files are processed in memory and deleted immediately. This is enforced at the code level with <code className="mono text-[var(--accent-cyan)]">finally</code> blocks and <code className="mono text-[var(--accent-cyan)]">shutil.rmtree()</code> cleanup — not just policy.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <section key={i} className="border-b border-[var(--border-main)] pb-8 last:border-b-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 border border-[var(--border-main)] flex items-center justify-center text-[var(--text-secondary)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                      <span className={`mono text-xs ${section.statusColor}`}>[{section.status}]</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 ml-12">
                    {section.content.map((item, j) => (
                      <li key={j} className="text-sm text-[var(--text-secondary)] leading-relaxed flex gap-2.5">
                        <span className="mono text-[var(--accent-cyan)] flex-shrink-0">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          {/* Third-Party Services */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-2">Third-Party Services</h2>
            <p className="text-[var(--text-secondary)] mb-8 text-sm">
              InvoiceGhost makes API calls to these external services. Their privacy policies govern data sent to them.
            </p>

            <div className="crosshair-panel">
              <div className="meta-bar">
                <span>EXTERNAL DEPENDENCIES</span>
                <span>3 SERVICES</span>
              </div>
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-main)]">
                      <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Service</th>
                      <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Purpose</th>
                      <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Data Sent</th>
                      <th className="mono text-xs uppercase text-left py-2 text-[var(--text-secondary)]">Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thirdParties.map((tp, j) => (
                      <tr key={j} className="border-b border-[var(--border-main)] last:border-b-0">
                        <td className="mono text-sm py-3">
                          <a href={tp.policy} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline">
                            {tp.name}
                          </a>
                        </td>
                        <td className="text-sm py-3 text-[var(--text-secondary)]">{tp.purpose}</td>
                        <td className="mono text-xs py-3 text-[var(--accent-amber)]">{tp.dataSent}</td>
                        <td className="text-xs py-3 text-[var(--text-secondary)]">{tp.retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Security Measures */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-8">Technical Security Measures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Magic Bytes Validation', desc: 'File content is checked against known magic bytes (PDF: %PDF-, PNG: \\x89PNG, JPG: \\xff\\xd8\\xff) to prevent MIME spoofing attacks.' },
                { title: 'CSV Injection Protection', desc: 'Dangerous characters (=, +, -, @) in CSV output are prefixed with single quote to force text interpretation in spreadsheets.' },
                { title: 'Constant-Time HMAC', desc: 'License key validation uses hmac.compare_digest() to prevent timing side-channel attacks on the HMAC comparison.' },
                { title: 'Strict MIME Matching', desc: 'Exact MIME type set matching replaces wildcard prefix matching. application/pdf must match exactly, not just start with application/.' },
                { title: 'Request Size Limit', desc: 'Max request body size of 11MB enforced at the FastAPI application level, before any file processing begins.' },
                { title: 'Rate Limiting', desc: '10 requests per minute per IP address using SlowAPI middleware. Prevents abuse and brute-force license key attacks.' },
              ].map((measure, i) => (
                <div key={i} className="crosshair-panel p-5 bg-[var(--bg-panel)]">
                  <h4 className="mono text-sm font-semibold mb-2 text-[var(--accent-cyan)]">{measure.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{measure.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Your Rights */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-8">Your Rights</h2>
            <div className="crosshair-panel p-6 bg-[var(--bg-panel)]">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Because InvoiceGhost collects no data, there is no data to access, modify, or delete. However:
              </p>
              <ul className="space-y-2.5">
                {[
                  'To clear your license key: Open browser DevTools → Application → Local Storage → Delete "invoiceghost_license" key.',
                  'To clear parsed invoice data: Close the browser tab (sessionStorage is cleared automatically).',
                  'To request information about data sent to Google/Groq: Contact those services directly per their privacy policies.',
                  'To report a privacy concern: Open an issue on GitHub or email the developer.',
                ].map((item, i) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2.5">
                    <span className="mono text-[var(--accent-cyan)] flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Changes */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-4">Policy Changes</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              If this policy changes, the "Last updated" date at the top will be revised. Significant changes will be noted in the <a href="/changelog" className="text-[var(--accent-cyan)] hover:underline">Changelog</a>. Continued use after changes constitutes acceptance.
            </p>
          </div>

          {/* Contact */}
          <div className="mt-16 crosshair-panel p-6 bg-[var(--bg-panel)]">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-[var(--accent-amber)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="mono text-sm font-semibold mb-2">Questions or Concerns</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Open an issue on <a href="https://github.com/ravikumarve/InvoiceGhost" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline">GitHub</a> or contact the developer directly. This is a solo-developer project — responses may take 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
