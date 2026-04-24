# InvoiceGhost Deployment Checklist

**Version:** 1.0.0  
**Last Updated:** April 24, 2026  
**Project:** Privacy-first invoice & receipt parser SaaS

---

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] GitHub account with repository access
- [ ] Render account (free tier)
- [ ] Vercel account (free tier)
- [ ] Gemini API key (Google AI Studio)
- [ ] Groq API key (optional fallback)
- [ ] Gumroad license key HMAC secret (generate with: `openssl rand -hex 32`)

### Environment Variables Preparation
- [ ] Generate LICENSE_KEY_HMAC_SECRET: `openssl rand -hex 32`
- [ ] Obtain GEMINI_API_KEY from Google AI Studio
- [ ] Obtain GROQ_API_KEY from Groq Console (optional)
- [ ] Note down FRONTEND_URL (will be Vercel URL after deployment)

---

## 🚀 Backend Deployment (Render)

### Step 1: Create Render Account
- [ ] Sign up at https://render.com
- [ ] Verify email address
- [ ] Connect GitHub account to Render

### Step 2: Connect GitHub Repository
- [ ] Navigate to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Select "Connect GitHub repository"
- [ ] Authorize Render to access your GitHub
- [ ] Select `InvoiceGhost` repository
- [ ] Select branch: `main`

### Step 3: Configure Build Settings
- [ ] **Name:** `invoiceghost-api`
- [ ] **Region:** Oregon (us-west) or closest to your users
- [ ] **Branch:** `main`
- [ ] **Root Directory:** `backend`
- [ ] **Runtime:** Python 3
- [ ] **Build Command:** `pip install -r requirements.txt`
- [ ] **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 4: Set Environment Variables
Navigate to "Environment" section and add:

**Required Variables:**
- [ ] `GEMINI_API_KEY` = Your Gemini API key
- [ ] `GROQ_API_KEY` = Your Groq API key (optional)
- [ ] `MAX_FILE_SIZE_MB` = `10`
- [ ] `ALLOWED_EXTENSIONS` = `pdf,png,jpg,jpeg,webp`
- [ ] `RATE_LIMIT_PER_MINUTE` = `10`
- [ ] `LICENSE_KEY_HMAC_SECRET` = Your generated secret
- [ ] `ENVIRONMENT` = `production`

**Frontend URL (update after Vercel deployment):**
- [ ] `FRONTEND_URL` = Your Vercel URL (e.g., `https://invoiceghost.vercel.app`)

### Step 5: Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Monitor build logs for errors
- [ ] Verify deployment status: "Live"

### Step 6: Test Backend Endpoints
**Health Check:**
- [ ] Test: `GET https://invoiceghost-api.onrender.com/health`
- [ ] Expected: `{"status": "healthy", "service": "InvoiceGhost API", "version": "1.0.0"}`

**Root Endpoint:**
- [ ] Test: `GET https://invoiceghost-api.onrender.com/`
- [ ] Expected: JSON with available endpoints

**Security Headers:**
- [ ] Verify `X-Content-Type-Options: nosniff`
- [ ] Verify `X-Frame-Options: DENY`
- [ ] Verify `X-XSS-Protection: 1; mode=block`
- [ ] Verify `Referrer-Policy: strict-origin-when-cross-origin`

### Step 7: Verify Rate Limiting
- [ ] Make 11 requests to `/health` within 1 minute
- [ ] Expected: First 10 succeed, 11th returns 429
- [ ] Verify `Retry-After: 60` header present

### Step 8: Test Parse Endpoint
- [ ] Upload a test PDF invoice
- [ ] Test: `POST https://invoiceghost-api.onrender.com/api/parse`
- [ ] Expected: JSON with invoice data and confidence score
- [ ] Verify `X-Processing-Time-Ms` header present

### Step 9: Test Export Endpoint
- [ ] Test: `POST https://invoiceghost-api.onrender.com/api/export/csv`
- [ ] Expected: CSV file download with proper headers
- [ ] Verify `Content-Disposition: attachment` header

### Step 10: Monitor Backend Logs
- [ ] Navigate to Render Dashboard → invoiceghost-api
- [ ] Click "Logs" tab
- [ ] Verify no errors in startup logs
- [ ] Verify no errors in request logs
- [ ] Check for any warnings

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Verify email address
- [ ] Connect GitHub account to Vercel

### Step 2: Import GitHub Repository
- [ ] Navigate to Vercel Dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Select `InvoiceGhost` repository
- [ ] Select branch: `main`

### Step 3: Configure Project Settings
- [ ] **Project Name:** `invoiceghost`
- [ ] **Framework Preset:** Next.js
- [ ] **Root Directory:** `frontend`
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `.next`

### Step 4: Set Environment Variables
Navigate to "Environment Variables" section and add:

**Required Variables:**
- [ ] `NEXT_PUBLIC_API_URL` = Your Render backend URL (e.g., `https://invoiceghost-api.onrender.com`)
- [ ] `NEXT_PUBLIC_GUMROAD_URL` = Your Gumroad product URL (e.g., `https://gumroad.com/l/invoiceghost`)

