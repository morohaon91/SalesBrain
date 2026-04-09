# CODEBASE AUDIT REPORT

**Date:** 2026-03-25
**Branch:** dev
**Database:** PostgreSQL (via Prisma ORM)
**AI Provider:** Anthropic Claude (claude-sonnet-4-6)
**Framework:** Next.js (App Router)

---

## 1. DATABASE SCHEMA

**Total Models:** 15
**Enums:** 13

---

### Tenant Table

```prisma
model Tenant {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  businessName      String
  industry          String?
  website           String?
  description       String?   @db.Text

  subscriptionTier  SubscriptionTier @default(TRIAL)
  subscriptionStatus SubscriptionStatus @default(ACTIVE)
  trialEndsAt       DateTime?
  subscriptionEndsAt DateTime?

  conversationsThisMonth Int @default(0)
  conversationsLimit     Int @default(100)

  widgetApiKey      String   @unique @default(uuid())
  widgetEnabled     Boolean  @default(false)
  widgetColor       String   @default("#000000")
  widgetPosition    String   @default("bottom-right")
  widgetGreeting    String   @default("Hi! How can I help you today?")

  aiTransparency    Boolean  @default(true)
  leadHandoffMethod String   @default("email")
  emailNotifications Boolean @default(true)
  notificationEmail String?

  users             User[]
  profiles          BusinessProfile[]
  conversations     Conversation[]
  simulations       Simulation[]
  leads             Lead[]
  notifications     Notification[]

  @@index([subscriptionTier])
  @@index([subscriptionStatus])
}
```

**Fields (22):** id, createdAt, updatedAt, businessName, industry, website, description, subscriptionTier, subscriptionStatus, trialEndsAt, subscriptionEndsAt, conversationsThisMonth, conversationsLimit, widgetApiKey, widgetEnabled, widgetColor, widgetPosition, widgetGreeting, aiTransparency, leadHandoffMethod, emailNotifications, notificationEmail

**Relationships:** User[], BusinessProfile[], Conversation[], Simulation[], Lead[], Notification[]

---

### User Table

```prisma
model User {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  email             String   @unique
  emailVerified     Boolean  @default(false)
  password          String

  name              String
  role              UserRole @default(OWNER)

  lastLoginAt       DateTime?

  @@index([tenantId])
  @@index([email])
}
```

**Fields (9):** id, createdAt, updatedAt, tenantId, email, emailVerified, password, name, role, lastLoginAt

**Relationships:** Tenant (belongs to)

**Roles:** OWNER, ADMIN, VIEWER

---

### BusinessProfile Table

```prisma
model BusinessProfile {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tenantId          String
  tenant            Tenant   @relation(...)

  // Manual Fields
  industry              String?
  serviceDescription    String?   @db.Text
  targetClientType      String?
  typicalBudgetRange    String?
  commonClientQuestions String[]  @default([])

  // Auto-Extracted Fields
  communicationStyle    Json?     @db.JsonB
  pricingLogic          Json?     @db.JsonB
  qualificationCriteria Json?     @db.JsonB
  objectionHandling     Json?     @db.JsonB
  decisionMakingPatterns Json?    @db.JsonB

  // Metadata
  isComplete        Boolean  @default(false)
  completionScore   Int      @default(0)
  completionPercentage  Int       @default(20)
  lastExtractedAt       DateTime?
  simulationCount       Int       @default(0)
  embeddedMessageCount  Int       @default(0)

  // Knowledge Base & Vectors
  knowledgeBase     Json?    @db.JsonB
  pineconeNamespace String?
  embeddingsCount   Int      @default(0)

  @@index([tenantId])
  @@index([industry])
  @@unique([tenantId])
}
```

**Manual Entry Fields (5):** industry, serviceDescription, targetClientType, typicalBudgetRange, commonClientQuestions

**Extracted Fields (6):** communicationStyle, pricingLogic, qualificationCriteria, objectionHandling, decisionMakingPatterns, knowledgeBase

**Metadata Fields (8):** isComplete, completionScore, completionPercentage, lastExtractedAt, simulationCount, embeddedMessageCount, pineconeNamespace, embeddingsCount

**Critical Fields Present:**
- ❌ ownerVoiceExamples - **DOES NOT EXIST**
- ❌ yearsExperience - **DOES NOT EXIST**
- ❌ serviceOfferings - **DOES NOT EXIST** (only `serviceDescription`)
- ❌ specializations - **DOES NOT EXIST**
- ❌ certifications - **DOES NOT EXIST**
- ✅ communicationStyle
- ✅ pricingLogic
- ✅ qualificationCriteria
- ✅ objectionHandling
- ✅ decisionMakingPatterns
- ✅ knowledgeBase

---

### Simulation Table

```prisma
model Simulation {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  completedAt       DateTime?
  validatedAt       DateTime?

  tenantId          String
  tenant            Tenant   @relation(...)

  scenarioType      ScenarioType
  duration          Int      @default(0)
  status            SimulationStatus @default(IN_PROGRESS)

  aiPersona         Json     @db.JsonB

  messages          SimulationMessage[]

  extractedPatterns Json?    @db.JsonB
  qualityScore      Int?

  @@index([tenantId])
  @@index([status])
  @@index([scenarioType])
}
```

**Fields (11):** id, createdAt, updatedAt, completedAt, validatedAt, tenantId, scenarioType, duration, status, aiPersona, extractedPatterns, qualityScore

**Has validatedAt?** ✅ YES

**Statuses:** IN_PROGRESS, COMPLETED, ABANDONED

**Scenario Types:** PRICE_SENSITIVE, INDECISIVE, DEMANDING, TIME_PRESSURED, HIGH_BUDGET

---

### SimulationMessage Table

```prisma
model SimulationMessage {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())

  simulationId      String
  simulation        Simulation @relation(...)

  role              MessageRole
  content           String   @db.Text

  tokensUsed        Int?
  latencyMs         Int?

  @@index([simulationId])
}
```

