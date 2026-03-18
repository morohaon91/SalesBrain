# 12-Week Development Roadmap

## Overview

**Timeline**: 12 weeks from start to MVP launch
**Team Size**: 1-2 developers (you + optional contractor)
**Goal**: Fully functional MVP ready for first 10 beta customers

---

## Phase 1: Foundation (Weeks 1-3)

### Week 1: Project Setup & Core Infrastructure

**Goals:**
- Development environment ready
- Database and auth working locally
- CI/CD pipeline configured

**Tasks:**

#### Day 1-2: Project Initialization
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Set up Git repository
- [ ] Configure ESLint, Prettier, TypeScript strict mode
- [ ] Install core dependencies (see package.json below)
- [ ] Create project structure (folders, base files)

#### Day 3-4: Database Setup
- [ ] Set up local PostgreSQL
- [ ] Create Prisma schema (from DB schema doc)
- [ ] Run initial migration
- [ ] Set up Prisma client
- [ ] Create seed script with test data
- [ ] Implement tenant isolation middleware

#### Day 5-7: Authentication System
- [ ] Implement password hashing (bcrypt)
- [ ] Create JWT generation/verification
- [ ] Build register endpoint
- [ ] Build login endpoint
- [ ] Build token refresh endpoint
- [ ] Create auth middleware
- [ ] Write auth tests (unit + integration)

**Deliverables:**
- ✅ Project runs locally
- ✅ Database migrations work
- ✅ User can register and login
- ✅ Auth tests passing

**Risks:**
- Prisma learning curve → Allocate extra time for docs
- Tenant isolation complexity → Test thoroughly

---

### Week 2: Core API Endpoints

**Goals:**
- Basic CRUD APIs for all main entities
- API client wrapper functional
- Postman collection ready

**Tasks:**

#### Day 1-2: Tenant & Settings API
- [ ] GET /tenant endpoint
- [ ] PUT /tenant/settings endpoint
- [ ] POST /tenant/widget/regenerate-key endpoint
- [ ] Widget API key validation logic
- [ ] Tests for tenant endpoints

#### Day 3-4: Simulation API Foundation
- [ ] POST /simulations/start endpoint
- [ ] POST /simulations/:id/message endpoint
- [ ] POST /simulations/:id/complete endpoint
- [ ] GET /simulations endpoint (list)
- [ ] GET /simulations/:id endpoint (detail)
- [ ] Simulation tests

#### Day 5-7: Conversation & Lead APIs
- [ ] GET /conversations endpoint
- [ ] GET /conversations/:id endpoint
- [ ] PUT /conversations/:id/review endpoint
- [ ] GET /leads endpoint
- [ ] GET /leads/:id endpoint
- [ ] PUT /leads/:id endpoint
- [ ] Basic notification creation
- [ ] Tests for all endpoints

**Deliverables:**
- ✅ All core API endpoints working
- ✅ Postman collection complete
- ✅ Integration tests passing
- ✅ API documentation (OpenAPI)

---

### Week 3: Frontend Foundation

**Goals:**
- UI component library set up
- Basic layouts working
- Authentication flow functional

**Tasks:**

#### Day 1-2: UI Setup
- [ ] Install and configure Tailwind CSS
- [ ] Set up shadcn/ui components
- [ ] Create design tokens (colors, spacing)
- [ ] Build base components (Button, Input, Card, etc.)
- [ ] Create loading and error states

#### Day 3-4: Layouts & Navigation
- [ ] Build auth layout (centered forms)
- [ ] Build dashboard layout (sidebar + header)
- [ ] Create sidebar component with navigation
- [ ] Create header component with user menu
- [ ] Responsive mobile layout

#### Day 5-7: Authentication UI
- [ ] Build login page
- [ ] Build register page
- [ ] Build forgot password page (UI only for MVP)
- [ ] Create AuthContext and useAuth hook
- [ ] Set up TanStack Query
- [ ] Connect auth forms to API
- [ ] Add form validation (React Hook Form + Zod)
- [ ] Test full auth flow in browser

**Deliverables:**
- ✅ Login and register working end-to-end
- ✅ Dashboard layout displays
- ✅ User stays logged in on refresh
- ✅ Protected routes redirect to login

---

## Phase 2: Onboarding System (Weeks 4-6)

### Week 4: AI Integration & Simulation Backend

**Goals:**
- Anthropic Claude integration working
- AI can play client role in simulations
- Conversation state managed correctly

**Tasks:**

