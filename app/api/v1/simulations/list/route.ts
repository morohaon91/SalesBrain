import { NextRequest, NextResponse } from 'next/server';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { v4 as uuidv4 } from 'uuid';

interface SimulationsResponse {
  success: boolean;
  data?: Array<{
    id: string;
    scenarioType: string;
    status: string;
    duration: number;
    messageCount: number;
    qualityScore?: number;
    completedAt?: string;
  }>;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
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
 * GET /api/v1/simulations/list
 * Fetch all simulations for authenticated user's tenant
 */
export const GET = withAuth(
  async (req): Promise<NextResponse<SimulationsResponse>> => {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    try {
      // Get query parameters
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const status = searchParams.get('status');

      const tenantId = (req as any).auth?.tenantId;
      if (!tenantId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'No tenant context' },
            meta: { timestamp, requestId },
          },
          { status: 401 }
        );
      }

      // Set tenant context for Prisma middleware
      setTenantContext(tenantId);

      // Build where clause
      const where: any = {
        tenantId,
      };

      if (status) {
        where.status = status;
      }

      // Fetch total count
      const total = await prisma.simulation.count({ where });

      // Fetch paginated simulations
      const simulations = await prisma.simulation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          messages: {
            select: {
              id: true,
            },
          },
        },
      });

      clearTenantContext();

      // Transform response
      const data = simulations.map((sim: any) => ({
        id: sim.id,
        scenarioType: sim.scenarioType,
        status: sim.status,
        duration: sim.duration || 0,
        messageCount: sim.messages?.length || 0,
        qualityScore: sim.qualityScore,
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
            totalPages: Math.ceil(total / pageSize),
          },
          meta: { timestamp, requestId },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching simulations:', error);
      clearTenantContext();

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch simulations',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
  }
);
