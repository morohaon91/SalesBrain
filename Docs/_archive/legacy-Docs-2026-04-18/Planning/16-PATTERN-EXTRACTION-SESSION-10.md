# Session 10: Pattern Extraction Implementation Guide

## Overview

This document provides complete implementation for analyzing completed simulations and extracting business patterns that will be used for lead qualification.

**Goal:** Automatically analyze simulation conversations to extract how the business owner actually handles clients, then use that knowledge to qualify real leads.

---

## Architecture Overview

### **The Flow:**

```
User completes simulation
   ↓
System triggers pattern extraction
   ↓
Fetch conversation transcript
   ↓
Send to Claude AI for analysis
   ↓
AI returns structured JSON patterns
   ↓
Validate and merge with existing patterns
   ↓
Update BusinessProfile in database
   ↓
Increment completion percentage
   ↓
Display extracted patterns in UI
```

---

## 1. TypeScript Type Definitions

### **Create: `lib/types/business-profile.ts`**

```typescript
// lib/types/business-profile.ts

/**
 * Communication Style - How the business owner communicates with clients
 */
export interface CommunicationStyle {
  tone: 'professional' | 'casual' | 'empathetic' | 'direct' | 'friendly';
  style: 'data-driven' | 'emotional' | 'educational' | 'consultative';
  keyPhrases: string[];
  formality: 'formal' | 'conversational' | 'casual';
}

/**
 * Pricing Logic - Budget boundaries and flexibility
 */
export interface PricingLogic {
  minBudget?: number;
  maxBudget?: number;
  typicalRange?: string;
  flexibilityFactors: string[];  // e.g., ["timeline", "scope", "payment_terms"]
  dealBreakers: string[];        // e.g., ["budget_below_X", "unrealistic_timeline"]
}

/**
 * Qualification Criteria - What makes a good/bad client
 */
export interface QualificationCriteria {
  mustHaves: string[];     // Requirements for working together
  dealBreakers: string[];  // Absolute no-gos
  greenFlags: string[];    // Signals of ideal client
  redFlags: string[];      // Warning signs
}

/**
 * Objection Handling - How they respond to common objections
 */
export interface ObjectionHandling {
  priceObjection?: string;
  timelineObjection?: string;
  competitorObjection?: string;
  qualityObjection?: string;
  scopeObjection?: string;
  [key: string]: string | undefined;  // Allow custom objection types
}

/**
 * Decision Making Patterns - When to say yes/no
 */
export interface DecisionMakingPatterns {
  whenToSayYes: string[];
  whenToSayNo: string[];
  warningSignsToWatch: string[];
}

/**
 * Knowledge Base - Common questions and answers (optional for now)
 */
export interface KnowledgeBase {
  expertiseAreas: string[];
  commonAnswers: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
}

/**
 * Complete extracted patterns from a simulation
 */
export interface ExtractedPatterns {
  communicationStyle: CommunicationStyle;
  pricingLogic: PricingLogic;
  qualificationCriteria: QualificationCriteria;
  objectionHandling: ObjectionHandling;
  decisionMakingPatterns: DecisionMakingPatterns;
  knowledgeBase?: KnowledgeBase;
}

/**
 * Metadata about the extraction
 */
export interface ExtractionMetadata {
  simulationId: string;
  extractedAt: Date;
  messageCount: number;
  scenarioType: string;
  confidence: 'high' | 'medium' | 'low';
}
```

---

## 2. Zod Validation Schemas

### **Create: `lib/validation/pattern-schemas.ts`**

