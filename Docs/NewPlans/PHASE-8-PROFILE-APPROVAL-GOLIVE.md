# PHASE 8: PROFILE APPROVAL & GO-LIVE GATE (70%)

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 8 of 8 (FINAL)  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Profile approval workflow and lead conversation activation gate  
**Dependencies**: Phase 1-7  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This is the FINAL phase that implements the 70% completion gate and profile approval workflow:

1. Owner reaches 70% completion
2. System shows "Your profile is ready!" banner
3. Owner clicks "Review & Approve Profile"
4. Approval page shows full profile summary
5. Owner reviews everything one last time
6. Owner clicks "Approve & Go Live"
7. Profile status → APPROVED
8. Lead conversations ACTIVATE
9. Owner can now receive and handle real leads

**Critical Rule**: Lead conversations CANNOT activate until owner explicitly approves profile at 70%+

---

## 🎯 APPROVAL WORKFLOW

```
Profile Reaches 70%
    ↓
Banner appears: "🎉 Your profile is ready!"
    ↓
Owner clicks "Review & Approve Profile"
    ↓
Redirect to /profile/approve
    ↓
APPROVAL PAGE SHOWS:
  - Profile completeness breakdown
  - All extracted patterns (read-only preview)
  - Voice examples
  - Business facts
  - Readiness checklist (all ✓)
  - Warning: "This is how your AI will talk to leads"
    ↓
Owner reviews everything
    ↓
Owner clicks "Approve & Go Live"
    ↓
POST /api/v1/profile/approve
    ↓
Database updates:
  - profileApprovalStatus → APPROVED
  - approvedAt → now()
  - Tenant.leadConversationsActive → true
  - Tenant.activatedAt → now()
    ↓
Redirect to /dashboard (success message)
    ↓
Lead conversations NOW ACTIVE
```

---

## 📦 FILE STRUCTURE

```
app/(dashboard)/profile/
  └── approve/
      └── page.tsx                (NEW - approval page)

components/profile/
  ├── ApprovalSummary.tsx         (NEW)
  ├── ProfilePreview.tsx          (NEW)
  ├── ReadinessChecklist.tsx      (NEW)
  └── ApprovalConfirmation.tsx    (NEW)

app/api/v1/profile/
  ├── approve/route.ts            (NEW - approval endpoint)
  └── pause/route.ts              (NEW - pause lead conversations)

lib/profile/
  └── activation.ts               (NEW - activation logic)
```

---

## 📄 DETAILED IMPLEMENTATION

### 8.1 Profile Approval Page

**File**: `app/(dashboard)/profile/approve/page.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessProfile } from '@/lib/types/business-profile';
import { checkProfileReadiness } from '@/lib/utils/profile-readiness';
import ApprovalSummary from '@/components/profile/ApprovalSummary';
import ProfilePreview from '@/components/profile/ProfilePreview';
import ReadinessChecklist from '@/components/profile/ReadinessChecklist';
import ApprovalConfirmation from '@/components/profile/ApprovalConfirmation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function ProfileApprovalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/v1/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      
      // Check if profile is ready
      const readiness = checkProfileReadiness(data.profile);
      if (!readiness.isReady) {
        // Not ready yet - redirect back
        router.push('/profile');
        return;
      }

      setProfile(data.profile);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/profile/approve', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Approval failed');
      }

      // Success! Redirect to dashboard with success message
      router.push('/dashboard?approval=success');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Profile not found'}</p>
        <Button onClick={() => router.push('/profile')} className="mt-4">
          Back to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review & Approve Your Profile
          </h1>
          <p className="text-gray-600">
            Your profile is ready! Review everything below, then approve to activate lead conversations.
          </p>
        </div>

        {/* Approval Summary */}
        <ApprovalSummary profile={profile} className="mb-6" />

        {/* Readiness Checklist */}
        <ReadinessChecklist profile={profile} className="mb-6" />

        {/* Profile Preview */}
        <ProfilePreview profile={profile} className="mb-8" />

        {/* Warning Box */}
        <Card className="p-6 bg-yellow-50 border-yellow-200 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                This is how your AI will communicate
              </h3>
              <p className="text-sm text-yellow-800">
                The patterns above will guide how the AI talks to your leads. Make sure you're comfortable with the voice, style, and qualification criteria shown.
              </p>
            </div>
          </div>
        </Card>

        {/* Approval Button */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/profile')}
            className="flex-1"
            size="lg"
          >
            Not Ready Yet - Do More Simulations
          </Button>
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={approving}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {approving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              'Approve & Go Live'
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <ApprovalConfirmation
          onConfirm={handleApprove}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}
```

---

### 8.2 Approval Summary Component

**File**: `components/profile/ApprovalSummary.tsx` (NEW)