#### Day 1-2: AI Client Setup
- [ ] Create Anthropic API wrapper
- [ ] Implement AI configuration (model, tokens, etc.)
- [ ] Build AI client role prompt templates
- [ ] Test AI responses manually (playground)
- [ ] Add error handling and retries

#### Day 3-4: Simulation Logic
- [ ] Create scenario personas (5 types)
- [ ] Implement simulation message handler
- [ ] Build AI response generation
- [ ] Add conversation state management
- [ ] Track token usage and costs
- [ ] Add confidence scoring placeholder

#### Day 5-7: Simulation Completion & Analysis
- [ ] Build simulation completion logic
- [ ] Implement basic pattern extraction (placeholder)
- [ ] Store simulation data to database
- [ ] Calculate quality score
- [ ] Create simulation summary generation
- [ ] Test full simulation flow
- [ ] Write simulation tests

**Deliverables:**
- ✅ Can start simulation via API
- ✅ AI responds in character
- ✅ Simulation can be completed
- ✅ Data saved to database

---

### Week 5: Simulation UI

**Goals:**
- User can complete simulation training
- Chat interface works smoothly
- Simulation results displayed

**Tasks:**

#### Day 1-2: Simulation Chat Component
- [ ] Build chat interface component
- [ ] Create message bubbles (user vs AI)
- [ ] Add typing indicator
- [ ] Implement auto-scroll to bottom
- [ ] Add message input with submit
- [ ] Handle loading states

#### Day 3-4: Scenario Selection & Flow
- [ ] Build scenario selection page
- [ ] Create scenario cards with descriptions
- [ ] Build "start simulation" flow
- [ ] Add simulation progress indicator
- [ ] Implement "complete simulation" button
- [ ] Add confirmation dialogs

#### Day 5-7: Simulation Results & Profile
- [ ] Build simulation summary display
- [ ] Show extracted patterns (basic view)
- [ ] Create profile completion indicator
- [ ] Build simulations list page
- [ ] Add ability to view past simulations
- [ ] Test complete onboarding flow

**Deliverables:**
- ✅ User can start and complete simulation
- ✅ Chat works smoothly
- ✅ Simulation results displayed
- ✅ Profile begins to build

---

### Week 6: Pattern Extraction & Business Profile

**Goals:**
- Real pattern extraction from simulations
- Business profile generated
- Vector embeddings created

**Tasks:**

#### Day 1-3: Pattern Extraction AI
- [ ] Build pattern extraction prompt
- [ ] Implement analysis of simulation transcripts
- [ ] Extract communication style
- [ ] Extract pricing logic
- [ ] Extract qualification criteria
- [ ] Extract objection handling patterns
- [ ] Store extracted patterns in profile

#### Day 4-5: Vector Embeddings
- [ ] Set up Pinecone account
- [ ] Create Pinecone index
- [ ] Implement embedding generation
- [ ] Chunk simulation transcripts
- [ ] Store embeddings with metadata
- [ ] Test semantic search

#### Day 6-7: Profile Dashboard
- [ ] Build business profile view page
- [ ] Display extracted patterns nicely
- [ ] Show completion score
- [ ] Add edit/refine functionality (basic)
- [ ] Test profile generation end-to-end
- [ ] Add profile tests

**Deliverables:**
- ✅ Patterns extracted from simulations
- ✅ Vector embeddings created
- ✅ Profile displayable to user
- ✅ Semantic search working

---

## Phase 3: Lead Qualification Engine (Weeks 7-9)

### Week 7: Widget Backend

**Goals:**
- Widget API endpoints working
- AI qualifies leads using business profile
- Conversation data saved

**Tasks:**

#### Day 1-2: Widget API Foundation
- [ ] POST /widget/conversation/start endpoint
- [ ] POST /widget/conversation/:id/message endpoint
- [ ] POST /widget/conversation/:id/end endpoint
- [ ] Widget API key authentication
- [ ] Rate limiting for widget endpoints
- [ ] CORS configuration

#### Day 3-5: Lead Qualification Logic
- [ ] Build qualification AI prompt
- [ ] Implement profile retrieval for tenant
- [ ] Add semantic search for relevant context
- [ ] Create lead scoring algorithm
- [ ] Implement qualification status detection
- [ ] Extract lead information (budget, timeline, etc.)
- [ ] Build confidence scoring

#### Day 6-7: Conversation Management
- [ ] Save messages to database
- [ ] Track conversation state
- [ ] Generate conversation summaries
- [ ] Create warm lead detection
- [ ] Trigger notifications
- [ ] Test qualification logic
- [ ] Write widget API tests

