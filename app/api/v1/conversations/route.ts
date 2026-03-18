import { NextRequest, NextResponse } from 'next/server';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { v4 as uuidv4 } from 'uuid';

interface ConversationsResponse {
  success: boolean;
  data?: Array<{
    id: string;
    createdAt: string;
    status: string;
    qualificationStatus: string;
    leadScore: number;
    messageCount: number;
    duration: number;
    leadName: string;
    leadEmail: string;
    summary: string;
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
 * GET /api/v1/conversations
 * Fetch all conversations for authenticated user's tenant
 */
export const GET = withAuth(
  async (req): Promise<NextResponse<ConversationsResponse>> => {
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
        where.leadScore = { gte: minScore };
      }

      // Fetch total count
      const total = await prisma.conversation.count({ where });

      // Fetch paginated conversations
      const conversations = await prisma.conversation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          lead: {
            select: {
              name: true,
              email: true,
            },
          },
          messages: {
            select: {
              id: true,
            },
          },
        },
      });

      clearTenantContext();

      // Transform response
      const data = conversations.map((conv: any) => ({
        id: conv.id,
        createdAt: conv.createdAt.toISOString(),
        status: conv.status,
        qualificationStatus: conv.qualificationStatus,
        leadScore: conv.leadScore,
        messageCount: conv.messages?.length || 0,
        duration: conv.duration || 0,
        leadName: conv.lead?.name || 'Unknown',
        leadEmail: conv.lead?.email || 'unknown@example.com',
        summary: conv.summary || 'No summary available',
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
      console.error('Error fetching conversations:', error);
      clearTenantContext();

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch conversations',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
  }
);
