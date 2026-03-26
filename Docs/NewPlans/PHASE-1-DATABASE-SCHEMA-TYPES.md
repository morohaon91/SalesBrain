# PHASE 1: DATABASE SCHEMA & TYPES SPECIFICATION

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 1 of 8  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Database schema changes and TypeScript type definitions for refactored system  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This phase adds all necessary database fields and TypeScript types to support:
- Business facts capture (years of experience, certifications, etc.)
- Verbatim phrase storage (ownerVoiceExamples)
- Profile approval workflow
- Enhanced simulation metadata
- Adaptive scenario tracking

---

## 🗄️ DATABASE SCHEMA CHANGES

### 1.1 BusinessProfile Model - New Fields

**File**: `prisma/schema.prisma`

**Add to BusinessProfile model:**

```prisma
model BusinessProfile {
  // ... existing fields ...

  // NEW: Business Facts Fields (manually entered + auto-extracted)
  yearsExperience       Int?
  serviceOfferings      String[]  @default([])  // e.g., ["Kitchen Remodels", "Bathroom Renovations"]
  specializations       String[]  @default([])  // e.g., ["Premium Materials", "Custom Cabinetry"]
  certifications        String[]  @default([])  // e.g., ["Licensed GC - California", "Bonded & Insured"]
  serviceArea           String?                  // e.g., "San Francisco Bay Area"
  teamSize              String?                  // e.g., "Solo", "2-5", "6-10", "10+"

  // NEW: Verbatim Voice Examples
  ownerVoiceExamples    Json?     @db.JsonB     // Array of { phrase: string, context: string, simulationId: string }

  // NEW: Profile Approval & Go-Live
  profileApprovalStatus ProfileApprovalStatus @default(PENDING)
  approvedAt            DateTime?
  goLiveAt              DateTime?

  // NEW: Scenario Tracking
  completedScenarios    String[]  @default([])  // Array of scenario IDs completed
  suggestedNextScenario String?                 // Next recommended scenario

  // ... existing fields continue ...
}
```

**Add new enum:**

```prisma
enum ProfileApprovalStatus {
  PENDING       // Initial state, not ready for approval
  READY         // 70%+ complete, ready for owner review
  APPROVED      // Owner approved, lead conversations can start
  LIVE          // Currently active and handling leads
  PAUSED        // Owner temporarily paused lead conversations
}
```

---

### 1.2 Simulation Model - New Fields

**Add to Simulation model:**

```prisma
model Simulation {
  // ... existing fields ...

  // NEW: Persona tracking
  personaDetails        Json?     @db.JsonB     // Randomized persona used (name, age, budget, etc.)

  // NEW: Live feedback tracking
  demonstratedPatterns  String[]  @default([])  // Patterns shown during simulation
  liveScore             Int       @default(0)   // Real-time quality score

  // NEW: Post-simulation review
  ownerReviewedAt       DateTime?
  ownerApprovalStatus   SimulationApprovalStatus @default(PENDING)

  // ... existing fields continue ...
}
```

**Add new enum:**

```prisma
enum SimulationApprovalStatus {
  PENDING        // Simulation completed, extraction pending
  EXTRACTED      // Patterns extracted, awaiting owner review
  APPROVED       // Owner approved all patterns
  PARTIAL        // Owner approved some, rejected some
  REJECTED       // Owner rejected extraction
}
```

---

### 1.3 Tenant Model - New Fields

**Add to Tenant model:**

```prisma
model Tenant {
  // ... existing fields ...

  // NEW: Onboarding state tracking
  onboardingComplete    Boolean   @default(false)
  onboardingStep        String?                  // Current step: "questionnaire", "simulations", "approval"

  // NEW: Lead conversation activation
  leadConversationsActive Boolean @default(false)
  activatedAt           DateTime?

  // ... existing fields continue ...
}
```

---

## 📦 TYPESCRIPT TYPE DEFINITIONS

### 2.1 Business Profile Types Extension

**File**: `lib/types/business-profile.ts`

**Add to existing types:**

