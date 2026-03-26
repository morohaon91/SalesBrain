# PHASE 6: PROFILE COMPLETION & FORM-BASED EDITING

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 6 of 8  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Depth-based completion calculation and simple form editing (no JSON)  
**Dependencies**: Phase 1-5  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This phase implements:
1. **Depth-based profile completion** (20%-100%)
2. **Form-based profile editing** (no JSON editing)
3. **Profile readiness checking** (for 70% gate)
4. **Visual completion progress**

---

## 🎯 COMPLETION CALCULATION LOGIC

### Depth-Based Formula

| Section | Weight | Sub-Requirements |
|---------|--------|------------------|
| **Questionnaire Complete** | 20% | All 9 fields filled |
| **Communication Style** | 15% | Tone (3%) + Style (3%) + 3+ Key Phrases (4%) + 3+ Verbatim (5%) |
| **Pricing Logic** | 15% | MinBudget (5%) + Flexibility (5%) + Deal-breakers (5%) |
| **Qualification Criteria** | 15% | 2+ Must-haves (5%) + 2+ Green Flags (5%) + 2+ Deal-breakers (5%) |
| **Objection Handling** | 15% | Price (4%) + Timeline (4%) + Quality (4%) + Scope (3%) |
| **Decision Making** | 10% | When to Say Yes (5%) + Warning Signs (5%) |
| **Business Facts** | 10% | Years Experience (3%) + Services (4%) + Certifications (3%) |

**Total: 100%**

### Calculation Rules

- Each sub-requirement is binary: 0% or full value
- Section scores are sum of sub-requirements
- Total = sum of all sections
- Minimum 20% from questionnaire
- Maximum 100% with all requirements met

---

## 📦 FILE STRUCTURE

```
lib/utils/
  ├── profile-completion.ts           (REFACTOR - depth-based logic)
  └── profile-readiness.ts            (NEW - 70% gate checker)

app/(dashboard)/profile/
  ├── page.tsx                        (REFACTOR - tabs + progress)
  ├── edit/
  │   └── page.tsx                    (NEW - form-based editing)

components/profile/
  ├── ProfileProgress.tsx             (NEW - visual progress)
  ├── CompletionChecklist.tsx         (NEW - what's missing)
  ├── PatternEditForm.tsx             (NEW - form editing)
  ├── CommunicationStyleForm.tsx      (NEW)
  ├── PricingLogicForm.tsx            (NEW)
  ├── QualificationForm.tsx           (NEW)
  ├── ObjectionHandlingForm.tsx       (NEW)
  └── DecisionMakingForm.tsx          (NEW)
```

---

## 📄 DETAILED IMPLEMENTATION

### 6.1 Profile Completion Calculator

**File**: `lib/utils/profile-completion.ts` (REFACTOR)

