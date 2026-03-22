/**
 * Pattern Extraction Prompts
 * System and user prompts for analyzing simulations and extracting business patterns
 */

import { buildPrompt, OUTPUT_FORMATS } from './templates';

export const PATTERN_EXTRACTION_SYSTEM_PROMPT = `You are an expert business analyst specializing in extracting the BUSINESS OWNER'S patterns from sales training simulations.

**CRITICAL PERSPECTIVE RULE:**
Analyze ONLY the business owner's behavior, criteria, and decision-making.
DO NOT confuse the customer's complaints or behavior with the owner's deal-breakers.

Your task: Extract how the OWNER operates, not how the CUSTOMER behaves.

**Key Distinctions:**
- Owner's "deal-breaker" = Why owner rejects/rejected a customer
- Customer's complaint = What customer complained about (ignore this)
- Owner's green flag = What excites the owner
- Customer's criticism = What customer criticized (not relevant to owner's patterns)

Focus on what the owner ACTUALLY SAID and DID in this conversation.`;

export function generatePatternExtractionPrompt(
  transcript: string,
  industry: string,
  scenarioType: string
): string {
  const jsonSchema = `{
  "communicationStyle": {
    "tone": "professional" | "casual" | "empathetic" | "direct" | "friendly",
    "style": "data-driven" | "emotional" | "educational" | "consultative",
    "keyPhrases": ["intent-based descriptions, NOT verbatim quotes"],
    "formality": "formal" | "conversational" | "casual",
    "responsePattern": "how owner typically structures responses"
  },
  "pricingLogic": {
    "minBudget": number | null,
    "maxBudget": number | null,
    "typicalRange": "string description",
    "flexibilityFactors": ["what makes owner negotiate"],
    "dealBreakers": ["budget-related reasons owner rejects clients"],
    "pricingConfidence": "how confidently owner discusses pricing"
  },
  "qualificationCriteria": {
    "mustHaves": ["Requirements owner stated clients MUST have"],
    "dealBreakers": ["Reasons owner REJECTED or would reject this client"],
    "greenFlags": ["Client behaviors that made owner ENTHUSIASTIC"],
    "redFlags": ["Client behaviors that made owner HESITANT"],
    "confidence": {
      "mustHaves": "high" | "medium" | "low" | "not_demonstrated",
      "dealBreakers": "high" | "medium" | "low" | "not_demonstrated",
      "greenFlags": "high" | "medium" | "low" | "not_demonstrated",
      "redFlags": "high" | "medium" | "low" | "not_demonstrated"
    }
  },
  "objectionHandling": {
    "priceObjection": "how owner responded when customer questioned price",
    "timelineObjection": "how owner responded to timeline concerns",
    "competitorObjection": "how owner responded to competitor mentions",
    "qualityObjection": "how owner justified their value/quality",
    "criticismHandling": "how owner responded to customer criticism",
    "unansweredObjections": ["objections customer raised but owner didn't address"]
  },
  "decisionMakingPatterns": {
    "whenToSayYes": ["Conditions under which owner ACCEPTED or showed willingness"],
    "whenToSayNo": ["Conditions under which owner REJECTED or declined"],
    "warningSignsToWatch": ["What made owner pause, ask clarifying questions, or become cautious"],
    "decisionSpeed": "how quickly owner makes yes/no decisions",
    "confidence": {
      "whenToSayYes": "high" | "medium" | "low" | "not_demonstrated",
      "whenToSayNo": "high" | "medium" | "low" | "not_demonstrated"
    }
  },
  "conversationQuality": {
    "unansweredQuestions": ["List of specific questions customer asked that owner did NOT answer"],
    "hasResolution": true | false,
    "resolutionType": "accepted" | "rejected" | "scheduled_followup" | "none",
    "completenessScore": "0-100 (100=complete, 0=incomplete)",
    "missingPatterns": ["Expected patterns for this scenario that were NOT demonstrated"],
    "conversationFlow": "smooth" | "interrupted" | "one_sided" | "incomplete",
    "overallConfidence": "high" | "medium" | "low"
  },
  "extractionNotes": {
    "strengths": ["What the owner handled well in this conversation"],
    "weaknesses": ["What the owner struggled with or avoided"],
    "suggestions": ["What owner should practice in future simulations"]
  }
}`;

  const customInstructions = `You are analyzing a training simulation between a BUSINESS OWNER and an AI playing a DIFFICULT CLIENT.

Your task: Extract the BUSINESS OWNER'S patterns, criteria, and decision-making logic.

CRITICAL PERSPECTIVE RULES:

🎯 ALWAYS ASK: "Is this the OWNER'S perspective or the CUSTOMER'S perspective?"

Example 1 - Deal-Breakers:
Customer says: "Your spelling concern me about detail orientation"
Owner says: "I have spelling issues, does it relate to construction?"

❌ WRONG: dealBreaker: "spelling_concerns_about_detail"
   (This is the customer's complaint about the owner)

✅ RIGHT: redFlag: "not_demonstrated"
   extractionNotes.weaknesses: ["Owner became defensive about spelling criticism"]

Example 2 - Decision Making:
Customer asks 7 questions, owner answers 2, ignores 5

❌ WRONG: whenToSayNo: ["daily_communication_demands", "portfolio_requests"]
   (Owner never said no, just didn't answer)

✅ RIGHT:
   whenToSayNo: ["not_demonstrated"]
   conversationQuality.unansweredQuestions: [list of actual questions]
   extractionNotes.weaknesses: ["Owner avoided answering difficult questions"]

Example 3 - Grammar/Spelling:
Owner says: "we are profssionals with 15 years exprince"

❌ WRONG: keyPhrases: ["we are profssionals with 15 years exprince"]
✅ RIGHT: keyPhrases: ["emphasizes professionalism and extensive experience"]

CONVERSATION TRANSCRIPT:
${transcript}

INDUSTRY CONTEXT:
- Industry: ${industry}
- Scenario Type: ${scenarioType}

EXTRACTION INSTRUCTIONS:

1. COMMUNICATION STYLE
   - Extract INTENT and TONE, not verbatim text
   - If owner has spelling errors, capture meaning instead
   - Identify natural response patterns
   - Note formality level and emotional tone

2. PRICING LOGIC
   - What budget ranges did owner mention?
   - When did owner show flexibility vs. firmness?
   - What pricing-related reasons would make owner reject a client?
   - How confidently does owner discuss money?

3. QUALIFICATION CRITERIA

   MUST-HAVES: Things owner REQUIRES from clients
   - Look for: "You need to...", "We require...", "It's important that..."
   - If owner never stated requirements → confidence: "not_demonstrated"

   DEAL-BREAKERS: Reasons owner REJECTS clients
   - Look for: Owner says NO, declines, ends conversation
   - Example: "We can't work with that budget" or "That timeline won't work"
   - If owner never rejected anything → confidence: "not_demonstrated"
   - DO NOT include customer's complaints about owner

   GREEN FLAGS: Client behaviors that EXCITED the owner
   - Look for: Owner responds enthusiastically, gets engaged
   - Example: Customer mentions big budget → owner says "Great!"

   RED FLAGS: Client behaviors that made owner HESITANT
   - Look for: Owner pauses, asks follow-ups, becomes cautious
   - This is OWNER'S reaction, NOT customer criticizing owner

4. OBJECTION HANDLING
   - How did owner respond to price concerns?
   - How did owner handle timeline questions?
   - How did owner react to criticism?
   - What objections did owner NOT address?

5. DECISION-MAKING PATTERNS

   WHEN TO SAY YES:
   - Only if owner ACTUALLY accepted or showed clear willingness
   - Example: "Let's do it", "I'd love to work with you"
   - If owner never clearly accepted → confidence: "not_demonstrated"

   WHEN TO SAY NO:
   - Only if owner ACTUALLY rejected or declined
   - Example: "We can't do that", "That won't work"
   - If owner never clearly rejected → confidence: "not_demonstrated"

   WARNING SIGNS:
   - What made owner pause or become cautious?
   - Internal warning signs owner watches for

6. CONVERSATION QUALITY ASSESSMENT

   UNANSWERED QUESTIONS:
   - List every customer question owner didn't address
   - Include the actual question text

   RESOLUTION CHECK:
   - Did conversation end with clear next steps?
   - Did owner accept, reject, or schedule follow-up?

   COMPLETENESS SCORE:
   - 100: All questions answered, clear resolution, good flow
   - 75-99: Most questions answered, has resolution
   - 50-74: Some questions unanswered, weak resolution
   - 25-49: Many questions unanswered, no clear resolution
   - 0-24: Incomplete conversation, owner avoided difficult topics

   MISSING PATTERNS:
   - For ${scenarioType} scenario, what should have been demonstrated?
   - Example: DEMANDING scenario should show how owner handles pushiness
   - If owner avoided addressing it → note this

7. EXTRACTION NOTES

   STRENGTHS: What owner did well
   - Example: "Clearly stated budget requirements"

   WEAKNESSES: What owner struggled with
   - Example: "Avoided answering questions about portfolio"

   SUGGESTIONS: What to practice next
   - Example: "Practice confidently declining unrealistic demands"

CRITICAL REMINDERS:

✅ Extract INTENT, not verbatim text (grammar cleanup)
✅ Only mark as "demonstrated" if owner ACTUALLY did it
✅ Distinguish owner's criteria from customer's complaints
✅ List unanswered questions explicitly
✅ Assess conversation completeness honestly
✅ Provide constructive feedback in extractionNotes

❌ DO NOT copy spelling/grammar errors
❌ DO NOT confuse customer complaints with owner deal-breakers
❌ DO NOT say owner "rejects X" if they never rejected anything
❌ DO NOT assume patterns that weren't demonstrated

OUTPUT FORMAT:
Return ONLY valid JSON matching the schema above.
No markdown formatting, no explanations, just the JSON.`;

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
