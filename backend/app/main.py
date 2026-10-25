"""
CertiProof AI — FastAPI Application Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database import init_db, SessionLocal
from app.routers import verifications, dashboard, issuers, tests


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB and seed issuers
    init_db()
    _seed_issuers()
    yield
    # Shutdown: nothing to clean up


def _seed_issuers():
    """Seed default issuer sources if they don't exist."""
    from app import models
    db = SessionLocal()
    try:
        issuers_data = [
            {
                "name": "Mock Issuer (Demo)",
                "slug": "mock-issuer",
                "base_url": "https://mock.certiproof.local/verify",
                "verification_url_template": "https://mock.certiproof.local/verify?id={credential_id}",
                "adapter_class": "MockIssuerAdapter",
                "is_active": True,
                "notes": "Deterministic mock adapter for automated testing. Results are clearly labelled as MOCK.",
            },
            {
                "name": "Coursera",
                "slug": "coursera",
                "base_url": "https://www.coursera.org",
                "verification_url_template": "https://www.coursera.org/account/accomplishments/certificate/{credential_id}",
                "adapter_class": "CourseraPublicAdapter",
                "is_active": True,
                "notes": "Uses Coursera public API. Requires valid public credential ID.",
            },
        ]
        for data in issuers_data:
            existing = db.query(models.IssuerSource).filter_by(slug=data["slug"]).first()
            if not existing:
                issuer = models.IssuerSource(**data)
                db.add(issuer)
        db.commit()
    finally:
        db.close()


app = FastAPI(
    title="CertiProof AI",
    description="AI-powered certificate verification agent — Ziro.Digital Hackathon 2026",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Normalize path prefix for serverless proxies
@app.middleware("http")
async def normalize_api_prefix(request, call_next):
    path = request.scope.get("path", "")
    if path and not path.startswith("/api") and path not in ("/", "/health", "/docs", "/redoc", "/openapi.json"):
        request.scope["path"] = "/api" + path
    response = await call_next(request)
    return response

# Routers
app.include_router(verifications.router)
app.include_router(dashboard.router)
app.include_router(issuers.router)
app.include_router(tests.router)


# Health check
@app.get("/api/health", tags=["health"])
@app.get("/health", tags=["health"])
@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "service": "CertiProof AI", "version": "1.0.0"}


# Serve screenshots as static files
os.makedirs(settings.SCREENSHOTS_DIR, exist_ok=True)
app.mount("/screenshots", StaticFiles(directory=settings.SCREENSHOTS_DIR), name="screenshots")