**Fields (6):** id, createdAt, simulationId, role, content, tokensUsed, latencyMs

**Roles:** BUSINESS_OWNER, AI_CLIENT, SYSTEM

---

### Lead Table

**Status:** ✅ EXISTS

```prisma
model Lead {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tenantId          String
  tenant            Tenant   @relation(...)

  name              String?
  email             String?
  phone             String?
  company           String?

  source            String?
  status            LeadStatus @default(NEW)
  qualificationScore Int?

  budget            String?
  timeline          String?
  painPoints        String[] @default([])
  notes             String?  @db.Text

  firstContactAt    DateTime @default(now())
  lastContactAt     DateTime @default(now())
  conversations     Conversation[]

  ownerViewed       Boolean  @default(false)
  ownerContacted    Boolean  @default(false)
  ownerNotes        String?  @db.Text

  @@index([tenantId])
  @@index([status])
  @@index([email])
  @@index([qualificationScore])
}
```

**Fields (17):** id, createdAt, updatedAt, tenantId, name, email, phone, company, source, status, qualificationScore, budget, timeline, painPoints, notes, firstContactAt, lastContactAt, ownerViewed, ownerContacted, ownerNotes

**Lead Statuses:** NEW, CONTACTED, QUALIFIED, UNQUALIFIED, MEETING_SCHEDULED, CUSTOMER, LOST

---

### Conversation Table

**Status:** ✅ EXISTS

```prisma
model Conversation {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  endedAt           DateTime?

  tenantId          String
  tenant            Tenant   @relation(...)

  leadId            String?
  lead              Lead?    @relation(fields: [leadId], references: [id])

  sessionId         String   @unique
  ipAddress         String?
  userAgent         String?  @db.Text
  referrer          String?  @db.Text

  status            ConversationStatus @default(ACTIVE)
  lastActivityAt    DateTime @default(now())

  messages          ConversationMessage[]

  leadScore         Int?
  qualificationStatus LeadQualificationStatus @default(UNKNOWN)
  sentiment         String?

  aiConfidence      Float?
  humanInterventionNeeded Boolean @default(false)

  summary           String?  @db.Text
  keyTopics         String[]
  nextSteps         String?  @db.Text

  @@index([tenantId])
  @@index([leadId])
  @@index([status])
  @@index([qualificationStatus])
  @@index([createdAt])
}
```

**Fields (19):** id, createdAt, updatedAt, endedAt, tenantId, leadId, sessionId, ipAddress, userAgent, referrer, status, lastActivityAt, leadScore, qualificationStatus, sentiment, aiConfidence, humanInterventionNeeded, summary, keyTopics, nextSteps

**Statuses:** ACTIVE, ENDED, ABANDONED, ESCALATED

**Qualification Statuses:** UNKNOWN, QUALIFIED, UNQUALIFIED, MAYBE, BOOKED

---

### ConversationMessage Table

**Status:** ✅ EXISTS

```prisma
model ConversationMessage {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())

  conversationId    String
  conversation      Conversation @relation(...)

  role              ConversationRole
  content           String   @db.Text

  tokensUsed        Int?
  latencyMs         Int?
  confidenceScore   Float?

  detectedIntent    String?

  @@index([conversationId])
  @@index([createdAt])
}
```

**Fields (8):** id, createdAt, conversationId, role, content, tokensUsed, latencyMs, confidenceScore, detectedIntent

**Roles:** LEAD, AI, SYSTEM

---

### Other Tables

| Model | Purpose | Key Fields |
|---|---|---|
| **Notification** | System alerts | type, title, message, read, emailSent, conversationId, leadId |
| **ConversationMetrics** | Daily analytics | totalConversations, qualifiedLeads, averageScore, conversionRate, escalationRate |
| **AuditLog** | Tenant action log | action, entityType, entityId, metadata, ipAddress |
| **ApiUsage** | AI cost tracking | provider, model, operation, tokensUsed, cost, latencyMs |
| **PlatformAdmin** | Super-admin users | email, password, role, permissions, isActive |
| **PlatformAuditLog** | Admin action log | adminId, action, targetType, targetId, metadata |
| **PlatformSettings** | Global config | maintenanceMode, signupsEnabled, defaultTrialDays, aiCostBudget |

---

## 2. SIMULATION SYSTEM - HOW IT WORKS

### Complete Flow

```
1. User visits /simulations/new
   -> Selects 1 of 5 scenario types
   -> Clicks "Start Simulation"

2. POST /api/v1/simulations/start
   -> Validates scenario type
   -> Fetches businessProfile for tenantId
   -> Generates system prompt with industry context via generateSimulationPrompt()
   -> Calls Claude AI for initial greeting (temp: 0.8, maxTokens: 300)
   -> Creates Simulation record (status: IN_PROGRESS)
   -> Stores initial AI_CLIENT message
   -> Returns simulationId + aiPersona

3. Redirects to /simulations/{id}
   -> Loads SimulationChat component
   -> Displays AI client's initial message

4. User sends messages (repeating loop)
   -> POST /api/v1/simulations/{id}/message
   -> Validates message (1-5000 chars)
   -> Fetches simulation + full conversation history
   -> Stores BUSINESS_OWNER message
   -> Generates system prompt WITH businessProfile (every single call)
   -> Calls Claude with full conversation history
   -> Stores AI_CLIENT response
   -> Updates simulation duration
   -> Returns both messages with latencyMs/tokensUsed

5. User clicks "Complete Simulation"
   -> Client-side: Runs checkSimulationQuality() locally
   -> Shows modal with quality report (completenessScore, strengths, suggestions)
   -> User chooses "Continue Conversation" or "Complete Anyway"
   -> POST /api/v1/simulations/{id}/complete
   -> Server-side quality check
   -> Updates: status=COMPLETED, sets completedAt, stores qualityScore
   -> IF qualityScore >= 60: Fire-and-forget POST to /extract
   -> Redirects to /simulations/{id}/feedback

6. Pattern extraction (async background)
   -> POST /api/v1/simulations/{id}/extract
   -> Validates: status=COMPLETED, messages >= 4
   -> Phase 3: Quality check (can block if too low)
   -> Phase 1: Extract patterns via Claude (temp: 0.3, maxTokens: 4000)
   -> Phase 2: Grammar normalization if needed
   -> Zod schema validation
   -> Merge with existing profile patterns
   -> Transaction updates: simulation + businessProfile
```