**Deliverables:**
- ✅ Widget can start conversation
- ✅ AI qualifies leads correctly
- ✅ Conversations saved to DB
- ✅ Warm leads detected

---

### Week 8: Widget Frontend

**Goals:**
- Chat widget UI complete
- Widget embeddable on external sites
- Conversations work end-to-end

**Tasks:**

#### Day 1-3: Widget Chat Interface
- [ ] Build widget button component
- [ ] Create widget window/modal
- [ ] Build chat messages display
- [ ] Add message input
- [ ] Implement typing indicator
- [ ] Add AI badge (transparency)
- [ ] Style widget nicely
- [ ] Make responsive

#### Day 4-5: Widget Embed System
- [ ] Create embed script (embed.js)
- [ ] Make widget loadable via <script> tag
- [ ] Add widget configuration options
- [ ] Test on local HTML file
- [ ] Handle cross-origin issues
- [ ] Optimize loading performance
- [ ] Minify widget code

#### Day 6-7: Widget Integration & Testing
- [ ] Connect widget to API
- [ ] Test conversation flow
- [ ] Handle errors gracefully
- [ ] Add session management
- [ ] Test on different browsers
- [ ] Test mobile responsiveness
- [ ] Create widget demo page

**Deliverables:**
- ✅ Widget loads on external site
- ✅ Conversations work properly
- ✅ UI polished and responsive
- ✅ Error handling solid

---

### Week 9: Dashboard - Conversations & Leads

**Goals:**
- Business owner can view conversations
- Lead management working
- Real-time updates functional

**Tasks:**

#### Day 1-2: Conversations List
- [ ] Build conversations list page
- [ ] Create conversation cards
- [ ] Add filters (status, qualification, date)
- [ ] Implement pagination
- [ ] Add search functionality
- [ ] Show qualification badges

#### Day 3-4: Conversation Detail
- [ ] Build conversation detail page
- [ ] Display full transcript
- [ ] Show conversation metadata
- [ ] Display lead information
- [ ] Add owner notes section
- [ ] Implement review actions

#### Day 5-6: Leads Management
- [ ] Build leads list page
- [ ] Create lead cards with scoring
- [ ] Add filters and search
- [ ] Build lead detail page
- [ ] Show conversation history
- [ ] Add status updates
- [ ] Implement owner notes

#### Day 7: Real-time Updates
- [ ] Set up Socket.io server
- [ ] Implement real-time events
- [ ] Add live conversation monitoring
- [ ] Show new lead notifications
- [ ] Test real-time functionality

**Deliverables:**
- ✅ Owner can review all conversations
- ✅ Lead management functional
- ✅ Real-time updates working
- ✅ UI polished

---

## Phase 4: Dashboard & Polish (Weeks 10-11)

### Week 10: Analytics & Notifications

**Goals:**
- Dashboard shows useful metrics
- Email notifications working
- Settings configurable

**Tasks:**

#### Day 1-3: Analytics Dashboard
- [ ] Build overview stats cards
- [ ] Create conversation trends chart
- [ ] Add lead funnel visualization
- [ ] Implement date range selector
- [ ] Show AI performance metrics
- [ ] Add top questions list
- [ ] Make charts interactive (Recharts)

#### Day 4-5: Notifications System
- [ ] Set up Resend email service
- [ ] Create email templates (React Email)
- [ ] Implement warm lead notification
- [ ] Add daily digest email
- [ ] Build in-app notifications UI
- [ ] Add notification preferences
- [ ] Test email delivery

#### Day 6-7: Settings Pages
- [ ] Build general settings page
- [ ] Create widget configuration UI
- [ ] Add widget preview
- [ ] Build subscription settings page
- [ ] Create account settings
- [ ] Add email preferences
- [ ] Implement save functionality

**Deliverables:**
- ✅ Analytics dashboard functional
- ✅ Email notifications sending
- ✅ Settings fully configurable
- ✅ Widget customizable

---

### Week 11: Polish & UX Improvements

**Goals:**
- UI refined and professional
- Performance optimized
- User experience smooth

**Tasks:**

#### Day 1-2: UI/UX Polish
- [ ] Review all pages for consistency
- [ ] Improve loading states everywhere
- [ ] Add skeleton loaders
- [ ] Improve error messages
- [ ] Add success confirmations
- [ ] Enhance mobile experience
- [ ] Add helpful tooltips
- [ ] Improve empty states