```typescript
// lib/validation/pattern-schemas.ts

import { z } from 'zod';

export const CommunicationStyleSchema = z.object({
  tone: z.enum(['professional', 'casual', 'empathetic', 'direct', 'friendly']),
  style: z.enum(['data-driven', 'emotional', 'educational', 'consultative']),
  keyPhrases: z.array(z.string()),
  formality: z.enum(['formal', 'conversational', 'casual'])
});

export const PricingLogicSchema = z.object({
  minBudget: z.number().optional().nullable(),
  maxBudget: z.number().optional().nullable(),
  typicalRange: z.string().optional(),
  flexibilityFactors: z.array(z.string()),
  dealBreakers: z.array(z.string())
});

export const QualificationCriteriaSchema = z.object({
  mustHaves: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  greenFlags: z.array(z.string()),
  redFlags: z.array(z.string())
});

export const ObjectionHandlingSchema = z.object({
  priceObjection: z.string().optional(),
  timelineObjection: z.string().optional(),
  competitorObjection: z.string().optional(),
  qualityObjection: z.string().optional(),
  scopeObjection: z.string().optional()
}).passthrough();  // Allow additional objection types

export const DecisionMakingPatternsSchema = z.object({
  whenToSayYes: z.array(z.string()),
  whenToSayNo: z.array(z.string()),
  warningSignsToWatch: z.array(z.string())
});

export const KnowledgeBaseSchema = z.object({
  expertiseAreas: z.array(z.string()),
  commonAnswers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional()
  }))
}).optional();

export const ExtractedPatternsSchema = z.object({
  communicationStyle: CommunicationStyleSchema,
  pricingLogic: PricingLogicSchema,
  qualificationCriteria: QualificationCriteriaSchema,
  objectionHandling: ObjectionHandlingSchema,
  decisionMakingPatterns: DecisionMakingPatternsSchema,
  knowledgeBase: KnowledgeBaseSchema
});
```

---

## 3. AI Extraction Prompt

### **Create: `lib/ai/prompts/pattern-extraction.ts`**

```typescript
// lib/ai/prompts/pattern-extraction.ts

export const PATTERN_EXTRACTION_SYSTEM_PROMPT = `
You are an expert business analyst specializing in sales conversation analysis.

Your task is to analyze a conversation between a business owner and a potential client to extract structured patterns about how the business owner operates.

Focus on:
1. HOW they communicate (tone, style, phrases)
2. WHAT their pricing boundaries are (min/max, flexibility)
3. WHEN they say yes or no (qualification criteria)
4. HOW they handle objections (strategies and approaches)
5. WHAT patterns emerge in their decision-making

Be specific and evidence-based. Quote exact phrases when relevant.
`.trim();

export function generatePatternExtractionPrompt(
  transcript: string,
  industry: string,
  scenarioType: string
): string {
  return `
Analyze this ${industry} sales conversation (scenario: ${scenarioType}) and extract structured business patterns.

CONVERSATION TRANSCRIPT:
${transcript}

EXTRACT THE FOLLOWING PATTERNS:

1. COMMUNICATION STYLE:
   - Tone: Is it professional/casual/empathetic/direct/friendly?
   - Style: Is it data-driven/emotional/educational/consultative?
   - Key phrases: What phrases do they use repeatedly?
   - Formality: formal/conversational/casual?

2. PRICING LOGIC:
   - What's their minimum budget threshold? (extract exact number if mentioned)
   - What's their maximum? (extract exact number if mentioned)
   - What's their typical range? (describe in words)
   - What factors make them flexible on price?
   - What are absolute deal-breakers related to budget?

3. QUALIFICATION CRITERIA:
   - What MUST a client have to work together? (must-haves)
   - What makes them immediately say NO? (deal-breakers)
   - What signals indicate an ideal client? (green flags)
   - What signals indicate a problematic client? (red flags)

4. OBJECTION HANDLING:
   - How do they respond to price objections?
   - How do they handle timeline concerns?
   - How do they respond to competitor mentions?
   - How do they address quality/value questions?
   - Any other objection patterns?

5. DECISION-MAKING PATTERNS:
   - Under what conditions do they say YES to a client?
   - Under what conditions do they say NO?
   - What warning signs do they watch for?

IMPORTANT INSTRUCTIONS:
- Be specific and evidence-based (reference actual quotes when relevant)
- Extract actual numbers when mentioned (budgets, percentages, timelines)
- Use snake_case for array items (e.g., "credit_score_below_620")
- Keep descriptions concise but informative
- If something isn't clear from the conversation, use reasonable inference based on context
- Return ONLY valid JSON, no markdown formatting, no explanations

