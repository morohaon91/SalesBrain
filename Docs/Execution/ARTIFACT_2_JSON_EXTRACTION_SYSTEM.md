# ARTIFACT 2: JSON Extraction System
## TypeScript Schemas + Extraction Engine for Existing JSON Fields

---

## Overview

**What this does:**
- Defines exact TypeScript interfaces for ALL your existing JSON fields
- Builds extraction engine that analyzes completed simulations
- Fills `communicationStyle`, `objectionHandling`, `qualificationCriteria`, etc.
- Calculates confidence scores and updates `completionPercentage`
- Triggers automatically after each simulation completion

**What you get:**
- Clean, typed data in your existing schema
- No new database tables
- Pattern extraction following solution.txt's 6-layer model
- Confidence tracking built-in

---

## File: `lib/extraction/schemas.ts`

```typescript
/**
 * TypeScript Interfaces for BusinessProfile JSON Fields
 * 
 * These define the EXACT structure stored in your database.
 * All JSON fields use these types.
 */

// ============================================
// COMMUNICATION STYLE (Identity Layer)
// ============================================

export interface CommunicationStyle {
  // Core Style
  tone: 'friendly' | 'direct' | 'formal' | 'warm' | 'assertive' | 'consultative' | null;
  energyLevel: 'low' | 'medium' | 'high' | null;
  sentenceLength: 'short' | 'mixed' | 'long' | null;
  complexityLevel: 'simple' | 'moderate' | 'advanced' | null;
  
  // Behavioral Markers
  usesHumor: boolean;
  humorExamples: string[];
  
  usesEmpathy: boolean;
  empathyExamples: string[];
  
  pressureLevel: 'low' | 'medium' | 'high' | null;
  
  // Linguistic Fingerprint
  commonPhrases: string[]; // "I totally understand", "here's the thing"
  commonOpenings: string[]; // How owner starts conversations
  commonClosings: string[]; // How owner ends conversations
  favoriteWords: string[]; // Distinctive vocabulary
  
  punctuationStyle: 'minimal' | 'standard' | 'expressive' | null;
  emojiUsage: 'none' | 'occasional' | 'frequent' | null;
  typoTolerance: 'formal' | 'casual' | 'very_casual' | null;
  
  verbosityPattern: 'concise' | 'balanced' | 'detailed' | null;
  
  // Confidence
  confidence: number; // 0-100
  evidenceCount: number;
  lastUpdated: string; // ISO date
}

// ============================================
// OBJECTION HANDLING (Objection Layer)
// ============================================

export interface ObjectionPlaybook {
  objectionType: 'price' | 'trust' | 'time' | 'competitor' | 'complexity' | 'risk';
  
  // How this objection appears
  signalExamples: string[];
  
  // Owner's response strategy
  responseStrategy: string; // Overall approach description
  reframingMethod: string | null; // How objection is reframed
  responseExamples: string[]; // Actual responses owner used
  
  // Logic
  escalationLogic: string | null; // When to push harder
  exitLogic: string | null; // When to walk away
  
  // Confidence
  confidenceScore: number; // 0-100
  evidenceCount: number;
  lastSeenAt: string;
  scenariosEncountered: string[]; // Scenario IDs where this was seen
}

export interface ObjectionHandling {
  playbooks: ObjectionPlaybook[];
  
  // Overall confidence in objection handling
  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// QUALIFICATION CRITERIA (Qualification Layer)
// ============================================

export interface GreenFlag {
  flagType: string; // "urgency_indicator", "budget_acceptance", "authority_signal"
  description: string;
  signalExamples: string[];
  confidence: number;
}

export interface YellowFlag {
  flagType: string; // "vague_answers", "hesitation", "weak_urgency"
  description: string;
  signalExamples: string[];
  ownerResponse: string | null; // How owner typically handles this
  confidence: number;
}

export interface RedFlag {
  flagType: string; // "unrealistic_expectations", "no_budget", "disrespectful"
  description: string;
  signalExamples: string[];
  triggersExit: boolean;
  confidence: number;
}

export interface DealBreaker {
  rule: string; // "Budget below $2,000/month"
  reasoning: string; // Why this is a deal breaker
  isAbsolute: boolean; // No exceptions
  evidenceCount: number;
  confidence: number;
  scenariosDemonstrated: string[];
}

export interface WalkAwayStrategy {
  exitLanguage: string[]; // How owner disengages
  leavesDoorOpen: boolean;
  exitFirmness: 'soft' | 'moderate' | 'firm' | null;
  offersAlternatives: boolean;
  alternativeExamples: string[];
}

export interface QualificationCriteria {
  greenFlags: GreenFlag[];
  yellowFlags: YellowFlag[];
  redFlags: RedFlag[];
  dealBreakers: DealBreaker[];
  walkAwayStrategy: WalkAwayStrategy;
  
  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// DECISION MAKING PATTERNS (Strategic Layer)
// ============================================

export interface DiscoveryPattern {
  firstQuestions: string[]; // Initial questions asked
  discoveryOrder: string[]; // Sequence of info gathering
  prioritizedInfo: string[]; // What's most important
  moveToValueTrigger: string | null; // When owner shifts from discovery to pitch
}

export interface PainPattern {
  deepensPain: boolean;
  painDepthLevel: 'surface' | 'moderate' | 'deep' | null;
  normalizesProblem: boolean;
  painApproach: 'challenge' | 'comfort' | 'balanced' | null;
}

export interface ValuePositioning {
  primaryValueLens: 'outcome' | 'process' | 'speed' | 'trust' | 'expertise' | 'convenience' | null;
  secondaryValueLens: string[];
  proofSignalsUsed: string[]; // "case studies", "testimonials", "guarantees"
}

export interface ClosingPattern {
  asksForNextStep: boolean;
  ctaTiming: 'early' | 'moderate' | 'late' | null;
  ctaDirectness: 'subtle' | 'moderate' | 'direct' | null;
  preferredNextStep: 'call' | 'meeting' | 'quote' | 'demo' | 'audit' | 'proposal' | null;
  createsUrgency: boolean;
  urgencyMethod: string | null;
}

export interface DecisionMakingPatterns {
  discovery: DiscoveryPattern;
  pain: PainPattern;
  valuePositioning: ValuePositioning;
  closing: ClosingPattern;
  
  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// PRICING LOGIC (from existing schema)
// ============================================

export interface PricingLogic {
  minimumBudget: number | null;
  preferredBudgetRange: string | null;
  
  // Flexibility
  flexibleOn: string[]; // "days_per_week", "payment_terms"
  notFlexibleOn: string[]; // "minimum_budget", "scope_reduction"
  
  // Defense Strategy
  priceDefenseStrategy: string | null;
  valueAnchorPoints: string[]; // What owner anchors price to
  
  confidence: number;
  lastUpdated: string;
}

// ============================================
// OWNER VOICE EXAMPLES (Linguistic Data)
// ============================================

export interface OwnerVoiceExamples {
  // Categorized by context
  greetings: string[];
  discoveryQuestions: string[];
  empathyStatements: string[];
  valueStatements: string[];
  objectionResponses: string[];
  closingStatements: string[];
  exitStatements: string[];
  
  // Full message examples (for fine-tuning)
  fullMessages: Array<{
    context: string; // "responding_to_price_objection"
    message: string;
    scenario: string;
  }>;
  
  lastUpdated: string;
}

// ============================================
// ADAPTATION TRIGGERS
// ============================================

export interface AdaptationTrigger {
  triggerType: string; // "becomes_more_technical", "simplifies_language"
  context: string; // When this happens
  examples: string[];
  confidence: number;
}

export interface AdaptationPatterns {
  triggers: AdaptationTrigger[];
  
  overallConfidence: number;
  lastUpdated: string;
}

// ============================================
// EXTRACTED PATTERNS (Per-Simulation Raw Data)
// ============================================

export interface ExtractedPatternData {
  simulationId: string;
  scenarioType: string;
  completedAt: string;
  
  // What was extracted from this simulation
  patterns: {
    communicationStyleUpdates?: Partial<CommunicationStyle>;
    objectionHandlingUpdates?: {
      newPlaybooks?: ObjectionPlaybook[];
      updatedPlaybooks?: ObjectionPlaybook[];
    };
    qualificationUpdates?: {
      newGreenFlags?: GreenFlag[];
      newRedFlags?: RedFlag[];
      newDealBreakers?: DealBreaker[];
    };
    decisionMakingUpdates?: Partial<DecisionMakingPatterns>;
    pricingUpdates?: Partial<PricingLogic>;
  };
  
  // Metadata
  overallQuality: number; // 0-100
  extractionConfidence: number; // 0-100
}
```

