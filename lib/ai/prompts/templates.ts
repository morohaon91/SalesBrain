/**
 * Prompt Templates and Reusable Components
 * Provides building blocks for constructing consistent, well-structured prompts
 */

/**
 * Standard behavior rules that can be reused across different prompt types
 */
export const BEHAVIOR_RULES = {
  standard: `YOUR BEHAVIOR:
- Stay conversational and natural (2-4 sentences per response)
- Ask realistic questions and raise genuine concerns
- Be authentic and don't be overly agreeable
- Gradually reveal information (don't dump everything at once)
- Keep responses concise but substantive`,

  strict: `CRITICAL BEHAVIOR RULES:
- Stay in character for the ENTIRE conversation - NEVER break character
- Do NOT switch industries, personas, or scenarios under any circumstances
- Do NOT acknowledge that you are an AI or that this is a simulation
- Maintain your assigned role, background, and goals throughout
- If asked about unrelated topics, respond as your character would (confused or disinterested)`,

  professional: `YOUR COMMUNICATION STYLE:
- Maintain professional and courteous tone throughout
- Listen actively and acknowledge concerns
- Provide thoughtful, evidence-based responses
- Be confident but not arrogant
- Focus on value and mutual benefit`,
} as const;

/**
 * Output format instructions for different response types
 */
export const OUTPUT_FORMATS = {
  json: (schema: string) => `OUTPUT FORMAT (respond with ONLY this JSON structure, no markdown, no explanations):
${schema}`,

  structured: `OUTPUT FORMAT:
Provide a clearly structured response with:
- Main sections separated by headers
- Bullet points for lists
- Concise descriptions`,

  conversational: `Respond naturally and conversationally without special formatting.`,
} as const;

/**
 * Industry-specific context and communication style guidelines
 */
export const INDUSTRY_CONTEXT = {
  generate: (industry: string, service: string, targetClient: string) =>
    `INDUSTRY & BUSINESS CONTEXT:
Industry: ${industry}
Service: ${service}
Target Client Type: ${targetClient}`,

  communicationStyle: (industry: string): string => {
    const styles: Record<string, string> = {
      legal_services:
        'Precise, professional, and attorney-client confidential tone. Use legal terminology appropriately. Emphasize compliance, risk mitigation, and strategic planning.',
      fitness_coaching:
        'Motivational, energetic, supportive, and enthusiastic. Use encouraging language. Focus on transformation, results, and personal achievement.',
      mortgage_advisory:
        'Clear, educational, trustworthy, and patient. Explain complex concepts in simple terms. Emphasize security, stability, and long-term planning.',
      business_consulting:
        'Strategic, results-oriented, confident, and analytical. Use business terminology. Focus on ROI, efficiency, and competitive advantage.',
      interior_design:
        'Creative, visual, enthusiastic, and collaborative. Use descriptive language. Focus on aesthetics, functionality, and personal vision.',
      real_estate:
        'Informative, market-aware, knowledgeable, and practical. Use real estate terminology appropriately. Emphasize market value, investment potential, and lifestyle fit.',
      financial_advisory:
        'Precise, data-driven, analytical, and trustworthy. Use financial terminology appropriately. Emphasize risk management, returns, and long-term wealth building.',
      marketing_agency:
        'Creative, results-focused, energetic, and strategic. Use marketing terminology. Focus on growth, brand impact, and measurable results.',
    };

    return styles[industry] || 'Professional, clear, and helpful. Adapt your communication to your audience while maintaining authenticity.';
  },
} as const;

/**
 * Confidence and escalation guidelines
 */
export const CONFIDENCE_GUIDELINES = {
  escalation: (ownerName: string) =>
    `ESCALATION RULES:
- If you're asked something outside your expertise, suggest escalating to ${ownerName}
- Do NOT make up information or pretend to know things you don't
- When uncertain, say "I'm not sure about that - let me connect you with my manager"`,

  uncertaintyPhrases: [
    'Hmm, I need to check on that',
    'Let me get back to you on that',
    'That\'s a good question - I\'ll need to verify',
    'I\'m not certain about the details on that',
    "That's outside my area - I'd need to connect you with someone who knows",
  ],
} as const;

/**
 * Common qualification and discovery questions
 */
export const QUALIFICATION_TEMPLATES = {
  budgetQuestions: [
    "What's your budget range for this project?",
    'Do you have a specific amount in mind?',
    'Are you flexible on budget if the value is there?',
    'What would be a stretch budget vs comfortable budget?',
  ],

  authorityQuestions: [
    'Are you the decision maker on this, or will others be involved?',
    'Who else needs to approve decisions like this?',
    'Do you have the authority to move forward, or do you need buy-in from others?',
  ],

  needQuestions: [
    'What problem are you trying to solve?',
    'What does success look like for you?',
    'What\'s the timeline for getting this done?',
    'What have you already tried?',
    'What\'s the cost of waiting or doing nothing?',
  ],
} as const;

/**
 * Build a complete prompt from template components
 * Assembles provided parts into a cohesive prompt
 */
export interface PromptComponents {
  role: string;
  behavior?: 'standard' | 'strict' | 'professional';
  industryContext?: {
    industry: string;
    service: string;
    targetClient: string;
  };
  customInstructions?: string;
  outputFormat?: 'json' | 'structured' | 'conversational';
  jsonSchema?: string;
}

export function buildPrompt(components: PromptComponents): string {
  const parts: string[] = [];

  // 1. Role definition
  if (components.role) {
    parts.push(components.role);
  }

  // 2. Behavior rules
  if (components.behavior) {
    parts.push(BEHAVIOR_RULES[components.behavior]);
  }

  // 3. Industry context
  if (components.industryContext) {
    parts.push(
      INDUSTRY_CONTEXT.generate(
        components.industryContext.industry,
        components.industryContext.service,
        components.industryContext.targetClient
      )
    );

    // Add industry-specific communication style
    const style = INDUSTRY_CONTEXT.communicationStyle(components.industryContext.industry);
    parts.push(`COMMUNICATION STYLE:\n${style}`);
  }

  // 4. Custom instructions
  if (components.customInstructions) {
    parts.push(components.customInstructions);
  }

  // 5. Output format
  if (components.outputFormat === 'json' && components.jsonSchema) {
    parts.push(OUTPUT_FORMATS.json(components.jsonSchema));
  } else if (components.outputFormat === 'structured') {
    parts.push(OUTPUT_FORMATS.structured);
  } else if (components.outputFormat === 'conversational') {
    parts.push(OUTPUT_FORMATS.conversational);
  }

  return parts.join('\n\n');
}

/**
 * Get industry communication guidelines
 */
export function getIndustryGuidelines(industry: string): string {
  return INDUSTRY_CONTEXT.communicationStyle(industry);
}

/**
 * Get specific qualification questions by focus area
 */
export function getQualificationQuestions(
  focus: 'budget' | 'authority' | 'need'
): string[] {
  switch (focus) {
    case 'budget':
      return [...QUALIFICATION_TEMPLATES.budgetQuestions];
    case 'authority':
      return [...QUALIFICATION_TEMPLATES.authorityQuestions];
    case 'need':
      return [...QUALIFICATION_TEMPLATES.needQuestions];
    default:
      return [];
  }
}
