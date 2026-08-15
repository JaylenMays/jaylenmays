@echo off
title SETI Scholar - First-Time Setup
cd /d "%~dp0\.."

rem --- PostgreSQL refuses to run with admin rights; auto-drop elevation ----
net session >nul 2>&1
if not errorlevel 1 (
    echo Administrator mode detected - restarting without admin rights...
    runas /trustlevel:0x20000 "cmd /c \"\"%~f0\"\""
    exit /b 0
)

echo ============================================
echo   SETI Scholar - one-time setup
echo   (only requirement: Node.js)
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js is not installed yet.
    echo     Install it ^(the .msi Claude sent, or nodejs.org^), then run this again.
    start https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Installing the app (a few minutes the first time)...
call npm install --no-audit --no-fund
if errorlevel 1 goto :fail

echo [2/4] Creating local configuration...
if not exist .env copy .env.example .env >nul

echo [3/4] Setting up the built-in database, lessons, and your ASU degree plan...
call npm run app:setup
if errorlevel 1 goto :fail

echo [4/4] Building the app for fast startup...
call npm run build
if errorlevel 1 goto :fail

echo.
echo ============================================
echo   Setup complete!
echo   Double-click "2 - Open SETI Scholar.bat" to use the app.
echo   (right-click it and "Send to Desktop" for a shortcut)
echo ============================================
pause
exit /b 0

:fail
echo.
echo [!] Something went wrong above. Screenshot this window and send it to Claude.
pause
exit /b 1