### Step 5: Deploy Frontend
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Monitor build logs for errors
- [ ] Verify deployment status: "Ready"

### Step 6: Note Vercel URL
- [ ] Copy the Vercel URL (e.g., `https://invoiceghost.vercel.app`)
- [ ] Update `FRONTEND_URL` in Render backend environment variables
- [ ] Redeploy backend to apply changes

### Step 7: Test Main Page
- [ ] Navigate to Vercel URL
- [ ] Expected: Dark mode upload page with amber accents
- [ ] Verify page loads without errors
- [ ] Check browser console for errors

### Step 8: Test Result Page
- [ ] Upload a test invoice
- [ ] Navigate to result page
- [ ] Expected: Invoice data displayed with confidence badge
- [ ] Verify all fields render correctly

### Step 9: Test File Upload
- [ ] Test drag-drop file upload
- [ ] Test click-to-upload
- [ ] Verify amber pulse animation on drag-over
- [ ] Test with PDF file
- [ ] Test with image file (PNG/JPG/WEBP)

### Step 10: Test CSV Export
- [ ] Click "Download CSV" button
- [ ] Expected: CSV file download
- [ ] Verify CSV format matches specification
- [ ] Test "Copy JSON" button

### Step 11: Test License Key Validation
- [ ] Click "Unlock Batch Mode" button
- [ ] Enter valid Gumroad license key
- [ ] Expected: Validation success message
- [ ] Test with invalid key
- [ ] Expected: Validation failure message

