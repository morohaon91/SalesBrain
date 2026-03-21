/**
 * Completion and Quality Scoring Utilities
 * Calculate profile completion percentage and quality scores
 */

/**
 * Calculate profile completion percentage based on simulation count
 *
 * Formula:
 * - 0 simulations: 20% (just has template data)
 * - 1 simulation: 40%
 * - 2 simulations: 50%
 * - 3 simulations: 60%
 * - 4 simulations: 70%
 * - 5 simulations: 80%
 * - 6-9 simulations: interpolate between 80-100%
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
  return 80 + (simulationCount - 5) * 4;
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
 *
 * Returns score 0-100
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
  const balanceRatio =
    Math.min(aiMessageCount, ownerMessageCount) /
    Math.max(aiMessageCount, ownerMessageCount);
  score += balanceRatio * 40;

  // Completion bonus (20 points)
  if (status === 'COMPLETED') {
    score += 20;
  }

  return Math.round(score);
}
