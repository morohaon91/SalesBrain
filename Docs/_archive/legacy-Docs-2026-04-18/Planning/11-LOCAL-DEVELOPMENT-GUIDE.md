# Local Development Setup Guide

## Overview

This guide walks you through setting up the complete development environment on your local machine. **You'll only pay for AI API calls (~$5-10/month during development).**

---

## Prerequisites

### Required Software:
- **Node.js 18+** ([download](https://nodejs.org/))
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop/))
- **Git** ([download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Optional but Recommended:
- **TablePlus** or **pgAdmin** (database GUI)
- **Postman** or **Insomnia** (API testing)
- **Redis Insight** (Redis GUI)

---

## Quick Start (TL;DR)

```bash
# 1. Clone your repo
git clone <your-repo-url>
cd lead-qualification-platform

# 2. Install dependencies
npm install

# 3. Start services (PostgreSQL + Redis)
docker-compose up -d

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed database (optional)
npm run db:seed

# 7. Start development server
npm run dev

# 8. Open browser
open http://localhost:3000
```

**Done!** You're now running everything locally.

---

## Detailed Setup

### Step 1: Install Node.js

```bash
# Check if already installed
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher

# If not installed:
# macOS (with Homebrew)
brew install node@18

# Windows (with Chocolatey)
choco install nodejs-lts

# Or download from nodejs.org
```

---

### Step 2: Install Docker Desktop

1. Download from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Verify installation:

```bash
docker --version
docker-compose --version
```

---

### Step 3: Clone Repository

```bash
# Create project directory
mkdir ~/projects
cd ~/projects

# Initialize git repo
git init lead-qualification-platform
cd lead-qualification-platform

# Or clone if you already pushed to GitHub
git clone https://github.com/yourusername/lead-qualification-platform
cd lead-qualification-platform
```

---

### Step 4: Initialize Next.js Project

```bash
# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --app --src-dir

# When prompted:
# ✓ Would you like to use ESLint? Yes
# ✓ Would you like to use `src/` directory? No (we'll use /app)
# ✓ Would you like to use App Router? Yes
# ✓ Would you like to customize the default import alias? No
```

---

### Step 5: Install Dependencies

```bash
# Core dependencies
npm install \
  @prisma/client \
  @tanstack/react-query \
  @anthropic-ai/sdk \
  bcryptjs \
  jsonwebtoken \
  zod \
  react-hook-form \
  @hookform/resolvers \
  socket.io \
  socket.io-client \
  ioredis \
  resend \
  recharts \
  lucide-react \
  clsx \
  tailwind-merge \
  date-fns

# Dev dependencies
npm install -D \
  @types/bcryptjs \
  @types/jsonwebtoken \
  prisma \
  vitest \
  @vitest/ui \
  playwright \
  @playwright/test \
  @faker-js/faker \
  typescript \
  @types/node \
  @types/react
```

---

### Step 6: Copy Docker Compose File

Create `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: leadqualification-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: leadqualification_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: leadqualification-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  redis_data:
```

---

### Step 7: Start Services

**Option A: Using Docker (Recommended for first-time setup)**

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify they're running
docker ps

# You should see:
# - leadqualification-db (postgres)
# - leadqualification-redis (redis)

# Check logs if issues
docker-compose logs postgres
docker-compose logs redis
```

**Option B: Using Native Installation (If already installed)**

```bash
# If you already have PostgreSQL and Redis running natively:

# Check PostgreSQL is running
pg_isready
# Should output: accepting connections

# Check Redis is running
redis-cli ping
# Should output: PONG

# Create database
createdb leadqualification_dev

# No need for docker-compose!
# Skip to Step 8 and update .env.local URLs
```

---

### Step 8: Environment Variables

Create `.env.local`:

**If using Docker (docker-compose):**
```bash
# Database (Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadqualification_dev"

# Redis (Docker)
REDIS_URL="redis://localhost:6379"
```

**If using native PostgreSQL and Redis:**
```bash
# Database (Native - adjust user/password to match your setup)
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/leadqualification_dev"

# Redis (Native - usually no password)
REDIS_URL="redis://localhost:6379"

# Or if you set a Redis password:
# REDIS_URL="redis://:YOUR_PASSWORD@localhost:6379"
```

**Common for both (continue with these):**
```bash
# JWT Secrets (generate new ones!)
# Run: openssl rand -base64 32
JWT_ACCESS_SECRET="your-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-api03-..."  # Get from console.anthropic.com

# Pinecone (free tier)
PINECONE_API_KEY="..."  # Get from pinecone.io
PINECONE_ENVIRONMENT="us-east-1-gcp"
PINECONE_INDEX_NAME="lead-profiles-dev"

# Email (optional for dev)
RESEND_API_KEY="re_..."  # Get from resend.com (free tier)
EMAIL_FROM="dev@localhost"

# App Config
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
NEXT_PUBLIC_WIDGET_URL="http://localhost:3000/widget"
```

### Generate Secrets:

```bash
# Generate JWT secrets
openssl rand -base64 32  # Copy this for JWT_ACCESS_SECRET
openssl rand -base64 32  # Copy this for JWT_REFRESH_SECRET
```

---

### Step 9: Set Up Prisma

Create `prisma/schema.prisma` (copy from `01-DATABASE-SCHEMA.md`):

```bash
# Initialize Prisma
npx prisma init

# The schema.prisma file is created at prisma/schema.prisma
# Replace its contents with the schema from 01-DATABASE-SCHEMA.md
```

Generate first migration:

```bash
# Create and run migration
npx prisma migrate dev --name init

# This will:
# 1. Create migration files
# 2. Apply migration to database
# 3. Generate Prisma Client
```

---

### Step 10: Seed Database (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      businessName: 'Demo Consulting',
      industry: 'Business Consulting',
      subscriptionTier: 'TRIAL',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      widgetEnabled: true,
    },
  });
  
  // Create demo user
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'demo@example.com',
      password: await hashPassword('Demo123!'),
      name: 'Demo User',
      role: 'OWNER',
      emailVerified: true,
    },
  });
  
  // Create business profile
  await prisma.businessProfile.create({
    data: {
      tenantId: tenant.id,
      isComplete: false,
      completionScore: 0,
    },
  });
  
  console.log('Seeding complete!');
  console.log(`Demo user: demo@example.com / Demo123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Run seed:

```bash
npm install -D ts-node
npm run db:seed
```

---

### Step 11: Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Server starts on http://localhost:3000
```

Open browser:
```
http://localhost:3000
```

You should see the Next.js welcome page!

---

## Development Workflow

### Daily Workflow:

**If using Docker:**
```bash
# 1. Start services (if not running)
docker-compose up -d

# 2. Start dev server
npm run dev

# 3. Code away! (auto-reloads on changes)

# 4. Stop when done (Ctrl+C)

# 5. Stop services (optional)
docker-compose down
```

**If using native PostgreSQL/Redis:**
```bash
# 1. Verify services are running
pg_isready  # PostgreSQL
redis-cli ping  # Redis

# 2. Start dev server
npm run dev

# 3. Code away! (auto-reloads on changes)

# 4. Stop when done (Ctrl+C)
# Your PostgreSQL and Redis stay running (that's fine!)
```

---

### Database Management:

```bash
# View database with Prisma Studio
npx prisma studio
# Opens GUI at http://localhost:5555

# Run new migration
npx prisma migrate dev --name add_feature

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

---

### API Testing:

```bash
# Install REST client
npm install -D @rest-client/core

# Or use Postman/Insomnia
# Import collection from docs/api-collection.json (create this)
```

Test endpoint:

```bash
# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "businessName": "Test Business"
  }'
```

---

## Troubleshooting

### Issue: Docker containers won't start

```bash
# Check if ports are already in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill processes using those ports
kill -9 <PID>

# Or change ports in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

---

### Issue: Database connection failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs leadqualification-db

# Restart container
docker-compose restart postgres

# Verify connection
docker exec -it leadqualification-db psql -U postgres -d leadqualification_dev
```

---

### Issue: Prisma migrations failing

```bash
# Check current migration status
npx prisma migrate status

# If stuck, reset and reapply
npx prisma migrate reset
npx prisma migrate dev

# If production, never use reset! Use:
npx prisma migrate deploy
```

---

### Issue: Module not found errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or run Next.js on different port
npm run dev -- -p 3001
```

---

## Testing Locally

### Unit Tests:

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

### E2E Tests:

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI (debugging)
npm run test:e2e:ui
```

---

## Accessing Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Next.js App** | http://localhost:3000 | - |
| **Prisma Studio** | http://localhost:5555 | - |
| **PostgreSQL** | localhost:5432 | postgres/postgres |
| **Redis** | localhost:6379 | (no auth) |

---

## VS Code Extensions (Recommended)

Install these for better DX:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-playwright.playwright",
    "vitest.explorer"
  ]
}
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/user-auth