### Step 12: Verify Responsive Design
- [ ] Test on mobile device (<640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (>1024px)
- [ ] Verify layout adapts correctly
- [ ] Check touch interactions on mobile

### Step 13: Verify Dark Mode
- [ ] Verify dark mode is default
- [ ] Check zinc base colors (bg-zinc-950)
- [ ] Check amber accent colors (text-amber-500)
- [ ] Verify color contrast is accessible

---

## 🧪 Post-Deployment Testing

### Complete User Flow
- [ ] User uploads invoice PDF
- [ ] System processes file
- [ ] AI extracts invoice data
- [ ] Results displayed with confidence score
- [ ] User exports CSV
- [ ] Temp files cleaned up

### Error Handling
- [ ] Test unsupported file format (415 error)
- [ ] Test file too large (>10MB) (413 error)
- [ ] Test missing file (422 error)
- [ ] Test empty file (413/422/415/500 error)
- [ ] Test extraction failure (422 error)
- [ ] Test rate limit exceeded (429 error)
- [ ] Verify all error messages are user-friendly

### Privacy Features
- [ ] Verify no files retained after processing
- [ ] Verify EXIF data stripped from images
- [ ] Verify no user data logged
- [ ] Verify no database persistence
- [ ] Verify stateless design

### Security Features
- [ ] Verify rate limiting active (10 req/min)
- [ ] Verify security headers present
- [ ] Verify CORS configured correctly
- [ ] Verify input validation working
- [ ] Verify executable files rejected
- [ ] Verify MIME type validation

### Performance Monitoring
- [ ] Monitor API response times (<200ms target)
- [ ] Check memory usage (<500MB peak)
- [ ] Verify file upload limits working
- [ ] Test with concurrent users
- [ ] Monitor error rates

### Error Logs
- [ ] Check Render logs for backend errors
- [ ] Check Vercel logs for frontend errors
- [ ] Verify no critical errors
- [ ] Monitor 4xx/5xx error rates
- [ ] Set up error alerting

### Uptime Verification
- [ ] Verify backend uptime (99.9% target)
- [ ] Verify frontend uptime (99.9% target)
- [ ] Test health endpoint regularly
- [ ] Monitor response times
- [ ] Set up uptime monitoring

---

## 🔧 Configuration Updates

### Update Backend Environment Variables
After Vercel deployment, update Render backend:

- [ ] Navigate to Render → invoiceghost-api → Environment
- [ ] Update `FRONTEND_URL` to your Vercel URL
- [ ] Click "Save Changes"
- [ ] Wait for automatic redeploy
- [ ] Verify new environment variable active

### Update Frontend Environment Variables
After Render deployment, update Vercel frontend:

- [ ] Navigate to Vercel → invoiceghost → Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_API_URL` to your Render URL
- [ ] Click "Save"
- [ ] Redeploy frontend
- [ ] Verify API communication working

---

## 📊 Monitoring Setup

### Backend Monitoring (Render)
- [ ] Enable Render metrics
- [ ] Set up error alerting
- [ ] Monitor response times
- [ ] Track request rates
- [ ] Monitor memory usage

### Frontend Monitoring (Vercel)
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking
- [ ] Monitor page load times
- [ ] Track Core Web Vitals
- [ ] Monitor build failures

### Custom Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error logging (Sentry, LogRocket)
- [ ] Set up performance monitoring (New Relic, Datadog)
- [ ] Create alerting rules
- [ ] Define escalation procedures

---

## 🚨 Rollback Procedures

### Backend Rollback
If issues detected after deployment:

1. **Immediate Rollback:**
   - [ ] Navigate to Render → invoiceghost-api
   - [ ] Click "Deployments" tab
   - [ ] Select previous successful deployment
   - [ ] Click "Redeploy"
   - [ ] Verify rollback successful

2. **Emergency Rollback:**
   - [ ] If immediate rollback fails, scale down to 0 instances
   - [ ] Investigate issue
   - [ ] Fix issue in development
   - [ ] Test thoroughly
   - [ ] Redeploy when ready

### Frontend Rollback
If issues detected after deployment:

1. **Immediate Rollback:**
   - [ ] Navigate to Vercel → invoiceghost → Deployments
   - [ ] Select previous successful deployment
   - [ ] Click "Redeploy"
   - [ ] Verify rollback successful

2. **Emergency Rollback:**
   - [ ] If immediate rollback fails, revert to previous commit
   - [ ] Push to GitHub
   - [ ] Vercel will auto-deploy
   - [ ] Verify rollback successful

---

## ✅ Final Verification

### Backend Verification
- [ ] All API endpoints responding correctly
- [ ] Rate limiting active and working
- [ ] Security headers present
- [ ] Error handling robust
- [ ] Privacy features verified
- [ ] Performance within targets
- [ ] No critical errors in logs

### Frontend Verification
- [ ] All pages loading correctly
- [ ] File upload working
- [ ] Invoice display working
- [ ] CSV export working
- [ ] License validation working
- [ ] Responsive design verified
- [ ] Dark mode working
- [ ] No console errors

### Integration Verification
- [ ] Frontend-backend communication working
- [ ] Complete user flow tested
- [ ] Error handling tested
- [ ] State management verified
- [ ] Data persistence verified (sessionStorage/localStorage)

### Documentation Verification
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Developer documentation updated
- [ ] Deployment guide updated
- [ ] Troubleshooting guide updated

---

## 📝 Post-Deployment Tasks

### Immediate (First 24 Hours)
- [ ] Monitor system closely
- [ ] Check error logs regularly
- [ ] Verify uptime targets
- [ ] Test key user flows
- [ ] Gather initial feedback

### Short-term (First Week)
- [ ] Optimize based on metrics
- [ ] Fix any discovered issues
- [ ] Update documentation
- [ ] Train support team
- [ ] Prepare for scale

### Long-term (First Month)
- [ ] Analyze usage patterns
- [ ] Plan feature enhancements
- [ ] Optimize performance
- [ ] Improve documentation
- [ ] Scale infrastructure as needed

---

## 🎯 Success Criteria

### Deployment Success
- [ ] Backend deployed to Render without errors
- [ ] Frontend deployed to Vercel without errors
- [ ] All endpoints responding correctly
- [ ] All user flows working
- [ ] No critical errors in logs

### Performance Success
- [ ] API response time <200ms (95th percentile)
- [ ] Frontend load time <3s on 3G
- [ ] 99.9% uptime achieved
- [ ] Memory usage <500MB peak
- [ ] Error rate <1%

### Security Success
- [ ] Rate limiting active and effective
- [ ] Security headers present
- [ ] Input validation working
- [ ] No security vulnerabilities
- [ ] Privacy features verified

### User Experience Success
- [ ] Complete user flow working
- [ ] Error messages user-friendly
- [ ] Responsive design verified
- [ ] Dark mode working
- [ ] Accessibility compliant

---

## 📞 Support & Troubleshooting

### Common Issues

**Backend Deployment Issues:**
- Build failures: Check requirements.txt and Python version
- Runtime errors: Check environment variables
- Rate limiting not working: Verify slowapi configuration
- CORS errors: Verify FRONTEND_URL environment variable

**Frontend Deployment Issues:**
- Build failures: Check package.json and Node version
- Runtime errors: Check environment variables
- API communication errors: Verify NEXT_PUBLIC_API_URL
- Styling issues: Check Tailwind CSS configuration

**Integration Issues:**
- CORS errors: Verify CORS configuration on backend
- Rate limiting errors: Verify rate limit configuration
- State management issues: Check sessionStorage/localStorage usage
- File upload issues: Verify file size and format validation

### Support Resources
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- FastAPI Documentation: https://fastapi.tiangolo.com
- Next.js Documentation: https://nextjs.org/docs

### Emergency Contacts
- DevOps Lead: [Contact information]
- Backend Lead: [Contact information]
- Frontend Lead: [Contact information]
- Security Lead: [Contact information]

---

## 📅 Deployment Timeline

**Total Estimated Time:** 2-3 hours

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Preparation** | 30 min | Prerequisites, environment variables |
| **Backend Deployment** | 45 min | Render setup, configuration, testing |
| **Frontend Deployment** | 45 min | Vercel setup, configuration, testing |
| **Post-Deployment Testing** | 30 min | Integration testing, verification |
| **Monitoring Setup** | 15 min | Monitoring, alerting, documentation |
| **Total** | **2h 45m** | Complete deployment |

---

**Deployment Checklist Version:** 1.0.0  
**Last Updated:** April 24, 2026  
**Next Review:** Post-launch (May 2026)