import { NextResponse } from 'next/server';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/v1/conversations/[id]
 * Single conversation with messages for the authenticated tenant.
 * Note: withAuth invokes the handler with (req) only; read id from the URL path.
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();
    const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1];

    const tenantId = req.auth.tenantId;
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

    try {
      setTenantContext(tenantId);

      const conv = await prisma.conversation.findFirst({
        where: { id, tenantId },
        include: {
          lead: {
            select: { name: true, email: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      clearTenantContext();

      if (!conv) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Conversation not found' },
            meta: { timestamp, requestId },
          },
          { status: 404 }
        );
      }

      const messages = conv.messages.map((m) => ({
        id: m.id,
        role:
          m.role === 'LEAD'
            ? ('user' as const)
            : m.role === 'AI'
              ? ('assistant' as const)
              : ('system' as const),
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      }));

      const data = {
        id: conv.id,
        createdAt: conv.createdAt.toISOString(),
        status: conv.status,
        qualificationStatus: conv.qualificationStatus,
        leadScore: conv.leadScore ?? 0,
        messageCount: messages.length,
        duration: conv.endedAt
          ? Math.round((conv.endedAt.getTime() - conv.createdAt.getTime()) / 1000)
          : Math.round((Date.now() - conv.createdAt.getTime()) / 1000),
        leadName: conv.lead?.name || 'Unknown',
        leadEmail: conv.lead?.email || 'unknown@example.com',
        summary: conv.summary || 'No summary available',
        messages,
      };

      return NextResponse.json({
        success: true,
        data,
        meta: { timestamp, requestId },
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      clearTenantContext();
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch conversation',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
});
