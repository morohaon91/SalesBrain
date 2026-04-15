# System Alignment Audit: SalesBrain vs. Baseline

**Date**: April 13, 2026  
**Audit Scope**: Current implementation vs. AI Lead Warm-Up System Baseline + Architecture Planning  
**Status**: In-Development Implementation with Core Features Partially Complete  
**Overall Alignment**: ~65% (foundational + partially implemented, significant gaps exist)

---

## Executive Summary

SalesBrain is a **Next.js-based multi-tenant SaaS** implementing the AI Lead Warm-Up System baseline. The codebase has strong foundational elements (multi-tenancy, auth, DB schema) and partial feature implementations across onboarding, conversations, scoring, and analytics. However, critical gaps exist in CLOSER methodology enforcement, knowledge base RAG integration, manual takeover workflow, and team management.

**Key Finding**: System is architecturally sound but feature-complete estimates are misleading—code exists for most components but many are partially functional or lack full integration.

---

## Part 1: Existing System Inventory

### 1.1 Project Structure

```
SalesBrain/
├── app/
│   ├── (auth)/                 # Auth pages: login, register
│   ├── (dashboard)/             # Protected user dashboard
│   │   ├── analytics/
│   │   ├── conversations/       # Lead chat browser
│   │   ├── leads/
│   │   ├── learning/            # Simulation UI
│   │   ├── profile/             # Business profile mgmt
│   │   ├── settings/
│   │   ├── simulations/         # Simulation engine UI
│   │   ├── knowledge-base/      # Knowledge base UI (NEW)
│   │   └── widget-settings/     # Chat widget config
│   ├── (onboarding)/            # Questionnaire flow
│   ├── admin/                   # Platform admin dashboard (NEW)
│   └── api/v1/
│       ├── auth/                # JWT auth endpoints
│       ├── conversations/       # Conversation CRUD
│       ├── leads/
│       ├── onboarding/
│       ├── profile/             # Profile extraction & approval
│       ├── public/lead-chat/    # PUBLIC widget API (core)
│       ├── knowledge-base/      # RAG endpoints (NEW)
│       ├── analytics/
│       └── platform-admin/      # Admin only APIs
├── lib/
│   ├── ai/                      # AI integration layer
│   │   ├── client.ts            # Claude API wrapper
│   │   ├── closer-conversation.ts  # CLOSER framework engine
│   │   ├── prompts/             # System prompts by feature
│   │   ├── extract-patterns.ts  # Profile learning
│   │   ├── objection-tracker.ts # Objection handling
│   │   └── usage.ts             # Token/cost tracking
│   ├── scoring/                 # Lead scoring logic
│   │   ├── hybrid-scorer.ts     # PHASE 1: Hybrid scoring
│   │   └── early-exit-detector.ts
│   ├── vector/                  # PHASE 3: Vector/RAG
│   │   ├── pinecone-client.ts
│   │   ├── embeddings.ts
│   │   ├── knowledge-chunker.ts
│   │   ├── semantic-search.ts
│   │   └── vector-uploader.ts
│   ├── auth/                    # JWT, middleware
│   ├── api/                     # HTTP client utilities
│   └── prisma.ts                # DB client
├── prisma/
│   ├── schema.prisma            # Core data model
│   └── seed.ts
├── components/                  # React components
│   ├── conversation/            # Chat UI
│   ├── closer/                  # CLOSER framework UI (NEW)
│   └── knowledge-base/          # KB UI (NEW)
└── public/                      # Chat widget (NEW)
```

**Entry Points**:
- Public chat widget: `/api/v1/public/lead-chat/[widgetApiKey]/message`
- Dashboard: `/app/(dashboard)/*`
- Admin: `/app/admin/*`
- Onboarding: `/app/(onboarding)/questionnaire`

---

### 1.2 Technology Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Framework** | Next.js | 14.0.0 | App router, hybrid SSR/API |
| **Database** | PostgreSQL | - | Via Prisma ORM |
| **ORM** | Prisma | 6.19.2 | Client-side only |
| **AI/LLM** | Anthropic Claude | 0.16.0 | Claude API for completions |
| **Vector DB** | Pinecone | 7.1.0 | PHASE 3: Knowledge base RAG |
| **Cache/Queue** | Redis (ioredis) | 5.3.2 | Configured, usage minimal |
| **Real-time** | Socket.IO | 4.6.0 | For live dashboard (configured, limited use) |
| **Auth** | JWT (jsonwebtoken) | 9.0.0 | Custom JWT implementation |
| **Password** | bcryptjs | 2.4.3 | Password hashing |
| **HTTP Client** | Axios | 1.13.6 | API requests |
| **Validation** | Zod | 3.22.4 | Request validation |
| **React Query** | @tanstack/react-query | 5.0.0 | Async state mgmt |
| **UI Framework** | React Hook Form + Tailwind | Latest | Form handling + styling |
| **Email** | Resend | 1.0.0 | Email delivery |
| **i18n** | next-i18next | 15.4.3 | Internationalization (configured) |
| **Charts** | Recharts | 2.9.0 | Analytics visualization |

**Assessment**: Modern, well-chosen stack aligned with baseline. Pinecone integration is premature (PHASE 3, not MVP) but infrastructure exists.

---

### 1.3 Database Schema

**Core Tables** (17 total):

| Table | Purpose | Key Fields | Relationships |
|-------|---------|-----------|---------------|
| **Tenant** | Business account | id, businessName, subscriptionTier, widgetApiKey, onboardingComplete | ← users, profiles, conversations, leads, simulations |
| **User** | Team member | id, tenantId, email, password, role (OWNER/ADMIN/VIEWER) | → Tenant |
| **BusinessProfile** | Owner's learned style | tenantId, communicationStyle, closerFramework, ownerNorms, knowledgeBase, embeddingsCount | → Tenant |
| **Simulation** | Training scenario | tenantId, scenarioType, status, extractedPatterns, ownerApprovalStatus | ← SimulationMessage, → Tenant |
| **SimulationMessage** | Simulation transcript | simulationId, role, content | → Simulation |
| **Conversation** | Lead chat session | tenantId, leadId, sessionId, status, closerProgress, scoringBreakdown, summary | ← ConversationMessage, → Tenant, Lead |
| **ConversationMessage** | Lead msg transcript | conversationId, role, content, detectedIntent | → Conversation |
| **Lead** | Prospect record | tenantId, name, email, phone, status, qualificationScore | → Tenant, ← Conversation |
| **Notification** | In-app alert | tenantId, type, conversationId, leadId, read | → Tenant |
| **ConversationMetrics** | Daily aggregates | tenantId, date, totalConversations, qualifiedLeads, avgScore | (denormalized) |
| **AuditLog** | Change tracking | tenantId, userId, action, entityType | System-wide |
| **ApiUsage** | Cost tracking | tenantId, provider, tokensUsed, cost, latencyMs | Per-call tracking |
| **PlatformAdmin** | Admin user | id, email, role, permissions | → PlatformAuditLog |
| **PlatformAuditLog** | Admin actions | adminId, action, targetType | → PlatformAdmin |
| **PlatformSettings** | Global config | signupsEnabled, aiCostBudget, supportEmail | Singleton |

**Schema Alignment**: ✅ Well-designed for baseline MVP. Includes forward-looking fields (pineconeNamespace, knowledgeBase) for PHASE 3 but don't block MVP.

---

### 1.4 Data Storage Components

