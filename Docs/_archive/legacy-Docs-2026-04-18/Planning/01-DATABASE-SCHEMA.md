# Database Schema - Multi-Tenant Architecture

## Database Choice: PostgreSQL 14+

**Why PostgreSQL:**
- Excellent JSON support (JSONB columns)
- Row-level security for multi-tenancy
- Strong ACID compliance
- Great performance for both relational and document data
- Native full-text search
- Robust ecosystem and tooling

---

## Multi-Tenancy Strategy

### Approach: Single Database, Row-Level Isolation
- All tables include `tenantId` column (UUID)
- Database-level row security policies
- Application-level filtering as backup
- No shared data between tenants (complete isolation)

### Tenant Identification
- Each business owner = 1 tenant
- UUID v4 for tenant IDs
- Indexed for query performance
- Cascading deletes when tenant is removed

---

## Complete Schema (Prisma Format)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// TENANT & USER MANAGEMENT
// ============================================

model Tenant {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Business Information
  businessName      String
  industry          String?
  website           String?
  description       String?   @db.Text
  
  // Subscription
  subscriptionTier  SubscriptionTier @default(TRIAL)
  subscriptionStatus SubscriptionStatus @default(ACTIVE)
  trialEndsAt       DateTime?
  subscriptionEndsAt DateTime?
  
  // Usage Limits
  conversationsThisMonth Int @default(0)
  conversationsLimit     Int @default(100)
  
  // Widget Configuration
  widgetApiKey      String   @unique @default(uuid())
  widgetEnabled     Boolean  @default(false)
  widgetColor       String   @default("#000000")
  widgetPosition    String   @default("bottom-right")
  widgetGreeting    String   @default("Hi! How can I help you today?")
  
  // Settings
  aiTransparency    Boolean  @default(true) // Show "AI Assistant" in widget
  leadHandoffMethod String   @default("email") // email | calendar | crm
  emailNotifications Boolean @default(true)
  notificationEmail String?
  
  // Relations
  users             User[]
  profiles          BusinessProfile[]
  conversations     Conversation[]
  simulations       Simulation[]
  leads             Lead[]
  notifications     Notification[]
  
  @@index([subscriptionTier])
  @@index([subscriptionStatus])
}

model User {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Authentication
  email             String   @unique
  emailVerified     Boolean  @default(false)
  password          String   // bcrypt hashed
  
  // Profile
  name              String
  role              UserRole @default(OWNER)
  
  // Session Management
  lastLoginAt       DateTime?
  
  @@index([tenantId])
  @@index([email])
}

enum UserRole {
  OWNER      // Primary business owner
  ADMIN      // Can manage settings
  VIEWER     // Read-only access
}

enum SubscriptionTier {
  TRIAL
  BASIC
  PRO
  PREMIUM
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  EXPIRED
  PAST_DUE
}

// ============================================
// BUSINESS PROFILE & KNOWLEDGE BASE
// ============================================

model BusinessProfile {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Profile Status
  isComplete        Boolean  @default(false)
  completionScore   Int      @default(0) // 0-100
  
  // Extracted Patterns (from simulations)
  communicationStyle Json?   @db.JsonB
  // {
  //   tone: "professional" | "casual" | "friendly",
  //   formality: 1-5,
  //   responseLength: "brief" | "detailed",
  //   emojiUsage: boolean,
  //   keyPhrases: string[]
  // }
  
  pricingLogic      Json?    @db.JsonB
  // {
  //   minBudget: number,
  //   maxBudget: number,
  //   flexibility: 1-5,
  //   negotiationStyle: string,
  //   redFlags: string[],
  //   greenFlags: string[]
  // }
  
  qualificationCriteria Json? @db.JsonB
  // {
  //   mustHaves: string[],
  //   dealBreakers: string[],
  //   idealClient: string[],
  //   warningFlags: string[]
  // }
  
  objectionHandling Json?    @db.JsonB
  // {
  //   commonObjections: Array<{
  //     objection: string,
  //     response: string,
  //     examples: string[]
  //   }>
  // }
  
  decisionMakingPatterns Json? @db.JsonB
  // {
  //   avgResponseTime: string,
  //   questioningStyle: string,
  //   pushback: 1-5,
  //   empathy: 1-5
  // }
  
  // Knowledge Base (structured FAQs extracted from simulations)
  knowledgeBase     Json?    @db.JsonB
  // {
  //   topics: Array<{
  //     topic: string,
  //     questions: string[],
  //     answers: string[],
  //     confidence: number
  //   }>
  // }
  
  // Vector Store Reference (for semantic search)
  pineconeNamespace String?  // Namespace in Pinecone for this profile
  embeddingsCount   Int      @default(0)
  
  @@index([tenantId])
  @@unique([tenantId]) // One profile per tenant
}

