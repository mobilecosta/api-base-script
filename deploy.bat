@echo off

REM Vercel Deployment Helper Script for Windows
REM This script automates the deployment process to Vercel

setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════════════════
echo      Authentication API - Vercel Deployment Helper (Windows)
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if node_modules exists
if not exist "node_modules" (
  echo 📦 Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo ❌ npm install failed
    exit /b 1
  )
)

REM Build the project
echo.
echo 🔨 Building TypeScript...
call npm run build

REM Check if dist directory exists
if not exist "dist" (
  echo.
  echo ❌ Build failed - dist directory not created
  exit /b 1
)

echo ✅ Build successful
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
  echo 📥 Installing Vercel CLI...
  call npm install -g vercel
)

echo.
echo ════════════════════════════════════════════════════════════════
echo                      Deployment Options
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Deploy to preview ^(staging^)
echo 2. Deploy to production
echo 3. Just verify build ^(don't deploy^)
echo 4. Exit
echo.

set /p option="Select option (1-4): "

if "%option%"=="1" (
  echo.
  echo 🚀 Deploying to preview environment...
  call vercel
  goto success
)

if "%option%"=="2" (
  echo.
  echo 🚀 Deploying to production...
  call vercel --prod
  goto success
)

if "%option%"=="3" (
  echo.
  echo ✅ Build verified successfully. Ready to deploy manually.
  echo.
  echo To deploy, run:
  echo   vercel          ^(Preview^)
  echo   vercel --prod   ^(Production^)
  exit /b 0
)

if "%option%"=="4" (
  echo Cancelled
  exit /b 0
)

echo Invalid option
exit /b 1

:success
echo.
echo ════════════════════════════════════════════════════════════════
echo                    Deployment Complete!
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ Next steps:
echo    1. Check deployment URL in output above
echo    2. Test API: curl https://[your-domain]/api/auth/health
echo    3. View Swagger: https://[your-domain]/api-docs
echo    4. Update frontend config with new API URL
echo.
echo ════════════════════════════════════════════════════════════════
echo.

endlocal
