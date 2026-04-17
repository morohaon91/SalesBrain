# Project Overview - Lead Qualification AI Platform MVP

## Project Name
**Your Business Brain** (Working Title)

## Vision Statement
A multi-tenant SaaS platform that replicates business owners' decision-making logic through AI-powered simulation training, then autonomously qualifies and warms leads 24/7.

---

## MVP Scope Definition

### What's IN the MVP
✅ **Text-only interactions** (onboarding and lead conversations)
✅ Multi-tenant architecture with complete tenant isolation
✅ Simulation-based onboarding (5 scenario types)
✅ AI-powered lead qualification chat widget
✅ Business owner dashboard with analytics
✅ Conversation transcript storage and review
✅ Pattern extraction and profile building
✅ Lead scoring and qualification detection
✅ Real-time conversation monitoring
✅ Email notifications for warm leads
✅ Widget embed code generation
✅ Basic subscription management (3 tiers)

### What's OUT of the MVP (Future Versions)
❌ Voice/speech-to-text onboarding (v2)
❌ WhatsApp integration (v2)
❌ CRM integrations (v2)
❌ Calendar booking integrations (v2)
❌ White-label options (v3)
❌ Custom domain support (v3)
❌ Advanced analytics/ML insights (v2)
❌ Mobile apps (v2)
❌ API access for third parties (v3)

---

## Key Technical Decisions

### Stack
- **Frontend Framework**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes + Node.js
- **Database**: PostgreSQL (primary) + Pinecone (vector DB)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with JWT
- **AI Provider**: Anthropic Claude (Sonnet 4)
- **Real-time**: Socket.io or Pusher (for live monitoring)
- **Email**: Resend or SendGrid
- **Hosting**: Vercel (frontend) + Railway/Render (database)
- **Storage**: Vercel Blob or S3 (conversation transcripts)

### Architecture Pattern
- **Multi-tenant**: Row-level security with `tenantId` on all tables
- **Monorepo**: Single Next.js app with clear module separation
- **API Design**: RESTful with Next.js route handlers
- **State Management**: React Context + TanStack Query for server state
- **Styling**: Tailwind CSS + shadcn/ui components

---

## Open Questions - MVP Decisions

### 1. AI Transparency in Widget
**DECISION FOR MVP**: Option A - Full transparency
- Widget states: "AI assistant trained on [Owner Name]'s expertise"
- Builds trust, legally safer for professional services
- Can be configured per-tenant if needed

### 2. Lead Handoff Process
**DECISION FOR MVP**: Option D - Configurable per business owner
- Default: Email notification with lead summary
- Owner can enable auto-calendar link in settings (future)
- Flexible enough for different business types

### 3. Target Vertical
**DECISION FOR MVP**: Generic for all industries
- Allows broader market validation
- Scenario templates generic enough for any service business
- Can specialize post-launch based on traction

### 4. Trial Structure
**DECISION FOR MVP**: 14-day free trial (no credit card)
- Lowers barrier to entry
- Requires email verification only
- Converts to Basic tier or expires
- Allows testing with real leads

---

## Core User Flows

### Flow 1: Business Owner Onboarding
1. Sign up (email + password)
2. Business info setup (name, industry, website)
3. Simulation training (select scenarios, complete 2-3 simulations)
4. Profile review and refinement
5. Widget installation (copy embed code)
6. Dashboard tour

### Flow 2: Lead Conversation
1. Lead visits business owner's website
2. Clicks chat widget
3. AI engages in conversation
4. AI qualifies lead based on business profile
5. If warm lead: collects contact info, notifies owner
6. If unqualified: politely explains lack of fit
7. Conversation saved to database

### Flow 3: Business Owner Review
1. Receives email notification (warm lead)
2. Logs into dashboard
3. Reviews lead summary and full transcript
4. Takes action (call, email, schedule meeting)
5. Marks lead status

---

## Success Metrics for MVP

### Technical Metrics
- Page load time <2s
- API response time <500ms (95th percentile)
- Widget load time <1s
- AI response latency <3s
- 99.5% uptime
- Zero data leaks between tenants

### Product Metrics
- Onboarding completion rate >60%
- Average simulation duration 20-30 minutes
- Widget engagement rate >25% (visitors who interact)
- Lead qualification accuracy (owner approval) >75%
- Time-to-first-value <24 hours

### Business Metrics
- Trial-to-paid conversion >10%
- Monthly churn <10% (MVP tolerance)
- Customer satisfaction (NPS) >30
- Support tickets <5 per customer per month

---

## Development Timeline (12 Weeks)

### Phase 1: Foundation (Weeks 1-3)
- Project setup, database schema, authentication
- Core multi-tenant infrastructure
- Basic UI components library

### Phase 2: Onboarding System (Weeks 4-6)
- Simulation chat interface
- AI scenario generation
- Pattern extraction logic
- Profile building and storage

### Phase 3: Lead Qualification (Weeks 7-9)
- Chat widget development
- Lead conversation AI logic
- Real-time monitoring
- Notification system

### Phase 4: Dashboard & Polish (Weeks 10-11)
- Analytics dashboard
- Conversation review interface
- Settings and configuration
- Email templates

### Phase 5: Testing & Launch (Week 12)
- End-to-end testing
- Performance optimization
- Security audit
- Soft launch to beta users

---

## Security & Compliance

### Data Protection
- All data encrypted at rest (database encryption)
- TLS 1.3 for data in transit
- Tenant isolation enforced at database level
- Regular automated backups

### Privacy
- GDPR-compliant data handling
- Clear privacy policy
- Data deletion on request
- No third-party data sharing

### Authentication
- Secure password hashing (bcrypt)
- JWT tokens with short expiry
- Rate limiting on auth endpoints
- Optional 2FA (post-MVP)

---

## Cost Estimation (Per Month at 100 Users)

### Infrastructure
- Vercel (Pro): $20
- Database hosting: $25-50
- Pinecone (vector DB): $70
- Blob storage: $10
- Email service: $10
**Subtotal: ~$135**

### AI Costs (Variable)
- Average 50 conversations/user/month
- ~1000 tokens per conversation
- $0.003 per 1k tokens (Claude Sonnet)
- Cost: 100 users × 50 conv × 1k tokens × $0.003 = $15
**Subtotal: ~$15-50** (depending on usage)

### Total Monthly Cost: ~$150-200
**Revenue at 100 users (avg $125/user): $12,500**
**Gross Margin: ~98%**

---

## Risk Mitigation

### Technical Risks
1. **AI hallucination** → Confidence scoring, fallback to human
2. **Tenant data leaks** → Row-level security, automated testing
3. **Widget performance** → Lazy loading, CDN, compression
4. **Scaling issues** → Horizontal scaling architecture from day 1

### Business Risks
1. **Low conversion** → Focus on onboarding UX, value demonstration
2. **High churn** → Quick wins in first week, engagement metrics
3. **AI costs** → Usage limits per tier, efficient prompting
4. **Competition** → Fast execution, unique simulation approach

---

## Next Steps After This Planning

1. ✅ Review and approve all planning documents
2. Set up development environment
3. Initialize Next.js project with chosen stack
4. Create database schema and run migrations
5. Implement authentication system
6. Build first feature: user registration
7. Iterate weekly with demos

---

**Document Status**: Planning Complete - Ready for Development
**Last Updated**: March 2026
**Next Review**: After Phase 1 completion
