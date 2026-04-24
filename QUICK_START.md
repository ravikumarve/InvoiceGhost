# InvoiceGhost - Quick Start Guide

**Version:** 1.0.0  
**Last Updated:** April 24, 2026  
**For:** Users and Developers

---

## 👋 Welcome to InvoiceGhost

InvoiceGhost is a privacy-first invoice and receipt parser that extracts structured data from your PDF and image files. No login required. No data retained. Just upload, parse, and export.

**What makes InvoiceGhost different:**
- 🔒 **Privacy-First:** Zero data retention, no database, no login
- ⚡ **Fast:** AI-powered extraction in seconds
- 🎯 **Accurate:** Confidence scoring for reliable results
- 💰 **Free:** Single file parsing is completely free
- 🚀 **Simple:** Upload, parse, export CSV

---

## 🚀 For Users

### Getting Started

**Access the Application:**
- **Production URL:** https://invoiceghost.vercel.app (after deployment)
- **Backend API:** https://invoiceghost-api.onrender.com (after deployment)

**System Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Invoice/receipt file (PDF, PNG, JPG, JPEG, WEBP)
- File size < 10MB

### How to Use InvoiceGhost

#### Step 1: Upload Your Invoice

1. **Navigate to** https://invoiceghost.vercel.app
2. **Drag and drop** your invoice file onto the upload zone
   - OR click the upload zone to select a file
3. **Supported formats:** PDF, PNG, JPG, JPEG, WEBP
4. **File size limit:** 10MB

**What happens:**
- File is uploaded securely
- EXIF data is stripped (for images)
- PDF is converted to image (if needed)
- File is sent to AI for processing

#### Step 2: Review Extracted Data

1. **Wait for processing** (typically 5-30 seconds)
2. **Review the extracted invoice data:**
   - Invoice number and date
   - Vendor information (name, GSTIN, address)
   - Buyer information (name, GSTIN, address)
   - Line items (description, HSN/SAC, quantity, rate, amount)
   - Tax breakdown (CGST, SGST, IGST)
   - Totals (subtotal, taxes, grand total)
3. **Check the confidence score:**
   - 🟢 Green (≥0.8): High confidence, reliable
   - 🟡 Amber (0.5-0.8): Medium confidence, review recommended
   - 🔴 Red (<0.5): Low confidence, manual review needed

#### Step 3: Export Your Data

**Option 1: Download CSV**
1. Click "Download CSV" button
2. CSV file downloads automatically
3. Open in Excel, Google Sheets, or any spreadsheet application

**CSV Format:**
```csv
Description,HSN/SAC,Quantity,Unit,Rate,Amount,Tax Rate
Office Supplies,998311,10,pcs,150.00,1500.00,18.00
,,,Subtotal,,4000.00,
,,,CGST,,360.00,
,,,SGST,,360.00,
,,,IGST,,,
,,,Total Tax,,720.00,
,,,Grand Total,,4720.00,
```

**Option 2: Copy JSON**
1. Click "Copy JSON" button
2. JSON data copied to clipboard
3. Paste into your application or save as .json file

**Option 3: Unlock Batch Mode (Paid)**
1. Click "Unlock Batch Mode" button
2. Enter your Gumroad license key
3. Upload up to 20 files at once
4. Process all files in one go

### Troubleshooting

**File Upload Issues:**

**Problem:** "Unsupported file format"
- **Solution:** Ensure file is PDF, PNG, JPG, JPEG, or WEBP

**Problem:** "File too large"
- **Solution:** Compress file or split into smaller files (<10MB)

**Problem:** "Upload failed"
- **Solution:** Check internet connection, try again

**Processing Issues:**

**Problem:** "Extraction failed"
- **Solution:** Ensure file is clear and readable, try a better scan

**Problem:** "Low confidence score"
- **Solution:** Review extracted data manually, correct if needed

**Problem:** "Processing timeout"
- **Solution:** File may be too complex, try simpler invoice

**Export Issues:**

**Problem:** "CSV download failed"
- **Solution:** Check browser settings, allow downloads

**Problem:** "JSON copy failed"
- **Solution:** Check clipboard permissions, try again

**License Key Issues:**

**Problem:** "Invalid license key"
- **Solution:** Verify key from Gumroad purchase email

**Problem:** "License validation failed"
- **Solution:** Contact support with purchase details

### Tips for Best Results

**File Quality:**
- Use high-resolution scans (300 DPI recommended)
- Ensure good lighting for photos
- Avoid blurry or distorted images
- Use clear, readable fonts

**Invoice Format:**
- Standard invoice formats work best
- Indian GST invoices optimized
- Foreign invoices supported (USD, EUR, etc.)
- Handwritten invoices may have lower accuracy

**Batch Processing:**
- Purchase license key for batch mode
- Process up to 20 files at once
- Save time on multiple invoices
- Export all results to CSV

