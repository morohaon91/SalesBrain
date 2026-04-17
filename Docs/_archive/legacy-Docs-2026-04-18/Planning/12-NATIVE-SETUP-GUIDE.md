# Quick Setup - Native PostgreSQL & Redis

**Since you already have PostgreSQL and Redis installed on your network, skip Docker!**

---

## Prerequisites Checklist

✅ PostgreSQL installed and running
✅ Redis installed and running
✅ Node.js 18+ installed
✅ Git installed

---

## Step-by-Step Setup (15 minutes)

### 1. Verify Services Running

```bash
# Check PostgreSQL
pg_isready
# Expected: /tmp:5432 - accepting connections

# Check Redis
redis-cli ping
# Expected: PONG

# Check PostgreSQL version
psql --version
# Should be 14+ (12+ works too)
```

---

### 2. Create Database

```bash
# Create development database
createdb leadqualification_dev

# Verify it was created
psql -l | grep leadqualification_dev

# Optional: Create user if needed
# psql
# CREATE USER leadqualification WITH PASSWORD 'yourpassword';
# GRANT ALL PRIVILEGES ON DATABASE leadqualification_dev TO leadqualification;
# \q
```

---

### 3. Clone/Create Project

```bash
# Create project directory
mkdir -p ~/projects/lead-qualification
cd ~/projects/lead-qualification

# Initialize git
git init

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --app
```

---

### 4. Install Dependencies

```bash
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

npm install -D \
  @types/bcryptjs \
  @types/jsonwebtoken \
  prisma \
  vitest \
  @playwright/test \
  @faker-js/faker
```

---

### 5. Create .env.local

```bash
# Create environment file
cat > .env.local << 'EOF'
# Database (adjust username/password if needed)
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/leadqualification_dev"

# Redis (usually no password on local)
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generate these!)
JWT_ACCESS_SECRET="GENERATE_WITH_OPENSSL"
JWT_REFRESH_SECRET="GENERATE_WITH_OPENSSL"

# Anthropic AI (get from console.anthropic.com)
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Pinecone (get from pinecone.io - free tier)
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="us-east-1-gcp"
PINECONE_INDEX_NAME="lead-profiles-dev"

# Email (optional - get from resend.com)
RESEND_API_KEY="re_..."
EMAIL_FROM="dev@localhost"

# App Config
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
NEXT_PUBLIC_WIDGET_URL="http://localhost:3000/widget"
EOF
```

**Important: Replace placeholders!**

```bash
# Generate JWT secrets
openssl rand -base64 32  # Copy this for JWT_ACCESS_SECRET
openssl rand -base64 32  # Copy this for JWT_REFRESH_SECRET

# Update DATABASE_URL with your PostgreSQL credentials
# If using default PostgreSQL setup:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadqualification_dev"

# Edit .env.local and replace the values
nano .env.local  # or vim, code, etc.
```

---

### 6. Set Up Prisma

```bash
# Initialize Prisma
npx prisma init

# Copy the schema from 01-DATABASE-SCHEMA.md
# Replace contents of prisma/schema.prisma

# Run migration
npx prisma migrate dev --name init

# This will:
# ✅ Create all tables
# ✅ Set up relationships
# ✅ Generate Prisma Client
```

---

### 7. Create Seed File (Optional)

```bash
# Create prisma/seed.ts
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
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
  
  const password = await bcrypt.hash('Demo123!', 10);
  
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'demo@example.com',
      password,
      name: 'Demo User',
      role: 'OWNER',
      emailVerified: true,
    },
  });
  
  await prisma.businessProfile.create({
    data: {
      tenantId: tenant.id,
      isComplete: false,
      completionScore: 0,
    },
  });
  
  console.log('✅ Seed complete!');
  console.log('Login: demo@example.com / Demo123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
EOF

# Add to package.json
npm pkg set prisma.seed="ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"

# Install ts-node
npm install -D ts-node

# Run seed
npm run db:seed
```

---

### 8. Start Development

```bash
# Start Next.js
npm run dev

# Open browser
open http://localhost:3000
```

---

## Your Connection Strings

### PostgreSQL Connection String Format:
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]

Examples:
- Default user: postgresql://postgres:postgres@localhost:5432/leadqualification_dev
- Custom user: postgresql://myuser:mypass@localhost:5432/leadqualification_dev
- Network host: postgresql://user:pass@192.168.1.100:5432/leadqualification_dev
```

### Redis Connection String Format:
```
redis://[PASSWORD@][HOST]:[PORT]