---

### Start Simulation Endpoint

**File:** `app/api/v1/simulations/start/route.ts`

**What it does:**
1. Authenticates user via `withAuth` middleware
2. Validates `scenarioType` from request body
3. Fetches business profile for tenant
4. Calls `generateSimulationPrompt(scenarioType, businessProfile)` for system prompt
5. Calls `createChatCompletion()` with temperature: 0.8, maxTokens: 300
6. Creates Simulation record with AI persona config
7. Creates initial SimulationMessage (role: AI_CLIENT)

**Creates:** 1 Simulation + 1 SimulationMessage

---

### Message Endpoint

**File:** `app/api/v1/simulations/[id]/message/route.ts`

**What it does:**
1. Validates message content (1-5000 chars)
2. Fetches simulation with messages + tenant profiles
3. Verifies status is IN_PROGRESS
4. Creates BUSINESS_OWNER message
5. Re-generates system prompt with businessProfile (critical - prevents context loss)
6. Sends full conversation history to Claude
7. Creates AI_CLIENT response message
8. Updates simulation duration

**AI Prompt Used:** `generateSimulationPrompt()` - called on EVERY message to maintain industry context

---

### Complete Endpoint

**File:** `app/api/v1/simulations/[id]/complete/route.ts`

**What it does:**
1. Fetches simulation with messages
2. Runs `checkSimulationQuality(messages, scenarioType)` for quality report
3. Updates simulation: status=COMPLETED, completedAt=now(), qualityScore
4. If qualityScore >= 60: async fire-and-forget POST to /extract endpoint

**Does it auto-trigger extraction?** ✅ YES - conditionally when qualityScore >= 60

**Quality Score Calculation:**
```
balanceRatio = aiClientMessages / businessOwnerMessages
balanceScore = min(100, abs(100 - abs(balanceRatio - 1) * 100))
lengthBonus = min(20, floor(messageCount / 2))
qualityScore = balanceScore + lengthBonus (capped at 100)
```

---

### Scenario Types & Client Personas

| Scenario | Client Type | Budget | Personality |
|---|---|---|---|
| PRICE_SENSITIVE | Budget-Conscious Startup Founder | $5k-15k | Direct, data-driven, negotiation-focused |
| INDECISIVE | Hesitant Mid-Level Manager | $10k-30k | Cautious, asks many questions, needs reassurance |
| DEMANDING | Perfectionist Executive | $30k+ | Assertive, detail-oriented, controlling |
| TIME_PRESSURED | Urgent Problem-Solver | $15k-40k | Urgent, fast-paced, solutions-oriented |
| HIGH_BUDGET | Enterprise Decision Maker | $50k+ | Professional, formal, values long-term relationships |

---

## 3. PATTERN EXTRACTION - WHAT GETS EXTRACTED

### Extraction Endpoint

**File:** `app/api/v1/simulations/[id]/extract/route.ts`

**Logic (9-step pipeline):**

1. Parse simulation ID, authenticate tenant
2. Fetch simulation with messages (ordered by createdAt) + tenant profiles
3. Validate: status=COMPLETED, messages >= 4
4. Get industry from business profile (default: 'business_consulting')
5. Call `extractPatternsFromSimulation()` or `extractPatternsWithQualityCheck()`
6. Fetch existing patterns from business profile
7. Call `mergePatterns()` or `mergePatternsWithConfidence()` to combine
8. Calculate metrics: qualityScore, completionPercentage, simulationCount
9. Transaction: update Simulation + BusinessProfile

---

### Extraction Prompt

**File:** `lib/ai/prompts/pattern-extraction.ts`

**SYSTEM PROMPT:**
```
You are an expert business analyst specializing in extracting the BUSINESS OWNER'S patterns from sales training simulations.

**CRITICAL PERSPECTIVE RULE:**
Analyze ONLY the business owner's behavior, criteria, and decision-making.
DO NOT confuse the customer's complaints or behavior with the owner's deal-breakers.

Your task: Extract how the OWNER operates, not how the CUSTOMER behaves.

**Key Distinctions:**
- Owner's "deal-breaker" = Why owner rejects/rejected a customer
- Customer's complaint = What customer complained about (ignore this)
- Owner's green flag = What excites the owner
- Customer's criticism = What customer criticized (not relevant to owner's patterns)

Focus on what the owner ACTUALLY SAID and DID in this conversation.
```

**USER PROMPT (generatePatternExtractionPrompt):**