---

## File: `lib/extraction/extraction-prompts.ts`

```typescript
/**
 * AI Prompts for Pattern Extraction
 * 
 * These prompts analyze completed simulations following
 * the 6-layer pattern from solution.txt
 */

export const EXTRACTION_SYSTEM_PROMPT = `You are an expert business communication analyst extracting behavioral patterns from sales conversations.

Your job is to analyze a business owner's performance in a lead simulation and extract patterns across 6 layers:

## LAYER 1: IDENTITY LAYER (Communication Style)
Extract:
- Tone (friendly/direct/formal/warm/assertive/consultative)
- Energy level (low/medium/high)
- Sentence structure: short/mixed/long
- Humor usage and examples
- Empathy signals and examples
- Common phrases (things they say repeatedly)
- Punctuation style
- Verbosity pattern

## LAYER 2: STRATEGIC LAYER (Decision Making)
Extract:
- Discovery pattern: What questions asked, in what order
- Pain exploration: How deep, how direct
- Value positioning: Outcome vs process vs speed vs trust
- Closing pattern: When, how direct, what next step
- Urgency creation methods

## LAYER 3: QUALIFICATION LAYER
Extract:
- Green flags: What signals interest and fit
- Yellow flags: What raises concerns
- Red flags: What indicates bad fit
- Deal breakers: Absolute disqualifiers with evidence
- Exit strategy: How owner disengages

