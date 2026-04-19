import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      onboardingComplete: true,
      onboardingStep: true,
      leadConversationsActive: true,
      activatedAt: true,
      industry: true,
    },
  });

  if (!tenant) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Tenant not found' } },
      { status: 404 }
    );
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { tenantId },
    select: {
      id: true,
      profileApprovalStatus: true,
      completionPercentage: true,
      simulationCount: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      onboardingComplete: tenant.onboardingComplete,
      onboardingStep: tenant.onboardingStep,
      leadConversationsActive: tenant.leadConversationsActive,
      activatedAt: tenant.activatedAt?.toISOString() ?? null,
      tenantIndustry: tenant.industry ?? null,
      hasProfile: !!profile,
      profile: profile
        ? {
            id: profile.id,
            profileApprovalStatus: profile.profileApprovalStatus,
            completionPercentage: profile.completionPercentage,
            simulationCount: profile.simulationCount,
          }
        : null,
    },
  });
}

export const GET = withAuth(handler);