```typescript
import { BusinessProfile, ExtractedPatterns } from '@/lib/types/business-profile';

interface CompletionBreakdown {
  total: number;
  questionnaire: number;
  communicationStyle: number;
  pricingLogic: number;
  qualificationCriteria: number;
  objectionHandling: number;
  decisionMaking: number;
  businessFacts: number;
  details: {
    [key: string]: {
      score: number;
      max: number;
      missing: string[];
    };
  };
}

/**
 * Calculate profile completion percentage (depth-based)
 */
export function calculateProfileCompletion(profile: BusinessProfile): CompletionBreakdown {
  const patterns = profile.extractedPatterns as ExtractedPatterns | null;
  
  const breakdown: CompletionBreakdown = {
    total: 0,
    questionnaire: 0,
    communicationStyle: 0,
    pricingLogic: 0,
    qualificationCriteria: 0,
    objectionHandling: 0,
    decisionMaking: 0,
    businessFacts: 0,
    details: {}
  };

  // 1. Questionnaire (20%)
  breakdown.questionnaire = calculateQuestionnaireCompletion(profile);

  // 2. Communication Style (15%)
  breakdown.communicationStyle = calculateCommunicationStyleCompletion(patterns);

  // 3. Pricing Logic (15%)
  breakdown.pricingLogic = calculatePricingLogicCompletion(patterns);

  // 4. Qualification Criteria (15%)
  breakdown.qualificationCriteria = calculateQualificationCompletion(patterns);

  // 5. Objection Handling (15%)
  breakdown.objectionHandling = calculateObjectionHandlingCompletion(patterns);

  // 6. Decision Making (10%)
  breakdown.decisionMaking = calculateDecisionMakingCompletion(patterns);

  // 7. Business Facts (10%)
  breakdown.businessFacts = calculateBusinessFactsCompletion(profile, patterns);

  // Total
  breakdown.total = 
    breakdown.questionnaire +
    breakdown.communicationStyle +
    breakdown.pricingLogic +
    breakdown.qualificationCriteria +
    breakdown.objectionHandling +
    breakdown.decisionMaking +
    breakdown.businessFacts;

  return breakdown;
}

/**
 * Questionnaire Completion (20%)
 */
function calculateQuestionnaireCompletion(profile: BusinessProfile): number {
  const missing: string[] = [];
  let score = 0;

  // All 9 fields must be filled
  if (profile.industry) score += 2.2;
  else missing.push('Industry');

  if (profile.serviceDescription) score += 2.2;
  else missing.push('Service Description');

  if (profile.targetClientType) score += 2.2;
  else missing.push('Target Client Type');

  if (profile.typicalBudgetRange) score += 2.2;
  else missing.push('Typical Budget Range');

  if (profile.commonClientQuestions?.length > 0) score += 2.2;
  else missing.push('Common Client Questions');

  if (profile.yearsExperience !== null) score += 2.2;
  else missing.push('Years of Experience');

  if (profile.serviceArea) score += 2.2;
  else missing.push('Service Area');

  if (profile.teamSize) score += 2.2;
  else missing.push('Team Size');

  // Certifications are optional, slight bonus
  if (profile.certifications?.length > 0) score += 2.2;
  else missing.push('Certifications (optional)');

  return Math.min(score, 20);
}

/**
 * Communication Style Completion (15%)
 */
function calculateCommunicationStyleCompletion(patterns: ExtractedPatterns | null): number {
  if (!patterns?.communicationStyle) return 0;

  const missing: string[] = [];
  let score = 0;

  const style = patterns.communicationStyle;

  // Tone (3%)
  if (style.tone && style.confidence.tone !== 'not_demonstrated') {
    score += 3;
  } else {
    missing.push('Tone');
  }

  // Style (3%)
  if (style.style && style.confidence.style !== 'not_demonstrated') {
    score += 3;
  } else {
    missing.push('Style');
  }

  // Key Phrases - Intent (4%)
  if (style.keyPhrases && style.keyPhrases.length >= 3) {
    score += 4;
  } else {
    missing.push('Key Phrases (need 3+)');
  }

  // Verbatim Phrases (5%)
  if (patterns.voiceExamples && patterns.voiceExamples.length >= 3) {
    score += 5;
  } else {
    missing.push('Verbatim Phrases (need 3+)');
  }

  return score;
}

/**
 * Pricing Logic Completion (15%)
 */
function calculatePricingLogicCompletion(patterns: ExtractedPatterns | null): number {
  if (!patterns?.pricingLogic) return 0;

  const missing: string[] = [];
  let score = 0;

  const pricing = patterns.pricingLogic;

  // Min Budget (5%)
  if (pricing.minBudget !== null && pricing.confidence.minBudget !== 'not_demonstrated') {
    score += 5;
  } else {
    missing.push('Minimum Budget');
  }

  // Flexibility Factors (5%)
  if (pricing.flexibilityFactors && pricing.flexibilityFactors.length >= 2) {
    score += 5;
  } else {
    missing.push('Flexibility Factors (need 2+)');
  }

  // Deal-breakers (5%)
  if (pricing.dealBreakers && pricing.dealBreakers.length >= 1) {
    score += 5;
  } else {
    missing.push('Pricing Deal-breakers (need 1+)');
  }

  return score;
}

/**
 * Qualification Criteria Completion (15%)
 */
function calculateQualificationCompletion(patterns: ExtractedPatterns | null): number {
  if (!patterns?.qualificationCriteria) return 0;

  const missing: string[] = [];
  let score = 0;

  const qual = patterns.qualificationCriteria;

  // Must-haves (5%)
  if (qual.mustHaves && qual.mustHaves.length >= 2) {
    score += 5;
  } else {
    missing.push('Must-haves (need 2+)');
  }

  // Green Flags (5%)
  if (qual.greenFlags && qual.greenFlags.length >= 2) {
    score += 5;
  } else {
    missing.push('Green Flags (need 2+)');
  }

  // Deal-breakers (5%)
  if (qual.dealBreakers && qual.dealBreakers.length >= 2) {
    score += 5;
  } else {
    missing.push('Qualification Deal-breakers (need 2+)');
  }

  return score;
}

/**
 * Objection Handling Completion (15%)
 */
function calculateObjectionHandlingCompletion(patterns: ExtractedPatterns | null): number {
  if (!patterns?.objectionHandling) return 0;

  const missing: string[] = [];
  let score = 0;

  const obj = patterns.objectionHandling;

  // Price Objection (4%)
  if (obj.priceObjection && obj.priceObjection !== 'not_demonstrated') {
    score += 4;
  } else {
    missing.push('Price Objection Handling');
  }

  // Timeline Objection (4%)
  if (obj.timelineObjection && obj.timelineObjection !== 'not_demonstrated') {
    score += 4;
  } else {
    missing.push('Timeline Objection Handling');
  }

  // Quality Objection (4%)
  if (obj.qualityObjection && obj.qualityObjection !== 'not_demonstrated') {
    score += 4;
  } else {
    missing.push('Quality Objection Handling');
  }

  // Scope Objection (3%)
  if (obj.scopeObjection && obj.scopeObjection !== 'not_demonstrated') {
    score += 3;
  } else {
    missing.push('Scope Objection Handling');
  }

  return score;
}

/**
 * Decision Making Completion (10%)
 */
function calculateDecisionMakingCompletion(patterns: ExtractedPatterns | null): number {
  if (!patterns?.decisionMakingPatterns) return 0;

  const missing: string[] = [];
  let score = 0;

  const decision = patterns.decisionMakingPatterns;

  // When to Say Yes (5%)
  if (decision.whenToSayYes && decision.whenToSayYes.length >= 2 && decision.whenToSayYes[0] !== 'not_demonstrated') {
    score += 5;
  } else {
    missing.push('When to Say Yes (need 2+)');
  }

  // Warning Signs (5%)
  if (decision.warningSigns && decision.warningSigns.length >= 2) {
    score += 5;
  } else {
    missing.push('Warning Signs (need 2+)');
  }

  return score;
}

/**
 * Business Facts Completion (10%)
 */
function calculateBusinessFactsCompletion(profile: BusinessProfile, patterns: ExtractedPatterns | null): number {
  const missing: string[] = [];
  let score = 0;

  // Years Experience (3%) - manual OR extracted
  if (profile.yearsExperience !== null || patterns?.businessFacts?.mentionedExperience?.years) {
    score += 3;
  } else {
    missing.push('Years of Experience');
  }

  // Services (4%) - manual OR extracted
  if ((profile.serviceOfferings && profile.serviceOfferings.length > 0) || 
      (patterns?.businessFacts?.mentionedServices && patterns.businessFacts.mentionedServices.length > 0)) {
    score += 4;
  } else {
    missing.push('Service Offerings');
  }

  // Certifications (3%) - manual OR extracted
  if ((profile.certifications && profile.certifications.length > 0) ||
      (patterns?.businessFacts?.mentionedCertifications && patterns.businessFacts.mentionedCertifications.length > 0)) {
    score += 3;
  } else {
    missing.push('Certifications');
  }

  return score;
}

/**
 * Check if profile is ready for approval (70%+)
 */
export function isProfileReady(profile: BusinessProfile): boolean {
  const completion = calculateProfileCompletion(profile);
  return completion.total >= 70;
}
```

