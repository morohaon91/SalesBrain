# PHASE 3: INITIAL QUESTIONNAIRE IMPLEMENTATION

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 3 of 8  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Initial onboarding questionnaire (9 fields) that creates 20% baseline profile  
**Dependencies**: Phase 1 (Database), Phase 2 (Scenarios)  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This phase implements the onboarding questionnaire that new users complete immediately after registration. It collects:
- 5 basic business info fields
- 4 business facts fields
- Creates initial 20% profile
- Suggests first simulation scenario
- Redirects user to simulation system

---

## 🎯 QUESTIONNAIRE FIELDS

### Basic Business Information (5 fields)

1. **Industry** (Dropdown - required)
   - 10 options from Phase 2
   - Determines which scenarios user gets

2. **Service Description** (Textarea - required)
   - Min 10 characters, Max 1000 characters
   - Placeholder: "What services do you provide? (e.g., Kitchen and bathroom remodeling, custom cabinetry, general contracting)"

3. **Target Client Type** (Text input - required)
   - Min 5 characters, Max 200 characters
   - Placeholder: "Who do you typically work with? (e.g., Homeowners, property investors, commercial clients)"

4. **Typical Budget Range** (Text input - required)
   - Min 3 characters, Max 100 characters
   - Placeholder: "What's your typical project budget range? (e.g., $20k-$50k, $100k+)"

5. **Common Client Questions** (Multi-add - required, min 1, max 10)
   - Each question: Min 5 characters, Max 300 characters
   - Add/remove interface
   - Placeholder: "What do clients usually ask you? (e.g., 'Do you handle permits?', 'How long does a kitchen take?')"

### Business Facts (4 fields)

6. **Years of Experience** (Number input - optional)
   - Min 0, Max 100
   - Placeholder: "15"

7. **Certifications/Licenses** (Multi-add - optional, max 20)
   - Each certification: Min 3 characters, Max 200 characters
   - Placeholder: "Licensed General Contractor - California, Bonded & Insured"

8. **Service Area** (Text input - required)
   - Min 3 characters, Max 200 characters
   - Placeholder: "San Francisco Bay Area"

9. **Team Size** (Dropdown - required)
   - Options: Solo, 2-5, 6-10, 10+

---

## 📦 FILE STRUCTURE

```
app/
  └── (onboarding)/
      └── questionnaire/
          └── page.tsx                (NEW - main questionnaire page)

app/api/v1/
  └── onboarding/
      └── questionnaire/
          └── route.ts                (NEW - POST endpoint)

lib/
  └── onboarding/
      ├── questionnaire-validator.ts  (NEW)
      └── profile-initializer.ts      (NEW)

components/
  └── onboarding/
      ├── QuestionnaireForm.tsx       (NEW)
      ├── IndustrySelect.tsx          (NEW)
      ├── MultiInputField.tsx         (NEW)
      └── OnboardingProgress.tsx      (NEW)
```

---

## 📄 DETAILED IMPLEMENTATION

### 3.1 Questionnaire Page

**File**: `app/(onboarding)/questionnaire/page.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionnaireForm from '@/components/onboarding/QuestionnaireForm';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { QuestionnaireData } from '@/lib/types/onboarding';
import { Card } from '@/components/ui/card';

export default function QuestionnairePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: QuestionnaireData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/onboarding/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save questionnaire');
      }

      const result = await response.json();
      
      // Redirect to simulations with suggested scenario
      router.push(`/simulations/new?scenario=${result.suggestedScenario}`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <OnboardingProgress currentStep="questionnaire" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tell us about your business
          </h1>
          <p className="mt-2 text-gray-600">
            This helps us create realistic practice scenarios tailored to your industry
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Questionnaire Form */}
        <Card className="p-8">
          <QuestionnaireForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Card>

        {/* Helper Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            This takes about 3 minutes. You can always update this information later.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 3.2 Questionnaire Form Component

**File**: `components/onboarding/QuestionnaireForm.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { QuestionnaireData } from '@/lib/types/onboarding';
import { validateQuestionnaireData } from '@/lib/onboarding/questionnaire-validator';
import IndustrySelect from './IndustrySelect';
import MultiInputField from './MultiInputField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuestionnaireFormProps {
  onSubmit: (data: QuestionnaireData) => void;
  isSubmitting: boolean;
}

