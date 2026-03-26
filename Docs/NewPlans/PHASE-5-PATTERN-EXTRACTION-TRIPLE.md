# PHASE 5: PATTERN EXTRACTION REFACTOR (TRIPLE EXTRACTION)

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 5 of 8  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Extract verbatim phrases + intent patterns + business facts from simulations  
**Dependencies**: Phase 1-4  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This phase completely refactors pattern extraction to capture THREE types of data:

1. **Verbatim Phrases** - Exact words/phrases the owner uses
2. **Intent Patterns** - Underlying meaning and decision-making logic  
3. **Business Facts** - Automatic extraction of years experience, services, certifications mentioned

**Current extraction captures**: Intent only  
**New extraction captures**: All three simultaneously

---

## 🎯 EXTRACTION STRATEGY

### What Gets Extracted Where

| Data Type | Field | Example |
|-----------|-------|---------|
| **Verbatim Phrases** | `ownerVoiceExamples[]` | "I always say transparency is key, no surprises" |
| **Intent (Communication)** | `communicationStyle.keyPhrases[]` | "Emphasizes transparency and clear expectations" |
| **Intent (Pricing)** | `pricingLogic` | min/max budget, flexibility factors, deal-breakers |
| **Intent (Qualification)** | `qualificationCriteria` | must-haves, green flags, red flags |
| **Intent (Objections)** | `objectionHandling` | How owner responds to price/timeline/scope concerns |
| **Intent (Decisions)** | `decisionMakingPatterns` | When to say yes/no, warning signs |
| **Business Facts** | `businessFacts` (in ExtractedPatterns) | Years: 15, Services: ["kitchen remodels"], Certs: ["Licensed GC"] |

---

## 📦 FILE STRUCTURE

```
lib/ai/
  ├── extract-patterns.ts              (REFACTOR - triple extraction)
  ├── normalize-patterns.ts            (existing - enhance)
  ├── merge-patterns.ts                (REFACTOR - handle all 3 types)
  └── prompts/
      └── pattern-extraction.ts        (REFACTOR - new extraction logic)

lib/types/
  └── business-profile.ts              (from Phase 1 - already has types)

lib/validation/
  └── pattern-schemas.ts               (extend with business facts schema)

app/api/v1/simulations/[id]/
  └── extract/route.ts                 (existing - no changes needed)
```

---

## 📄 DETAILED IMPLEMENTATION

### 5.1 Enhanced Pattern Extraction Prompt

**File**: `lib/ai/prompts/pattern-extraction.ts` (REFACTOR)

**Key Changes:**
- Add section for extracting verbatim phrases
- Add section for extracting business facts
- Maintain existing intent extraction
- Return all three in single structured response

```typescript
import { buildPrompt, BEHAVIOR_RULES, OUTPUT_FORMATS } from './templates';

export function generatePatternExtractionPrompt(
  transcript: string,
  industry: string,
  scenarioType: string
): string {
  
  const customInstructions = `
EXTRACTION TASK: Analyze this business owner simulation and extract THREE TYPES of data:

===========================================
SECTION 1: VERBATIM VOICE EXAMPLES
===========================================

Extract 5-10 actual phrases the owner said that show their unique voice and style.

RULES:
- Copy exact words (but fix spelling/grammar)
- Include context for each phrase
- Focus on phrases that reveal personality, values, or style
- Minimum 8 words per phrase, maximum 50 words
- Capture phrases that feel distinctive to this person

EXAMPLES:
✓ "I always tell clients: transparency is everything. No hidden fees, no surprises down the road."
✓ "Here's how I see it: quality work takes time, and if someone's rushing me, that's a red flag."
✓ "I focus on building long-term relationships, not just closing one deal."