Contains:
- Full JSON output schema (7 major sections)
- 7 detailed extraction examples with RIGHT/WRONG patterns
- Industry context and scenario type
- Conversation transcript
- Numbered extraction instructions for each category
- Critical reminders (do/don't rules)

**What prompt asks AI to extract:**
- [x] Communication style (tone, style, keyPhrases, formality, responsePattern)
- [x] Pricing logic (minBudget, maxBudget, typicalRange, flexibilityFactors, dealBreakers)
- [x] Qualification criteria (mustHaves, dealBreakers, greenFlags, redFlags + confidence levels)
- [x] Objection handling (price, timeline, competitor, quality, criticism + unanswered)
- [x] Decision making patterns (whenToSayYes, whenToSayNo, warningSignsToWatch)
- [x] Conversation quality (unansweredQuestions, resolution, completenessScore, missingPatterns)
- [x] Extraction notes (strengths, weaknesses, suggestions)
- [ ] Owner voice examples (verbatim phrases) - **NOT EXTRACTED (intent-based instead)**
- [ ] Business facts (yearsExperience, etc.) - **NOT EXTRACTED**
- [ ] Score weights - **NOT EXTRACTED (confidence levels used instead)**

---

### Extraction Output Structure

**File:** `lib/types/business-profile.ts`

**ExtractedPatterns interface:**
```typescript
export interface ExtractedPatterns {
  communicationStyle: CommunicationStyle;
  pricingLogic: PricingLogic;
  qualificationCriteria: QualificationCriteria;
  objectionHandling: ObjectionHandling;
  decisionMakingPatterns: DecisionMakingPatterns;
  knowledgeBase?: KnowledgeBase;
  conversationQuality?: ConversationQuality;
  extractionNotes?: ExtractionNotes;
}
```

**CommunicationStyle:**
```typescript
{
  tone: 'professional' | 'casual' | 'empathetic' | 'direct' | 'friendly';
  style: 'data-driven' | 'emotional' | 'educational' | 'consultative';
  keyPhrases: string[];         // Intent-based descriptions, NOT verbatim
  formality: 'formal' | 'conversational' | 'casual';
  responsePattern?: string;
  confidence?: { tone, style, formality: 'high'|'medium'|'low'|'not_demonstrated' }
}
```

**PricingLogic:**
```typescript
{
  minBudget?: number;
  maxBudget?: number;
  typicalRange?: string;
  flexibilityFactors: string[];
  dealBreakers: string[];
  pricingConfidence?: string;
  confidence?: { minBudget, maxBudget, dealBreakers, flexibilityFactors }
}
```

**QualificationCriteria:**
```typescript
{
  mustHaves: string[];
  dealBreakers: string[];
  greenFlags: string[];
  redFlags: string[];
  confidence?: { mustHaves, dealBreakers, greenFlags, redFlags }
}
```

**ObjectionHandling:**
```typescript
{
  priceObjection?: string;
  timelineObjection?: string;
  competitorObjection?: string;
  qualityObjection?: string;
  scopeObjection?: string;
  criticismHandling?: string;
  unansweredObjections?: string[];
  confidence?: { priceObjection, timelineObjection, competitorObjection, qualityObjection, scopeObjection }
  [key: string]: any;  // Custom objection types allowed
}
```

**DecisionMakingPatterns:**
```typescript
{
  whenToSayYes: string[];
  whenToSayNo: string[];
  warningSignsToWatch: string[];
  decisionSpeed?: string;
  confidence?: { whenToSayYes, whenToSayNo }
}
```

**KnowledgeBase:**
```typescript
{
  expertiseAreas: string[];
  commonAnswers: Array<{ question: string; answer: string; category?: string }>;
  confidence?: { expertiseAreas, commonAnswers }
}
```

**ConversationQuality:**
```typescript
{
  unansweredQuestions: string[];
  hasResolution: boolean;
  resolutionType: 'accepted' | 'rejected' | 'scheduled_followup' | 'none';
  completenessScore: number;  // 0-100
  missingPatterns?: string[];
  conversationFlow: 'smooth' | 'interrupted' | 'one_sided' | 'incomplete';
  overallConfidence: 'high' | 'medium' | 'low';
}
```

**ExtractionNotes:**
```typescript
{
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
```

**What fields exist in the interface:**
- ❌ ownerVoice (not as a dedicated field)
- ❌ businessFacts (no such field)
- ❌ scoreImpact in dealBreakers (dealBreakers are string arrays, not objects)
- ✅ communicationStyle (with keyPhrases as intent-based, not verbatim)
- ✅ pricingLogic (with confidence sub-object)
- ✅ qualificationCriteria (with confidence sub-object)
- ✅ objectionHandling (with unansweredObjections)
- ✅ decisionMakingPatterns (with confidence sub-object)
- ✅ knowledgeBase (with expertiseAreas + commonAnswers)
- ✅ conversationQuality (with completenessScore + missingPatterns)
- ✅ extractionNotes (with strengths/weaknesses/suggestions)

---

### Grammar Normalization Layer (Phase 2)

**File:** `lib/ai/normalize-patterns.ts`

**How it works:**
1. `needsNormalization()` scans JSON for common misspellings (profssionals, exprince, schehule, etc.)
2. If errors found, calls Claude with temperature 0.1 (very low for consistency)
3. System prompt: "You are a professional copy editor specializing in preserving authentic voice while fixing technical errors"
4. Rules: Fix spelling/grammar ONLY, preserve tone, contractions, personality, sentence structure
5. Fallback: If normalization fails, returns original patterns unchanged

---

### Quality Checking (Phase 3)

**File:** `lib/simulations/quality-checker.ts`

**Quality Checks:**
1. **Message Count** - CRITICAL if < 8, GOOD if >= 12
2. **Unanswered Questions** - Tracks 8 topic areas, CRITICAL if 5+ unanswered
3. **Resolution Detection** - Checks for acceptance/rejection/followup keywords
4. **Conversation Balance** - Owner-to-customer message ratio (ideal: 0.8-1.2)
5. **Scenario-Specific** - Checks for scenario-relevant keywords

**Score: 0-100 (base 50 + message + questions + resolution + balance bonuses)**

**Recommendations:** "extract" (>= 60, no critical), "review", "continue", "redo" (2+ critical)

---

### Pattern Merging Logic

**File:** `lib/ai/merge-patterns.ts`

**Two Functions:**

1. **`mergePatterns(existing, new)`** - Standard merge
2. **`mergePatternsWithConfidence(existing, new, simulationCount)`** - Confidence-aware merge

**Merge Strategies:**
| Category | Strategy |
|---|---|
| communicationStyle.tone/style/formality | Use most recent |
| communicationStyle.keyPhrases | Merge + deduplicate |
| pricingLogic.minBudget | Use lowest (conservative) |
| pricingLogic.maxBudget | Use highest (aggressive) |
| pricingLogic.typicalRange | Use most recent |
| qualificationCriteria.* arrays | Merge + deduplicate |
| objectionHandling fields | Keep most recent per type |
| decisionMakingPatterns.* arrays | Merge + deduplicate |

**Confidence Rules:**
- simulationCount < 2: All confidence marked as 'low'
- simulationCount >= 2: Keep merged confidence levels

**Deduplication:** Case-insensitive string comparison, preserves first occurrence

---

### Validation Schemas

**File:** `lib/validation/pattern-schemas.ts`

Uses **Zod** library. All schemas match the TypeScript interfaces above. Key points:
- All enum fields use `z.enum()` for strict validation
- Array fields default to empty arrays
- Confidence sub-objects are optional throughout
- `ObjectionHandlingSchema` uses `.passthrough()` for custom objection types
- `ConversationQualitySchema`, `ExtractionNotesSchema`, `KnowledgeBaseSchema` are optional in the root schema

---

## 4. BUSINESS PROFILE - STRUCTURE & DATA

### Database Fields

**Manual Entry Fields:**
| Field | Type | Description |
|---|---|---|
| industry | String? | User's business industry |
| serviceDescription | String? @db.Text | What services they offer |
| targetClientType | String? | Ideal client type |
| typicalBudgetRange | String? | Budget range they work with |
| commonClientQuestions | String[] | Common questions from clients |

**Extracted Fields (all Json? @db.JsonB):**
| Field | JSON Structure |
|---|---|
| communicationStyle | `{ tone, style, keyPhrases[], formality, responsePattern, confidence? }` |
| pricingLogic | `{ minBudget?, maxBudget?, typicalRange, flexibilityFactors[], dealBreakers[], confidence? }` |
| qualificationCriteria | `{ mustHaves[], dealBreakers[], greenFlags[], redFlags[], confidence? }` |
| objectionHandling | `{ priceObjection?, timelineObjection?, competitorObjection?, qualityObjection?, criticismHandling?, unansweredObjections?, confidence? }` |
| decisionMakingPatterns | `{ whenToSayYes[], whenToSayNo[], warningSignsToWatch[], decisionSpeed?, confidence? }` |
| knowledgeBase | `{ expertiseAreas[], commonAnswers[{ question, answer, category? }], confidence? }` |

**Metadata Fields:**
| Field | Type | Default | Description |
|---|---|---|---|
| isComplete | Boolean | false | Legacy - profile 100% complete |
| completionScore | Int | 0 | Legacy - same as completionPercentage |
| completionPercentage | Int | 20 | Actual completion % based on simulations |
| lastExtractedAt | DateTime? | null | Last pattern extraction time |
| simulationCount | Int | 0 | Count of completed simulations used |
| embeddedMessageCount | Int | 0 | Messages embedded in vector store |
| pineconeNamespace | String? | null | Vector store namespace |
| embeddingsCount | Int | 0 | Count of embedded vectors |

**Missing Fields (mentioned but don't exist):**
- ❌ ownerVoiceExamples
- ❌ yearsExperience
- ❌ serviceOfferings (only serviceDescription exists)
- ❌ specializations
- ❌ certifications

---

### Validation Workflow

**File:** `app/api/v1/profile/validate/route.ts`

**How it works:**

1. `GET /api/v1/profile/validate` - Returns patterns pending owner validation from most recent extraction
   - Fetches simulations where `validatedAt IS NULL` and `extractedPatterns IS NOT NULL`
   - Returns extracted patterns for review

2. `POST /api/v1/profile/validate` with action "approve" - Approves a specific pattern field
   - Request: `{ field: "qualificationCriteria.dealBreakers", value: [...] }`

3. `POST /api/v1/profile/validate` with action "reject" - Removes a specific pattern element
   - Request: `{ field: "dealBreakers.2" }` (remove array index)

4. `POST /api/v1/profile/validate` with action "approve-all" - Marks all patterns as validated

**Does it check validatedAt IS NULL?** ✅ YES

---

### Re-Extraction Workflow

**File:** `app/api/v1/profile/re-extract/route.ts`

**How it works:**
1. Fetches ALL completed simulations (status: 'COMPLETED')
2. For each simulation with 4+ messages:
   - Calls `extractPatternsWithQualityCheck()`
   - Only includes if completenessScore >= 60
3. Merges patterns using `mergePatternsWithConfidence()`
4. Calculates completionPercentage based on simulation count
5. Updates profile with merged patterns + all metadata

---

## 5. LEAD/CONVERSATION SYSTEM

### Status: ✅ EXISTS

---

### Lead System

**Database Table:** Lead (see schema in Section 1)

**API Endpoint:** `GET /api/v1/leads`
- Paginated listing (default 20 per page)
- Filters: status, minScore, search (name/email/company)
- Sorting: createdAt DESC
- Returns: id, name, email, company, status, qualificationScore, firstContactAt, conversationsCount, ownerViewed

**Dashboard Pages:**
- `/leads` - Lead list with status badges, qualification score bars, search/filter/sort
- `/leads/[id]` - Individual lead profile with contact info, score, conversation history

**Lead Statuses:** NEW, CONTACTED, QUALIFIED, UNQUALIFIED, MEETING_SCHEDULED, CUSTOMER, LOST

---

### Conversation System

**Database Tables:** Conversation + ConversationMessage (see schemas in Section 1)

**API Endpoint:** `GET /api/v1/conversations`
- Paginated listing
- Filters: status, minScore (leadScore)
- Returns: id, createdAt, status, qualificationStatus, leadScore, messageCount, duration, leadName, leadEmail, summary

**Dashboard Pages:**
- `/conversations` - Table view with status badges, qualification badges, search, dual filtering
- `/conversations/[id]` - Full conversation thread with lead info, timestamps, actions

**Conversation Statuses:** ACTIVE, ENDED, ABANDONED, ESCALATED
**Qualification Statuses:** UNKNOWN, QUALIFIED, UNQUALIFIED, MAYBE, BOOKED

---

### AI Chat Widget

**Widget Configuration (in Tenant model):**
- `widgetApiKey` - Unique API key per tenant
- `widgetEnabled` - Toggle on/off
- `widgetColor` - Customizable color
- `widgetPosition` - Placement (default: bottom-right)
- `widgetGreeting` - Custom greeting message

**Widget-specific frontend code:** Not yet implemented as a standalone embeddable widget. Configuration exists in the database but no `components/widget/` or public-facing widget JS was found.

---

### Lead Scoring Logic

**Where it exists:** Built into the Conversation model as `leadScore` (Int?) and `qualificationStatus` (enum)

**How it calculates score:** Score is stored on Conversation records. The prompt config references a `leadQualification` prompt type (temperature: 0.7, maxTokens: 200) but the actual scoring API endpoint that calls AI to calculate scores was not found as a dedicated route.

**Uses qualificationCriteria from BusinessProfile?** The configuration and types are ready, but no active endpoint was found that programmatically reads qualificationCriteria to compute a lead score in real-time.

---

## 6. ALL API ENDPOINTS

### Authentication:
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Token refresh |
| POST | `/api/v1/auth/logout` | User logout |

### Simulations:
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/simulations` | List simulations (paginated, filterable) |
| GET | `/api/v1/simulations/list` | Alternative list endpoint |
| POST | `/api/v1/simulations/start` | Start new simulation |
| GET | `/api/v1/simulations/[id]` | Get simulation details with messages |
| POST | `/api/v1/simulations/[id]/message` | Send message, get AI response |
| POST | `/api/v1/simulations/[id]/complete` | Complete simulation, trigger extraction |
| POST | `/api/v1/simulations/[id]/extract` | Extract patterns from completed simulation |

### Profile:
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/profile` | Get business profile |
| PATCH | `/api/v1/profile` | Update manual fields |
| GET | `/api/v1/profile/validate` | Get patterns pending validation |
| POST | `/api/v1/profile/validate` | Approve/reject/approve-all patterns |
| POST | `/api/v1/profile/re-extract` | Re-analyze all simulations |
| POST | `/api/v1/profile/reset` | Reset to industry template defaults |

### Leads & Conversations:
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/leads` | List leads (paginated, filterable) |
| GET | `/api/v1/conversations` | List conversations (paginated, filterable) |

### Platform Admin:
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/platform-admin/auth/login` | Admin login |
| GET | `/api/v1/platform-admin/tenants` | List/manage tenants |
| GET | `/api/v1/platform-admin/analytics` | Platform analytics |

### Other:
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/v1/user/profile` | User profile |
| GET | `/api/v1/analytics/overview` | Tenant analytics overview |

---

## 7. AI PROMPTS - EXACT TEXT

### Prompt Configuration System

**File:** `lib/ai/prompts/config.ts`

**5 Prompt Types Configured:**

| Type | Model | Temp | Max Tokens | Purpose |
|---|---|---|---|---|
| simulation | claude-sonnet-4-6 | 0.8 | 300 | AI plays difficult client personas |
| patternExtraction | claude-sonnet-4-6 | 0.3 | 4000 | Extracts business patterns |
| leadQualification | claude-sonnet-4-6 | 0.7 | 200 | Engages with real leads |
| summarization | claude-sonnet-4-6 | 0.5 | 500 | Generates conversation summaries |
| intentDetection | claude-sonnet-4-6 | 0.2 | 100 | Detects/classifies user intent |

---

### Simulation Chat Prompt

**File:** `lib/ai/prompts/simulation.ts`

**Used for:** AI responses during simulation - AI plays a difficult client

**Basic Prompt (fallback):** `generateSimulationClientPrompt(config)`
```
You are roleplaying as a potential client inquiring about professional services.

SCENARIO: {scenarioType}
CLIENT PROFILE:
- Type: {clientType}
- Budget: {budget}
- Pain Points: {painPoints}
- Personality: {personality}

YOUR BEHAVIOR:
- Stay in character as this specific client type
- Ask realistic questions based on the scenario
- Raise objections that match the scenario (e.g., price concerns for PRICE_SENSITIVE)
- Be somewhat skeptical but genuinely interested
- Don't make it too easy - challenge the business owner
- Keep responses conversational and natural (2-4 sentences)
- Gradually reveal information (don't dump everything at once)

WHAT YOU KNOW:
- The business owner sells: {businessType}
- Their industry: {industry}

DO NOT:
- Break character or mention you're an AI
- Be overly agreeable or hostile
- Ask about things unrelated to the service
- Provide unrealistic scenarios

Respond as this client would in a real conversation.
```

**Enhanced Prompt (with business profile):** `generateSimulationPrompt(scenarioType, businessProfile)`

Uses `buildPrompt()` to assemble:
1. Role: "You are roleplaying as a potential client for a {template.displayName} professional."
2. Behavior rules (strict mode - never break character)
3. Industry context (from template or profile)
4. Scenario-specific client profile, pain points, typical objections, opening line
5. Business context from profile (serviceDescription, targetClientType, typicalBudgetRange)
6. Communication style from extracted patterns (if available)
7. Qualification criteria from extracted patterns (if available)
8. Anti-persona-switching safeguards

---

### Pattern Extraction Prompt

**File:** `lib/ai/prompts/pattern-extraction.ts`

**Used for:** Extracting patterns from completed simulation conversations

**SYSTEM PROMPT (EXACT):**
```
You are an expert business analyst specializing in extracting the BUSINESS OWNER'S patterns from sales training simulations.

**CRITICAL PERSPECTIVE RULE:**
Analyze ONLY the business owner's behavior, criteria, and decision-making.
DO NOT confuse the customer's complaints or behavior with the owner's deal-breakers.

Your task: Extract how the OWNER operates, not how the CUSTOMER behaves.

**Key Distinctions:**
- Owner's "deal-breaker" = Why owner rejects/rejected a customer
- Customer's complaint = What customer complained about (ignore this)
- Owner's green flag = What excites the owner
- Customer's criticism = What customer criticized (not relevant to owner's patterns)

Focus on what the owner ACTUALLY SAID and DID in this conversation.
```

**USER PROMPT (EXACT - generatePatternExtractionPrompt):**
```
You are analyzing a training simulation between a BUSINESS OWNER and an AI playing a DIFFICULT CLIENT.

Your task: Extract the BUSINESS OWNER'S patterns, criteria, and decision-making logic.

CRITICAL PERSPECTIVE RULES:

ALWAYS ASK: "Is this the OWNER'S perspective or the CUSTOMER'S perspective?"

Example 1 - Deal-Breakers:
Customer says: "Your spelling concern me about detail orientation"
Owner says: "I have spelling issues, does it relate to construction?"

WRONG: dealBreaker: "spelling_concerns_about_detail"
   (This is the customer's complaint about the owner)

RIGHT: redFlag: "not_demonstrated"
   extractionNotes.weaknesses: ["Owner became defensive about spelling criticism"]

Example 2 - Decision Making:
Customer asks 7 questions, owner answers 2, ignores 5

WRONG: whenToSayNo: ["daily_communication_demands", "portfolio_requests"]
   (Owner never said no, just didn't answer)

RIGHT:
   whenToSayNo: ["not_demonstrated"]
   conversationQuality.unansweredQuestions: [list of actual questions]
   extractionNotes.weaknesses: ["Owner avoided answering difficult questions"]

Example 3 - Grammar/Spelling:
Owner says: "we are profssionals with 15 years exprince"

WRONG: keyPhrases: ["we are profssionals with 15 years exprince"]
RIGHT: keyPhrases: ["emphasizes professionalism and extensive experience"]

Example 4 - Confidence Assessment:
Owner says: "We typically work with budgets around $50k" (stated once, confidently)

RIGHT:
   minBudget: 50000
   confidence.minBudget: "high"

WRONG:
   confidence.minBudget: "medium"

Example 5 - Red Flags vs Deal-Breakers:
Customer: "We've had bad experiences with [vendor]"
Owner: "Oh, I've heard about them. We actually beat their pricing by 30%"

RIGHT:
   redFlag: "not_demonstrated" (owner didn't express hesitation)
   greenFlags: ["customer has comparative interest", "owner positioned value"]

Example 6 - Objection Handling Pattern:
Customer: "Your timeline is too aggressive"
Owner: "What if we break it into phases? We can deliver phase 1 in 2 weeks"

RIGHT:
   timelineObjection: "proposes phased approach to address timeline concerns"
   confidence.timelineObjection: "high"

Example 7 - Missing Patterns:
Owner never discusses pricing, never rejects anything, accepts every proposal

RIGHT:
   pricingLogic.dealBreakers: ["not_demonstrated"]
   decisionMakingPatterns.whenToSayNo: ["not_demonstrated"]
   extractionNotes.weaknesses: ["Owner showed no price discipline", "Owner accepted all terms without negotiation"]

CONVERSATION TRANSCRIPT:
{transcript}

INDUSTRY CONTEXT:
- Industry: {industry}
- Scenario Type: {scenarioType}

EXTRACTION INSTRUCTIONS:

1. COMMUNICATION STYLE
   - Extract INTENT and TONE, not verbatim text
   - If owner has spelling errors, capture meaning instead
   - Identify natural response patterns
   - Note formality level and emotional tone

2. PRICING LOGIC
   - What budget ranges did owner mention?
   - When did owner show flexibility vs. firmness?
   - What pricing-related reasons would make owner reject a client?
   - How confidently does owner discuss money?

3. QUALIFICATION CRITERIA
   MUST-HAVES: Things owner REQUIRES from clients
   DEAL-BREAKERS: Reasons owner REJECTS clients
   GREEN FLAGS: Client behaviors that EXCITED the owner
   RED FLAGS: Client behaviors that made owner HESITANT
   (Each with detailed lookup instructions and confidence assessment)

4. OBJECTION HANDLING
   - How did owner respond to price concerns?
   - How did owner handle timeline questions?
   - How did owner react to criticism?
   - What objections did owner NOT address?

5. DECISION-MAKING PATTERNS
   WHEN TO SAY YES/NO: Only if ACTUALLY demonstrated
   WARNING SIGNS: What made owner pause or become cautious?

6. CONVERSATION QUALITY ASSESSMENT
   - Unanswered questions list
   - Resolution check
   - Completeness score (0-100 with scoring guide)
   - Missing patterns for scenario type

7. EXTRACTION NOTES
   STRENGTHS / WEAKNESSES / SUGGESTIONS

CRITICAL REMINDERS:
- Extract INTENT, not verbatim text (grammar cleanup)
- Only mark as "demonstrated" if owner ACTUALLY did it
- Distinguish owner's criteria from customer's complaints
- List unanswered questions explicitly
- Assess conversation completeness honestly
- Provide constructive feedback in extractionNotes

DO NOT copy spelling/grammar errors
DO NOT confuse customer complaints with owner deal-breakers
DO NOT say owner "rejects X" if they never rejected anything
DO NOT assume patterns that weren't demonstrated

OUTPUT FORMAT:
Return ONLY valid JSON matching the schema above.
No markdown formatting, no explanations, just the JSON.
```

---

### Grammar Normalization Prompt

**File:** `lib/ai/normalize-patterns.ts`

**Used for:** Fixing spelling/grammar in extracted patterns while preserving voice

**SYSTEM PROMPT (EXACT):**
```
You are a professional copy editor specializing in preserving authentic voice while fixing technical errors.
```

**Rules:**
- Fix spelling and grammar ONLY
- Preserve casual tone, contractions, personality, sentence structure
- Keep emphasis and energy
- For intent-based phrases (already cleaned): no change
- Temperature: 0.1 (very low for consistency)

---

### Prompt Templates

**File:** `lib/ai/prompts/templates.ts`

Contains reusable building blocks:

**BEHAVIOR_RULES:** standard, strict, professional variants

**OUTPUT_FORMATS:** json, structured, conversational

**INDUSTRY_CONTEXT:** Communication style guidelines for 8 industries:
- legal_services, fitness_coaching, mortgage_advisory, business_consulting
- interior_design, real_estate, financial_advisory, marketing_agency

**CONFIDENCE_GUIDELINES:** Escalation rules and uncertainty phrases

**QUALIFICATION_TEMPLATES:** Budget, authority, and need discovery questions

**`buildPrompt()`:** Assembles components (role + behavior + industry + custom + format) into complete prompts

---

### Prompt Validation

**File:** `lib/ai/prompts/utils/validation.ts`

**Utilities:**
- `estimateTokens(text)` - ~4 chars per token approximation
- `exceedsTokenBudget(prompt, budget)` - Budget check
- `validatePrompt(prompt)` - Checks empty, min/max length, structure, unbalanced quotes
- `getPromptMetrics(prompt)` - Characters, tokens, lines, words
- `getPromptSizeWarning(prompt, budget)` - Warning if > 80% of budget

---

## 8. CRITICAL FINDINGS SUMMARY

### ✅ What EXISTS and WORKS:

- **Simulation System** - Complete end-to-end: start, message, complete (5 scenario types)
- **Pattern Extraction** - 3-phase pipeline: extract -> normalize -> validate (with quality gating)
- **Pattern Merging** - Confidence-aware merging across multiple simulations
- **Business Profile** - Manual + auto-extracted fields with progress tracking
- **Validation Workflow** - Owner can approve/reject/approve-all extracted patterns
- **Re-Extraction** - Can re-analyze all completed simulations at once
- **Quality Checking** - Multi-factor quality assessment with recommendations
- **Grammar Normalization** - Automatic spelling/grammar cleanup in extracted patterns
- **Centralized Prompt System** - 5 prompt types with configs, templates, validation
- **Lead Table** - Full schema with statuses, scoring, owner actions
- **Conversation Table** - Full schema with qualification, sentiment, AI confidence
- **ConversationMessage Table** - With intent detection and confidence scores
- **Lead/Conversation Dashboard Pages** - List views with search, filter, sort
- **Multi-Tenant Architecture** - Tenant isolation on all endpoints
- **Platform Admin System** - Super-admin with roles, audit logs, tenant management
- **Widget Configuration** - API key, color, position, greeting (in Tenant model)
- **Analytics** - ConversationMetrics aggregation, API usage tracking
- **Notification System** - 6 notification types with email support

### ⚠️ What EXISTS but INCOMPLETE:

- **Extraction captures INTENT, not verbatim phrases** - `keyPhrases` contain intent-based descriptions like "emphasizes professionalism" rather than actual quotes like "I focus on transparency so there are no surprises"
- **Deal-breakers are STRINGS, not objects with scoreImpact** - `dealBreakers: string[]` not `dealBreakers: { text, scoreImpact }[]`
- **Lead scoring is schema-only** - `leadScore` and `qualificationScore` fields exist in DB but no active AI-powered scoring endpoint
- **Widget is config-only** - Widget settings exist in Tenant table but no embeddable widget JS/component
- **leadQualification prompt configured but not fully wired** - Config exists (temp: 0.7, maxTokens: 200) but no active endpoint using it
- **summarization and intentDetection prompts configured but no active endpoints** - Prompt configs defined but no route handlers found
- **Lead/Conversation API endpoints are GET-only** - Can list but no POST/PUT for creating or starting conversations programmatically
- **Conversation detail/message endpoints** - No POST endpoint to send messages in live conversations

### ❌ What's MISSING:

- **ownerVoiceExamples** field in BusinessProfile - No verbatim phrase storage
- **yearsExperience** field - Not captured anywhere
- **serviceOfferings** field - Only `serviceDescription` exists (free text, not structured)
- **specializations** field - Not captured
- **certifications** field - Not captured
- **Verbatim phrase extraction** - Prompt explicitly extracts intent, not exact words
- **Business facts extraction** - No structured business data extraction
- **Score weights / scoreImpact** in qualification criteria - Confidence levels exist but no numeric weights
- **Live conversation start endpoint** - No `POST /api/v1/conversations/start`
- **Live conversation message endpoint** - No `POST /api/v1/conversations/[id]/message`
- **Embeddable chat widget component** - No public-facing widget code
- **Real-time lead scoring endpoint** - No API that runs AI scoring against qualificationCriteria
- **Conversation summarization endpoint** - Config exists but no route
- **Intent detection endpoint** - Config exists but no route

### Lead Intelligence System:

✅ **DATABASE EXISTS** - Full Lead, Conversation, ConversationMessage models with all fields
✅ **API EXISTS** - GET endpoints for listing leads and conversations
✅ **UI EXISTS** - Dashboard pages for leads and conversations with search/filter
✅ **WIDGET CONFIG EXISTS** - Tenant-level widget settings in database

❌ **NOT YET BUILT:**
- Live conversation start/message API endpoints
- Embeddable chat widget JS component
- AI-powered real-time lead scoring
- Conversation summarization pipeline
- Intent detection pipeline
- Lead qualification using businessProfile patterns

---

END OF REPORT
