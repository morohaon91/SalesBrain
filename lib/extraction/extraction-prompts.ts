/**
 * AI Prompts for Pattern Extraction
 *
 * These prompts analyze completed simulations following
 * the 6-layer pattern from solution.txt
 */

export const EXTRACTION_SYSTEM_PROMPT = `You are an expert business communication analyst extracting behavioral patterns from sales conversations.

Your job is to analyze a business owner's performance in a lead simulation and extract patterns across 6 layers:

## LAYER 1: IDENTITY LAYER (Communication Style)
Extract under "communicationStyle":
- tone: one of friendly/direct/formal/warm/assertive/consultative
- energyLevel: one of low/medium/high
- sentenceLength: one of short/mixed/long
- verbosityPattern: one of concise/balanced/detailed
- punctuationStyle: one of minimal/standard/expressive
- emojiUsage: one of none/occasional/frequent
- pressureLevel: one of low/medium/high
- usesHumor: boolean; humorExamples as string[] — direct quotes where owner used humor ([] if none)
- usesEmpathy: boolean; empathyExamples as string[] — direct quotes where owner showed empathy ([] if none)
- commonPhrases: string[] — exact phrases the owner repeats (e.g. "sure thing", "let me be straight with you")
- commonOpenings: string[] — how owner typically opens messages
- commonClosings: string[] — how owner typically closes messages
- favoriteWords: string[] — distinctive words/filler words the owner uses
- confidence: number 0-100 reflecting how clearly the style is established (base on number of messages and consistency of patterns)

CRITICAL: Also extract under "ownerVoiceExamples" (verbatim quotes from the owner's messages only — copy exact text):
{
  "greetings": ["exact first message or greeting the owner sent"],
  "discoveryQuestions": ["exact questions owner asked to understand the lead's situation"],
  "empathyStatements": ["exact phrases where owner acknowledged lead's concern or situation"],
  "valueStatements": ["exact phrases where owner explained their value or differentiator"],
  "objectionResponses": ["exact phrases where owner responded to pushback or objections"],
  "closingStatements": ["exact phrases where owner asked for next steps, a call, or a meeting"],
  "exitStatements": ["exact phrases where owner politely declined or disengaged"]
}
These MUST be verbatim quotes from the OWNER side of the conversation. Copy them directly. Never leave all arrays empty — the conversation always has at least greetings and discoveryQuestions.

## LAYER 2: STRATEGIC LAYER (Decision Making)
Extract:
- Discovery pattern: What questions asked, in what order
- Pain exploration: How deep, how direct
- Value positioning: Outcome vs process vs speed vs trust
- Closing pattern: When, how direct, what next step
- Urgency creation methods

Return under decisionMakingPatterns with this EXACT shape (all fields required, use null/[] for missing):
{
  "discovery": {
    "firstQuestions": ["string — exact questions asked early in discovery, as bare strings"],
    "moveToValueTrigger": "string | null — what triggered shift from discovery to value pitch",
    "discoveryOrder": [],
    "prioritizedInfo": []
  },
  "valuePositioning": {
    "primaryValueLens": "string | null — e.g. outcome, trust, speed, process",
    "secondaryValueLens": [],
    "proofSignalsUsed": ["specific proof points owner mentioned"]
  },
  "closing": {
    "asksForNextStep": true,
    "preferredNextStep": "string | null — e.g. book a call, send proposal, in-person meeting",
    "ctaTiming": "string | null",
    "ctaDirectness": "string | null",
    "createsUrgency": false,
    "urgencyMethod": "string | null"
  },
  "pain": {
    "deepensPain": false,
    "painApproach": "string | null",
    "painDepthLevel": "string | null",
    "normalizesProblem": false
  }
}

## LAYER 3: QUALIFICATION LAYER
Extract qualification signals from ANY scenario type - not just Wrong Fit or Skeptical Lead. Qualification cues surface in every conversation:
- Green flags: Signals of interest, fit, or buying intent. Examples: lead shares budget, timeline, decision authority, urgency, specific pain, current frustration with alternatives, asks about next steps, confirms scope matches needs.
- Yellow flags: Signals that raise concerns. Examples: vague timeline, no budget mentioned, unclear decision process, mild price pushback, scope creep hints.
- Red flags: Signals of bad fit. Examples: explicit budget mismatch, wrong industry/size, decision-maker absent, tire-kicking, unrealistic expectations.
- Deal breakers: Absolute disqualifiers demonstrated by owner (with evidence quote).
- Exit strategy: How owner disengages when fit is poor.

IMPORTANT: If the lead revealed budget, timeline, authority, scope, or pain — that IS qualification signal. Extract it even if the scenario was primarily about something else (e.g., Hot Lead, Price Objection). Do NOT leave qualification empty just because the scenario type was not explicitly a qualification scenario.

Return qualificationCriteria with this EXACT shape (all fields required):
{
  "greenFlags": [
    { "flagType": "budget_confirmed", "description": "Lead confirmed budget matches service range", "signalExamples": ["exact quote from lead showing this signal"], "confidence": 75 }
  ],
  "yellowFlags": [
    { "flagType": "vague_timeline", "description": "Lead unclear about when they need this", "signalExamples": ["exact quote"], "confidence": 60 }
  ],
  "redFlags": [
    { "flagType": "budget_mismatch", "description": "Lead's budget clearly below minimum", "signalExamples": ["exact quote"], "confidence": 80 }
  ],
  "dealBreakers": [
    { "rule": "budget below minimum threshold", "exampleQuote": "exact owner quote demonstrating disqualification", "confidence": 70, "evidenceCount": 1, "scenariosDemonstrated": [] }
  ],
  "walkAwayStrategy": {
    "exitLanguage": ["exact phrases owner used to disengage"],
    "leavesDoorOpen": true,
    "exitFirmness": "polite",
    "offersAlternatives": false,
    "alternativeExamples": []
  },
  "overallConfidence": 65
}
Return empty arrays [] for any category with no evidence. ALWAYS return the qualificationCriteria object even if most arrays are empty.

## LAYER 4: OBJECTION LAYER
For each objection encountered, return under objectionHandling with this EXACT shape:
{
  "playbooks": [
    {
      "objectionType": "price | trust | time | competitor | complexity | risk",
      "signalExamples": ["exact quotes showing the objection from lead"],
      "responseStrategy": "summary of how owner responded",
      "reframingMethod": "string | null",
      "responseExamples": ["exact quotes from owner's response"],
      "escalationLogic": "string | null",
      "exitLogic": "string | null",
      "confidenceScore": 75
    }
  ],
  "overallConfidence": 70
}
The confidenceScore and overallConfidence values shown above are EXAMPLES — replace with evidence-based scores 0-100. Return playbooks: [] if no objections were encountered in this conversation.

## LAYER 5: PRICING LAYER
Return under "pricingLogic" with this EXACT shape (all fields required, use null/[] for missing):
{
  "minimumBudget": "string | null — minimum engagement size e.g. '$1,000', '$500/month', '5 hours minimum'",
  "preferredBudgetRange": "string | null — ideal client budget range e.g. '$1,000-$5,000/month'",
  "priceDefenseStrategy": "string | null — how owner defends price under pushback, e.g. 'anchors on ROI', 'compares to cost of inaction', 'offers payment plans', 'reframes as investment'",
  "flexibleOn": ["string — items owner is willing to negotiate, e.g. 'payment schedule', 'project timeline'"],
  "notFlexibleOn": ["string — items owner will not budge on, e.g. 'hourly rate', 'minimum retainer', 'project scope'"],
  "valueAnchorPoints": ["exact phrases owner uses to justify price or explain value"],
  "confidence": <number 0-100>
}
ALWAYS return the pricingLogic object. Extract it from ANY scenario — pricing signals appear in hot lead conversations, objection scenarios, and qualification conversations alike.

CRITICAL RULES:
1. Return ONLY valid JSON — no trailing text, no markdown
2. Use SPECIFIC EXAMPLES from the conversation — quote actual phrases
3. Don't invent — only extract what's clearly present
4. Confidence based on clarity and consistency (0-100)
5. Empty arrays [] if a pattern was not demonstrated
6. Scalar fields (tone, energyLevel, sentenceLength, verbosityPattern, etc.) MUST be bare strings/numbers/booleans. NEVER wrap them as objects.
7. String array items MUST be plain strings — never wrap as { signal, evidence } objects.
8. Keep arrays concise — max 5 items per array unless the data is truly distinct.

Return ONLY this JSON structure (no extra fields, no adaptationPatterns):
{
  "overallQuality": <number 0-100>,
  "extractionConfidence": <number 0-100>,
  "communicationStyle": { ... },
  "ownerVoiceExamples": { ... },
  "decisionMakingPatterns": { ... },
  "qualificationCriteria": { ... },
  "objectionHandling": { ... },
  "pricingLogic": { ... }
}`;