// ============================================
// SIMULATION SYSTEM
// ============================================

model Simulation {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  completedAt       DateTime?
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Simulation Configuration
  scenarioType      ScenarioType
  duration          Int      @default(0) // seconds
  status            SimulationStatus @default(IN_PROGRESS)
  
  // AI Configuration
  aiPersona         Json     @db.JsonB
  // {
  //   clientType: string,
  //   budget: string,
  //   painPoints: string[],
  //   objections: string[],
  //   personality: string
  // }
  
  // Messages
  messages          SimulationMessage[]
  
  // Analysis Results
  extractedPatterns Json?    @db.JsonB
  qualityScore      Int?     // 0-100 (how complete was this simulation)
  
  @@index([tenantId])
  @@index([status])
  @@index([scenarioType])
}

model SimulationMessage {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  
  simulationId      String
  simulation        Simulation @relation(fields: [simulationId], references: [id], onDelete: Cascade)
  
  role              MessageRole
  content           String   @db.Text
  
  // AI Metadata
  tokensUsed        Int?
  latencyMs         Int?
  
  @@index([simulationId])
}

enum ScenarioType {
  PRICE_SENSITIVE      // Budget-conscious client
  INDECISIVE          // Hesitant/uncertain client  
  DEMANDING           // High-maintenance client
  TIME_PRESSURED      // Urgent/rush client
  HIGH_BUDGET         // Corporate/premium client
}

enum SimulationStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

enum MessageRole {
  BUSINESS_OWNER  // The business owner (user)
  AI_CLIENT       // The AI playing client role
  SYSTEM         // System messages
}

// ============================================
// LIVE LEAD CONVERSATIONS
// ============================================

model Conversation {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  endedAt           DateTime?
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Lead Information
  leadId            String?
  lead              Lead?    @relation(fields: [leadId], references: [id])
  
  // Session Tracking
  sessionId         String   @unique // For widget session tracking
  ipAddress         String?
  userAgent         String?  @db.Text
  referrer          String?  @db.Text
  
  // Conversation State
  status            ConversationStatus @default(ACTIVE)
  lastActivityAt    DateTime @default(now())
  
  // Messages
  messages          ConversationMessage[]
  
  // Analysis & Scoring
  leadScore         Int?     // 0-100 (qualification score)
  qualificationStatus LeadQualificationStatus @default(UNKNOWN)
  sentiment         String?  // positive | neutral | negative
  
  // AI Confidence
  aiConfidence      Float?   // 0-1 (how confident AI was in its responses)
  humanInterventionNeeded Boolean @default(false)
  
  // Summary (generated after conversation ends)
  summary           String?  @db.Text
  keyTopics         String[] // Extracted topics discussed
  nextSteps         String?  @db.Text
  
  @@index([tenantId])
  @@index([leadId])
  @@index([status])
  @@index([qualificationStatus])
  @@index([createdAt])
}

model ConversationMessage {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  
  conversationId    String
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  role              ConversationRole
  content           String   @db.Text
  
  // AI Metadata
  tokensUsed        Int?
  latencyMs         Int?
  confidenceScore   Float?   // 0-1 for AI responses
  
  // Intent Detection
  detectedIntent    String?  // question | objection | booking_intent | unqualified
  
  @@index([conversationId])
  @@index([createdAt])
}

enum ConversationStatus {
  ACTIVE
  ENDED
  ABANDONED
  ESCALATED  // Handed off to human
}

enum ConversationRole {
  LEAD      // The potential client
  AI        // The AI assistant
  SYSTEM    // System messages
}

enum LeadQualificationStatus {
  UNKNOWN
  QUALIFIED      // Good fit, warm lead
  UNQUALIFIED    // Poor fit, filtered out
  MAYBE         // Needs more info
  BOOKED        // Meeting scheduled
}

// ============================================
// LEAD MANAGEMENT
// ============================================

