import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ConversationStatus } from '@prisma/client';
import { generateCloserResponse, type CloserProgress } from '@/lib/ai/closer-conversation';

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(8000),
});

/**
 * POST /api/v1/public/lead-chat/[widgetApiKey]/message
 * Public — lead sends a message; AI replies as the business.
 */
export async function POST(
  req: Request,
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
            message: 'This chat is not active.',
          },
        },
        { status: 403 }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid body' } },
        { status: 400 }
      );
    }

    const { conversationId, content } = parsed.data;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        tenantId: tenant.id,
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    // Store lead message
    await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'LEAD',
        content,
      },
    });

    // If in MANUAL mode, don't generate AI response
    if (conversation.status === ConversationStatus.MANUAL) {
      return NextResponse.json({
        success: true,
        data: {
          reply: null,
          status: 'MANUAL_MODE',
          note: 'This conversation is in manual control. The owner will respond.',
        },
      });
    }

    // Check if conversation is still active for AI
    if (conversation.status !== ConversationStatus.ACTIVE) {
      return NextResponse.json(
        { success: false, error: { code: 'CONVERSATION_ENDED', message: 'This conversation has ended' } },
        { status: 403 }
      );
    }

    const profile = tenant.profiles[0] ?? null;

    // Prepare message history in format expected by generateCloserResponse
    const history = conversation.messages.map((m) => ({
      role: (m.role === 'LEAD' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

    history.push({ role: 'user', content });

    // Get current CLOSER progress from conversation
    let closerProgress: CloserProgress | null = null;
    if (conversation.closerProgress) {
      closerProgress = conversation.closerProgress as any as CloserProgress;
    }

    // Use CLOSER framework
    // Add businessName from tenant to profile for system prompt
    const profileWithBusiness = {
      ...profile,
      businessName: tenant.businessName
    };

    const closerResponse = await generateCloserResponse(
      history,
      profileWithBusiness,
      closerProgress,
      tenant.id,
      { conversationId }
    );

    const ai = {
      content: closerResponse.response,
      tokensUsed: closerResponse.tokensUsed,
      latencyMs: closerResponse.latencyMs,
    };

    await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'AI',
        content: ai.content,
        tokensUsed: ai.tokensUsed,
        latencyMs: ai.latencyMs,
      },
    });

    // Update conversation with CLOSER progress
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastActivityAt: new Date(),
        closerProgress: closerResponse.updatedProgress as any,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reply: ai.content,
      },
    });
  } catch (e) {
    console.error('lead-chat message:', e);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to send message' } },
      { status: 500 }
    );
  }
}