OUTPUT FORMAT (respond with ONLY this JSON structure):
{
  "communicationStyle": {
    "tone": "professional" | "casual" | "empathetic" | "direct" | "friendly",
    "style": "data-driven" | "emotional" | "educational" | "consultative",
    "keyPhrases": ["phrase1", "phrase2", "phrase3"],
    "formality": "formal" | "conversational" | "casual"
  },
  "pricingLogic": {
    "minBudget": 200000,
    "maxBudget": 800000,
    "typicalRange": "$200k-$800k home loans",
    "flexibilityFactors": ["timeline", "loan_size", "credit_score"],
    "dealBreakers": ["budget_below_200k", "credit_score_below_620"]
  },
  "qualificationCriteria": {
    "mustHaves": ["credit_score_620_plus", "proof_of_stable_income", "realistic_timeline"],
    "dealBreakers": ["credit_below_620", "no_down_payment", "unrealistic_expectations"],
    "greenFlags": ["pre_approved", "20_percent_down_saved", "clear_timeline"],
    "redFlags": ["just_browsing", "price_shopping_only", "credit_repair_needed"]
  },
  "objectionHandling": {
    "priceObjection": "Explains market rates, shows value vs DIY, offers payment options",
    "timelineObjection": "Sets realistic expectations, doesn't rush process, explains why timeline matters",
    "competitorObjection": "Focuses on unique value and track record, avoids criticizing competitors",
    "qualityObjection": "Emphasizes experience and results, provides examples"
  },
  "decisionMakingPatterns": {
    "whenToSayYes": ["meets_credit_minimum", "realistic_budget", "serious_and_ready"],
    "whenToSayNo": ["below_credit_threshold", "budget_too_low", "not_ready_to_commit"],
    "warningSignsToWatch": ["asking_for_exceptions", "vague_about_financials", "comparing_only_on_price"]
  }
}
`.trim();
}

export function formatConversationTranscript(messages: any[]): string {
  return messages.map(message => {
    const role = message.role === 'AI_CLIENT' ? 'CLIENT' : 'YOU';
    return `${role}: ${message.content}`;
  }).join('\n\n');
}
```

---

## 4. Pattern Extraction Logic

### **Create: `lib/ai/extract-patterns.ts`**

```typescript
// lib/ai/extract-patterns.ts

import Anthropic from '@anthropic-ai/sdk';
import { 
  generatePatternExtractionPrompt, 
  PATTERN_EXTRACTION_SYSTEM_PROMPT,
  formatConversationTranscript 
} from './prompts/pattern-extraction';
import { ExtractedPatternsSchema } from '@/lib/validation/pattern-schemas';
import type { ExtractedPatterns } from '@/lib/types/business-profile';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function extractPatternsFromSimulation(
  messages: any[],
  industry: string,
  scenarioType: string
): Promise<ExtractedPatterns> {
  // Format conversation
  const transcript = formatConversationTranscript(messages);
  
  // Generate prompt
  const userPrompt = generatePatternExtractionPrompt(
    transcript,
    industry,
    scenarioType
  );
  
  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.3,  // Lower temperature for more consistent extraction
    system: PATTERN_EXTRACTION_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: userPrompt
    }]
  });
  
  // Extract text
  const rawText = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';
  
  // Clean up response (remove markdown if present)
  const cleanedText = rawText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // Parse JSON
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', cleanedText);
    throw new Error('AI returned invalid JSON');
  }
  
  // Validate against schema
  const validated = ExtractedPatternsSchema.parse(parsedJson);
  
  return validated as ExtractedPatterns;
}
```

---

## 5. Pattern Merging Logic

### **Create: `lib/ai/merge-patterns.ts`**

