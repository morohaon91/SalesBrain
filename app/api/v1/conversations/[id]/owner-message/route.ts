import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ConversationStatus } from '@prisma/client';
import { extractTokenFromHeader, verifyAccessToken } from '@/lib/auth/jwt';

const bodySchema = z.object({
  message: z.string().min(1).max(8000),
});

/**
 * POST /api/v1/conversations/[id]/owner-message
 * Owner sends a message directly to the lead (conversation must be in MANUAL mode)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const token = extractTokenFromHeader(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const payload = verifyAccessToken(token);
      userId = payload.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse body
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    const { message } = parsed.data;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Verify conversation is MANUAL and taken over by this user
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.status !== ConversationStatus.MANUAL) {
      return NextResponse.json(
        { error: 'Conversation is not in manual mode' },
        { status: 400 }
      );
    }

    if (conversation.manualTakenOverBy !== user.id) {
      return NextResponse.json(
        { error: 'Only the user who took over can send messages' },
        { status: 403 }
      );
    }

    // Store owner message
    const ownerMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: id,
        role: 'SYSTEM',  // Using SYSTEM role for owner messages
        content: message.trim(),
        isOwnerMessage: true,
      },
    });

    // Update last activity
    await prisma.conversation.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: ownerMessage,
    });
  } catch (error) {
    console.error('Owner message error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
