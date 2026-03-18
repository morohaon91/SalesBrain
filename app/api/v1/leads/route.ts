import { NextRequest, NextResponse } from 'next/server';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { v4 as uuidv4 } from 'uuid';

interface LeadsResponse {
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    email: string;
    company?: string;
    status: string;
    qualificationScore: number;
    firstContactAt?: string;
    conversationsCount: number;
    ownerViewed: boolean;
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
 * GET /api/v1/leads
 * Fetch all leads for authenticated user's tenant
 */
export const GET = withAuth(
  async (req): Promise<NextResponse<LeadsResponse>> => {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    try {
      // Get query parameters
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const status = searchParams.get('status');
      const minScore = searchParams.get('minScore')
        ? parseInt(searchParams.get('minScore')!)
        : undefined;
      const search = searchParams.get('search');

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

      if (minScore !== undefined) {
        where.qualificationScore = { gte: minScore };
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Fetch total count
      const total = await prisma.lead.count({ where });

      // Fetch paginated leads
      const leads = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          conversations: {
            select: {
              id: true,
            },
          },
        },
      });

      clearTenantContext();

      // Transform response
      const data = leads.map((lead: any) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        status: lead.status,
        qualificationScore: lead.qualificationScore,
        firstContactAt: lead.createdAt?.toISOString(),
        conversationsCount: lead.conversations?.length || 0,
        ownerViewed: lead.ownerViewed || false,
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
      console.error('Error fetching leads:', error);
      clearTenantContext();

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch leads',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
  }
);