---

### 6.2 Profile Readiness Checker

**File**: `lib/utils/profile-readiness.ts` (NEW)

```typescript
import { BusinessProfile } from '@/lib/types/business-profile';
import { calculateProfileCompletion } from './profile-completion';

export interface ReadinessCheck {
  isReady: boolean;
  completionPercentage: number;
  checklist: {
    communicationStyle: boolean;
    pricingLogic: boolean;
    qualificationCriteria: boolean;
    objectionHandling: boolean;
    decisionMaking: boolean;
    businessFacts: boolean;
    minimumSimulations: boolean; // At least 3
  };
  missingItems: string[];
  nextSteps: string[];
}

/**
 * Check if profile is ready for go-live approval
 */
export function checkProfileReadiness(profile: BusinessProfile): ReadinessCheck {
  const completion = calculateProfileCompletion(profile);
  
  const checklist = {
    communicationStyle: completion.communicationStyle >= 12, // 80% of 15%
    pricingLogic: completion.pricingLogic >= 12, // 80% of 15%
    qualificationCriteria: completion.qualificationCriteria >= 12, // 80% of 15%
    objectionHandling: completion.objectionHandling >= 12, // 80% of 15%
    decisionMaking: completion.decisionMaking >= 8, // 80% of 10%
    businessFacts: completion.businessFacts >= 8, // 80% of 10%
    minimumSimulations: profile.simulationCount >= 3
  };

  const missingItems: string[] = [];
  const nextSteps: string[] = [];

  if (!checklist.communicationStyle) {
    missingItems.push('Communication Style not fully demonstrated');
    nextSteps.push('Complete more simulations showing your communication approach');
  }

  if (!checklist.pricingLogic) {
    missingItems.push('Pricing Logic incomplete');
    nextSteps.push('Practice scenarios involving budget discussions');
  }

  if (!checklist.qualificationCriteria) {
    missingItems.push('Qualification Criteria not clear');
    nextSteps.push('Demonstrate what makes a client a good or bad fit');
  }

  if (!checklist.objectionHandling) {
    missingItems.push('Objection Handling not shown');
    nextSteps.push('Practice handling price, timeline, or quality objections');
  }

  if (!checklist.decisionMaking) {
    missingItems.push('Decision Making patterns unclear');
    nextSteps.push('Show when you say yes vs no to clients');
  }

  if (!checklist.businessFacts) {
    missingItems.push('Business Facts missing');
    nextSteps.push('Fill in business info or mention it during simulations');
  }

  if (!checklist.minimumSimulations) {
    missingItems.push('Need more simulations');
    nextSteps.push(`Complete ${3 - profile.simulationCount} more simulation(s)`);
  }

  return {
    isReady: completion.total >= 70 && Object.values(checklist).every(v => v),
    completionPercentage: completion.total,
    checklist,
    missingItems,
    nextSteps
  };
}
```

