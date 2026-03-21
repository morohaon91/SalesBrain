/**
 * Prompt Configuration System
 * Centralized configuration for all AI prompts including models, versions, and token budgets
 */

export const AI_MODELS = {
  SONNET: 'claude-sonnet-4-6',
  HAIKU: 'claude-haiku-4-5-20251001',
  OPUS: 'claude-opus-4-6',
} as const;

export interface PromptConfig {
  version: string;
  model: string;
  temperature: number;
  maxTokens: number;
  description: string;
}

/**
 * Configuration for all prompt types
 * Version follows semantic versioning (major.minor.patch)
 */
export const PROMPT_CONFIGS: Record<string, PromptConfig> = {
  simulation: {
    version: '1.2.0',
    model: AI_MODELS.SONNET,
    temperature: 0.8,
    maxTokens: 300,
    description: 'AI plays difficult client personas in sales simulations',
  },
  patternExtraction: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.3,
    maxTokens: 4000,
    description: 'Extracts business patterns from completed simulations',
  },
  leadQualification: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.7,
    maxTokens: 200,
    description: 'Engages with real leads using business owners voice',
  },
  summarization: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.5,
    maxTokens: 500,
    description: 'Generates conversation summaries and insights',
  },
  intentDetection: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.2,
    maxTokens: 100,
    description: 'Detects and classifies user intent in conversations',
  },
} as const;

/**
 * Token budgets for each prompt type
 * Used to validate prompt sizes and warn about overages
 */
export const TOKEN_BUDGETS = {
  simulation: 300,
  patternExtraction: 4000,
  leadQualification: 200,
  summarization: 500,
  intentDetection: 100,
} as const;

/**
 * Get configuration for a specific prompt type
 * @param type - The prompt type key
 * @returns Configuration object or default for simulation
 */
export function getPromptConfig(type: string): PromptConfig {
  return PROMPT_CONFIGS[type as keyof typeof PROMPT_CONFIGS] || PROMPT_CONFIGS.simulation;
}

/**
 * Get token budget for a specific prompt type
 * @param type - The prompt type key
 * @returns Token budget or default
 */
export function getTokenBudget(type: string): number {
  return TOKEN_BUDGETS[type as keyof typeof TOKEN_BUDGETS] || TOKEN_BUDGETS.simulation;
}
