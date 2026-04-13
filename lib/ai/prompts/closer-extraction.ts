/**
 * CLOSER Framework Extraction
 * Extracts owner's CLOSER framework phrases and objection handling from simulations
 */

export function generateCloserExtractionPrompt(transcript: string): string {
  return `OWNER VOICE EXTRACTION - CLOSER FRAMEWORK

From this simulation conversation, extract how the owner demonstrates each part of the CLOSER framework.

Extract VERBATIM phrases - exact words owner used, not summaries.

Conversation:
${transcript}

C - CLARIFYING QUESTIONS:
What questions did owner ask to understand:
- Why the client is considering this now?
- What triggered the decision?
- What's the timeline/urgency?

Extract exact questions owner asked.

Example:
Owner: "What brought you to consider a remodel right now?"
✅ EXTRACT: "What brought you to consider a remodel right now?"
❌ DON'T: "owner asked about timing"

O - PAIN EMPATHY & OVERVIEW:
How did owner show empathy and explore pain?
Extract exact phrases owner used to:
- Acknowledge client frustration
- Explore what they've tried before
- Understand their struggles

Example:
Owner: "I completely understand - that's frustrating. What's been the biggest challenge?"
✅ EXTRACT: "I completely understand - that's frustrating"

L - LABELING PHRASES:
How did owner label/summarize the problem?
Extract exact phrases owner used to:
- Summarize what client needs
- Get confirmation on understanding
- Define the problem clearly

Example:
Owner: "So it sounds like you're looking for quality work with transparent pricing"
✅ EXTRACT: "So it sounds like you're looking for..."

S - OUTCOME SELLING:
How did owner sell the outcome (not the tool)?
Extract exact phrases owner used to:
- Paint vision of success
- Focus on result/benefit
- Describe transformation

Example:
Owner: "What we're really building here is peace of mind - no more worrying about..."
✅ EXTRACT: "What we're really building here is peace of mind"

E - OBJECTION HANDLING:
How did owner handle different objections?
Extract FULL responses (not summaries) for:
- Budget objections
- Timeline objections
- Quality concerns
- Competitor comparisons

Example:
Client: "That seems expensive"
Owner: "I understand budget is important. Let me break down what's included in that price. You're getting premium materials, full warranty, and..."
✅ EXTRACT FULL RESPONSE as string under "budget" key

R - REINFORCEMENT & BOOKING:
How did owner close and book next steps?
Extract exact phrases owner used to:
- Reinforce the decision
- Book meetings
- Set expectations
- Create commitment

Example:
Owner: "Let's schedule a time to discuss this in detail. I'll make sure you go into this with full clarity."
✅ EXTRACT: "Let's schedule a time to discuss this in detail"

COMMON QUESTIONS & ANSWERS:
Extract FAQ-style questions clients ask and owner's VERBATIM answers.

Example:
Q: "How do you price projects?"
A: "Before I finalize any number, I make sure we define exactly what you're getting - layout changes, cabinetry level, materials, electrical, plumbing, finishes, everything."

KEY PHRASES (General):
Extract general phrases that show owner's communication style and values.

Example:
"I focus on building a clear, transparent scope upfront"
"My approach is scope first, price second"

OUTPUT JSON STRUCTURE (return ONLY valid JSON):
{
  "closerFramework": {
    "clarifyingQuestions": [
      "What brought you to consider this right now?",
      "What's driving the timeline for you?"
    ],
    "painEmpathyPhrases": [
      "I completely understand - that's frustrating",
      "I've heard that from other clients who came to me"
    ],
    "labelingPhrases": [
      "So it sounds like you're looking for...",
      "If I'm understanding correctly, the main challenge is..."
    ],
    "outcomeSelling": [
      "What we're really building here is peace of mind",
      "The outcome you'll get is..."
    ],
    "objectionHandling": {
      "budget": "I understand budget is important. With $40k, we can absolutely create a high-quality kitchen. Let me break down what that includes...",
      "timeline": "Typically 6-8 weeks for a full kitchen. That includes planning, permitting, demolition, and installation...",
      "quality": "For cabinets, we use solid plywood boxes with quality hardware - not particle board...",
      "competitor": "I've reviewed competitor quotes for clients before. Often what looks cheaper is missing key items..."
    },
    "reinforcement": [
      "Let's schedule a time to discuss this in detail",
      "I'll make sure you go into this with full clarity",
      "My goal is simple: no surprises, no hidden costs"
    ]
  },
  "keyPhrases": [
    "I focus on building a clear, transparent scope upfront",
    "My approach is scope first, price second"
  ],
  "commonQuestions": [
    {
      "question": "How do you price projects?",
      "answer": "Before I finalize any number, I make sure we define exactly what you're getting - layout changes, cabinetry level, materials, electrical, plumbing, finishes, everything. Two quotes can look similar on paper but be very different in reality."
    },
    {
      "question": "How long does a typical kitchen take?",
      "answer": "Typically 6-8 weeks for a full kitchen. That includes planning, permitting, demolition, and installation. Timeline depends on scope and material availability."
    }
  ],
  "extractionConfidence": {
    "clarifyingQuestions": "high" | "medium" | "low" | "none",
    "painEmpathy": "high" | "medium" | "low" | "none",
    "labelingPhrases": "high" | "medium" | "low" | "none",
    "outcomeSelling": "high" | "medium" | "low" | "none",
    "objectionHandling": "high" | "medium" | "low" | "none",
    "reinforcement": "high" | "medium" | "low" | "none"
  },
  "notes": "Additional observations about owner's communication style"
}

CRITICAL RULES:
1. Extract VERBATIM - exact words owner said
2. For objection handling, extract FULL responses (not summaries)
3. If owner didn't demonstrate a CLOSER component, mark as empty array or null
4. Focus on phrases that sound natural, not scripted
5. Grammar is OK to fix, but keep the owner's voice/style
6. Return ONLY valid JSON, no markdown or explanations`;
}

export interface CloserExtractionResult {
  closerFramework: {
    clarifyingQuestions: string[];
    painEmpathyPhrases: string[];
    labelingPhrases: string[];
    outcomeSelling: string[];
    objectionHandling: {
      budget?: string;
      timeline?: string;
      quality?: string;
      competitor?: string;
    };
    reinforcement: string[];
  };
  keyPhrases: string[];
  commonQuestions: Array<{
    question: string;
    answer: string;
  }>;
  extractionConfidence: {
    clarifyingQuestions: 'high' | 'medium' | 'low' | 'none';
    painEmpathy: 'high' | 'medium' | 'low' | 'none';
    labelingPhrases: 'high' | 'medium' | 'low' | 'none';
    outcomeSelling: 'high' | 'medium' | 'low' | 'none';
    objectionHandling: 'high' | 'medium' | 'low' | 'none';
    reinforcement: 'high' | 'medium' | 'low' | 'none';
  };
  notes?: string;
}