```typescript
// NEW: Business Facts Types
export interface BusinessFacts {
  yearsExperience: number | null;
  serviceOfferings: string[];
  specializations: string[];
  certifications: string[];
  serviceArea: string | null;
  teamSize: 'Solo' | '2-5' | '6-10' | '10+' | null;
}

// NEW: Owner Voice Example
export interface OwnerVoiceExample {
  id: string;                    // Unique ID for this phrase
  phrase: string;                // Exact verbatim phrase owner said
  context: string;               // When they said it (e.g., "When discussing budget")
  simulationId: string;          // Which simulation it came from
  frequency: number;             // How many times similar phrases appeared
  timestamp: string;             // When it was captured
}

// NEW: Profile Approval
export interface ProfileApproval {
  status: 'PENDING' | 'READY' | 'APPROVED' | 'LIVE' | 'PAUSED';
  approvedAt: string | null;
  goLiveAt: string | null;
  readyChecklist: {
    communicationStyle: boolean;
    pricingLogic: boolean;
    qualificationCriteria: boolean;
    objectionHandling: boolean;
    decisionMaking: boolean;
    businessFacts: boolean;
    minimumSimulations: boolean;  // At least 3 simulations
  };
}

// EXTEND: Existing ExtractedPatterns interface
export interface ExtractedPatterns {
  // ... existing fields ...

  // ADD: Business facts (auto-extracted from simulations)
  businessFacts?: {
    mentionedExperience?: {
      years: number;
      confidence: 'high' | 'medium' | 'low';
      context: string;  // e.g., "Owner mentioned '15 years in business'"
    };
    mentionedServices?: string[];
    mentionedSpecializations?: string[];
    mentionedCertifications?: string[];
    mentionedServiceArea?: string;
    mentionedTeamSize?: string;
  };

  // ADD: Verbatim voice examples
  voiceExamples?: OwnerVoiceExample[];
}

// EXTEND: Existing CommunicationStyle interface
export interface CommunicationStyle {
  tone: string;
  style: string;
  keyPhrases: string[];           // EXISTING: Intent-based phrases
  verbatimPhrases?: string[];     // NEW: Exact quotes
  formality: number;
  responseLength: string;
  emojiUsage: boolean;
  confidence: {
    tone: 'high' | 'medium' | 'low' | 'not_demonstrated';
    style: 'high' | 'medium' | 'low' | 'not_demonstrated';
    overall: 'high' | 'medium' | 'low';
  };
}
```

---

### 2.2 Simulation Types Extension

**File**: `lib/types/simulation.ts`

**Add new types:**

```typescript
// NEW: Randomized Persona
export interface SimulationPersona {
  name: string;
  age: number;
  budget: {
    min: number;
    max: number;
    flexibility: 'rigid' | 'moderate' | 'flexible';
  };
  timeline: string;               // e.g., "Need to start in 2 weeks"
  painPoints: string[];
  personality: string[];          // e.g., ["price-focused", "detail-oriented"]
  openingLine: string;
  backstory: string;
}

// NEW: Live Feedback Item
export interface LiveFeedbackItem {
  id: string;
  timestamp: string;
  type: 'positive' | 'suggestion' | 'warning';
  icon: string;                   // e.g., "🎯", "💡", "⚠️"
  message: string;
  patternDemonstrated?: string;   // e.g., "pricing_flexibility"
}

// NEW: Simulation Quality Score (real-time)
export interface SimulationQualityScore {
  overall: number;                // 0-100
  messageCount: number;
  questionsAnswered: number;
  questionsTotal: number;
  demonstratedPatterns: string[];
  missingPatterns: string[];
  conversationBalance: number;    // 0.0-2.0 (owner/customer message ratio)
  hasResolution: boolean;
}

// EXTEND: Existing Simulation type
export interface Simulation {
  // ... existing fields ...
  personaDetails: SimulationPersona | null;
  liveScore: number;
  demonstratedPatterns: string[];
  ownerReviewedAt: string | null;
  ownerApprovalStatus: 'PENDING' | 'EXTRACTED' | 'APPROVED' | 'PARTIAL' | 'REJECTED';
}
```

---

### 2.3 Questionnaire Types

**File**: `lib/types/onboarding.ts` (NEW)