| Component | Implementation | Purpose | Status |
|-----------|---|---------|--------|
| **PostgreSQL (Primary DB)** | Prisma ORM | All business data | ✅ Active, fully functional |
| **Pinecone (Vector DB)** | @pinecone-database/pinecone SDK | Knowledge base embeddings (RAG) | 🟡 Configured, PHASE 3 feature (not MVP critical) |
| **Redis** | ioredis client | Caching layer, job queue | 🟡 Configured, minimal usage in current code |
| **File Storage** | Not implemented | Document uploads (future) | ❌ Not in baseline |
| **Socket.IO** | socket.io server | Real-time dashboard updates | 🟡 Configured, not actively used in code |

**Verdict**: Database-centric storage pattern. Pinecone is over-engineered for current MVP scope—could defer to database text search until knowledge base grows.

---

### 1.5 Authentication & Multi-Tenancy

**Authentication**:
- **Method**: JWT (custom implementation)
- **Storage**: HTTP-only cookies + localStorage (hybrid)
- **Refresh**: Token refresh endpoint at `/api/v1/auth/refresh`
- **Password**: bcryptjs hashed
- **Session**: Per-user, tracked in User model (lastLoginAt)
- **Code Location**: `lib/auth/jwt.ts`, `lib/auth/middleware.ts`

**Multi-Tenancy**:
- **Model**: Shared database, schema isolation via `tenantId` foreign keys
- **Routing**: Tenant identified via:
  - JWT claims (user login)
  - `widgetApiKey` (public lead chat)
  - Admin impersonation (platform admins)
- **Data Isolation**: Row-level via WHERE tenantId = $1 on all queries
- **Resource Limits**: `conversationsThisMonth` / `conversationsLimit` tracked in Tenant model
- **Code**: Enforced in middleware, API routes validate `tenantId` match

**RBAC**:
- **Levels**: OWNER, ADMIN, VIEWER (on User model) + SUPER_ADMIN/ADMIN/SUPPORT/DEVELOPER (PlatformAdmin)
- **Implementation**: Basic role checks in middleware, not comprehensive permission matrix
- **Status**: ✅ Sufficient for MVP (OWNER controls all, ADMIN/VIEWER are stubs)

**Assessment**: ✅ **ALIGNED**. Multi-tenancy properly isolated. JWT secure. RBAC minimal but functional.

---

### 1.6 Core Features Implemented

#### **Onboarding Flow**
**What exists**:
- Step 1: Business type questionnaire at `app/(onboarding)/questionnaire`
- Collects: industry, serviceDescription, targetClientType, budgetRange
- API: POST `/api/v1/onboarding/questionnaire`
- Creates BusinessProfile record with 20% initial completionPercentage

**What's missing**:
- Business type selection scaffold exists (HTML structure) but backend does not validate against supported list
- No "8-10 business types" enumeration (baseline says "Contractors, IT Services, Software Development Services, Financial Services")
- No suggestions for "next scenario" based on business type

**Alignment**: 🟡 **PARTIAL**. Questionnaire works, but business type filtering not enforced.

---

#### **Simulations**
**What exists**:
- Full simulation engine at `app/(dashboard)/simulations/*`
- Scenario types: String field (no enum validation)
- Storage: Simulation model stores aiPersona (JSON), messages via SimulationMessage
- AI persona generation: `lib/ai/prompts/simulation.ts` generates realistic customer personas
- Message loop: User types, AI responds in real-time
- Completion tracking: status = COMPLETED, ownerApprovalStatus = PENDING/EXTRACTED/APPROVED
- Pattern extraction: `lib/ai/extract-patterns.ts` analyzes responses

**Technical details**:
- POST `/api/v1/simulations/[id]/message` handles AI responses
- Simulations can be paused/resumed (status = IN_PROGRESS)
- Owner can review and approve extracted patterns

**Issues found**:
- Scenarios are not bound to business type (anyone can run any scenario)
- "3-5 recommended scenarios" logic is missing (no suggestion engine)
- No "consistency scoring" across simulations (baseline says progress measured by consistency)
- Learning progress calculation is simplistic (based on completedScenarios count, not quality)

**Alignment**: 🟡 **PARTIAL**. Simulation engine works, but guidance/progression logic incomplete.

---

#### **Conversation Engine**
**What exists**:
- Lead-facing chat widget via public API: `app/api/v1/public/lead-chat/[widgetApiKey]/message`
- Conversation lifecycle:
  1. POST `.../message` → stores LEAD message, calls AI, stores AI response
  2. Conversation stays ACTIVE until explicitly ended
  3. POST `.../end` → triggers analysis, scoring, summary generation
- Message history stored in DB, retrieved on each call
- CLOSER framework integration: `lib/ai/closer-conversation.ts` tracks phase progression

**CLOSER Implementation**:
- System prompt includes CLOSER guidance (Clarify → Overview → Label → Sell → Explain → Reinforce)
- Conversation tracks `closerProgress` JSON (which phases completed)
- Phase detection: `detectPhaseCompletion()` analyzes AI responses
- Phase progression: currentPhase auto-advances
- **But**: Detection is pattern-matching based, not enforced—AI can skip phases or regress

**Technical flow**:
1. Load conversation + profile + knowledge base (if tenantId provided)
2. Call `generateCloserResponse()` with history + profile + progress
3. Build phase-specific system prompt (includes CLOSER guidance)
4. Call Claude API
5. Detect phase completion, update progress

**Issues found**:
- CLOSER framework guidance exists but is advisory, not enforcing—AI can deviate
- No hard rule preventing topic jumping (Clarify → Sell without Label)
- Knowledge base retrieval (`searchKnowledgeBase()`) is called but RAG context integration is missing from final system prompt
- Phase detection is weak (heuristic-based)

**Alignment**: 🟡 **PARTIAL**. Conversation flow works, CLOSER is present but not strictly enforced.

---

#### **Owner Profile**
**What exists**:
- Stored in: BusinessProfile table (one per tenant, unique constraint)
- Fields populated:
  - Manual: industry, serviceDescription, targetClientType, typicalBudgetRange, serviceArea, teamSize
  - Auto-extracted from simulations: communicationStyle, pricingLogic, objectionHandling, closerFramework, ownerVoiceExamples
  - Hybrid: ownerNorms (budgets/timelines), ownerValues (likes/dislikes in clients)
- Approval workflow: profileApprovalStatus = PENDING → READY → APPROVED → LIVE
- Editability: Profile can be edited at any time (even LIVE) via `app/(dashboard)/profile/edit`
- Metadata: completionPercentage, lastExtractedAt, simulationCount

**When retrieved**:
- On every conversation message → passed to `generateCloserResponse()`
- During conversation end → used in hybrid scoring
- In analytics aggregations

**How used in AI**:
- Passed as part of system prompt context
- businessName from tenant + profile fields included
- Examples: "You represent [businessName], a [industry] business..."
- No RAG—profile is used as-is in prompt

**Issues found**:
- Profile is stored as JSON blobs for complex fields (communicationStyle, closerFramework) but no validation schema
- Extraction logic (`lib/ai/extract-patterns.ts`) may produce inconsistent structures
- Completion percentage is calculated but not driving UI guidance
- 90% completion unlock logic is missing—no check in API to prevent go-live at < 90%

**Alignment**: 🟡 **PARTIAL**. Profile system works, extraction exists, but completion gates not enforced.

---

#### **AI Agent Behavior**
**CLOSER Methodology**:
- ✅ Stages defined: Clarify, Label, Overview, Sell, Explain, Reinforce
- ✅ System prompt includes stage descriptions
- 🟡 **NOT strictly enforced**—AI can deviate, no state machine hard rules

**Agent Identity**:
- Persona: "the team of [businessName]"
- Enforced in system prompt: `buildCloserSystemPrompt()` includes businessName

**Agent Limitations**:
- Prompt includes: "Never engage in pricing negotiations, contracts, or promises"
- **But**: No execution guard—AI trained by prompt, not by code enforcement
- No hard-stop for forbidden topics

