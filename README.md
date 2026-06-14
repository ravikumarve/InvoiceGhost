# InvoiceGhost

<div align="center">

**Drop an invoice. Get clean data. No accounts, no storage, no drama.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Tests-56%2F56_passing-brightgreen.svg)](./backend/tests)
[![Security](https://img.shields.io/badge/Security-Hardened-green.svg)](./AGENTS.md)
[![Gumroad](https://img.shields.io/badge/Batch_Mode-$19-orange.svg)](https://gumroad.com/l/invoiceghost)

</div>

---

## The Problem

Every Indian freelancer and small agency has a pile of vendor invoices that need to be manually keyed into spreadsheets, Tally, or accounting tools. GST numbers, HSN/SAC codes, CGST/SGST splits — it's tedious, error-prone work.

InvoiceGhost solves it in one drag-and-drop. Upload a PDF or image invoice, get a fully structured JSON response with every field extracted, and export to CSV in one click. No account. No storage. The file is deleted the moment processing completes.

**Works with:** Standard GST invoices, non-GST receipts, foreign currency invoices, handwritten receipts (with reduced confidence), scanned documents.

---

## Features

### Extraction
- AI-powered parsing via **Gemini 2.0 Flash** (primary) with **Groq Llama 3.2 90B Vision** as automatic fallback
- Full GST invoice support — GSTIN, HSN/SAC codes, CGST/SGST/IGST line-level breakdown
- Mixed-language invoice handling (English headers + Hindi descriptions common in India)
- Per-extraction `confidence_score` (0.0–1.0) — low-confidence results flagged for manual review
- PDF and image support: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`
- JSON repair pipeline — handles trailing commas, single quotes, NaN values, markdown fences from AI output

### Privacy & Security
- **Zero data retention** — files processed in memory, deleted in `finally` block, never written to disk beyond temp
- **EXIF metadata stripped** from images before sending to any external API
- **Magic bytes validation** — prevents MIME spoofing (a file claiming to be PDF but actually an executable is rejected)
- **CSV injection protection** — dangerous formula prefixes (`=`, `+`, `-`, `@`) are neutralized in CSV export
- **Constant-time HMAC** for license key validation — prevents timing side-channel attacks
- **Rate limiting** — 10 req/min per IP via SlowAPI middleware
- **Request size limit** — 11MB hard cap at framework level
- **Security headers** — CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy
- No account, no email, no tracking

### Export
- CSV export with full line items + tax summary rows
- Copy raw JSON in one click
- Filename auto-generated from invoice number (sanitized against path traversal)
- RFC 5987 encoded `Content-Disposition` for proper browser compatibility

### Developer
- Processing time exposed in `X-Processing-Time-Ms` response header
- Unique `X-Request-ID` per request for tracing
- Interactive FastAPI docs at `/docs`
- 56 passing pytest tests covering parse, export, security, and edge cases

---

## Architecture

```text
┌──────────────────┐     ┌─────────────────────────┐     ┌──────────────────┐
│   Next.js 14      │     │   FastAPI Backend         │     │   AI Layer       │
│   Frontend        │     │                           │     │                  │
│                   │POST │  /api/parse               │     │  Gemini 2.0      │
│   UploadZone  ────│────►│  ├─ Validate extension    │────►│  Flash (primary) │
│   InvoiceCard     │     │  ├─ Validate MIME type    │     │                  │
│   ExportBar       │◄────│  ├─ Validate magic bytes   │fail │  Llama 3.2      │
│   GumroadBadge    │JSON │  ├─ Strip EXIF metadata    │────►│  90B Vision      │
│                   │     │  ├─ PDF → image (300 DPI)  │     │  (fallback)      │
│                   │POST │  └─ Call extractor         │     └──────────────────┘
│   CSV download ◄──│─────│                           │
│                   │     │  /api/export/csv          │
│                   │POST │  ├─ Sanitize CSV injection │
│   Batch unlock ◄──│─────│  └─ Generate CSV download  │
│                   │     │                           │
│                   │POST │  /api/validate-key        │
│                   │────►│  └─ HMAC constant-time     │
└──────────────────┘     └─────────────────────────┘
```

---

## Data Model

Every parse returns a validated `InvoiceData` object:

```python
class InvoiceData(BaseModel):
    invoice_number:   Optional[str]
    invoice_date:     Optional[str]      # ISO 8601
    due_date:         Optional[str]
    vendor_name:      Optional[str]
    vendor_gstin:     Optional[str]      # 15-char Indian GST number
    vendor_address:   Optional[str]
    buyer_name:       Optional[str]
    buyer_gstin:      Optional[str]
    buyer_address:    Optional[str]
    line_items:       List[LineItem]     # min 1 item required
    subtotal:         Optional[float]    # ge=0
    cgst:             Optional[float]    # ge=0
    sgst:             Optional[float]    # ge=0
    igst:             Optional[float]    # ge=0
    total_tax:        Optional[float]    # ge=0
    grand_total:      Optional[float]    # ge=0
    currency:         str = "INR"
    payment_terms:    Optional[str]
    notes:            Optional[str]
    confidence_score: float               # 0.0–1.0, clamped by validator

class LineItem(BaseModel):
    description: str                      # required, min_length=1
    hsn_sac:     Optional[str]            # HSN/SAC code for GST compliance
    quantity:    Optional[float]          # ge=0
    unit:        Optional[str]
    rate:        Optional[float]          # ge=0
    amount:      Optional[float]          # ge=0
    tax_rate:    Optional[float]          # ge=0, le=100
```

Confidence score interpretation:
- `>= 0.8` — High confidence. Safe to use directly.
- `0.5–0.8` — Review recommended. Check key figures.
- `< 0.5` — Low confidence. Manual verification advised (blurry scan, handwritten, unusual format).

---

## Quick Start

```bash
# Clone
git clone https://github.com/ravikumarve/invoiceghost.git
cd invoiceghost

# Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY and GROQ_API_KEY to .env
# Generate HMAC secret: openssl rand -hex 32
uvicorn main:app --reload

# Frontend (separate terminal)
cd ../frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:3000` — drag in an invoice, see structured data.

---

## Configuration

### Backend (`.env`)

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | required | Google Gemini API key — primary extraction model |
| `GROQ_API_KEY` | optional | Groq API key — automatic fallback on Gemini failure |
| `MAX_FILE_SIZE_MB` | `10` | Maximum upload size |
| `ALLOWED_EXTENSIONS` | `pdf,png,jpg,jpeg,webp` | Accepted file types |
| `RATE_LIMIT_PER_MINUTE` | `10` | Per-IP rate limit |
| `LICENSE_KEY_HMAC_SECRET` | required | Generate: `openssl rand -hex 32` |
| `VALID_LICENSE_HASHES` | optional | Comma-separated HMAC hashes of valid license keys |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |
| `ENVIRONMENT` | — | Set to `production` to enable HSTS header |

### Frontend (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL (localhost or Render) |
| `NEXT_PUBLIC_GUMROAD_URL` | Gumroad product URL for batch mode CTA |

---

## API Reference

### `POST /api/parse`

Upload and parse an invoice file.

**Request:** `multipart/form-data` with `file` field.

**Response:** `InvoiceData` JSON.

**Headers returned:** `X-Processing-Time-Ms`, `X-Request-ID`

**Error responses:**
```json
{ "error": "unsupported_format",  "message": "Only PDF, PNG, JPG, WEBP accepted" }
{ "error": "unsupported_format",  "message": "File content does not match the claimed format" }
{ "error": "file_too_large",      "message": "Max file size is 10MB" }
{ "error": "extraction_failed",   "message": "Could not parse invoice. Try a clearer scan." }
```

---

### `POST /api/export/csv`

Convert `InvoiceData` JSON to a downloadable CSV.

**Request body:** `{ "invoice_data": InvoiceData }`

**Response:** CSV file download with `Content-Disposition: attachment`.

**Filename:** `invoice_{sanitized_invoice_number}.csv`

**CSV structure:**
```csv
Description, HSN/SAC, Qty, Unit, Rate, Amount, Tax Rate
... line items ...
,,,, Subtotal, ₹{subtotal},
,,,, CGST,     ₹{cgst},
,,,, SGST,     ₹{sgst},
,,,, Grand Total, ₹{grand_total},
```

---

### `POST /api/validate-key`

Validate a Gumroad license key for batch mode access.

**Request body:** `{ "license_key": "XXXX-XXXX-XXXX-XXXX" }`

**Response:** `{ "valid": true, "message": "License key is valid" }` or `{ "valid": false, "message": "Invalid license key" }`

Validation is HMAC-SHA256 based with constant-time comparison — entirely local, no external API call, no database write.

---

### `GET /health`

Health check endpoint.

**Response:** `{ "status": "healthy", "service": "InvoiceGhost API", "version": "1.0.0" }`

---

## Batch Mode (Paid)

The free tier handles one file at a time with full feature access. Batch mode unlocks multi-file processing (up to 20 invoices per run) with a combined CSV export.

| Tier | Price | Files per run | License keys |
|---|---|---|---|
| Individual | $19 one-time | 20 | 1 |
| Agency | $49 one-time | 20 | 5 |

Licenses are validated client-side via HMAC. No account, no subscription, no renewal. Key stored in `localStorage` after first validation.

[Get batch mode on Gumroad →](https://gumroad.com/l/invoiceghost)

---

## Project Structure

```
invoiceghost/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, rate limiter, security headers
│   ├── routers/
│   │   ├── parse.py             # POST /api/parse — file validation + extraction
│   │   ├── export.py            # POST /api/export/csv — CSV generation
│   │   └── validate_key.py      # POST /api/validate-key — HMAC license check
│   ├── services/
│   │   ├── extractor.py         # Gemini/Groq extraction, EXIF stripping, JSON repair
│   │   └── pdf_handler.py      # PDF → image via pdf2image (300 DPI)
│   ├── models/
│   │   └── invoice.py           # InvoiceData + LineItem (Pydantic v2, strict validation)
│   ├── prompts/
│   │   └── extraction.txt       # Structured extraction system prompt
│   ├── tests/
│   │   ├── conftest.py          # Shared fixtures, test-mode rate limit bypass
│   │   ├── test_parse.py        # 20 parse endpoint tests
│   │   ├── test_export.py       # 17 export endpoint tests
│   │   ├── test_rate_limiting.py # 19 security/header/error tests
│   │   └── fixtures/            # Sample invoices (PDF + image)
│   ├── Dockerfile               # Docker build with poppler-utils for PDF conversion
│   ├── render.yaml              # Render deployment config (Docker env)
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Landing page (marketing homepage)
│   │   ├── workspace/page.tsx   # Upload + parse tool
│   │   ├── result/page.tsx      # Parsed invoice display + export
│   │   ├── pricing/page.tsx     # Pricing + FAQ
│   │   ├── docs/page.tsx        # API documentation
│   │   ├── privacy/page.tsx     # Privacy policy
│   │   ├── batch/page.tsx       # License-gated multi-file extraction
│   │   ├── changelog/page.tsx   # Version history
│   │   ├── not-found.tsx        # Technical 404
│   │   ├── global-error.tsx     # Global error boundary
│   │   └── layout.tsx           # Root layout (fonts, metadata)
│   ├── components/
│   │   ├── Navigation.tsx       # 8-page nav + mobile hamburger
│   │   ├── UploadZone.tsx       # Drag-drop upload with validation
│   │   ├── InvoiceCard.tsx      # Structured result display (HUD style)
│   │   ├── ExportBar.tsx        # CSV / Copy JSON / Batch CTA
│   │   ├── GumroadBadge.tsx     # Persistent upgrade badge
│   │   └── landing/             # Hero, Marquee, Features, Security, etc.
│   ├── lib/
│   │   └── api.ts               # Backend API client (relative URLs)
│   ├── public/
│   │   ├── favicon.svg          # Custom SVG favicon
│   │   ├── robots.txt           # SEO crawl rules
│   │   └── sitemap.xml          # All 7 public routes
│   ├── vercel.json              # Security headers + env config
│   └── next.config.js           # API proxy rewrites
├── LICENSE
└── README.md
```

---

## Testing

```bash
cd backend
source venv/bin/activate
pytest tests/ -v --tb=short
```

**56 tests** covering:

| Category | Tests | What's verified |
|---|---|---|
| Parse endpoint | 20 | Valid PDF/image parsing, file validation, MIME spoofing rejection, magic bytes check, confidence scores, error handling, processing time header |
| Export endpoint | 17 | CSV generation, injection protection, filename sanitization, tax summaries, IGST-only, special characters, None handling |
| Security & errors | 19 | Security headers (CSP, X-Frame-Options, nosniff), rate limiting, request ID uniqueness, error format consistency, license key validation |

Test fixtures in `tests/fixtures/` include a standard GST invoice, freelance receipt, foreign USD invoice, and a low-quality scan.

---

## Security

InvoiceGhost is built with a security-first mindset for a tool that handles financial documents:

| Protection | Implementation |
|---|---|
| **MIME spoofing** | Magic bytes validation — file header must match claimed extension |
| **CSV injection** | `sanitize_csv_field()` neutralizes `=`, `+`, `-`, `@` prefixes |
| **Path traversal** | Filename sanitization — only alphanumeric, hyphens, underscores |
| **Timing attacks** | `hmac.compare_digest()` for constant-time license key comparison |
| **Oversized uploads** | Chunked reading with 10MB limit + 11MB framework-level cap |
| **EXIF leakage** | All image metadata stripped before external API calls |
| **Rate limiting** | SlowAPI middleware, 10 req/min per IP |
| **CORS** | Restricted to known frontend origins, `POST`/`GET` only |
| **Security headers** | CSP, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy |
| **HSTS** | Enabled in production mode (`ENVIRONMENT=production`) |
| **No data retention** | Temp files deleted in `finally` blocks, `shutil.rmtree` for robust cleanup |
| **No secrets in logs** | File contents and license keys are never logged |

---

## Deployment

### Backend → Render (free tier)

1. Connect your GitHub repo to Render
2. Set root directory to `backend/`
3. Render detects `render.yaml` — uses Docker build (includes `poppler-utils` for PDF conversion)
4. Set environment variables in Render dashboard (see Configuration section above)
5. Health check path: `/health`

### Frontend → Vercel

1. Import the `frontend/` directory to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Set `NEXT_PUBLIC_GUMROAD_URL` to your Gumroad product URL
4. Deploy

---

## Why No Login?

Because every login form is a conversion killer. The people who need this tool — Indian freelancers, small agencies, one-person consultancies — are not going to create an account to parse an invoice. They'll close the tab.

No login means no user table, no password reset flow, no email verification, no JWT refresh tokens, no session management. The codebase is smaller, the attack surface is smaller, and the conversion rate is higher.

Your invoice data is yours. We process it and delete it. That's the entire privacy policy.

---

## Contributing

Contributions welcome in these areas:

- **`backend/prompts/extraction.txt`** — Prompt improvements that increase accuracy on edge cases (handwritten invoices, non-standard layouts, mixed-language documents)
- **`backend/tests/fixtures/`** — Additional real-world invoice samples (anonymized — remove all identifying information before submitting)
- **`backend/services/extractor.py`** — Additional AI provider integrations (Anthropic, Mistral)

Before submitting a PR: run `pytest tests/ -v`, add tests for any new extraction behavior, and ensure all 56 existing tests pass.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built for Indian freelancers drowning in GST paperwork.**

[Get Batch Mode](https://gumroad.com/l/invoiceghost) · [Report Issues](https://github.com/ravikumarve/invoiceghost/issues) · [Interactive API Docs](https://invoiceghost.onrender.com/docs)

</div>