```typescript
// Initial questionnaire data structure
export interface QuestionnaireData {
  // Basic Business Info
  industry: string;               // One of 10 industries
  serviceDescription: string;
  targetClientType: string;
  typicalBudgetRange: string;
  commonClientQuestions: string[];

  // Business Facts
  yearsExperience: number | null;
  certifications: string[];
  serviceArea: string;
  teamSize: 'Solo' | '2-5' | '6-10' | '10+';
}

export interface QuestionnaireValidation {
  isValid: boolean;
  errors: {
    field: keyof QuestionnaireData;
    message: string;
  }[];
}

// Questionnaire submission response
export interface QuestionnaireResponse {
  success: boolean;
  profileId: string;
  completionPercentage: number;  // Should be 20% after questionnaire
  nextStep: 'simulations';
  suggestedScenario: string;     // First recommended scenario
}
```

---

### 2.4 Scenario Types

**File**: `lib/types/scenarios.ts` (NEW)

```typescript
// Industry-specific scenario
export interface IndustryScenario {
  id: string;                     // e.g., "legal_urgent_free_consult"
  industry: string;               // One of 10 industries
  name: string;                   // e.g., "Urgent Case - Wants Free Consultation"
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: string;      // e.g., "5-10 minutes"
  teaser: string;                 // Shown before start
  focusAreas: string[];           // What patterns this tests
  personaTemplate: {              // Template for randomization
    budgetRange: { min: number; max: number };
    ageRange: { min: number; max: number };
    personalityOptions: string[];
    painPointOptions: string[];
    timelineOptions: string[];
  };
}

// Scenario suggestion
export interface ScenarioSuggestion {
  scenario: IndustryScenario;
  reason: string;                 // Why this is suggested
  priority: 'high' | 'medium' | 'low';
  fillsGaps: string[];            // Which missing patterns it addresses
}
```

---

## 🔄 MIGRATION SCRIPT

**File**: `prisma/migrations/YYYYMMDDHHMMSS_refactor_phase_1/migration.sql`

```sql
-- Add new fields to BusinessProfile
ALTER TABLE "BusinessProfile" 
  ADD COLUMN "yearsExperience" INTEGER,
  ADD COLUMN "serviceOfferings" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "serviceArea" TEXT,
  ADD COLUMN "teamSize" TEXT,
  ADD COLUMN "ownerVoiceExamples" JSONB,
  ADD COLUMN "profileApprovalStatus" TEXT DEFAULT 'PENDING',
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "goLiveAt" TIMESTAMP(3),
  ADD COLUMN "completedScenarios" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "suggestedNextScenario" TEXT;

-- Add new enum for ProfileApprovalStatus
CREATE TYPE "ProfileApprovalStatus" AS ENUM ('PENDING', 'READY', 'APPROVED', 'LIVE', 'PAUSED');

-- Update profileApprovalStatus to use enum
ALTER TABLE "BusinessProfile" 
  ALTER COLUMN "profileApprovalStatus" TYPE "ProfileApprovalStatus" 
  USING "profileApprovalStatus"::text::"ProfileApprovalStatus";

-- Add new fields to Simulation
ALTER TABLE "Simulation"
  ADD COLUMN "personaDetails" JSONB,
  ADD COLUMN "demonstratedPatterns" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "liveScore" INTEGER DEFAULT 0,
  ADD COLUMN "ownerReviewedAt" TIMESTAMP(3),
  ADD COLUMN "ownerApprovalStatus" TEXT DEFAULT 'PENDING';

-- Add new enum for SimulationApprovalStatus
CREATE TYPE "SimulationApprovalStatus" AS ENUM ('PENDING', 'EXTRACTED', 'APPROVED', 'PARTIAL', 'REJECTED');

-- Update ownerApprovalStatus to use enum
ALTER TABLE "Simulation"
  ALTER COLUMN "ownerApprovalStatus" TYPE "SimulationApprovalStatus"
  USING "ownerApprovalStatus"::text::"SimulationApprovalStatus";

-- Add new fields to Tenant
ALTER TABLE "Tenant"
  ADD COLUMN "onboardingComplete" BOOLEAN DEFAULT false,
  ADD COLUMN "onboardingStep" TEXT,
  ADD COLUMN "leadConversationsActive" BOOLEAN DEFAULT false,
  ADD COLUMN "activatedAt" TIMESTAMP(3);

-- Create indexes for performance
CREATE INDEX "BusinessProfile_profileApprovalStatus_idx" ON "BusinessProfile"("profileApprovalStatus");
CREATE INDEX "Simulation_ownerApprovalStatus_idx" ON "Simulation"("ownerApprovalStatus");
CREATE INDEX "Tenant_onboardingComplete_idx" ON "Tenant"("onboardingComplete");
CREATE INDEX "Tenant_leadConversationsActive_idx" ON "Tenant"("leadConversationsActive");
```

