@echo off
title Health Advisor AI - Automated Setup
color 0A
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║       Health Advisor AI - Local Setup        ║
echo  ║          Fully Automated Installer           ║
echo  ╚══════════════════════════════════════════════╝
echo.

:: ──────────────────────────────────────────────
:: STEP 1: Check if Node.js is installed
:: ──────────────────────────────────────────────
echo  [1/3] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo  ╔══════════════════════════════════════════════╗
    echo  ║  ERROR: Node.js is NOT installed!            ║
    echo  ║                                              ║
    echo  ║  Please install it from:                     ║
    echo  ║  https://nodejs.org                          ║
    echo  ║                                              ║
    echo  ║  Then run this script again.                 ║
    echo  ╚══════════════════════════════════════════════╝
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo        Found Node.js %%v

:: ──────────────────────────────────────────────
:: STEP 2: Install Node.js dependencies
:: ──────────────────────────────────────────────
echo.
echo  [2/3] Checking Node.js dependencies...
if not exist "node_modules" (
    echo        Installing npm packages...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo  ERROR: npm install failed.
        pause
        exit /b 1
    )
    echo        Dependencies installed.
) else (
    echo        Dependencies already installed.
)

:: ──────────────────────────────────────────────
:: STEP 3: Start backend and open browser
:: ──────────────────────────────────────────────
echo.
echo  [3/3] Starting Health Advisor...
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║                                              ║
echo  ║   Health Advisor is starting!                ║
echo  ║                                              ║
echo  ║   Frontend: http://localhost:3005             ║
echo  ║   Backend:  http://localhost:3005             ║
echo  ║   API:      Google Gemini                    ║
echo  ║                                              ║
echo  ║   Press Ctrl+C to stop the server            ║
echo  ║                                              ║
echo  ╚══════════════════════════════════════════════╝
echo.

:: Check for GEMINI_API_KEY
if "%GEMINI_API_KEY%"=="" (
    echo  WARNING: GEMINI_API_KEY environment variable is not set!
    echo  The application requires this key to function properly.
    echo.
)

:: Open browser after a short delay
start "" http://localhost:3005

:: Start the Node.js server (this blocks — keeps window open)
node server.js
