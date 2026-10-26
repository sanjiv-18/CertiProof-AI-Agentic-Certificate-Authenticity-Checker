"""
Routers package (Re-export shim)
Canonical location: app.routes
"""

from app.routes import verifications, dashboard, issuers, tests

__all__ = ["verifications", "dashboard", "issuers", "tests"]
