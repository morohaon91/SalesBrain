import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { checkSimulationQuality } from "@/lib/simulations/quality-checker";
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
    qualityReport?: {
      completenessScore: number;
      recommendation: string;
      feedback: {
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
      };
    };
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
 * Mark simulation as complete and run quality check
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

    // Run quality check (Phase 3)
    const qualityReport = checkSimulationQuality(
      simulation.messages as any,
      simulation.scenarioType
    );

    // Update simulation with completion and quality data
    const updatedSimulation = await prisma.simulation.update({
      where: { id: simulationId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        qualityScore: qualityReport.completenessScore,
      },
    });

    // Trigger pattern extraction asynchronously (fire and forget)
    // Only trigger if quality score is acceptable (>= 60)
    if (qualityReport.completenessScore >= 60) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const extractUrl = `${baseUrl}/api/v1/simulations/${simulationId}/extract`;
      fetch(extractUrl, {
        method: "POST",
        headers: {
          Authorization: req.headers.get("authorization") || "",
          "Content-Type": "application/json"
        }
      }).catch((err) => {
        console.error("Auto-extraction failed:", err);
        // Don't fail the complete request if extraction fails
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          simulationId: updatedSimulation.id,
          status: updatedSimulation.status,
          duration: updatedSimulation.duration,
          messageCount: simulation.messages.length,
          qualityScore: updatedSimulation.qualityScore || undefined,
          qualityReport: {
            completenessScore: qualityReport.completenessScore,
            recommendation: qualityReport.recommendation,
            feedback: qualityReport.feedback,
          },
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