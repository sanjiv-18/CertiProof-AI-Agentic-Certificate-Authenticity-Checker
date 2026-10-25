from app.main import app, _seed_issuers
from app.database import init_db

# Ensure DB initialized on startup
try:
    init_db()
    _seed_issuers()
except Exception as e:
    print(f"[Startup] DB init warning: {e}")