```typescript
// lib/ai/merge-patterns.ts

import type { ExtractedPatterns } from '@/lib/types/business-profile';

/**
 * Merge new extracted patterns with existing patterns from previous simulations
 */
export function mergePatterns(
  existing: ExtractedPatterns | null,
  newPatterns: ExtractedPatterns
): ExtractedPatterns {
  // If no existing patterns, return new patterns
  if (!existing) {
    return newPatterns;
  }
  
  return {
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
    knowledgeBase: existing.knowledgeBase || newPatterns.knowledgeBase
  };
}

function mergeCommunicationStyle(existing: any, newData: any) {
  return {
    // Use most recent tone/style (they shouldn't change much)
    tone: newData.tone,
    style: newData.style,
    formality: newData.formality,
    
    // Merge and deduplicate key phrases
    keyPhrases: uniqueArray([
      ...(existing.keyPhrases || []),
      ...(newData.keyPhrases || [])
    ])
  };
}

function mergePricingLogic(existing: any, newData: any) {
  return {
    // Use lowest minBudget seen
    minBudget: existing.minBudget && newData.minBudget
      ? Math.min(existing.minBudget, newData.minBudget)
      : existing.minBudget || newData.minBudget,
    
    // Use highest maxBudget seen
    maxBudget: existing.maxBudget && newData.maxBudget
      ? Math.max(existing.maxBudget, newData.maxBudget)
      : existing.maxBudget || newData.maxBudget,
    
    // Update typical range
    typicalRange: newData.typicalRange || existing.typicalRange,
    
    // Merge and deduplicate factors and deal-breakers
    flexibilityFactors: uniqueArray([
      ...(existing.flexibilityFactors || []),
      ...(newData.flexibilityFactors || [])
    ]),
    dealBreakers: uniqueArray([
      ...(existing.dealBreakers || []),
      ...(newData.dealBreakers || [])
    ])
  };
}

function mergeQualificationCriteria(existing: any, newData: any) {
  return {
    mustHaves: uniqueArray([
      ...(existing.mustHaves || []),
      ...(newData.mustHaves || [])
    ]),
    dealBreakers: uniqueArray([
      ...(existing.dealBreakers || []),
      ...(newData.dealBreakers || [])
    ]),
    greenFlags: uniqueArray([
      ...(existing.greenFlags || []),
      ...(newData.greenFlags || [])
    ]),
    redFlags: uniqueArray([
      ...(existing.redFlags || []),
      ...(newData.redFlags || [])
    ])
  };
}

function mergeObjectionHandling(existing: any, newData: any) {
  // For objection handling, keep all unique objection types
  // If same objection appears twice, keep most recent
  return {
    ...existing,
    ...newData
  };
}

function mergeDecisionMakingPatterns(existing: any, newData: any) {
  return {
    whenToSayYes: uniqueArray([
      ...(existing.whenToSayYes || []),
      ...(newData.whenToSayYes || [])
    ]),
    whenToSayNo: uniqueArray([
      ...(existing.whenToSayNo || []),
      ...(newData.whenToSayNo || [])
    ]),
    warningSignsToWatch: uniqueArray([
      ...(existing.warningSignsToWatch || []),
      ...(newData.warningSignsToWatch || [])
    ])
  };
}

/**
 * Deduplicate array (case-insensitive for strings)
 */
function uniqueArray(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter(item => {
    const key = item.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
```

---

## 6. Completion Percentage Calculation

### **Create: `lib/utils/completion.ts`**