model Lead {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Contact Information
  name              String?
  email             String?
  phone             String?
  company           String?
  
  // Lead Details
  source            String?  // website | direct | referral
  status            LeadStatus @default(NEW)
  qualificationScore Int?    // 0-100
  
  // Business Context
  budget            String?
  timeline          String?
  painPoints        String[] @default([])
  notes             String?  @db.Text
  
  // Tracking
  firstContactAt    DateTime @default(now())
  lastContactAt     DateTime @default(now())
  conversations     Conversation[]
  
  // Owner Actions
  ownerViewed       Boolean  @default(false)
  ownerContacted    Boolean  @default(false)
  ownerNotes        String?  @db.Text
  
  @@index([tenantId])
  @@index([status])
  @@index([email])
  @@index([qualificationScore])
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  UNQUALIFIED
  MEETING_SCHEDULED
  CUSTOMER
  LOST
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  type              NotificationType
  title             String
  message           String   @db.Text
  
  // Related Entities
  conversationId    String?
  leadId            String?
  
  // Status
  read              Boolean  @default(false)
  emailSent         Boolean  @default(false)
  emailSentAt       DateTime?
  
  @@index([tenantId])
  @@index([read])
  @@index([createdAt])
}

enum NotificationType {
  WARM_LEAD_DETECTED
  CONVERSATION_ENDED
  AI_UNCERTAIN
  DAILY_SUMMARY
  SUBSCRIPTION_ENDING
  LIMIT_REACHED
}

// ============================================
// ANALYTICS & METRICS
// ============================================

model ConversationMetrics {
  id                String   @id @default(uuid())
  date              DateTime @db.Date
  
  tenantId          String
  
  // Daily Aggregates
  totalConversations Int     @default(0)
  qualifiedLeads    Int      @default(0)
  unqualifiedLeads  Int      @default(0)
  averageScore      Float?
  averageDuration   Int?     // seconds
  
  // Engagement
  avgMessagesPerConvo Int?
  uniqueVisitors    Int      @default(0)
  conversionRate    Float?   // visitors to conversations
  
  // AI Performance
  avgConfidence     Float?
  escalationRate    Float?   // % needing human intervention
  
  @@unique([tenantId, date])
  @@index([tenantId])
  @@index([date])
}

// ============================================
// SYSTEM TABLES
// ============================================

model AuditLog {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  
  tenantId          String?
  userId            String?
  
  action            String   // login | logout | update_profile | delete_conversation
  entityType        String?  // tenant | user | conversation | lead
  entityId          String?
  
  metadata          Json?    @db.JsonB
  ipAddress         String?
  userAgent         String?  @db.Text
  
  @@index([tenantId])
  @@index([userId])
  @@index([createdAt])
  @@index([action])
}

model ApiUsage {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  
  tenantId          String
  
  // API Call Details
  provider          String   // anthropic | openai | pinecone
  model             String?  // claude-sonnet-4
  operation         String   // chat | embed | search
  
  // Usage
  tokensUsed        Int
  cost              Float    // In USD
  latencyMs         Int
  
  // Context
  conversationId    String?
  simulationId      String?
  
  @@index([tenantId])
  @@index([createdAt])
  @@index([provider])
}
```

---

## Database Indexes Strategy

### Performance Critical Indexes
1. **Multi-tenant queries**: `tenantId` on ALL tables
2. **User lookups**: `email` (unique)
3. **Conversation filtering**: `status`, `qualificationStatus`, `createdAt`
4. **Lead management**: `status`, `qualificationScore`, `email`
5. **Time-based queries**: `createdAt`, `date` fields

### Composite Indexes (Add as needed)
```sql
-- For dashboard queries
CREATE INDEX idx_conversations_tenant_status_created 
ON "Conversation" (tenantId, status, createdAt DESC);

-- For lead board
CREATE INDEX idx_leads_tenant_status_score 
ON "Lead" (tenantId, status, qualificationScore DESC);
```

---

## Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tenant tables
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables with tenantId

-- Create policies (example for Conversation)
CREATE POLICY tenant_isolation ON "Conversation"
  USING (tenantId = current_setting('app.current_tenant')::uuid);
```

**Implementation Note**: While Prisma doesn't natively support RLS, we enforce tenant isolation via:
1. Application-level filtering (Prisma middleware)
2. Database-level RLS as backup defense
3. Automated tests to verify isolation

---

## Prisma Middleware for Tenant Isolation

