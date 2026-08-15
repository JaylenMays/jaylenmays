@echo off
title SETI Scholar
echo   SETI Scholar  [launcher v5]
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

if not exist node_modules (
    echo [!] The app at %CD% isn't installed yet.
    echo     Run "1 - First-Time Setup.bat" first, then try again.
    pause
    exit /b 1
)
if not exist .next (
    echo [!] Setup didn't finish here. Run "1 - First-Time Setup.bat" to completion first.
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