---

## ✅ VALIDATION & SCHEMA FILES

### 4.1 Zod Validation Schemas

**File**: `lib/validation/business-profile-schemas.ts`

**Add new schemas:**

```typescript
import { z } from 'zod';

// Business Facts Schema
export const BusinessFactsSchema = z.object({
  yearsExperience: z.number().int().min(0).max(100).nullable(),
  serviceOfferings: z.array(z.string().min(1).max(100)),
  specializations: z.array(z.string().min(1).max(100)),
  certifications: z.array(z.string().min(1).max(200)),
  serviceArea: z.string().min(1).max(200).nullable(),
  teamSize: z.enum(['Solo', '2-5', '6-10', '10+']).nullable(),
});

// Owner Voice Example Schema
export const OwnerVoiceExampleSchema = z.object({
  id: z.string().uuid(),
  phrase: z.string().min(5).max(500),
  context: z.string().min(5).max(200),
  simulationId: z.string().uuid(),
  frequency: z.number().int().min(1),
  timestamp: z.string().datetime(),
});

// Profile Approval Schema
export const ProfileApprovalSchema = z.object({
  status: z.enum(['PENDING', 'READY', 'APPROVED', 'LIVE', 'PAUSED']),
  approvedAt: z.string().datetime().nullable(),
  goLiveAt: z.string().datetime().nullable(),
  readyChecklist: z.object({
    communicationStyle: z.boolean(),
    pricingLogic: z.boolean(),
    qualificationCriteria: z.boolean(),
    objectionHandling: z.boolean(),
    decisionMaking: z.boolean(),
    businessFacts: z.boolean(),
    minimumSimulations: z.boolean(),
  }),
});

// Questionnaire Data Schema
export const QuestionnaireDataSchema = z.object({
  industry: z.string().min(1),
  serviceDescription: z.string().min(10).max(1000),
  targetClientType: z.string().min(5).max(200),
  typicalBudgetRange: z.string().min(3).max(100),
  commonClientQuestions: z.array(z.string().min(5).max(300)).min(1).max(10),
  yearsExperience: z.number().int().min(0).max(100).nullable(),
  certifications: z.array(z.string().min(3).max(200)).max(20),
  serviceArea: z.string().min(3).max(200),
  teamSize: z.enum(['Solo', '2-5', '6-10', '10+']),
});

// Simulation Persona Schema
export const SimulationPersonaSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(100),
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    flexibility: z.enum(['rigid', 'moderate', 'flexible']),
  }),
  timeline: z.string().min(5).max(200),
  painPoints: z.array(z.string().min(5).max(200)).min(1).max(10),
  personality: z.array(z.string().min(3).max(50)).min(1).max(10),
  openingLine: z.string().min(10).max(500),
  backstory: z.string().min(20).max(1000),
});
```

---

## 🧪 TESTING REQUIREMENTS

### 5.1 Schema Validation Tests