```typescript
// lib/utils/completion.ts

/**
 * Calculate profile completion percentage based on simulation count
 * 
 * Rules:
 * - 0 simulations: 20% (just has template data)
 * - 1 simulation: 40%
 * - 3 simulations: 60%
 * - 5 simulations: 80%
 * - 10+ simulations: 100%
 */
export function calculateCompletionPercentage(simulationCount: number): number {
  if (simulationCount === 0) return 20;
  if (simulationCount === 1) return 40;
  if (simulationCount === 2) return 50;
  if (simulationCount === 3) return 60;
  if (simulationCount === 4) return 70;
  if (simulationCount === 5) return 80;
  if (simulationCount >= 10) return 100;
  
  // For 6-9 simulations, interpolate between 80-100
  // 6 -> 84%, 7 -> 88%, 8 -> 92%, 9 -> 96%
  return 80 + ((simulationCount - 5) * 4);
}

/**
 * Get number of simulations needed to reach next completion level
 */
export function getSimulationsForNextLevel(currentCount: number): number {
  if (currentCount === 0) return 1;  // Need 1 to reach 40%
  if (currentCount === 1) return 2;  // Need 2 more to reach 60% (3 total)
  if (currentCount < 5) return 5 - currentCount;  // Need to reach 5 for 80%
  if (currentCount < 10) return 10 - currentCount;  // Need to reach 10 for 100%
  return 0;  // Already at 100%
}

/**
 * Get next completion percentage level
 */
export function getNextCompletionLevel(currentCount: number): number {
  if (currentCount === 0) return 40;
  if (currentCount < 3) return 60;
  if (currentCount < 5) return 80;
  if (currentCount < 10) return 100;
  return 100;
}

/**
 * Calculate quality score based on conversation metrics
 * 
 * Factors:
 * - Message count (more = better practice)
 * - Balance between AI and Owner (should be roughly equal)
 * - Completion status
 */
export function calculateQualityScore(
  messageCount: number,
  aiMessageCount: number,
  ownerMessageCount: number,
  status: string
): number {
  let score = 0;
  
  // Base score from message count (max 40 points)
  if (messageCount >= 20) score += 40;
  else if (messageCount >= 15) score += 35;
  else if (messageCount >= 10) score += 30;
  else if (messageCount >= 5) score += 20;
  else score += 10;
  
  // Balance score (max 40 points)
  const balanceRatio = Math.min(aiMessageCount, ownerMessageCount) / 
                       Math.max(aiMessageCount, ownerMessageCount);
  score += balanceRatio * 40;
  
  // Completion bonus (20 points)
  if (status === 'COMPLETED') {
    score += 20;
  }
  
  return Math.round(score);
}
```

---

## 7. API Endpoint - Extract Patterns

### **Create: `app/api/v1/simulations/[id]/extract/route.ts`**

```typescript
// app/api/v1/simulations/[id]/extract/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { mergePatterns } from '@/lib/ai/merge-patterns';
import { 
  calculateCompletionPercentage, 
  calculateQualityScore 
} from '@/lib/utils/completion';

async function handler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const simulationId = params.id;
  const { tenantId } = req.auth;
  
  try {
    // 1. Get simulation with messages
    const simulation = await prisma.simulation.findUnique({
      where: { 
        id: simulationId,
        tenantId  // Ensure tenant isolation
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        tenant: {
          include: {
            businessProfile: true
          }
        }
      }
    });
    
    if (!simulation) {
      return NextResponse.json(
        { success: false, error: { code: 'SIMULATION_NOT_FOUND' } },
        { status: 404 }
      );
    }
    
    // 2. Validate simulation is completed
    if (simulation.status !== 'COMPLETED') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'SIMULATION_NOT_COMPLETED',
            message: 'Can only extract patterns from completed simulations' 
          } 
        },
        { status: 400 }
      );
    }
    
    // 3. Check if enough messages
    if (simulation.messages.length < 4) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INSUFFICIENT_MESSAGES',
            message: 'Need at least 4 messages to extract patterns' 
          } 
        },
        { status: 400 }
      );
    }
    
    // 4. Extract patterns using AI
    const industry = simulation.tenant.businessProfile?.industry || 'business_consulting';
    
    const extractedPatterns = await extractPatternsFromSimulation(
      simulation.messages,
      industry,
      simulation.scenarioType
    );
    
    // 5. Get existing profile patterns
    const existingProfile = simulation.tenant.businessProfile;
    
    const existingPatterns = existingProfile ? {
      communicationStyle: existingProfile.communicationStyle as any,
      pricingLogic: existingProfile.pricingLogic as any,
      qualificationCriteria: existingProfile.qualificationCriteria as any,
      objectionHandling: existingProfile.objectionHandling as any,
      decisionMakingPatterns: existingProfile.decisionMakingPatterns as any,
      knowledgeBase: existingProfile.knowledgeBase as any
    } : null;
    
    // 6. Merge with existing patterns
    const mergedPatterns = mergePatterns(existingPatterns, extractedPatterns);
    
    // 7. Calculate metrics
    const aiMessages = simulation.messages.filter(m => m.role === 'AI_CLIENT').length;
    const ownerMessages = simulation.messages.filter(m => m.role === 'BUSINESS_OWNER').length;
    
    const qualityScore = calculateQualityScore(
      simulation.messages.length,
      aiMessages,
      ownerMessages,
      simulation.status
    );
    
    const newSimulationCount = (existingProfile?.simulationCount || 0) + 1;
    const completionPercentage = calculateCompletionPercentage(newSimulationCount);
    
    // 8. Update database in transaction
    await prisma.$transaction([
      // Update simulation with extracted patterns and quality score
      prisma.simulation.update({
        where: { id: simulationId },
        data: {
          extractedPatterns: extractedPatterns as any,
          qualityScore
        }
      }),
      
      // Update business profile with merged patterns
      prisma.businessProfile.update({
        where: { tenantId },
        data: {
          communicationStyle: mergedPatterns.communicationStyle as any,
          pricingLogic: mergedPatterns.pricingLogic as any,
          qualificationCriteria: mergedPatterns.qualificationCriteria as any,
          objectionHandling: mergedPatterns.objectionHandling as any,
          decisionMakingPatterns: mergedPatterns.decisionMakingPatterns as any,
          knowledgeBase: mergedPatterns.knowledgeBase as any,
          
          // Update metadata
          completionPercentage,
          simulationCount: newSimulationCount,
          lastExtractedAt: new Date(),
          isComplete: completionPercentage >= 100,
          completionScore: completionPercentage
        }
      })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        extractedPatterns: mergedPatterns,
        qualityScore,
        completionPercentage,
        simulationCount: newSimulationCount
      }
    });
    
  } catch (error: any) {
    console.error('Pattern extraction error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'EXTRACTION_FAILED',
          message: error.message || 'Failed to extract patterns'
        } 
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
```

