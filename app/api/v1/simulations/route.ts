import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Response type
 */
interface SimulationsListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    scenarioType: string;
    status: string;
    duration: number;
    messageCount: number;
    qualityScore?: number;
    createdAt: string;
    completedAt?: string;
  }>;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
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
 * GET /api/v1/simulations
 * List all simulations for authenticated tenant
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    const { tenantId } = req.auth;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "20"));
    const status = searchParams.get("status");
    const scenarioType = searchParams.get("scenarioType");

    // Build filters
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }
    if (scenarioType) {
      where.scenarioType = scenarioType;
    }

    // Get total count
    const total = await prisma.simulation.count({ where });

    // Fetch simulations with pagination
    const simulations = await prisma.simulation.findMany({
      where,
      include: {
        messages: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    const data = simulations.map((sim) => ({
      id: sim.id,
      scenarioType: sim.scenarioType,
      status: sim.status,
      duration: sim.duration,
      messageCount: sim.messages.length,
      qualityScore: sim.qualityScore || undefined,
      createdAt: sim.createdAt.toISOString(),
      completedAt: sim.completedAt?.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("List simulations error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch simulations. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
});
