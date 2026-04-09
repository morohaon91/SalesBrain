import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/v1/public/lead-chat/[widgetApiKey]/start
 * Public — no auth. Starts a lead conversation when go-live is active.
 */
export async function POST(
  _req: Request,
  context: { params: Promise<{ widgetApiKey: string }> }
) {
  const { widgetApiKey } = await context.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { widgetApiKey },
      include: { profiles: true },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Invalid link' } },
        { status: 404 }
      );
    }

    if (!tenant.leadConversationsActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEAD_CHAT_INACTIVE',
            message:
              'This chat is not active yet. The business owner must approve their profile (go live) first.',
          },
        },
        { status: 403 }
      );
    }

    const profile = tenant.profiles[0] ?? null;

    const sessionId = uuidv4();
    const conversation = await prisma.conversation.create({
      data: {
        tenantId: tenant.id,
        sessionId,
        status: 'ACTIVE',
        keyTopics: [],
      },
    });

    const greeting = tenant.widgetGreeting || 'Hi! How can I help you today?';
    // Greeting is returned to the client only — not stored as an AI message so the first
    // Claude turn can start with the lead's message (user role), which the API expects.

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        sessionId,
        greeting,
        businessName: tenant.businessName,
        industry: tenant.industry,
        serviceDescription: profile?.serviceDescription ?? null,
        aiTransparency: tenant.aiTransparency,
      },
    });
  } catch (e) {
    console.error('lead-chat start:', e);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to start chat' } },
      { status: 500 }
    );
  }
}
