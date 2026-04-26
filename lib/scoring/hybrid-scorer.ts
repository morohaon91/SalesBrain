import { BusinessProfile } from '@prisma/client';
import { createChatCompletion, parseAiJson } from '@/lib/ai/client';

/**
 * PHASE 1: Hybrid Lead Scoring Engine
 * Combines rules-based scoring (budget/timeline) with AI-powered scoring (engagement/alignment)
 *
 * Score Breakdown:
 * - Budget Fit: 0-30 points (rules-based)
 * - Timeline Fit: 0-20 points (rules-based)
 * - Engagement Quality: 0-25 points (AI-powered)
 * - Value Alignment: 0-25 points (AI-powered)
 * Total: 0-100 points
 */

export interface LeadExtractedInfo {
  leadName: string | null;
  leadEmail: string | null;
  budget: number | null;
  timeline: string | null;
  projectType: string | null;
}

export interface ScoringBreakdown {
  totalScore: number; // 0-100
  temperature: 'hot' | 'warm' | 'cold';

  /** Name, email, and numeric extraction for CRM + /end without a duplicate AI call */
  extractedInfo: LeadExtractedInfo;

  components: {
    budgetFit: {
      score: number; // 0-30
      reasoning: string;
      leadBudget?: number;
      ownerRange?: { min: number; max: number };
    };
    timelineFit: {
      score: number; // 0-20
      reasoning: string;
      leadTimeline?: string;
      ownerTypical?: string;
    };
    engagement: {
      score: number; // 0-25
      reasoning: string;
      signals: string[];
    };
    valueAlignment: {
      score: number; // 0-25
      reasoning: string;
      matchedValues: string[];
    };
  };

  qualificationAnalysis: {
    greenFlagsMatched: string[];
    redFlagsDetected: string[];
    dealBreakersPresent: string[];
    mustHavesMet: string[];
  };

  recommendation: {
    action: 'call_immediately' | 'call_soon' | 'email_first' | 'skip';
    reasoning: string;
    talkingPoints: string[];
  };
}

export async function scoreConversation(
  transcript: string,
  profile: BusinessProfile,
  tenantId?: string
): Promise<ScoringBreakdown> {
  const scoringOpts = {
    operationType: 'scoring' as const,
    tenantId,
  };

  // PART 1: Two independent AI extractions in parallel (rules use extraction only)
  const [leadInfo, aiAnalysis] = await Promise.all([
    extractLeadInfo(transcript, scoringOpts),
    analyzeEngagementAndAlignment(
      transcript,
      profile.qualificationCriteria as any,
      profile.ownerValues as any,
      scoringOpts
    ),
  ]);

  // PART 2: Rules-based scoring (60% - deterministic)
  const ownerNorms = (profile.ownerNorms ?? {}) as {
    typicalBudgets?: unknown;
    typicalTimelines?: unknown;
  };

  const budgetScore = calculateBudgetFit(leadInfo.budget, ownerNorms.typicalBudgets as any);

  const timelineScore = calculateTimelineFit(leadInfo.timeline, ownerNorms.typicalTimelines as any);

  // PART 4: Combine scores
  const totalScore = budgetScore.score + timelineScore.score + aiAnalysis.engagementScore + aiAnalysis.alignmentScore;

  // PART 5: Determine temperature
  const temperature: 'hot' | 'warm' | 'cold' =
    totalScore >= 80 ? 'hot' : totalScore >= 50 ? 'warm' : 'cold';

  // PART 6: Generate recommendation
  const recommendation = generateRecommendation(totalScore, temperature, aiAnalysis.qualificationAnalysis);

  const extractedInfo: LeadExtractedInfo = {
    leadName: leadInfo.leadName,
    leadEmail: leadInfo.leadEmail,
    budget: leadInfo.budget,
    timeline: leadInfo.timeline,
    projectType: leadInfo.projectType,
  };

  return {
    totalScore,
    temperature,
    extractedInfo,
    components: {
      budgetFit: budgetScore,
      timelineFit: timelineScore,
      engagement: {
        score: aiAnalysis.engagementScore,
        reasoning: aiAnalysis.engagementReasoning,
        signals: aiAnalysis.signals,
      },
      valueAlignment: {
        score: aiAnalysis.alignmentScore,
        reasoning: aiAnalysis.alignmentReasoning,
        matchedValues: aiAnalysis.matchedValues,
      },
    },
    qualificationAnalysis: aiAnalysis.qualificationAnalysis,
    recommendation,
  };
}

// ============================================================================
// RULES-BASED SCORING FUNCTIONS
// ============================================================================

