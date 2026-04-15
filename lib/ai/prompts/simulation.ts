/**
 * Simulation Client Role Prompts
 * Defines AI personas for different scenario types
 */

import { prisma } from '@/lib/prisma';
import { getIndustryTemplate } from '@/lib/templates';
import { buildPrompt, BEHAVIOR_RULES } from './templates';

export type ScenarioType = "PRICE_SENSITIVE" | "INDECISIVE" | "DEMANDING" | "TIME_PRESSURED" | "HIGH_BUDGET";

export interface SimulationScenarioConfig {
  scenarioType: ScenarioType;
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

/**
 * Generate enhanced system prompt using templates + extracted patterns
 * This creates industry-specific and personalized simulations
 * CRITICAL: Accepts businessProfile instead of tenantId to ensure industry context is never lost
 */
export async function generateSimulationPrompt(
  scenarioType: ScenarioType,
  businessProfile: any
): Promise<string> {
  try {
    // Extract industry from the provided profile
    const industry = businessProfile?.industry;

    // Get industry template
    const template = getIndustryTemplate(industry);

    if (!template) {
      // Fallback to generic scenario
      const config = getScenarioConfig(scenarioType);
      return generateSimulationClientPrompt(config);
    }

    // Get base persona from template
    const basePersona = template.scenarios[scenarioType];

    // Build custom instructions with scenario-specific details
    const customInstructions = `SCENARIO: ${scenarioType}

CLIENT PROFILE:
- Type: ${basePersona.clientType}
- Budget: ${basePersona.budget}
- Personality: ${basePersona.personality}

PAIN POINTS:
${basePersona.painPoints.map(p => `- ${p}`).join('\n')}

KEY BEHAVIORS:
- Start with this opening line (or similar): "${basePersona.openingLine}"
- Ask realistic questions and raise objections throughout the conversation
- Use these typical objections when appropriate:
${basePersona.typicalObjections.map(o => `  - ${o}`).join('\n')}
- Be skeptical but genuinely interested
- Challenge the business owner to see how they handle it
- This is practice for the business owner

CONTEXT ABOUT THE BUSINESS:
${businessProfile?.serviceDescription || template.serviceDescription}

Target clients: ${businessProfile?.targetClientType || template.targetClientType}
Typical budget range: ${businessProfile?.typicalBudgetRange || template.typicalBudgetRange}

${
  businessProfile?.communicationStyle
    ? `BUSINESS OWNER COMMUNICATION STYLE:
The business owner tends to communicate: ${(businessProfile.communicationStyle as any).tone || 'professionally'}
${(businessProfile.communicationStyle as any).energyLevel ? `Energy level: ${(businessProfile.communicationStyle as any).energyLevel}` : ''}
${(businessProfile.communicationStyle as any).commonPhrases ? `Uses common phrases like: ${((businessProfile.communicationStyle as any).commonPhrases as string[]).join(', ')}` : ''}`
    : ''
}

${
  businessProfile?.qualificationCriteria
    ? `LEAD QUALIFICATION:
Deal breakers for the business owner: ${(((businessProfile.qualificationCriteria as any).dealBreakers as any[]) || []).map((d: any) => d?.rule ?? d).filter(Boolean).join(', ') || 'None defined yet'}
Green flags they look for: ${(((businessProfile.qualificationCriteria as any).greenFlags as any[]) || []).map((g: any) => g?.description ?? g?.flagType ?? g).filter(Boolean).join(', ') || 'None defined yet'}`
    : ''
}

CRITICAL INSTRUCTIONS TO PREVENT PERSONA SWITCHING:
- You are a ${basePersona.clientType} in the ${template.displayName.toUpperCase()} industry
- NEVER, under any circumstances, break character or switch to a different industry
- Do NOT suddenly become a startup founder, consultant, or any other profession
- Maintain this ${industry} industry persona for the ENTIRE conversation
- If asked about unrelated industries, respond as this client would (confused or disinterested)
- Your context, background, and goals are all tied to the ${template.displayName} industry`;

    // Use buildPrompt to assemble the system prompt
    return buildPrompt({
      role: `You are roleplaying as a potential client for a ${template.displayName} professional.`,
      behavior: 'strict',
      industryContext: {
        industry,
        service: businessProfile?.serviceDescription || template.serviceDescription,
        targetClient: businessProfile?.targetClientType || template.targetClientType,
      },
      customInstructions,
      outputFormat: 'conversational',
    });
  } catch (error) {
    console.error('Error generating simulation prompt:', error);
    // Graceful fallback
    const config = getScenarioConfig(scenarioType);
    return generateSimulationClientPrompt(config);
  }
}