# Make changes
git add .
git commit -m "Add user authentication"

# Push to remote
git push origin feature/user-auth

# Create PR on GitHub
# After merge, pull main
git checkout main
git pull origin main
```

---

## Cost Summary (Local Development)

| Service | Cost |
|---------|------|
| **PostgreSQL** | $0 (Docker) |
| **Redis** | $0 (Docker) |
| **Anthropic API** | ~$5-10/month (testing) |
| **Pinecone** | $0 (free tier, 100K vectors) |
| **Resend Email** | $0 (free tier, 3K emails) |
| **Vercel Deploy** | $0 (hobby tier for preview) |
| **Total** | **~$5-10/month** |

---

## What's NOT Local

These services require cloud/API access even in development:

### 1. Anthropic AI ($5-10/month)
- No local alternative for Claude
- Use real API key
- Monitor usage at console.anthropic.com

### 2. Pinecone (Free Tier)
- Free tier: 1 index, 100K vectors
- Perfect for development
- Create account at pinecone.io

### 3. Resend Email (Optional)
- Free tier: 3K emails/month
- Or just console.log emails in dev
- Create account at resend.com

---

## Migration to Cloud

When ready to deploy:

### Staging Environment:
```bash
# Deploy to Vercel (staging)
vercel

# It will:
# 1. Build Next.js app
# 2. Deploy to Vercel
# 3. Give you preview URL

