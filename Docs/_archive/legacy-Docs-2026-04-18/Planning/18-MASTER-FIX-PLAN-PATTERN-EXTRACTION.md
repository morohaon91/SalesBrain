# MASTER FIX PLAN: Pattern Extraction & Simulation UX Overhaul

## Executive Summary

This document provides a complete, production-ready plan to fix critical pattern extraction failures and dramatically improve the simulation experience for business owners.

**Core Problems Solved:**
1. ❌ AI confuses customer complaints with owner's deal-breakers → ✅ Clear role distinction
2. ❌ Extracts verbatim spelling errors → ✅ Grammar normalization layer
3. ❌ Accepts incomplete simulations → ✅ Quality gating with completion detection
4. ❌ No owner validation → ✅ Interactive review & approval UI
5. ❌ Unreliable single-simulation data → ✅ Multi-simulation confidence system
6. ❌ Poor simulation UX → ✅ Guided, engaging experience with real-time feedback

**Timeline:** 6 phases, ~20-25 hours total implementation
**Priority:** Critical path - blocks MVP launch until fixed

---

## PHASE 1: Fix AI Extraction Logic (CRITICAL PATH)

**Goal:** AI correctly distinguishes customer behavior from owner's criteria

**Duration:** 4-5 hours

---

### **Task 1.1: Rewrite Pattern Extraction Prompt**

**Problem:** Current prompt asks ambiguous questions like "What are deal-breakers?"

**Solution:** Role-specific extraction with explicit perspective markers

**File:** `lib/ai/prompts/pattern-extraction.ts`

**Implementation:**

```typescript
// lib/ai/prompts/pattern-extraction.ts

export function generatePatternExtractionPrompt(
  transcript: string,
  industry: string,
  scenarioType: string
): string {
  const jsonSchema = `
{
  "communicationStyle": {
    "tone": "professional" | "casual" | "empathetic" | "direct" | "friendly",
    "style": "data-driven" | "emotional" | "educational" | "consultative",
    "keyPhrases": ["intent-based descriptions, NOT verbatim quotes"],
    "formality": "formal" | "conversational" | "casual",
    "responsePattern": "how owner typically structures responses"
  },
  
  "pricingLogic": {
    "minBudget": number | null,
    "maxBudget": number | null,
    "typicalRange": "string description",
    "flexibilityFactors": ["what makes owner negotiate"],
    "dealBreakers": ["budget-related reasons owner rejects clients"],
    "pricingConfidence": "how confidently owner discusses pricing"
  },
  
  "qualificationCriteria": {
    "mustHaves": [
      "Requirements owner stated clients MUST have",
      "Example: 'You need to have financing approved'"
    ],
    "dealBreakers": [
      "Reasons owner REJECTED or would reject this client",
      "Example: Owner said 'We can't work with that timeline'",
      "CRITICAL: Only include if owner ACTUALLY rejected something"
    ],
    "greenFlags": [
      "Client behaviors that made owner ENTHUSIASTIC",
      "Example: Customer said 'I have budget ready' and owner perked up"
    ],
    "redFlags": [
      "Client behaviors that made owner HESITANT or CAUTIOUS",
      "Example: Customer demanded daily updates and owner paused",
      "CRITICAL: Owner's reaction, NOT customer's complaints about owner"
    ],
    "confidence": {
      "mustHaves": "high" | "medium" | "low",
      "dealBreakers": "high" | "medium" | "low" | "not_demonstrated",
      "greenFlags": "high" | "medium" | "low",
      "redFlags": "high" | "medium" | "low"
    }
  },
  
  "objectionHandling": {
    "priceObjection": "how owner responded when customer questioned price",
    "timelineObjection": "how owner responded to timeline concerns",
    "competitorObjection": "how owner responded to competitor mentions",
    "qualityObjection": "how owner justified their value/quality",
    "criticismHandling": "how owner responded to customer criticism",
    "unansweredObjections": ["objections customer raised but owner didn't address"]
  },
  
  "decisionMakingPatterns": {
    "whenToSayYes": [
      "Conditions under which owner ACCEPTED or showed willingness",
      "Example: 'Let's schedule a meeting' after customer met criteria",
      "CRITICAL: Only include if owner ACTUALLY showed acceptance"
    ],
    "whenToSayNo": [
      "Conditions under which owner REJECTED or declined",
      "Example: 'We can't do that timeline' or 'That's below our minimum'",
      "CRITICAL: Only include if owner ACTUALLY rejected something"
    ],
    "warningSignsToWatch": [
      "What made owner pause, ask clarifying questions, or become cautious",
      "Owner's internal warning signs, NOT customer's complaints"
    ],
    "decisionSpeed": "how quickly owner makes yes/no decisions",
    "confidence": {
      "whenToSayYes": "high" | "medium" | "low" | "not_demonstrated",
      "whenToSayNo": "high" | "medium" | "low" | "not_demonstrated"
    }
  },
  
  "conversationQuality": {
    "unansweredQuestions": [
      "List of specific questions customer asked that owner did NOT answer",
      "Include the actual question text"
    ],
    "hasResolution": true | false,
    "resolutionType": "accepted" | "rejected" | "scheduled_followup" | "none",
    "completenessScore": 0-100,
    "missingPatterns": [
      "Expected patterns for this scenario that were NOT demonstrated",
      "Example: 'DEMANDING scenario but owner never addressed daily update request'"
    ],
    "conversationFlow": "smooth" | "interrupted" | "one_sided" | "incomplete",
    "overallConfidence": "high" | "medium" | "low"
  },
  
  "extractionNotes": {
    "strengths": ["What the owner handled well in this conversation"],
    "weaknesses": ["What the owner struggled with or avoided"],
    "suggestions": ["What owner should practice in future simulations"]
  }
}`;

  const customInstructions = `
You are analyzing a training simulation between a BUSINESS OWNER and an AI playing a DIFFICULT CLIENT.

Your task: Extract the BUSINESS OWNER'S patterns, criteria, and decision-making logic.

CRITICAL PERSPECTIVE RULES:

🎯 ALWAYS ASK: "Is this the OWNER'S perspective or the CUSTOMER'S perspective?"

Example 1 - Deal-Breakers:
Customer says: "Your spelling concerns me about detail orientation"
Owner says: "I have spelling issues, does it relate to construction?"

