"""
API routes package.
Canonical location for all endpoint routers.
"""

from app.routes import verifications, dashboard, issuers, tests

__all__ = ["verifications", "dashboard", "issuers", "tests"]
