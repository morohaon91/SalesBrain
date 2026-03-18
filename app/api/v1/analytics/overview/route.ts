import { NextRequest, NextResponse } from 'next/server';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsResponse {
  success: boolean;
  data?: {
    totalConversations: number;
    qualifiedLeads: number;
    unqualifiedLeads: number;
    contactedLeads: number;
    averageScore: number;
    conversionRate: number;
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
 * GET /api/v1/analytics/overview
 * Fetch analytics overview for authenticated user's tenant
 */
export const GET = withAuth(
  async (req): Promise<NextResponse<AnalyticsResponse>> => {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    try {
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

      // Fetch conversation count
      const totalConversations = await prisma.conversation.count({
        where: { tenantId },
      });

      // Fetch lead statistics
      const qualifiedLeads = await prisma.lead.count({
        where: {
          tenantId,
          status: 'QUALIFIED',
        },
      });

      const unqualifiedLeads = await prisma.lead.count({
        where: {
          tenantId,
          status: 'UNQUALIFIED',
        },
      });

      const contactedLeads = await prisma.lead.count({
        where: {
          tenantId,
          status: 'CONTACTED',
        },
      });

      // Calculate average score
      const leads = await prisma.lead.findMany({
        where: { tenantId },
        select: { qualificationScore: true },
      });

      const averageScore =
        leads.length > 0
          ? Math.round(
              leads.reduce((sum, l) => sum + (l.qualificationScore || 0), 0) /
                leads.length
            )
          : 0;

      // Calculate conversion rate
      const totalLeads = qualifiedLeads + unqualifiedLeads + contactedLeads;
      const conversionRate = totalLeads > 0 ? qualifiedLeads / totalLeads : 0;

      clearTenantContext();

      return NextResponse.json(
        {
          success: true,
          data: {
            totalConversations,
            qualifiedLeads,
            unqualifiedLeads,
            contactedLeads,
            averageScore,
            conversionRate,
          },
          meta: { timestamp, requestId },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
      clearTenantContext();

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch analytics',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
  }
);
