@echo off
title SETI Scholar - Stop
cd /d "%~dp0\.."

echo Stopping SETI Scholar...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5433 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>nul

echo Done - your data is saved in the .pgdata folder for next time.
timeout /t 4 >nul
exit /b 0
