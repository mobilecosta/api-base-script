@echo off
REM Vercel Deployment Verification Script (Windows)
REM This script verifies that your project is ready for Vercel deployment

setlocal enabledelayedexpansion

set CHECKS_PASSED=0
set CHECKS_FAILED=0
set WARNINGS=0

cls
echo.
echo ════════════════════════════════════════════════════════════════
echo   Vercel Deployment - Pre-Deployment Verification Script
echo ════════════════════════════════════════════════════════════════
echo.

REM Check for required files
echo ────────────────────────────────────────────────────────────────
echo 1^) Checking Project Structure
echo ────────────────────────────────────────────────────────────────
echo.

if exist "package.json" (
  echo [PASS] package.json exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] package.json not found
  set /a CHECKS_FAILED+=1
)

if exist "tsconfig.json" (
  echo [PASS] tsconfig.json exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] tsconfig.json not found
  set /a CHECKS_FAILED+=1
)

if exist "vercel.json" (
  echo [PASS] vercel.json exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] vercel.json not found
  set /a CHECKS_FAILED+=1
)

if exist ".vercelignore" (
  echo [PASS] .vercelignore exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] .vercelignore not found
  set /a CHECKS_FAILED+=1
)

if exist "src\" (
  echo [PASS] src directory exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] src directory not found
  set /a CHECKS_FAILED+=1
)

echo.
echo ────────────────────────────────────────────────────────────────
echo 2^) Checking Node.js and npm
echo ────────────────────────────────────────────────────────────────
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
  for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
  echo [PASS] Node.js installed: !NODE_VERSION!
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] Node.js not installed
  set /a CHECKS_FAILED+=1
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
  for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
  echo [PASS] npm installed: !NPM_VERSION!
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] npm not installed
  set /a CHECKS_FAILED+=1
)

echo.
echo ────────────────────────────────────────────────────────────────
echo 3^) Checking Build Configuration
echo ────────────────────────────────────────────────────────────────
echo.

findstr /M "\"build\":" package.json >nul 2>nul
if %errorlevel% equ 0 (
  echo [PASS] build script in package.json
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] build script not found in package.json
  set /a CHECKS_FAILED+=1
)

findstr /M "\"start\":" package.json >nul 2>nul
if %errorlevel% equ 0 (
  echo [PASS] start script in package.json
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] start script not found in package.json
  set /a CHECKS_FAILED+=1
)

findstr /M "\"main\": \"dist" package.json >nul 2>nul
if %errorlevel% equ 0 (
  echo [PASS] main entry points to dist directory
  set /a CHECKS_PASSED+=1
) else (
  echo [WARN] main entry may not point to dist directory
  set /a WARNINGS+=1
)

echo.
echo ────────────────────────────────────────────────────────────────
echo 4^) Checking Documentation
echo ────────────────────────────────────────────────────────────────
echo.

if exist "VERCEL_QUICK_START.md" (
  echo [PASS] VERCEL_QUICK_START.md exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] VERCEL_QUICK_START.md not found
  set /a CHECKS_FAILED+=1
)

if exist "VERCEL_DEPLOYMENT.md" (
  echo [PASS] VERCEL_DEPLOYMENT.md exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] VERCEL_DEPLOYMENT.md not found
  set /a CHECKS_FAILED+=1
)

if exist "VERCEL_CHECKLIST.md" (
  echo [PASS] VERCEL_CHECKLIST.md exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] VERCEL_CHECKLIST.md not found
  set /a CHECKS_FAILED+=1
)

if exist ".env.vercel" (
  echo [PASS] .env.vercel template exists
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] .env.vercel template not found
  set /a CHECKS_FAILED+=1
)

echo.
echo ────────────────────────────────────────────────────────────────
echo 5^) Checking Environment Variables
echo ────────────────────────────────────────────────────────────────
echo.

if exist ".env.example" (
  echo [PASS] .env.example exists
  set /a CHECKS_PASSED+=1
) else (
  echo [WARN] .env.example not found
  set /a WARNINGS+=1
)

echo.
echo ────────────────────────────────────────────────────────────────
echo 6^) Checking Git Configuration
echo ────────────────────────────────────────────────────────────────
echo.

if exist ".git\" (
  echo [PASS] Git repository initialized
  set /a CHECKS_PASSED+=1
) else (
  echo [FAIL] Git repository not initialized
  set /a CHECKS_FAILED+=1
)

if exist ".gitignore" (
  echo [PASS] .gitignore exists
  set /a CHECKS_PASSED+=1
) else (
  echo [WARN] .gitignore not found
  set /a WARNINGS+=1
)

echo.
echo ────────────────────────────────────────────────────────────────
echo 7^) Checking Helper Scripts
echo ────────────────────────────────────────────────────────────────
echo.

if exist "deploy.bat" (
  echo [PASS] deploy.bat exists
  set /a CHECKS_PASSED+=1
) else (
  echo [WARN] deploy.bat not found
  set /a WARNINGS+=1
)

if exist "deploy.sh" (
  echo [PASS] deploy.sh exists
  set /a CHECKS_PASSED+=1
) else (
  echo [WARN] deploy.sh not found
  set /a WARNINGS+=1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo Summary
echo ════════════════════════════════════════════════════════════════
echo.
echo Passed:   !CHECKS_PASSED!
echo Failed:   !CHECKS_FAILED!
echo Warnings: !WARNINGS!
echo.

if !CHECKS_FAILED! equ 0 (
  if !WARNINGS! equ 0 (
    echo ════════════════════════════════════════════════════════════════
    echo      [SUCCESS] All checks passed! Ready to deploy!
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo Next steps:
    echo   1. Read: VERCEL_QUICK_START.md
    echo   2. Run:  npm install ^&^& npm run build
    echo   3. Set environment variables in Vercel dashboard
    echo   4. Run:  vercel --prod
    echo.
  ) else (
    echo ════════════════════════════════════════════════════════════════
    echo    [WARNING] Some warnings found - review before deploying
    echo ════════════════════════════════════════════════════════════════
  )
) else (
  echo ════════════════════════════════════════════════════════════════
  echo             [FAILED] Fix issues before deploying
  echo ════════════════════════════════════════════════════════════════
)

echo.
pause
