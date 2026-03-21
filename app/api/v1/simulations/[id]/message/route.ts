import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { createChatCompletion } from "@/lib/ai/client";
import {
  generateSimulationPrompt,
  generateUserPrompt,
} from "@/lib/ai/prompts/simulation";
import { v4 as uuidv4 } from "uuid";

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
          orderBy: { createdAt: "asc" },
        },
        tenant: {
          include: {
            profiles: true,
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

    // FIX 2: Pass businessProfile to prompt generator instead of tenantId
    // This provides industry context so AI stays in correct persona
    const systemPrompt = await generateSimulationPrompt(
      simulation.scenarioType as any,
      businessProfile
    );

    // Build conversation history for API
    const conversationHistory = simulation.messages.map((msg) => ({
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

    // Update simulation duration
    const createdAt = new Date(simulation.createdAt);
    const duration = Math.floor((Date.now() - createdAt.getTime()) / 1000);

    await prisma.simulation.update({
      where: { id: simulationId },
      data: { duration },
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
