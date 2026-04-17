# Deployment & Infrastructure

## Hosting Architecture

### Multi-Service Setup
```
┌─────────────────┐
│   Vercel        │ ← Next.js App (Frontend + API Routes)
└─────────────────┘
        │
        ├─────────┐
        │         │
        ▼         ▼
┌─────────┐  ┌──────────┐
│ Railway │  │ Pinecone │ ← Vector Database
│PostgreSQL│  └──────────┘
└─────────┘
        │
        ▼
┌─────────────┐
│   Upstash   │ ← Redis (Rate limiting, caching)
│   Redis     │
└─────────────┘
        │
        ▼
┌─────────────┐
│   Resend    │ ← Email service
└─────────────┘
```

---

## Service Selection Rationale

### Frontend & API: Vercel
**Why Vercel:**
- Native Next.js support (zero config)
- Edge network for global low latency
- Automatic HTTPS and CDN
- Preview deployments for PRs
- Generous free tier → paid scales smoothly
- Easy environment variable management

**Pricing:**
- **Hobby (Free)**: Good for development
- **Pro ($20/month)**: Production ready
- **Enterprise**: Scale as needed

---

### Database: Railway PostgreSQL
**Why Railway:**
- PostgreSQL 14+ support
- Automated backups
- Vertical and horizontal scaling
- Easy migration from dev to prod
- Better pricing than Supabase for this use case
- Connection pooling included

**Pricing:**
- **Free tier**: $5 credit/month (dev/testing)
- **Pay-as-you-go**: ~$10-30/month for MVP
- **Pro**: $20/month + usage

**Alternative:** Supabase (if need auth UI, real-time out of box)

---

### Vector Database: Pinecone
**Why Pinecone:**
- Purpose-built for vector search
- Managed service (no ops overhead)
- Fast semantic search
- Good SDK and documentation
- Scales automatically

**Pricing:**
- **Starter (Free)**: 1 index, 100K vectors
- **Standard (~$70/month)**: Production ready
- **Enterprise**: Custom

---

### Redis: Upstash
**Why Upstash:**
- Serverless Redis (pay-per-request)
- Global replication
- No connection limits
- REST API option (no persistent connections)
- Generous free tier

**Pricing:**
- **Free**: 10K commands/day
- **Pay-as-you-go**: $0.2 per 100K commands
- Much cheaper than Redis Cloud for MVP

---

### Email: Resend
**Why Resend:**
- Developer-friendly API
- React email templates
- Good deliverability
- Generous free tier
- Built by Vercel team (good integration)

**Pricing:**
- **Free**: 3K emails/month
- **Pro ($20/month)**: 50K emails/month

**Alternative:** SendGrid (more established, higher limits)

---

## Environment Setup

### Development Environment
```bash
# .env.local (local development)

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/leadqualification_dev"

# JWT Secrets (generate unique for dev)
JWT_ACCESS_SECRET="dev-access-secret-change-in-prod"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-prod"

# AI
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Vector DB
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="us-east-1-gcp"
PINECONE_INDEX_NAME="lead-profiles-dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="dev@yourapp.com"

# App Config
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
NEXT_PUBLIC_WIDGET_URL="http://localhost:3000/widget"
```

---

### Production Environment
```bash
# .env.production (Vercel environment variables)

# Database (Railway)
DATABASE_URL="postgresql://postgres:...@railway.app:5432/production"

# JWT Secrets (GENERATE SECURE ONES!)
# Run: openssl rand -base64 32
JWT_ACCESS_SECRET="[SECURE_RANDOM_STRING]"
JWT_REFRESH_SECRET="[SECURE_RANDOM_STRING]"

# AI
ANTHROPIC_API_KEY="sk-ant-api03-..."

# Vector DB
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="us-east-1-gcp"
PINECONE_INDEX_NAME="lead-profiles-prod"

# Redis (Upstash)
REDIS_URL="rediss://default:...@upstash.io:6379"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourapp.com"

# App Config
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://yourapp.com/api/v1"
NEXT_PUBLIC_WIDGET_URL="https://yourapp.com/widget"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
```