---

## 8. API Endpoint - Re-extract All Patterns

### **Create: `app/api/v1/profile/re-extract/route.ts`**

```typescript
// app/api/v1/profile/re-extract/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { mergePatterns } from '@/lib/ai/merge-patterns';
import { calculateCompletionPercentage } from '@/lib/utils/completion';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  
  try {
    // Get all completed simulations
    const completedSimulations = await prisma.simulation.findMany({
      where: {
        tenantId,
        status: 'COMPLETED'
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (completedSimulations.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NO_COMPLETED_SIMULATIONS',
            message: 'No completed simulations to analyze' 
          } 
        },
        { status: 400 }
      );
    }
    
    // Get business profile
    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId }
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'PROFILE_NOT_FOUND' } },
        { status: 404 }
      );
    }
    
    const industry = profile.industry || 'business_consulting';
    
    // Extract patterns from each simulation and merge
    let mergedPatterns: any = null;
    
    for (const simulation of completedSimulations) {
      if (simulation.messages.length < 4) continue;
      
      const extracted = await extractPatternsFromSimulation(
        simulation.messages,
        industry,
        simulation.scenarioType
      );
      
      mergedPatterns = mergePatterns(mergedPatterns, extracted);
    }
    
    if (!mergedPatterns) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'EXTRACTION_FAILED',
            message: 'Could not extract patterns from any simulation' 
          } 
        },
        { status: 500 }
      );
    }
    
    // Calculate completion
    const simulationCount = completedSimulations.length;
    const completionPercentage = calculateCompletionPercentage(simulationCount);
    
    // Update profile
    await prisma.businessProfile.update({
      where: { tenantId },
      data: {
        communicationStyle: mergedPatterns.communicationStyle,
        pricingLogic: mergedPatterns.pricingLogic,
        qualificationCriteria: mergedPatterns.qualificationCriteria,
        objectionHandling: mergedPatterns.objectionHandling,
        decisionMakingPatterns: mergedPatterns.decisionMakingPatterns,
        knowledgeBase: mergedPatterns.knowledgeBase,
        
        completionPercentage,
        simulationCount,
        lastExtractedAt: new Date(),
        isComplete: completionPercentage >= 100,
        completionScore: completionPercentage
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        extractedPatterns: mergedPatterns,
        completionPercentage,
        simulationCount
      }
    });
    
  } catch (error: any) {
    console.error('Re-extraction error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'RE_EXTRACTION_FAILED',
          message: error.message || 'Failed to re-extract patterns'
        } 
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
```

---

## 9. Update Simulation Complete Endpoint

### **Update: `app/api/v1/simulations/[id]/complete/route.ts`**

