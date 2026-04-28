# SalesBrain - AI Lead Qualification Platform

AI-powered lead qualification platform for freelancers and agencies. Uses Claude AI to simulate client conversations and automatically qualify leads.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL 14+
- **Cache**: Redis (optional / future)
- **ORM**: Prisma
- **AI**: Anthropic Claude API
- **Vector DB**: Pinecone
- **Real-time**: Socket.io
- **Email**: Resend
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS
- **i18n**: react-i18next — strings in `locales/en` and `locales/he`; language in `localStorage` (`language`), Hebrew sets `dir="rtl"` on `<html>` via `I18nProvider`.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ running at `localhost:5432`
- Redis running at `localhost:6379` (optional / future)
- Anthropic API key (from console.anthropic.com)

## Quick Start

### 1. Setup environment (two files only)

Configuration lives in **only** these files at the repo root:

| File | Used when |
|------|-----------|
| `.env.development` | `npm run dev`, default `db:*` scripts, Prisma seeds |
| `.env.production` | `npm run build`, `npm run start`, `db:*:prod` scripts |

1. Edit **`.env.development`**: set `DATABASE_URL`, JWT secrets (`openssl rand -base64 32`), `ANTHROPIC_API_KEY`, and anything else you use locally.
2. Edit **`.env.production`**: production `DATABASE_URL`, same secret pattern (use **different** JWT values than dev), production Resend/email, etc.

Remove or ignore **`.env`** and **`.env.local`** so Next does not load conflicting variables (they are gitignored).

Optional Prisma override when running `tsx prisma/…` by hand: `PRISMA_LOAD_ENV=production` to force `.env.production`.

### 2. Create Database

```bash
# Create PostgreSQL database
createdb leadqualification_dev

# Verify
psql -l | grep leadqualification_dev
```

### 3. Install Dependencies & Setup

```bash
# Install packages
npm install

# Run Prisma migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Open browser
open http://localhost:3000
```

## Demo Credentials

```
Email: demo@example.com
Password: Demo123!
```

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes (e.g. `GET /api/v1/profile/readiness`)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components (incl. learning readiness widgets/cards)
├── lib/                   # Utilities & helpers
│   ├── api/              # Axios client: Bearer JWT, proactive refresh (exp), coalesced `/auth/refresh`, 401 retry
│   ├── extraction/       # Profile extraction engine, prompts, Zod schemas
│   ├── learning/         # Go-live readiness, competencies, gate evaluation
│   ├── scenarios/        # Personas and mandatory simulation scenarios
│   ├── prisma.ts         # Prisma client singleton
│   ├── utils.ts          # Helper functions
│   └── prisma-middleware.ts
├── prisma/               # Database
│   ├── schema.prisma     # Prisma schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed script
├── __tests__/            # Tests
│   ├── unit/            # Unit tests
│   └── integration/      # Integration tests
└── e2e/                  # End-to-end tests
```

## Database

### Connect to PostgreSQL

```bash
# Interactive prompt
psql leadqualification_dev

# Commands
\dt              # List tables
\d users         # Describe table
SELECT * FROM "User";
\q               # Quit
```

### View with Prisma Studio

```bash
npm run db:studio
# Opens at http://localhost:5555
```

## Testing

```bash
# Unit tests
npm test

# Unit tests with UI
npm run test:ui

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema to database
npm run db:seed      # Run seed script
npm run db:studio    # Open Prisma Studio (dev env)
npm run db:studio:prod  # Studio against production DATABASE_URL
npm run db:migrate:deploy  # Apply migrations on server (uses .env.production)
npm run db:seed:prod  # Seed using .env.production
npm test            # Run unit tests
npm run test:e2e    # Run E2E tests
```

## Troubleshooting

### PostgreSQL Connection Failed

```bash
# Check if running
pg_isready

# Start service
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux

# Check connection string in .env.development
```

### Redis Connection Failed

```bash
# Check if running
redis-cli ping

# Start service
brew services start redis      # macOS
sudo systemctl start redis     # Linux
```

### Prisma Migration Failed

```bash
# Reset and redo
npx prisma migrate reset
npx prisma migrate dev --name init
```

## Documentation

- [Database Schema](./Docs/01-DATABASE-SCHEMA.md)
- [Setup Guide](./Docs/12-NATIVE-SETUP-GUIDE.md)
- [Technical Planning](./Docs/MVP%20TECHNICAL%20PLANNING.md)
- [Business verticals & simulation logic](./Docs/business-verticals-and-simulation-logic.md)
- [Prompts directory audit (2026-04-15)](./Docs/audit-prompts-directory-2026-04-15.md)
- [Performance audit (2026-04-26)](./Docs/audit-performance-2026-04-26.md)

## License

MIT
