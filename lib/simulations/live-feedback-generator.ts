/**
 * Live Feedback Generator
 * Analyzes owner messages during simulation and detects demonstrated patterns
 */

const PATTERN_DETECTORS: Array<{
  pattern: string;
  keywords: string[];
  message: string;
}> = [
  {
    pattern: 'pricing_flexibility',
    keywords: ['payment plan', 'installment', 'flexible', 'work with your budget', 'deposit', 'split'],
    message: 'Nice! You demonstrated pricing flexibility',
  },
  {
    pattern: 'timeline_handling',
    keywords: ['timeline', 'schedule', 'deadline', 'weeks', 'realistically', 'completion date', 'timeframe'],
    message: 'Great! You addressed timeline concerns',
  },
  {
    pattern: 'objection_price',
    keywords: ['value', 'worth', 'invest', 'quality', 'compare', 'cheaper', 'cost', 'price'],
    message: 'Well handled! You navigated the price objection',
  },
  {
    pattern: 'qualification_budget',
    keywords: ['budget', 'afford', 'range', 'minimum', 'investment', 'ballpark'],
    message: 'Good! You qualified their budget',
  },
  {
    pattern: 'communication_educational',
    keywords: ['explain', 'process', 'typically', 'usually', 'normally', 'what happens', 'how we', 'let me clarify'],
    message: 'Excellent! You explained things clearly',
  },
  {
    pattern: 'scope_boundaries',
    keywords: ['scope', 'included', 'not included', 'change order', 'additional', 'out of scope', 'within the project'],
    message: 'Perfect! You set clear scope boundaries',
  },
  {
    pattern: 'qualification_criteria',
    keywords: ["ideal client", "good fit", "work best with", "not a good match", "right candidate", "qualified"],
    message: 'Strong! You demonstrated your qualification criteria',
  },
  {
    pattern: 'decision_making',
    keywords: ['cannot take on', 'not the right fit', 'recommend', "better suited", 'decline', "move forward if"],
    message: 'Great! You showed clear decision-making',
  },
];

/**
 * Analyze owner message and return newly detected patterns
 * Deduplicates against already-demonstrated patterns
 */
export function generateLiveFeedback(
  ownerMessage: string,
  alreadyDemonstrated: string[]
): string[] {
  const lower = ownerMessage.toLowerCase();
  const newPatterns: string[] = [];

  for (const detector of PATTERN_DETECTORS) {
    if (alreadyDemonstrated.includes(detector.pattern)) continue;

    const matched = detector.keywords.some((kw) => lower.includes(kw));
    if (matched) {
      newPatterns.push(detector.pattern);
    }
  }

  return newPatterns;
}

/**
 * Get human-readable feedback message for a pattern
 */
export function getFeedbackMessage(pattern: string): string {
  const detector = PATTERN_DETECTORS.find((d) => d.pattern === pattern);
  return detector ? `${detector.message}` : `Pattern demonstrated: ${pattern.replace(/_/g, ' ')}`;
}

export { PATTERN_DETECTORS };