## LAYER 4: OBJECTION LAYER
For each objection encountered:
- How owner responded
- Reframing technique used
- Whether owner walked away or persisted
- Confidence level in handling

## LAYER 5: ADAPTATION LAYER
Extract:
- When owner became more technical
- When owner simplified language
- When owner adjusted tone
- Triggers for different approaches

## LAYER 6: CONFIDENCE SCORING
For each pattern:
- Assign confidence score (0-100)
- Count evidence strength
- Determine status: STRONG (70+), MODERATE (40-69), WEAK (0-39)

CRITICAL RULES:
1. Return ONLY valid JSON
2. Use SPECIFIC EXAMPLES from the conversation
3. Quote actual phrases the owner used
4. Don't invent - only extract what's clearly present
5. Confidence based on clarity and consistency
6. Empty arrays if pattern not demonstrated

Return this exact structure:
{
  "communicationStyle": { ... },
  "objectionHandling": { ... },
  "qualificationCriteria": { ... },
  "decisionMakingPatterns": { ... },
  "pricingLogic": { ... },
  "ownerVoiceExamples": { ... },
  "adaptationPatterns": { ... },
  "overallQuality": <number 0-100>,
  "extractionConfidence": <number 0-100>
}`;

export function buildExtractionPrompt(
  scenario: any,
  conversation: any[],
  existingProfile: any
): string {
  const conversationText = conversation
    .map(m => `${m.role === 'BUSINESS_OWNER' ? 'OWNER' : 'PROSPECT'}: ${m.content}`)
    .join('\n\n');
  
  return `SCENARIO CONTEXT:
Type: ${scenario.scenarioType}
Primary Goal: ${scenario.primaryGoal}
Expected Patterns: ${scenario.expectedPatterns.join(', ')}

EXISTING PROFILE SUMMARY:
${summarizeExistingProfile(existingProfile)}

CONVERSATION TO ANALYZE:
${conversationText}

Extract patterns across all 6 layers. For each pattern:
1. Provide specific examples from the conversation
2. Assign confidence score based on clarity and consistency
3. Note if this reinforces existing patterns or introduces new ones

Focus especially on:
${scenario.expectedPatterns.map((p: string) => `- ${p}`).join('\n')}

Return structured JSON following the schema.`;
}

function summarizeExistingProfile(profile: any): string {
  if (!profile) return 'No existing profile data';
  
  const parts = [];
  
  if (profile.communicationStyle) {
    parts.push(`Communication: ${profile.communicationStyle.tone || 'unknown'} tone, ${profile.communicationStyle.evidenceCount || 0} examples`);
  }
  
  if (profile.objectionHandling?.playbooks) {
    parts.push(`Objections: ${profile.objectionHandling.playbooks.length} playbooks learned`);
  }
  
  if (profile.qualificationCriteria?.dealBreakers) {
    parts.push(`Deal Breakers: ${profile.qualificationCriteria.dealBreakers.length} identified`);
  }
  
  if (parts.length === 0) return 'Profile is empty - first simulation';
  
  return parts.join('\n');
}
```