export default function QuestionnaireForm({ onSubmit, isSubmitting }: QuestionnaireFormProps) {
  const [formData, setFormData] = useState<Partial<QuestionnaireData>>({
    commonClientQuestions: [],
    certifications: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validation = validateQuestionnaireData(formData as QuestionnaireData);
    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    // Submit
    onSubmit(formData as QuestionnaireData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Basic Business Info */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Business Information
          </h2>
        </div>

        {/* Industry */}
        <div>
          <Label htmlFor="industry">
            Industry <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            This determines which practice scenarios you'll get
          </p>
          <IndustrySelect
            value={formData.industry || ''}
            onChange={(value) => handleChange('industry', value)}
            error={errors.industry}
          />
        </div>

        {/* Service Description */}
        <div>
          <Label htmlFor="serviceDescription">
            Service Description <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            What services do you provide?
          </p>
          <Textarea
            id="serviceDescription"
            placeholder="e.g., Kitchen and bathroom remodeling, custom cabinetry, general contracting for residential projects"
            value={formData.serviceDescription || ''}
            onChange={(e) => handleChange('serviceDescription', e.target.value)}
            rows={4}
            className={errors.serviceDescription ? 'border-red-500' : ''}
          />
          {errors.serviceDescription && (
            <p className="text-sm text-red-600 mt-1">{errors.serviceDescription}</p>
          )}
        </div>

        {/* Target Client Type */}
        <div>
          <Label htmlFor="targetClientType">
            Target Client Type <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            Who do you typically work with?
          </p>
          <Input
            id="targetClientType"
            placeholder="e.g., Homeowners, property investors, commercial clients"
            value={formData.targetClientType || ''}
            onChange={(e) => handleChange('targetClientType', e.target.value)}
            className={errors.targetClientType ? 'border-red-500' : ''}
          />
          {errors.targetClientType && (
            <p className="text-sm text-red-600 mt-1">{errors.targetClientType}</p>
          )}
        </div>

        {/* Typical Budget Range */}
        <div>
          <Label htmlFor="typicalBudgetRange">
            Typical Budget Range <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            What's your typical project budget range?
          </p>
          <Input
            id="typicalBudgetRange"
            placeholder="e.g., $20k-$50k, $100k+"
            value={formData.typicalBudgetRange || ''}
            onChange={(e) => handleChange('typicalBudgetRange', e.target.value)}
            className={errors.typicalBudgetRange ? 'border-red-500' : ''}
          />
          {errors.typicalBudgetRange && (
            <p className="text-sm text-red-600 mt-1">{errors.typicalBudgetRange}</p>
          )}
        </div>

        {/* Common Client Questions */}
        <div>
          <Label>
            Common Client Questions <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            What do clients usually ask you?
          </p>
          <MultiInputField
            values={formData.commonClientQuestions || []}
            onChange={(values) => handleChange('commonClientQuestions', values)}
            placeholder="e.g., 'Do you handle permits?', 'How long does a kitchen take?'"
            maxItems={10}
            minItems={1}
            addButtonText="Add Question"
          />
          {errors.commonClientQuestions && (
            <p className="text-sm text-red-600 mt-1">{errors.commonClientQuestions}</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Section 2: Business Facts */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Business Facts
          </h2>
          <p className="text-sm text-gray-600">
            This information helps create more realistic practice scenarios
          </p>
        </div>

        {/* Years of Experience */}
        <div>
          <Label htmlFor="yearsExperience">
            Years of Experience
          </Label>
          <Input
            id="yearsExperience"
            type="number"
            min="0"
            max="100"
            placeholder="15"
            value={formData.yearsExperience || ''}
            onChange={(e) => handleChange('yearsExperience', e.target.value ? parseInt(e.target.value) : null)}
            className={errors.yearsExperience ? 'border-red-500' : ''}
          />
          {errors.yearsExperience && (
            <p className="text-sm text-red-600 mt-1">{errors.yearsExperience}</p>
          )}
        </div>

        {/* Certifications */}
        <div>
          <Label>
            Certifications / Licenses
          </Label>
          <p className="text-sm text-gray-500 mb-2">
            Optional but helps establish credibility
          </p>
          <MultiInputField
            values={formData.certifications || []}
            onChange={(values) => handleChange('certifications', values)}
            placeholder="e.g., Licensed General Contractor - California"
            maxItems={20}
            addButtonText="Add Certification"
          />
          {errors.certifications && (
            <p className="text-sm text-red-600 mt-1">{errors.certifications}</p>
          )}
        </div>

        {/* Service Area */}
        <div>
          <Label htmlFor="serviceArea">
            Service Area <span className="text-red-500">*</span>
          </Label>
          <Input
            id="serviceArea"
            placeholder="e.g., San Francisco Bay Area"
            value={formData.serviceArea || ''}
            onChange={(e) => handleChange('serviceArea', e.target.value)}
            className={errors.serviceArea ? 'border-red-500' : ''}
          />
          {errors.serviceArea && (
            <p className="text-sm text-red-600 mt-1">{errors.serviceArea}</p>
          )}
        </div>

        {/* Team Size */}
        <div>
          <Label htmlFor="teamSize">
            Team Size <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.teamSize || ''}
            onValueChange={(value) => handleChange('teamSize', value)}
          >
            <SelectTrigger className={errors.teamSize ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Solo">Solo (just me)</SelectItem>
              <SelectItem value="2-5">2-5 people</SelectItem>
              <SelectItem value="6-10">6-10 people</SelectItem>
              <SelectItem value="10+">10+ people</SelectItem>
            </SelectContent>
          </Select>
          {errors.teamSize && (
            <p className="text-sm text-red-600 mt-1">{errors.teamSize}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Saving...' : 'Continue to Practice Simulations'}
        </Button>
      </div>
    </form>
  );
}
```

---

### 3.3 Industry Select Component

**File**: `components/onboarding/IndustrySelect.tsx` (NEW)

```typescript
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const INDUSTRIES = [
  'Legal Services',
  'Construction & Contracting',
  'Real Estate Services',
  'Financial Advisory',
  'Business Consulting',
  'Marketing & Creative Agencies',
  'Home Services',
  'Health & Wellness Coaching',
  'IT & Technology Services',
  'Interior Design'
];

interface IndustrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function IndustrySelect({ value, onChange, error }: IndustrySelectProps) {
  return (
    <div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Select your industry" />
        </SelectTrigger>
        <SelectContent>
          {INDUSTRIES.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
```

---

### 3.4 Multi Input Field Component

**File**: `components/onboarding/MultiInputField.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface MultiInputFieldProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  maxItems?: number;
  minItems?: number;
  addButtonText?: string;
}

export default function MultiInputField({
  values,
  onChange,
  placeholder,
  maxItems = 10,
  minItems = 0,
  addButtonText = 'Add Item'
}: MultiInputFieldProps) {
  const [currentInput, setCurrentInput] = useState('');

  const handleAdd = () => {
    if (currentInput.trim() && values.length < maxItems) {
      onChange([...values, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing Items */}
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => {
              const newValues = [...values];
              newValues[index] = e.target.value;
              onChange(newValues);
            }}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(index)}
            disabled={values.length <= minItems}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Add New Item */}
      {values.length < maxItems && (
        <div className="flex items-center gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!currentInput.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-gray-500">
        {values.length} / {maxItems} items
        {minItems > 0 && ` (minimum ${minItems} required)`}
      </p>
    </div>
  );
}
```

---

### 3.5 Onboarding Progress Component

**File**: `components/onboarding/OnboardingProgress.tsx` (NEW)

```typescript
'use client';

import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: 'questionnaire' | 'simulations' | 'approval';
}

const STEPS = [
  { id: 'questionnaire', label: 'Business Info', description: 'Tell us about yourself' },
  { id: 'simulations', label: 'Practice Scenarios', description: 'Train your AI' },
  { id: 'approval', label: 'Go Live', description: 'Approve and activate' }
];

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    ${isComplete ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-4 -mt-12
                    ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 3.6 API Endpoint

**File**: `app/api/v1/onboarding/questionnaire/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { validateQuestionnaireData } from '@/lib/onboarding/questionnaire-validator';
import { initializeProfile } from '@/lib/onboarding/profile-initializer';
import { suggestNextScenario } from '@/lib/templates/scenario-suggester';
import prisma from '@/lib/prisma';

async function handleQuestionnaireSubmit(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user and tenant
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate questionnaire data
    const data = await req.json();
    const validation = validateQuestionnaireData(data);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    // Check if profile already exists
    let profile = await prisma.businessProfile.findUnique({
      where: { tenantId: user.tenantId }
    });

    if (profile) {
      return NextResponse.json(
        { success: false, message: 'Profile already exists' },
        { status: 400 }
      );
    }

    // Initialize profile from questionnaire data
    profile = await initializeProfile(user.tenantId, data);

    // Update tenant onboarding status
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: {
        onboardingStep: 'simulations'
      }
    });

    // Get suggested first scenario
    const suggestion = suggestNextScenario(profile);

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      completionPercentage: profile.completionPercentage,
      nextStep: 'simulations',
      suggestedScenario: suggestion?.scenario.id || null
    });

  } catch (error) {
    console.error('Questionnaire submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleQuestionnaireSubmit);
```

---

### 3.7 Questionnaire Validator

**File**: `lib/onboarding/questionnaire-validator.ts` (NEW)

```typescript
import { QuestionnaireData, QuestionnaireValidation } from '@/lib/types/onboarding';
import { QuestionnaireDataSchema } from '@/lib/validation/business-profile-schemas';

export function validateQuestionnaireData(data: QuestionnaireData): QuestionnaireValidation {
  const errors: { field: keyof QuestionnaireData; message: string }[] = [];

  try {
    // Use Zod schema for validation
    QuestionnaireDataSchema.parse(data);
    
    // Additional custom validation
    if (data.commonClientQuestions.length === 0) {
      errors.push({
        field: 'commonClientQuestions',
        message: 'Please add at least one common client question'
      });
    }

    // Check for duplicate questions
    const uniqueQuestions = new Set(data.commonClientQuestions.map(q => q.toLowerCase().trim()));
    if (uniqueQuestions.size !== data.commonClientQuestions.length) {
      errors.push({
        field: 'commonClientQuestions',
        message: 'Duplicate questions detected'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };

  } catch (error: any) {
    // Convert Zod errors to our format
    if (error.errors) {
      error.errors.forEach((err: any) => {
        errors.push({
          field: err.path[0] as keyof QuestionnaireData,
          message: err.message
        });
      });
    }

    return {
      isValid: false,
      errors
    };
  }
}
```

---

### 3.8 Profile Initializer

**File**: `lib/onboarding/profile-initializer.ts` (NEW)

```typescript
import { QuestionnaireData } from '@/lib/types/onboarding';
import { BusinessProfile } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Initialize a BusinessProfile from questionnaire data
 * Creates a 20% baseline profile
 */
export async function initializeProfile(
  tenantId: string,
  data: QuestionnaireData
): Promise<BusinessProfile> {
  
  // Create initial profile with 20% completion
  const profile = await prisma.businessProfile.create({
    data: {
      tenantId,
      
      // Manual fields from questionnaire
      industry: data.industry,
      serviceDescription: data.serviceDescription,
      targetClientType: data.targetClientType,
      typicalBudgetRange: data.typicalBudgetRange,
      commonClientQuestions: data.commonClientQuestions,
      
      // Business facts
      yearsExperience: data.yearsExperience,
      certifications: data.certifications,
      serviceArea: data.serviceArea,
      teamSize: data.teamSize,
      
      // Initial state
      completionPercentage: 20,
      isComplete: false,
      simulationCount: 0,
      profileApprovalStatus: 'PENDING',
      
      // Empty extracted patterns (to be filled by simulations)
      communicationStyle: null,
      pricingLogic: null,
      qualificationCriteria: null,
      objectionHandling: null,
      decisionMakingPatterns: null,
      ownerVoiceExamples: null,
      knowledgeBase: null,
      
      completedScenarios: [],
      suggestedNextScenario: null
    }
  });

  return profile;
}

/**
 * Calculate initial completion percentage
 * Base 20% for completing questionnaire
 */
export function calculateInitialCompletion(data: QuestionnaireData): number {
  let base = 20;
  
  // Small bonus for optional fields
  if (data.yearsExperience && data.yearsExperience > 0) base += 2;
  if (data.certifications.length > 0) base += 2;
  if (data.commonClientQuestions.length >= 3) base += 1;
  
  return Math.min(base, 25); // Cap at 25% for questionnaire
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 3 Tasks

- [ ] **Create Directory Structure**
  - [ ] Create `app/(onboarding)/questionnaire/` directory
  - [ ] Create `app/api/v1/onboarding/questionnaire/` directory
  - [ ] Create `lib/onboarding/` directory
  - [ ] Create `components/onboarding/` directory

- [ ] **Implement Components**
  - [ ] Create `QuestionnaireForm.tsx`
  - [ ] Create `IndustrySelect.tsx`
  - [ ] Create `MultiInputField.tsx`
  - [ ] Create `OnboardingProgress.tsx`
  - [ ] Style all components with Tailwind

- [ ] **Implement Page**
  - [ ] Create `questionnaire/page.tsx`
  - [ ] Add error handling
  - [ ] Add success redirect
  - [ ] Add loading states

- [ ] **Implement API Endpoint**
  - [ ] Create `questionnaire/route.ts`
  - [ ] Add auth middleware
  - [ ] Add validation
  - [ ] Add database operations
  - [ ] Add error handling

- [ ] **Implement Logic**
  - [ ] Create `questionnaire-validator.ts`
  - [ ] Create `profile-initializer.ts`
  - [ ] Add unit tests

- [ ] **Integration**
  - [ ] Update registration flow to redirect to questionnaire
  - [ ] Update tenant model to track onboarding state
  - [ ] Test end-to-end flow

---

## 🧪 TESTING REQUIREMENTS

**File**: `tests/onboarding/questionnaire.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { validateQuestionnaireData } from '@/lib/onboarding/questionnaire-validator';
import { QuestionnaireData } from '@/lib/types/onboarding';

describe('Questionnaire Validator', () => {
  it('should validate complete valid data', () => {
    const validData: QuestionnaireData = {
      industry: 'Legal Services',
      serviceDescription: 'Criminal defense and family law services',
      targetClientType: 'Individuals facing legal challenges',
      typicalBudgetRange: '$5k-$20k',
      commonClientQuestions: ['Do you offer payment plans?', 'How long will this take?'],
      yearsExperience: 15,
      certifications: ['State Bar License'],
      serviceArea: 'California',
      teamSize: 'Solo'
    };

    const result = validateQuestionnaireData(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      industry: 'Legal Services',
      // Missing other required fields
    } as QuestionnaireData;

    const result = validateQuestionnaireData(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject duplicate questions', () => {
    const dataWithDuplicates: QuestionnaireData = {
      industry: 'Legal Services',
      serviceDescription: 'Criminal defense',
      targetClientType: 'Individuals',
      typicalBudgetRange: '$5k',
      commonClientQuestions: ['Payment plans?', 'payment plans?'], // Duplicate
      yearsExperience: 10,
      certifications: [],
      serviceArea: 'California',
      teamSize: 'Solo'
    };

    const result = validateQuestionnaireData(dataWithDuplicates);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
  });
});
```

---

## 📚 REFERENCES

- Phase 1 types: `lib/types/onboarding.ts`, `lib/types/business-profile.ts`
- Phase 1 validation: `lib/validation/business-profile-schemas.ts`
- Phase 2 scenarios: `lib/templates/scenario-suggester.ts`
- Prisma schema: `prisma/schema.prisma`

---

## ✅ COMPLETION CRITERIA

Phase 3 is complete when:
- ✅ Questionnaire page renders correctly
- ✅ All 9 fields work with proper validation
- ✅ Multi-input fields (questions, certifications) function
- ✅ API endpoint creates 20% profile
- ✅ Redirects to suggested simulation
- ✅ Tenant onboarding state updates
- ✅ All tests passing
- ✅ Integration with Phase 1 & 2 verified

---

**Status**: Ready for Implementation  
**Estimated Time**: 4-6 hours  
**Dependencies**: Phase 1 & 2 Complete  
**Next Phase**: Phase 4 - Simulation System Refactor
