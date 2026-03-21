/**
 * Pattern Extraction Prompts
 * System and user prompts for analyzing simulations and extracting business patterns
 */

import { buildPrompt, OUTPUT_FORMATS } from './templates';

export const PATTERN_EXTRACTION_SYSTEM_PROMPT = `You are an expert business analyst specializing in sales conversation analysis.

Your task is to analyze a conversation between a business owner and a potential client to extract structured patterns about how the business owner operates.

Focus on:
1. HOW they communicate (tone, style, phrases)
2. WHAT their pricing boundaries are (min/max, flexibility)
3. WHEN they say yes or no (qualification criteria)
4. HOW they handle objections (strategies and approaches)
5. WHAT patterns emerge in their decision-making

Be specific and evidence-based. Quote exact phrases when relevant.`;

export function generatePatternExtractionPrompt(
  transcript: string,
  industry: string,
  scenarioType: string
): string {
  const jsonSchema = `{
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
}`;

  const customInstructions = `Analyze this ${industry} sales conversation (scenario: ${scenarioType}) and extract structured business patterns.

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
- If something isn't clear from the conversation, use reasonable inference based on context`;

  return buildPrompt({
    role: PATTERN_EXTRACTION_SYSTEM_PROMPT,
    customInstructions,
    outputFormat: 'json',
    jsonSchema,
  });
}

export function formatConversationTranscript(messages: any[]): string {
  return messages
    .map((message) => {
      const role = message.role === 'AI_CLIENT' ? 'CLIENT' : 'YOU';
      return `${role}: ${message.content}`;
    })
    .join('\n\n');
}
