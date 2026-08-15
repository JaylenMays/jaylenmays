@echo off
title SETI Scholar - First-Time Setup
cd /d "%~dp0\.."

echo ============================================
echo   SETI Scholar - one-time setup
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js is not installed.
    echo     Opening the download page - install the LTS version, then run this again.
    start https://nodejs.org
    pause
    exit /b 1
)

where docker >nul 2>nul
if errorlevel 1 (
    echo [!] Docker Desktop is not installed.
    echo     Opening the download page - install it, start it once, then run this again.
    start https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [1/6] Installing dependencies (a few minutes the first time)...
call npm install --no-audit --no-fund
if errorlevel 1 goto :fail

echo [2/6] Creating local configuration...
if not exist .env copy .env.example .env >nul

echo [3/6] Starting the database (Docker)...
docker compose up -d
if errorlevel 1 (
    echo [!] Docker didn't respond. Make sure Docker Desktop is RUNNING, then re-run this.
    pause
    exit /b 1
)
timeout /t 6 /nobreak >nul

echo [4/6] Creating database tables...
call npx prisma db push
if errorlevel 1 goto :fail

echo [5/6] Loading lessons, quizzes, and your official ASU degree plan...
call npm run db:seed
call npm run import:asu-map

echo [6/6] Building the app for fast startup...
call npm run build
if errorlevel 1 goto :fail

echo.
echo ============================================
echo   Setup complete!
echo   From now on, double-click "2 - Open SETI Scholar.bat"
echo   (right-click it and "Send to Desktop" to make a shortcut)
echo ============================================
pause
exit /b 0

:fail
echo.
echo [!] Something went wrong above. Take a screenshot and ask Claude for help.
pause
exit /b 1