Examples:
- No password: redis://localhost:6379
- With password: redis://:mypassword@localhost:6379
- Network host: redis://192.168.1.100:6379
```

---

## Troubleshooting

### PostgreSQL Issues

**Can't connect:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it (macOS/Homebrew):
brew services start postgresql@14

# Or Linux:
sudo systemctl start postgresql

# Or Windows:
# Start PostgreSQL service from Services
```

**Permission denied:**
```bash
# Check your PostgreSQL user
psql -U postgres

# If that doesn't work, check pg_hba.conf
# Find it with: psql -U postgres -c "SHOW hba_file"
# Add line: local all all trust
```

**Database doesn't exist:**
```bash
# Create it
createdb leadqualification_dev

# Or from psql:
psql -U postgres
CREATE DATABASE leadqualification_dev;
\q
```

---

### Redis Issues

**Can't connect:**
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it (macOS):
brew services start redis

# Or Linux:
sudo systemctl start redis

# Or manually:
redis-server
```

**Connection refused:**
```bash
# Check Redis is listening on correct port
redis-cli -p 6379 ping

# Check Redis config
redis-cli CONFIG GET bind
redis-cli CONFIG GET port

# Make sure it's binding to localhost or 0.0.0.0
```

---

### Prisma Issues

**Migration failed:**
```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name init

# Check DATABASE_URL is correct
echo $DATABASE_URL
```

**Can't generate client:**
```bash
# Manual generate
npx prisma generate

# Clear and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

---

## Daily Workflow

```bash
# 1. Make sure services are running
pg_isready && redis-cli ping

# 2. Start dev server
npm run dev

# 3. Code!

# 4. Stop (Ctrl+C when done)
# PostgreSQL and Redis keep running (that's fine)
```

---

## Database Management

### View database with Prisma Studio:
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Direct PostgreSQL access:
```bash
# Connect to database
psql leadqualification_dev

# Useful commands:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM "Tenant";  # Query (note quotes for capitalized tables)
\q               # Quit
```

### Direct Redis access:
```bash
# Connect to Redis
redis-cli

# Useful commands:
KEYS *           # List all keys
GET somekey      # Get value
FLUSHDB          # Clear database (careful!)
exit             # Quit
```

---

## Backup & Restore

### Backup database:
```bash
# Backup
pg_dump leadqualification_dev > backup.sql

# Restore
psql leadqualification_dev < backup.sql
```

### Export Redis data:
```bash
# Redis auto-saves to dump.rdb
# Find location:
redis-cli CONFIG GET dir

# Force save:
redis-cli SAVE
```

---

## No Docker Needed! ✅

You're all set without Docker. Your setup:

✅ Native PostgreSQL (faster, no overhead)
✅ Native Redis (faster, no overhead)
✅ Next.js dev server
✅ All running on your local network

**Cost: $0 for infrastructure + ~$5-10/month for AI API**

---

## Next Steps After This Guide

### Step 1: Database Initialization (COMPLETED)
```bash
✅ Database: PostgreSQL at localhost:5432
✅ Cache: Redis at localhost:6379
✅ Prisma schema created (prisma/schema.prisma)
```

### Step 2: Project Setup (COMPLETED)
```bash
✅ Next.js 14 project initialized
✅ TypeScript configured
✅ All dependencies installed
✅ Environment file created (.env.local)
✅ Folder structure created
```

### Step 3: Run Initial Migration & Seed (NEXT)
```bash
# In your project directory:
npm run db:migrate
npm run db:seed
```

### Step 4: Start Development
```bash
npm run dev
# Open http://localhost:3000
```

### Demo Credentials After Seed
```
Email: demo@example.com
Password: Demo123!
```

---

## Complete Setup Summary

Your project structure is ready:

```
SalesBrain/
├── app/                    # Next.js routes & API
├── components/             # React components
├── lib/                    # Utilities (Prisma, helpers)
├── prisma/                 # Database schema & migrations
├── __tests__/              # Unit tests
├── e2e/                    # End-to-end tests
├── package.json            # All dependencies
├── .env.local              # Configuration (with placeholders)
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config
├── vitest.config.ts        # Unit test config
└── playwright.config.ts    # E2E test config
```

---

## Next Development Phase

You're ready to start building:

1. **Auth System** (Step 3) - Users can register/login
2. **Simulation Engine** (Step 5) - AI conversations with clients
3. **Lead Qualification** (Step 7) - AI analyzes conversations
4. **Dashboard** (Step 11) - Users see their leads
5. **Landing Page** (Step 10) - Public chat interface

See `MVP TECHNICAL PLANNING.md` for full roadmap.

---

**You're ahead of the game - no Docker setup time needed!** 🚀
