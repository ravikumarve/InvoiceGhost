# InvoiceGhost

<div align="center">

![InvoiceGhost Logo](https://via.placeholder.com/200x200/1f2937/f59e0b?text=IG)

**Parse invoices in seconds. Zero login. Zero data retention.**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/invoiceghost?style=social)](https://github.com/yourusername/invoiceghost)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Status: Active](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com/yourusername/invoiceghost)
[![Gumroad](https://img.shields.io/badge/Gumroad-Batch_Mode-orange.svg)](https://gumroad.com/l/invoiceghost)

</div>

---

## What It Does

- **Upload any invoice** — PDF or image, get structured data instantly
- **Export to CSV** — One click, ready for accounting software
- **Privacy-first** — No account, no database, files deleted immediately

---

## Demo

![InvoiceGhost Demo](https://via.placeholder.com/800x400/1f2937/f59e0b?text=Demo+GIF+Coming+Soon)

---

## Features

- ✨ **AI-powered extraction** — Gemini Flash parses invoices with 85%+ accuracy
- 🇮🇳 **GST-ready** — Full support for Indian GST invoices with HSN/SAC codes
- 🔒 **Zero data retention** — Files processed in-memory, never stored
- ⚡ **Lightning fast** — Parse invoices in under 30 seconds
- 📱 **Responsive design** — Works on desktop, tablet, and mobile
- 💰 **Free tier** — Single file parsing, no account required

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/invoiceghost.git

# Install backend dependencies
cd invoiceghost/backend && pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | — | Google Gemini API key (required) |
| `GROQ_API_KEY` | — | Groq API key (fallback) |
| `MAX_FILE_SIZE_MB` | 10 | Maximum file upload size |
| `RATE_LIMIT_PER_MINUTE` | 10 | API rate limit per IP |

---

## API Reference

### POST /api/parse
Upload and parse invoice file. Returns structured `InvoiceData` JSON.

### POST /api/export/csv
Export parsed invoice data to CSV format.

### POST /api/validate-key
Validate Gumroad license key for batch mode access.

---

## Documentation

- [API Documentation](https://invoiceghost.onrender.com/docs) — Interactive FastAPI docs
- [Deployment Guide](./docs/DEPLOYMENT.md) — Render + Vercel setup
- [Contributing Guide](./docs/CONTRIBUTING.md) — How to contribute

---

## Contributing

Contributions welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) before submitting PRs.

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ for indie developers and small businesses**

[Star us on GitHub](https://github.com/yourusername/invoiceghost) • [Report Issues](https://github.com/yourusername/invoiceghost/issues)

</div>
