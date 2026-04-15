# Audit Prompt 9: Multi-Tenancy & Database Foundation

**Purpose**: Verify the foundational architecture is correct (multi-tenancy, data isolation, database design).

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_09_DATABASE_FOUNDATION.md`

---

# Analysis Request: Multi-Tenancy & Database Foundation

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze the foundational database architecture and ensure multi-tenancy is implemented correctly.

---

## Baseline Requirements

### Multi-Tenant System
- Each registered user receives their own **isolated tenant environment**
- **Full data separation** between tenants
- Scalable infrastructure to support multiple businesses simultaneously

---

## Analysis Questions

### Part 1: Multi-Tenancy Strategy

#### 1.1 Tenancy Model

1. **How is multi-tenancy implemented?**
   - Database per tenant?
   - Shared database, schema per tenant?
   - Shared database, row-level isolation?
   - **Show the strategy used in code**

2. **Is the choice documented?**
   - Pro/cons of chosen approach?
   - Why was this model selected?

#### 1.2 Tenant Identification

1. **How is a tenant identified?**
   - UUID in Tenant table?
   - Slug/subdomain?
   - Both?

2. **How is tenant passed through system?**
   - From JWT claims?
   - From request parameter?
   - From subdomain?
   - From API key?
   - Show the code

3. **Is tenant always validated?**
   - Every request checks tenantId matches user?
   - Or is it assumed?

---

### Part 2: Tenant Isolation

#### 2.1 Data Isolation

1. **How is data isolated per tenant?**
   - Every query includes `WHERE tenantId = $1`?
   - Row-level security (RLS) in database?
   - Application-level filtering?
   - Show an example query

2. **Is isolation enforced consistently?**
   - All queries follow pattern?
   - Any queries missing tenantId filter?
   - Spot check 5 random queries

3. **Is there any risk of data leakage?**
   - Could User A see User B's data?
   - Are joins safe (filter on both tables)?

#### 2.2 Authentication & Tenant Binding

1. **When user signs up, how is tenant created?**
   - User creates account → tenant created automatically?
   - Show the code

2. **Is user bound to single tenant?**
   - One user = one tenant (owner)?
   - One user = one or more tenants (multi-org)?
   - Show the schema

3. **Can user be member of multiple tenants?**
   - Yes / No
   - If yes, how is current tenant selected?

---

### Part 3: Database Schema

#### 3.1 Complete Schema Overview

1. **List all tables in the database:**
   - Show table names and primary purpose
   - Identify core tables (User, Tenant, etc.)
   - Identify feature tables (Conversation, Lead, etc.)

2. **Show the full schema with relationships:**
   ```
   Tenant
     ├─ User (FK to Tenant)
     ├─ BusinessProfile (FK to Tenant)
     ├─ Conversation (FK to Tenant)
     │  └─ ConversationMessage
     ├─ Lead (FK to Tenant)
     ├─ Simulation (FK to Tenant)
     │  └─ SimulationMessage
     ├─ Notification (FK to Tenant)
     └─ [other tables]
   ```

3. **Are all tables properly related to Tenant?**
   - Every table has tenantId?
   - Or some missing?

#### 3.2 Schema Integrity

1. **Are foreign keys defined?**
   - FK constraints?
   - Cascade delete on tenant delete?
   - Show key constraints

2. **Are indices defined?**
   - On tenantId?
   - On frequently queried fields?
   - Show index list

3. **Are there data type inconsistencies?**
   - All UUIDs using same type?
   - Timestamps using consistent type?

---

### Part 4: Tenant Model

#### 4.1 Tenant Fields

1. **What fields exist in Tenant table?**
   - List all fields
   - Show the schema

2. **Required fields for MVP:**
   - businessName: [present/missing]
   - subscriptionTier: [present/missing]
   - widgetApiKey: [present/missing]
   - onboardingComplete: [present/missing]
   - createdAt: [present/missing]

3. **Any tenant-level settings?**
   - Business hours?
   - Webhook URLs?
   - API rate limits?

#### 4.2 Tenant Status

1. **Can tenant be deactivated?**
   - Status field?
   - Soft delete support?

2. **Is tenant deletion handled?**
   - Hard delete (remove all data)?
   - Soft delete (mark deleted)?
   - Cascade delete to child records?

---

### Part 5: User & Authentication

#### 5.1 User Model

1. **User table schema:**
   - Show all fields
   - Identify key relationships

2. **Authentication fields:**
   - passwordHash: [present/missing]
   - passwordHashAlgorithm: [bcrypt/other]
   - lastLoginAt: [present/missing]
   - Show the fields

3. **User status:**
   - Active/Inactive status?
   - Email verified?
   - 2FA setup?

#### 5.2 Authentication Flow

1. **How does user sign up?**
   - Show the sign-up code path
   - Tenant created automatically?
   - Email verification required?

2. **How does user log in?**
   - Email + password?
   - OAuth support?
   - Show the login code

3. **Token management:**
   - JWT? Session cookies? Both?
   - Token expiration?
   - Refresh token mechanism?
   - Show the auth code

---

### Part 6: Data Consistency

#### 6.1 Transactions

1. **Are multi-step operations wrapped in transactions?**
   - Create user + create tenant = atomic?
   - Update conversation + score lead = atomic?
   - Show examples

2. **Is there transaction rollback handling?**
   - If one step fails, is whole operation rolled back?

#### 6.2 Constraints

1. **Are there business logic constraints?**
   - Email uniqueness per tenant or global?
   - Phone number unique per tenant?
   - Lead deduplication logic?
   - Show the constraints

---

### Part 7: Performance & Scalability

#### 7.1 Query Performance

1. **Are queries optimized?**
   - Are indices on tenantId?
   - Are filtered queries selective (avoid table scan)?
   - Spot check 3 heavy queries

2. **Is there query analysis?**
   - EXPLAIN PLAN analyzed?
   - Slow query log reviewed?

#### 7.2 Data Volume Planning

1. **What's the expected data volume?**
   - Conversations per tenant?
   - Messages per conversation?
   - Growth over time?

2. **Are there retention policies?**
   - Old conversations archived?
   - Logs purged?
   - Show the policy

#### 7.3 Caching Strategy

1. **Is caching used?**
   - Tenant config cached?
   - User profile cached?
   - Show the caching code

---

### Part 8: Migration & Versioning

#### 8.1 Database Migrations

1. **Are migrations tracked?**
   - Migration files in version control?
   - Prisma migrations? Flyway? Other?
   - Show the migration folder structure

2. **Can migrations be rolled back?**
   - Down migrations defined?
   - Or only up?

3. **Migration history:**
   - Can you see past migrations?
   - Any manual SQL applied outside migrations?

#### 8.2 Schema Evolution

1. **Can schema be updated safely?**
   - Zero-downtime migrations?
   - Backwards compatibility?
   - Data migration strategy (if field added)?

---

### Part 9: Security & Data Protection

#### 9.1 PII Protection

1. **How is sensitive data protected?**
   - Passwords hashed? [yes, bcrypt/other]
   - PII encrypted? [yes/no]
   - API keys hashed? [yes/no]

2. **Data exposure risks:**
   - Could passwords be exposed in logs?
   - Are queries sanitized against SQL injection?
   - Show parameterized query examples

#### 9.2 Backup & Recovery

1. **Is there a backup strategy?**
   - Daily backups?
   - Point-in-time recovery?
   - Where are backups stored?

2. **Can tenant data be recovered?**
   - If data deleted, can owner restore?
   - Soft delete + restore?

---

### Part 10: Gaps vs. Baseline

Analyze:

1. **Is multi-tenancy correctly implemented?**
   - Isolation verified? [yes/no]
   - No data leakage risks? [yes/no]

2. **Is database schema sound?**
   - All tables related to Tenant? [yes/no]
   - Proper constraints? [yes/no]
   - Scalable? [yes/no]

3. **Is authentication secure?**
   - Passwords hashed? [yes/no]
   - Sessions managed? [yes/no]

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- Multi-tenancy model: [database / schema / row-level]
- Data isolation: [properly enforced / at risk / missing]
- Schema maturity: [well-designed / needs work / broken]

### 2. Multi-Tenancy Strategy
- Model chosen: [database per tenant / shared DB with schema isolation / shared DB with row filtering / other]
- Tenant identification: [UUID / slug / subdomain / API key]
- Validation: [enforced in every request / assumed / inconsistent]
- Risks identified: [list any data leakage risks]

### 3. Data Isolation Verification
- Example isolation query:
  ```sql
  SELECT * FROM Conversation WHERE tenantId = $1 AND id = $2
  ```
- Isolation pattern: [consistent / some queries missing filter / at risk]
- Spot check results: [3-5 queries reviewed, all safe / some at risk]

### 4. Complete Database Schema
```
[Full schema overview with all tables and relationships]