function calculateBudgetFit(leadBudget: number | null, ownerBudgets: any): any {
  if (!leadBudget) {
    return {
      score: 15,
      reasoning: 'Budget not mentioned in conversation',
    };
  }

  // Get owner's typical range (try to match service type, or use first available)
  const ownerRange = ownerBudgets?.fullKitchen || Object.values(ownerBudgets || {})[0];

  if (!ownerRange) {
    return {
      score: 15,
      reasoning: "Owner's typical budget range not defined",
      leadBudget,
    };
  }

  const { min, max } = ownerRange;

  // Scoring logic:
  // - Perfect fit (within range): 30 points
  // - Close fit (10% below min or above max): 25 points
  // - Moderate fit (20% below min or above max): 20 points
  // - Poor fit (30% below min): 10 points
  // - Deal-breaker (50%+ below min): 0 points

  if (leadBudget >= min && leadBudget <= max) {
    return {
      score: 30,
      reasoning: `Budget $${leadBudget.toLocaleString()} fits perfectly within range $${min.toLocaleString()}-$${max.toLocaleString()}`,
      leadBudget,
      ownerRange: { min, max },
    };
  }

  const belowMinPercent = ((min - leadBudget) / min) * 100;
  const aboveMaxPercent = ((leadBudget - max) / max) * 100;

  if (leadBudget < min) {
    if (belowMinPercent <= 10) {
      return {
        score: 25,
        reasoning: `Budget $${leadBudget.toLocaleString()} is slightly below range (${belowMinPercent.toFixed(0)}% below minimum)`,
        leadBudget,
        ownerRange: { min, max },
      };
    } else if (belowMinPercent <= 20) {
      return {
        score: 20,
        reasoning: `Budget $${leadBudget.toLocaleString()} is below range (${belowMinPercent.toFixed(0)}% below minimum)`,
        leadBudget,
        ownerRange: { min, max },
      };
    } else if (belowMinPercent <= 30) {
      return {
        score: 10,
        reasoning: `Budget $${leadBudget.toLocaleString()} is significantly below range (${belowMinPercent.toFixed(0)}% below minimum)`,
        leadBudget,
        ownerRange: { min, max },
      };
    } else {
      return {
        score: 0,
        reasoning: `Budget $${leadBudget.toLocaleString()} is way below minimum (${belowMinPercent.toFixed(0)}% below) - likely deal-breaker`,
        leadBudget,
        ownerRange: { min, max },
      };
    }
  }

  // Above max
  if (aboveMaxPercent <= 20) {
    return {
      score: 28,
      reasoning: `Budget $${leadBudget.toLocaleString()} is above typical range (${aboveMaxPercent.toFixed(0)}% above) - excellent!`,
      leadBudget,
      ownerRange: { min, max },
    };
  }

  return {
    score: 25,
    reasoning: `Budget $${leadBudget.toLocaleString()} is well above typical range`,
    leadBudget,
    ownerRange: { min, max },
  };
}

function calculateTimelineFit(leadTimeline: string | null, ownerTimelines: any): any {
  if (!leadTimeline) {
    return {
      score: 10,
      reasoning: 'Timeline not discussed',
    };
  }

  const ownerRange = ownerTimelines?.fullKitchen || Object.values(ownerTimelines || {})[0];

  if (!ownerRange) {
    return {
      score: 10,
      reasoning: "Owner's typical timeline not defined",
      leadTimeline,
    };
  }

  const { min, max, unit } = ownerRange;
  const ownerTypical = `${min}-${max} ${unit}`;

  // Extract number from lead timeline (simple regex)
  const leadWeeks = extractWeeksFromTimeline(leadTimeline);

  if (!leadWeeks) {
    return {
      score: 10,
      reasoning: `Timeline mentioned: "${leadTimeline}" but couldn't parse`,
      leadTimeline,
      ownerTypical,
    };
  }

  // Convert owner range to weeks if needed
  const minWeeks = unit === 'months' ? min * 4 : min;
  const maxWeeks = unit === 'months' ? max * 4 : max;

  if (leadWeeks >= minWeeks && leadWeeks <= maxWeeks) {
    return {
      score: 20,
      reasoning: `Timeline ${leadWeeks} weeks is realistic (typical ${minWeeks}-${maxWeeks} weeks)`,
      leadTimeline,
      ownerTypical,
    };
  }

  if (leadWeeks < minWeeks) {
    const rushPercent = ((minWeeks - leadWeeks) / minWeeks) * 100;
    if (rushPercent <= 20) {
      return {
        score: 15,
        reasoning: `Timeline ${leadWeeks} weeks is slightly rushed (typical ${minWeeks}-${maxWeeks} weeks)`,
        leadTimeline,
        ownerTypical,
      };
    } else if (rushPercent <= 50) {
      return {
        score: 8,
        reasoning: `Timeline ${leadWeeks} weeks is rushed (typical ${minWeeks}-${maxWeeks} weeks)`,
        leadTimeline,
        ownerTypical,
      };
    } else {
      return {
        score: 0,
        reasoning: `Timeline ${leadWeeks} weeks is way too rushed (typical ${minWeeks}-${maxWeeks} weeks)`,
        leadTimeline,
        ownerTypical,
      };
    }
  }

  // Longer timeline is usually OK
  return {
    score: 18,
    reasoning: `Timeline ${leadWeeks} weeks is flexible (typical ${minWeeks}-${maxWeeks} weeks)`,
    leadTimeline,
    ownerTypical,
  };
}

