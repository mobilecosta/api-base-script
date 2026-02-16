#!/usr/bin/env bash

# Vercel Deployment Verification Script
# This script verifies that your project is ready for Vercel deployment

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║   Vercel Deployment - Pre-Deployment Verification Script      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_passed() {
  echo -e "${GREEN}✓${NC} $1"
  ((CHECKS_PASSED++))
}

check_failed() {
  echo -e "${RED}✗${NC} $1"
  ((CHECKS_FAILED++))
}

check_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Checking Project Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for required files
if [ -f "package.json" ]; then
  check_passed "package.json exists"
else
  check_failed "package.json not found"
fi

if [ -f "tsconfig.json" ]; then
  check_passed "tsconfig.json exists"
else
  check_failed "tsconfig.json not found"
fi

if [ -f "vercel.json" ]; then
  check_passed "vercel.json exists"
else
  check_failed "vercel.json not found"
fi

if [ -f ".vercelignore" ]; then
  check_passed ".vercelignore exists"
else
  check_failed ".vercelignore not found"
fi

if [ -d "src" ]; then
  check_passed "src/ directory exists"
else
  check_failed "src/ directory not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Checking Node.js and npm"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  check_passed "Node.js installed: $NODE_VERSION"
else
  check_failed "Node.js not installed"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  check_passed "npm installed: $NPM_VERSION"
else
  check_failed "npm not installed"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Checking Build Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q '"build":' package.json; then
  check_passed "build script in package.json"
else
  check_failed "build script not found in package.json"
fi

if grep -q '"start":' package.json; then
  check_passed "start script in package.json"
else
  check_failed "start script not found in package.json"
fi

if grep -q '"main": "dist' package.json; then
  check_passed "main entry points to dist directory"
else
  check_warning "main entry may not point to dist directory"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Checking Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "VERCEL_QUICK_START.md" ]; then
  check_passed "VERCEL_QUICK_START.md exists"
else
  check_failed "VERCEL_QUICK_START.md not found"
fi

if [ -f "VERCEL_DEPLOYMENT.md" ]; then
  check_passed "VERCEL_DEPLOYMENT.md exists"
else
  check_failed "VERCEL_DEPLOYMENT.md not found"
fi

if [ -f "VERCEL_CHECKLIST.md" ]; then
  check_passed "VERCEL_CHECKLIST.md exists"
else
  check_failed "VERCEL_CHECKLIST.md not found"
fi

if [ -f ".env.vercel" ]; then
  check_passed ".env.vercel template exists"
else
  check_failed ".env.vercel template not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  Checking Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env.example" ]; then
  check_passed ".env.example exists"
  if grep -q "SUPABASE_URL" .env.example; then
    check_passed "SUPABASE_URL in .env.example"
  else
    check_failed "SUPABASE_URL not in .env.example"
  fi
else
  check_warning ".env.example not found (required for documentation)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Checking Git Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".git" ]; then
  check_passed "Git repository initialized"
else
  check_failed "Git repository not initialized"
fi

if [ -f ".gitignore" ]; then
  check_passed ".gitignore exists"
  if grep -q ".env" .gitignore; then
    check_passed ".env is in .gitignore"
  else
    check_warning ".env may not be in .gitignore"
  fi
else
  check_warning ".gitignore not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  Checking Helper Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "deploy.sh" ]; then
  check_passed "deploy.sh exists"
else
  check_warning "deploy.sh not found"
fi

if [ -f "deploy.bat" ]; then
  check_passed "deploy.bat exists"
else
  check_warning "deploy.bat not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo -e "${GREEN}Passed${NC}: $CHECKS_PASSED"
echo -e "${RED}Failed${NC}: $CHECKS_FAILED"
echo -e "${YELLOW}Warnings${NC}: $WARNINGS"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║              ✅ All checks passed! Ready to deploy!           ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "  1. Read: VERCEL_QUICK_START.md"
    echo "  2. Run:  npm install && npm run build"
    echo "  3. Set environment variables in Vercel dashboard"
    echo "  4. Run:  vercel --prod"
    echo ""
    exit 0
  else
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║    ⚠️  Some warnings found - review before deploying         ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    exit 0
  fi
else
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║            ❌ Fix issues before deploying                    ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  exit 1
fi