**Response Guidelines**:
- Expected to remain "short and efficient"
- No maximum length enforced in code
- Handoff suggestion timing: Not explicit, left to AI judgment

**Assessment**: 🟡 **PARTIAL**. Behavior mostly defined in prompts, limited by AI training. No hard constraints.

---

#### **Lead Scoring**
**What exists**:
- Model: Hybrid scoring combining rules (60%) + AI (40%)
- Rules-based: budgetFit (0-30), timelineFit (0-20)
- AI-powered: engagementQuality (0-25), valueAlignment (0-25)
- Temperature: Cold (0-40), Warm (41-70), Hot (71-100)
- Triggers: On conversation end (POST `.../end`)
- Output: ScoringBreakdown JSON stored in conversation.scoringBreakdown

**Scoring data**:
- Budget: extracted from conversation via AI + compared to ownerNorms.typicalBudgets
- Timeline: extracted from conversation + compared to ownerNorms.typicalTimelines
- Engagement: Lead responsiveness, question depth, urgency signals
- Alignment: Value match (ownerValues.likesInClients vs. detected lead traits)

**Green/red flags**:
- Model detects greenFlags, redFlags, dealBreakers, mustHaves in qualificationAnalysis
- Recommendation: call_immediately | call_soon | email_first | skip

**Code location**: `lib/scoring/hybrid-scorer.ts`

**Issues found**:
- Scoring is AI-assisted but the AI does the detection—no validation that extracted values are reasonable
- Budget/timeline extraction happens during end-of-conversation analysis, not per-message
- No real-time scoring feedback during conversation (baseline says "after each conversation", which this does)
- ownerNorms/ownerValues may be null if profile not complete → fallback to defaults missing

**Alignment**: ✅ **ALIGNED**. Hybrid scorer implemented as described, cold/warm/hot classification working.

---

#### **Real-Time Dashboard**
**What exists**:
- Dashboard at `app/(dashboard)/conversations` lists all active conversations
- Real-time updates: Socket.IO configured but code doesn't actively use it for live push
- Currently: React Query polls for updates (not true real-time push)
- Display: Conversation list with status, lead name, score, latest message preview
- UI: `/app/(dashboard)/conversations/[id]/page.tsx` shows full transcript