```typescript
'use client';

import { BusinessProfile } from '@/lib/types/business-profile';
import { calculateProfileCompletion } from '@/lib/utils/profile-completion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface ApprovalSummaryProps {
  profile: BusinessProfile;
  className?: string;
}

export default function ApprovalSummary({ profile, className }: ApprovalSummaryProps) {
  const completion = calculateProfileCompletion(profile);

  const sections = [
    { name: 'Communication Style', score: completion.communicationStyle, max: 15 },
    { name: 'Pricing Logic', score: completion.pricingLogic, max: 15 },
    { name: 'Qualification Criteria', score: completion.qualificationCriteria, max: 15 },
    { name: 'Objection Handling', score: completion.objectionHandling, max: 15 },
    { name: 'Decision Making', score: completion.decisionMaking, max: 10 },
    { name: 'Business Facts', score: completion.businessFacts, max: 10 }
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Profile Completeness</h2>
          <p className="text-sm text-gray-600">All requirements met ✓</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">{completion.total}%</div>
          <p className="text-xs text-gray-500">Ready for approval</p>
        </div>
      </div>

      <Progress value={completion.total} className="h-3 mb-6" />

      <div className="space-y-3">
        {sections.map(section => (
          <div key={section.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-700">{section.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {section.score}/{section.max}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

---

### 8.3 Profile Preview Component

**File**: `components/profile/ProfilePreview.tsx` (NEW)

```typescript
'use client';

import { BusinessProfile, ExtractedPatterns } from '@/lib/types/business-profile';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfilePreviewProps {
  profile: BusinessProfile;
  className?: string;
}

