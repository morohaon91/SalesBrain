# PHASE 7: POST-SIMULATION FLOW (MODAL & VALIDATION)

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 7 of 8  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Gamified post-simulation summary and immediate validation modal  
**Dependencies**: Phase 1-6  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This phase implements the post-simulation flow we agreed on:

1. **Simulation ends** → Shows gamified summary immediately
2. **Two buttons**: "Continue to Next Simulation" OR "Review What We Learned"
3. **Continue** → Extraction runs in background, redirects to next scenario
4. **Review** → Opens validation modal showing extracted patterns
5. **Validation modal** → Owner can approve/reject individual items

---

## 🎯 POST-SIMULATION FLOW

```
Simulation Completes (owner clicks "End" or hits 15 messages)
    ↓
POST /api/v1/simulations/[id]/complete
    ↓
Triggers pattern extraction (async/background)
    ↓
Redirect to /simulations/[id]/summary
    ↓
GAMIFIED SUMMARY PAGE:
  - "Great job! ✨"
  - "You demonstrated: Pricing Logic ✓, Objection Handling ✓"
  - Profile: 45% → 60% (animated counter)
  - "Next suggested scenario: Time-pressured client"
  - Two buttons:
    [Continue to Next Simulation] [Review What We Learned]
    ↓                                    ↓
Continue path:                    Review path:
- Check extraction status          - Wait for extraction if needed
- If complete → suggest next       - Show validation modal
- If pending → poll until done     - Owner approves/rejects items
- Redirect to /simulations/new     - Save approved patterns
                                   - Update profile
                                   - Then → suggest next or done
```

---

## 📦 FILE STRUCTURE

```
app/(dashboard)/simulations/[id]/
  └── summary/
      └── page.tsx                  (NEW - gamified summary)

components/simulation/
  ├── SimulationSummary.tsx         (NEW)
  ├── PatternDemonstrated.tsx       (NEW)
  ├── ProfileProgressAnimation.tsx  (NEW)
  ├── ValidationModal.tsx           (NEW)
  └── PatternReviewCard.tsx         (NEW)

app/api/v1/simulations/[id]/
  ├── complete/route.ts             (REFACTOR - trigger extraction)
  ├── validation-status/route.ts    (NEW - check extraction progress)
  └── validate-patterns/route.ts    (NEW - save approved patterns)

lib/simulations/
  └── extraction-queue.ts           (NEW - async extraction)
```

---

## 📄 DETAILED IMPLEMENTATION

### 7.1 Complete Simulation Endpoint (Trigger Extraction)

**File**: `app/api/v1/simulations/[id]/complete/route.ts` (REFACTOR)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { calculateProfileCompletion } from '@/lib/utils/profile-completion';
import prisma from '@/lib/prisma';

