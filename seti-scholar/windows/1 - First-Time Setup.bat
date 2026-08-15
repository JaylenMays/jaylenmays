@echo off
title SETI Scholar - First-Time Setup
echo ============================================
echo   SETI Scholar - one-time setup  [launcher v4]
echo ============================================
rem --- Find the app no matter where this file is run from ------------------
cd /d "%~dp0\.."
if not exist package.json (
    if exist "G:\Projects\seti-scholar\package.json" (
        cd /d "G:\Projects\seti-scholar"
    ) else (
        echo [!] Can't find the app. Expected it at G:\Projects\seti-scholar
        echo     ^(this launcher also works when placed inside the app's windows folder^)
        pause
        exit /b 1
    )
)

rem --- PostgreSQL cannot run with admin rights; drop elevation if present --
net session >nul 2>&1
if not errorlevel 1 (
    echo   Administrator mode detected - relaunching with normal rights...
    echo   ^(a new window will open - continue there^)
    > "%TEMP%\seti_relaunch.cmd" echo @call "%~f0"
    runas /trustlevel:0x20000 "%TEMP%\seti_relaunch.cmd"
    exit /b 0
)
echo   [running as normal user - good]
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [!] Node.js is not installed yet - install it, then run this again.
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
echo   Setup complete! Now run "2 - Open SETI Scholar.bat"
echo ============================================
pause
exit /b 0

:fail
echo.
echo [!] Something went wrong above. Screenshot this window and send it to Claude.
pause
exit /b 1