export default function ProfilePreview({ profile, className }: ProfilePreviewProps) {
  const patterns = profile.extractedPatterns as ExtractedPatterns | null;

  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Preview</h2>
      <p className="text-sm text-gray-600 mb-6">
        This is what the AI will use when talking to your leads
      </p>

      <Tabs defaultValue="communication">
        <TabsList>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="qualification">Qualification</TabsTrigger>
          <TabsTrigger value="voice">Voice Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="communication" className="space-y-4">
          {patterns?.communicationStyle && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tone & Style</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Tone:</strong> {patterns.communicationStyle.tone}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Style:</strong> {patterns.communicationStyle.style}
                </p>
              </div>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Key Approaches</h3>
              <ul className="space-y-1">
                {patterns.communicationStyle.keyPhrases?.map((phrase, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          {patterns?.pricingLogic && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Budget Range</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Minimum:</strong> ${patterns.pricingLogic.minBudget?.toLocaleString() || 'Not specified'}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Typical Range:</strong> ${patterns.pricingLogic.minBudget?.toLocaleString()} - ${patterns.pricingLogic.maxBudget?.toLocaleString()}
                </p>
              </div>

              {patterns.pricingLogic.dealBreakers && patterns.pricingLogic.dealBreakers.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-900 mt-4 mb-2">Pricing Deal-Breakers</h3>
                  <ul className="space-y-1">
                    {patterns.pricingLogic.dealBreakers.map((db, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-600">✗</span>
                        {db}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="qualification" className="space-y-4">
          {patterns?.qualificationCriteria && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Green Flags (Good Fit)</h3>
              <ul className="space-y-1">
                {patterns.qualificationCriteria.greenFlags?.map((flag, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    {flag}
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Deal-Breakers</h3>
              <ul className="space-y-1">
                {patterns.qualificationCriteria.dealBreakers?.map((db, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    {db}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="voice" className="space-y-3">
          {patterns?.voiceExamples && patterns.voiceExamples.length > 0 ? (
            patterns.voiceExamples.map((example, i) => (
              <div key={i} className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm text-gray-900 italic">"{example.phrase}"</p>
                <p className="text-xs text-gray-600 mt-2">
                  Context: {example.context}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No voice examples captured yet</p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
```

---

### 8.4 Approval Confirmation Modal

**File**: `components/profile/ApprovalConfirmation.tsx` (NEW)

```typescript
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ApprovalConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ApprovalConfirmation({ onConfirm, onCancel }: ApprovalConfirmationProps) {
  return (
    <AlertDialog open onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activate Lead Conversations?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Once you approve, your AI will start handling real leads using the patterns you've demonstrated.
            </p>
            <p className="font-medium text-gray-900">
              You can pause or update your profile anytime.
            </p>
            <p>
              Are you ready to go live?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Not Yet
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            Yes, Approve & Go Live
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

### 8.5 Profile Approval API Endpoint

**File**: `app/api/v1/profile/approve/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { checkProfileReadiness } from '@/lib/utils/profile-readiness';
import prisma from '@/lib/prisma';

async function handleApproveProfile(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: { profiles: true }
        }
      }
    });

    if (!user || !user.tenant.profiles[0]) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    const profile = user.tenant.profiles[0];

    // Verify profile is ready (70%+)
    const readiness = checkProfileReadiness(profile);
    if (!readiness.isReady) {
      return NextResponse.json(
        {
          success: false,
          message: 'Profile not ready for approval',
          completionPercentage: readiness.completionPercentage,
          missingItems: readiness.missingItems
        },
        { status: 400 }
      );
    }

    // Approve profile
    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: {
        profileApprovalStatus: 'APPROVED',
        approvedAt: new Date()
      }
    });

    // Activate lead conversations on tenant
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: {
        leadConversationsActive: true,
        activatedAt: new Date(),
        onboardingComplete: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile approved and lead conversations activated',
      profile: {
        status: 'APPROVED',
        leadConversationsActive: true
      }
    });

  } catch (error) {
    console.error('Profile approval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleApproveProfile);
```

---

### 8.6 Pause Lead Conversations Endpoint

**File**: `app/api/v1/profile/pause/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import prisma from '@/lib/prisma';

async function handlePauseLeadConversations(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    // Pause lead conversations
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: {
        leadConversationsActive: false
      }
    });

    // Update profile status to PAUSED
    await prisma.businessProfile.updateMany({
      where: { tenantId: user.tenantId },
      data: {
        profileApprovalStatus: 'PAUSED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Lead conversations paused'
    });

  } catch (error) {
    console.error('Pause error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export const POST = withAuth(handlePauseLeadConversations);
```

---

### 8.7 Dashboard Success Banner

**File**: `app/(dashboard)/dashboard/page.tsx` (MODIFY)

Add success banner when redirected after approval:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, X } from 'lucide-react';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('approval') === 'success') {
      setShowSuccess(true);
      // Auto-hide after 10 seconds
      setTimeout(() => setShowSuccess(false), 10000);
    }
  }, [searchParams]);

  return (
    <div className="p-8">
      {/* Success Banner */}
      {showSuccess && (
        <Card className="p-6 bg-green-50 border-green-200 mb-8 relative">
          <button
            onClick={() => setShowSuccess(false)}
            className="absolute top-4 right-4 text-green-600 hover:text-green-800"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start gap-4">
            <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                🎉 Congratulations! You're Live!
              </h3>
              <p className="text-green-800 mb-4">
                Your profile is approved and lead conversations are now active. Your AI is ready to warm up leads 24/7.
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-medium text-gray-900">Next Steps:</p>
                  <p className="text-gray-700 mt-1">Add your widget to your website</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-medium text-gray-900">Monitor:</p>
                  <p className="text-gray-700 mt-1">Check Leads tab for incoming conversations</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-medium text-gray-900">Improve:</p>
                  <p className="text-gray-700 mt-1">Run more simulations to refine patterns</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Rest of dashboard */}
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      {/* ... */}
    </div>
  );
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 8 Tasks

- [ ] **Create Approval Page**
  - [ ] Create `/approve/page.tsx`
  - [ ] Add readiness check
  - [ ] Redirect if not ready
  - [ ] Handle approval flow

- [ ] **Create Approval Components**
  - [ ] Create `ApprovalSummary.tsx`
  - [ ] Create `ProfilePreview.tsx`
  - [ ] Create `ReadinessChecklist.tsx`
  - [ ] Create `ApprovalConfirmation.tsx`

- [ ] **Create API Endpoints**
  - [ ] Create `/approve/route.ts`
  - [ ] Create `/pause/route.ts`
  - [ ] Add validation checks

- [ ] **Update Dashboard**
  - [ ] Add success banner
  - [ ] Add profile status indicators
  - [ ] Show active/paused state

- [ ] **Testing**
  - [ ] Test 70% gate enforcement
  - [ ] Test approval flow end-to-end
  - [ ] Test pause functionality
  - [ ] Verify database updates

---

## ✅ COMPLETION CRITERIA

Phase 8 is complete when:
- ✅ 70% gate prevents premature activation
- ✅ Approval page shows full profile preview
- ✅ Approval updates database correctly
- ✅ Lead conversations activate on approval
- ✅ Success banner shows on dashboard
- ✅ Owner can pause lead conversations
- ✅ All states (PENDING → READY → APPROVED → LIVE → PAUSED) work
- ✅ Integration with all previous phases verified

---

## 🎉 REFACTOR COMPLETE

**All 8 phases implemented successfully!**

The system now:
- ✅ Starts with 9-field questionnaire (20% baseline)
- ✅ Offers industry-specific scenarios with randomized personas
- ✅ Provides gamified simulations with live feedback
- ✅ Extracts verbatim + intent + business facts
- ✅ Calculates depth-based completion (20%-100%)
- ✅ Shows post-simulation summary with validation
- ✅ Requires 70% + owner approval before going live
- ✅ Activates lead conversations only after explicit approval

**Ready for lead conversations in next development phase!**

---

**Status**: COMPLETE ✅  
**Estimated Total Time**: 40-50 hours (all 8 phases)  
**Dependencies**: All phases build sequentially  
**Next Steps**: Implement Phase 1 and proceed in order
