import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createChatCompletion } from '@/lib/ai/client';
import { buildLeadAssistantSystemPrompt } from '@/lib/ai/prompts/lead-assistant';

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
        status: 'ACTIVE',
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

    await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'LEAD',
        content,
      },
    });

    const profile = tenant.profiles[0] ?? null;
    const systemPrompt = buildLeadAssistantSystemPrompt(tenant, profile);

    const history = conversation.messages.map((m) => ({
      role: (m.role === 'LEAD' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

    history.push({ role: 'user', content });

    const ai = await createChatCompletion(history, systemPrompt, {
      maxTokens: 600,
      temperature: 0.7,
    });

    await prisma.conversationMessage.create({
      data: {
        conversationId,
        role: 'AI',
        content: ai.content,
        tokensUsed: ai.tokensUsed,
        latencyMs: ai.latencyMs,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastActivityAt: new Date() },
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