async function handleCompleteSimulation(req: NextRequest, context: any) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const simulationId = context.params.id;

    // Get simulation
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        tenant: { include: { profiles: true } }
      }
    });

    if (!simulation || simulation.status === 'COMPLETED') {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Mark as completed
    await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        ownerApprovalStatus: 'PENDING' // Waiting for extraction
      }
    });

    // Trigger pattern extraction asynchronously
    // Don't await - let it run in background
    extractPatternsAsync(simulationId, simulation.messages, simulation.tenant.profiles[0]);

    return NextResponse.json({
      success: true,
      simulationId,
      status: 'COMPLETED'
    });

  } catch (error) {
    console.error('Complete simulation error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/**
 * Extract patterns asynchronously
 */
async function extractPatternsAsync(
  simulationId: string,
  messages: any[],
  profile: any
) {
  try {
    // Extract patterns
    const patterns = await extractPatternsFromSimulation(
      messages,
      profile.industry,
      simulation.scenarioType
    );

    if (patterns) {
      // Save extracted patterns to simulation
      await prisma.simulation.update({
        where: { id: simulationId },
        data: {
          extractedPatterns: patterns as any,
          ownerApprovalStatus: 'EXTRACTED' // Ready for review
        }
      });
    } else {
      // Extraction failed
      await prisma.simulation.update({
        where: { id: simulationId },
        data: {
          ownerApprovalStatus: 'REJECTED'
        }
      });
    }
  } catch (error) {
    console.error('Async extraction error:', error);
  }
}

export const POST = withAuth(handleCompleteSimulation);
```

---

### 7.2 Gamified Summary Page

**File**: `app/(dashboard)/simulations/[id]/summary/page.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SimulationSummary from '@/components/simulation/SimulationSummary';
import ValidationModal from '@/components/simulation/ValidationModal';
import { Simulation } from '@/lib/types/simulation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function SimulationSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const simulationId = params.id as string;

  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulationAndProfile();
    // Poll for extraction completion
    const pollInterval = setInterval(checkExtractionStatus, 2000);
    return () => clearInterval(pollInterval);
  }, []);

  const loadSimulationAndProfile = async () => {
    try {
      const [simResponse, profileResponse] = await Promise.all([
        fetch(`/api/v1/simulations/${simulationId}`, { credentials: 'include' }),
        fetch('/api/v1/profile', { credentials: 'include' })
      ]);

      const simData = await simResponse.json();
      const profileData = await profileResponse.json();

      setSimulation(simData.simulation);
      setProfile(profileData.profile);
      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setLoading(false);
    }
  };

  const checkExtractionStatus = async () => {
    try {
      const response = await fetch(`/api/v1/simulations/${simulationId}/validation-status`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.status === 'EXTRACTED') {
        // Extraction complete, update simulation
        setSimulation(prev => prev ? { ...prev, ownerApprovalStatus: 'EXTRACTED', extractedPatterns: data.patterns } : null);
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  };

  const handleContinue = async () => {
    // Load suggested next scenario
    const response = await fetch('/api/v1/simulations/suggest-next', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.suggestion) {
      router.push(`/simulations/new?scenario=${data.suggestion.scenario.id}`);
    } else {
      router.push('/profile'); // All scenarios done
    }
  };

  const handleReview = () => {
    setShowValidationModal(true);
  };

  if (loading || !simulation || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const extractionReady = simulation.ownerApprovalStatus === 'EXTRACTED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Gamified Summary */}
        <SimulationSummary
          simulation={simulation}
          oldCompletionPercentage={profile.completionPercentage - 15} // Approximate
          newCompletionPercentage={profile.completionPercentage}
          demonstratedPatterns={simulation.demonstratedPatterns}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={handleContinue}
            className="flex-1"
          >
            Continue to Next Simulation
          </Button>
          <Button
            size="lg"
            onClick={handleReview}
            disabled={!extractionReady}
            className="flex-1"
          >
            {extractionReady ? 'Review What We Learned' : 'Analyzing... ⏳'}
          </Button>
        </div>

        {/* Extraction Status */}
        {!extractionReady && (
          <div className="mt-4 text-center text-sm text-gray-600">
            <Loader2 className="h-4 w-4 inline-block animate-spin mr-2" />
            Extracting patterns from your conversation...
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {showValidationModal && extractionReady && (
        <ValidationModal
          simulation={simulation}
          onClose={() => setShowValidationModal(false)}
          onComplete={() => {
            setShowValidationModal(false);
            handleContinue();
          }}
        />
      )}
    </div>
  );
}
```

---

### 7.3 Simulation Summary Component

**File**: `components/simulation/SimulationSummary.tsx` (NEW)

```typescript
'use client';

import { Simulation } from '@/lib/types/simulation';
import { Card } from '@/components/ui/card';
import PatternDemonstrated from './PatternDemonstrated';
import ProfileProgressAnimation from './ProfileProgressAnimation';
import { Sparkles, TrendingUp } from 'lucide-react';

interface SimulationSummaryProps {
  simulation: Simulation;
  oldCompletionPercentage: number;
  newCompletionPercentage: number;
  demonstratedPatterns: string[];
}

export default function SimulationSummary({
  simulation,
  oldCompletionPercentage,
  newCompletionPercentage,
  demonstratedPatterns
}: SimulationSummaryProps) {
  
  return (
    <Card className="p-8 bg-white shadow-xl">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Great Job!
        </h1>
        <p className="text-gray-600">
          Simulation completed successfully
        </p>
      </div>

      {/* Patterns Demonstrated */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          You Demonstrated
        </h2>
        <div className="space-y-2">
          {demonstratedPatterns.length > 0 ? (
            demonstratedPatterns.map((pattern, index) => (
              <PatternDemonstrated key={index} pattern={pattern} />
            ))
          ) : (
            <p className="text-sm text-gray-500">Pattern extraction in progress...</p>
          )}
        </div>
      </div>

      {/* Profile Progress Animation */}
      <ProfileProgressAnimation
        oldPercentage={oldCompletionPercentage}
        newPercentage={newCompletionPercentage}
      />

      {/* Next Steps Hint */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 Keep practicing to reach 70% and activate lead conversations!
        </p>
      </div>
    </Card>
  );
}
```

---

### 7.4 Pattern Demonstrated Component

**File**: `components/simulation/PatternDemonstrated.tsx` (NEW)

```typescript
'use client';

import { CheckCircle } from 'lucide-react';

interface PatternDemonstratedProps {
  pattern: string;
}

const PATTERN_LABELS: Record<string, string> = {
  'pricing_flexibility': 'Pricing Flexibility',
  'timeline_handling': 'Timeline Management',
  'objection_price': 'Price Objection Handling',
  'qualification_budget': 'Budget Qualification',
  'communication_educational': 'Educational Communication',
  'scope_boundaries': 'Scope Boundary Setting',
};

export default function PatternDemonstrated({ pattern }: PatternDemonstratedProps) {
  const label = PATTERN_LABELS[pattern] || pattern.replace(/_/g, ' ');

  return (
    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
      <span className="text-sm font-medium text-green-900">{label}</span>
    </div>
  );
}
```

---

### 7.5 Profile Progress Animation Component

**File**: `components/simulation/ProfileProgressAnimation.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';

interface ProfileProgressAnimationProps {
  oldPercentage: number;
  newPercentage: number;
}

export default function ProfileProgressAnimation({
  oldPercentage,
  newPercentage
}: ProfileProgressAnimationProps) {
  
  const [currentPercentage, setCurrentPercentage] = useState(oldPercentage);

  useEffect(() => {
    // Animate from old to new
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = (newPercentage - oldPercentage) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCurrentPercentage(Math.min(oldPercentage + increment * currentStep, newPercentage));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [oldPercentage, newPercentage]);

  return (
    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-gray-500">{oldPercentage}%</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span className="text-blue-600">{newPercentage}%</span>
        </div>
      </div>
      
      <Progress value={currentPercentage} className="h-3" />
      
      <div className="mt-2 text-center">
        <span className="text-2xl font-bold text-gray-900">
          {Math.round(currentPercentage)}%
        </span>
      </div>

      {newPercentage >= 70 && (
        <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-center text-sm text-green-800 font-medium">
          🎉 You've reached 70%! Ready to activate lead conversations.
        </div>
      )}
    </div>
  );
}
```

---

### 7.6 Validation Modal Component

**File**: `components/simulation/ValidationModal.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { Simulation } from '@/lib/types/simulation';
import { ExtractedPatterns } from '@/lib/types/business-profile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PatternReviewCard from './PatternReviewCard';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ValidationModalProps {
  simulation: Simulation;
  onClose: () => void;
  onComplete: () => void;
}

export default function ValidationModal({ simulation, onClose, onComplete }: ValidationModalProps) {
  const patterns = simulation.extractedPatterns as ExtractedPatterns;
  const [approvedItems, setApprovedItems] = useState<Set<string>>(new Set());
  const [rejectedItems, setRejectedItems] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const handleApprove = (itemId: string) => {
    setApprovedItems(prev => new Set([...prev, itemId]));
    setRejectedItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleReject = (itemId: string) => {
    setRejectedItems(prev => new Set([...prev, itemId]));
    setApprovedItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/v1/simulations/${simulation.id}/validate-patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          approved: Array.from(approvedItems),
          rejected: Array.from(rejectedItems)
        })
      });

      if (response.ok) {
        onComplete();
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!patterns) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Extracted Patterns</DialogTitle>
          <p className="text-sm text-gray-600">
            Approve or reject the patterns we extracted from your simulation
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Voice Examples */}
          {patterns.voiceExamples && patterns.voiceExamples.length > 0 && (
            <PatternReviewCard
              title="Voice Examples"
              items={patterns.voiceExamples.map((ex, i) => ({
                id: `voice-${i}`,
                label: ex.phrase,
                approved: approvedItems.has(`voice-${i}`),
                rejected: rejectedItems.has(`voice-${i}`)
              }))}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {/* Communication Style */}
          {patterns.communicationStyle && (
            <PatternReviewCard
              title="Communication Style"
              items={[
                { id: 'comm-tone', label: `Tone: ${patterns.communicationStyle.tone}`, approved: approvedItems.has('comm-tone'), rejected: rejectedItems.has('comm-tone') },
                { id: 'comm-style', label: `Style: ${patterns.communicationStyle.style}`, approved: approvedItems.has('comm-style'), rejected: rejectedItems.has('comm-style') }
              ]}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {/* Add more sections... */}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Approved: {approvedItems.size} | Rejected: {rejectedItems.size}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || approvedItems.size === 0}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Approved Patterns
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 7.7 Pattern Review Card Component

**File**: `components/simulation/PatternReviewCard.tsx` (NEW)

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface PatternItem {
  id: string;
  label: string;
  approved: boolean;
  rejected: boolean;
}

interface PatternReviewCardProps {
  title: string;
  items: PatternItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function PatternReviewCard({ title, items, onApprove, onReject }: PatternReviewCardProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
            <div className="flex-1">
              <p className="text-sm text-gray-700">{item.label}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={item.approved ? 'default' : 'outline'}
                onClick={() => onApprove(item.id)}
                className="w-20"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {item.approved ? 'Approved' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant={item.rejected ? 'destructive' : 'outline'}
                onClick={() => onReject(item.id)}
                className="w-20"
              >
                <XCircle className="h-4 w-4 mr-1" />
                {item.rejected ? 'Rejected' : 'Reject'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 7 Tasks

- [ ] **Refactor Complete Endpoint**
  - [ ] Update `/complete/route.ts`
  - [ ] Add async extraction trigger
  - [ ] Update simulation status

- [ ] **Create Summary Page**
  - [ ] Create `/summary/page.tsx`
  - [ ] Add polling for extraction status
  - [ ] Handle "Continue" and "Review" buttons

- [ ] **Create Summary Components**
  - [ ] Create `SimulationSummary.tsx`
  - [ ] Create `PatternDemonstrated.tsx`
  - [ ] Create `ProfileProgressAnimation.tsx`
  - [ ] Add celebration animations

- [ ] **Create Validation Modal**
  - [ ] Create `ValidationModal.tsx`
  - [ ] Create `PatternReviewCard.tsx`
  - [ ] Add approve/reject logic
  - [ ] Add save functionality

- [ ] **Create API Endpoints**
  - [ ] Create `/validation-status/route.ts`
  - [ ] Create `/validate-patterns/route.ts`
  - [ ] Handle pattern approval save

- [ ] **Testing**
  - [ ] Test entire flow end-to-end
  - [ ] Test extraction polling
  - [ ] Test validation save
  - [ ] Test animations

---

## ✅ COMPLETION CRITERIA

Phase 7 is complete when:
- ✅ Post-simulation summary shows correctly
- ✅ Profile progress animates smoothly
- ✅ Patterns demonstrated show up
- ✅ "Continue" redirects to next scenario
- ✅ "Review" opens validation modal
- ✅ Validation modal allows approve/reject
- ✅ Approved patterns save to profile
- ✅ All animations work
- ✅ Flow feels gamified and engaging

---

**Status**: Ready for Implementation  
**Estimated Time**: 6-8 hours  
**Dependencies**: Phase 1-6 Complete  
**Next Phase**: Phase 8 - Profile Approval & Go-Live Gate