❌ WRONG: dealBreaker: "spelling_concerns_about_detail"
   (This is the customer's complaint about the owner)

✅ RIGHT: redFlag: "not_demonstrated"
   (Owner didn't treat customer's concern as a deal-breaker)
   
extractionNotes.weaknesses: ["Owner became defensive about spelling criticism rather than addressing it professionally"]

Example 2 - Decision Making:
Customer asks 7 questions about portfolio, references, daily updates
Owner answers 2, ignores 5, conversation ends abruptly

❌ WRONG: whenToSayNo: ["daily_communication_demands", "portfolio_requests"]
   (Owner never said no, just didn't answer)

✅ RIGHT: 
   whenToSayNo: ["not_demonstrated"]
   conversationQuality.unansweredQuestions: [
     "Can you provide references and portfolio today?",
     "What's your approach to daily communication?",
     ...
   ]
   extractionNotes.weaknesses: ["Owner avoided answering difficult questions"]

Example 3 - Grammar/Spelling:
Owner says: "we are profssionals with 15 years exprince"

❌ WRONG: keyPhrases: ["we are profssionals with 15 years exprince"]
   (Copies spelling errors verbatim)

✅ RIGHT: keyPhrases: ["emphasizes professionalism and extensive experience"]
   (Captures intent without grammar errors)

CONVERSATION TRANSCRIPT:
${transcript}

INDUSTRY CONTEXT:
- Industry: ${industry}
- Scenario Type: ${scenarioType}

EXTRACTION INSTRUCTIONS:

1. COMMUNICATION STYLE
   - Extract the INTENT and TONE, not verbatim text
   - If owner has spelling errors, capture meaning instead
   - Identify owner's natural response patterns
   - Note formality level and emotional tone

2. PRICING LOGIC
   - What budget ranges did owner mention?
   - When did owner show flexibility vs. firmness?
   - What pricing-related reasons would make owner reject a client?
   - How confidently does owner discuss money?

3. QUALIFICATION CRITERIA
   
   MUST-HAVES: Things owner REQUIRES from clients
   - Look for: "You need to...", "We require...", "It's important that..."
   - If owner never stated requirements → confidence: "not_demonstrated"
   
   DEAL-BREAKERS: Reasons owner REJECTS clients
   - Look for: Owner says NO, declines, ends conversation
   - Example: "We can't work with that budget" or "That timeline won't work"
   - If owner never rejected anything → confidence: "not_demonstrated"
   - DO NOT include customer's complaints about owner
   
   GREEN FLAGS: Client behaviors that EXCITED the owner
   - Look for: Owner responds enthusiastically, gets engaged
   - Example: Customer mentions big budget → owner says "Great! Let's discuss"
   
   RED FLAGS: Client behaviors that made owner HESITANT
   - Look for: Owner pauses, asks follow-up questions, becomes cautious
   - Example: Customer demands daily updates → owner doesn't commit
   - This is about OWNER'S reaction, NOT customer criticizing owner

4. OBJECTION HANDLING
   - How did owner respond to price concerns?
   - How did owner handle timeline questions?
   - How did owner react to criticism?
   - What objections did owner NOT address?

5. DECISION-MAKING PATTERNS
   
   WHEN TO SAY YES:
   - Only include if owner ACTUALLY accepted or showed clear willingness
   - Example: "Let's do it", "I'd love to work with you", "Let's schedule"
   - If owner never clearly accepted → confidence: "not_demonstrated"
   
   WHEN TO SAY NO:
   - Only include if owner ACTUALLY rejected or declined
   - Example: "We can't do that", "That won't work for us", "Not a good fit"
   - If owner never clearly rejected → confidence: "not_demonstrated"
   
   WARNING SIGNS:
   - What made owner pause or become cautious?
   - Internal warning signs owner watches for

6. CONVERSATION QUALITY ASSESSMENT
   
   UNANSWERED QUESTIONS:
   - List every customer question owner didn't address
   - Be specific - include the actual question text
   
   RESOLUTION CHECK:
   - Did conversation end with clear next steps?
   - Did owner accept, reject, or schedule follow-up?
   - Or did it end abruptly without resolution?
   
   COMPLETENESS SCORE:
   - 100: All questions answered, clear resolution, good flow
   - 75-99: Most questions answered, has resolution
   - 50-74: Some questions unanswered, weak resolution
   - 25-49: Many questions unanswered, no clear resolution
   - 0-24: Incomplete conversation, owner avoided difficult topics
   
   MISSING PATTERNS:
   - For ${scenarioType} scenario, what should have been demonstrated?
   - Example: DEMANDING scenario should show how owner handles pushy clients
   - If owner avoided addressing demanding behavior → note this

7. EXTRACTION NOTES
   
   STRENGTHS: What owner did well
   - Example: "Clearly stated budget requirements"
   - Example: "Maintained professional tone under criticism"
   
   WEAKNESSES: What owner struggled with
   - Example: "Avoided answering questions about portfolio"
   - Example: "Became defensive when criticized"
   
   SUGGESTIONS: What to practice next
   - Example: "Practice confidently declining unrealistic demands"
   - Example: "Practice providing references and portfolio samples"

CRITICAL REMINDERS:

✅ Extract INTENT, not verbatim text (grammar cleanup)
✅ Only mark as "demonstrated" if owner ACTUALLY did it
✅ Distinguish owner's criteria from customer's complaints
✅ List unanswered questions explicitly
✅ Assess conversation completeness honestly
✅ Provide constructive feedback in extractionNotes

❌ DO NOT copy spelling/grammar errors
❌ DO NOT confuse customer complaints with owner deal-breakers
❌ DO NOT say owner "rejects X" if they never rejected anything
❌ DO NOT assume patterns that weren't demonstrated

OUTPUT FORMAT:
Return ONLY valid JSON matching the schema above.
No markdown formatting, no explanations, just the JSON.
`;

  return buildPrompt({
    role: PATTERN_EXTRACTION_SYSTEM_PROMPT,
    customInstructions,
    outputFormat: 'json',
    jsonSchema
  });
}
```

---

### **Task 1.2: Update TypeScript Types**

**File:** `lib/types/business-profile.ts`

```typescript
// lib/types/business-profile.ts

// Add confidence metadata to existing types
export interface QualificationCriteria {
  mustHaves: string[];
  dealBreakers: string[];
  greenFlags: string[];
  redFlags: string[];
  confidence: {
    mustHaves: 'high' | 'medium' | 'low' | 'not_demonstrated';
    dealBreakers: 'high' | 'medium' | 'low' | 'not_demonstrated';
    greenFlags: 'high' | 'medium' | 'low';
    redFlags: 'high' | 'medium' | 'low';
  };
}

export interface DecisionMakingPatterns {
  whenToSayYes: string[];
  whenToSayNo: string[];
  warningSignsToWatch: string[];
  decisionSpeed?: string;
  confidence: {
    whenToSayYes: 'high' | 'medium' | 'low' | 'not_demonstrated';
    whenToSayNo: 'high' | 'medium' | 'low' | 'not_demonstrated';
  };
}

// NEW: Conversation quality metadata
export interface ConversationQuality {
  unansweredQuestions: string[];
  hasResolution: boolean;
  resolutionType: 'accepted' | 'rejected' | 'scheduled_followup' | 'none';
  completenessScore: number;
  missingPatterns: string[];
  conversationFlow: 'smooth' | 'interrupted' | 'one_sided' | 'incomplete';
  overallConfidence: 'high' | 'medium' | 'low';
}

// NEW: Extraction feedback
export interface ExtractionNotes {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// Update main interface
export interface ExtractedPatterns {
  communicationStyle: CommunicationStyle;
  pricingLogic: PricingLogic;
  qualificationCriteria: QualificationCriteria;
  objectionHandling: ObjectionHandling;
  decisionMakingPatterns: DecisionMakingPatterns;
  conversationQuality: ConversationQuality;  // NEW
  extractionNotes: ExtractionNotes;          // NEW
  knowledgeBase?: KnowledgeBase;
}
```

---

### **Task 1.3: Update Zod Validation Schemas**

**File:** `lib/validation/pattern-schemas.ts`

```typescript
// lib/validation/pattern-schemas.ts

export const QualificationCriteriaSchema = z.object({
  mustHaves: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  greenFlags: z.array(z.string()),
  redFlags: z.array(z.string()),
  confidence: z.object({
    mustHaves: z.enum(['high', 'medium', 'low', 'not_demonstrated']),
    dealBreakers: z.enum(['high', 'medium', 'low', 'not_demonstrated']),
    greenFlags: z.enum(['high', 'medium', 'low']),
    redFlags: z.enum(['high', 'medium', 'low'])
  })
});

export const DecisionMakingPatternsSchema = z.object({
  whenToSayYes: z.array(z.string()),
  whenToSayNo: z.array(z.string()),
  warningSignsToWatch: z.array(z.string()),
  decisionSpeed: z.string().optional(),
  confidence: z.object({
    whenToSayYes: z.enum(['high', 'medium', 'low', 'not_demonstrated']),
    whenToSayNo: z.enum(['high', 'medium', 'low', 'not_demonstrated'])
  })
});

export const ConversationQualitySchema = z.object({
  unansweredQuestions: z.array(z.string()),
  hasResolution: z.boolean(),
  resolutionType: z.enum(['accepted', 'rejected', 'scheduled_followup', 'none']),
  completenessScore: z.number().min(0).max(100),
  missingPatterns: z.array(z.string()),
  conversationFlow: z.enum(['smooth', 'interrupted', 'one_sided', 'incomplete']),
  overallConfidence: z.enum(['high', 'medium', 'low'])
});

export const ExtractionNotesSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string())
});

export const ExtractedPatternsSchema = z.object({
  communicationStyle: CommunicationStyleSchema,
  pricingLogic: PricingLogicSchema,
  qualificationCriteria: QualificationCriteriaSchema,
  objectionHandling: ObjectionHandlingSchema,
  decisionMakingPatterns: DecisionMakingPatternsSchema,
  conversationQuality: ConversationQualitySchema,
  extractionNotes: ExtractionNotesSchema,
  knowledgeBase: KnowledgeBaseSchema.optional()
});
```

---

## PHASE 2: Grammar Normalization Layer

**Goal:** Extract intent/meaning, not verbatim spelling errors

**Duration:** 2-3 hours

---

### **Task 2.1: Create Grammar Normalization Function**

**File:** `lib/ai/normalize-patterns.ts`

```typescript
// lib/ai/normalize-patterns.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Normalize grammar and spelling in extracted patterns
 * while preserving meaning, tone, and intent
 */
export async function normalizePatterns(
  rawPatterns: any
): Promise<any> {
  const prompt = `
You are a professional copy editor specializing in preserving authentic voice while fixing technical errors.

TASK: Fix spelling and grammar ONLY. Do NOT change meaning, tone, or style.

INPUT (extracted patterns with potential spelling/grammar errors):
${JSON.stringify(rawPatterns, null, 2)}

RULES:

1. FIX TECHNICAL ERRORS:
   ✅ Fix spelling: "profssionals" → "professionals"
   ✅ Fix grammar: "does it related" → "is it related"
   ✅ Fix typos: "exprince" → "experience"

2. PRESERVE EVERYTHING ELSE:
   ✅ Keep casual tone if casual
   ✅ Keep contractions ("I'm", "we're", "can't")
   ✅ Keep personality and voice
   ✅ Keep sentence structure
   ✅ Keep emphasis and energy

3. SPECIAL CASES:
   
   Intent-based phrases (already cleaned):
   - Input: "emphasizes professionalism and credentials"
   - Output: "emphasizes professionalism and credentials" (no change)
   
   Verbatim quotes with errors:
   - Input: "we are profssionals with 15 years exprince"
   - Output: "we are professionals with 15 years experience"
   
   Casual phrases:
   - Input: "I'm here to change that! We're pros"
   - Output: "I'm here to change that! We're pros" (keep casual)

4. VALIDATION:
   - After fixing, does it still sound like the same person?
   - If yes → good correction
   - If no → you changed too much, revert

EXAMPLES:

Input: "we are profssionals and we have exprince with luxury builds"
Output: "we are professionals and we have experience with luxury builds"

Input: "does it related to constructions quality?"
Output: "is it related to construction quality?"

Input: "I'm here to change it! We are profssionals."
Output: "I'm here to change it! We are professionals."

Input: "emphasizes professionalism and extensive experience"
Output: "emphasizes professionalism and extensive experience" (no change - already intent-based)

OUTPUT:
Return ONLY the corrected JSON.
No markdown formatting, no explanations.
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.1, // Very low for consistent corrections
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  const correctedText = response.content[0].type === 'text'
    ? response.content[0].text
    : '';
  
  const cleaned = correctedText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse normalized patterns:', cleaned);
    // Return original if normalization fails
    return rawPatterns;
  }
}