Add automatic pattern extraction when simulation completes:

```typescript
// app/api/v1/simulations/[id]/complete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

async function handler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  const simulationId = params.id;
  const { tenantId } = req.auth;
  
  try {
    // Update simulation status
    const simulation = await prisma.simulation.update({
      where: { 
        id: simulationId,
        tenantId 
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    // Trigger pattern extraction automatically
    // Call the extract endpoint internally
    const extractUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/simulations/${simulationId}/extract`;
    
    // Fire and forget (or wait for it)
    fetch(extractUrl, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    }).catch(err => {
      console.error('Auto-extraction failed:', err);
      // Don't fail the complete request if extraction fails
    });
    
    return NextResponse.json({
      success: true,
      data: simulation
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'COMPLETION_FAILED',
          message: error.message 
        } 
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
```

---

## 10. Frontend - Display Extracted Patterns

### **Update: `app/(dashboard)/profile/page.tsx` - Extracted Patterns Tab**

```typescript
// Add to Extracted Patterns tab content

'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { api } from '@/lib/api/client';

function ExtractedPatternsTab() {
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.profile.get()
  });
  
  const handleReExtract = async () => {
    try {
      await api.profile.reExtract();
      refetch();
    } catch (error) {
      console.error('Re-extraction failed:', error);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  const completionPercentage = profile?.completionPercentage || 20;
  const simulationCount = profile?.simulationCount || 0;
  const hasPatterns = completionPercentage > 20;
  
  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Your business profile is automatically built from your simulations.
            Complete more simulations to improve accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Completion</span>
              <span className="text-2xl font-bold text-blue-600">
                {completionPercentage}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              {simulationCount} simulation{simulationCount !== 1 ? 's' : ''} completed.
              {simulationCount < 10 && (
                <> Complete {10 - simulationCount} more to reach 100%.</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {!hasPatterns ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Not Yet Built</h3>
            <p className="text-gray-600 mb-4">
              Complete simulations to train your AI and build your business profile.
              The system will extract your:
            </p>
            <ul className="text-left inline-block text-gray-600 space-y-1 mb-6">
              <li>• Pricing logic and negotiation style</li>
              <li>• Communication tone and preferences</li>
              <li>• Ideal client characteristics</li>
              <li>• Deal breakers and requirements</li>
            </ul>
            <div>
              <Button onClick={() => window.location.href = '/simulations/new'}>
                Start Your First Simulation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Communication Style */}
          {profile?.communicationStyle && (
            <Card>
              <CardHeader>
                <CardTitle>Communication Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Tone:</span>
                    <p className="font-medium capitalize">{profile.communicationStyle.tone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Style:</span>
                    <p className="font-medium capitalize">{profile.communicationStyle.style}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Formality:</span>
                    <p className="font-medium capitalize">{profile.communicationStyle.formality}</p>
                  </div>
                </div>
                {profile.communicationStyle.keyPhrases?.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Key Phrases:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.communicationStyle.keyPhrases.map((phrase: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          "{phrase}"
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Pricing Logic */}
          {profile?.pricingLogic && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing Logic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.pricingLogic.minBudget && (
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Minimum budget: ${profile.pricingLogic.minBudget.toLocaleString()}</span>
                    </div>
                  )}
                  {profile.pricingLogic.maxBudget && (
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Maximum budget: ${profile.pricingLogic.maxBudget.toLocaleString()}</span>
                    </div>
                  )}
                  {profile.pricingLogic.typicalRange && (
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Typical range: {profile.pricingLogic.typicalRange}</span>
                    </div>
                  )}
                  {profile.pricingLogic.flexibilityFactors?.map((factor: string, i: number) => (
                    <div key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Flexible on: {factor.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Qualification Criteria */}
          {profile?.qualificationCriteria && (
            <Card>
              <CardHeader>
                <CardTitle>Qualification Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.qualificationCriteria.dealBreakers?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Deal Breakers:</h4>
                    <div className="space-y-1">
                      {profile.qualificationCriteria.dealBreakers.map((item: string, i: number) => (
                        <div key={i} className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          <span>{item.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.qualificationCriteria.greenFlags?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Green Flags:</h4>
                    <div className="space-y-1">
                      {profile.qualificationCriteria.greenFlags.map((item: string, i: number) => (
                        <div key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>{item.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Objection Handling */}
          {profile?.objectionHandling && Object.keys(profile.objectionHandling).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Objection Handling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(profile.objectionHandling).map(([type, response], i) => (
                  response && (
                    <div key={i}>
                      <span className="text-sm font-medium text-gray-700">
                        {type.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <p className="text-sm mt-1">{response as string}</p>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={handleReExtract} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-extract Patterns
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Profile
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default ExtractedPatternsTab;
```

---

## 11. API Client Updates

### **Update: `lib/api/client.ts`**

Add extraction endpoints:

```typescript
// Add to api object

export const api = {
  // ... existing methods ...
  
  simulations: {
    // ... existing methods ...
    
    extract: async (simulationId: string) => {
      const response = await apiClient.post(
        `/api/v1/simulations/${simulationId}/extract`
      );
      return response.data;
    }
  },
  
  profile: {
    get: async () => {
      const response = await apiClient.get('/api/v1/profile');
      return response.data.data;
    },
    
    update: async (data: any) => {
      const response = await apiClient.patch('/api/v1/profile', data);
      return response.data;
    },
    
    reExtract: async () => {
      const response = await apiClient.post('/api/v1/profile/re-extract');
      return response.data;
    }
  }
};
```

---

## 12. Testing Guide

### **Manual Testing Procedure:**

```bash
# 1. Complete a simulation (use the UI)
# Go to /simulations/new → Start simulation → Have conversation → Click "Complete"

# 2. Check that extraction happened automatically
# Look in server logs for "Pattern extraction" messages

# 3. View the profile page
# Go to /profile → Click "Extracted Patterns" tab
# Should show:
# - Completion: 40% (if first simulation)
# - Communication style extracted
# - Pricing logic extracted
# - Qualification criteria extracted

# 4. Complete more simulations
# Do 2-3 more simulations with different scenarios

# 5. Click "Re-extract Patterns"
# Should see merged data from all simulations

# 6. Verify completion percentage increases
# 1 sim: 40%
# 3 sims: 60%
# 5 sims: 80%
# 10 sims: 100%
```

### **Database Verification:**

```sql
-- Check BusinessProfile was updated
SELECT 
  completionPercentage,
  simulationCount,
  lastExtractedAt,
  communicationStyle,
  pricingLogic
FROM BusinessProfile
WHERE tenantId = 'YOUR_TENANT_ID';

-- Check Simulation has extracted patterns
SELECT 
  id,
  scenarioType,
  status,
  qualityScore,
  extractedPatterns
FROM Simulation
WHERE tenantId = 'YOUR_TENANT_ID'
AND status = 'COMPLETED';
```

---

## 13. Common Issues & Debugging

### **Issue: "AI returned invalid JSON"**

**Cause:** Claude sometimes wraps JSON in markdown
**Fix:** The cleanedText logic in extract-patterns.ts handles this

### **Issue: "Extraction takes too long"**

**Cause:** Large conversations (20+ messages)
**Fix:** Increase max_tokens or summarize conversation first

### **Issue: "Patterns not showing in UI"**

**Cause:** JSON structure mismatch
**Fix:** Check Zod validation, ensure AI response matches schema

### **Issue: "Completion percentage not updating"**

**Cause:** Transaction failed or simulationCount not incrementing
**Fix:** Check database logs, verify transaction completed

---

## Summary

After implementing Session 10, you will have:

✅ **Automatic pattern extraction** when simulations complete
✅ **AI-powered analysis** of conversation transcripts
✅ **Structured data extraction** (communication style, pricing, criteria)
✅ **Pattern merging** across multiple simulations
✅ **Completion tracking** (20% → 100% as they practice)
✅ **Quality scoring** for each simulation
✅ **UI display** of extracted patterns
✅ **Re-extraction** capability to refresh all patterns

**Next Steps:**
- Session 11: Vector Embeddings (Pinecone setup)
- Session 12-13: Widget for lead qualification using these patterns
- Session 14-16: Dashboards and analytics

---

## End of Document
