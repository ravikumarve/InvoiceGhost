import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/landing/Footer';
import { GitCommit, Shield, Zap, Bug, Wrench, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Changelog — InvoiceGhost',
  description: 'Version history, feature releases, security patches, and improvements for InvoiceGhost.',
};

type ChangeType = 'feature' | 'security' | 'fix' | 'improvement';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: { type: ChangeType; description: string }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2026-06-16',
    title: 'Production Hardening & Automation',
    changes: [
      { type: 'feature', description: 'CI/CD pipeline — CI (pytest + mypy + build), Deploy (Render + Vercel), Dependency Review (security scan)' },
      { type: 'feature', description: 'Workspace 3-Zone HUD — upload panel, pipeline visual (UPLOAD → EXTRACT → EXPORT), format strip' },
      { type: 'feature', description: 'Local extraction history — localStorage persistence, click-to-reload, confidence color coding, INR formatting' },
      { type: 'feature', description: 'Per-route error boundaries — PARSE_ERR (/workspace), RENDER_ERR (/result), BATCH_ERR (/batch)' },
      { type: 'security', description: 'Content-Security-Policy + Permissions-Policy security headers in vercel.json' },
      { type: 'security', description: 'UploadZone — client-side 10MB validation, filename sanitization (HTML char stripping)' },
      { type: 'security', description: 'Batch CSV export — combined master CSV with CSV injection protection' },
      { type: 'fix', description: 'ESLint configured — .eslintrc.json with next/core-web-vitals (0 errors, warnings only)' },
      { type: 'fix', description: 'Backend .env created — LICENSE_KEY_HMAC_SECRET generated, API key placeholders' },
      { type: 'fix', description: 'Venv recreated — fixed broken pip shebangs from project relocation' },
      { type: 'fix', description: 'Missing __init__.py added — fixed mypy module resolution in routers/services/models' },
      { type: 'fix', description: 'render.yaml moved to root with corrected dockerfilePath: ./backend/Dockerfile' },
      { type: 'improvement', description: 'GitHub issue templates — bug report + feature request + PR template with security checklist' },
      { type: 'improvement', description: 'robots.txt + sitemap.xml — all 7 public routes indexed, /api/ disallowed' },
      { type: 'improvement', description: 'Custom SVG favicon — cyan square logo matching design system' },
      { type: 'improvement', description: 'MIT License added' },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-06-14',
    title: '8-Page SaaS Rebuild',
    changes: [
      { type: 'feature', description: 'Full Landing 2 design system — cyan/green/alert-red accents, JetBrains Mono + Inter fonts, sharp corners, crosshair panels, meta-bars' },
      { type: 'feature', description: 'Route restructure: Landing → /, Workspace → /workspace, /result stays' },
      { type: 'feature', description: 'New /pricing page — dedicated pricing with FAQ, Gumroad CTA, feature comparison' },
      { type: 'feature', description: 'New /docs page — full API documentation with endpoint reference, data model tables, rate limits, security headers' },
      { type: 'feature', description: 'New /privacy page — comprehensive privacy policy with 6 sections, third-party table, technical security measures' },
      { type: 'feature', description: 'New /batch page — multi-file upload with license key gate, drag-and-drop, sequential processing, combined CSV export' },
      { type: 'feature', description: 'New /changelog page — version history and release notes' },
      { type: 'feature', description: '8-page navigation with mobile hamburger menu' },
      { type: 'feature', description: 'API proxy in next.config.js — /api/* rewrites to backend URL' },
      { type: 'improvement', description: 'getConfidenceColor() now uses CSS variables instead of hardcoded Tailwind classes' },
      { type: 'improvement', description: 'api.ts uses relative URLs via Next.js rewrites instead of absolute backend URL' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-14',
    title: 'Frontend Landing 2 Design System',
    changes: [
      { type: 'feature', description: 'CSS variable system: --bg-base, --bg-panel, --accent-cyan, --accent-green, --accent-alert, --accent-amber' },
      { type: 'feature', description: 'Crosshair panel component with cyan corner brackets (4 pseudo-elements)' },
      { type: 'feature', description: 'Meta-bar component for mono uppercase footer strips' },
      { type: 'feature', description: 'Technical button system: .btn-tech, .btn-primary-tech, .btn-outline-tech' },
      { type: 'feature', description: 'CSS-only animations: .animate-cyan-pulse, .animate-scan-line' },
      { type: 'feature', description: 'Landing page components: Hero, Marquee, ProblemSolution, Features, ApiReference, Security, Pricing, Footer' },
      { type: 'improvement', description: 'Removed Playfair Display font — JetBrains Mono + Inter only' },
      { type: 'improvement', description: 'Global border-radius: 0px — sharp corners throughout' },
      { type: 'improvement', description: '40px grid overlay on body background for technical aesthetic' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-13',
    title: 'Backend Core Hardening',
    changes: [
      { type: 'security', description: 'Single rate limiter in main.py + SlowAPIMiddleware — removed 3 duplicate Limiter() instances' },
      { type: 'security', description: 'CSV injection protection — sanitize_csv_field() prefixes dangerous chars (=, +, -, @) with single quote' },
      { type: 'security', description: 'Magic bytes validation — PDF: %PDF-, PNG: \\x89PNG, JPG: \\xff\\xd8\\xff to prevent MIME spoofing' },
      { type: 'security', description: 'Constant-time HMAC comparison — validate_key.py uses hmac.compare_digest() instead of string equality' },
      { type: 'security', description: 'Strict MIME matching — exact set matching replaces wildcard prefix match' },
      { type: 'security', description: 'Request size limit — max_request_size=11MB at FastAPI level' },
      { type: 'security', description: 'XSS-Protection header changed to 0 (modern best practice, let CSP handle it)' },
      { type: 'fix', description: 'API key initialization — extractor.py now passes GEMINI_API_KEY and GROQ_API_KEY from env vars (was api_key=None)' },
      { type: 'fix', description: 'JSON repair pipeline — _repair_json() handles trailing commas, single quotes, NaN/Infinity, markdown fences, missing braces' },
      { type: 'improvement', description: 'Model updates: Gemini gemini-1.5-flash → gemini-2.0-flash, Groq llava-v1.5-7b → llama-3.2-90b-vision-preview' },
      { type: 'improvement', description: 'InvoiceData model: confidence_score clamped 0.0-1.0, line_items min_length=1, monetary ge=0, GSTIN normalization' },
      { type: 'improvement', description: 'Test suite: 56/56 passing (was 40/57) — conftest.py with TESTING=1 env var bypasses rate limiter' },
      { type: 'fix', description: 'pdf_handler.py: validate_pdf_header() + shutil.rmtree cleanup in finally blocks' },
      { type: 'fix', description: 'export.py: sanitize_filename() + RFC 5987 Content-Disposition for non-ASCII filenames' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-06-12',
    title: 'Initial Release',
    changes: [
      { type: 'feature', description: 'POST /api/parse — upload PDF/image, get structured InvoiceData JSON' },
      { type: 'feature', description: 'POST /api/export/csv — convert InvoiceData to downloadable CSV' },
      { type: 'feature', description: 'POST /api/validate-key — HMAC license key validation for Batch Mode' },
      { type: 'feature', description: 'Gemini Flash primary + Groq fallback extraction pipeline' },
      { type: 'feature', description: 'Next.js 14 frontend with UploadZone, InvoiceCard, ExportBar, GumroadBadge' },
      { type: 'feature', description: 'Dark mode UI with amber accent theme' },
      { type: 'feature', description: 'sessionStorage for parsed data, localStorage for license keys' },
      { type: 'feature', description: 'Dockerfile for Render deployment' },
    ],
  },
];

const typeConfig: Record<ChangeType, { icon: typeof Zap; label: string; color: string }> = {
  feature: { icon: Zap, label: 'FEAT', color: 'text-[var(--accent-cyan)]' },
  security: { icon: Shield, label: 'SEC', color: 'text-[var(--accent-green)]' },
  fix: { icon: Bug, label: 'FIX', color: 'text-[var(--accent-alert)]' },
  improvement: { icon: Wrench, label: 'IMPR', color: 'text-[var(--accent-amber)]' },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 px-6 md:px-8 py-16 md:py-24">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-block px-3 py-1 border border-[var(--border-main)] text-[var(--text-secondary)] mono text-xs uppercase mb-6 bg-[var(--bg-panel)]">
              Version History
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1] tracking-tight mb-4">
              Changelog
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-[600px]">
              Every release, every fix, every security patch. Full transparency on what changed and why.
            </p>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-12 flex-wrap">
            {Object.entries(typeConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`mono text-xs ${config.color}`}>{config.label}</span>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="space-y-12">
            {changelog.map((entry, i) => (
              <section key={i} className="relative">
                {/* Version Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 border border-[var(--accent-cyan)] flex items-center justify-center flex-shrink-0">
                    <GitCommit className="w-5 h-5 text-[var(--accent-cyan)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">v{entry.version}</h2>
                      <span className="mono text-xs text-[var(--text-tertiary)]">{entry.date}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{entry.title}</p>
                  </div>
                </div>

                {/* Changes */}
                <div className="ml-14 border-l border-[var(--border-main)] pl-6 space-y-0">
                  {entry.changes.map((change, j) => {
                    const config = typeConfig[change.type];
                    const Icon = config.icon;
                    return (
                      <div key={j} className="py-3 border-b border-[var(--border-main)] last:border-b-0 flex items-start gap-3">
                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                          <span className={`mono text-[10px] ${config.color}`}>{config.label}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{change.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Future CTA */}
          <div className="mt-16 crosshair-panel p-6 bg-[var(--bg-panel)]">
            <div className="flex items-start gap-4">
              <ArrowRight className="w-5 h-5 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="mono text-sm font-semibold mb-2">What's Next</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Deploy backend to Render, frontend to Vercel. Add CSP headers and input sanitization. 
                  Monitor the <a href="https://github.com/ravikumarve/InvoiceGhost" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline">GitHub repo</a> for the latest commits.
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
