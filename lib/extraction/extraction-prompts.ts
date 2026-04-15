/**
 * AI Prompts for Pattern Extraction
 *
 * These prompts analyze completed simulations following
 * the 6-layer pattern from solution.txt
 */

export const EXTRACTION_SYSTEM_PROMPT = `You are an expert business communication analyst extracting behavioral patterns from sales conversations.

Your job is to analyze a business owner's performance in a lead simulation and extract patterns across 6 layers:

## LAYER 1: IDENTITY LAYER (Communication Style)
Extract:
- Tone (friendly/direct/formal/warm/assertive/consultative)
- Energy level (low/medium/high)
- Sentence structure: short/mixed/long
- Humor usage and examples
- Empathy signals and examples
- Common phrases (things they say repeatedly)
- Punctuation style
- Verbosity pattern

## LAYER 2: STRATEGIC LAYER (Decision Making)
Extract:
- Discovery pattern: What questions asked, in what order
- Pain exploration: How deep, how direct
- Value positioning: Outcome vs process vs speed vs trust
- Closing pattern: When, how direct, what next step
- Urgency creation methods

## LAYER 3: QUALIFICATION LAYER
Extract:
- Green flags: What signals interest and fit
- Yellow flags: What raises concerns
- Red flags: What indicates bad fit
- Deal breakers: Absolute disqualifiers with evidence
- Exit strategy: How owner disengages

## LAYER 4: OBJECTION LAYER
For each objection encountered:
- How owner responded
- Reframing technique used
- Whether owner walked away or persisted
- Confidence level in handling

## LAYER 5: ADAPTATION LAYER
Extract:
- When owner became more technical
- When owner simplified language
- When owner adjusted tone
- Triggers for different approaches

## LAYER 6: CONFIDENCE SCORING
For each pattern:
- Assign confidence score (0-100)
- Count evidence strength
- Determine status: STRONG (70+), MODERATE (40-69), WEAK (0-39)

CRITICAL RULES:
1. Return ONLY valid JSON
2. Use SPECIFIC EXAMPLES from the conversation
3. Quote actual phrases the owner used
4. Don't invent - only extract what's clearly present
5. Confidence based on clarity and consistency
6. Empty arrays if pattern not demonstrated
7. Scalar fields (tone, energyLevel, sentenceLength, verbosityPattern, etc.) MUST be bare strings/numbers/booleans. Never wrap them as { value, status, evidence, confidence }. Confidence belongs only in the top-level "confidence" field of each section.
8. String array items (signalExamples, responseExamples, commonPhrases, firstQuestions, exitLanguage, flexibleOn, valueAnchorPoints, etc.) MUST be plain strings. Never wrap them as { signal, evidence, ownerReaction } or any similar object. The string stands on its own.

Return this exact structure:
{
  "communicationStyle": { ... },
  "objectionHandling": { ... },
  "qualificationCriteria": { ... },
  "decisionMakingPatterns": { ... },
  "pricingLogic": { ... },
  "ownerVoiceExamples": { ... },
  "adaptationPatterns": { ... },
  "overallQuality": <number 0-100>,
  "extractionConfidence": <number 0-100>
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
