# Prompt Management System - Complete Architecture

## Executive Summary

This document defines a **centralized, scalable, version-controlled prompt management system** for the SalesBrain AI platform. The system consolidates all AI prompts into a structured library with templates, versioning, testing, and monitoring capabilities.

**Goal:** Create a single source of truth for all AI prompts that enables easy management, A/B testing, localization, and future improvements.

---

## Current State Analysis

### **Existing Prompts (Documented):**

From `03-AI-INTEGRATION.md`, we have **4 major prompt categories**:

1. **Simulation Client Role** (`lib/ai/prompts/simulation.ts`)
   - System prompt: `SIMULATION_CLIENT_SYSTEM_PROMPT`
   - User prompt generator: `generateSimulationPrompt()`
   - Purpose: AI plays difficult client personas
   - Model: Claude Sonnet 4
   - Temperature: 0.8
   - Max tokens: 300

2. **Pattern Extraction** (Will be in `lib/ai/prompts/pattern-extraction.ts`)
   - System prompt: `PATTERN_EXTRACTION_SYSTEM_PROMPT`
   - User prompt generator: `generatePatternExtractionPrompt()`
   - Purpose: Analyze simulations to extract business logic
   - Model: Claude Sonnet 4
   - Temperature: 0.3
   - Max tokens: 2000

3. **Lead Qualification** (Future - Session 12-13)
   - System prompt: `LEAD_QUALIFICATION_SYSTEM_PROMPT`
   - User prompt generator: `generateLeadQualificationPrompt()`
   - Purpose: Engage with real leads using business owner's voice
   - Model: Claude Sonnet 4
   - Temperature: 0.7
   - Max tokens: 200

4. **Conversation Summarization** (Future - Session 14-16)
   - System prompt: `CONVERSATION_SUMMARY_SYSTEM_PROMPT`
   - User prompt generator: `generateConversationSummary()`
   - Purpose: Create executive summaries for business owner
   - Model: Claude Sonnet 4
   - Temperature: 0.5
   - Max tokens: 500

### **Common Patterns Across All Prompts:**

Analyzing the existing prompts reveals these **reusable components**:

1. **Behavior Rules** (appears in simulation, lead qualification)
   - "Stay in character throughout"
   - "Keep responses conversational (2-4 sentences)"
   - "Be realistic and challenging"

2. **Industry Context** (appears in simulation, lead qualification, extraction)
   - Business industry
   - Service description
   - Target client type

3. **Output Format Instructions** (appears in extraction, summarization)
   - "Respond ONLY with valid JSON"
   - "Do not include markdown formatting"
   - Schema definitions

4. **Confidence Guidelines** (appears in lead qualification, summarization)
   - When to escalate to human
   - Uncertainty phrases
   - Confidence scoring

5. **Communication Guidelines** (industry-specific, appears everywhere)
   - Professional language for legal
   - Motivational language for fitness
   - Technical language for consulting

---

## New Architecture Design

### **Directory Structure:**

```
lib/ai/
├── prompts/
│   ├── index.ts                        ← Central registry & exports
│   ├── config.ts                       ← Model configs & versions
│   ├── templates.ts                    ← Reusable prompt components
│   │
│   ├── simulation.ts                   ← Simulation prompts
│   ├── pattern-extraction.ts           ← Analysis prompts
│   ├── lead-qualification.ts           ← Live chat prompts
│   ├── summarization.ts                ← Summary generation
│   ├── intent-detection.ts             ← Intent classification (future)
│   │
│   ├── utils/
│   │   ├── validation.ts               ← Prompt validation utilities
│   │   ├── versioning.ts               ← Version comparison
│   │   └── testing.ts                  ← Prompt testing helpers
│   │
│   └── CHANGELOG.md                    ← Prompt version history
│
├── client.ts                           ← Anthropic API wrapper
└── __tests__/
    └── prompts/
        ├── simulation.test.ts
        ├── pattern-extraction.test.ts
        └── templates.test.ts
```

---

## File-by-File Implementation

### **1. `lib/ai/prompts/config.ts` - Model Configuration & Versions**

