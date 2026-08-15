@echo off
title SETI Scholar - Stop
cd /d "%~dp0\.."

echo Stopping the SETI Scholar server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>nul

echo Stopping the database...
docker compose stop >nul 2>nul

echo Done - your data is saved and will be there next time you open the app.
timeout /t 4 >nul
exit /b 0
