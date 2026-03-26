/**
 * Live Quality Scorer
 * Calculates a real-time quality score (0-100) during simulation
 */

interface MessageLike {
  role: string;
  content: string;
}

interface IndustryScenarioLike {
  focusAreas: string[];
}

/**
 * Calculate live quality score based on conversation so far
 */
export function calculateLiveQualityScore(
  messages: MessageLike[],
  scenario: IndustryScenarioLike | null
): number {
  const ownerMessages = messages.filter((m) => m.role === 'BUSINESS_OWNER');
  const totalOwnerText = ownerMessages.map((m) => m.content).join(' ').toLowerCase();

  if (ownerMessages.length === 0) return 0;

  let score = 0;

  // Base score from message count (up to 30 points)
  const countScore = Math.min(ownerMessages.length * 3, 30);
  score += countScore;

  // Avg response length (up to 20 points) — longer = more detail
  const avgLength = totalOwnerText.length / ownerMessages.length;
  const lengthScore = Math.min(Math.floor(avgLength / 20), 20);
  score += lengthScore;

  // Keyword coverage (up to 30 points)
  const qualityKeywords = [
    'budget', 'timeline', 'experience', 'process', 'value', 'payment',
    'qualify', 'schedule', 'expectations', 'scope', 'recommend',
  ];
  const coveredKeywords = qualityKeywords.filter((kw) => totalOwnerText.includes(kw));
  const keywordScore = Math.min(coveredKeywords.length * 3, 30);
  score += keywordScore;

  // Question answering (up to 20 points) — checks if owner addresses client concerns
  const aiMessages = messages.filter((m) => m.role === 'AI_CLIENT');
  if (aiMessages.length > 0 && ownerMessages.length >= aiMessages.length) {
    score += 20;
  } else if (ownerMessages.length > 0) {
    score += 10;
  }

  return Math.min(Math.max(score, 0), 100);
}

export function getScoreStatus(score: number): string {
  if (score >= 70) return 'Ready to Extract';
  if (score >= 50) return 'Getting There';
  if (score >= 25) return 'Keep Going';
  return 'Just Starting';
}
