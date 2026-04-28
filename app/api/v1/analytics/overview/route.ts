export const dynamic = 'force-dynamic';

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
    maybeLeads: number;
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

      const [
        totalConversations,
        qualifiedLeads,
        unqualifiedLeads,
        maybeLeads,
        scoredAggregate,
      ] = await Promise.all([
        prisma.conversation.count({
          where: {
            tenantId,
            status: { not: 'ABANDONED' },
            messages: { some: {} },
          },
        }),
        prisma.conversation.count({
          where: { tenantId, qualificationStatus: 'QUALIFIED' },
        }),
        prisma.conversation.count({
          where: { tenantId, qualificationStatus: 'UNQUALIFIED' },
        }),
        prisma.conversation.count({
          where: { tenantId, qualificationStatus: 'MAYBE' },
        }),
        prisma.conversation.aggregate({
          where: { tenantId, leadScore: { gt: 0 } },
          _avg: { leadScore: true },
          _count: { _all: true },
        }),
      ]);

      const scoredCount = scoredAggregate._count._all;
      const averageScore =
        scoredCount > 0 && scoredAggregate._avg.leadScore != null
          ? Math.round(Number(scoredAggregate._avg.leadScore))
          : 0;

      // Conversion rate = qualified / all scored conversations
      const totalScored = qualifiedLeads + unqualifiedLeads + maybeLeads;
      const conversionRate = totalScored > 0 ? qualifiedLeads / totalScored : 0;
      const contactedLeads = 0; // kept for API compatibility

      clearTenantContext();

      return NextResponse.json(
        {
          success: true,
          data: {
            totalConversations,
            qualifiedLeads,
            unqualifiedLeads,
            maybeLeads,
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