# Set environment variables in Vercel dashboard
```

### Production Environment:
```bash
# Deploy to production
vercel --prod

# Connect production database (Railway/Supabase)
# Run production migrations
# Set all production env vars
```

---

## Backup and Restore

### Backup Local Database:

```bash
# Export database
docker exec leadqualification-db pg_dump \
  -U postgres leadqualification_dev > backup.sql

# Restore from backup
docker exec -i leadqualification-db psql \
  -U postgres leadqualification_dev < backup.sql
```

---

## Clean Up

### Stop Everything:

```bash
# Stop Next.js (Ctrl+C in terminal)

# Stop Docker services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v
```

### Complete Reset:

```bash
# Remove node_modules
rm -rf node_modules

# Remove Docker volumes
docker-compose down -v

# Remove .next cache
rm -rf .next

# Start fresh
npm install
docker-compose up -d
npx prisma migrate dev
```

---

## Tips & Best Practices

### 1. Use Git Branches
```bash
# Never commit directly to main
git checkout -b feature/my-feature
```

### 2. Commit Often
```bash
# Small, focused commits
git commit -m "Add user registration endpoint"
git commit -m "Add registration tests"
```

### 3. Keep .env.local Secret
```bash
# Never commit .env.local!
# It's in .gitignore by default

# Create .env.example for others:
# DATABASE_URL="postgresql://..."
# API_KEY="your-key-here"
```

### 4. Monitor AI Costs
```bash
# Check Anthropic usage daily during development
# Set up billing alerts at $10, $25, $50
```

### 5. Test Database Migrations
```bash
# Always test migrations can be reversed
npx prisma migrate dev
npx prisma migrate reset
npx prisma migrate dev  # Should work!
```

---

## Next Steps

After setup:

1. ✅ **Verify everything works**
   - Register a user
   - Login
   - Check database in Prisma Studio

2. ✅ **Follow the roadmap**
   - Start with Week 1 tasks
   - Build one feature at a time

3. ✅ **Test as you go**
   - Write tests for critical features
   - Run tests before commits

4. ✅ **Deploy early**
   - Deploy to Vercel staging after Week 2
   - Catch deployment issues early

---

**You're all set!** Everything runs locally, and you only pay for AI API calls during development.

**Document Status**: Complete Local Development Guide
**Setup Time**: ~30-60 minutes first time
**Daily Startup Time**: ~30 seconds (docker-compose up + npm run dev)