```typescript
// lib/ai/prompts/config.ts

/**
 * Central configuration for all AI models and prompt versions
 */

export const AI_MODELS = {
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-haiku-4-20250514',
  OPUS: 'claude-opus-4-20250514'
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

/**
 * Prompt configurations by use case
 */
export interface PromptConfig {
  version: string;
  model: AIModel;
  temperature: number;
  maxTokens: number;
  topP?: number;
  lastUpdated: string;
  description: string;
}

export const PROMPT_CONFIGS: Record<string, PromptConfig> = {
  simulation: {
    version: '1.2.0',
    model: AI_MODELS.SONNET,
    temperature: 0.8,
    maxTokens: 300,
    topP: 0.9,
    lastUpdated: '2026-03-20',
    description: 'AI plays difficult client personas for training'
  },
  
  patternExtraction: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.3,
    maxTokens: 4000,
    lastUpdated: '2026-03-20',
    description: 'Analyzes simulations to extract business patterns'
  },
  
  leadQualification: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.7,
    maxTokens: 200,
    lastUpdated: '2026-03-20',
    description: 'Engages with real leads using business owner voice'
  },
  
  summarization: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.5,
    maxTokens: 500,
    lastUpdated: '2026-03-20',
    description: 'Generates executive summaries of conversations'
  },
  
  intentDetection: {
    version: '1.0.0',
    model: AI_MODELS.HAIKU, // Faster, cheaper for classification
    temperature: 0.2,
    maxTokens: 100,
    lastUpdated: '2026-03-20',
    description: 'Detects user intent from messages'
  }
};

/**
 * Get configuration for a specific prompt type
 */
export function getPromptConfig(type: keyof typeof PROMPT_CONFIGS): PromptConfig {
  return PROMPT_CONFIGS[type];
}

/**
 * Token budgets by use case
 */
export const TOKEN_BUDGETS = {
  simulation: {
    systemPrompt: 800,
    conversationHistory: 2000,
    maxResponse: 300,
    total: 3100
  },
  
  leadQualification: {
    systemPrompt: 1200,
    conversationHistory: 1500,
    maxResponse: 200,
    total: 2900
  },
  
  patternExtraction: {
    systemPrompt: 400,
    transcripts: 4000,
    maxResponse: 2000,
    total: 6400
  },
  
  summarization: {
    systemPrompt: 300,
    conversation: 2000,
    maxResponse: 500,
    total: 2800
  }
} as const;
```

---

### **2. `lib/ai/prompts/templates.ts` - Reusable Components**

```typescript
// lib/ai/prompts/templates.ts

/**
 * Reusable prompt template components
 * 
 * These are building blocks used across multiple prompts to ensure
 * consistency and reduce duplication.
 */

// ============================================
// BEHAVIOR RULES
// ============================================

export const BEHAVIOR_RULES = {
  /**
   * Standard conversational behavior for all AI interactions
   */
  standard: `
