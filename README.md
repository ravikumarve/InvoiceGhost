# InvoiceGhost

<div align="center">

**Drop an invoice. Get clean data. No accounts, no storage, no drama.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com)
[![Tests](https://img.shields.io/badge/Tests-56%2F56_passing-brightgreen.svg)](./backend/tests)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000.svg)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7.svg)](https://render.com)

</div>

**InvoiceGhost** is a privacy-first invoice & receipt parser. Upload a PDF or image, get structured data back, export to CSV. Built for Indian freelancers drowning in GST paperwork.

---

## Screenshots

<div align="center">
  <table>
    <tr>
      <td><img src="./frontend/public/screenshots/workspace.png" alt="Extraction Workspace" width="400"/></td>
      <td><img src="./frontend/public/screenshots/result.png" alt="Parse result" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><b>Workspace</b></td>
      <td align="center"><b>Parse Result</b></td>
    </tr>
    <tr>
      <td><img src="./frontend/public/screenshots/batch.png" alt="Batch mode" width="400"/></td>
      <td><img src="./frontend/public/screenshots/pricing.png" alt="Pricing" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><b>Batch Mode</b></td>
      <td align="center"><b>Pricing</b></td>
    </tr>
    <tr>
      <td><img src="./frontend/public/screenshots/docs.png" alt="API docs" width="400"/></td>
      <td><img src="./frontend/public/screenshots/privacy.png" alt="Privacy" width="400"/></td>
    </tr>
    <tr>
      <td align="center"><b>API Docs</b></td>
      <td align="center"><b>Privacy</b></td>
    </tr>
    <tr>
      <td colspan="2" align="center"><img src="./frontend/public/screenshots/changelog.png" alt="Changelog" width="400"/></td>
    </tr>
    <tr>
      <td colspan="2" align="center"><b>Changelog</b></td>
    </tr>
  </table>
</div>

---

## Features

| Capability | Detail |
|---|---|
| **AI Extraction** | Gemini 2.0 Flash (primary) → Groq Llama 3.2 90B Vision (fallback) |
| **GST Support** | GSTIN, HSN/SAC codes, CGST/SGST/IGST line-level breakdown |
| **File Types** | PDF, PNG, JPG, JPEG, WEBP — up to 10MB |
| **Export** | CSV with full line items, tax summaries, and injection protection |
| **Confidence Score** | 0.0–1.0 per extraction — low results flagged for review |
| **Batch Mode** | Process up to 20 invoices at once — combined CSV export |
| **Privacy** | Zero data retention, EXIF stripped, temp files deleted in `finally` blocks |
| **Security** | Magic bytes validation, HMAC license keys, rate limiting, CSP headers |

[Full API reference →](./frontend/app/docs/page.tsx) · [Data model →](./backend/models/invoice.py)

---

## Quick Start

```bash
# Clone
git clone https://github.com/ravikumarve/invoiceghost.git
cd invoiceghost

# Backend
cd backend
python3.12 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add GEMINI_API_KEY, GROQ_API_KEY to .env
# Generate HMAC secret: openssl rand -hex 32
uvicorn main:app --reload

# Frontend (separate terminal)
cd ../frontend
npm install && cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000** — drag in an invoice, get structured data.

---

## Why No Login?

Because every login form is a conversion killer. No login means no user table, no JWT, no session management. Smaller codebase, smaller attack surface, higher conversion rate. Your invoice data is yours — we process it and delete it.

---

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Lucide icons |
| **Backend** | FastAPI, Pydantic v2, Python 3.12 |
| **AI** | Google Gemini 2.0 Flash + Groq Llama 3.2 90B Vision |
| **Deploy** | Frontend → Vercel · Backend → Render (Docker) |
| **CI/CD** | GitHub Actions — pytest, mypy, lint, build, auto-deploy |

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built for Indian freelancers drowning in GST paperwork.**

[Try it](https://invoiceghost.vercel.app) · [Batch Mode](https://gumroad.com/l/invoiceghost) · [Report Issue](https://github.com/ravikumarve/invoiceghost/issues) · [Changelog](./frontend/app/changelog/page.tsx)

</div>
