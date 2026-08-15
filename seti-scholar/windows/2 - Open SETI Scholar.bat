@echo off
title SETI Scholar
echo   SETI Scholar  [launcher v4]
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

if not exist node_modules (
    echo [!] The app isn't installed yet in %CD%
    echo     Run "1 - First-Time Setup.bat" first, then try again.
    pause
    exit /b 1
)
if not exist .next (
    echo [!] Setup didn't finish. Run "1 - First-Time Setup.bat" to completion first.
    pause
    exit /b 1
)
if not exist .env copy .env.example .env >nul

start "SETI Scholar Server" /min cmd /k "npm run app:start"

echo Starting SETI Scholar... waiting for the server...
timeout /t 10 /nobreak >nul
start "" http://localhost:3000

echo.
echo SETI Scholar should now be open at http://localhost:3000
echo If the page says "can't be reached", wait 5 seconds and press Reload.
echo Keep the minimized "SETI Scholar Server" window open while using the app.
timeout /t 15 >nul
exit /b 0
