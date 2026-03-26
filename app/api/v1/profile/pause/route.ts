import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;

  await prisma.$transaction([
    prisma.businessProfile.update({
      where: { tenantId },
      data: { profileApprovalStatus: 'PAUSED' },
    }),
    prisma.tenant.update({
      where: { id: tenantId },
      data: { leadConversationsActive: false },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: 'Lead conversations paused.',
  });
}

export const POST = withAuth(handler);