#### Day 3-4: Performance Optimization
- [ ] Optimize API response times
- [ ] Add caching where appropriate
- [ ] Lazy load components
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Add performance monitoring
- [ ] Test with slow network

#### Day 5-7: User Onboarding Flow
- [ ] Create welcome flow
- [ ] Add product tour
- [ ] Build help documentation (basic)
- [ ] Add inline help text
- [ ] Create tutorial videos (optional)
- [ ] Test with fresh eyes
- [ ] Get feedback from beta tester

**Deliverables:**
- ✅ UI consistent and polished
- ✅ Performance optimized
- ✅ Onboarding smooth
- ✅ Documentation available

---

## Phase 5: Testing & Launch (Week 12)

### Week 12: Final Testing & Launch

**Goals:**
- All tests passing
- Security audited
- Ready for beta customers

**Tasks:**

#### Day 1-2: Comprehensive Testing
- [ ] Run full test suite
- [ ] Fix failing tests
- [ ] Perform manual QA
- [ ] Test all user flows
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Load testing (simulate traffic)

#### Day 3: Security Audit
- [ ] Review authentication security
- [ ] Verify tenant isolation
- [ ] Check for SQL injection risks
- [ ] Review XSS prevention
- [ ] Test rate limiting
- [ ] Verify HTTPS configuration
- [ ] Review env variable security

#### Day 4: Production Setup
- [ ] Set up production database
- [ ] Configure production environment
- [ ] Set up monitoring (Sentry)
- [ ] Configure backups
- [ ] Set up domain and SSL
- [ ] Create deployment checklist
- [ ] Document deployment process

#### Day 5: Deploy to Production
- [ ] Run production migrations
- [ ] Deploy to Vercel
- [ ] Verify all services connected
- [ ] Test production environment
- [ ] Monitor for errors
- [ ] Create first admin user
- [ ] Test widget on real site

#### Day 6-7: Beta Launch Prep
- [ ] Create beta signup form
- [ ] Prepare onboarding emails
- [ ] Write launch announcement
- [ ] Create support documentation
- [ ] Set up support email
- [ ] Invite first 5 beta users
- [ ] Monitor and support

**Deliverables:**
- ✅ All tests passing
- ✅ Production deployed
- ✅ Beta users onboarded
- ✅ Monitoring active

---

## Key Dependencies (package.json)

```json
{
  "name": "lead-qualification-mvp",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.7.0",
    "@tanstack/react-query": "^5.14.0",
    "@anthropic-ai/sdk": "^0.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "socket.io": "^4.6.1",
    "socket.io-client": "^4.6.1",
    "ioredis": "^5.3.2",
    "@upstash/redis": "^1.25.0",
    "@upstash/ratelimit": "^1.0.0",
    "@pinecone-database/pinecone": "^1.1.0",
    "resend": "^2.1.0",
    "react-email": "^1.10.0",
    "recharts": "^2.10.3",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.4",
    "@types/react": "^18.2.42",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "prisma": "^5.7.0",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "playwright": "^1.40.1",
    "@playwright/test": "^1.40.1",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0",
    "@faker-js/faker": "^8.3.1"
  }
}
```

---

## Risk Management

### High-Risk Items
1. **AI costs higher than expected**
   - Mitigation: Monitor usage daily, optimize prompts, set usage alerts

2. **Pattern extraction quality low**
   - Mitigation: Allocate extra time, test with real scenarios, iterate on prompts

3. **Widget performance issues**
   - Mitigation: Profile early, optimize bundle size, lazy load

4. **Timeline slippage**
   - Mitigation: Weekly progress reviews, cut non-essential features, parallelize work

---

## Success Criteria

### Technical
- [ ] All core features working
- [ ] Test coverage >70%
- [ ] Page load times <2s
- [ ] Zero critical bugs
- [ ] Deployment automated

### Product
- [ ] 5 beta users onboarded
- [ ] Onboarding completion >60%
- [ ] Widget engagement >25%
- [ ] At least 1 qualified lead detected per user
- [ ] Positive initial feedback

### Business
- [ ] MVP launched on time
- [ ] Infrastructure costs <$200/month
- [ ] Documentation complete
- [ ] Support process defined
- [ ] Next phase planned

---

**Weekly Checkpoints:**
- Monday: Set week goals
- Friday: Demo progress, adjust plan
- End of phase: Retrospective and planning

**Document Status**: Complete - Ready to Execute
**Last Updated**: March 2026