/**
 * Check if patterns need normalization
 */
export function needsNormalization(patterns: any): boolean {
  const jsonString = JSON.stringify(patterns);
  
  // Common spelling mistakes to detect
  const errorPatterns = [
    /profssionals?/i,
    /exprince/i,
    /constructions/i,
    /schehule/i,
    /secvond/i,
    /simukation/i
  ];
  
  return errorPatterns.some(pattern => pattern.test(jsonString));
}
```

---

### **Task 2.2: Integrate into Extraction Flow**

**Update:** `lib/ai/extract-patterns.ts`

```typescript
// lib/ai/extract-patterns.ts

import { extractPatternsFromSimulation as extractRaw } from './prompts/pattern-extraction';
import { normalizePatterns, needsNormalization } from './normalize-patterns';
import { ExtractedPatternsSchema } from '@/lib/validation/pattern-schemas';

export async function extractPatternsFromSimulation(
  messages: any[],
  industry: string,
  scenarioType: string
): Promise<ExtractedPatterns> {
  // Step 1: Extract raw patterns (may have grammar issues)
  const rawPatterns = await extractRaw(messages, industry, scenarioType);
  
  // Step 2: Check if normalization needed
  let finalPatterns = rawPatterns;
  
  if (needsNormalization(rawPatterns)) {
    console.log('🔧 Normalizing grammar and spelling...');
    finalPatterns = await normalizePatterns(rawPatterns);
  } else {
    console.log('✅ Patterns already clean, skipping normalization');
  }
  
  // Step 3: Validate against schema
  const validated = ExtractedPatternsSchema.parse(finalPatterns);
  
  return validated;
}
```

---

## PHASE 3: Simulation Quality Detection

**Goal:** Prevent extraction from incomplete/poor-quality conversations

**Duration:** 3-4 hours

---

### **Task 3.1: Build Quality Checker**

**File:** `lib/simulations/quality-checker.ts`

```typescript
// lib/simulations/quality-checker.ts