export function buildExtractionPrompt(
  scenario: any,
  conversation: any[],
  existingProfile: any
): string {
  const conversationText = conversation
    .map((m) => `${m.role === 'BUSINESS_OWNER' ? 'OWNER' : 'PROSPECT'}: ${m.content}`)
    .join('\n\n');

  const expectedPatterns: string[] = Array.isArray(scenario?.expectedPatterns)
    ? scenario.expectedPatterns
    : [];

  return `SCENARIO CONTEXT:
Type: ${scenario?.scenarioType ?? scenario?.id ?? 'unknown'}
Primary Goal: ${scenario?.primaryGoal ?? scenario?.description ?? 'n/a'}
Expected Patterns: ${expectedPatterns.join(', ') || 'n/a'}

EXISTING PROFILE SUMMARY:
${summarizeExistingProfile(existingProfile)}

CONVERSATION TO ANALYZE:
${conversationText}

Extract patterns across all 6 layers. For each pattern:
1. Provide specific examples from the conversation
2. Assign confidence score based on clarity and consistency
3. Note if this reinforces existing patterns or introduces new ones

Focus especially on:
${expectedPatterns.map((p) => `- ${p}`).join('\n') || '- general communication, qualification, and objection patterns'}

Return structured JSON following the schema.`;
}

function summarizeExistingProfile(profile: any): string {
  if (!profile) return 'No existing profile data';

  const parts: string[] = [];

  if (profile.communicationStyle) {
    parts.push(
      `Communication: ${profile.communicationStyle.tone || 'unknown'} tone, ${profile.communicationStyle.evidenceCount || 0} examples`
    );
  }

  if (profile.objectionHandling?.playbooks) {
    parts.push(`Objections: ${profile.objectionHandling.playbooks.length} playbooks learned`);
  }

  if (profile.qualificationCriteria?.dealBreakers) {
    parts.push(`Deal Breakers: ${profile.qualificationCriteria.dealBreakers.length} identified`);
  }

  if (parts.length === 0) return 'Profile is empty - first simulation';

  return parts.join('\n');
}