- Keep responses conversational and natural (2-4 sentences typically)
- Stay in character throughout the entire conversation
- Be realistic and challenging, not overly agreeable or hostile
- NEVER break character or mention being an AI
- Gradually reveal information (don't dump everything at once)
`.trim(),

  /**
   * Stricter version for role-playing scenarios
   */
  strict: `
- Keep responses conversational and natural (2-4 sentences typically)
- Stay in character throughout the entire conversation
- Be realistic and challenging, not overly agreeable or hostile
- NEVER break character, switch roles, or mention being an AI under ANY circumstances
- Gradually reveal information (don't dump everything at once)
- If confused, ask for clarification while remaining in character
`.trim(),

  /**
   * Professional service tone
   */
  professional: `
- Maintain a professional, helpful tone
- Keep responses concise (2-4 sentences typically)
- Be clear and direct while remaining friendly
- Avoid jargon unless industry-appropriate
`.trim()
};

// ============================================
// OUTPUT FORMATTING
// ============================================

export const OUTPUT_FORMATS = {
  /**
   * JSON output instructions
   */
  json: (schema: string) => `
OUTPUT FORMAT:
Respond ONLY with valid JSON matching this exact structure:
${schema}

CRITICAL:
- No markdown formatting (no \`\`\`json tags)
- No explanations before or after the JSON
- All fields are required unless marked optional
- Use exact field names and types as specified
`.trim(),

  /**
   * Structured text output
   */
  structured: `
OUTPUT FORMAT:
- Be specific and evidence-based
- Support conclusions with examples
- Use clear, professional language
- Organize information logically
`.trim(),

  /**
   * Conversational response
   */
  conversational: `
OUTPUT FORMAT:
- Respond naturally as a human would
- Keep it concise but complete
- Match the tone of the conversation
`.trim()
};

// ============================================
// INDUSTRY CONTEXT
// ============================================

export const INDUSTRY_CONTEXT = {
  /**
   * Generate industry-specific context block
   */
  generate: (industry: string, serviceDescription?: string, targetClient?: string) => `
BUSINESS CONTEXT:
Industry: ${industry}
${serviceDescription ? `Service: ${serviceDescription}` : ''}
${targetClient ? `Target Client: ${targetClient}` : ''}
`.trim(),

  /**
   * Communication style by industry
   */
  communicationStyle: (industry: string): string => {
    const styles: Record<string, string> = {
      legal_services: `
- Use precise, professional language
- Reference relevant legal concepts when appropriate
- Maintain attorney-client confidentiality tone
- Be thorough and detail-oriented
`.trim(),

      fitness_coaching: `
- Use motivational, energetic language
- Reference health benefits and achievable goals
- Maintain supportive, encouraging tone
- Balance empathy with accountability
`.trim(),

      mortgage_advisory: `
- Use clear, educational language for financial concepts
- Reference rates, terms, and requirements accurately
- Maintain trustworthy, authoritative tone
- Balance transparency with encouragement
`.trim(),

      business_consulting: `
- Use strategic, results-oriented language
- Reference business metrics and ROI
- Maintain professional, confident tone
- Balance directness with relationship-building
`.trim(),

      interior_design: `
- Use creative, visual language
- Reference style, aesthetics, and functionality
- Maintain enthusiastic, professional tone
- Balance artistic vision with practical constraints
`.trim(),

      real_estate: `
- Use informative, market-aware language
- Reference location, value, and investment potential
- Maintain knowledgeable, trustworthy tone
- Balance excitement with realism
`.trim(),

      financial_advisory: `
- Use precise, data-driven language
- Reference financial planning concepts and regulations
- Maintain trustworthy, analytical tone
- Balance optimism with risk awareness
`.trim(),

      marketing_agency: `
- Use creative, results-focused language
- Reference metrics, campaigns, and brand strategy
- Maintain energetic, professional tone
- Balance creativity with business outcomes
`.trim(),

      default: `
- Use professional, clear language
- Reference industry-relevant concepts
- Maintain helpful, knowledgeable tone
- Balance expertise with approachability
`.trim()
    };

    return styles[industry] || styles.default;
  }
};

// ============================================
// CONFIDENCE & ESCALATION
// ============================================

export const CONFIDENCE_GUIDELINES = {
  /**
   * When to escalate to human
   */
  escalation: (ownerName: string = 'the business owner') => `
WHEN TO ESCALATE TO HUMAN:
- You're less than 70% confident in your response
- Lead asks a complex question outside your knowledge
- Lead specifically requests to speak with ${ownerName}
- You detect a situation requiring human judgment

HOW TO ESCALATE:
"I want to make sure you get the most accurate information. Let me connect you with ${ownerName} who can address this specifically."
`.trim(),

  /**
   * Uncertainty phrases to avoid
   */
  uncertaintyPhrases: `
AVOID THESE PHRASES (they reduce confidence):
- "I'm not sure"
- "I think maybe"
- "It's possible that"
- "I don't know"

INSTEAD USE:
- "Let me connect you with [owner] for that specific detail"
- "That's a great question for [owner] to address directly"
`.trim()
};

// ============================================
// QUALIFICATION LOGIC
// ============================================

export const QUALIFICATION_TEMPLATES = {
  /**
   * Budget qualification questions
   */
  budgetQuestions: `
KEY BUDGET QUESTIONS TO ASK:
- "What budget range are you working with?"
- "Have you allocated funds for this project?"
- "What's your timeline for making a decision?"
`.trim(),

  /**
   * Authority qualification
   */
  authorityQuestions: `
KEY AUTHORITY QUESTIONS TO ASK:
- "Who else is involved in this decision?"
- "Do you need approval from anyone else?"
- "What's your process for selecting a provider?"
`.trim(),

  /**
   * Need/timing qualification
   */
  needQuestions: `
KEY NEED/TIMING QUESTIONS TO ASK:
- "What's prompting you to look for help now?"
- "When would you ideally like to start?"
- "What happens if you don't address this?"
`.trim()
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build a complete prompt from templates
 */
export function buildPrompt(components: {
  role: string;
  behavior?: keyof typeof BEHAVIOR_RULES;
  industryContext?: { industry: string; service?: string; targetClient?: string };
  customInstructions?: string;
  outputFormat?: 'json' | 'structured' | 'conversational';
  jsonSchema?: string;
  confidenceGuidelines?: boolean;
  ownerName?: string;
}): string {
  const parts: string[] = [];

  // Role definition
  parts.push(components.role);

  // Behavior rules
  if (components.behavior) {
    parts.push('\nYOUR BEHAVIOR:');
    parts.push(BEHAVIOR_RULES[components.behavior]);
  }

  // Industry context
  if (components.industryContext) {
    parts.push('\n' + INDUSTRY_CONTEXT.generate(
      components.industryContext.industry,
      components.industryContext.service,
      components.industryContext.targetClient
    ));
    
    // Add industry-specific communication style
    parts.push('\nCOMMUNICATION STYLE:');
    parts.push(INDUSTRY_CONTEXT.communicationStyle(components.industryContext.industry));
  }

  // Custom instructions
  if (components.customInstructions) {
    parts.push('\n' + components.customInstructions);
  }

  // Confidence guidelines
  if (components.confidenceGuidelines) {
    parts.push('\n' + CONFIDENCE_GUIDELINES.escalation(components.ownerName));
  }

  // Output format
  if (components.outputFormat) {
    parts.push('\n');
    if (components.outputFormat === 'json' && components.jsonSchema) {
      parts.push(OUTPUT_FORMATS.json(components.jsonSchema));
    } else {
      parts.push(OUTPUT_FORMATS[components.outputFormat]);
    }
  }

  return parts.join('\n');
}

/**
 * Get industry-specific communication guidelines
 */
export function getIndustryGuidelines(industry: string): string {
  return INDUSTRY_CONTEXT.communicationStyle(industry);
}

/**
 * Build qualification questions based on business type
 */
export function getQualificationQuestions(focus: 'budget' | 'authority' | 'need'): string {
  const questions = {
    budget: QUALIFICATION_TEMPLATES.budgetQuestions,
    authority: QUALIFICATION_TEMPLATES.authorityQuestions,
    need: QUALIFICATION_TEMPLATES.needQuestions
  };
  
  return questions[focus];
}
```

---

### **3. `lib/ai/prompts/simulation.ts` - Updated with Templates**

```typescript
// lib/ai/prompts/simulation.ts

import { buildPrompt, BEHAVIOR_RULES } from './templates';
import { INDUSTRY_TEMPLATES } from '@/lib/templates/industry-templates';
import type { BusinessProfile } from '@prisma/client';
import type { ScenarioType } from '@/lib/types/simulation';

/**
 * Generate system prompt for simulation client role
 */
export function generateSimulationPrompt(
  scenarioType: ScenarioType,
  businessProfile: any
): string {
  const industry = businessProfile?.industry || 'business_consulting';
  const template = INDUSTRY_TEMPLATES[industry];
  const scenario = template?.scenarios?.[scenarioType];

  if (!scenario) {
    throw new Error(`No scenario found for ${scenarioType} in ${industry}`);
  }

  const customInstructions = `
SCENARIO: ${scenarioType}

CLIENT PROFILE:
- Type: ${scenario.clientType}
- Budget: ${scenario.budget}
- Pain Points: ${scenario.painPoints.join(', ')}
- Personality: ${scenario.personality}

YOUR ROLE:
You are this specific client inquiring about ${businessProfile?.serviceDescription || template.serviceDescription}.

YOUR OBJECTIVES:
- Ask realistic questions based on the scenario
- Raise objections that match your profile (e.g., price concerns for PRICE_SENSITIVE)
- Be somewhat skeptical but genuinely interested
- Don't make it too easy - challenge the business owner
- Use this opening line to start: "${scenario.openingLine}"

TYPICAL OBJECTIONS YOU MIGHT RAISE:
${scenario.typicalObjections.map(obj => `- ${obj}`).join('\n')}

CRITICAL INSTRUCTION:
You are a ${scenario.clientType} in the ${industry} industry.
Stay in this role for the ENTIRE conversation.
Do NOT switch industries, personas, or scenarios under any circumstances.
If you're unsure how to respond, stay in character and ask for clarification.
`.trim();

  return buildPrompt({
    role: `You are roleplaying as a potential client inquiring about professional services.`,
    behavior: 'strict',
    industryContext: {
      industry,
      service: businessProfile?.serviceDescription || template.serviceDescription,
      targetClient: businessProfile?.targetClientType || template.targetClientType
    },
    customInstructions,
    outputFormat: 'conversational'
  });
}

/**
 * Legacy export for backward compatibility
 */
export const SIMULATION_CLIENT_SYSTEM_PROMPT = 'USE generateSimulationPrompt() INSTEAD';
```

---

### **4. `lib/ai/prompts/pattern-extraction.ts` - Updated with Templates**

```typescript
// lib/ai/prompts/pattern-extraction.ts

import { buildPrompt, OUTPUT_FORMATS } from './templates';

export const PATTERN_EXTRACTION_SYSTEM_PROMPT = `
You are an expert business analyst specializing in sales conversation analysis.

Your task is to analyze conversations between business owners and potential clients
to extract structured patterns about how the business owner operates.

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
  const jsonSchema = `
{
  "communicationStyle": {
    "tone": "professional" | "casual" | "empathetic" | "direct" | "friendly",
    "style": "data-driven" | "emotional" | "educational" | "consultative",
    "keyPhrases": ["phrase1", "phrase2"],
    "formality": "formal" | "conversational" | "casual"
  },
  "pricingLogic": {
    "minBudget": number,
    "maxBudget": number,
    "typicalRange": "string description",
    "flexibilityFactors": ["factor1", "factor2"],
    "dealBreakers": ["breaker1", "breaker2"]
  },
  "qualificationCriteria": {
    "mustHaves": ["requirement1", "requirement2"],
    "dealBreakers": ["breaker1", "breaker2"],
    "greenFlags": ["flag1", "flag2"],
    "redFlags": ["flag1", "flag2"]
  },
  "objectionHandling": {
    "priceObjection": "description",
    "timelineObjection": "description",
    "competitorObjection": "description"
  },
  "decisionMakingPatterns": {
    "whenToSayYes": ["condition1", "condition2"],
    "whenToSayNo": ["condition1", "condition2"],
    "warningSignsToWatch": ["sign1", "sign2"]
  }
}`.trim();

  const customInstructions = `
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
`.trim();

  return buildPrompt({
    role: PATTERN_EXTRACTION_SYSTEM_PROMPT,
    customInstructions,
    outputFormat: 'json',
    jsonSchema
  });
}

export function formatConversationTranscript(messages: any[]): string {
  return messages.map(message => {
    const role = message.role === 'AI_CLIENT' ? 'CLIENT' : 'YOU';
    return `${role}: ${message.content}`;
  }).join('\n\n');
}
```

---

### **5. `lib/ai/prompts/index.ts` - Central Registry**

```typescript
// lib/ai/prompts/index.ts

/**
 * Central Prompt Registry
 * 
 * This is the single source of truth for all AI prompts in the platform.
 * All imports should come from this file.
 */

// ============================================
// RE-EXPORTS
// ============================================

// Configuration
export * from './config';

// Templates
export * from './templates';

// Specific Prompts
export * from './simulation';
export * from './pattern-extraction';
// export * from './lead-qualification';      // Future
// export * from './summarization';           // Future
// export * from './intent-detection';        // Future

// ============================================
// PROMPT REGISTRY
// ============================================

import { PROMPT_CONFIGS } from './config';

export const AVAILABLE_PROMPTS = [
  'simulation',
  'patternExtraction',
  'leadQualification',
  'summarization',
  'intentDetection'
] as const;

export type PromptType = typeof AVAILABLE_PROMPTS[number];

/**
 * Get all prompt metadata
 */
export function getAllPromptConfigs() {
  return PROMPT_CONFIGS;
}

/**
 * Get specific prompt configuration
 */
export function getConfig(promptType: PromptType) {
  return PROMPT_CONFIGS[promptType];
}

/**
 * Check if prompt is available
 */
export function isPromptAvailable(promptType: string): boolean {
  return AVAILABLE_PROMPTS.includes(promptType as PromptType);
}

// ============================================
// VERSION INFORMATION
// ============================================

export const PROMPT_SYSTEM_VERSION = '1.0.0';
export const LAST_UPDATED = '2026-03-20';

/**
 * Get version info for all prompts
 */
export function getVersionInfo() {
  return {
    systemVersion: PROMPT_SYSTEM_VERSION,
    lastUpdated: LAST_UPDATED,
    prompts: Object.entries(PROMPT_CONFIGS).map(([name, config]) => ({
      name,
      version: config.version,
      lastUpdated: config.lastUpdated,
      model: config.model
    }))
  };
}
```

---

### **6. `lib/ai/prompts/CHANGELOG.md` - Version History**

```markdown
# Prompt Changelog

All notable changes to AI prompts will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Lead qualification prompts (Session 12-13)
- Conversation summarization prompts (Session 14-16)
- Intent detection prompts (Post-MVP)

## [1.0.0] - 2026-03-20

### Added
- Initial prompt management system
- Central registry in `index.ts`
- Reusable templates in `templates.ts`
- Configuration system in `config.ts`
- Simulation prompts with industry templates
- Pattern extraction prompts
- CHANGELOG for tracking prompt versions

### Changed
- Refactored simulation prompts to use template system
- Refactored pattern extraction to use template system
- Consolidated behavior rules into reusable components
- Added industry-specific communication styles

## [0.1.0] - 2026-03-18

### Added
- Initial simulation prompt (basic version)
- Basic AI integration structure

---

## Version Numbering

**Format:** MAJOR.MINOR.PATCH

- **MAJOR**: Incompatible API changes (changes that break existing implementations)
- **MINOR**: New functionality in a backwards-compatible manner
- **PATCH**: Backwards-compatible bug fixes and improvements

## Types of Changes

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities
```

---

### **7. `lib/ai/prompts/utils/validation.ts` - Prompt Validation**

```typescript
// lib/ai/prompts/utils/validation.ts

/**
 * Utilities for validating prompt structure and content
 */

export interface PromptValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    estimatedTokens: number;
    variableCount: number;
    hasSystemPrompt: boolean;
    hasOutputFormat: boolean;
  };
}

/**
 * Validate a prompt structure
 */
export function validatePrompt(prompt: string): PromptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum length
  if (prompt.length < 50) {
    errors.push('Prompt is too short (< 50 characters)');
  }

  // Check maximum length (rough token estimate)
  const estimatedTokens = Math.ceil(prompt.length / 4);
  if (estimatedTokens > 8000) {
    errors.push(`Prompt is too long (estimated ${estimatedTokens} tokens, max 8000)`);
  }

  // Check for common issues
  if (!prompt.includes('You are') && !prompt.includes('Your role')) {
    warnings.push('Prompt may be missing role definition');
  }

  if (prompt.toLowerCase().includes('output format') === false &&
      prompt.toLowerCase().includes('respond with') === false) {
    warnings.push('Prompt may be missing output format instructions');
  }

  // Count variables (template placeholders)
  const variableMatches = prompt.match(/\{[^}]+\}/g);
  const variableCount = variableMatches ? variableMatches.length : 0;

  // Check for undefined variables
  if (variableCount > 0) {
    const undefinedVars = variableMatches?.filter(v => 
      v === '{undefined}' || v === '{null}'
    );
    if (undefinedVars && undefinedVars.length > 0) {
      errors.push(`Found undefined variables: ${undefinedVars.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      estimatedTokens,
      variableCount,
      hasSystemPrompt: prompt.includes('You are') || prompt.includes('Your role'),
      hasOutputFormat: prompt.toLowerCase().includes('output format')
    }
  };
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rule of thumb: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Check if prompt exceeds token budget
 */
export function exceedsTokenBudget(
  prompt: string,
  budget: number
): { exceeds: boolean; estimated: number; budget: number } {
  const estimated = estimateTokens(prompt);
  return {
    exceeds: estimated > budget,
    estimated,
    budget
  };
}
```

---

### **8. Testing Framework**

```typescript
// lib/ai/prompts/__tests__/simulation.test.ts

import { generateSimulationPrompt } from '../simulation';
import { validatePrompt } from '../utils/validation';
import { INDUSTRY_TEMPLATES } from '@/lib/templates/industry-templates';

describe('Simulation Prompts', () => {
  const mockProfile = {
    industry: 'mortgage_advisory',
    serviceDescription: 'Home loan consulting',
    targetClientType: 'First-time homebuyers',
    typicalBudgetRange: '$200k-$800k'
  };

  it('should generate valid prompt for each industry', () => {
    Object.keys(INDUSTRY_TEMPLATES).forEach(industry => {
      const profile = { ...mockProfile, industry };
      const prompt = generateSimulationPrompt('PRICE_SENSITIVE', profile);
      
      const validation = validatePrompt(prompt);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(prompt).toContain(industry);
    });
  });

  it('should include critical "stay in character" instruction', () => {
    const prompt = generateSimulationPrompt('PRICE_SENSITIVE', mockProfile);
    
    expect(prompt.toLowerCase()).toContain('stay in character');
    expect(prompt.toLowerCase()).toContain('never');
    expect(prompt.toLowerCase()).toContain('entire conversation');
  });

  it('should include scenario-specific details', () => {
    const prompt = generateSimulationPrompt('PRICE_SENSITIVE', mockProfile);
    
    expect(prompt).toContain('PRICE_SENSITIVE');
    expect(prompt).toContain('CLIENT PROFILE');
    expect(prompt).toContain('Budget');
  });

  it('should not exceed token budget', () => {
    const prompt = generateSimulationPrompt('DEMANDING', mockProfile);
    const tokens = estimateTokens(prompt);
    
    expect(tokens).toBeLessThan(1000); // System prompt budget
  });
});
```

---

## Migration Strategy

### **Phase 1: Foundation (Current Session)**

**Tasks:**
1. Create directory structure
2. Implement `config.ts`
3. Implement `templates.ts`
4. Create `index.ts` registry
5. Add CHANGELOG.md

**Deliverables:**
- ✅ Centralized configuration
- ✅ Reusable templates
- ✅ Single import source

---

### **Phase 2: Migrate Existing Prompts**

**Tasks:**
1. Refactor `simulation.ts` to use templates
2. Refactor `pattern-extraction.ts` to use templates
3. Update all import statements across codebase
4. Add validation utilities
5. Write tests

**Deliverables:**
- ✅ All prompts using template system
- ✅ No duplication
- ✅ Consistent structure

---

### **Phase 3: Add New Prompts (Session 12-16)**

**Tasks:**
1. Implement lead qualification prompts
2. Implement summarization prompts
3. Implement intent detection prompts
4. Add A/B testing framework
5. Add monitoring

**Deliverables:**
- ✅ Complete prompt library
- ✅ A/B testing capability
- ✅ Performance tracking

---

## Benefits Summary

### **Immediate Benefits:**

1. **Single Source of Truth** ✅
   - All prompts in `lib/ai/prompts/`
   - All imports from `lib/ai/prompts`
   - No scattered prompts

2. **Version Control** ✅
   - Every prompt has version number
   - CHANGELOG tracks all changes
   - Easy to rollback

3. **No Duplication** ✅
   - Behavior rules defined once
   - Industry context reusable
   - Output formats standardized

4. **Easy Testing** ✅
   - Validate prompt structure
   - Test token budgets
   - A/B test variations

### **Future Benefits:**

5. **Localization Ready** 🌍
   - Templates support multiple languages
   - Easy to add translations

6. **A/B Testing** 🧪
   - Test prompt variations
   - Measure performance
   - Optimize over time

7. **Analytics Dashboard** 📊
   - View all prompts
   - Track versions
   - Monitor performance

8. **Industry Customization** 🏢
   - Easy to add new industries
   - Consistent structure
   - Scalable approach

---

## Success Metrics

After implementation, you should have:

- ✅ 100% of prompts using template system
- ✅ 0 duplicate behavior rules across prompts
- ✅ Single import path for all prompts
- ✅ Version tracking for every prompt
- ✅ Validation tests passing
- ✅ CHANGELOG up to date
- ✅ Token budgets within limits

---

## End of Document

**Document Version:** 1.0.0  
**Created:** March 20, 2026  
**Status:** Ready for Implementation
