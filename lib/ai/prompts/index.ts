/**
 * Prompt Management System - Central Registry
 * Single source of truth for all prompts, configurations, and utilities
 */

// Re-export everything from component modules
export * from './config';
export * from './templates';
export * from './simulation';
export * from './pattern-extraction';
export * from './utils/validation';

/**
 * List of all available prompt types
 */
export const AVAILABLE_PROMPTS = [
  'simulation',
  'patternExtraction',
  'leadQualification',
  'summarization',
  'intentDetection',
] as const;

export type PromptType = (typeof AVAILABLE_PROMPTS)[number];

/**
 * Get all prompt configurations
 */
export function getAllPromptConfigs() {
  const { PROMPT_CONFIGS } = require('./config');
  return PROMPT_CONFIGS;
}

/**
 * Get configuration for a specific prompt type
 */
export function getConfig(promptType: PromptType) {
  const { getPromptConfig } = require('./config');
  return getPromptConfig(promptType);
}

/**
 * Check if a prompt type is available
 */
export function isPromptAvailable(promptType: string): promptType is PromptType {
  return AVAILABLE_PROMPTS.includes(promptType as PromptType);
}

/**
 * System version and metadata
 */
export const PROMPT_SYSTEM_VERSION = '1.0.0';
export const LAST_UPDATED = '2026-03-21';

/**
 * Get version information
 */
export function getVersionInfo() {
  return {
    version: PROMPT_SYSTEM_VERSION,
    lastUpdated: LAST_UPDATED,
    promptCount: AVAILABLE_PROMPTS.length,
    availablePrompts: AVAILABLE_PROMPTS,
  };
}