Tenant (root)
  ├─ User
  ├─ BusinessProfile
  ├─ Conversation
  │  └─ ConversationMessage
  ├─ Lead
  ├─ Notification
  ├─ Simulation
  │  └─ SimulationMessage
  ├─ [other tables...]
```

### 5. Tenant Model Fields
- businessName: [String, required]
- subscriptionTier: [Enum, required]
- widgetApiKey: [String, unique]
- onboardingComplete: [Boolean]
- [other fields...]

### 6. Authentication & User Model
```
User:
  id: UUID
  tenantId: UUID (FK)
  email: String (unique per tenant? global?)
  passwordHash: String (bcrypt?)
  role: Enum (OWNER/ADMIN/VIEWER)
  lastLoginAt: DateTime
  [other fields]
```
- Auth method: [JWT / Session / other]
- Token expiration: [X hours]
- Refresh mechanism: [yes/no]

### 7. Foreign Keys & Constraints
```
Proper constraints:
  ✓ User.tenantId → Tenant.id (ON DELETE CASCADE)
  ✓ Conversation.tenantId → Tenant.id (ON DELETE CASCADE)
  [other constraints...]

Missing constraints:
  - [List any missing constraints]
```

### 8. Indices
- tenantId indices: [present on all tables / missing on some]
- Query performance: [optimized / not analyzed]
- Indices present: [list key indices]

### 9. Migrations & Versioning
- Migration tool: [Prisma / Flyway / custom / none]
- Migration files location: [prisma/migrations / sql / other]
- Down migrations: [yes/no]
- Latest migration: [describe last change]

### 10. Security Review
- Passwords hashed: [yes, bcrypt]
- PII encrypted: [yes/no]
- SQL injection risk: [none (parameterized) / potential]
- Data leakage risks: [none / list risks]

### 11. Backup & Recovery
- Backup strategy: [daily / hourly / manual / none]
- Point-in-time recovery: [yes/no]
- Restore capability: [yes/no]

### 12. Critical Gaps & Recommendations

**Architecture Issues**:
- [ ] Multi-tenancy not properly isolated
- [ ] Tables missing tenantId foreign key
- [ ] Data isolation inconsistent

**Schema Issues**:
- [ ] Missing migrations
- [ ] No backup strategy
- [ ] Scaling concerns

**Security Issues**:
- [ ] Passwords not hashed
- [ ] SQL injection risk
- [ ] Data leakage potential

**Needed for MVP**:
1. Verified multi-tenant isolation
2. Proper database schema with constraints
3. Secure authentication

**Effort to Fix**:
- Isolation issues: X days
- Schema refactoring: Y days
- Migration setup: Z days

---

## Success Criteria

This audit is complete when you can:
1. Confirm multi-tenancy is properly isolated (no data leakage risk)
2. Show complete database schema (all tables, relationships, constraints)
3. Verify authentication is secure
4. Identify any architectural issues blocking scalability
