import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { createChatCompletion } from "@/lib/ai/client";
import {
  getScenarioConfig,
  generateSimulationClientPrompt,
  generateUserPrompt,
  generateSimulationPrompt,
} from "@/lib/ai/prompts";
import { v4 as uuidv4 } from "uuid";

/**
 * Request validation schema
 */
const startSimulationSchema = z.object({
  scenarioType: z.enum(["PRICE_SENSITIVE", "INDECISIVE", "DEMANDING", "TIME_PRESSURED", "HIGH_BUDGET"]),
});

type StartSimulationRequest = z.infer<typeof startSimulationSchema>;

/**
 * Response type
 */
interface StartSimulationResponse {
  success: boolean;
  data?: {
    simulationId: string;
    scenarioType: string;
    aiPersona: {
      clientType: string;
      budget: string;
      painPoints: string[];
      personality: string;
    };
    initialMessage: string;
    status: string;
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
 * POST /api/v1/simulations/start
 * Start a new simulation session with AI client
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // Parse request body
    const body = await req.json();

    // Validate request
    const validation = startSimulationSchema.safeParse(body);
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

    const data = validation.data as StartSimulationRequest;
    const { tenantId } = req.auth;

    // FIX 3: Fetch businessProfile BEFORE generating prompt
    // This ensures the prompt has industry context from the start
    const businessProfile = await prisma.businessProfile.findUnique({
      where: { tenantId },
    });

    if (!businessProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROFILE_NOT_FOUND",
            message: "Business profile not found. Please complete your profile first.",
          },
          meta: { timestamp, requestId },
        },
        { status: 404 }
      );
    }

    // Generate system prompt using templates + extracted patterns
    // Pass businessProfile instead of tenantId for industry context
    const systemPrompt = await generateSimulationPrompt(data.scenarioType as any, businessProfile);

    // Generate initial greeting from AI client
    const initialUserPrompt = `Start the conversation. You are a potential client interested in learning about their services. Begin naturally, as if making first contact.`;

    // Get scenario config for persona (used in response)
    const scenarioConfig = getScenarioConfig(data.scenarioType);

    const aiResponse = await createChatCompletion(
      [
        {
          role: "user",
          content: initialUserPrompt,
        },
      ],
      systemPrompt,
      {
        maxTokens: 300,
        temperature: 0.8,
      }
    );

    // Create simulation in database
    const simulation = await prisma.simulation.create({
      data: {
        tenantId,
        scenarioType: data.scenarioType,
        status: "IN_PROGRESS",
        duration: 0,
        aiPersona: {
          clientType: scenarioConfig.clientType,
          budget: scenarioConfig.budget,
          painPoints: scenarioConfig.painPoints,
          personality: scenarioConfig.personality,
        },
      },
    });

    // Store initial AI message
    await prisma.simulationMessage.create({
      data: {
        simulationId: simulation.id,
        role: "AI_CLIENT",
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
        latencyMs: aiResponse.latencyMs,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          simulationId: simulation.id,
          scenarioType: data.scenarioType,
          aiPersona: {
            clientType: scenarioConfig.clientType,
            budget: scenarioConfig.budget,
            painPoints: scenarioConfig.painPoints,
            personality: scenarioConfig.personality,
          },
          initialMessage: aiResponse.content,
          status: simulation.status,
        },
        meta: { timestamp, requestId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Simulation start error:", error);

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
          message: "Failed to start simulation. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
});
