"""
Shared backend utilities, configuration, and database connection helpers.
"""

from app.utils.config import settings, Settings
from app.utils.database import engine, SessionLocal, Base, get_db, init_db

__all__ = [
    "settings",
    "Settings",
    "engine",
    "SessionLocal",
    "Base",
    "get_db",
    "init_db",
]