✗ "Hi" (too short)
✗ "Yes, I can do that" (too generic)
✗ "I am a professional contarcktor" (don't copy spelling errors - fix to "contractor")

OUTPUT FORMAT:
voiceExamples: [
  {
    phrase: "exact quote with grammar fixed",
    context: "when discussing budget" | "when handling objection" | "when qualifying client"
  }
]

===========================================
SECTION 2: BUSINESS FACTS (AUTO-EXTRACTED)
===========================================

Extract factual information the owner mentioned about their business:

YEARS OF EXPERIENCE:
- Look for: "I've been doing this for X years", "X years in the industry", "started my business in YYYY"
- Extract the number
- Mark confidence: high if stated clearly, medium if implied, low if vague

SERVICES MENTIONED:
- Specific services owner offers
- Be concrete: "kitchen remodels" not "remodeling"

SPECIALIZATIONS:
- What makes them unique or different
- e.g., "custom cabinetry", "eco-friendly materials", "luxury homes"

CERTIFICATIONS/LICENSES:
- Any credentials mentioned
- e.g., "Licensed General Contractor", "Bonded and insured", "LEED certified"

SERVICE AREA:
- Geographic area mentioned
- e.g., "Bay Area", "Northern California", "San Francisco and surrounding counties"

TEAM SIZE:
- Mentioned team/staff
- e.g., "I work solo", "I have 3 people on my team", "we're a team of 8"

OUTPUT FORMAT:
businessFacts: {
  mentionedExperience: {
    years: number | null,
    confidence: "high" | "medium" | "low",
    context: "exact quote where mentioned"
  },
  mentionedServices: string[],
  mentionedSpecializations: string[],
  mentionedCertifications: string[],
  mentionedServiceArea: string | null,
  mentionedTeamSize: string | null
}

===========================================
SECTION 3: INTENT PATTERNS (EXISTING LOGIC)
===========================================

Continue existing extraction for:
- Communication Style (tone, style, KEY PHRASES AS INTENT, formality)
- Pricing Logic (min/max, flexibility, deal-breakers)
- Qualification Criteria (must-haves, green/red flags, deal-breakers)
- Objection Handling (price, timeline, quality, scope, competitor)
- Decision Making (when to say yes/no, warning signs)

IMPORTANT: For communicationStyle.keyPhrases, extract INTENT not verbatim:
✓ "Emphasizes transparency and clear communication"
✓ "Focuses on long-term relationships over quick sales"
✗ "I always tell clients transparency is everything" (this goes in voiceExamples)

===========================================
CRITICAL REMINDERS (FROM EXISTING PROMPT)
===========================================

${BEHAVIOR_RULES.strict}

- Extract INTENT for patterns, VERBATIM for voice examples, FACTS for business data
- Only mark patterns as "demonstrated" if owner ACTUALLY showed them
- Distinguish owner's criteria from customer's complaints
- Assess conversation quality honestly
- Provide constructive feedback

DO NOT copy spelling/grammar errors into voiceExamples (fix them)
DO NOT confuse customer complaints with owner deal-breakers
DO NOT assume patterns that weren't demonstrated

===========================================
CONVERSATION TRANSCRIPT
===========================================

${transcript}

INDUSTRY: ${industry}
SCENARIO: ${scenarioType}

===========================================
OUTPUT FORMAT
===========================================

Return ONLY valid JSON with this exact structure:

{
  "voiceExamples": [ { phrase, context } ],
  "businessFacts": { mentionedExperience, mentionedServices, ... },
  "communicationStyle": { ... existing structure ... },
  "pricingLogic": { ... existing structure ... },
  "qualificationCriteria": { ... existing structure ... },
  "objectionHandling": { ... existing structure ... },
  "decisionMakingPatterns": { ... existing structure ... },
  "conversationQuality": { ... existing structure ... },
  "extractionNotes": { ... existing structure ... }
}
  `.trim();

  return buildPrompt({
    role: 'You are an expert business analyst extracting decision-making patterns from conversation transcripts.',
    behavior: 'strict',
    customInstructions,
    outputFormat: 'json',
    jsonSchema: '... see full schema below ...'
  });
}
```

**Full JSON Schema** (for reference):

```typescript
const EXTRACTION_SCHEMA = {
  type: 'object',
  required: ['voiceExamples', 'businessFacts', 'communicationStyle', 'pricingLogic', 'qualificationCriteria', 'objectionHandling', 'decisionMakingPatterns', 'conversationQuality', 'extractionNotes'],
  properties: {
    voiceExamples: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phrase: { type: 'string', minLength: 8, maxLength: 500 },
          context: { type: 'string', enum: ['pricing', 'objection_handling', 'qualification', 'communication', 'scope', 'timeline'] }
        },
        required: ['phrase', 'context']
      },
      minItems: 3,
      maxItems: 15
    },
    businessFacts: {
      type: 'object',
      properties: {
        mentionedExperience: {
          type: 'object',
          properties: {
            years: { type: ['number', 'null'] },
            confidence: { enum: ['high', 'medium', 'low'] },
            context: { type: 'string' }
          }
        },
        mentionedServices: { type: 'array', items: { type: 'string' } },
        mentionedSpecializations: { type: 'array', items: { type: 'string' } },
        mentionedCertifications: { type: 'array', items: { type: 'string' } },
        mentionedServiceArea: { type: ['string', 'null'] },
        mentionedTeamSize: { type: ['string', 'null'] }
      }
    },
    // ... existing schema for other sections ...
  }
};
```

---

### 5.2 Enhanced Pattern Extraction Logic

**File**: `lib/ai/extract-patterns.ts` (REFACTOR)

```typescript
import { ExtractedPatterns, OwnerVoiceExample } from '@/lib/types/business-profile';
import { SimulationMessage } from '@/lib/types/simulation';
import { generatePatternExtractionPrompt } from './prompts/pattern-extraction';
import { normalizePatterns } from './normalize-patterns';
import { ExtractedPatternsSchema } from '@/lib/validation/pattern-schemas';
import anthropic from './client';

/**
 * Extract patterns from simulation with TRIPLE extraction:
 * 1. Verbatim voice examples
 * 2. Intent patterns
 * 3. Business facts
 */
export async function extractPatternsFromSimulation(
  messages: SimulationMessage[],
  industry: string,
  scenarioType: string
): Promise<ExtractedPatterns | null> {
  
  try {
    // Build transcript
    const transcript = messages
      .map(m => `${m.role === 'BUSINESS_OWNER' ? 'OWNER' : 'CUSTOMER'}: ${m.content}`)
      .join('\n\n');

    // Generate extraction prompt
    const prompt = generatePatternExtractionPrompt(transcript, industry, scenarioType);

    // Call Claude for extraction
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3, // Low temperature for consistent extraction
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse response
    const rawText = response.content[0].text;
    const cleanedText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const rawPatterns = JSON.parse(cleanedText);

    // Validate against schema
    const validatedPatterns = ExtractedPatternsSchema.parse(rawPatterns);

    // Normalize grammar in voice examples and intent patterns
    const normalizedPatterns = await normalizePatterns(validatedPatterns);

    // Transform voice examples to proper format with IDs
    const voiceExamples: OwnerVoiceExample[] = (normalizedPatterns.voiceExamples || []).map((example, index) => ({
      id: `voice-${Date.now()}-${index}`,
      phrase: example.phrase,
      context: example.context,
      simulationId: '', // Will be filled by caller
      frequency: 1,
      timestamp: new Date().toISOString()
    }));

    return {
      ...normalizedPatterns,
      voiceExamples
    };

  } catch (error) {
    console.error('Pattern extraction error:', error);
    return null;
  }
}

/**
 * Extract patterns with quality checking (existing function - unchanged)
 */
export async function extractPatternsWithQualityCheck(
  messages: SimulationMessage[],
  industry: string,
  scenarioType: string
) {
  // ... existing implementation from Phase 3 of master fix plan ...
  // Just call extractPatternsFromSimulation internally
}
```

---

### 5.3 Enhanced Pattern Merging

**File**: `lib/ai/merge-patterns.ts` (REFACTOR)

**Key Changes:**
- Merge verbatim voice examples (deduplicate)
- Merge business facts (reconcile conflicts)
- Keep existing intent pattern merging

```typescript
import { ExtractedPatterns, OwnerVoiceExample, BusinessFacts } from '@/lib/types/business-profile';

/**
 * Merge new patterns with existing patterns
 * Handles all three types: verbatim + intent + business facts
 */
export function mergePatterns(
  existing: ExtractedPatterns | null,
  newPatterns: ExtractedPatterns
): ExtractedPatterns {
  
  if (!existing) {
    return newPatterns;
  }

  return {
    // Merge voice examples (deduplicate similar phrases)
    voiceExamples: mergeVoiceExamples(
      existing.voiceExamples || [],
      newPatterns.voiceExamples || []
    ),

    // Merge business facts (reconcile conflicts)
    businessFacts: mergeBusinessFacts(
      existing.businessFacts,
      newPatterns.businessFacts
    ),

    // Existing intent pattern merging (unchanged)
    communicationStyle: mergeCommunicationStyle(
      existing.communicationStyle,
      newPatterns.communicationStyle
    ),
    pricingLogic: mergePricingLogic(
      existing.pricingLogic,
      newPatterns.pricingLogic
    ),
    qualificationCriteria: mergeQualificationCriteria(
      existing.qualificationCriteria,
      newPatterns.qualificationCriteria
    ),
    objectionHandling: mergeObjectionHandling(
      existing.objectionHandling,
      newPatterns.objectionHandling
    ),
    decisionMakingPatterns: mergeDecisionMakingPatterns(
      existing.decisionMakingPatterns,
      newPatterns.decisionMakingPatterns
    ),
    conversationQuality: newPatterns.conversationQuality, // Latest wins
    extractionNotes: newPatterns.extractionNotes // Latest wins
  };
}

/**
 * Merge voice examples - deduplicate similar phrases
 */
function mergeVoiceExamples(
  existing: OwnerVoiceExample[],
  newExamples: OwnerVoiceExample[]
): OwnerVoiceExample[] {
  
  const merged = [...existing];

  for (const newExample of newExamples) {
    // Check if similar phrase already exists
    const similarity = findMostSimilar(newExample.phrase, existing.map(e => e.phrase));
    
    if (similarity.score < 0.8) {
      // New unique phrase - add it
      merged.push(newExample);
    } else {
      // Similar phrase exists - increment frequency
      const existingExample = merged.find(e => e.phrase === similarity.match);
      if (existingExample) {
        existingExample.frequency += 1;
      }
    }
  }

  // Sort by frequency (most common first)
  return merged.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Merge business facts - reconcile conflicts intelligently
 */
function mergeBusinessFacts(
  existing: BusinessFacts | undefined,
  newFacts: BusinessFacts | undefined
): BusinessFacts {
  
  if (!existing && !newFacts) {
    return {} as BusinessFacts;
  }
  if (!existing) return newFacts!;
  if (!newFacts) return existing;

  return {
    // Years of experience - take highest confidence, or average if both high
    mentionedExperience: reconcileExperience(
      existing.mentionedExperience,
      newFacts.mentionedExperience
    ),

    // Services - union of both
    mentionedServices: Array.from(new Set([
      ...(existing.mentionedServices || []),
      ...(newFacts.mentionedServices || [])
    ])),

    // Specializations - union
    mentionedSpecializations: Array.from(new Set([
      ...(existing.mentionedSpecializations || []),
      ...(newFacts.mentionedSpecializations || [])
    ])),

    // Certifications - union
    mentionedCertifications: Array.from(new Set([
      ...(existing.mentionedCertifications || []),
      ...(newFacts.mentionedCertifications || [])
    ])),

    // Service area - prefer more specific
    mentionedServiceArea: newFacts.mentionedServiceArea || existing.mentionedServiceArea,

    // Team size - prefer more recent
    mentionedTeamSize: newFacts.mentionedTeamSize || existing.mentionedTeamSize
  };
}

/**
 * Reconcile years of experience from multiple mentions
 */
function reconcileExperience(
  existing: BusinessFacts['mentionedExperience'],
  newMention: BusinessFacts['mentionedExperience']
): BusinessFacts['mentionedExperience'] {
  
  if (!existing && !newMention) return undefined;
  if (!existing) return newMention;
  if (!newMention) return existing;

  // Both high confidence - average them
  if (existing.confidence === 'high' && newMention.confidence === 'high') {
    return {
      years: Math.round((existing.years! + newMention.years!) / 2),
      confidence: 'high',
      context: `Mentioned ${existing.years} years and ${newMention.years} years in different simulations`
    };
  }

  // One high, one not - take high confidence one
  if (existing.confidence === 'high') return existing;
  if (newMention.confidence === 'high') return newMention;

  // Neither high - take newer one
  return newMention;
}

/**
 * Find most similar string using simple word overlap
 */
function findMostSimilar(phrase: string, candidates: string[]): { match: string; score: number } {
  let bestMatch = '';
  let bestScore = 0;

  const phraseWords = new Set(phrase.toLowerCase().split(/\s+/));

  for (const candidate of candidates) {
    const candidateWords = new Set(candidate.toLowerCase().split(/\s+/));
    const overlap = Array.from(phraseWords).filter(word => candidateWords.has(word)).length;
    const score = overlap / Math.max(phraseWords.size, candidateWords.size);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = candidate;
    }
  }

  return { match: bestMatch, score: bestScore };
}

// ... existing merge functions for intent patterns unchanged ...
```

---

### 5.4 Enhanced Validation Schema

**File**: `lib/validation/pattern-schemas.ts` (EXTEND)

```typescript
import { z } from 'zod';

// Business Facts Schema (NEW)
export const BusinessFactsSchema = z.object({
  mentionedExperience: z.object({
    years: z.number().int().min(0).max(100).nullable(),
    confidence: z.enum(['high', 'medium', 'low']),
    context: z.string().min(1).max(500)
  }).optional(),
  mentionedServices: z.array(z.string().min(1).max(200)).default([]),
  mentionedSpecializations: z.array(z.string().min(1).max(200)).default([]),
  mentionedCertifications: z.array(z.string().min(1).max(300)).default([]),
  mentionedServiceArea: z.string().min(1).max(200).nullable().optional(),
  mentionedTeamSize: z.string().min(1).max(100).nullable().optional()
});

// Voice Example Schema (NEW)
export const VoiceExampleSchema = z.object({
  phrase: z.string().min(8).max(500),
  context: z.enum(['pricing', 'objection_handling', 'qualification', 'communication', 'scope', 'timeline'])
});

// Extend Extracted Patterns Schema
export const ExtractedPatternsSchema = z.object({
  // NEW: Verbatim voice examples
  voiceExamples: z.array(VoiceExampleSchema).min(3).max(15).optional(),

  // NEW: Business facts
  businessFacts: BusinessFactsSchema.optional(),

  // EXISTING: All intent patterns (unchanged schemas)
  communicationStyle: CommunicationStyleSchema.optional(),
  pricingLogic: PricingLogicSchema.optional(),
  qualificationCriteria: QualificationCriteriaSchema.optional(),
  objectionHandling: ObjectionHandlingSchema.optional(),
  decisionMakingPatterns: DecisionMakingPatternsSchema.optional(),
  conversationQuality: ConversationQualitySchema.optional(),
  extractionNotes: ExtractionNotesSchema.optional()
});
```

---

### 5.5 Update Business Profile Save

**File**: `app/api/v1/simulations/[id]/extract/route.ts` (MODIFY)

**Key Change**: Save voice examples and business facts to profile

```typescript
// ... existing code ...

// After extraction and merging
const mergedPatterns = mergePatterns(profile.extractedPatterns as any, newPatterns);

// Update profile with ALL three types
await prisma.businessProfile.update({
  where: { id: profile.id },
  data: {
    // Extracted patterns (JSON)
    communicationStyle: mergedPatterns.communicationStyle,
    pricingLogic: mergedPatterns.pricingLogic,
    qualificationCriteria: mergedPatterns.qualificationCriteria,
    objectionHandling: mergedPatterns.objectionHandling,
    decisionMakingPatterns: mergedPatterns.decisionMakingPatterns,
    
    // NEW: Voice examples (JSON array)
    ownerVoiceExamples: mergedPatterns.voiceExamples,

    // NEW: Update business facts if extracted
    yearsExperience: mergedPatterns.businessFacts?.mentionedExperience?.years ?? profile.yearsExperience,
    serviceOfferings: mergedPatterns.businessFacts?.mentionedServices?.length
      ? mergedPatterns.businessFacts.mentionedServices
      : profile.serviceOfferings,
    specializations: mergedPatterns.businessFacts?.mentionedSpecializations?.length
      ? mergedPatterns.businessFacts.mentionedSpecializations
      : profile.specializations,
    certifications: [
      ...profile.certifications,
      ...(mergedPatterns.businessFacts?.mentionedCertifications || [])
    ].filter((v, i, a) => a.indexOf(v) === i), // Deduplicate

    // Update completion percentage
    completionPercentage: calculateCompletion(profile.simulationCount + 1),
    lastExtractedAt: new Date()
  }
});

// ... rest of existing code ...
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 5 Tasks

- [ ] **Update Extraction Prompt**
  - [ ] Add verbatim voice example section
  - [ ] Add business facts section
  - [ ] Keep intent pattern sections
  - [ ] Update JSON schema
  - [ ] Add examples for all three types

- [ ] **Refactor Extraction Logic**
  - [ ] Update `extract-patterns.ts`
  - [ ] Handle three-part extraction
  - [ ] Transform voice examples to proper format
  - [ ] Add error handling

- [ ] **Refactor Pattern Merging**
  - [ ] Update `merge-patterns.ts`
  - [ ] Add `mergeVoiceExamples()` function
  - [ ] Add `mergeBusinessFacts()` function
  - [ ] Add similarity detection
  - [ ] Test deduplication logic

- [ ] **Extend Validation**
  - [ ] Add `BusinessFactsSchema`
  - [ ] Add `VoiceExampleSchema`
  - [ ] Update `ExtractedPatternsSchema`
  - [ ] Write schema tests

- [ ] **Update API Endpoint**
  - [ ] Modify profile save logic
  - [ ] Save voice examples
  - [ ] Update business facts fields
  - [ ] Test end-to-end flow

- [ ] **Write Tests**
  - [ ] Test extraction with sample transcripts
  - [ ] Test voice example deduplication
  - [ ] Test business facts reconciliation
  - [ ] Test schema validation

---

## 🧪 TESTING REQUIREMENTS

**File**: `tests/ai/triple-extraction.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { mergeVoiceExamples } from '@/lib/ai/merge-patterns';

describe('Triple Extraction', () => {
  it('should extract verbatim, intent, and facts', async () => {
    const messages = [
      { role: 'AI_CLIENT', content: 'How long have you been in business?' },
      { role: 'BUSINESS_OWNER', content: 'I\'ve been doing kitchen remodels for 15 years. Quality takes time, and if someone\'s rushing me, that\'s a red flag.' }
    ];

    const patterns = await extractPatternsFromSimulation(messages, 'Construction', 'PRICE_SENSITIVE');

    // Should have voice examples
    expect(patterns?.voiceExamples?.length).toBeGreaterThan(0);
    expect(patterns?.voiceExamples?.[0].phrase).toContain('quality takes time');

    // Should have business facts
    expect(patterns?.businessFacts?.mentionedExperience?.years).toBe(15);
    expect(patterns?.businessFacts?.mentionedServices).toContain('kitchen remodels');

    // Should have intent patterns
    expect(patterns?.communicationStyle).toBeDefined();
  });

  it('should deduplicate similar voice examples', () => {
    const existing = [
      { id: '1', phrase: 'Transparency is key, no surprises', context: 'pricing', frequency: 1, simulationId: 's1', timestamp: '2026-01-01' }
    ];

    const newExamples = [
      { id: '2', phrase: 'Transparency is everything, no surprises down the road', context: 'pricing', frequency: 1, simulationId: 's2', timestamp: '2026-01-02' }
    ];

    const merged = mergeVoiceExamples(existing, newExamples);

    // Should recognize similarity and increment frequency
    expect(merged.length).toBe(1);
    expect(merged[0].frequency).toBe(2);
  });
});
```

---

## ✅ COMPLETION CRITERIA

Phase 5 is complete when:
- ✅ Extraction captures all three data types
- ✅ Verbatim phrases saved correctly
- ✅ Business facts auto-update profile fields
- ✅ Intent patterns still work as before
- ✅ Deduplication works for voice examples
- ✅ Business facts reconcile conflicts
- ✅ All tests passing
- ✅ Integration with existing system verified

---

**Status**: Ready for Implementation  
**Estimated Time**: 6-8 hours  
**Dependencies**: Phase 1-4 Complete  
**Next Phase**: Phase 6 - Profile Completion & Editing