---

## Database Setup

### Local Development
```bash
# Install PostgreSQL locally (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb leadqualification_dev

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

---

### Production Database (Railway)

#### 1. Create Database
1. Go to Railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy DATABASE_URL from Railway dashboard

#### 2. Run Migrations
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

#### 3. Automated Backups
Railway includes automatic backups:
- Point-in-time recovery: 7 days
- Daily snapshots: 30 days
- Weekly snapshots: 1 year

**Manual backup script:**
```bash
#!/bin/bash
# backup-db.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload to S3 or other storage
aws s3 cp $BACKUP_FILE s3://your-backups/
```

---

## Deployment Process

### Git Workflow
```bash
# Development
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR → Vercel creates preview deployment
# Review → Merge to main

# Production deployment (automatic)
git checkout main
git pull
# Vercel auto-deploys main branch
```

---

### Vercel Setup

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Initial Deployment
```bash
# Login
vercel login

# Deploy
vercel

# Follow prompts to connect repo
```

#### 3. Configure Vercel
```bash
# Set environment variables
vercel env add DATABASE_URL production
vercel env add JWT_ACCESS_SECRET production
# ... add all production env vars

# Configure domains
vercel domains add yourapp.com
```

#### 4. Build Configuration
```json
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"], // US East
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
      - name: Run type check
        run: npm run type-check
        
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Database Migrations

### Development Workflow
```bash
# Create migration
npx prisma migrate dev --name add_user_preferences

# Reset database (if needed)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

---

### Production Workflow
```bash
# 1. Create migration locally
npx prisma migrate dev --name add_feature

# 2. Test migration
npm run test:db

# 3. Commit migration files
git add prisma/migrations/
git commit -m "Add migration: add_feature"

# 4. Deploy (automatic via CI/CD)
# Or manually:
npx prisma migrate deploy
```

---

### Zero-Downtime Migration Strategy

For breaking changes:
1. **Add new column** (nullable)
2. **Deploy code** that writes to both old and new
3. **Backfill data** via script
4. **Deploy code** that reads from new column
5. **Remove old column** in later migration

**Example:**
```sql
-- Migration 1: Add new column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Migration 2: (After backfill)
ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL;

-- Migration 3: (After code deployment)
ALTER TABLE users DROP COLUMN old_verified_column;
```

---

## Monitoring & Logging

### Error Tracking: Sentry

#### Setup
```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.token;
    }
    return event;
  },
});

// Usage
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'simulation',
      tenantId: tenant.id,
    },
  });
  throw error;
}
```

---

### Application Logging

```typescript
// lib/monitoring/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'lead-qualification' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('User logged in', {
  userId: user.id,
  tenantId: user.tenantId,
});

logger.error('AI request failed', {
  error: error.message,
  conversationId: conv.id,
});
```

---

### Performance Monitoring: Vercel Analytics

Automatically included with Vercel Pro:
- Core Web Vitals
- Real User Monitoring
- Server timing
- Edge function performance

**Custom metrics:**
```typescript
// Track custom events
export async function trackEvent(name: string, data: any) {
  if (process.env.NODE_ENV === 'production') {
    await fetch('https://vitals.vercel-analytics.com/v1/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: name,
        data,
      }),
    });
  }
}

