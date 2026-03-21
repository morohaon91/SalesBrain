/**
 * Prompt Validation Utilities
 * Tools for validating prompt structure, size, and token budgets
 */

/**
 * Estimate token count for a given text
 * Uses rough approximation: ~4 characters per token
 * @param text - The text to estimate
 * @returns Approximate token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if a prompt exceeds its token budget
 * @param prompt - The prompt text
 * @param budget - The token budget limit
 * @returns true if prompt exceeds budget
 */
export function exceedsTokenBudget(prompt: string, budget: number): boolean {
  return estimateTokens(prompt) > budget;
}

/**
 * Validate a prompt for common issues
 * @param prompt - The prompt to validate
 * @returns Object with valid flag and list of issues found
 */
export function validatePrompt(prompt: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check if empty
  if (!prompt || prompt.trim().length === 0) {
    issues.push('Prompt is empty');
  }

  // Check minimum length
  if (prompt.length < 50) {
    issues.push('Prompt is too short (< 50 characters)');
  }

  // Check maximum length
  if (prompt.length > 100000) {
    issues.push('Prompt exceeds maximum length (> 100,000 characters)');
  }

  // Check for common issues
  if (!prompt.includes('\n')) {
    issues.push('Prompt lacks structure (no newlines)');
  }

  // Check for unbalanced quotes
  const singleQuotes = (prompt.match(/'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    issues.push('Unbalanced single quotes detected');
  }

  const doubleQuotes = (prompt.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    issues.push('Unbalanced double quotes detected');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Get a summary of prompt characteristics
 * @param prompt - The prompt to analyze
 * @returns Object with prompt metrics
 */
export function getPromptMetrics(prompt: string) {
  return {
    characters: prompt.length,
    tokens: estimateTokens(prompt),
    lines: prompt.split('\n').length,
    words: prompt.split(/\s+/).length,
  };
}

/**
 * Warn if prompt size is concerning
 * @param prompt - The prompt text
 * @param budget - The token budget
 * @returns Warning message or null
 */
export function getPromptSizeWarning(prompt: string, budget: number): string | null {
  const tokens = estimateTokens(prompt);
  const usage = (tokens / budget) * 100;

  if (usage > 100) {
    return `Prompt exceeds token budget: ${tokens} tokens / ${budget} budget (${Math.round(usage)}%)`;
  } else if (usage > 80) {
    return `Prompt is approaching token budget: ${tokens} tokens / ${budget} budget (${Math.round(usage)}%)`;
  }

  return null;
}
