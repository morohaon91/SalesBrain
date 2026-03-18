import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Response type
 */
interface GetSimulationResponse {
  success: boolean;
  data?: {
    id: string;
    scenarioType: string;
    status: string;
    duration: number;
    createdAt: string;
    completedAt?: string;
    qualityScore?: number;
    aiPersona: any;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
      latencyMs?: number;
      tokensUsed?: number;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * GET /api/v1/simulations/{id}
 * Get simulation details and transcript
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // Extract ID from URL
    const simulationId = req.nextUrl.pathname.split("/")[4];
    const { tenantId } = req.auth;

    // Fetch simulation with messages
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
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

    const data = {
      id: simulation.id,
      scenarioType: simulation.scenarioType,
      status: simulation.status,
      duration: simulation.duration,
      createdAt: simulation.createdAt.toISOString(),
      completedAt: simulation.completedAt?.toISOString(),
      qualityScore: simulation.qualityScore || undefined,
      aiPersona: simulation.aiPersona,
      messages: simulation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        latencyMs: msg.latencyMs || undefined,
        tokensUsed: msg.tokensUsed || undefined,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        data,
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get simulation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch simulation. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
});