---

## File: `lib/extraction/extraction-engine.ts`

```typescript
/**
 * Pattern Extraction Engine
 * 
 * Analyzes completed simulations and updates BusinessProfile JSON fields
 * Triggers automatically after simulation completion
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/db/prisma';
import { getScenarioById } from '@/lib/scenarios/mandatory-scenarios';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionPrompt } from './extraction-prompts';
import type {
  CommunicationStyle,
  ObjectionHandling,
  QualificationCriteria,
  DecisionMakingPatterns,
  PricingLogic,
  OwnerVoiceExamples,
  AdaptationPatterns,
  ExtractedPatternData
} from './schemas';

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

/**
 * Main extraction function - called after simulation completion
 */
export async function extractPatternsFromSimulation(
  simulationId: string
): Promise<void> {
  
  console.log(`[Extraction] Starting for simulation ${simulationId}`);
  
  // 1. Fetch simulation with messages
  const simulation = await prisma.simulation.findUnique({
    where: { id: simulationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      },
      tenant: {
        include: {
          profiles: true
        }
      }
    }
  });
  
  if (!simulation) {
    throw new Error('Simulation not found');
  }
  
  if (simulation.status !== 'COMPLETED') {
    throw new Error('Simulation not completed');
  }
  
  const profile = simulation.tenant.profiles[0];
  if (!profile) {
    throw new Error('Business profile not found');
  }
  
  // 2. Get scenario details
  const scenario = getScenarioById(simulation.scenarioType);
  if (!scenario) {
    console.warn(`Scenario ${simulation.scenarioType} not found - using legacy`);
  }
  
  // 3. Build extraction prompt
  const existingProfile = {
    communicationStyle: profile.communicationStyle as CommunicationStyle | null,
    objectionHandling: profile.objectionHandling as ObjectionHandling | null,
    qualificationCriteria: profile.qualificationCriteria as QualificationCriteria | null,
    decisionMakingPatterns: profile.decisionMakingPatterns as DecisionMakingPatterns | null,
    pricingLogic: profile.pricingLogic as PricingLogic | null
  };
  
  const prompt = buildExtractionPrompt(
    scenario || { scenarioType: simulation.scenarioType },
    simulation.messages,
    existingProfile
  );
  
  // 4. Call Claude for extraction
  console.log('[Extraction] Calling Claude API...');
  
  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });
  
  // 5. Parse extraction results
  const extracted = parseExtractionResponse(response);
  
  console.log('[Extraction] Parsed results:', {
    quality: extracted.overallQuality,
    confidence: extracted.extractionConfidence
  });
  
  // 6. Merge with existing profile
  const updated = await mergeExtractionWithProfile(
    profile.id,
    extracted,
    existingProfile
  );
  
  // 7. Update simulation with extracted patterns
  await prisma.simulation.update({
    where: { id: simulationId },
    data: {
      extractedPatterns: extracted as any,
      validatedAt: new Date()
    }
  });
  
  // 8. Add to completedScenarios if not already there
  if (scenario && !profile.completedScenarios.includes(scenario.id)) {
    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: {
        completedScenarios: {
          push: scenario.id
        }
      }
    });
  }
  
  console.log('[Extraction] Complete');
}

function parseExtractionResponse(response: any): ExtractedPatternData {
  const text = response.content[0].text;
  
  // Find JSON in response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in extraction response');
  }
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse extraction JSON:', jsonMatch[0]);
    throw new Error('Invalid JSON in extraction response');
  }
}

async function mergeExtractionWithProfile(
  profileId: string,
  extracted: any,
  existing: any
): Promise<void> {
  
  const now = new Date().toISOString();
  
  // Merge Communication Style
  const communicationStyle = mergeCommunicationStyle(
    existing.communicationStyle,
    extracted.communicationStyle,
    now
  );
  
  // Merge Objection Handling
  const objectionHandling = mergeObjectionHandling(
    existing.objectionHandling,
    extracted.objectionHandling,
    now
  );
  
  // Merge Qualification Criteria
  const qualificationCriteria = mergeQualificationCriteria(
    existing.qualificationCriteria,
    extracted.qualificationCriteria,
    now
  );
  
  // Merge Decision Making Patterns
  const decisionMakingPatterns = mergeDecisionMaking(
    existing.decisionMakingPatterns,
    extracted.decisionMakingPatterns,
    now
  );
  
  // Merge Pricing Logic
  const pricingLogic = mergePricingLogic(
    existing.pricingLogic,
    extracted.pricingLogic,
    now
  );
  
  // Merge Owner Voice Examples
  const ownerVoiceExamples = mergeOwnerVoice(
    existing.ownerVoiceExamples,
    extracted.ownerVoiceExamples,
    now
  );
  
  // Calculate new completion percentage
  const completionPercentage = calculateCompletionPercentage({
    communicationStyle,
    objectionHandling,
    qualificationCriteria,
    decisionMakingPatterns,
    pricingLogic
  });
  
  // Update profile
  await prisma.businessProfile.update({
    where: { id: profileId },
    data: {
      communicationStyle: communicationStyle as any,
      objectionHandling: objectionHandling as any,
      qualificationCriteria: qualificationCriteria as any,
      decisionMakingPatterns: decisionMakingPatterns as any,
      pricingLogic: pricingLogic as any,
      ownerVoiceExamples: ownerVoiceExamples as any,
      completionPercentage,
      lastExtractedAt: new Date()
    }
  });
}

function mergeCommunicationStyle(
  existing: CommunicationStyle | null,
  extracted: any,
  now: string
): CommunicationStyle {
  
  if (!existing) {
    return {
      ...extracted,
      evidenceCount: 1,
      lastUpdated: now
    };
  }
  
  // Merge logic: prefer most recent if confident, otherwise keep existing
  return {
    tone: extracted.tone || existing.tone,
    energyLevel: extracted.energyLevel || existing.energyLevel,
    sentenceLength: extracted.sentenceLength || existing.sentenceLength,
    complexityLevel: extracted.complexityLevel || existing.complexityLevel,
    
    usesHumor: extracted.usesHumor || existing.usesHumor,
    humorExamples: [...(existing.humorExamples || []), ...(extracted.humorExamples || [])].slice(0, 10),
    
    usesEmpathy: extracted.usesEmpathy || existing.usesEmpathy,
    empathyExamples: [...(existing.empathyExamples || []), ...(extracted.empathyExamples || [])].slice(0, 10),
    
    pressureLevel: extracted.pressureLevel || existing.pressureLevel,
    
    commonPhrases: mergeUnique(existing.commonPhrases, extracted.commonPhrases).slice(0, 20),
    commonOpenings: mergeUnique(existing.commonOpenings, extracted.commonOpenings).slice(0, 10),
    commonClosings: mergeUnique(existing.commonClosings, extracted.commonClosings).slice(0, 10),
    favoriteWords: mergeUnique(existing.favoriteWords, extracted.favoriteWords).slice(0, 20),
    
    punctuationStyle: extracted.punctuationStyle || existing.punctuationStyle,
    emojiUsage: extracted.emojiUsage || existing.emojiUsage,
    typoTolerance: extracted.typoTolerance || existing.typoTolerance,
    verbosityPattern: extracted.verbosityPattern || existing.verbosityPattern,
    
    confidence: Math.min(100, (existing.confidence + extracted.confidence) / 2 + 5), // Slight boost with evidence
    evidenceCount: existing.evidenceCount + 1,
    lastUpdated: now
  };
}

function mergeObjectionHandling(
  existing: ObjectionHandling | null,
  extracted: any,
  now: string
): ObjectionHandling {
  
  if (!existing) {
    return {
      playbooks: extracted.playbooks || [],
      overallConfidence: extracted.overallConfidence || 0,
      lastUpdated: now
    };
  }
  
  const mergedPlaybooks = [...existing.playbooks];
  
  // Merge new playbooks
  for (const newPlaybook of extracted.playbooks || []) {
    const existingIndex = mergedPlaybooks.findIndex(
      p => p.objectionType === newPlaybook.objectionType
    );
    
    if (existingIndex >= 0) {
      // Update existing
      const current = mergedPlaybooks[existingIndex];
      mergedPlaybooks[existingIndex] = {
        ...current,
        signalExamples: mergeUnique(current.signalExamples, newPlaybook.signalExamples).slice(0, 10),
        responseExamples: mergeUnique(current.responseExamples, newPlaybook.responseExamples).slice(0, 10),
        responseStrategy: newPlaybook.responseStrategy || current.responseStrategy,
        reframingMethod: newPlaybook.reframingMethod || current.reframingMethod,
        escalationLogic: newPlaybook.escalationLogic || current.escalationLogic,
        exitLogic: newPlaybook.exitLogic || current.exitLogic,
        confidenceScore: Math.min(100, current.confidenceScore + 10),
        evidenceCount: current.evidenceCount + 1,
        lastSeenAt: now,
        scenariosEncountered: mergeUnique(current.scenariosEncountered, newPlaybook.scenariosEncountered)
      };
    } else {
      // Add new
      mergedPlaybooks.push({
        ...newPlaybook,
        lastSeenAt: now,
        scenariosEncountered: newPlaybook.scenariosEncountered || []
      });
    }
  }
  
  return {
    playbooks: mergedPlaybooks,
    overallConfidence: Math.min(100, existing.overallConfidence + 5),
    lastUpdated: now
  };
}

function mergeQualificationCriteria(
  existing: QualificationCriteria | null,
  extracted: any,
  now: string
): QualificationCriteria {
  
  if (!existing) {
    return {
      greenFlags: extracted.greenFlags || [],
      yellowFlags: extracted.yellowFlags || [],
      redFlags: extracted.redFlags || [],
      dealBreakers: extracted.dealBreakers || [],
      walkAwayStrategy: extracted.walkAwayStrategy || {
        exitLanguage: [],
        leavesDoorOpen: true,
        exitFirmness: null,
        offersAlternatives: false,
        alternativeExamples: []
      },
      overallConfidence: extracted.overallConfidence || 0,
      lastUpdated: now
    };
  }
  
  return {
    greenFlags: mergeFlags(existing.greenFlags, extracted.greenFlags || []),
    yellowFlags: mergeFlags(existing.yellowFlags, extracted.yellowFlags || []),
    redFlags: mergeFlags(existing.redFlags, extracted.redFlags || []),
    dealBreakers: mergeDealBreakers(existing.dealBreakers, extracted.dealBreakers || []),
    walkAwayStrategy: {
      exitLanguage: mergeUnique(existing.walkAwayStrategy.exitLanguage, extracted.walkAwayStrategy?.exitLanguage || []),
      leavesDoorOpen: extracted.walkAwayStrategy?.leavesDoorOpen ?? existing.walkAwayStrategy.leavesDoorOpen,
      exitFirmness: extracted.walkAwayStrategy?.exitFirmness || existing.walkAwayStrategy.exitFirmness,
      offersAlternatives: extracted.walkAwayStrategy?.offersAlternatives ?? existing.walkAwayStrategy.offersAlternatives,
      alternativeExamples: mergeUnique(existing.walkAwayStrategy.alternativeExamples, extracted.walkAwayStrategy?.alternativeExamples || [])
    },
    overallConfidence: Math.min(100, existing.overallConfidence + 5),
    lastUpdated: now
  };
}

function mergeDecisionMaking(
  existing: DecisionMakingPatterns | null,
  extracted: any,
  now: string
): DecisionMakingPatterns {
  
  if (!existing) {
    return {
      ...extracted,
      overallConfidence: extracted.overallConfidence || 0,
      lastUpdated: now
    };
  }
  
  return {
    discovery: {
      firstQuestions: mergeUnique(existing.discovery?.firstQuestions || [], extracted.discovery?.firstQuestions || []).slice(0, 10),
      discoveryOrder: extracted.discovery?.discoveryOrder || existing.discovery?.discoveryOrder || [],
      prioritizedInfo: mergeUnique(existing.discovery?.prioritizedInfo || [], extracted.discovery?.prioritizedInfo || []),
      moveToValueTrigger: extracted.discovery?.moveToValueTrigger || existing.discovery?.moveToValueTrigger
    },
    pain: {
      deepensPain: extracted.pain?.deepensPain ?? existing.pain?.deepensPain ?? false,
      painDepthLevel: extracted.pain?.painDepthLevel || existing.pain?.painDepthLevel,
      normalizesProblem: extracted.pain?.normalizesProblem ?? existing.pain?.normalizesProblem ?? false,
      painApproach: extracted.pain?.painApproach || existing.pain?.painApproach
    },
    valuePositioning: {
      primaryValueLens: extracted.valuePositioning?.primaryValueLens || existing.valuePositioning?.primaryValueLens,
      secondaryValueLens: mergeUnique(existing.valuePositioning?.secondaryValueLens || [], extracted.valuePositioning?.secondaryValueLens || []),
      proofSignalsUsed: mergeUnique(existing.valuePositioning?.proofSignalsUsed || [], extracted.valuePositioning?.proofSignalsUsed || [])
    },
    closing: {
      asksForNextStep: extracted.closing?.asksForNextStep ?? existing.closing?.asksForNextStep ?? false,
      ctaTiming: extracted.closing?.ctaTiming || existing.closing?.ctaTiming,
      ctaDirectness: extracted.closing?.ctaDirectness || existing.closing?.ctaDirectness,
      preferredNextStep: extracted.closing?.preferredNextStep || existing.closing?.preferredNextStep,
      createsUrgency: extracted.closing?.createsUrgency ?? existing.closing?.createsUrgency ?? false,
      urgencyMethod: extracted.closing?.urgencyMethod || existing.closing?.urgencyMethod
    },
    overallConfidence: Math.min(100, (existing.overallConfidence || 0) + 5),
    lastUpdated: now
  };
}

function mergePricingLogic(
  existing: PricingLogic | null,
  extracted: any,
  now: string
): PricingLogic {
  
  if (!existing) {
    return {
      ...extracted,
      confidence: extracted.confidence || 0,
      lastUpdated: now
    };
  }
  
  return {
    minimumBudget: extracted.minimumBudget || existing.minimumBudget,
    preferredBudgetRange: extracted.preferredBudgetRange || existing.preferredBudgetRange,
    flexibleOn: mergeUnique(existing.flexibleOn || [], extracted.flexibleOn || []),
    notFlexibleOn: mergeUnique(existing.notFlexibleOn || [], extracted.notFlexibleOn || []),
    priceDefenseStrategy: extracted.priceDefenseStrategy || existing.priceDefenseStrategy,
    valueAnchorPoints: mergeUnique(existing.valueAnchorPoints || [], extracted.valueAnchorPoints || []),
    confidence: Math.min(100, (existing.confidence || 0) + 5),
    lastUpdated: now
  };
}

function mergeOwnerVoice(
  existing: any,
  extracted: any,
  now: string
): OwnerVoiceExamples {
  
  if (!existing) {
    return {
      ...extracted,
      lastUpdated: now
    };
  }
  
  return {
    greetings: mergeUnique(existing.greetings || [], extracted.greetings || []).slice(0, 10),
    discoveryQuestions: mergeUnique(existing.discoveryQuestions || [], extracted.discoveryQuestions || []).slice(0, 20),
    empathyStatements: mergeUnique(existing.empathyStatements || [], extracted.empathyStatements || []).slice(0, 15),
    valueStatements: mergeUnique(existing.valueStatements || [], extracted.valueStatements || []).slice(0, 15),
    objectionResponses: mergeUnique(existing.objectionResponses || [], extracted.objectionResponses || []).slice(0, 20),
    closingStatements: mergeUnique(existing.closingStatements || [], extracted.closingStatements || []).slice(0, 10),
    exitStatements: mergeUnique(existing.exitStatements || [], extracted.exitStatements || []).slice(0, 10),
    fullMessages: [...(existing.fullMessages || []), ...(extracted.fullMessages || [])].slice(-30), // Keep most recent 30
    lastUpdated: now
  };
}

function mergeUnique(arr1: string[], arr2: string[]): string[] {
  return Array.from(new Set([...arr1, ...arr2]));
}

function mergeFlags(existing: any[], extracted: any[]): any[] {
  const merged = [...existing];
  
  for (const newFlag of extracted) {
    const existingIndex = merged.findIndex(f => f.flagType === newFlag.flagType);
    
    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        signalExamples: mergeUnique(merged[existingIndex].signalExamples, newFlag.signalExamples).slice(0, 10),
        confidence: Math.min(100, merged[existingIndex].confidence + 5)
      };
    } else {
      merged.push(newFlag);
    }
  }
  
  return merged;
}

function mergeDealBreakers(existing: any[], extracted: any[]): any[] {
  const merged = [...existing];
  
  for (const newBreaker of extracted) {
    const existingIndex = merged.findIndex(d => d.rule === newBreaker.rule);
    
    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        evidenceCount: merged[existingIndex].evidenceCount + 1,
        confidence: Math.min(100, merged[existingIndex].confidence + 10),
        scenariosDemonstrated: mergeUnique(
          merged[existingIndex].scenariosDemonstrated,
          newBreaker.scenariosDemonstrated || []
        )
      };
    } else {
      merged.push(newBreaker);
    }
  }
  
  return merged;
}

function calculateCompletionPercentage(profile: any): number {
  let total = 0;
  let score = 0;
  
  // Communication Style (15%)
  if (profile.communicationStyle) {
    total += 15;
    const cs = profile.communicationStyle;
    if (cs.tone) score += 3;
    if (cs.commonPhrases?.length >= 5) score += 5;
    if (cs.evidenceCount >= 3) score += 7;
  }
  
  // Objection Handling (25%)
  if (profile.objectionHandling) {
    total += 25;
    const oh = profile.objectionHandling;
    score += Math.min(25, oh.playbooks?.length * 8);
  }
  
  // Qualification (20%)
  if (profile.qualificationCriteria) {
    total += 20;
    const qc = profile.qualificationCriteria;
    if (qc.greenFlags?.length >= 2) score += 5;
    if (qc.redFlags?.length >= 1) score += 5;
    if (qc.dealBreakers?.length >= 1) score += 10;
  }
  
  // Decision Making (20%)
  if (profile.decisionMakingPatterns) {
    total += 20;
    const dm = profile.decisionMakingPatterns;
    if (dm.discovery?.firstQuestions?.length >= 3) score += 5;
    if (dm.valuePositioning?.primaryValueLens) score += 5;
    if (dm.closing?.preferredNextStep) score += 10;
  }
  
  // Pricing (20%)
  if (profile.pricingLogic) {
    total += 20;
    const pl = profile.pricingLogic;
    if (pl.minimumBudget) score += 10;
    if (pl.priceDefenseStrategy) score += 10;
  }
  
  return Math.min(100, Math.round((score / 100) * 100));
}
```