---

### 6.3 Profile Page with Progress

**File**: `app/(dashboard)/profile/page.tsx` (REFACTOR)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileProgress from '@/components/profile/ProfileProgress';
import CompletionChecklist from '@/components/profile/CompletionChecklist';
import { BusinessProfile } from '@/lib/types/business-profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/v1/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      setProfile(data.profile);
      setLoading(false);
    } catch (err) {
      console.error('Load profile error:', err);
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  const isReady = profile.completionPercentage >= 70;

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
            <p className="text-gray-600 mt-2">Manage your business information and extracted patterns</p>
          </div>
          <Button onClick={() => router.push('/profile/edit')}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <ProfileProgress profile={profile} className="mb-8" />

      {/* Ready for Approval Banner */}
      {isReady && profile.profileApprovalStatus !== 'APPROVED' && (
        <Card className="p-6 bg-green-50 border-green-200 mb-8">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Your profile is ready!
              </h3>
              <p className="text-green-800 mb-4">
                You've completed enough simulations. Review your profile and approve it to start handling real leads.
              </p>
              <Button onClick={() => router.push('/profile/approve')}>
                Review & Approve Profile
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Completion Checklist */}
      {!isReady && (
        <CompletionChecklist profile={profile} className="mb-8" />
      )}

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="patterns">Extracted Patterns</TabsTrigger>
          <TabsTrigger value="voice">Voice Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          {/* Basic Info Display */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            {/* Display industry, services, etc. */}
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          {/* Extracted Patterns Display */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Extracted Patterns</h2>
            {/* Display communication style, pricing, etc. */}
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          {/* Voice Examples Display */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Voice Examples</h2>
            {/* Display verbatim phrases */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### 6.4 Profile Progress Component

**File**: `components/profile/ProfileProgress.tsx` (NEW)

```typescript
'use client';

import { BusinessProfile } from '@/lib/types/business-profile';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';

interface ProfileProgressProps {
  profile: BusinessProfile;
  className?: string;
}

export default function ProfileProgress({ profile, className }: ProfileProgressProps) {
  const percentage = profile.completionPercentage;

  const getProgressColor = (pct: number) => {
    if (pct >= 70) return 'bg-green-500';
    if (pct >= 40) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getProgressStatus = (pct: number) => {
    if (pct >= 70) return { text: 'Ready to Go Live', color: 'text-green-700' };
    if (pct >= 40) return { text: 'Making Progress', color: 'text-yellow-700' };
    return { text: 'Getting Started', color: 'text-blue-700' };
  };

  const status = getProgressStatus(percentage);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
          <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{percentage}%</div>
          <p className="text-xs text-gray-500">Need 70% to go live</p>
        </div>
      </div>

      <Progress 
        value={percentage} 
        className="h-3"
      />

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          {percentage >= 40 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
          <span className={percentage >= 40 ? 'text-gray-900' : 'text-gray-500'}>
            Basic Profile
          </span>
        </div>
        <div className="flex items-center gap-2">
          {percentage >= 70 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
          <span className={percentage >= 70 ? 'text-gray-900' : 'text-gray-500'}>
            Ready for Approval
          </span>
        </div>
        <div className="flex items-center gap-2">
          {profile.profileApprovalStatus === 'LIVE' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-gray-300" />
          )}
          <span className={profile.profileApprovalStatus === 'LIVE' ? 'text-gray-900' : 'text-gray-500'}>
            Live & Active
          </span>
        </div>
      </div>
    </Card>
  );
}
```

---

### 6.5 Completion Checklist Component

**File**: `components/profile/CompletionChecklist.tsx` (NEW)

```typescript
'use client';

import { BusinessProfile } from '@/lib/types/business-profile';
import { checkProfileReadiness } from '@/lib/utils/profile-readiness';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CompletionChecklistProps {
  profile: BusinessProfile;
  className?: string;
}

export default function CompletionChecklist({ profile, className }: CompletionChecklistProps) {
  const router = useRouter();
  const readiness = checkProfileReadiness(profile);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start gap-3 mb-6">
        <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Complete Your Profile
          </h3>
          <p className="text-sm text-gray-600">
            You need {Math.ceil(70 - readiness.completionPercentage)}% more to activate lead conversations
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {Object.entries(readiness.checklist).map(([key, completed]) => (
          <div key={key} className="flex items-center gap-3">
            {completed ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm ${completed ? 'text-gray-900 line-through' : 'text-gray-700'}`}>
              {formatChecklistItem(key)}
            </span>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      {readiness.nextSteps.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recommended Next Steps:</h4>
          <ul className="space-y-2">
            {readiness.nextSteps.map((step, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <Button 
            onClick={() => router.push('/simulations/new')}
            className="mt-4 w-full"
          >
            Continue Simulations
          </Button>
        </div>
      )}
    </Card>
  );
}

function formatChecklistItem(key: string): string {
  const labels: Record<string, string> = {
    communicationStyle: 'Communication Style demonstrated',
    pricingLogic: 'Pricing Logic extracted',
    qualificationCriteria: 'Qualification Criteria defined',
    objectionHandling: 'Objection Handling shown',
    decisionMaking: 'Decision Making patterns clear',
    businessFacts: 'Business Facts complete',
    minimumSimulations: 'Complete at least 3 simulations'
  };
  return labels[key] || key;
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 6 Tasks

- [ ] **Refactor Completion Calculator**
  - [ ] Create depth-based calculation logic
  - [ ] Implement all sub-requirement checks
  - [ ] Add breakdown details
  - [ ] Write calculation tests

- [ ] **Create Readiness Checker**
  - [ ] Create `profile-readiness.ts`
  - [ ] Implement 70% gate logic
  - [ ] Generate checklist
  - [ ] Generate next steps

- [ ] **Update Profile Page**
  - [ ] Add progress bar component
  - [ ] Add completion checklist
  - [ ] Add ready-for-approval banner
  - [ ] Update tab structure

- [ ] **Create Progress Components**
  - [ ] Create `ProfileProgress.tsx`
  - [ ] Create `CompletionChecklist.tsx`
  - [ ] Add visual indicators
  - [ ] Test responsiveness

- [ ] **Form-Based Editing** (Phase 7 content, preview)
  - [ ] Create edit page structure
  - [ ] Create form components for each pattern type
  - [ ] Add save/cancel functionality

---

## ✅ COMPLETION CRITERIA

Phase 6 is complete when:
- ✅ Depth-based completion calculates correctly
- ✅ Progress shown accurately on profile page
- ✅ Checklist shows what's missing
- ✅ 70% ready banner appears when appropriate
- ✅ All tests passing
- ✅ UI components render properly

---

**Status**: Ready for Implementation  
**Estimated Time**: 4-6 hours  
**Dependencies**: Phase 1-5 Complete  
**Next Phase**: Phase 7 - Post-Simulation Flow (Modal & Validation)