// Usage
await trackEvent('conversation_started', {
  tenantId,
  scenarioType,
});
```

---

## Scaling Strategy

### Phase 1: MVP (0-100 users)
- **Vercel**: Hobby/Pro plan
- **Railway**: Starter database
- **Pinecone**: Standard tier
- **Redis**: Free tier
- **Total cost**: ~$150-200/month

**Capacity:**
- 10,000 conversations/month
- 100 tenants
- 1-2 second API response time

---

### Phase 2: Growth (100-1000 users)
- **Vercel**: Pro plan
- **Railway**: Scale database (2-4 CPUs, 4-8GB RAM)
- **Pinecone**: Standard tier (scale pods)
- **Redis**: Pro tier
- **Total cost**: ~$500-800/month

**Optimizations:**
- Enable database connection pooling
- Add Redis caching layer
- Optimize AI token usage
- CDN for widget script

---

### Phase 3: Scale (1000+ users)
- **Vercel**: Enterprise
- **Database**: Self-hosted PostgreSQL cluster or managed Supabase
- **Pinecone**: Enterprise tier
- **Redis**: Dedicated instance
- **Total cost**: $2,000+/month

**Infrastructure:**
- Separate API servers
- Message queue (BullMQ) for async jobs
- Dedicated AI inference (if cost-effective)
- Multi-region deployment

---

## Backup & Disaster Recovery

### Automated Backups

**Database:**
```bash
# Automated via Railway (no action needed)
# Manual verification:
railway db backup list
railway db backup restore <backup-id>
```

**Application State:**
```typescript
// Periodic export of critical data
async function exportTenantData(tenantId: string) {
  const data = {
    tenant: await prisma.tenant.findUnique({ where: { id: tenantId } }),
    profile: await prisma.businessProfile.findUnique({ where: { tenantId } }),
    simulations: await prisma.simulation.findMany({ where: { tenantId } }),
    conversations: await prisma.conversation.findMany({ where: { tenantId } }),
  };
  
  // Store in S3 or similar
  await uploadToStorage(`backups/${tenantId}-${Date.now()}.json`, JSON.stringify(data));
}
```

---

### Recovery Time Objectives (RTO/RPO)

**RTO (Recovery Time Objective):**
- Database restore: < 1 hour
- Full application: < 4 hours

**RPO (Recovery Point Objective):**
- Database: < 5 minutes (point-in-time recovery)
- Application state: < 24 hours

---

## Security in Production

### Secrets Management
```bash
# Never commit secrets!
# Use Vercel environment variables
vercel env add DATABASE_URL production

# For sensitive local development:
# Use .env.local (gitignored)
# Never use .env (can be committed)
```

---

### SSL/TLS
- Automatic via Vercel (Let's Encrypt)
- Force HTTPS in next.config.js:
```javascript
module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://yourapp.com/:path*',
        permanent: true,
      },
    ];
  },
};
```

---

### Rate Limiting in Production
```typescript
// Use Upstash Redis for distributed rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  // Continue...
}
```

---

## Health Checks & Uptime

### Health Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    // await redis.ping();
    
    // Check AI provider
    // const aiHealth = await checkAnthropicHealth();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up',
        ai: 'up',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

---

### Uptime Monitoring
Use external service:
- **UptimeRobot** (free, simple)
- **Pingdom** (advanced features)
- **Better Uptime** (modern UI)

Configure to check:
- `/api/health` every 5 minutes
- Alert if down for >5 minutes
- Alert to Slack/Email/SMS

---

## Deployment Checklist

### Pre-Launch
- [ ] All environment variables set in Vercel
- [ ] Database migrations run in production
- [ ] SSL certificate active
- [ ] Error tracking (Sentry) configured
- [ ] Monitoring dashboards set up
- [ ] Backup verification completed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Load testing completed (100 concurrent users)
- [ ] Email sending tested
- [ ] Widget embed tested on external site

### Launch Day
- [ ] Monitor error rates (Sentry)
- [ ] Monitor API latency (Vercel Analytics)
- [ ] Monitor database connections
- [ ] Monitor AI API usage/costs
- [ ] Check email deliverability
- [ ] Test critical user flows
- [ ] Watch for unusual traffic patterns

### Post-Launch
- [ ] Daily error review (first week)
- [ ] Performance optimization
- [ ] User feedback collection
- [ ] Cost monitoring and optimization
- [ ] Scale resources as needed

---

**Next Steps:**
1. Set up Vercel account and project
2. Create Railway database
3. Configure environment variables
4. Deploy to staging
5. Load test staging
6. Deploy to production
7. Monitor and optimize

---

**Document Status**: Complete - Ready for Implementation
**Last Updated**: March 2026
