@echo off
setlocal
title Election Buddy AI - Production Loader

echo ==========================================
echo    🗳️  ELECTION BUDDY AI - STARTUP
echo ==========================================

:: 1. Check Python
where py >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python 'py' not found.
    pause
    exit /b 1
)

:: 2. Setup Venv
if not exist "venv" (
    echo [INFO] Creating virtual environment...
    py -m venv venv
)

:: 3. Dependencies
echo [INFO] Updating Python dependencies...
venv\Scripts\python -m pip install -q --upgrade pip
venv\Scripts\pip install -q -r backend\requirements.txt

:: 4. .env
if not exist ".env" (
    if exist "backend\.env.example" copy backend\.env.example .env >nul
)

:: 5. Launch
echo.
echo [SUCCESS] System is ready!
echo [INFO] Opening Election Buddy AI at http://localhost:8000
echo.

:: Open browser automatically
start http://localhost:8000

:: Start Backend
venv\Scripts\python backend\main.py

pause
