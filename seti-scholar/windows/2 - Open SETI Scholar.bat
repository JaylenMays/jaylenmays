@echo off
title SETI Scholar
cd /d "%~dp0\.."

rem Start the database if it isn't already running.
docker compose up -d >nul 2>nul

rem Start the app server in its own minimized window (leave it open while using the app).
start "SETI Scholar Server" /min cmd /c "npm run start"

echo Starting SETI Scholar...
timeout /t 5 /nobreak >nul
start "" http://localhost:3000

echo.
echo SETI Scholar is opening in your browser at http://localhost:3000
echo Keep the minimized "SETI Scholar Server" window open while you use the app.
echo To stop everything later, run "3 - Stop SETI Scholar.bat".
timeout /t 8 >nul
exit /b 0