### Privacy & Security

**What We Don't Do:**
- ❌ Store your files
- ❌ Retain your data
- ❌ Log file contents
- ❌ Require login
- ❌ Track your activity

**What We Do:**
- ✅ Process files in memory
- ✅ Delete files immediately
- ✅ Strip EXIF data
- ✅ Use secure connections
- ✅ Respect your privacy

**Data Retention:**
- Files are deleted immediately after processing
- No database storage
- No user accounts
- No data logging
- Session-based only

### Pricing

**Free Tier:**
- ✅ Single file parsing
- ✅ CSV export
- ✅ JSON export
- ✅ No account required
- ✅ Unlimited use (one file at a time)

**Paid Tier (Batch Mode):**
- ✅ Up to 20 files at once
- ✅ All free tier features
- ✅ Priority processing
- ✅ One-time purchase
- 💰 Price: [Check Gumroad]

**Get License Key:**
- Visit: https://gumroad.com/l/invoiceghost
- Purchase license key
- Enter key in InvoiceGhost
- Unlock batch mode

---

## 👨‍💻 For Developers

### Local Development Setup

**Prerequisites:**
- Python 3.12+
- Node.js 18+
- Git
- Gemini API key
- Groq API key (optional)

#### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/InvoiceGhost.git
cd InvoiceGhost
```

#### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys
```

**Environment Variables (.env):**
```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
MAX_FILE_SIZE_MB=10
ALLOWED_EXTENSIONS=pdf,png,jpg,jpeg,webp
RATE_LIMIT_PER_MINUTE=10
LICENSE_KEY_HMAC_SECRET=your_generated_secret
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

**Generate HMAC Secret:**
```bash
openssl rand -hex 32
```

#### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local with your API URL
```