export interface SimulationQualityReport {
  isComplete: boolean;
  completenessScore: number; // 0-100
  issues: QualityIssue[];
  unansweredQuestions: string[];
  hasResolution: boolean;
  resolutionType: 'accepted' | 'rejected' | 'scheduled_followup' | 'none';
  recommendation: 'extract' | 'review' | 'continue' | 'redo';
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

export interface QualityIssue {
  severity: 'critical' | 'warning' | 'info';
  type: 'unanswered_questions' | 'no_resolution' | 'too_short' | 'imbalanced' | 'avoided_scenario';
  message: string;
  details?: any;
}

/**
 * Analyze simulation conversation quality
 */
export function checkSimulationQuality(
  messages: any[],
  scenarioType: string
): SimulationQualityReport {
  const issues: QualityIssue[] = [];
  const unansweredQuestions: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  
  // Separate messages by role
  const customerMessages = messages.filter(m => m.role === 'AI_CLIENT');
  const ownerMessages = messages.filter(m => m.role === 'BUSINESS_OWNER');
  
  // ==========================================
  // CHECK 1: Minimum message count
  // ==========================================
  if (messages.length < 8) {
    issues.push({
      severity: 'critical',
      type: 'too_short',
      message: `Only ${messages.length} messages exchanged (recommended: 8+)`,
      details: { actual: messages.length, minimum: 8 }
    });
    weaknesses.push('Conversation ended too quickly');
    suggestions.push('Practice longer conversations to demonstrate more patterns');
  } else if (messages.length >= 12) {
    strengths.push('Good conversation length with multiple exchanges');
  }
  
  // ==========================================
  // CHECK 2: Identify unanswered questions
  // ==========================================
  customerMessages.forEach((customerMsg, index) => {
    // Check if this message contains a question
    if (customerMsg.content.includes('?')) {
      // Find next owner message after this customer message
      const nextOwnerMsg = ownerMessages.find(m => 
        new Date(m.createdAt) > new Date(customerMsg.content)
      );
      
      if (!nextOwnerMsg) {
        unansweredQuestions.push(customerMsg.content);
      } else {
        // Simple check: does owner's response relate to the question?
        // Extract question keywords
        const questionWords = customerMsg.content
          .toLowerCase()
          .match(/\b(portfolio|reference|experience|timeline|budget|daily|update|material|premium)\b/g);
        
        if (questionWords) {
          const responseContainsKeywords = questionWords.some(word =>
            nextOwnerMsg.content.toLowerCase().includes(word)
          );
          
          if (!responseContainsKeywords) {
            unansweredQuestions.push(customerMsg.content);
          }
        }
      }
    }
  });
  
  if (unansweredQuestions.length > 0) {
    const severity = unansweredQuestions.length >= 5 ? 'critical' : 'warning';
    
    issues.push({
      severity,
      type: 'unanswered_questions',
      message: `${unansweredQuestions.length} customer question(s) went unanswered`,
      details: { count: unansweredQuestions.length, questions: unansweredQuestions }
    });
    
    weaknesses.push(`Left ${unansweredQuestions.length} questions unanswered`);
    suggestions.push('Practice addressing every customer question directly');
  } else {
    strengths.push('Addressed all customer questions');
  }
  
  // ==========================================
  // CHECK 3: Resolution detection
  // ==========================================
  const lastOwnerMessage = ownerMessages[ownerMessages.length - 1];
  const lastContent = lastOwnerMessage?.content.toLowerCase() || '';
  
  let hasResolution = false;
  let resolutionType: 'accepted' | 'rejected' | 'scheduled_followup' | 'none' = 'none';
  
  // Check for acceptance
  const acceptanceKeywords = [
    'let\'s do it', 'sounds good', 'i\'d love to', 
    'we can do that', 'that works', 'perfect'
  ];
  
  // Check for rejection
  const rejectionKeywords = [
    'can\'t do', 'won\'t work', 'not a fit', 
    'unable to', 'can\'t help', 'below our minimum'
  ];
  
  // Check for follow-up
  const followupKeywords = [
    'schedule', 'meeting', 'call', 'discuss',
    'next steps', 'follow up', 'get back to you'
  ];
  
  if (acceptanceKeywords.some(kw => lastContent.includes(kw))) {
    hasResolution = true;
    resolutionType = 'accepted';
    strengths.push('Clearly indicated willingness to work with client');
  } else if (rejectionKeywords.some(kw => lastContent.includes(kw))) {
    hasResolution = true;
    resolutionType = 'rejected';
    strengths.push('Clearly declined the client with explanation');
  } else if (followupKeywords.some(kw => lastContent.includes(kw))) {
    hasResolution = true;
    resolutionType = 'scheduled_followup';
    strengths.push('Moved conversation toward next steps');
  }
  
  if (!hasResolution) {
    issues.push({
      severity: 'critical',
      type: 'no_resolution',
      message: 'Conversation ended without clear resolution (yes/no/next steps)',
      details: { lastMessage: lastContent.substring(0, 100) }
    });
    weaknesses.push('No clear decision or next steps at end');
    suggestions.push('Practice ending with clear decision: accept, decline, or schedule follow-up');
  }
  
  // ==========================================
  // CHECK 4: Conversation balance
  // ==========================================
  const ratio = ownerMessages.length / Math.max(customerMessages.length, 1);
  
  if (ratio < 0.6) {
    issues.push({
      severity: 'warning',
      type: 'imbalanced',
      message: 'Owner responded less than customer asked (might be avoiding)',
      details: { ownerCount: ownerMessages.length, customerCount: customerMessages.length }
    });
    weaknesses.push('Conversation felt one-sided - customer asked more than owner responded');
  } else if (ratio > 1.5) {
    issues.push({
      severity: 'info',
      type: 'imbalanced',
      message: 'Owner dominated conversation (might be over-explaining)',
      details: { ownerCount: ownerMessages.length, customerCount: customerMessages.length }
    });
  } else {
    strengths.push('Good back-and-forth balance in conversation');
  }
  
  // ==========================================
  // CHECK 5: Scenario-specific validation
  // ==========================================
  const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
  
  switch (scenarioType) {
    case 'PRICE_SENSITIVE':
      if (!allContent.includes('budget') && !allContent.includes('price') && !allContent.includes('cost')) {
        issues.push({
          severity: 'warning',
          type: 'avoided_scenario',
          message: 'PRICE_SENSITIVE scenario but pricing was barely discussed',
        });
        weaknesses.push('Avoided discussing pricing despite price-sensitive scenario');
        suggestions.push('Practice negotiating price and discussing budget constraints');
      }
      break;
      
    case 'DEMANDING':
      const demandingKeywords = ['daily', 'update', 'reference', 'portfolio', 'premium', 'luxury'];
      const mentionedDemands = demandingKeywords.filter(kw => allContent.includes(kw));
      
      if (mentionedDemands.length < 2) {
        issues.push({
          severity: 'warning',
          type: 'avoided_scenario',
          message: 'DEMANDING scenario but client\'s demands were not fully addressed',
        });
        weaknesses.push('Did not engage with demanding client\'s specific requirements');
        suggestions.push('Practice addressing demanding requests directly (references, portfolio, daily updates)');
      }
      break;
      
    case 'INDECISIVE':
      if (!allContent.includes('decide') && !allContent.includes('think') && !allContent.includes('sure')) {
        issues.push({
          severity: 'warning',
          type: 'avoided_scenario',
          message: 'INDECISIVE scenario but client\'s indecision was not addressed',
        });
        weaknesses.push('Did not help indecisive client reach clarity');
        suggestions.push('Practice guiding uncertain clients toward decision');
      }
      break;
      
    case 'TIME_PRESSURED':
      if (!allContent.includes('timeline') && !allContent.includes('deadline') && !allContent.includes('urgent')) {
        issues.push({
          severity: 'warning',
          type: 'avoided_scenario',
          message: 'TIME_PRESSURED scenario but timeline was not discussed',
        });
        weaknesses.push('Did not address client\'s timeline urgency');
        suggestions.push('Practice setting realistic expectations for tight timelines');
      }
      break;
  }
  
  // ==========================================
  // CALCULATE COMPLETENESS SCORE
  // ==========================================
  let score = 100;
  
  // Deduct for issues
  score -= Math.min(unansweredQuestions.length * 8, 40); // Max -40 for unanswered
  if (!hasResolution) score -= 25;
  if (messages.length < 8) score -= 20;
  if (ratio < 0.6 || ratio > 1.5) score -= 10;
  
  // Bonus for strengths
  if (messages.length >= 15) score += 5;
  if (hasResolution) score += 5;
  
  score = Math.max(0, Math.min(100, score));
  
  // ==========================================
  // RECOMMENDATION
  // ==========================================
  let recommendation: 'extract' | 'review' | 'continue' | 'redo';
  
  if (score >= 80) {
    recommendation = 'extract';
  } else if (score >= 60) {
    recommendation = 'review';
  } else if (score >= 40) {
    recommendation = 'continue';
  } else {
    recommendation = 'redo';
  }
  
  return {
    isComplete: score >= 75,
    completenessScore: score,
    issues,
    unansweredQuestions,
    hasResolution,
    resolutionType,
    recommendation,
    feedback: {
      strengths,
      weaknesses,
      suggestions
    }
  };
}
```

---

### **Task 3.2: Gate Extraction on Quality**

**Update:** `app/api/v1/simulations/[id]/extract/route.ts`

```typescript
// app/api/v1/simulations/[id]/extract/route.ts

import { checkSimulationQuality } from '@/lib/simulations/quality-checker';

async function handler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  // ... existing validation ...
  
  // NEW: Check simulation quality BEFORE extracting
  const qualityReport = checkSimulationQuality(
    simulation.messages,
    simulation.scenarioType
  );
  
  // Block extraction if quality is too low
  if (qualityReport.recommendation === 'redo') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'SIMULATION_QUALITY_TOO_LOW',
        message: 'This simulation needs more work before we can learn from it',
        qualityReport: {
          score: qualityReport.completenessScore,
          issues: qualityReport.issues.map(i => i.message),
          unansweredQuestions: qualityReport.unansweredQuestions,
          feedback: qualityReport.feedback,
          recommendation: 'Please continue this conversation or start over'
        }
      }
    }, { status: 400 });
  }
  
  // Allow extraction but flag quality concerns
  if (qualityReport.recommendation === 'continue' || qualityReport.recommendation === 'review') {
    console.warn(`⚠️ Extracting from medium-quality simulation (score: ${qualityReport.completenessScore})`);
  }
  
  // ... proceed with extraction ...
  
  const extractedPatterns = await extractPatternsFromSimulation(...);
  
  // Merge quality report into extraction
  extractedPatterns.conversationQuality = {
    ...extractedPatterns.conversationQuality,
    completenessScore: qualityReport.completenessScore,
    issues: qualityReport.issues.map(i => i.message),
    feedback: qualityReport.feedback
  };
  
  // ... rest of extraction logic ...
}
```

---

### **Task 3.3: Add Quality Feedback to Simulation Complete**

**Update:** `app/api/v1/simulations/[id]/complete/route.ts`

```typescript
// app/api/v1/simulations/[id]/complete/route.ts

