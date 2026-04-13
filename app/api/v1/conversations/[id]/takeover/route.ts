import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ConversationStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

/**
 * POST /api/v1/conversations/[id]/takeover
 * Owner takes manual control of a conversation (blocks AI)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate from Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.sub },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get conversation and verify it belongs to user's tenant
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify user is in this tenant
    const userInTenant = await prisma.user.findFirst({
      where: {
        id: user.id,
        tenantId: conversation.tenantId,
      },
    });

    if (!userInTenant) {
      return NextResponse.json(
        { error: 'Not authorized for this conversation' },
        { status: 403 }
      );
    }

    // Check if already in manual mode
    if (conversation.status === ConversationStatus.MANUAL) {
      return NextResponse.json(
        {
          error: 'Conversation already in manual mode',
          alreadyManual: true,
        },
        { status: 400 }
      );
    }

    // Update to MANUAL status
    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        status: ConversationStatus.MANUAL,
        manualTakenOverAt: new Date(),
        manualTakenOverBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      conversation: updated,
      message: 'You have taken control of this conversation',
    });
  } catch (error) {
    console.error('Takeover error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