**Issues found**:
- Real-time is aspirational (Socket.IO configured but backend doesn't emit events)
- Polling lag means "live" is actually ~5-30sec behind depending on QS interval
- No streaming message display (message appears after full AI response completes)

**Alignment**: 🟡 **PARTIAL**. Dashboard exists and displays data, but "real-time" is misleading (not truly live).

---

#### **Manual Takeover**
**What exists**:
- UI: "Take over" button on conversation page (stub exists)
- Status tracking: Conversation has `humanInterventionNeeded` boolean field

**What's missing**:
- **No implementation**: Takeover API endpoint does not exist
- No AI stop logic when human takes over
- No handoff confirmation workflow
- State synchronization not coded
- No UI to switch between AI mode and manual mode

**Alignment**: ❌ **MISSING**. Feature not implemented beyond schema fields.

---

#### **Team Management**
**What exists**:
- User model has role field (OWNER, ADMIN, VIEWER)
- Multiple users per tenant supported (User.tenantId foreign key allows N:1)
- Users stored in DB with email, name, role

**What's missing**:
- No endpoint to add team members
- No role enforcement (middleware doesn't check roles for feature access)
- No lead assignment per team member
- No activity tracking per user
- ADMIN/VIEWER roles defined but not functional

**Alignment**: ❌ **MISSING**. Infrastructure exists (schema), feature not implemented.

---

#### **Communication Channels**
**What exists**:
1. **Website Chat Widget**:
   - Embedded widget at `public/` (New/in-progress)
   - API: Public endpoint `POST /api/v1/public/lead-chat/[widgetApiKey]/message`
   - No auth required, identified by widgetApiKey
   - Single iframe-based widget per tenant

2. **WhatsApp**:
   - ❌ Not implemented (no integration code found)

3. **Phone Calls**:
   - ❌ Not implemented (baseline says "future")

**Widget Configuration**:
- Tenant controls via schema: widgetColor, widgetPosition, widgetGreeting, widgetEnabled
- API: Stored in Tenant model, editable at `app/(dashboard)/widget-settings`

**Alignment**: 🟡 **PARTIAL**. Website widget functional, WhatsApp missing, phone future (as planned).

---

#### **Notifications**
**What exists**:
- In-app notifications: Notification table with read/unread status
- Types: WARM_LEAD_DETECTED, CONVERSATION_ENDED, AI_UNCERTAIN, DAILY_SUMMARY, etc.
- Storage: notification.read boolean field

**What's missing**:
- Email notifications: emailSent field exists but no mailer integration
- Push notifications: Not implemented
- Notification triggering: Code to create notifications on events is missing
- Hot lead prioritization: Priority field missing

**Alignment**: 🟡 **PARTIAL**. Schema complete, MVP in-app only (as baseline specifies), but notification generation not wired.

---

#### **Follow-Up Automation**
**What exists**:
- ❌ Not implemented (no automation engine code found)
- Schema: No follow-up job/sequence tables

**What's missing**:
- Follow-up rule definition UI
- Job queue/scheduling system
- Follow-up template management
- Trigger evaluation (e.g., "if lead is warm and no response in 24h, send follow-up")

**Alignment**: ❌ **MISSING**. Not implemented; baseline says "future enhancement" is ok, but baseline also lists it as core feature.

---

#### **Analytics**
**What exists**:
- Daily metrics aggregation: ConversationMetrics table (tenantId, date)
- Metrics tracked: totalConversations, qualifiedLeads, unqualifiedLeads, avgScore, avgDuration, avgMessagesPerConvo, uniqueVisitors, conversionRate, avgConfidence, escalationRate
- UI: `/app/(dashboard)/analytics` displays trends (stub in git status shows modified)
- Chart library: Recharts configured

**Issues found**:
- Metrics are designed but not actively populated (no cron/trigger to write daily aggregates)
- Code to calculate metrics from Conversation data is missing
- "Common objections" extraction mentioned in baseline but no implementation
- "Response time metrics" not tracked (latencyMs field exists but not aggregated)

**Alignment**: 🟡 **PARTIAL**. Schema complete, UI template exists, aggregation logic missing.

---

#### **Learning & Simulation**
**What exists**:
- Pattern extraction: `lib/ai/extract-patterns.ts` analyzes simulation transcripts
- Patterns stored as JSON blobs: communicationStyle, pricingLogic, qualificationCriteria, objectionHandling
- Learning progress: completionPercentage in BusinessProfile
- Extraction triggered on simulation completion

**What's missing**:
- Progress calculation: No logic to compute completionPercentage based on simulation quality
- Consistency scoring: No check that responses across simulations are consistent
- Extraction validation: No check that extracted patterns make sense (could be garbage JSON)
- 90% unlock: No check preventing profile approval < 90% completion

**Alignment**: 🟡 **PARTIAL**. Extraction runs, patterns stored, but progress measurement is incomplete.

---

### 1.7 AI Integration Details

**LLM Provider**: Anthropic Claude
- **Model**: Claude (default, not pinned to specific version—likely 3.5 Sonnet)
- **SDK**: @anthropic-ai/sdk v0.16.0
- **Implementation**: Wrapper at `lib/ai/client.ts`

**Client Implementation**:
```typescript
// Typical call pattern
const response = await createChatCompletion(
  messages: Array<{role: 'user'|'assistant', content: string}>,
  systemPrompt: string,
  options?: {temperature, maxTokens, ...}
)
```

**Prompts**:
- **Simulation**: `lib/ai/prompts/simulation.ts` — generates customer personas
- **Pattern Extraction**: `lib/ai/prompts/pattern-extraction.ts` — extracts communication style from transcript
- **Lead Scoring**: `lib/ai/prompts/*/closer-extraction.ts` — analyzes conversation for CLOSER progress
- **Lead Assistant**: `lib/ai/prompts/lead-assistant.ts` — system prompt for widget conversations
- **CLOSER Framework**: `lib/ai/closer-conversation.ts` — builds phase-specific prompts

**Prompt Strategy**:
- System prompts are built dynamically based on context (business profile, CLOSER phase)
- Few-shot examples: Not extensively used, mostly zero-shot
- Temperature: 0.2 (extraction), 0.7 (responses)
- Max tokens: 100-500 depending on task

**Memory/Context Management**:
- Conversation history: Stored in DB, retrieved on each message
- Session persistence: Per-conversation sessionId
- History sent per-call: Full transcript up to current message
- Cost: No optimization for long conversations (could hit token limits)

**Objection Handling**:
- `lib/ai/objection-tracker.ts` tracks objections across conversation
- Tracks: budget, timeline, scope, authority, competition
- Stored in conversation.objectionsRaised array

**Learning & Profile Generation**:
- Simulations → pattern extraction → BusinessProfile update (automated)
- Extraction quality: Depends on AI output, no validation
- Learning progress: Percentage-based, not skill-based

**Assessment**: ✅ **Aligned with baseline**. Claude integration solid, prompts well-structured. Lacks sophistication (no prompt caching, no fine-tuning).

---

### 1.8 External Integrations

**Pinecone (Vector DB)**:
- **Status**: 🟡 Integrated, not actively used
- **Purpose**: Knowledge base RAG (PHASE 3, not MVP critical)
- **Code**: `lib/vector/*` module
  - Client initialization: `getPineconeClient()` lazy-loads on first use
  - Index management: `getOrCreateIndex()` creates per-tenant namespaces
  - Embeddings: `createEmbedding()` via Anthropic embed-english-v3 (inferred from SDK)
  - Search: `searchKnowledgeBase()` — semantic search on uploaded documents
- **Integration point**: `generateCloserResponse()` calls `searchKnowledgeBase()` if tenantId provided
- **Issue**: Search results retrieved but not merged into system prompt (incomplete RAG)

**Calendar Integration**:
- ❌ Not implemented (baseline says planned, not MVP)

**WhatsApp Business API**:
- ❌ Not implemented

**Email (Resend)**:
- ✅ Configured (resend v1.0.0 in deps)
- 🟡 Not actively integrated (no email trigger code found)
- Intended for: Password resets, notifications, follow-ups

**Payment Integration**:
- ❌ Not implemented (baseline doesn't mention, pricing/billing out of scope for MVP)

---

## Part 2: Baseline Requirements

### 2.1 MVP Must-Haves

| Feature | Baseline Requirement |
|---------|---------------------|
| **Multi-Tenant Architecture** | Isolated environments per business, separate data, secure routing |
| **Onboarding Flow** | Collect business type, create initial profile |
| **Simulations (3-5)** | Real-time AI scenarios, owner responds, responses captured |
| **Business Profile** | Auto-extract communication style, tone, thinking patterns from simulations |
| **Learning Progress Tracking** | Display % progress, unlock go-live at 90% |
| **Profile Approval** | Owner reviews, approves, profile remains editable post-launch |
| **CLOSER Conversation Framework** | AI guides leads through Clarify→Label→Overview→Sell→Explain→Reinforce |
| **Website Chat Widget** | Embedded on owner's site, connects to backend |
| **Real-Time Monitoring** | Dashboard shows active conversations live |
| **Manual Takeover** | Owner can assume control, AI stops immediately |
| **Lead Scoring** | Cold/Warm/Hot classification after each conversation |
| **Conversation Summaries** | AI generates summary, extracted key info, assigned score |
| **In-App Notifications** | Alert owner when Hot lead detected |
| **Team Multi-User Support** | Multiple team members per tenant (role-based) |
| **Analytics** | Conversation trends, common objections, response times, qualified leads |

### 2.2 Future/Out-of-Scope

| Feature | Status |
|---------|--------|
| Voice-based simulations | Future enhancement |
| Voice call interactions | Future enhancement |
| CRM integrations (Salesforce, HubSpot) | Not in baseline |
| Calendar integration (meeting scheduling) | Planned, not MVP |
| Email notifications | Planned, not MVP |
| Push notifications | Planned, not MVP |
| Lead platform integrations (Yelp, Angi) | Planned, not MVP |
| GDPR/SOC 2 compliance | MVP doesn't require |
| A/B testing for campaigns | Future |

### 2.3 Core Architecture Requirements

From baseline + architecture planning:

1. **Multi-tenant isolation**: Separate or row-level isolation ✅ (implemented: row-level via tenantId)
2. **Communication channels**: Widget (required), WhatsApp (required), Phone (future) 🟡 (widget works, WhatsApp missing)
3. **AI learning**: Simulations + response analysis → profile ✅ (implemented but incomplete)
4. **Lead scoring**: Cold/Warm/Hot methodology 🟡 (implemented but rules may be loose)
5. **CLOSER conversation framework**: Stages tracked and progressed 🟡 (tracked but not enforced)
6. **Data storage**: Primary DB for transactional, vector DB for RAG (optional) ✅ (Postgres + Pinecone optional)

---

## Part 3: Feature-by-Feature Comparison

| Feature | Required | Exists | Status | Assessment |
|---------|----------|--------|--------|------------|
| **Onboarding with business type** | YES | PARTIAL | PARTIAL | Questionnaire works, type validation missing |
| **Simulations (3-5 scenarios)** | YES | YES | PARTIAL | Engine works, scenario progression guidance missing |
| **Profile extraction from simulations** | YES | YES | PARTIAL | Extraction runs, pattern validation missing |
| **Learning progress tracking (%)** | YES | YES | PARTIAL | Calculated but 90% unlock not enforced |
| **Profile approval workflow** | YES | YES | ALIGNED | Works as designed, editable post-approval |
| **CLOSER conversation methodology** | YES | YES | PARTIAL | Tracked but not strictly enforced |
| **Website chat widget** | YES | YES | ALIGNED | Fully functional |
| **WhatsApp integration** | YES | NO | MISSING | No implementation |
| **Real-time conversation dashboard** | YES | PARTIAL | PARTIAL | Dashboard works, "real-time" is polling-based |
| **Manual takeover capability** | YES | NO | MISSING | Schema fields exist, no API/workflow |
| **Lead Cold/Warm/Hot scoring** | YES | YES | ALIGNED | Hybrid scorer working |
| **Conversation summaries** | YES | YES | ALIGNED | AI generates on end, stored in DB |
| **Team multi-user support** | YES | PARTIAL | PARTIAL | Schema supports, no role enforcement or UI |
| **Follow-up automation** | YES | NO | MISSING | No automation engine |
| **In-app notifications** | YES | PARTIAL | PARTIAL | Schema complete, trigger logic missing |
| **Analytics (trends, objections, response times)** | YES | PARTIAL | PARTIAL | Schema/UI complete, aggregation logic missing |
| **Calendar integration** | PLANNED | NO | N/A | Correctly out of scope |
| **Email/push notifications** | FUTURE | NO | N/A | Correctly out of scope |

---

## Part 4: Critical Questions & Findings

### 4.1 Pinecone Integration

**Question**: Is Pinecone actually being used?

**Finding**: ✅ **Integrated but not fully active**
- **Code path**: 
  1. Knowledge base upload: `POST /api/v1/knowledge-base/upload` → `uploadKnowledgeBaseToVector()`
  2. Knowledge base search: `lib/vector/semantic-search.ts` calls Pinecone
  3. Conversation integration: `generateCloserResponse()` calls `searchKnowledgeBase(tenantId)` if tenantId provided
- **What's stored**: Chunked documents from knowledge base feature, embedded via Anthropic embeddings API
- **When queried**: On every conversation message (if tenantId provided), though results are not merged into system prompt
- **Data flow**:
  ```
  Business owner uploads docs
  → chunked by knowledge-chunker.ts
  → embedded (1536-dim vectors)
  → stored in Pinecone with tenant namespace
  → on lead chat, semantic search executed
  → results retrieved but not used (RAG incomplete)
  ```

**Verdict**: 🟡 **OVER-ENGINEERED FOR MVP**
- Reason: Knowledge base is PHASE 3, not in baseline MVP scope
- Could be deferred: All information fits in BusinessProfile + conversation context
- Cost: Pinecone SaaS fees + embedding API calls + maintenance overhead
- Recommendation: Remove from MVP, implement simplified in-database search, re-add Pinecone post-launch if knowledge base becomes large (1000+ docs)

---

### 4.2 Owner Profile Usage

**Question**: How is the profile used during conversation?

**Finding**: ✅ **Passed to AI, but incompletely**
- **Storage**: BusinessProfile (one per tenant)
  - Manual fields: industry, serviceDescription, serviceArea, teamSize
  - Auto-extracted: communicationStyle (JSON), closerFramework (JSON), ownerVoiceExamples (JSON)
  - Hybrid: ownerNorms (budgets/timelines), ownerValues (likes/dislikes in clients)
- **Retrieval**: On every conversation message → `tenant.profiles[0]` loaded
- **Usage in AI**:
  ```typescript
  const profileWithBusiness = {
    ...profile,
    businessName: tenant.businessName
  };
  await generateCloserResponse(history, profileWithBusiness, closerProgress, tenantId);
  ```
- **System prompt building**: `buildCloserSystemPrompt()` includes:
  - Business name and description
  - Communication style (if extracted)
  - CLOSER framework guidance
  - Service offerings
- **Knowledge base integration**: Tenant ID passed for RAG, but search results not merged

**Verdict**: ✅ **WORKING AS INTENDED (with minor gaps)**
- Profile is used meaningfully
- Auto-extraction works
- 90% completion unlock is missing (should block approval if < 90%)
- Knowledge base RAG incomplete (search done but results not injected)

---

### 4.3 CLOSER Methodology Implementation

**Question**: Is CLOSER actively enforced or just documented?

**Finding**: 🟡 **PARTIALLY IMPLEMENTED**
- **Stage definitions**: 
  ```typescript
  clarify: { phase: 'clarify', completed: false }
  overview: { phase: 'overview', completed: false }
  label: { phase: 'label', completed: false }
  sell: { phase: 'sell', completed: false }
  explain: { phase: 'explain', completed: false }
  reinforce: { phase: 'reinforce', completed: false }
  currentPhase: 'clarify'  // Tracks progression
  ```
- **Active progression**:
  1. Conversation initialized with currentPhase = 'clarify'
  2. On each message, `analyzeConversationState()` analyzes text
  3. If phase detected as complete, `detectPhaseCompletion()` marks it done
  4. `getNextPhase()` advances currentPhase
  5. Next system prompt includes new phase guidance

- **Hard constraints**: ❌ **MISSING**
  - AI is encouraged to follow phases but not forced
  - No state machine preventing out-of-order transitions
  - Conversation can jump from clarify → sell without label
  - AI can regress (backtrack in phases)

- **Code**: `lib/ai/closer-conversation.ts`
  ```typescript
  const phaseCompleted = await detectPhaseCompletion(response, suggestedPhase);
  if (phaseCompleted) {
    updatedProgress[phaseCompleted] = { completed: true, timestamp };
    updatedProgress.currentPhase = getNextPhase(phaseCompleted);
  }
  ```

**Verdict**: 🟡 **PARTIALLY_IMPLEMENTED**
- Detection works, progression happens
- But no enforcement—AI is free to deviate
- Recommendation: Add hard rules (e.g., "If currentPhase is 'clarify' and AI mentions pricing without clarifying problem first, retry")

---

### 4.4 Database Schema Alignment

**Question**: Does the schema fit the baseline?

**Finding**: ✅ **YES, well-aligned**
- All baseline entities represented: Tenant, User, BusinessProfile, Conversation, Lead, Simulation, Notification
- Forward-looking fields for PHASE 3 (pineconeNamespace, knowledgeBase) don't block MVP
- Relationships properly modeled (1:N Tenant→User, Tenant→Conversation, Tenant→Simulation)
- Indexes on hot columns (tenantId, status, createdAt)
- Enums for statuses (ConversationStatus, LeadStatus, SimulationStatus, etc.) clean

**Issues**:
- No table for follow-up jobs/sequences (can be deferred)
- No WhatsApp channel routing (not implemented)
- No team-based lead assignment (team field missing on Lead)

**Verdict**: ✅ **GOOD**. Schema is well-designed, scalable, and aligned with baseline.

---

### 4.5 Conversation Flow

**Walk-through**: Lead sends message → AI responds

**Step-by-step**:
1. **Entry**: POST `/api/v1/public/lead-chat/[widgetApiKey]/message`
2. **Auth**: Tenant lookup by widgetApiKey (public, no JWT)
3. **Validation**: Conversation exists, is ACTIVE, widgetApiKey matches tenantId
4. **Store lead message**: ConversationMessage.create({ role: 'LEAD', content })
5. **Load context**:
   - Conversation record (with closerProgress, messages)
   - Tenant (businessName, widgetApiKey)
   - BusinessProfile (communication style, CLOSER examples, ownerNorms, ownerValues)
   - Knowledge base (if search enabled) via `searchKnowledgeBase(tenantId)`
6. **Build AI request**:
   - Message history (all prior messages in conversation)
   - System prompt: `buildCloserSystemPrompt(profile, currentPhase, conversationState, relevantKnowledge)`
   - System prompt includes: business identity, CLOSER phase guidance, communication style, knowledge base context (if available)
7. **Call Claude API**: `createChatCompletion(history, systemPrompt, {temperature: 0.7, maxTokens: 500})`
8. **Store AI response**: ConversationMessage.create({ role: 'AI', content })
9. **Update conversation**:
   - lastActivityAt = now
   - closerProgress updated if phase completed
10. **Return**: { success: true, reply: aiContent }

**Knowledge base usage**: ✅ Called, ❌ Not merged (retrieved but not injected into prompt)

**Objections**: Tracked in objectionsRaised array, analyzed during conversation end

**Assessment**: ✅ **Flow is correct**. Context is comprehensive. One gap: RAG results not used.

---

### 4.6 Learning & Simulation

**Question**: Are simulations used to build the profile?

**Finding**: ✅ **YES, with limitations**
- **Flow**:
  1. Owner completes simulation (status = COMPLETED)
  2. Automatically: `lib/ai/extract-patterns.ts` analyzes simulation transcript
  3. Extracted patterns: communicationStyle, pricingLogic, qualificationCriteria, objectionHandling, closerFramework
  4. BusinessProfile fields updated with extracted patterns
  5. completionPercentage incremented (simplisticly: +20% per simulation, capped at 90%)
  6. ownerApprovalStatus = EXTRACTED (owner reviews before APPROVED)

- **Learning progress calculation**:
  ```
  completionPercentage = 20 + (completedScenarios.length * 20) capped at 90%
  ```
  This is simplistic—doesn't measure quality, consistency, or success rate

- **Issues**:
  - No validation that extracted patterns are sensible
  - No cross-simulation consistency check
  - No success-rate scoring (baseline says "success rate in simulations, e.g., booking meetings")
  - 90% unlock not enforced (missing API check)

**Verdict**: 🟡 **PARTIALLY IMPLEMENTED**
- Extraction runs automatically ✅
- Pattern storage ✅
- Progress calculation too simplistic 🟡
- 90% enforcement missing ❌
- Success rate not measured ❌

---

## Part 5: Gap Analysis Summary

### 5.1 Misaligned Components

| Component | Why Built | Current State | Recommendation | Effort |
|-----------|-----------|---------------|-----------------|--------|
| **Pinecone Integration** | PHASE 3 planning (knowledge base RAG) | Over-engineered for MVP | **Remove from MVP**, defer post-launch | 2 days (delete, simplify to DB search) |
| **Real-Time Dashboard (Socket.IO)** | Live conversation monitoring | Configured but not used, polling fallback works | **Keep polling**, remove Socket.IO code | 1 day (cleanup) |
| **Redis Integration** | Caching/job queue | Configured, not actively used | **Remove from MVP deps** or use for session cache | 1 day |
| **i18n (next-i18next)** | Multi-language support | Configured but not used in UI/prompts | **Remove or complete later** | 1 day |

### 5.2 Missing Components

| Component | Status | Impact | Effort to Implement |
|-----------|--------|--------|-------------------|
| **WhatsApp Integration** | ❌ Not started | Can't engage leads via WhatsApp (blocks multi-channel goal) | 3-5 days (API setup, webhook handling, message routing) |
| **Manual Takeover Workflow** | ❌ Schema only, no API | Owner can't assume control mid-conversation | 2-3 days (API, UI state machine, stop logic) |
| **Team Management** | ❌ Schema only, no enforcement | Can't add team members or assign leads | 3-4 days (CRUD APIs, role enforcement, UI) |
| **Follow-Up Automation** | ❌ Not started | Can't automate nurturing sequences | 4-5 days (job queue, rule engine, scheduler) |
| **Notification Triggers** | ❌ Logic missing | Notifications created but not triggered on events | 2-3 days (add event hooks throughout codebase) |
| **Analytics Aggregation** | ❌ Logic missing | Metrics schema exists but not populated | 2-3 days (cron job or event-based aggregation) |
| **Knowledge Base RAG Integration** | 🟡 Partial | Search works but results not used | 1 day (inject search results into system prompt) |
| **CLOSER Enforcement** | 🟡 Partial | Phases tracked but not enforced | 2-3 days (add state machine validation) |
| **Business Type Filtering** | 🟡 Partial | Simulations not bound to business type | 1 day (add enum, validation, scenario suggestions) |
| **Profile Completion Gate** | ❌ Logic missing | 90% unlock not checked in approval API | 1 day (add validation check) |

### 5.3 Potentially Unnecessary Components

| Component | Purpose | Verdict | Reasoning |
|-----------|---------|---------|-----------|
| **Platform Admin Dashboard** | System-wide management | **KEEP** | MVP may need admin oversight, useful for support |
| **PlatformAdmin/PlatformAuditLog tables** | Admin action tracking | **KEEP** | Good for security/compliance, minimal overhead |
| **ApiUsage table** | Cost tracking per tenant | **KEEP** | Essential for billing, quota enforcement |
| **ConversationMetrics table** | Daily aggregates | **SIMPLIFY** | Could compute on-the-fly for MVP, batch later |

---

## Part 6: Rebuild vs. Fix Recommendation

### Current State Assessment

| Aspect | Verdict |
|--------|---------|
| **Baseline implementation %** | ~65% (foundational + partial features) |
| **Foundational quality** | ✅ **STRONG** (multi-tenancy, auth, DB schema, API structure) |
| **Core features working** | 🟡 **MIXED** (simulations work, CLOSER tracked, scoring works, but manual takeover/team/follow-ups missing) |
| **Code organization** | ✅ **GOOD** (clear separation: lib/ai, lib/scoring, lib/vector, components, api routes) |
| **Technical debt** | 🟡 **MODERATE** (over-engineered in places: Pinecone MVP, Socket.IO unused) |
| **Blockers for launch** | 🟡 **SOME** (manual takeover, team mgmt, follow-ups can be deferred; WhatsApp can be optional) |

### Recommendation: **FIX & STREAMLINE** (Hybrid Approach)

#### What to Keep
- ✅ Next.js/Postgres/Prisma foundation
- ✅ JWT authentication + multi-tenancy isolation
- ✅ Simulation engine and pattern extraction
- ✅ CLOSER framework tracking (refine enforcement later)
- ✅ Hybrid scoring system
- ✅ Website widget
- ✅ Dashboard and analytics UI scaffolding

#### What to Fix/Complete (Priority Order)
1. **CRITICAL (MVP blockers)**:
   - Complete notification triggers (link events to notification creation) — **2 days**
   - Implement manual takeover API + UI — **3 days**
   - Fix CLOSER enforcement (hard rules) — **2 days**
   - Add business type filtering to simulations — **1 day**
   - Add 90% completion gate — **1 day**
   - Ensure WhatsApp is optional (document as PHASE 2) — **0.5 day**

2. **HIGH (MVP quality)**:
   - Fix RAG integration (inject search results into prompt) — **1 day**
   - Complete analytics aggregation (cron/event-based) — **2 days**
   - Implement team member addition + role enforcement — **3 days**
   - Complete profile consistency validation — **1 day**

3. **MEDIUM (nice-to-have for launch)**:
   - Email notifications (Resend integration) — **2 days**
   - Real-time dashboard via WebSocket (vs. polling) — **2 days**
   - Follow-up automation engine (can be deferred post-MVP) — **5 days**

4. **LOW (post-MVP)**:
   - Remove Pinecone, replace with DB search — **2 days**
   - Remove unused Redis/Socket.IO code — **1 day**
   - Remove i18n stubs — **0.5 day**

#### What to Remove
- 🗑️ **Pinecone integration** (replace with `pg_trgm` text search in MVP)
- 🗑️ **Redis configuration** (use DB for sessions, defer caching)
- 🗑️ **Socket.IO backend** (polling works fine for MVP, add WebSockets post-launch)
- 🗑️ **i18n stubs** (single language MVP, refactor later)
- 🗑️ **PlatformAdmin dashboard** (optional, simplify MVP to business owner only)

#### Estimated Effort
- **Critical fixes**: 9 days
- **High priority**: 7 days
- **Medium (optional for launch)**: 6 days
- **Cleanup**: 4 days
- **Total MVP readiness**: ~16-20 days of focused work (4-5 weeks with testing/QA)

#### Why This Approach
1. **Preserve strong foundation**: Rebuild would waste 2-3 weeks on solved problems
2. **Quick wins**: Many gaps are small (1-2 day features)
3. **Defer non-critical**: Follow-ups, WhatsApp, team mgmt can launch in PHASE 2
4. **Reduce scope**: Remove Pinecone/Redis/Socket.IO now, add later when justified
5. **Clear path**: Fix list above is explicit, actionable

---

## Part 7: Detailed Findings Report

### Component 1: Onboarding Flow

**What exists**:
- Questionnaire UI at `app/(onboarding)/questionnaire`
- Form collects: industry, serviceDescription, targetClientType, budgetRange
- Backend: POST `/api/v1/onboarding/questionnaire` creates BusinessProfile
- Profile starts at completionPercentage = 20%
- Redirects to simulations after completion

**What's required**:
- Business type selection from predefined list (8-10 types: Contractors, IT Services, Software Development, Financial Services, etc.)
- Suggestions for which simulations to run based on type
- Initial profile data seeding from business type templates

**Alignment**: 🟡 **PARTIAL** (65%)
- Basic questionnaire ✅
- Type selection/filtering ❌
- Template seeding ❌

**Issues found**:
- No BusinessTypeEnum (just string fields)
- No suggestion logic for scenario selection
- No template seeding (owner starts from blank)

**Recommendation**: **MODIFY**
- Add business type enum (1 day)
- Seed initial profile from type templates (1 day)
- Add scenario suggestions based on type (1 day)
- Effort: **3 days**

---

### Component 2: Simulation Engine

**What exists**:
- Full UI and API for simulations
- Scenario types: String field, can be any value
- AI persona generation from `lib/ai/prompts/simulation.ts`
- Real-time conversation with AI as customer
- Pattern extraction on completion: `lib/ai/extract-patterns.ts`
- Owner review + approval workflow

**What's required**:
- 3-5 scenarios per business type
- Scenario progression (suggest next based on completed)
- Consistency scoring across simulations
- Success rate tracking (e.g., lead booked meeting)

**Alignment**: 🟡 **PARTIAL** (70%)
- Engine works ✅
- Pattern extraction ✅
- Scenario progression ❌
- Consistency scoring ❌
- Success metrics ❌

**Issues found**:
- No scenario catalog (can run any scenario)
- Progression is random (ownerProfile.suggestedNextScenario is string field, not calculated)
- Pattern quality not validated
- No measurement of "success" (lead acceptance, booking request, etc.)

**Recommendation**: **MODIFY**
- Create scenario templates per business type (template design + 1 day data entry)
- Implement progression logic (1 day)
- Add consistency validator (1 day)
- Add success metrics extraction (1 day)
- Effort: **3-4 days**

---

### Component 3: Conversation Flow

**What exists**:
- Public chat widget API: `/api/v1/public/lead-chat/[widgetApiKey]/message`
- Message handling, AI response generation, conversation end analysis
- CLOSER framework tracking and phase progression
- Hybrid scoring on conversation end
- Summary generation

**What's required**:
- Real-time conversation with low latency
- Profile incorporation (done ✅)
- CLOSER guidance + enforcement
- Lead scoring (done ✅)
- Summary generation (done ✅)

**Alignment**: ✅ **ALIGNED** (90%)
- Core flow ✅
- CLOSER phases tracked (but not enforced) 🟡
- Scoring ✅
- Summary ✅

**Issues found**:
- CLOSER stages not enforced (AI can skip phases)
- Knowledge base search done but results not used
- No response time limits (conversations can be very long)
- No handoff trigger (AI doesn't suggest meeting scheduling)

**Recommendation**: **FIX & ENHANCE**
- Add CLOSER enforcement (state machine) (2 days)
- Inject RAG results into system prompt (1 day)
- Add handoff trigger logic (1 day)
- Effort: **3-4 days**

---

### Component 4: AI Learning System

**What exists**:
- Simulation → pattern extraction → BusinessProfile update
- Extracted patterns: communicationStyle, pricingLogic, objectionHandling, closerFramework
- Pattern storage as JSON blobs
- Learning progress percentage

**What's required**:
- Validate extracted patterns are sensible
- Consistency check across simulations
- Success rate measurement
- 90% completion requirement for go-live

**Alignment**: 🟡 **PARTIAL** (60%)
- Extraction ✅
- Progress calculation (simplistic) 🟡
- Validation ❌
- Consistency check ❌
- 90% gate ❌

**Issues found**:
- No schema validation for extracted JSON
- Completion % is just scenario count (doesn't measure quality)
- No cross-scenario consistency check
- 90% unlock not enforced in approval API

**Recommendation**: **MODIFY**
- Add pattern validation schema (1 day)
- Implement consistency scorer (1 day)
- Add 90% gate check in approval API (0.5 day)
- Refine progress calculation (0.5 day)
- Effort: **3 days**

---

### Component 5: Owner Profile Management

**What exists**:
- BusinessProfile table (one per tenant)
- Fields: manual (industry, serviceArea, etc.) + auto-extracted (communicationStyle, closerFramework, etc.)
- Approval workflow: PENDING → READY → APPROVED → LIVE
- Edit UI at `app/(dashboard)/profile/edit`
- Always editable, even when LIVE

**What's required**:
- Profile includes communication style, business hours, services, pricing ranges, team size
- Profile editable at all times
- 90% completion requirement before approval
- Extractable from simulations

**Alignment**: ✅ **ALIGNED** (85%)
- Storage ✅
- Edit workflow ✅
- Approval workflow ✅
- Auto-extraction ✅
- 90% gate ❌

**Issues found**:
- 90% completion not checked before approval
- No validation of extracted vs. manual field consistency
- closerFramework field could be validated against actual CLOSER usage

**Recommendation**: **FIX**
- Add 90% gate check (0.5 day)
- Add consistency validation (1 day)
- Effort: **1.5 days**

---

### Component 6: Lead Scoring

**What exists**:
- Hybrid scorer: rules (60%) + AI (40%)
- Rules: budgetFit (0-30), timelineFit (0-20)
- AI: engagement (0-25), alignment (0-25)
- Temperature: Cold/Warm/Hot based on total score
- Breakdown stored as JSON for transparency

**What's required**:
- Cold/Warm/Hot classification
- After-conversation scoring
- Recommendation (call_immediately, call_soon, email_first, skip)

**Alignment**: ✅ **ALIGNED** (95%)
- Scoring algorithm ✅
- Classification ✅
- Recommendation ✅

**Issues found**:
- Budget/timeline extraction happens post-conversation only (could be live during chat)
- Fallback defaults when profile is incomplete
- Scoring rules are AI-assisted (trusts Claude output, no validation)

**Recommendation**: **KEEP** (minimal changes)
- Consider live scoring during conversation (post-MVP enhancement)
- Effort: **0 days** (working as designed)

---

### Component 7: Real-Time Dashboard

**What exists**:
- Conversation list UI at `app/(dashboard)/conversations`
- Displays: lead name, status, latest message, score, CLOSER progress
- Conversation detail at `app/(dashboard)/conversations/[id]`
- Shows full transcript and details
- Socket.IO configured but not used (polling via React Query)

**What's required**:
- Live view of active conversations
- Real-time updates as messages arrive
- Manual takeover capability

**Alignment**: 🟡 **PARTIAL** (70%)
- Dashboard UI ✅
- Conversation detail ✅
- Live updates (polling, not true real-time) 🟡
- Manual takeover ❌

**Issues found**:
- "Real-time" is misleading (React Query polling, typically 5-30s lag)
- Socket.IO configured but no backend event emission
- Manual takeover button exists but endpoint doesn't

**Recommendation**: **ENHANCE & FIX**
- Keep polling for MVP (works fine)
- Remove Socket.IO from MVP (add post-launch if needed)
- Implement manual takeover (3 days, separate task)
- Effort: **0.5 days** (cleanup Socket.IO stubs)

---

### Component 8: Manual Takeover

**What exists**:
- Schema: Conversation has `humanInterventionNeeded` field
- UI: "Take over" button stub in conversation detail

**What's required**:
- Owner can take over at any time
- AI immediately stops
- Owner assumes full control
- Conversation transitions to manual mode
- State properly tracked

**Alignment**: ❌ **MISSING** (0%)
- No API endpoint
- No handoff logic
- No stop mechanism
- No state machine

**Issues found**:
- Feature exists only in schema
- No workflow defined
- No testing

**Recommendation**: **IMPLEMENT**
- Create POST `/api/v1/conversations/[id]/takeover` endpoint (1 day)
- Add state tracking: Conversation.status = 'ESCALATED' | 'MANUAL' (1 day)
- Update dashboard UI to reflect manual mode (0.5 day)
- Effort: **2.5 days**

---

### Component 9: Team Management

**What exists**:
- User model with role field (OWNER, ADMIN, VIEWER)
- Multi-user per tenant supported (1:N relationship)
- Database storage ready

**What's required**:
- Add team members (invite via email)
- Role-based access (OWNER sees all, ADMIN sees most, VIEWER read-only)
- Lead assignment to team members
- Activity tracking per user

**Alignment**: ❌ **MISSING** (20%)
- Schema ready ✅
- API endpoints ❌
- Role enforcement ❌
- Lead assignment ❌

**Issues found**:
- No "add team member" endpoint
- Roles defined but not enforced in middleware
- Lead assignment not possible (no lead.assignedToUserId field)
- Activity tracking not implemented

**Recommendation**: **IMPLEMENT**
- Add lead assignment field to Lead model (0.5 day)
- Create team member CRUD endpoints (2 days)
- Implement role-based access control in middleware (1.5 days)
- Add lead assignment UI (1.5 days)
- Effort: **5-6 days** (can defer to PHASE 2 if pressed)

---

### Component 10: Communication Channels

**Website Chat Widget**:
- ✅ **IMPLEMENTED** — Public API functional, embeddable
- Status: Ready for MVP

**WhatsApp**:
- ❌ **NOT IMPLEMENTED** — No WhatsApp Business API integration
- Recommendation: **Defer to PHASE 2**. Document as optional. Widget alone is sufficient for MVP.

**Phone Calls**:
- ❌ **NOT IMPLEMENTED** — Correctly out of scope per baseline

**Recommendation**: **ACCEPT FOR MVP**
- Website widget is sufficient
- Document WhatsApp as PHASE 2
- Effort: **0 days**

---

### Component 11: Notifications

**What exists**:
- Notification table with types: WARM_LEAD_DETECTED, CONVERSATION_ENDED, AI_UNCERTAIN, DAILY_SUMMARY, etc.
- In-app display with read/unread status
- emailSent field (infrastructure ready for future)

**What's required**:
- In-app notifications for Hot leads (MVP)
- Email notifications (planned, not MVP)
- Notification triggering on events

**Alignment**: 🟡 **PARTIAL** (50%)
- Schema ✅
- Read/unread ✅
- Triggering logic ❌

**Issues found**:
- No code to create notifications when events happen
- Must hook into: conversation end, lead score > 70, human intervention needed
- No notification delivery UI (showing unread count, toast alerts)

**Recommendation**: **IMPLEMENT**
- Add notification creation hooks in conversation flow (1 day)
- Create notification UI component + list page (1.5 days)
- Effort: **2.5 days**

---

### Component 12: Follow-Up Automation

**What exists**:
- ❌ Nothing — no automation engine, no job queue, no sequence templates

**What's required**:
- Configurable follow-up rules
- Scheduled message sending
- Sequence tracking
- Opt-out handling

**Alignment**: ❌ **MISSING** (0%)

**Recommendation**: **DEFER TO PHASE 2**
- Baseline lists as MVP feature, but implementation is complex (5+ days)
- Can launch without follow-ups—owner can send manual follow-ups
- Implement post-launch when lead pipeline volume justifies automation

---

### Component 13: Analytics & Reporting

**What exists**:
- ConversationMetrics table (daily aggregates schema)
- Analytics UI component at `app/(dashboard)/analytics` (stub)
- Chart library (Recharts) configured
- Metrics designed: conversation count, qualified leads, avg score, engagement metrics

**What's required**:
- Conversation trends
- Common objections
- Response times
- Qualified leads summary

**Alignment**: 🟡 **PARTIAL** (40%)
- Schema ✅
- UI scaffold ✅
- Calculation logic ❌

**Issues found**:
- ConversationMetrics not populated (no cron or event-based update)
- "Common objections" extraction missing (need to aggregate objectionsRaised from conversations)
- "Response times" not aggregated (latencyMs field exists but not summed)

**Recommendation**: **IMPLEMENT**
- Add daily metrics aggregation (cron or event-based) (2 days)
- Implement objections summarization (1 day)
- Complete analytics UI with real data (1 day)
- Effort: **4 days**

---

### Component 14: Database Schema

**What exists**:
- 17 tables well-designed and normalized
- Relationships properly modeled
- Indexes on hot columns
- Enums for status fields

**What's required**:
- Support all baseline features
- Scalable for multi-tenant
- GDPR-ready structure (not required for MVP)

**Alignment**: ✅ **ALIGNED** (95%)
- All entities represented
- Foreign keys correct
- Indices appropriate
- Missing: lead.assignedToUserId (for team mgmt)

**Issues found**:
- No WhatsApp channel tracking (not needed if WhatsApp deferred)
- No follow-up job tracking (not needed if follow-ups deferred)

**Recommendation**: **ADD ONE FIELD**
- Lead.assignedToUserId (for team assignment) — 0.5 day migration

---

### Component 15: Pinecone/Vector Integration

**What exists**:
- Full Pinecone client initialization and index management
- Embedding generation via Anthropic API
- Knowledge base upload and chunking
- Semantic search implementation

**What's required** (for MVP):
- Knowledge base optional (PHASE 3 planning)
- If included: should enhance conversation context
- Current RAG incomplete (search done, results not used)

**Alignment**: 🟡 **PARTIAL** (60%)
- Infrastructure present ✅
- RAG incomplete 🟡
- Over-engineered for MVP 🟡

**Issues found**:
- Pinecone is PHASE 3, not MVP critical
- Adds cost and complexity
- Search results retrieved but not merged into system prompt
- Could use PostgreSQL full-text search for MVP

**Recommendation**: **REMOVE FROM MVP**
- Delete Pinecone integration (2 days)
- Implement simple `pg_trgm` text search in its place (1 day)
- Plan to reintroduce post-launch when knowledge base > 500 docs
- Effort: **3 days** to defer + simplify

---

## Part 8: Risk Assessment & Launch Readiness

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Manual takeover not implemented** | HIGH | Implement before launch (2-3 days) |
| **CLOSER phases not enforced** | MEDIUM | Add validation; allow soft enforcement | 
| **Notification triggers missing** | MEDIUM | Hook into conversation lifecycle (2 days) |
| **WhatsApp not implemented** | LOW | Document as PHASE 2; widget sufficient |
| **Follow-ups not implemented** | LOW | Document as PHASE 2; manual follow-ups work |
| **Team management not functional** | MEDIUM | Implement for team-focused businesses; defer if time-pressed |
| **Analytics incomplete** | MEDIUM | Ship with basic dashboard; enhance post-launch |
| **Pinecone over-engineered** | LOW | Remove and simplify (3 days) |
| **Pattern extraction quality** | MEDIUM | Add validation; monitor early results |
| **Knowledge base RAG incomplete** | MEDIUM | Complete RAG integration or disable feature |

---

## Conclusion

SalesBrain is **~65% aligned** with the baseline MVP. Strong foundation; many features partially implemented. Key gaps:
1. Manual takeover (critical)
2. CLOSER enforcement (medium)
3. Notification triggers (medium)
4. Analytics aggregation (medium)
5. Over-engineered components (Pinecone, Redis, Socket.IO)

**Recommendation: FIX & STREAMLINE** (4-5 weeks of focused work to MVP-ready state)

**Clear path forward**:
- Implement 9 critical fixes (2 weeks)
- Streamline over-engineered parts (1 week)
- Testing & QA (1-2 weeks)
- Launch with website widget, simulations, scoring, CLOSER (MVP core)
- Defer: WhatsApp, follow-ups, team mgmt, Pinecone to PHASE 2
