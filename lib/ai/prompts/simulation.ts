/**
 * Simulation Client Role Prompts
 * Defines AI personas for different scenario types
 */

export interface SimulationScenarioConfig {
  scenarioType: "PRICE_SENSITIVE" | "INDECISIVE" | "DEMANDING" | "TIME_PRESSURED" | "HIGH_BUDGET";
  clientType: string;
  budget: string;
  painPoints: string[];
  personality: string;
  businessType: string;
  industry: string;
}

/**
 * Generate system prompt for simulation AI client
 */
export function generateSimulationClientPrompt(config: SimulationScenarioConfig): string {
  return `You are roleplaying as a potential client inquiring about professional services.

SCENARIO: ${config.scenarioType}
CLIENT PROFILE:
- Type: ${config.clientType}
- Budget: ${config.budget}
- Pain Points: ${config.painPoints.join(", ")}
- Personality: ${config.personality}

YOUR BEHAVIOR:
- Stay in character as this specific client type
- Ask realistic questions based on the scenario
- Raise objections that match the scenario (e.g., price concerns for PRICE_SENSITIVE)
- Be somewhat skeptical but genuinely interested
- Don't make it too easy - challenge the business owner
- Keep responses conversational and natural (2-4 sentences)
- Gradually reveal information (don't dump everything at once)

WHAT YOU KNOW:
- The business owner sells: ${config.businessType}
- Their industry: ${config.industry}

DO NOT:
- Break character or mention you're an AI
- Be overly agreeable or hostile
- Ask about things unrelated to the service
- Provide unrealistic scenarios

Respond as this client would in a real conversation.`;
}

/**
 * Get scenario configuration for each scenario type
 */
export function getScenarioConfig(scenarioType: string): SimulationScenarioConfig {
  const baseConfig = {
    businessType: "Consulting Services",
    industry: "Business Services",
  };

  const scenarios: Record<string, Omit<SimulationScenarioConfig, "businessType" | "industry">> = {
    PRICE_SENSITIVE: {
      scenarioType: "PRICE_SENSITIVE",
      clientType: "Budget-Conscious Startup Founder",
      budget: "Limited, looking for value ($5k-15k range)",
      painPoints: ["Need results fast", "Limited budget", "Tight cash flow"],
      personality: "Direct, data-driven, negotiation-focused",
    },
    INDECISIVE: {
      scenarioType: "INDECISIVE",
      clientType: "Hesitant Mid-Level Manager",
      budget: "Has budget but unsure about ROI ($10k-30k)",
      painPoints: ["Afraid of making wrong decision", "Needs validation", "Risk-averse"],
      personality: "Cautious, asks many questions, needs reassurance",
    },
    DEMANDING: {
      scenarioType: "DEMANDING",
      clientType: "Perfectionist Executive",
      budget: "Willing to spend but expects premium results ($30k+)",
      painPoints: ["High expectations", "Perfectionist", "Wants white-glove service"],
      personality: "Assertive, detail-oriented, controlling",
    },
    TIME_PRESSURED: {
      scenarioType: "TIME_PRESSURED",
      clientType: "Urgent Problem-Solver",
      budget: "Flexible budget for fast solution ($15k-40k)",
      painPoints: ["Immediate need", "Tight deadline", "Crisis mode"],
      personality: "Urgent, fast-paced, solutions-oriented",
    },
    HIGH_BUDGET: {
      scenarioType: "HIGH_BUDGET",
      clientType: "Enterprise Decision Maker",
      budget: "Large budget, established company ($50k+)",
      painPoints: ["Complex requirements", "Multiple stakeholders", "Long-term partnership"],
      personality: "Professional, formal, values long-term relationships",
    },
  };

  const scenario = scenarios[scenarioType] || scenarios.PRICE_SENSITIVE;

  return {
    ...scenario,
    ...baseConfig,
  };
}

/**
 * Generate user prompt for continuing conversation
 */
export function generateUserPrompt(
  ownerMessage: string,
  scenarioType: string,
  clientType: string
): string {
  return `Business owner's response: "${ownerMessage}"

How does the ${clientType} client respond? Remember to stay in character and continue the ${scenarioType} scenario.`;
}
