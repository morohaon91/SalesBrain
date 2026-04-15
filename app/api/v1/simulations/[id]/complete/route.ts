import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { triggerAsyncExtraction } from "@/lib/extraction/extraction-engine";
import { v4 as uuidv4 } from "uuid";

/**
 * Response type
 */
interface CompleteSimulationResponse {
  success: boolean;
  data?: {
    simulationId: string;
    status: string;
    duration: number;
    messageCount: number;
    qualityScore?: number;
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
 * POST /api/v1/simulations/{id}/complete
 * Mark simulation as complete
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // Extract ID from URL
    const simulationId = req.nextUrl.pathname.split("/")[4];
    const { tenantId } = req.auth;

    // Fetch simulation
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        messages: true,
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

    // Calculate quality score (simple heuristic)
    // Based on: message count (more is better), duration, and exchange quality
    const messageCount = simulation.messages.length;
    const businessOwnerMessages = simulation.messages.filter(
      (m) => m.role === "BUSINESS_OWNER"
    ).length;
    const aiClientMessages = simulation.messages.filter(
      (m) => m.role === "AI_CLIENT"
    ).length;

    // Quality score: balanced conversation (both parties engaged equally)
    // Perfect score is 100 when participants have equal turns
    const balanceRatio = businessOwnerMessages > 0 ? aiClientMessages / businessOwnerMessages : 0;
    const balanceScore = Math.min(100, Math.abs(100 - Math.abs(balanceRatio - 1) * 100));

    // Bonus for longer conversations (more practice)
    const lengthBonus = Math.min(20, Math.floor(messageCount / 2));

    const qualityScore = Math.round(balanceScore + lengthBonus);

    // Update simulation
    const updatedSimulation = await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        qualityScore: Math.min(100, qualityScore),
      },
    });

    // Trigger async extraction (new universal engine)
    triggerAsyncExtraction(simulationId);

    return NextResponse.json(
      {
        success: true,
        data: {
          simulationId: updatedSimulation.id,
          status: updatedSimulation.status,
          duration: updatedSimulation.duration,
          messageCount: simulation.messages.length,
          qualityScore: updatedSimulation.qualityScore || undefined,
          summaryUrl: `/simulations/${simulationId}/summary`,
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Simulation completion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to complete simulation. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
});