function extractWeeksFromTimeline(timeline: string): number | null {
  const lowerTimeline = timeline.toLowerCase();

  // Match patterns like "8 weeks", "2 months", "3-4 weeks"
  const weeksMatch = lowerTimeline.match(/(\d+)[\s-]*weeks?/);
  if (weeksMatch) {
    return parseInt(weeksMatch[1]);
  }

  const monthsMatch = lowerTimeline.match(/(\d+)[\s-]*months?/);
  if (monthsMatch) {
    return parseInt(monthsMatch[1]) * 4;
  }

  return null;
}

// ============================================================================
// AI-POWERED SCORING FUNCTIONS
// ============================================================================

async function extractLeadInfo(
  transcript: string,
  opts?: { tenantId?: string; operationType?: 'scoring' }
): Promise<{
  leadName: string | null;
  leadEmail: string | null;
  budget: number | null;
  timeline: string | null;
  projectType: string | null;
}> {
  const empty = (): {
    leadName: string | null;
    leadEmail: string | null;
    budget: number | null;
    timeline: string | null;
    projectType: string | null;
  } => ({
    leadName: null,
    leadEmail: null,
    budget: null,
    timeline: null,
    projectType: null,
  });

  const extractionPrompt = `Extract structured lead information from this conversation transcript.

Transcript:
${transcript}

Extract:
1. leadName — full name if clearly stated, else null
2. leadEmail — email if clearly stated, else null
3. budget — numeric budget if mentioned (number only), else null
4. timeline — free-text timeline if mentioned, else null
5. projectType — short description of what they want, else null

Return JSON only:
{
  "leadName": string | null,
  "leadEmail": string | null,
  "budget": number | null,
  "timeline": string | null,
  "projectType": string | null
}`;

  const response = await createChatCompletion(
    [{ role: 'user', content: extractionPrompt }],
    'You are a precise data extraction assistant. Return only valid JSON.',
    {
      temperature: 0.1,
      maxTokens: 400,
      tenantId: opts?.tenantId,
      operationType: opts?.operationType ?? 'scoring',
    }
  );

  try {
    const parsed = parseAiJson<any>(response.content);
    return {
      leadName: typeof parsed.leadName === 'string' ? parsed.leadName : null,
      leadEmail: typeof parsed.leadEmail === 'string' ? parsed.leadEmail : null,
      budget: typeof parsed.budget === 'number' ? parsed.budget : null,
      timeline: typeof parsed.timeline === 'string' ? parsed.timeline : null,
      projectType: typeof parsed.projectType === 'string' ? parsed.projectType : null,
    };
  } catch (e) {
    console.error('Failed to parse lead info extraction:', e);
    return empty();
  }
}

