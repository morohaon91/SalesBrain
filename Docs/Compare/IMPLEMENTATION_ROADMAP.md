# SalesBrain Implementation Roadmap

**Document Purpose**: Prioritized action plan to bring SalesBrain to MVP launch readiness  
**Current State**: 65% aligned with baseline, foundational core solid, feature gaps identified  
**Target Timeline**: 4-5 weeks to MVP launch  
**Scope**: Fix critical gaps, streamline over-engineered components, defer non-critical features

---

## Phase 0: Immediate Wins (Week 1) — 9 Days

These are high-impact, low-effort fixes that unblock other work.

### 0.1 Add Profile Completion Gate [1.5 days]
**Status**: Critical blocker  
**Why**: 90% completion requirement is missing; anyone can go live with unfinished profile  

**Changes**:
1. Update POST `/api/v1/profile/approve` to check `businessProfile.completionPercentage >= 90`
2. If < 90%, return 403 with message: "Profile must reach 90% completion before approval"
3. Update UI to show lock icon if < 90%

**Code location**: `app/api/v1/profile/approve/route.ts`  
**Acceptance criteria**: Approval blocked if < 90%; error message clear

---

### 0.2 Wire Notification Triggers [2 days]
**Status**: Critical (notifications won't appear without this)  
**Why**: Notification schema exists but no code creates notifications on events

**Changes**:
1. Post conversation end → create WARM_LEAD_DETECTED notification if score >= 70
2. Post conversation end → create CONVERSATION_ENDED notification
3. On conversation.humanInterventionNeeded = true → create AI_UNCERTAIN notification
4. Create simple notification list UI component at `app/(dashboard)/notifications`

**Code locations**:
- `app/api/v1/public/lead-chat/[widgetApiKey]/end/route.ts` (add notification creation)
- New component: `components/notifications/NotificationList.tsx`

**Acceptance criteria**: Notifications appear in DB and UI after events; user sees unread count badge

---

### 0.3 Fix RAG Integration [1 day]
**Status**: Medium (currently RAG is non-functional)  
**Why**: Search results retrieved but not merged into system prompt; RAG incomplete

**Changes**:
1. Modify `generateCloserResponse()` to inject search results into system prompt
2. Format: "Relevant knowledge base: [chunk1, chunk2, ...]"
3. Pass merged context to Claude API

**Code location**: `lib/ai/closer-conversation.ts`  
**Acceptance criteria**: Knowledge base search results appear in AI responses; verified via testing

---

### 0.4 Add Business Type Validation [1 day]
**Status**: High (guidance for scenario selection currently missing)  
**Why**: Simulations not bound to business type; no scenario suggestions

**Changes**:
1. Add BusinessType enum in schema: CONTRACTORS, IT_SERVICES, SOFTWARE_DEV, FINANCIAL_SERVICES, CONSULTING, MARKETING, REAL_ESTATE, LEGAL, HVAC, PLUMBING
2. Update Tenant.industry to use enum
3. Update `/api/v1/onboarding/questionnaire` to validate against enum
4. Add scenario recommendations based on type (e.g., IT → tech integration scenarios)

**Code locations**:
- `prisma/schema.prisma` (add enum)
- `app/api/v1/onboarding/questionnaire/route.ts` (validate)
- `lib/ai/prompts/simulation.ts` (business-type-specific personas)

**Acceptance criteria**: Type selection enforced; simulations suggest type-appropriate scenarios

---

### 0.5 Implement Pattern Validation [1.5 days]
**Status**: Medium (extracted patterns could be garbage JSON)  
**Why**: No validation that extracted patterns are sensible; could corrupt profile

**Changes**:
1. Define Zod schema for extractedPatterns (communicationStyle, pricingLogic, etc.)
2. Validate patterns before storing in BusinessProfile
3. On validation fail, mark as PARTIAL (not APPROVED) and ask owner to review

**Code location**: `lib/ai/extract-patterns.ts`  
**Acceptance criteria**: Invalid patterns caught; owner notified; can re-extract

---

### 0.6 CLOSER Phase Enforcement [2 days]
**Status**: Critical (phases tracked but not enforced)  
**Why**: AI can skip or regress phases; CLOSER methodology not actually guiding responses

**Changes**:
1. Add `enforceCloserOrder` flag in conversation
2. If true: validate phase progression (can't jump from clarify → sell)
3. If invalid progression detected: inject correction into system prompt ("You skipped the label phase...")
4. Make enforcement optional per tenant (experimental flag)

**Code location**: `lib/ai/closer-conversation.ts`, `lib/ai/prompts/lead-assistant.ts`  
**Acceptance criteria**: AI respects phase order; no backwards jumps; optional enforcement toggle works

---

### 0.7 Remove Over-Engineered Components [1 day]
**Status**: Cleanup (reduces complexity, saves cost)  
**Why**: Pinecone, Redis, Socket.IO add cost/complexity not justified for MVP

**Changes**:
1. Remove `@pinecone-database/pinecone` from package.json and all imports
2. Replace knowledge base search with simple PostgreSQL `ILIKE` search (temp solution)
3. Remove Socket.IO backend event emission code (keep client for future)
4. Document why removed in comments

**Code locations**:
- `package.json` (remove deps)
- `lib/vector/*` (delete or mark as phase-3-only)
- Delete Socket.IO event emission from API routes

**Acceptance criteria**: App runs without Pinecone/Redis; tests pass; knowledge base search still works (basic)

---

### 0.8 Fix Learning Progress Calculation [1 day]
**Status**: High (completion % is too simplistic)  
**Why**: Currently just +20% per simulation; doesn't measure quality or consistency

**Changes**:
1. Define "learning progress" formula:
   - Base: 20% (questionnaire)
   - Per simulation: +15% (quality score * consistency bonus)
   - Bonus: +10% if 3+ simulations completed with consistent patterns
   - Max: 90% (never auto-reach 100%; requires manual approval)
2. Implement consistency scorer (compare patterns across simulations)
3. Refactor completionPercentage calculation

**Code location**: `lib/scoring/hybrid-scorer.ts` or new file `lib/ai/learning-progress.ts`  
**Acceptance criteria**: Progress reflects quality; 90% requires consistent, high-quality simulations

---

### Summary of Week 1
- Completion gate: 1.5 days
- Notification triggers: 2 days
- RAG integration: 1 day
- Business type validation: 1 day
- Pattern validation: 1.5 days
- CLOSER enforcement: 2 days
- Remove over-engineered components: 1 day
- Learning progress: 1 day
- **Total: 11.5 days** (feasible in week 1 with parallel work)

---

## Phase 1: Critical Features (Week 2) — 7 Days

These block key MVP functionality and must be complete before launch.

### 1.1 Implement Manual Takeover [3 days]
**Status**: Critical (baseline requirement)  
**Why**: Owner must be able to assume control in real-time

**Implementation**:
1. Create POST `/api/v1/conversations/[id]/takeover` endpoint
2. Validate authorization (owner or team member with permission)
3. Set conversation.status = 'ESCALATED' or 'MANUAL'
4. Add `manuallTakenOverAt` timestamp
5. Return success with conversation state
6. Update conversation detail UI:
   - Show "AI active" vs. "Manual (owner)" badge
   - Disable AI generation if status is MANUAL
   - Show owner-only message input
   - Show who took over and when

**Code locations**:
- New: `app/api/v1/conversations/[id]/takeover/route.ts`
- Update: `app/(dashboard)/conversations/[id]/page.tsx` (UI state machine)
- Update: Conversation.status enum to include MANUAL

**Acceptance criteria**:
- POST request marks conversation as manual
- UI switches to manual mode
- Owner can type messages freely
- AI responses stop

---

### 1.2 Complete Analytics Aggregation [2 days]
**Status**: High (dashboard won't have real data otherwise)  
**Why**: ConversationMetrics schema exists but not populated

**Implementation**:
1. Create daily aggregation job (can be cron or event-based):
   - Query conversations from previous day
   - Calculate: totalConversations, qualifiedLeads (score >= 70), avgScore, avgDuration
   - Calculate: avgMessagesPerConvo, uniqueVisitors (from sessionId distinct count)
   - Calculate: conversionRate (qualifiedLeads / totalConversations)
   - Store in ConversationMetrics
2. Implement objections aggregation:
   - Per conversation, extract objectionsRaised
   - Aggregate: "budget" appeared in 25 convos, "timeline" in 15, etc.
   - Store in Conversation.keyTopics or new MetricsSummary table
3. Update analytics UI to display aggregated data

**Code locations**:
- New: `lib/jobs/aggregate-daily-metrics.ts` (logic)
- New: `scripts/run-daily-aggregation.ts` (trigger)
- Update: `app/(dashboard)/analytics/page.tsx` (use aggregated data)

**Acceptance criteria**:
- Daily metrics populated correctly
- Analytics dashboard shows trends, objections, qualified lead count
- Data updates daily

---

### 1.3 Add Team Member Management [2.5 days]
**Status**: High (baseline requires multi-user support)  
**Why**: Team members can't be added; roles not enforced

**Implementation**:
1. Create POST `/api/v1/users/invite` endpoint:
   - Owner sends invite link to email
   - Invitee creates account with invite code
   - Associate with tenant and set role
2. Create GET/PUT `/api/v1/users` endpoints (list, update role)
3. Implement role-based access in middleware:
   - OWNER: full access
   - ADMIN: conversations, leads, profile, settings (no billing)
   - VIEWER: read-only access
4. Update dashboard to show team members and invite form
5. Add `Lead.assignedToUserId` field in schema

**Code locations**:
- New: `app/api/v1/users/*` (CRUD endpoints)
- Update: `lib/auth/middleware.ts` (role enforcement)
- Update: `app/(dashboard)/settings/page.tsx` (team mgmt UI)
- Update: `prisma/schema.prisma` (add assignedToUserId)

**Acceptance criteria**:
- Owner can invite team members via email
- Invitees can accept and join
- Roles enforced (ADMIN can't access billing, VIEWER is read-only)
- Lead assignment works

---

### 1.4 Fix Conversation Streaming/Handoff [2 days]
**Status**: Medium (conversation UX enhancement)  
**Why**: Currently message appears after full AI generation; should stream for better UX

**Implementation**:
1. Convert message endpoint to streaming response (if using Node 18+):
   - POST response as stream (chunked)
   - Browser receives token-by-token (progressive display)
2. Add handoff detection logic:
   - If conversation reaches certain length or score, suggest "time to book a call"
   - AI includes call-to-action in response
3. Add "request handoff" button for leads (optional, nice-to-have)

**Code locations**:
- Update: `app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts` (streaming)
- Update: `lib/ai/closer-conversation.ts` (handoff trigger)
- Update: Widget UI component (display streaming response)

**Acceptance criteria**:
- Messages appear token-by-token (not as block)
- AI suggests handoff when appropriate
- Conversation feels more responsive

---

### Summary of Phase 1
- Manual takeover: 3 days
- Analytics aggregation: 2 days
- Team management: 2.5 days
- Conversation streaming: 2 days
- **Total: 9.5 days** (can compress to 7 with parallel work)

---

## Phase 2: Quality & Polish (Week 3) — Optional for Launch

These enhance experience but aren't blocking. Can defer to post-launch if time-pressed.

### 2.1 Email Notifications [2 days]
- Integrate Resend for email sending
- Email Hot lead alerts and daily summaries
- Can be deferred to post-launch

### 2.2 Objection Handling Dashboard [1.5 days]
- Visualize most common objections by business type
- Track which objections are successfully handled
- Can be deferred to post-launch

### 2.3 Profile Consistency Validator [1.5 days]
- Compare extracted patterns across simulations
- Alert owner if inconsistent (e.g., pricing logic contradicts itself)
- Can be deferred to post-launch

### 2.4 Improve Real-Time (WebSocket) [2 days]
- Implement proper WebSocket event emission for live dashboard
- Currently polling works fine; this is optimization
- Can be deferred to post-launch

---

## Phase 3: Future (Post-MVP)

### 3.1 WhatsApp Integration [4-5 days]
- Integrate WhatsApp Business API
- Route messages to lead conversations
- Launch in PHASE 2

### 3.2 Follow-Up Automation [5-7 days]
- Build job queue and scheduler
- Define follow-up rules (if lead is warm, send email in 24h)
- Launch in PHASE 2

### 3.3 Voice Interactions [10+ days]
- Integrate voice-to-text + text-to-speech
- Allow phone call simulations
- Launch in future phase

### 3.4 Reintroduce Pinecone [3 days]
- When knowledge base > 500 docs or performance needs optimization
- Replace simple text search with semantic search
- Add to backlog post-launch

---

## Implementation Checklist

### Week 1 Critical Fixes
- [ ] 0.1 Profile 90% completion gate
- [ ] 0.2 Notification triggers wired
- [ ] 0.3 RAG integration complete
- [ ] 0.4 Business type validation
- [ ] 0.5 Pattern validation schema
- [ ] 0.6 CLOSER phase enforcement
- [ ] 0.7 Remove over-engineered components
- [ ] 0.8 Fix learning progress calculation

### Week 2 Features
- [ ] 1.1 Manual takeover API + UI
- [ ] 1.2 Analytics aggregation
- [ ] 1.3 Team member management
- [ ] 1.4 Conversation streaming/handoff

### Week 3 Quality
- [ ] 2.1 Email notifications (if time)
- [ ] 2.2 Objection dashboard (if time)
- [ ] 2.3 Profile validator (if time)
- [ ] 2.4 WebSocket improvements (if time)

### Testing & QA
- [ ] Unit tests for critical paths (scoring, CLOSER, profile extraction)
- [ ] Integration tests (conversation flow end-to-end)
- [ ] Manual testing of full onboarding → go-live → lead chat → manual takeover
- [ ] Load testing (concurrent conversations, lead scoring performance)
- [ ] Security review (auth, multi-tenancy isolation, data protection)

### Deployment
- [ ] Database migrations (new fields, enums, indices)
- [ ] Environment variable setup
- [ ] Production database backup
- [ ] Staging environment testing
- [ ] Canary deployment (small % of traffic)
- [ ] Monitoring and alerting setup
- [ ] Runbook for common issues

---

## Success Criteria for MVP Launch

**Functional**:
- ✅ Onboarding captures business type and creates profile
- ✅ Simulations run with AI personas, patterns extracted, can be approved
- ✅ Lead chat widget fully functional (message → AI response → end analysis → scoring)
- ✅ Profile automatically generated from simulations, editable, approvable at 90% completion
- ✅ CLOSER framework guides conversation progression
- ✅ Scoring produces Cold/Warm/Hot classification
- ✅ Manual takeover works (owner assumes control, AI stops)
- ✅ Dashboard shows conversations, leads, analytics in real-time
- ✅ Notifications alert owner of Hot leads
- ✅ Team members can be added and assigned leads

**Performance**:
- Message response time < 5 seconds (50th percentile)
- Dashboard load < 2 seconds
- Concurrent conversations supported (100+)

**Security**:
- Multi-tenancy properly isolated
- JWTs validated on all protected endpoints
- Rate limiting on public endpoints
- No PII leaks in logs

**Data Quality**:
- Extracted patterns validated (no corrupted JSON)
- Learning progress reflects quality (not just scenario count)
- Lead scores reasonable and explainable

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Over-budget in Phase 1 | Defer Phase 2 quality items; replan if need more than 11.5 days |
| Pattern extraction garbage | Add validation schema + manual review step |
| CLOSER enforcement too strict | Make it optional flag; default to soft guidance |
| Performance issues at scale | Load test with 1000+ concurrent conversations early |
| Team management complexity | Start simple (invite + role); enhance post-launch |
| Manual takeover edge cases | Test thoroughly: mid-message takeover, rapid AI→manual switch |

---

## Definition of Done for Launch

- All Phase 1 critical fixes complete and tested
- Phase 1 features complete and tested
- Manual QA passes on full flow (onboarding → profile approval → lead chat → manual takeover)
- Security review passed
- Staging deployment successful
- Monitoring and alerting in place
- Runbooks documented for common issues
- Team trained on system architecture and common troubleshooting