```typescript
// lib/prisma-middleware.ts
prisma.$use(async (params, next) => {
  const { model, action, args } = params;
  
  // Skip for certain operations
  if (action === 'findUnique' && model === 'Tenant') {
    return next(params);
  }
  
  // Get tenant from context
  const tenantId = getTenantIdFromContext(); // From JWT/session
  
  // Inject tenantId into all queries
  if (args.where) {
    args.where.tenantId = tenantId;
  } else {
    args.where = { tenantId };
  }
  
  // Inject tenantId into all creates
  if (action === 'create' && args.data) {
    args.data.tenantId = tenantId;
  }
  
  return next(params);
});
```

---

## Data Migration Strategy

### Initial Setup
```bash
# Initialize Prisma
npx prisma init

# Generate migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Seed Data
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo tenant for testing
  const tenant = await prisma.tenant.create({
    data: {
      businessName: 'Demo Business',
      industry: 'Consulting',
      subscriptionTier: 'TRIAL',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      users: {
        create: {
          email: 'demo@example.com',
          password: '$2b$10$...',  // bcrypt hash of 'password'
          name: 'Demo User',
          role: 'OWNER',
          emailVerified: true,
        },
      },
    },
  });
  
  console.log('Seed data created:', tenant);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Backup Strategy

### Automated Backups
- Daily full backups (retained 7 days)
- Hourly incremental backups (retained 24 hours)
- Weekly backups (retained 4 weeks)
- Monthly backups (retained 1 year)

### Point-in-Time Recovery
- Enable WAL (Write-Ahead Logging)
- Retain WAL archives for 7 days
- Allows recovery to any point in last week

---

## Data Retention Policies

### Active Data
- Conversations: Indefinite (until tenant deletes)
- Simulations: Indefinite
- Leads: Indefinite
- Metrics: 2 years, then aggregated

### Deleted Data
- Soft delete with 30-day retention
- Hard delete after 30 days (GDPR compliance)
- Audit logs: 1 year retention

### Anonymization
- After tenant deletion: anonymize all PII
- Keep aggregated metrics (no PII)

---

## Performance Optimization

### Query Optimization
- Use Prisma's `select` to fetch only needed fields
- Implement pagination (cursor-based for conversations)
- Use database connection pooling
- Cache frequently accessed data (Redis)

### Data Archival
- Archive conversations older than 6 months (cold storage)
- Keep hot data in main database
- Archival accessible on-demand

---

## Monitoring & Alerting

### Database Metrics to Track
- Connection pool usage
- Query performance (slow queries >1s)
- Database size growth
- Index usage
- Replication lag (if applicable)

### Alerts
- Connection pool >80% → Scale database
- Slow queries detected → Optimize
- Disk space >85% → Expand storage
- Failed backup → Immediate notification

---

**Next Steps:**
1. Review schema with team
2. Set up database hosting (Railway/Render)
3. Initialize Prisma in Next.js project
4. Run initial migration
5. Implement tenant isolation middleware
6. Write database tests

---

**Document Status**: ✅ FULLY DEPLOYED & OPERATIONAL
**Last Updated**: March 17, 2026

---

## DEPLOYMENT STATUS

✅ **Database Deployed Successfully**
- PostgreSQL at 192.168.50.3:5436
- Database: `salesbrain`
- Schema fully applied to production database

✅ **All 12 Tables Created**
1. Tenant (business information + subscription)
2. User (authentication + roles)
3. BusinessProfile (patterns + knowledge base)
4. Simulation (practice scenarios)
5. SimulationMessage (conversation messages)
6. Conversation (live lead chats)
7. ConversationMessage (individual messages)
8. Lead (lead database)
9. Notification (alerts)
10. ConversationMetrics (daily analytics)
11. AuditLog (compliance)
12. ApiUsage (cost tracking)

✅ **All Indexes Optimized**
- tenantId indexes on all tenant-scoped tables
- Status/qualification indexes for fast filtering
- Date indexes for time-based queries
- Email indexes for user lookups
- Unique constraints on widgetApiKey, user email, and tenant+date combination

✅ **Demo Data Seeded**
- Demo Tenant: "Demo Consulting"
- Demo User: demo@example.com / Demo123!
- Demo Tenant ID: 2cb7a255-6e30-460d-8a1e-3f49efc475ef
- Business Profile: Ready for feature extraction

✅ **Access Verified**
- Prisma Studio accessible at `http://localhost:5555`
- Full CRUD operations working
- Relationships and cascading deletes verified

---

## Quick Commands

```bash
npm run db:studio       # View/edit data at http://localhost:5555
npm run db:seed         # Re-seed if needed
npm run db:push         # Update schema after changes
```

---

**Production Ready** - Database is operational, indexed, and ready for application development.