async function analyzeEngagementAndAlignment(
  transcript: string,
  qualificationCriteria: any,
  ownerValues: any,
  opts?: { tenantId?: string; operationType?: 'scoring' }
): Promise<{
  engagementScore: number;
  engagementReasoning: string;
  signals: string[];
  alignmentScore: number;
  alignmentReasoning: string;
  matchedValues: string[];
  qualificationAnalysis: {
    greenFlagsMatched: string[];
    redFlagsDetected: string[];
    dealBreakersPresent: string[];
    mustHavesMet: string[];
  };
}> {
  const analysisPrompt = `Analyze this lead conversation for engagement quality and value alignment.

Transcript:
${transcript}

Owner's Qualification Criteria:
${JSON.stringify(qualificationCriteria, null, 2)}

Owner's Values:
${JSON.stringify(ownerValues, null, 2)}

Analyze:

1. ENGAGEMENT QUALITY (0-25 points):
   - Did lead ask thoughtful questions? (+5)
   - Did lead show buying signals (ready to move forward)? (+5)
   - Did lead book a meeting/next step? (+10)
   - How engaged was the conversation? (+5)

2. VALUE ALIGNMENT (0-25 points):
   - Which of owner's values did lead demonstrate?
   - Which green flags were matched?
   - Which red flags were detected?
   - Were any deal-breakers present?

Return JSON:
{
  "engagementScore": number (0-25),
  "engagementReasoning": "explanation of score",
  "signals": ["booked meeting", "asked about process", etc],
  "alignmentScore": number (0-25),
  "alignmentReasoning": "explanation of alignment",
  "matchedValues": ["transparency", "quality focus", etc],
  "qualificationAnalysis": {
    "greenFlagsMatched": ["asked detailed questions upfront"],
    "redFlagsDetected": ["shopping on price"],
    "dealBreakersPresent": [],
    "mustHavesMet": ["has permits ready"]
  }
}`;

  const response = await createChatCompletion(
    [{ role: 'user', content: analysisPrompt }],
    'You are an expert sales analyst. Analyze conversations and return precise JSON.',
    {
      temperature: 0.2,
      maxTokens: 600,
      tenantId: opts?.tenantId,
      operationType: opts?.operationType ?? 'scoring',
    }
  );

  try {
    const parsed = parseAiJson<any>(response.content);
    return {
      engagementScore: Math.min(25, Math.max(0, parsed.engagementScore || 0)),
      engagementReasoning: parsed.engagementReasoning || 'Unable to analyze engagement',
      signals: parsed.signals || [],
      alignmentScore: Math.min(25, Math.max(0, parsed.alignmentScore || 0)),
      alignmentReasoning: parsed.alignmentReasoning || 'Unable to analyze alignment',
      matchedValues: parsed.matchedValues || [],
      qualificationAnalysis: parsed.qualificationAnalysis || {
        greenFlagsMatched: [],
        redFlagsDetected: [],
        dealBreakersPresent: [],
        mustHavesMet: [],
      },
    };
  } catch (e) {
    console.error('Failed to parse engagement analysis:', e);
    return {
      engagementScore: 0,
      engagementReasoning: 'Unable to analyze engagement',
      signals: [],
      alignmentScore: 0,
      alignmentReasoning: 'Unable to analyze alignment',
      matchedValues: [],
      qualificationAnalysis: {
        greenFlagsMatched: [],
        redFlagsDetected: [],
        dealBreakersPresent: [],
        mustHavesMet: [],
      },
    };
  }
}

function generateRecommendation(
  totalScore: number,
  temperature: string,
  qualificationAnalysis: any
): {
  action: 'call_immediately' | 'call_soon' | 'email_first' | 'skip';
  reasoning: string;
  talkingPoints: string[];
} {
  const { greenFlagsMatched, redFlagsDetected, dealBreakersPresent } = qualificationAnalysis;

  // Deal-breakers present = skip
  if (dealBreakersPresent && dealBreakersPresent.length > 0) {
    return {
      action: 'skip',
      reasoning: `Deal-breakers detected: ${dealBreakersPresent.join(', ')}`,
      talkingPoints: [],
    };
  }

  // Hot lead = call immediately
  if (temperature === 'hot') {
    return {
      action: 'call_immediately',
      reasoning: `High score (${totalScore}/100) with strong green flags`,
      talkingPoints: [
        ...(greenFlagsMatched || []).map((flag: string) => `Lead showed: ${flag}`),
        'Lead is ready to move forward',
        'Strike while interest is high',
      ],
    };
  }

  // Warm lead with more green than red = call soon
  if (
    temperature === 'warm' &&
    greenFlagsMatched &&
    redFlagsDetected &&
    greenFlagsMatched.length > redFlagsDetected.length
  ) {
    return {
      action: 'call_soon',
      reasoning: `Good potential (${totalScore}/100) but some uncertainty`,
      talkingPoints: [
        ...(greenFlagsMatched || []).map((flag: string) => `Positive: ${flag}`),
        ...(redFlagsDetected || []).map((flag: string) => `Address: ${flag}`),
      ],
    };
  }

  // Warm lead with red flags = email first
  if (temperature === 'warm') {
    return {
      action: 'email_first',
      reasoning: `Mixed signals (${totalScore}/100) - nurture via email first`,
      talkingPoints: [
        ...(redFlagsDetected || []).map((flag: string) => `Concern to address: ${flag}`),
        'Send educational content',
        'Build trust before calling',
      ],
    };
  }

  // Cold lead = skip
  return {
    action: 'skip',
    reasoning: `Low score (${totalScore}/100) - not a good fit`,
    talkingPoints: [],
  };
}
