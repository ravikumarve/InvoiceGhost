# InvoiceGhost

<div align="center">

![InvoiceGhost Logo](https://via.placeholder.com/200x200/1f2937/f59e0b?text=IG)

**Drop an invoice. Get clean data. No accounts, no storage, no drama.**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/invoiceghost?style=social)](https://github.com/yourusername/invoiceghost)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Tests-18%2F18_passing-brightgreen.svg)](./backend/tests)
[![Status: Active](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com/yourusername/invoiceghost)
[![Gumroad](https://img.shields.io/badge/Gumroad-Batch_Mode_$19-orange.svg)](https://gumroad.com/l/invoiceghost)

</div>

---

## What It Does

Every Indian freelancer and small agency has a pile of vendor invoices that need to be manually keyed into spreadsheets, Tally, or accounting tools. GST numbers, HSN/SAC codes, CGST/SGST splits — it's tedious, error-prone work.

InvoiceGhost solves it in one drag-and-drop. Upload a PDF or image invoice, get a fully structured JSON response with every field extracted, and export to CSV in one click. No account. No storage. The file is deleted the moment processing completes.

**Works with:** Standard GST invoices, non-GST receipts, foreign currency invoices, handwritten receipts (with reduced confidence), scanned documents.

---

## Demo

![InvoiceGhost Demo](https://via.placeholder.com/800x400/1f2937/f59e0b?text=Demo+GIF+Coming+Soon)

---

## Features

**Extraction**
- AI-powered parsing via Gemini Flash (primary) with Groq as automatic fallback
- Full GST invoice support — GSTIN, HSN/SAC codes, CGST/SGST/IGST line-level breakdown
- Mixed-language invoice handling (English headers + Hindi descriptions common in India)
- Per-extraction `confidence_score` (0.0–1.0) — low-confidence results flagged for manual review
- PDF and image support: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`

**Privacy**
- Zero data retention — files processed in memory, deleted in `finally` block, never written to disk beyond temp
- EXIF metadata stripped from images before sending to any external API
- No account, no email, no tracking

**Export**
- CSV export with full line items + tax summary rows
- Copy raw JSON in one click
- Filename auto-generated from invoice number

**Developer**
- Rate limiting via slowapi (10 req/min per IP)
- Processing time exposed in `X-Processing-Time-Ms` response header
- Interactive FastAPI docs at `/docs`
- 18 passing pytest tests covering parse, export, and edge cases

---

## Architecture

```text
+-------------------+        +------------------------+        +------------------+
|   Next.js 14      |        |   FastAPI Backend       |        |   AI Layer       |
|   Frontend        |        |                        |        |                  |
|                   |  POST  |  /api/parse            |        |  Gemini Flash    |
|   UploadZone  ----|------->|  - Validate file       |------->|  (primary)       |
|   InvoiceCard     |        |  - PDF -> image        |        |                  |
|   ExportBar       |<-------|  - Call extractor      |  fail  |  Groq            |
|   GumroadBadge    |  JSON  |  - Return InvoiceData  |------->|  (fallback)      |
|                   |        |                        |        |                  |
|                   |  POST  |  /api/export/csv       |        +------------------+
|   CSV download <--|--------|  - InvoiceData -> CSV  |
|                   |        |                        |
|                   |  POST  |  /api/validate-key     |
|   Batch unlock <--|--------|  - HMAC license check  |
+-------------------+        +------------------------+
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
    line_items:       List[LineItem]
    subtotal:         Optional[float]
    cgst:             Optional[float]
    sgst:             Optional[float]
    igst:             Optional[float]
    total_tax:        Optional[float]
    grand_total:      Optional[float]
    currency:         str = "INR"
    payment_terms:    Optional[str]
    notes:            Optional[str]
    confidence_score: float              # 0.0–1.0

class LineItem(BaseModel):
    description: str
    hsn_sac:     Optional[str]          # HSN/SAC code for GST compliance
    quantity:    Optional[float]
    unit:        Optional[str]
    rate:        Optional[float]
    amount:      Optional[float]
    tax_rate:    Optional[float]
```

Confidence score interpretation:
- `>= 0.8` — High confidence. Safe to use directly.
- `0.5–0.8` — Review recommended. Check key figures.
- `< 0.5` — Low confidence. Manual verification advised (blurry scan, handwritten, unusual format).

---

## Quick Start

```bash
# Clone
git clone https://github.com/yourusername/invoiceghost.git
cd invoiceghost

# Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GEMINI_API_KEY to .env
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

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | required | Google Gemini API key — primary extraction model |
| `GROQ_API_KEY` | optional | Groq API key — automatic fallback on Gemini failure |
| `MAX_FILE_SIZE_MB` | `10` | Maximum upload size |
| `ALLOWED_EXTENSIONS` | `pdf,png,jpg,jpeg,webp` | Accepted file types |
| `RATE_LIMIT_PER_MINUTE` | `10` | Per-IP rate limit |
| `LICENSE_KEY_HMAC_SECRET` | required | Generate: `openssl rand -hex 32` |

Frontend:

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

**Headers returned:** `X-Processing-Time-Ms`

**Error responses:**
```json
{ "error": "unsupported_format",  "message": "Only PDF, PNG, JPG, WEBP accepted" }
{ "error": "file_too_large",      "message": "Max file size is 10MB" }
{ "error": "extraction_failed",   "message": "Could not parse invoice. Try a clearer scan." }
```

---

### `POST /api/export/csv`

Convert `InvoiceData` JSON to a downloadable CSV.

**Request body:** `InvoiceData` JSON object.

**Response:** CSV file download.

**Filename:** `invoice_{invoice_number}.csv`

**CSV structure:**
```
Description, HSN/SAC, Qty, Unit, Rate, Amount, Tax Rate
... line items ...
,,,, Subtotal, {subtotal},
,,,, CGST,     {cgst},
,,,, SGST,     {sgst},
,,,, Grand Total, {grand_total},
```

---

### `POST /api/validate-key`

Validate a Gumroad license key for batch mode access.

**Request body:** `{ "license_key": "XXXX-XXXX-XXXX-XXXX" }`

**Response:** `{ "valid": true, "tier": "agency" }` or `{ "valid": false }`

Validation is HMAC-based, entirely local — no external API call, no database write.

---

## Batch Mode (Paid)

The free tier handles one file at a time with full feature access. Batch mode unlocks multi-file processing (up to 20 invoices per run) with a combined CSV export.

| Tier | Price | Files per run | License keys |
|---|---|---|---|
| Individual | $19 one-time | 20 | 1 |
| Agency | $49 one-time | 20 | 5 |

Licenses are validated client-side via HMAC. No account, no subscription, no renewal. Key stored in `localStorage` after first validation.

[Get batch mode on Gumroad](https://gumroad.com/l/invoiceghost)

---

## Project Structure

```
invoiceghost/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, health check
│   ├── routers/
│   │   ├── parse.py             # POST /api/parse
│   │   └── export.py            # POST /api/export/csv
│   ├── services/
│   │   ├── extractor.py         # Gemini/Groq extraction logic
│   │   ├── pdf_handler.py       # PDF -> image via pdf2image
│   │   └── validator.py         # Pydantic output validation
│   ├── models/
│   │   └── invoice.py           # InvoiceData + LineItem models
│   ├── prompts/
│   │   └── extraction.txt       # Structured extraction system prompt
│   ├── tests/
│   │   ├── test_parse.py
│   │   ├── test_export.py
│   │   └── fixtures/            # Sample invoices (PDF + image)
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Upload UI
│   │   └── result/page.tsx      # Result display + export
│   ├── components/
│   │   ├── UploadZone.tsx       # Drag-drop upload
│   │   ├── InvoiceCard.tsx      # Structured result display
│   │   ├── ExportBar.tsx        # CSV / Copy JSON / Batch CTA
│   │   └── GumroadBadge.tsx     # Persistent upgrade badge
│   └── lib/
│       └── api.ts               # Backend API client
├── AGENTS.md
└── README.md
```

---

## Testing

```bash
cd backend
pytest tests/ -v --tb=short
```

18 tests covering:
- Valid PDF parse end-to-end
- Valid image parse end-to-end
- Oversized file rejection
- Invalid extension rejection
- Confidence score presence on all responses
- Low-quality scan triggers low confidence
- CSV headers correctness
- CSV line items match input
- CSV tax summary rows
- CSV filename includes invoice number

Test fixtures in `tests/fixtures/` include a standard GST invoice, freelance receipt, foreign USD invoice, and a low-quality scan.

---

## Deployment

**Backend → Render (free tier)**
1. Connect your GitHub repo to Render
2. Set environment variables in Render dashboard
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Frontend → Vercel**
1. Import the `frontend/` directory to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Deploy

Full setup walkthrough: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## Why No Login?

Because every login form is a conversion killer. The people who need this tool — Indian freelancers, small agencies, one-person consultancies — are not going to create an account to parse an invoice. They'll close the tab.

No login means no user table, no password reset flow, no email verification, no JWT refresh tokens, no session management. The codebase is smaller, the attack surface is smaller, and the conversion rate is higher.

Your invoice data is yours. We process it and delete it. That's the entire privacy policy.

---

## Contributing

Contributions welcome in these areas:

- **`backend/prompts/extraction.txt`** — Prompt improvements that increase accuracy on edge cases (handwritten invoices, non-standard layouts, mixed-language documents)
- **`tests/fixtures/`** — Additional real-world invoice samples (anonymized — remove all identifying information before submitting)
- **`src/services/extractor.py`** — Additional AI provider integrations (Anthropic, Mistral)

Before submitting a PR: run `pytest tests/ -v`, add tests for any new extraction behavior, and ensure all 18 existing tests pass.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built for Indian freelancers drowning in GST paperwork.**

[Get Batch Mode](https://gumroad.com/l/invoiceghost) • [Report Issues](https://github.com/yourusername/invoiceghost/issues) • [Interactive API Docs](https://invoiceghost.onrender.com/docs)

</div>