---

## File: `app/api/v1/simulations/[id]/complete/route.ts`

```typescript
/**
 * Complete Simulation & Trigger Extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { extractPatternsFromSimulation } from '@/lib/extraction/extraction-engine';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const simulationId = params.id;

    // Update simulation status
    const simulation = await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Trigger extraction in background
    // In production, use a queue (Bull, BullMQ, etc.)
    extractPatternsFromSimulation(simulationId).catch(error => {
      console.error('[Extraction] Failed:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Simulation completed. Pattern extraction started.'
    });

  } catch (error) {
    console.error('Error completing simulation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Testing Guide

### 1. Run a Complete Simulation

```bash
# Start simulation
POST /api/v1/simulations/start
{
  "scenarioId": "price_objection_universal"
}

# Exchange messages...

# Complete simulation
POST /api/v1/simulations/{id}/complete
```

### 2. Check Extraction Results

```bash
# Get business profile
GET /api/v1/profiles/{tenantId}

# Check JSON fields are populated:
# - communicationStyle
# - objectionHandling
# - qualificationCriteria
# - etc.
```

### 3. Verify Confidence Scores

After each simulation, check:
- `completionPercentage` increases
- `lastExtractedAt` updated
- Specific patterns have `confidence` scores
- `evidenceCount` increments

---

## Completion Checklist

- [ ] All TypeScript interfaces defined
- [ ] Extraction prompts created
- [ ] Extraction engine implemented
- [ ] Merge logic working correctly
- [ ] Completion percentage calculation accurate
- [ ] API route triggers extraction
- [ ] Tested with at least 3 simulations
- [ ] JSON fields populated correctly
- [ ] Confidence scores make sense

---

**Next:** Artifact 3 - Go-Live Gates & Competency Tracking
