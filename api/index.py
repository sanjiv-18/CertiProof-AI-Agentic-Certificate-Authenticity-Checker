import sys
import os

# Ensure backend directory is in python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

for p in (BACKEND_DIR, ROOT_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

os.environ["VERCEL"] = "1"

from app.main import app, _seed_issuers
from app.database import init_db

# Initialize database schema and default seed issuers on serverless cold-start
try:
    init_db()
    _seed_issuers()
except Exception as e:
    print(f"[Vercel Cold Start] DB init warning: {e}")