**Environment Variables (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GUMROAD_URL=https://gumroad.com/l/invoiceghost
```

#### Step 4: Run Development Servers

**Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Running Tests

**Backend Tests:**
```bash
cd backend
source venv/bin/activate
pytest tests/ -v --tb=short
```

**Run Specific Test:**
```bash
pytest tests/test_parse.py -v
pytest tests/test_export.py -v
pytest tests/test_rate_limiting.py -v
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

### Code Quality

**Backend:**
```bash
cd backend

# Linting
ruff check .

# Type checking
mypy .

# Format code
ruff format .
```

**Frontend:**
```bash
cd frontend

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Building for Production

**Backend:**
```bash
cd backend

# Build Docker image
docker build -t invoiceghost-api .

# Run container
docker run -p 8000:8000 --env-file .env invoiceghost-api
```

**Frontend:**
```bash
cd frontend

# Build for production
npm run build

# Test production build
npm start
```

### API Documentation

**Swagger UI:**
- URL: http://localhost:8000/docs
- Interactive API documentation
- Test endpoints directly

**ReDoc:**
- URL: http://localhost:8000/redoc
- Alternative API documentation

**API Endpoints:**

**Health Check:**
```bash
GET /health
Response: {"status": "healthy", "service": "InvoiceGhost API", "version": "1.0.0"}
```

**Parse Invoice:**
```bash
POST /api/parse
Content-Type: multipart/form-data
Body: file=<invoice_file>
Response: InvoiceData JSON
```

**Export CSV:**
```bash
POST /api/export/csv
Content-Type: application/json
Body: InvoiceData JSON
Response: CSV file
```

**Validate License Key:**
```bash
POST /api/validate-key
Content-Type: application/json
Body: {"license_key": "your_key"}
Response: {"valid": true/false}
```

### Project Structure

```
invoiceghost/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── routers/
│   │   ├── parse.py         # Parse endpoint
│   │   ├── export.py        # Export endpoint
│   │   └── validate_key.py  # License validation
│   ├── services/
│   │   ├── extractor.py     # AI extraction service
│   │   └── pdf_handler.py   # PDF processing
│   ├── models/
│   │   └── invoice.py       # Pydantic models
│   ├── tests/
│   │   ├── test_parse.py    # Parse tests
│   │   ├── test_export.py   # Export tests
│   │   └── test_rate_limiting.py  # Rate limiting tests
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Docker configuration
│   └── render.yaml          # Render deployment config
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Home page
│   │   ├── result/
│   │   │   └── page.tsx     # Result page
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── UploadZone.tsx   # File upload component
│   │   ├── InvoiceCard.tsx  # Invoice display component
│   │   ├── ExportBar.tsx    # Export actions component
│   │   └── GumroadBadge.tsx # License badge component
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── types.ts         # TypeScript types
│   │   └── utils.ts         # Utility functions
│   ├── package.json         # Node dependencies
│   ├── next.config.js       # Next.js configuration
│   └── vercel.json          # Vercel deployment config
├── AGENTS.md                # Agent alignment documentation
├── README.md                # Project overview
├── DEPLOYMENT_CHECKLIST.md  # Deployment checklist
├── PROJECT_SUMMARY.md       # Project summary
└── QUICK_START.md           # This file
```

### Contributing

**How to Contribute:**

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/yourusername/InvoiceGhost.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation
   - Run tests and linting

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a pull request**
   - Go to GitHub
   - Click "New Pull Request"
   - Describe your changes
   - Wait for review

**Contribution Guidelines:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic
- Write clear commit messages
- Respond to review feedback

### Deployment

**Backend Deployment (Render):**

1. **Connect GitHub to Render**
   - Sign up at https://render.com
   - Connect your GitHub account
   - Select InvoiceGhost repository

2. **Configure Web Service**
   - Name: `invoiceghost-api`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   - Add all variables from .env file
   - Update FRONTEND_URL after Vercel deployment

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Test endpoints

**Frontend Deployment (Vercel):**

1. **Connect GitHub to Vercel**
   - Sign up at https://vercel.com
   - Connect your GitHub account
   - Select InvoiceGhost repository

2. **Configure Project**
   - Project Name: `invoiceghost`
   - Root Directory: `frontend`
   - Framework Preset: Next.js

3. **Set Environment Variables**
   - NEXT_PUBLIC_API_URL: Your Render URL
   - NEXT_PUBLIC_GUMROAD_URL: Your Gumroad URL

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Test application

**Detailed deployment guide:** See DEPLOYMENT_CHECKLIST.md

### Troubleshooting

**Development Issues:**

**Problem:** Backend won't start
- **Solution:** Check Python version, install dependencies, verify .env file

**Problem:** Frontend won't start
- **Solution:** Check Node version, install dependencies, verify .env.local file

**Problem:** Tests failing
- **Solution:** Check dependencies, run tests individually, check error messages

**Problem:** Build failing
- **Solution:** Check dependencies, verify configuration, check error logs

**API Issues:**

**Problem:** 429 Too Many Requests
- **Solution:** Rate limiting active, wait 60 seconds before retrying

**Problem:** 415 Unsupported Media Type
- **Solution:** Check file format, use supported formats only

**Problem:** 413 Payload Too Large
- **Solution:** Check file size, must be <10MB

**Problem:** 422 Unprocessable Entity
- **Solution:** Check request format, verify required fields

**Deployment Issues:**

**Problem:** Render deployment failing
- **Solution:** Check build logs, verify requirements.txt, check Python version

**Problem:** Vercel deployment failing
- **Solution:** Check build logs, verify package.json, check Node version

**Problem:** CORS errors
- **Solution:** Verify FRONTEND_URL environment variable, check CORS configuration

### Support

**Documentation:**
- README.md - Project overview
- DEPLOYMENT_CHECKLIST.md - Deployment guide
- PROJECT_SUMMARY.md - Project summary
- AGENTS.md - Agent alignment

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Community:**
- GitHub Issues: https://github.com/yourusername/InvoiceGhost/issues
- GitHub Discussions: https://github.com/yourusername/InvoiceGhost/discussions

**Contact:**
- Email: support@invoiceghost.com
- Twitter: @invoiceghost
- Discord: [Invite link]

---

## 📚 Additional Resources

### User Resources

**Video Tutorials:**
- Getting Started with InvoiceGhost
- How to Extract Invoice Data
- Exporting to CSV
- Batch Processing Guide

**Blog Posts:**
- Privacy-First Invoice Processing
- AI-Powered Data Extraction
- Tips for Best Results
- InvoiceGhost vs Competitors

**FAQ:**
- Is my data safe? Yes, zero retention
- Do I need an account? No, completely free
- What formats are supported? PDF, PNG, JPG, JPEG, WEBP
- How accurate is the extraction? 85%+ accuracy
- Can I process multiple files? Yes, with license key

### Developer Resources

**Documentation:**
- FastAPI Documentation: https://fastapi.tiangolo.com
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com
- Pydantic Documentation: https://docs.pydantic.dev

**Tutorials:**
- Building Privacy-First Apps
- FastAPI Best Practices
- Next.js App Router Guide
- AI Integration with Gemini

**Examples:**
- API Usage Examples
- Component Examples
- Test Examples
- Deployment Examples

---

## 🎉 Conclusion

InvoiceGhost is ready to help you extract invoice data quickly, accurately, and privately. Whether you're a user processing invoices or a developer contributing to the project, we hope this guide helps you get started.

**For Users:** Start uploading invoices at https://invoiceghost.vercel.app

**For Developers:** Start contributing by cloning the repository and following the development setup guide.

**Questions?** Check our documentation or reach out to our community.

---

**Quick Start Guide Version:** 1.0.0  
**Last Updated:** April 24, 2026  
**Next Review:** Post-launch (May 2026)