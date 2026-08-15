@echo off
title SETI Scholar - First-Time Setup
echo ============================================
echo   SETI Scholar - one-time setup  [launcher v5]
echo ============================================
rem --- Find the app wherever it actually is --------------------------------
set "APPDIR="
if exist "%~dp0..\package.json" set "APPDIR=%~dp0.."
if not defined APPDIR if exist "%~dp0package.json" set "APPDIR=%~dp0."
if not defined APPDIR (
    echo   Searching your PC for the SETI Scholar app folder...
    > "%TEMP%\seti_find.ps1" echo $roots=@('G:\Projects', 'G:\', ($env:USERPROFILE+'\Downloads'), ($env:USERPROFILE+'\Desktop'), ($env:USERPROFILE+'\Documents'))
    >> "%TEMP%\seti_find.ps1" echo $c=foreach($r in $roots){ Get-ChildItem -Path $r -Recurse -Depth 3 -Filter package.json -File -ErrorAction SilentlyContinue }
    >> "%TEMP%\seti_find.ps1" echo $m=$c ^| Where-Object { $_.FullName -notmatch 'node_modules' } ^| Where-Object { Select-String -Path $_.FullName -Pattern 'app:setup' -Quiet }
    >> "%TEMP%\seti_find.ps1" echo $best=($m ^| Where-Object { Test-Path (Join-Path $_.DirectoryName 'node_modules') } ^| Select-Object -First 1)
    >> "%TEMP%\seti_find.ps1" echo if(-not $best){ $best = $m ^| Select-Object -First 1 }
    >> "%TEMP%\seti_find.ps1" echo if($best){ $best.DirectoryName }
    for /f "usebackq delims=" %%P in (`powershell -NoProfile -ExecutionPolicy Bypass -File "%TEMP%\seti_find.ps1"`) do set "APPDIR=%%P"
)
if not defined APPDIR (
    echo [!] Couldn't find the SETI Scholar app anywhere in G:\, Downloads,
    echo     Desktop, or Documents. Tell Claude - include this message.
    pause
    exit /b 1
)
cd /d "%APPDIR%"
echo   Found app at: %CD%
echo.

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
