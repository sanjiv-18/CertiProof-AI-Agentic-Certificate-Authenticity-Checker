# CertiProof AI — Setup & Deployment Guide

This guide details local development, testing, containerization, and production deployment for **CertiProof AI**.

---

## 1. Prerequisites

- **Python:** 3.11 or 3.12 (Vercel serverless compatible)
- **Node.js:** v18, v20, or v22
- **npm:** v9 or later
- **Git:** 2.x
- **Docker:** (Optional, for containerized execution)

---

## 2. Local Setup (Standard Environment)

### Step A: Clone the Repository
```bash
git clone https://github.com/sanjiv-18/CertiProof-AI-Agentic-Certificate-Authenticity-Checker.git
cd CertiProof-AI-Agentic-Certificate-Authenticity-Checker
```

### Step B: Backend Configuration & Installation

1. Navigate to the backend directory and create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   ```

2. Activate the virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **macOS / Linux:**
     ```bash
     source venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create local environment file (optional; defaults work out-of-the-box):
   ```bash
   cp .env.example .env
   ```

5. Launch the backend API server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Health Check:* Open `http://127.0.0.1:8000/api/health` in your browser. You should receive `{"status":"ok","service":"CertiProof AI","version":"1.0.0"}`.

---

### Step C: Frontend Configuration & Installation

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Access UI:* Navigate to `http://localhost:5173` to explore the CertiProof AI interface.

---

## 3. Quick Start via Convenience Scripts (Windows)

For rapid local startup on Windows, helper batch files are available in `scripts/`:

```cmd
:: Start Backend Server (runs on http://127.0.0.1:8000)
.\scripts\run_backend.bat

:: Start Frontend Server (runs on http://localhost:5173)
.\scripts\run_frontend.bat
```

*(Root forwarding launchers `run_backend.bat` and `run_frontend.bat` are also available for convenience).*

---

## 4. Docker & Containerized Execution

To run the entire system in isolated containers using Docker Compose:

```bash
docker compose up --build
```

- **Frontend:** Accessible at `http://localhost:5173`
- **Backend API:** Accessible at `http://localhost:8000`
- **Swagger Docs:** Accessible at `http://localhost:8000/docs`

To tear down containers:
```bash
docker compose down
```

---

## 5. Running Automated Tests

### Backend Unit & Integration Tests (Pytest)
```bash
# Run backend test suite
pytest backend/tests

# Run root integration test suite
pytest tests/test_integration.py -v
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 6. Vercel Production Deployment

CertiProof AI is configured for unified serverless deployment on Vercel:

1. Ensure the Vercel CLI is installed:
   ```bash
   npm install -g vercel
   ```

2. Deploy directly from repository root:
   ```bash
   vercel --prod
   ```

### Production Configuration Architecture
- `vercel.json` maps:
  - `/api/(.*)` $\rightarrow$ `api/index.py` (FastAPI Serverless runtime with Python 3.12)
  - `/(.*)` $\rightarrow$ `frontend/dist/$1` (Static SPA assets with client-side fallback)
- In production, SQLite automatically defaults to `/tmp/certiproof.db`.

---

## 7. Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `development` | Environment mode (`development` / `production`). |
| `APP_SECRET_KEY` | `dev-secret` | Cryptographic secret for signing sessions. |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed origins. |
| `DATABASE_URL` | `sqlite:///./certiproof.db` | SQLAlchemy connection string (uses `/tmp/certiproof.db` on Vercel). |
| `SCREENSHOTS_DIR` | `./screenshots` | Evidence directory for screenshots. |
| `PLAYWRIGHT_HEADLESS`| `1` | Run Playwright in headless mode (`1` = headless). |
