@echo off
title SETI Scholar
cd /d "%~dp0\.."

rem --- Sanity checks: has First-Time Setup been run? -----------------------
if not exist node_modules (
    echo [!] The app isn't installed yet.
    echo     Run "1 - First-Time Setup.bat" first ^(one time only^), then try again.
    pause
    exit /b 1
)
if not exist .next (
    echo [!] The app hasn't been built yet - First-Time Setup didn't finish.
    echo     Run "1 - First-Time Setup.bat" and let it complete to "Setup complete!".
    pause
    exit /b 1
)
if not exist .env (
    copy .env.example .env >nul
)

rem --- Start the database ---------------------------------------------------
docker compose up -d
if errorlevel 1 (
    echo [!] Docker isn't running. Open Docker Desktop, wait for it to say
    echo     "Docker Desktop is running", then double-click this file again.
    pause
    exit /b 1
)

rem --- Start the app server (window STAYS OPEN so errors are visible) ------
start "SETI Scholar Server" /min cmd /k "npm run start"

echo Starting SETI Scholar... waiting for the server...
timeout /t 8 /nobreak >nul
start "" http://localhost:3000

echo.
echo SETI Scholar should now be open at http://localhost:3000
echo If the page says "can't be reached", wait 5 seconds and press Reload.
echo Keep the minimized "SETI Scholar Server" window open while using the app.
echo If it still fails, open that minimized window from the taskbar and
echo screenshot the error text for Claude.
timeout /t 10 >nul
exit /b 0