**File**: `tests/schema/business-profile.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { BusinessFactsSchema, OwnerVoiceExampleSchema } from '@/lib/validation/business-profile-schemas';

describe('BusinessFacts Schema', () => {
  it('should validate correct business facts', () => {
    const validData = {
      yearsExperience: 15,
      serviceOfferings: ['Kitchen Remodels', 'Bathroom Renovations'],
      specializations: ['Premium Materials'],
      certifications: ['Licensed GC - California'],
      serviceArea: 'San Francisco Bay Area',
      teamSize: '2-5' as const,
    };
    expect(BusinessFactsSchema.parse(validData)).toEqual(validData);
  });

  it('should reject invalid years experience', () => {
    const invalidData = {
      yearsExperience: -5,
      serviceOfferings: [],
      specializations: [],
      certifications: [],
      serviceArea: null,
      teamSize: null,
    };
    expect(() => BusinessFactsSchema.parse(invalidData)).toThrow();
  });

  it('should allow null values for optional fields', () => {
    const minimalData = {
      yearsExperience: null,
      serviceOfferings: [],
      specializations: [],
      certifications: [],
      serviceArea: null,
      teamSize: null,
    };
    expect(BusinessFactsSchema.parse(minimalData)).toEqual(minimalData);
  });
});

describe('OwnerVoiceExample Schema', () => {
  it('should validate correct voice example', () => {
    const validExample = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      phrase: 'I always focus on transparency, no surprises',
      context: 'When discussing pricing',
      simulationId: '123e4567-e89b-12d3-a456-426614174001',
      frequency: 3,
      timestamp: '2026-03-26T10:00:00.000Z',
    };
    expect(OwnerVoiceExampleSchema.parse(validExample)).toEqual(validExample);
  });

  it('should reject phrase that is too short', () => {
    const invalidExample = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      phrase: 'Hi',
      context: 'Greeting',
      simulationId: '123e4567-e89b-12d3-a456-426614174001',
      frequency: 1,
      timestamp: '2026-03-26T10:00:00.000Z',
    };
    expect(() => OwnerVoiceExampleSchema.parse(invalidExample)).toThrow();
  });
});
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1 Tasks

- [ ] **Update Prisma Schema**
  - [ ] Add new fields to BusinessProfile model
  - [ ] Add new fields to Simulation model
  - [ ] Add new fields to Tenant model
  - [ ] Add ProfileApprovalStatus enum
  - [ ] Add SimulationApprovalStatus enum
  - [ ] Add indexes for performance

- [ ] **Run Migration**
  - [ ] Generate migration: `npx prisma migrate dev --name refactor_phase_1`
  - [ ] Verify migration SQL
  - [ ] Run migration on dev database
  - [ ] Verify all fields created correctly

- [ ] **Update TypeScript Types**
  - [ ] Extend `lib/types/business-profile.ts`
  - [ ] Extend `lib/types/simulation.ts`
  - [ ] Create `lib/types/onboarding.ts`
  - [ ] Create `lib/types/scenarios.ts`
  - [ ] Update Prisma client types: `npx prisma generate`

- [ ] **Create Validation Schemas**
  - [ ] Create `lib/validation/business-profile-schemas.ts`
  - [ ] Add BusinessFactsSchema
  - [ ] Add OwnerVoiceExampleSchema
  - [ ] Add ProfileApprovalSchema
  - [ ] Add QuestionnaireDataSchema
  - [ ] Add SimulationPersonaSchema

- [ ] **Write Tests**
  - [ ] Create schema validation tests
  - [ ] Test all new Zod schemas
  - [ ] Verify enum constraints
  - [ ] Test nullable field handling

- [ ] **Update Prisma Client Usage**
  - [ ] Regenerate Prisma client
  - [ ] Fix TypeScript errors in existing code
  - [ ] Update API routes using BusinessProfile
  - [ ] Update API routes using Simulation
  - [ ] Update API routes using Tenant

---

## 🚀 DEPLOYMENT NOTES

### Database Backup

Before running migration:
```bash
# Backup current database
pg_dump -U postgres -d salesbrain_dev > backup_pre_phase1.sql

# Run migration
npx prisma migrate dev --name refactor_phase_1

# Verify migration succeeded
npx prisma studio
```

### Rollback Plan

If migration fails:
```bash
# Restore from backup
psql -U postgres -d salesbrain_dev < backup_pre_phase1.sql

# OR reset database and re-run previous migrations
npx prisma migrate reset
```

### Verification Steps

After migration:
1. Check all new columns exist: `SELECT column_name FROM information_schema.columns WHERE table_name = 'BusinessProfile';`
2. Verify enums created: `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'ProfileApprovalStatus'::regtype;`
3. Test Prisma queries with new fields
4. Verify TypeScript compilation: `npm run build`

---

## 📚 REFERENCES

- Current database schema: `prisma/schema.prisma`
- Current type definitions: `lib/types/business-profile.ts`
- Existing validation: `lib/validation/pattern-schemas.ts`
- Migration history: `prisma/migrations/`

---

## ✅ COMPLETION CRITERIA

Phase 1 is complete when:
- ✅ All new database fields added and migrated
- ✅ All TypeScript types defined and exported
- ✅ All Zod validation schemas created
- ✅ No TypeScript compilation errors
- ✅ All tests passing
- ✅ Database queries work with new fields
- ✅ Prisma Studio shows new fields correctly

---

**Status**: Ready for Implementation  
**Estimated Time**: 2-3 hours  
**Dependencies**: None (foundation phase)  
**Next Phase**: Phase 2 - Industry Templates & Scenarios
