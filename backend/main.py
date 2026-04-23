from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Configure logging - NEVER log file contents
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

# Custom rate limit exceeded handler
async def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    client_host = request.client.host if request.client else "unknown"
    logger.warning(f"Rate limit exceeded for {client_host}: {exc.detail}")
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please try again later."
        },
        headers={"Retry-After": "60"}
    )

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting InvoiceGhost API...")
    yield
    logger.info("Shutting down InvoiceGhost API...")

# Initialize FastAPI app
app = FastAPI(
    title="InvoiceGhost API",
    description="Privacy-first invoice & receipt parser SaaS",
    version="1.0.0",
    lifespan=lifespan
)

# Rate limiter exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)

# CORS middleware configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
    
    # HSTS header (only in production with HTTPS)
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    
    return response

# Processing time middleware
@app.middleware("http")
async def add_processing_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Processing-Time-Ms"] = str(f"{process_time:.2f}")
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "internal_error", "message": "An unexpected error occurred"}
    )

# Health check endpoint
@app.get("/health")
@limiter.limit("100/minute")
async def health_check(request: Request):
    return {
        "status": "healthy",
        "service": "InvoiceGhost API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
@limiter.limit("100/minute")
async def root(request: Request):
    return {
        "message": "InvoiceGhost API - Privacy-first invoice parser",
        "endpoints": {
            "health": "/health",
            "parse": "/api/parse",
            "export_csv": "/api/export/csv",
            "validate_key": "/api/validate-key"
        }
    }

# Import routers (must be after app definition to avoid circular imports)
from routers.parse import router as parse_router  # noqa: E402
from routers.export import router as export_router  # noqa: E402
from routers.validate_key import router as validate_key_router  # noqa: E402

# Include routers
app.include_router(parse_router, prefix="/api", tags=["parse"])
app.include_router(export_router, prefix="/api", tags=["export"])
app.include_router(validate_key_router, prefix="/api", tags=["validate-key"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