async function handler(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  // ... fetch simulation ...
  
  // Check quality before marking complete
  const qualityReport = checkSimulationQuality(
    simulation.messages,
    simulation.scenarioType
  );
  
  // Update simulation with quality data
  await prisma.simulation.update({
    where: { id: simulationId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      metadata: {
        qualityScore: qualityReport.completenessScore,
        qualityReport: qualityReport
      }
    }
  });
  
  // Return quality feedback to user
  return NextResponse.json({
    success: true,
    data: {
      simulation,
      qualityReport: {
        score: qualityReport.completenessScore,
        isComplete: qualityReport.isComplete,
        recommendation: qualityReport.recommendation,
        feedback: qualityReport.feedback
      }
    }
  });
}
```

---

## PHASE 4: Owner Validation UI (CRITICAL)

**Goal:** Business owner reviews and approves/edits all extracted patterns

**Duration:** 5-6 hours

---

### **Task 4.1: Create Pattern Validation Page**

**File:** `app/(dashboard)/profile/validate/page.tsx`

```typescript
// app/(dashboard)/profile/validate/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, XCircle, Edit2, AlertTriangle, 
  ThumbsUp, ThumbsDown, MessageSquare, TrendingUp,
  HelpCircle, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api/client';

export default function ValidatePatternsPage() {
  const router = useRouter();
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  
  useEffect(() => {
    loadPendingPatterns();
  }, []);
  
  async function loadPendingPatterns() {
    try {
      const data = await api.profile.getPendingValidation();
      setPatterns(data);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleApprove(field: string, value: any) {
    // Mark this field as approved
    await api.profile.approvePattern({ field, value });
    // Reload
    loadPendingPatterns();
  }
  
  async function handleReject(field: string) {
    // Mark for removal
    await api.profile.rejectPattern({ field });
    loadPendingPatterns();
  }
  
  async function handleEdit(field: string, newValue: any) {
    // Save edited value
    await api.profile.editPattern({ field, value: newValue });
    setEditingField(null);
    loadPendingPatterns();
  }
  
  async function handleApproveAll() {
    setSaving(true);
    try {
      await api.profile.approveAllPatterns();
      router.push('/profile?tab=extracted');
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setSaving(false);
    }
  }
  
  async function handleRunMoreSimulations() {
    router.push('/simulations/new');
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!patterns) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>No Patterns to Review</AlertTitle>
          <AlertDescription>
            Complete simulations first, then we'll extract patterns for you to review.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/simulations/new')} className="mt-4">
          Start Your First Simulation
        </Button>
      </div>
    );
  }
  
  const { conversationQuality, extractionNotes } = patterns;
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Review Your Business Patterns</h1>
        <p className="text-gray-600">
          We analyzed your practice conversations. Please review these patterns for accuracy.
        </p>
      </div>
      
      {/* Quality Score Card */}
      <Card className="mb-6 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Conversation Quality</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-blue-600">
                {conversationQuality.completenessScore}%
              </span>
              {conversationQuality.overallConfidence === 'high' && (
                <Badge variant="success" className="text-lg px-3 py-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  High Quality
                </Badge>
              )}
              {conversationQuality.overallConfidence === 'medium' && (
                <Badge variant="warning" className="text-lg px-3 py-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Medium Quality
                </Badge>
              )}
              {conversationQuality.overallConfidence === 'low' && (
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  <XCircle className="h-4 w-4 mr-1" />
                  Needs Improvement
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Feedback Tabs */}
          <Tabs defaultValue="strengths">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strengths">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Strengths ({extractionNotes.strengths.length})
              </TabsTrigger>
              <TabsTrigger value="weaknesses">
                <ThumbsDown className="h-4 w-4 mr-2" />
                Areas to Improve ({extractionNotes.weaknesses.length})
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                <MessageSquare className="h-4 w-4 mr-2" />
                Suggestions ({extractionNotes.suggestions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="strengths" className="mt-4">
              {extractionNotes.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {extractionNotes.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No strengths identified yet. Keep practicing!</p>
              )}
            </TabsContent>
            
            <TabsContent value="weaknesses" className="mt-4">
              {extractionNotes.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {extractionNotes.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-amber-700">
                      <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Great job! No major weaknesses found.</p>
              )}
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-4">
              {extractionNotes.suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {extractionNotes.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-blue-700">
                      <TrendingUp className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">You're doing great! No additional suggestions.</p>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Unanswered Questions Alert */}
          {conversationQuality.unansweredQuestions.length > 0 && (
            <Alert variant="warning" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {conversationQuality.unansweredQuestions.length} Question(s) Went Unanswered
              </AlertTitle>
              <AlertDescription>
                <p className="mb-2">The client asked these questions but didn't get clear answers:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {conversationQuality.unansweredQuestions.slice(0, 5).map((q, i) => (
                    <li key={i} className="text-amber-800">{q}</li>
                  ))}
                </ul>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => router.push(`/simulations/${patterns.simulationId}/continue`)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Continue This Simulation
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Pattern Validation Cards */}
      <div className="space-y-6">
        
        {/* Deal-Breakers Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Deal-Breakers</CardTitle>
            <CardDescription>
              These are reasons you would REJECT a client. Are these accurate?
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patterns.qualificationCriteria.dealBreakers.length > 0 ? (
              <div className="space-y-3">
                {patterns.qualificationCriteria.dealBreakers.map((item, i) => (
                  <PatternItem
                    key={i}
                    value={item}
                    confidence={patterns.qualificationCriteria.confidence.dealBreakers}
                    onApprove={() => handleApprove('dealBreakers', item)}
                    onReject={() => handleReject(`dealBreakers.${i}`)}
                    onEdit={(newValue) => handleEdit(`dealBreakers.${i}`, newValue)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<HelpCircle />}
                title="No Deal-Breakers Detected"
                description="You didn't reject any clients during your practice. This is fine if you're still learning, but eventually you'll need to practice saying NO to bad-fit clients."
                action={
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleRunMoreSimulations}
                  >
                    Practice Saying NO
                  </Button>
                }
              />
            )}
            
            {patterns.qualificationCriteria.confidence.dealBreakers === 'not_demonstrated' && (
              <Alert variant="info" className="mt-4">
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Why No Deal-Breakers?</AlertTitle>
                <AlertDescription>
                  In your practice, you didn't reject any clients or state firm requirements.
                  This is normal for early simulations, but real clients need to know your boundaries.
                  Try a DEMANDING scenario and practice setting limits.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {/* Green Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Green Flags (Ideal Client Signals)</CardTitle>
            <CardDescription>
              These client behaviors make you excited to work with them
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patterns.qualificationCriteria.greenFlags.length > 0 ? (
              <div className="space-y-3">
                {patterns.qualificationCriteria.greenFlags.map((item, i) => (
                  <PatternItem
                    key={i}
                    value={item}
                    confidence={patterns.qualificationCriteria.confidence.greenFlags}
                    variant="success"
                    onApprove={() => handleApprove('greenFlags', item)}
                    onReject={() => handleReject(`greenFlags.${i}`)}
                    onEdit={(newValue) => handleEdit(`greenFlags.${i}`, newValue)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No green flags detected yet. These will emerge as you practice with ideal clients.
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Red Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Red Flags (Warning Signs)</CardTitle>
            <CardDescription>
              These client behaviors make you cautious or hesitant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patterns.qualificationCriteria.redFlags.length > 0 ? (
              <div className="space-y-3">
                {patterns.qualificationCriteria.redFlags.map((item, i) => (
                  <PatternItem
                    key={i}
                    value={item}
                    confidence={patterns.qualificationCriteria.confidence.redFlags}
                    variant="warning"
                    onApprove={() => handleApprove('redFlags', item)}
                    onReject={() => handleReject(`redFlags.${i}`)}
                    onEdit={(newValue) => handleEdit(`redFlags.${i}`, newValue)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No red flags detected yet. These will emerge as you encounter difficult client behaviors.
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Communication Style */}
        <Card>
          <CardHeader>
            <CardTitle>Your Communication Style</CardTitle>
            <CardDescription>
              How you naturally talk with clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Tone:</span>
                <p className="font-medium capitalize">{patterns.communicationStyle.tone}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Style:</span>
                <p className="font-medium capitalize">{patterns.communicationStyle.style}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Formality:</span>
                <p className="font-medium capitalize">{patterns.communicationStyle.formality}</p>
              </div>
            </div>
            
            {patterns.communicationStyle.keyPhrases.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 mb-2 block">Key Themes You Emphasize:</span>
                <div className="flex flex-wrap gap-2">
                  {patterns.communicationStyle.keyPhrases.map((phrase, i) => (
                    <Badge key={i} variant="secondary">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Pricing Logic */}
        <Card>
          <CardHeader>
            <CardTitle>Your Pricing Approach</CardTitle>
            <CardDescription>
              How you handle budget discussions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patterns.pricingLogic.minBudget && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Minimum budget: ${patterns.pricingLogic.minBudget.toLocaleString()}</span>
                </div>
              )}
              {patterns.pricingLogic.maxBudget && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Maximum budget: ${patterns.pricingLogic.maxBudget.toLocaleString()}</span>
                </div>
              )}
              {patterns.pricingLogic.typicalRange && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Typical range: {patterns.pricingLogic.typicalRange}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 sticky bottom-4 bg-white p-4 border-t shadow-lg rounded-lg">
        <Button 
          onClick={handleApproveAll} 
          size="lg"
          disabled={saving}
          className="flex-1"
        >
          {saving ? 'Saving...' : 'Approve & Save All Patterns'}
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleRunMoreSimulations}
          className="flex-1"
        >
          Run More Simulations
        </Button>
      </div>
    </div>
  );
}

// Component: Individual Pattern Item
function PatternItem({ 
  value, 
  confidence, 
  variant = 'default',
  onApprove, 
  onReject, 
  onEdit 
}: {
  value: string;
  confidence: string;
  variant?: 'default' | 'success' | 'warning';
  onApprove: () => void;
  onReject: () => void;
  onEdit: (newValue: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  
  const getBorderColor = () => {
    if (variant === 'success') return 'border-green-200 bg-green-50';
    if (variant === 'warning') return 'border-amber-200 bg-amber-50';
    return 'border-gray-200';
  };
  
  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${getBorderColor()}`}>
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <Button 
              size="sm"
              onClick={() => {
                onEdit(editValue);
                setIsEditing(false);
              }}
            >
              Save
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                setEditValue(value);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <span className="text-sm">{value.replace(/_/g, ' ')}</span>
            {confidence === 'low' && (
              <Badge variant="outline" className="ml-2 text-xs">
                Low Confidence
              </Badge>
            )}
            {confidence === 'not_demonstrated' && (
              <Badge variant="outline" className="ml-2 text-xs">
                Not Yet Demonstrated
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-green-600 hover:text-green-700"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Correct
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-red-600 hover:text-red-700"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Wrong
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Component: Empty State
function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <div className="flex justify-center mb-3 text-gray-400">
        {icon}
      </div>
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  );
}
```

---

### **Task 4.2: Add Validation API Endpoints**

**File:** `app/api/v1/profile/validate/route.ts`

```typescript
// app/api/v1/profile/validate/route.ts

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';

/**
 * GET /api/v1/profile/validate
 * Get pending patterns for owner validation
 */
async function getHandler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  
  try {
    // Get most recent extraction awaiting validation
    const pendingSimulation = await prisma.simulation.findFirst({
      where: {
        tenantId,
        status: 'COMPLETED',
        extractedPatterns: { not: null },
        validatedAt: null // Not yet validated
      },
      orderBy: { completedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!pendingSimulation) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No patterns awaiting validation'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        simulationId: pendingSimulation.id,
        ...pendingSimulation.extractedPatterns
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_FETCH_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/profile/validate/approve
 * Approve a specific pattern field
 */
async function approveHandler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  const { simulationId, field, value } = await req.json();
  
  // Mark field as approved
  // Store in approved patterns collection
  
  return NextResponse.json({ success: true });
}

/**
 * POST /api/v1/profile/validate/reject
 * Reject a pattern field
 */
async function rejectHandler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  const { simulationId, field } = await req.json();
  
  // Mark field as rejected
  // Remove from extracted patterns
  
  return NextResponse.json({ success: true });
}

/**
 * POST /api/v1/profile/validate/approve-all
 * Approve all patterns and save to BusinessProfile
 */
async function approveAllHandler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  const { simulationId } = await req.json();
  
  const simulation = await prisma.simulation.findUnique({
    where: { id: simulationId, tenantId }
  });
  
  if (!simulation) {
    return NextResponse.json(
      { success: false, error: { code: 'SIMULATION_NOT_FOUND' } },
      { status: 404 }
    );
  }
  
  const extractedPatterns = simulation.extractedPatterns as any;
  
  // Get existing profile
  const existingProfile = await prisma.businessProfile.findUnique({
    where: { tenantId }
  });
  
  // Merge patterns
  const merged = mergePatterns(
    existingProfile,
    extractedPatterns,
    existingProfile.simulationCount + 1
  );
  
  // Update profile
  await prisma.businessProfile.update({
    where: { tenantId },
    data: {
      ...merged,
      simulationCount: existingProfile.simulationCount + 1,
      lastExtractedAt: new Date()
    }
  });
  
  // Mark simulation as validated
  await prisma.simulation.update({
    where: { id: simulationId },
    data: { validatedAt: new Date() }
  });
  
  return NextResponse.json({ success: true });
}

export const GET = withAuth(getHandler);
export const POST = withAuth(approveAllHandler);
```

---

## PHASE 5: Multi-Simulation Confidence System

**Goal:** Require 3+ simulations for reliable patterns, show confidence scores

**Duration:** 3 hours

---

### **Task 5.1: Enhanced Pattern Merging with Confidence**

**Update:** `lib/ai/merge-patterns.ts`

```typescript
// lib/ai/merge-patterns.ts

import type { ExtractedPatterns } from '@/lib/types/business-profile';

interface PatternOccurrence {
  value: string;
  count: number;
  firstSeen: string; // simulationId
  lastSeen: string;  // simulationId
  scenarios: string[]; // Which scenarios demonstrated this
}

/**
 * Merge patterns with confidence-based filtering
 */
export function mergePatterns(
  existing: ExtractedPatterns | null,
  newPatterns: ExtractedPatterns,
  totalSimulationCount: number
): ExtractedPatterns {
  // First simulation - everything is low confidence
  if (!existing || totalSimulationCount === 1) {
    return {
      ...newPatterns,
      _metadata: {
        confidence: 'low',
        simulationCount: 1,
        reliability: 'Need 2+ more simulations for reliable patterns',
        note: 'Patterns from single conversation - may not be representative'
      }
    };
  }
  
  // Merge with confidence scoring
  return {
    communicationStyle: mergeCommunicationStyle(existing, newPatterns),
    pricingLogic: mergePricingLogic(existing, newPatterns),
    qualificationCriteria: mergeQualificationCriteria(
      existing, 
      newPatterns, 
      totalSimulationCount
    ),
    objectionHandling: mergeObjectionHandling(existing, newPatterns),
    decisionMakingPatterns: mergeDecisionMakingPatterns(
      existing,
      newPatterns,
      totalSimulationCount
    ),
    conversationQuality: newPatterns.conversationQuality, // Latest quality score
    extractionNotes: newPatterns.extractionNotes, // Latest feedback
    _metadata: {
      confidence: calculateOverallConfidence(totalSimulationCount),
      simulationCount: totalSimulationCount,
      reliability: getReliabilityMessage(totalSimulationCount)
    }
  };
}

function mergeQualificationCriteria(
  existing: any,
  newData: any,
  totalSims: number
): any {
  return {
    mustHaves: mergeArrayWithConfidence(
      existing.qualificationCriteria?.mustHaves || [],
      newData.qualificationCriteria.mustHaves,
      totalSims
    ),
    dealBreakers: mergeArrayWithConfidence(
      existing.qualificationCriteria?.dealBreakers || [],
      newData.qualificationCriteria.dealBreakers,
      totalSims
    ),
    greenFlags: mergeArrayWithConfidence(
      existing.qualificationCriteria?.greenFlags || [],
      newData.qualificationCriteria.greenFlags,
      totalSims
    ),
    redFlags: mergeArrayWithConfidence(
      existing.qualificationCriteria?.redFlags || [],
      newData.qualificationCriteria.redFlags,
      totalSims
    ),
    confidence: {
      mustHaves: calculateConfidence(
        existing.qualificationCriteria?.mustHaves || [],
        newData.qualificationCriteria.mustHaves,
        totalSims
      ),
      dealBreakers: calculateConfidence(
        existing.qualificationCriteria?.dealBreakers || [],
        newData.qualificationCriteria.dealBreakers,
        totalSims
      ),
      greenFlags: calculateConfidence(
        existing.qualificationCriteria?.greenFlags || [],
        newData.qualificationCriteria.greenFlags,
        totalSims
      ),
      redFlags: calculateConfidence(
        existing.qualificationCriteria?.redFlags || [],
        newData.qualificationCriteria.redFlags,
        totalSims
      )
    }
  };
}

/**
 * Merge arrays with confidence filtering
 * Only include items seen in 2+ simulations if we have 3+ total
 */
function mergeArrayWithConfidence(
  existingArray: string[],
  newArray: string[],
  totalSims: number
): string[] {
  // Track occurrences
  const occurrences = new Map<string, number>();
  
  existingArray.forEach(item => {
    occurrences.set(item, (occurrences.get(item) || 0) + 1);
  });
  
  newArray.forEach(item => {
    occurrences.set(item, (occurrences.get(item) || 0) + 1);
  });
  
  // Filter based on confidence threshold
  if (totalSims >= 3) {
    // Require patterns to appear in at least 2 simulations
    return Array.from(occurrences.entries())
      .filter(([_, count]) => count >= 2)
      .map(([item, _]) => item);
  }
  
  // For 1-2 simulations, keep everything but flag as low confidence
  return Array.from(occurrences.keys());
}

function calculateConfidence(
  existingArray: string[],
  newArray: string[],
  totalSims: number
): 'high' | 'medium' | 'low' | 'not_demonstrated' {
  const merged = new Set([...existingArray, ...newArray]);
  
  if (merged.size === 0) {
    return 'not_demonstrated';
  }
  
  if (totalSims >= 5) return 'high';
  if (totalSims >= 3) return 'medium';
  return 'low';
}

function calculateOverallConfidence(count: number): 'low' | 'medium' | 'high' {
  if (count >= 5) return 'high';
  if (count >= 3) return 'medium';
  return 'low';
}

function getReliabilityMessage(count: number): string {
  if (count >= 5) {
    return 'High confidence - patterns confirmed across multiple scenarios';
  }
  if (count >= 3) {
    return 'Medium confidence - patterns emerging, 2 more simulations recommended';
  }
  return `Low confidence - need ${3 - count} more simulation(s) for reliable patterns`;
}
```

---

### **Task 5.2: Display Confidence in UI**

**Update:** `app/(dashboard)/profile/page.tsx` (Extracted Patterns tab)

```typescript
// Show confidence warnings

{completionPercentage > 20 && (
  <Alert 
    variant={
      metadata.confidence === 'high' ? 'default' : 
      metadata.confidence === 'medium' ? 'warning' : 
      'destructive'
    }
  >
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>
      {metadata.confidence === 'high' && '✅ High Confidence Patterns'}
      {metadata.confidence === 'medium' && '⚠️ Medium Confidence Patterns'}
      {metadata.confidence === 'low' && '🔴 Low Confidence - Need More Data'}
    </AlertTitle>
    <AlertDescription>
      {metadata.reliability}
      {metadata.confidence !== 'high' && (
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2"
          onClick={() => router.push('/simulations/new')}
        >
          Complete More Simulations
        </Button>
      )}
    </AlertDescription>
  </Alert>
)}
```

---

## PHASE 6: Simulation UX Improvements

**Goal:** Make simulations engaging, guide users to completion, provide real-time feedback

**Duration:** 6-7 hours

---

### **Task 6.1: Real-Time Quality Indicator During Simulation**

**Create:** `components/simulation/QualityIndicator.tsx`

```typescript
// components/simulation/QualityIndicator.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

interface QualityIndicatorProps {
  messages: any[];
  scenarioType: string;
}

export function QualityIndicator({ messages, scenarioType }: QualityIndicatorProps) {
  const [score, setScore] = useState(0);
  const [issues, setIssues] = useState<string[]>([]);
  
  useEffect(() => {
    // Calculate live quality score
    let currentScore = 0;
    const currentIssues: string[] = [];
    
    // Message count
    if (messages.length >= 8) {
      currentScore += 30;
    } else {
      currentIssues.push(`${8 - messages.length} more messages recommended`);
    }
    
    // Balance
    const ownerCount = messages.filter(m => m.role === 'BUSINESS_OWNER').length;
    const aiCount = messages.filter(m => m.role === 'AI_CLIENT').length;
    const ratio = ownerCount / Math.max(aiCount, 1);
    
    if (ratio >= 0.7 && ratio <= 1.3) {
      currentScore += 20;
    } else if (ratio < 0.7) {
      currentIssues.push('Respond more to client questions');
    }
    
    // Unanswered questions (simple check)
    const questions = messages.filter(m => 
      m.role === 'AI_CLIENT' && m.content.includes('?')
    );
    const unanswered = questions.filter((q, i) => {
      const nextOwner = messages.find(m => 
        m.role === 'BUSINESS_OWNER' && m.createdAt > q.createdAt
      );
      return !nextOwner;
    });
    
    if (unanswered.length === 0) {
      currentScore += 30;
    } else {
      currentIssues.push(`${unanswered.length} unanswered question(s)`);
    }
    
    // Scenario-specific
    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    
    switch (scenarioType) {
      case 'PRICE_SENSITIVE':
        if (allText.includes('budget') || allText.includes('price')) {
          currentScore += 20;
        } else {
          currentIssues.push('Discuss pricing/budget');
        }
        break;
      case 'DEMANDING':
        if (allText.includes('portfolio') || allText.includes('reference')) {
          currentScore += 20;
        } else {
          currentIssues.push('Address demands for portfolio/references');
        }
        break;
    }
    
    setScore(currentScore);
    setIssues(currentIssues);
  }, [messages, scenarioType]);
  
  return (
    <Card className="p-4 sticky top-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Conversation Quality</h3>
        <Badge variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'destructive'}>
          {score}%
        </Badge>
      </div>
      
      <Progress value={score} className="h-2 mb-3" />
      
      <div className="space-y-2 text-sm">
        {score >= 80 && (
          <div className="flex items-start gap-2 text-green-700">
            <CheckCircle className="h-4 w-4 mt-0.5" />
            <span>Great job! Ready to complete.</span>
          </div>
        )}
        
        {issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-2 text-amber-700">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{issue}</span>
          </div>
        ))}
        
        {score < 50 && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
            💡 Keep going! Have a full conversation to extract useful patterns.
          </div>
        )}
      </div>
    </Card>
  );
}
```

---

### **Task 6.2: Guided Scenario Instructions**

**Create:** `components/simulation/ScenarioGuide.tsx`

```typescript
// components/simulation/ScenarioGuide.tsx

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, AlertCircle } from 'lucide-react';

interface ScenarioGuideProps {
  scenarioType: string;
  isActive: boolean;
}

export function ScenarioGuide({ scenarioType, isActive }: ScenarioGuideProps) {
  const guides = {
    PRICE_SENSITIVE: {
      title: 'Price-Sensitive Client Scenario',
      objective: 'Practice discussing budget constraints and justifying your value',
      tips: [
        'Be clear about your pricing early',
        'Explain value vs. cost',
        'Stay firm on minimums but show flexibility where appropriate',
        'Don\'t apologize for your rates'
      ],
      watchFor: [
        'Client asking for discounts',
        'Budget concerns',
        'Comparing you to cheaper competitors'
      ]
    },
    DEMANDING: {
      title: 'Demanding Client Scenario',
      objective: 'Practice setting boundaries with high-expectation clients',
      tips: [
        'Address their concerns professionally',
        'Set realistic expectations',
        'Explain your process and why it works',
        'Be willing to say no to unrealistic demands'
      ],
      watchFor: [
        'Requests for daily updates',
        'Portfolio and reference requests',
        'Premium material demands',
        'Aggressive timelines'
      ]
    },
    INDECISIVE: {
      title: 'Indecisive Client Scenario',
      objective: 'Practice guiding uncertain clients toward clarity',
      tips: [
        'Ask questions to uncover real concerns',
        'Break down big decisions into smaller steps',
        'Provide reassurance without pressure',
        'Suggest next steps to move forward'
      ],
      watchFor: [
        'Uncertainty about timing',
        'Budget indecision',
        'Comparing multiple options',
        'Hesitation to commit'
      ]
    },
    TIME_PRESSURED: {
      title: 'Time-Pressured Client Scenario',
      objective: 'Practice managing urgent timeline requests',
      tips: [
        'Acknowledge their urgency',
        'Set realistic timelines',
        'Explain what\'s possible vs. what\'s not',
        'Don\'t over-commit to impossible deadlines'
      ],
      watchFor: [
        'Unrealistic deadline requests',
        'Pressure to start immediately',
        'Rush decisions',
        'Corner-cutting suggestions'
      ]
    },
    HIGH_BUDGET: {
      title: 'High-Budget Client Scenario',
      objective: 'Practice showcasing premium value and expertise',
      tips: [
        'Match their sophistication level',
        'Discuss premium materials and processes',
        'Show confidence in your capabilities',
        'Focus on quality and outcomes'
      ],
      watchFor: [
        'Luxury material requests',
        'Complex project requirements',
        'High expectations',
        'References to premium work'
      ]
    }
  };
  
  const guide = guides[scenarioType];
  
  if (!isActive || !guide) return null;
  
  return (
    <Alert className="mb-4">
      <Target className="h-4 w-4" />
      <AlertTitle>{guide.title}</AlertTitle>
      <AlertDescription>
        <p className="font-medium mb-2">🎯 Objective: {guide.objective}</p>
        
        <div className="mt-3">
          <p className="text-xs font-medium mb-1 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Tips for this scenario:
          </p>
          <ul className="text-xs space-y-1 ml-4">
            {guide.tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-3">
          <p className="text-xs font-medium mb-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Watch for:
          </p>
          <div className="flex flex-wrap gap-1">
            {guide.watchFor.map((item, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

---

### **Task 6.3: Pre-Completion Checklist**

**Update:** `app/(dashboard)/simulations/[id]/page.tsx`

```typescript
// When user clicks "Complete Simulation", show checklist first

async function handleCompleteAttempt() {
  // Run quality check
  const quality = checkSimulationQuality(messages, scenarioType);
  
  if (quality.completenessScore < 60) {
    // Show warning modal
    setShowCompletionWarning(true);
    setQualityReport(quality);
  } else {
    // Proceed with completion
    await completeSimulation();
  }
}

// Completion Warning Modal
<Dialog open={showCompletionWarning} onOpenChange={setShowCompletionWarning}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Conversation Seems Incomplete</DialogTitle>
      <DialogDescription>
        This simulation could be improved before extracting patterns.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Quality Score: {qualityReport?.completenessScore}%</p>
        <Progress value={qualityReport?.completenessScore} />
      </div>
      
      {qualityReport?.issues.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Issues Found:</p>
          <ul className="text-sm space-y-1">
            {qualityReport.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {qualityReport?.feedback.suggestions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Suggestions:</p>
          <ul className="text-sm space-y-1">
            {qualityReport.feedback.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowCompletionWarning(false)}>
        Continue Conversation
      </Button>
      <Button onClick={async () => {
        await completeSimulation();
        setShowCompletionWarning(false);
      }}>
        Complete Anyway
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### **Task 6.4: Post-Simulation Feedback**

**Create:** `app/(dashboard)/simulations/[id]/feedback/page.tsx`

```typescript
// Shown immediately after completing simulation

export default function SimulationFeedbackPage({ params }: { params: { id: string } }) {
  const [feedback, setFeedback] = useState(null);
  
  useEffect(() => {
    loadFeedback();
  }, []);
  
  async function loadFeedback() {
    const data = await api.simulations.getFeedback(params.id);
    setFeedback(data);
  }
  
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Simulation Complete! 🎉</h1>
      <p className="text-gray-600 mb-6">
        Here's how you did in this {feedback?.scenarioType} scenario:
      </p>
      
      {/* Quality Score */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Performance</h2>
          <div className="text-4xl font-bold text-blue-600">
            {feedback?.qualityScore}%
          </div>
        </div>
        <Progress value={feedback?.qualityScore} className="h-3" />
      </Card>
      
      {/* Strengths */}
      {feedback?.strengths.length > 0 && (
        <Card className="p-6 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            What You Did Well
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-green-700">
                <span>✅</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      
      {/* Areas to Improve */}
      {feedback?.weaknesses.length > 0 && (
        <Card className="p-6 mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-amber-700">
                <span>⚠️</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      
      {/* Next Steps */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Next Steps</h3>
        <div className="space-y-3">
          {feedback?.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Button onClick={() => router.push('/simulations/new')}>
          Start Another Simulation
        </Button>
        <Button variant="outline" onClick={() => router.push('/profile/validate')}>
          Review Extracted Patterns
        </Button>
      </div>
    </div>
  );
}
```

---

## Implementation Order & Timeline

### **Week 1: Critical Path (Phases 1-3)**
- **Day 1-2:** Phase 1 - Fix extraction logic (4-5 hours)
- **Day 3:** Phase 2 - Grammar normalization (2-3 hours)
- **Day 4-5:** Phase 3 - Quality detection (3-4 hours)

### **Week 2: Validation & Confidence (Phases 4-5)**
- **Day 1-3:** Phase 4 - Validation UI (5-6 hours)
- **Day 4-5:** Phase 5 - Confidence system (3 hours)

### **Week 3: UX Polish (Phase 6)**
- **Day 1-3:** Phase 6 - Simulation UX improvements (6-7 hours)
- **Day 4-5:** Testing & refinement

---

## Testing Strategy

### **Test Each Phase:**

**Phase 1 Test:**
```bash
# Use your actual buggy conversation
# Run extraction
# Verify: dealBreakers != customer complaints
# Verify: Grammar corrected
# Verify: Unanswered questions detected
```

**Phase 2 Test:**
```bash
# Simulate conversation with spelling errors
# Run normalization
# Verify: "profssionals" → "professionals"
# Verify: Intent preserved
```

**Phase 3 Test:**
```bash
# Create incomplete simulation (4 messages)
# Try to extract
# Verify: Blocked with quality report
# Verify: Suggestions provided
```

**Phase 4 Test:**
```bash
# Complete simulation
# Go to /profile/validate
# Verify: Patterns shown for review
# Approve/reject patterns
# Verify: Saved correctly
```

**Phase 5 Test:**
```bash
# Complete 1 simulation → low confidence
# Complete 3 simulations → medium confidence
# Complete 5 simulations → high confidence
# Verify: Patterns filtered correctly
```

**Phase 6 Test:**
```bash
# Start simulation
# Verify: Quality indicator updates live
# Verify: Scenario guide shows
# Try to complete early → warning shown
# Complete properly → feedback shown
```

---

## Success Metrics

After full implementation, measure:

| Metric | Before | Target After |
|--------|--------|--------------|
| **False deal-breakers** | 2/conversation | 0 |
| **Spelling errors in patterns** | 5+ | 0 |
| **Incomplete sims extracted** | 100% | 0% |
| **Patterns requiring owner correction** | Unknown | <20% |
| **Users completing validation** | 0% | >80% |
| **Confidence from 1 sim** | Treated as fact | Marked "low confidence" |
| **Users reaching 3+ sims** | Unknown | >60% |
| **Simulation completion rate** | Unknown | >70% |

---

## End of Master Plan

**This plan provides:**
- ✅ Complete technical fixes for all 6 phases
- ✅ Detailed code implementations
- ✅ Business owner perspective throughout
- ✅ UX improvements for engagement
- ✅ Testing strategy for each phase
- ✅ Timeline and prioritization
- ✅ Success metrics

**Total Implementation Time:** ~20-25 hours across 3 weeks

**Ready for Claude CLI execution in phases!** 🚀
