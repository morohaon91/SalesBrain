import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { createChatCompletion } from "@/lib/ai/client";
import {
  generateSimulationPrompt,
} from "@/lib/ai/prompts";
import { getScenarioById } from "@/lib/scenarios/mandatory-scenarios";
import { generateLiveFeedback } from "@/lib/simulations/live-feedback-generator";
import { calculateLiveQualityScore } from "@/lib/simulations/quality-scorer";
import { v4 as uuidv4 } from "uuid";
import { SIMULATION_MESSAGE_WINDOW } from "@/lib/performance/bounds";

const simulationBusinessProfileSelect = {
  id: true,
  industry: true,
  serviceDescription: true,
  targetClientType: true,
  typicalBudgetRange: true,
  communicationStyle: true,
  qualificationCriteria: true,
} as const;

// Legacy enum types — anything not in this list is treated as a new-style scenarioId
const LEGACY_SCENARIO_TYPES = new Set(['PRICE_SENSITIVE', 'INDECISIVE', 'DEMANDING', 'TIME_PRESSURED', 'HIGH_BUDGET']);

/**
 * Request validation schema
 */
const messageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(5000, "Message too long"),
});

type MessageRequest = z.infer<typeof messageSchema>;

/**
 * Response type
 */
interface SendMessageResponse {
  success: boolean;
  data?: {
    messageId: string;
    role: string;
    content: string;
    aiResponse: {
      messageId: string;
      role: string;
      content: string;
      latencyMs: number;
      tokensUsed: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * POST /api/v1/simulations/{id}/message
 * Send a message in simulation and get AI response
 * CRITICAL: Includes tenant and businessProfile to maintain industry context
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // Extract ID from URL
    const simulationId = req.nextUrl.pathname.split("/")[4];
    const { tenantId } = req.auth;

    // Parse and validate request body
    const body = await req.json();
    const validation = messageSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((issue) => ({
        field: String(issue.path[0]),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details,
          },
          meta: { timestamp, requestId },
        },
        { status: 400 }
      );
    }

    const data = validation.data as MessageRequest;

    // FIX 1: Fetch simulation WITH tenant and profiles relationships
    // This ensures we have industry context for prompt generation
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: SIMULATION_MESSAGE_WINDOW,
        },
        tenant: {
          include: {
            profiles: { take: 1, select: simulationBusinessProfileSelect },
          },
        },
      },
    });

    // Verify simulation exists and belongs to tenant
    if (!simulation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Simulation not found",
          },
          meta: { timestamp, requestId },
        },
        { status: 404 }
      );
    }

    if (simulation.tenantId !== tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot access this simulation",
          },
          meta: { timestamp, requestId },
        },
        { status: 403 }
      );
    }

    // Check simulation status
    if (simulation.status !== "IN_PROGRESS") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message: `Cannot send message to ${simulation.status} simulation`,
          },
          meta: { timestamp, requestId },
        },
        { status: 400 }
      );
    }

    // Verify businessProfile exists (should be the first profile)
    const businessProfile = simulation.tenant.profiles?.[0];
    if (!businessProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "Business profile not found",
          },
          meta: { timestamp, requestId },
        },
        { status: 404 }
      );
    }

    // Store business owner's message
    const userMessage = await prisma.simulationMessage.create({
      data: {
        simulationId,
        role: "BUSINESS_OWNER",
        content: data.content,
      },
    });

    // Build system prompt — branch on legacy vs new-style scenario ID
    let systemPrompt: string;
    if (LEGACY_SCENARIO_TYPES.has(simulation.scenarioType)) {
      // Old enum path — full industry-template aware prompt
      systemPrompt = await generateSimulationPrompt(
        simulation.scenarioType as any,
        businessProfile
      );
    } else {
      // New universal scenario ID. Rebuild persona-aware prompt
      // with owner context so AI never drifts to a different industry.
      const scenario = getScenarioById(simulation.scenarioType);
      const ownerIndustry = businessProfile.industry ?? 'your industry';
      const ownerService = (businessProfile as any).serviceDescription ?? `professional ${ownerIndustry} services`;
      const ownerTargetClient = (businessProfile as any).targetClientType ?? 'businesses and homeowners';
      const ownerBudgetRange = (businessProfile as any).typicalBudgetRange ?? 'varies by project';

      const personaDetails = simulation.personaDetails as Record<string, any> | null;
      const personaName = personaDetails?.name ?? 'the client';
      const personaRole = personaDetails?.role ?? '';
      const personaCompany = personaDetails?.company ?? '';
      const personality = personaDetails?.personality ?? '';
      const communicationStyle = personaDetails?.communicationStyle ?? '';
      const technicalLevel = personaDetails?.technicalLevel ?? '';
      const painPoints = Array.isArray(personaDetails?.painPoints) ? personaDetails.painPoints.join(', ') : '';
      const budget = personaDetails?.budget ?? '';
      const timeline = personaDetails?.timeline ?? '';
      const priorExperience = personaDetails?.priorExperience ?? '';
      const objections = Array.isArray(personaDetails?.objectionsToRaise) ? personaDetails.objectionsToRaise.join(', ') : '';

      systemPrompt = `You are roleplaying as a potential CLIENT named ${personaName} reaching out to a ${ownerIndustry} professional.

THE BUSINESS YOU ARE CONTACTING:
- Industry: ${ownerIndustry}
- What they do: ${ownerService}
- Their typical clients: ${ownerTargetClient}
- Typical budget range they work with: ${ownerBudgetRange}

YOUR CLIENT PERSONA:
${scenario ? `- Scenario: ${scenario.name}\n- Situation: ${scenario.description}` : ''}
${personaRole ? `- Role: ${personaRole}` : ''}
${personaCompany ? `- Company type: ${personaCompany}` : ''}
${personality ? `- Personality: ${personality}` : ''}
${communicationStyle ? `- Communication style: ${communicationStyle}` : ''}
${technicalLevel ? `- Technical level: ${technicalLevel}` : ''}
${painPoints ? `- Main concerns: ${painPoints}` : ''}
${budget ? `- Budget: ${budget}` : ''}
${timeline ? `- Timeline: ${timeline}` : ''}
${priorExperience ? `- Prior experience: ${priorExperience}` : ''}
${objections ? `- Objections to raise naturally: ${objections}` : ''}

CRITICAL RULES:
- You are ALWAYS a client contacting a ${ownerIndustry} professional — NEVER change this industry
- Stay in character as ${personaName} for the entire conversation
- Do NOT switch industries or invent a different type of business
- Keep responses conversational (2-4 sentences max)
- React naturally to the business owner's last message`;
    }

    const messagesChronological = [...simulation.messages].reverse();

    // Build conversation history for API
    const conversationHistory = messagesChronological.map((msg) => ({
      role: (msg.role === "AI_CLIENT" ? "assistant" : "user") as "user" | "assistant",
      content: msg.content,
    }));

    // Add current user message
    conversationHistory.push({
      role: "user",
      content: data.content,
    });

    // FIX 3: Include system prompt in EVERY API call
    // This is critical - without it, the AI loses industry context mid-conversation
    const aiResponse = await createChatCompletion(
      conversationHistory,
      systemPrompt,
      {
        maxTokens: 300,
        temperature: 0.8,
        tenantId,
        operationType: "simulation",
        metadata: { simulationId },
        cacheSystemPrompt: systemPrompt.length >= 2500,
      }
    );

    // Store AI response message
    const aiMessage = await prisma.simulationMessage.create({
      data: {
        simulationId,
        role: "AI_CLIENT",
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
        latencyMs: aiResponse.latencyMs,
      },
    });

    // Update simulation: duration + live feedback + quality score
    const createdAt = new Date(simulation.createdAt);
    const duration = Math.floor((Date.now() - createdAt.getTime()) / 1000);

    // Detect newly demonstrated patterns from the owner's message
    const newPatterns = generateLiveFeedback(data.content, simulation.demonstratedPatterns ?? []);
    const allPatterns = [...(simulation.demonstratedPatterns ?? []), ...newPatterns];

    // Calculate updated quality score
    const allMessages = [
      ...messagesChronological,
      { role: 'BUSINESS_OWNER', content: data.content },
      { role: 'AI_CLIENT', content: aiResponse.content },
    ];
    const liveScore = calculateLiveQualityScore(allMessages, null);

    await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        duration,
        demonstratedPatterns: allPatterns,
        liveScore,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          messageId: userMessage.id,
          role: "BUSINESS_OWNER",
          content: data.content,
          aiResponse: {
            messageId: aiMessage.id,
            role: "AI_CLIENT",
            content: aiResponse.content,
            latencyMs: aiResponse.latencyMs,
            tokensUsed: aiResponse.tokensUsed,
          },
          // Live gamification data
          newPatterns,
          liveScore,
          demonstratedPatterns: allPatterns,
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Simulation message error:", error);

    // Handle AI provider errors
    if (error instanceof Error && error.message.includes("AI")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_ERROR",
            message: error.message,
          },
          meta: { timestamp, requestId },
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process message. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
});
