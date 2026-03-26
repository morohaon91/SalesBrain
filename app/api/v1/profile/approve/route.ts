import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { checkProfileReadiness } from '@/lib/utils/profile-readiness';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;

  const profile = await prisma.businessProfile.findUnique({ where: { tenantId } });
  if (!profile) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
  }

  const readiness = checkProfileReadiness(profile as any);
  if (!readiness.isReady) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NOT_READY', message: `Profile must be at least 70% complete to go live. Currently at ${readiness.completionPercentage}%.` },
        missingItems: readiness.missingItems,
      },
      { status: 400 }
    );
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.businessProfile.update({
      where: { tenantId },
      data: {
        profileApprovalStatus: 'APPROVED',
        approvedAt: now,
        goLiveAt: now,
      },
    }),
    prisma.tenant.update({
      where: { id: tenantId },
      data: {
        leadConversationsActive: true,
        activatedAt: now,
        onboardingComplete: true,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    message: 'Profile approved! Lead conversations are now active.',
    approvedAt: now.toISOString(),
  });
}

export const POST = withAuth(handler);
