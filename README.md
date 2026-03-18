# SalesBrain - AI Lead Qualification Platform

AI-powered lead qualification platform for freelancers and agencies. Uses Claude AI to simulate client conversations and automatically qualify leads.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **ORM**: Prisma
- **AI**: Anthropic Claude API
- **Vector DB**: Pinecone
- **Real-time**: Socket.io
- **Email**: Resend
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ running at `localhost:5432`
- Redis running at `localhost:6379`
- Anthropic API key (from console.anthropic.com)

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and fill in:
# - DATABASE_URL (PostgreSQL connection)
# - REDIS_URL
# - JWT secrets (generate with: openssl rand -base64 32)
# - ANTHROPIC_API_KEY
# - PINECONE_API_KEY
# - RESEND_API_KEY
```

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
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
├── lib/                   # Utilities & helpers
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
npm run db:studio    # Open Prisma Studio
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

# Check connection string in .env.local
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

## License

MIT
