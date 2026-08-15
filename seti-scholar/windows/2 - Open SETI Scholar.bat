@echo off
title SETI Scholar
cd /d "%~dp0\.."

rem --- PostgreSQL refuses to run with admin rights; auto-drop elevation ----
net session >nul 2>&1
if not errorlevel 1 (
    echo Administrator mode detected - restarting without admin rights...
    runas /trustlevel:0x20000 "cmd /c \"\"%~f0\"\""
    exit /b 0
)

if not exist node_modules (
    echo [!] The app isn't installed yet.
    echo     Run "1 - First-Time Setup.bat" first ^(one time only^), then try again.
    pause
    exit /b 1
)
if not exist .next (
    echo [!] Setup didn't finish. Run "1 - First-Time Setup.bat" to completion first.
    pause
    exit /b 1
)
if not exist .env copy .env.example .env >nul

rem Start database + app server together (window stays open; errors visible there).
start "SETI Scholar Server" /min cmd /k "npm run app:start"

echo Starting SETI Scholar... waiting for the server...
timeout /t 10 /nobreak >nul
start "" http://localhost:3000

echo.
echo SETI Scholar should now be open at http://localhost:3000
echo If the page says "can't be reached", wait 5 seconds and press Reload.
echo Keep the minimized "SETI Scholar Server" window open while using the app.
timeout /t 10 >nul
exit /b 0
