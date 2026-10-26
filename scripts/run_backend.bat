@echo off
echo ===================================================
echo Starting CertiProof AI Backend Server...
echo ===================================================
cd /d "%~dp0..\backend"
if exist ".\venv\Scripts\activate.bat" (
    call .\venv\Scripts\activate.bat
)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
