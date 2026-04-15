import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { validateQuestionnaireData } from '@/lib/onboarding/questionnaire-validator';
import { initializeProfile } from '@/lib/onboarding/profile-initializer';
import { getNextRecommendedScenario } from '@/lib/scenarios/mandatory-scenarios';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest) {
  try {
    const tenantId = req.auth.tenantId;

    const data = await req.json();
    const validation = validateQuestionnaireData(data);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, errors: validation.errors },
        { status: 400 }
      );
    }

    // Prevent duplicate profiles
    const existing = await prisma.businessProfile.findUnique({ where: { tenantId } });
    if (existing) {
      // Profile exists but onboardingStep may not have been updated — fix it
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { onboardingStep: 'simulations' },
      });
      return NextResponse.json({
        success: true,
        profileId: existing.id,
        completionPercentage: existing.completionPercentage,
        nextStep: 'simulations',
        suggestedScenario: null,
      });
    }

    const profile = await initializeProfile(tenantId, data);

    // Update tenant onboarding state
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { onboardingStep: 'simulations' },
    });

    const suggestion = getNextRecommendedScenario(profile.completedScenarios || []);

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      completionPercentage: profile.completionPercentage,
      nextStep: 'simulations',
      suggestedScenario: suggestion?.id ?? null,
    });
  } catch (error) {
    console.error('Questionnaire submission error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
