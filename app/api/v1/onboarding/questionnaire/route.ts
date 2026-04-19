import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { validateQuestionnairePayload } from '@/lib/onboarding/questionnaire-validator';
import { initializeProfile } from '@/lib/onboarding/profile-initializer';
import { getNextRecommendedScenario, INDUSTRY_LIST } from '@/lib/scenarios/mandatory-scenarios';
import { prisma } from '@/lib/prisma';
import type { QuestionnaireData } from '@/lib/types/onboarding';

async function handler(req: AuthenticatedRequest) {
  try {
    const tenantId = req.auth.tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { industry: true },
    });

    const body = await req.json();
    const validation = validateQuestionnairePayload(body);

    if (!validation.isValid || !validation.parsed) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const industry = (tenant?.industry ?? '').trim();
    if (!industry || !INDUSTRY_LIST.includes(industry)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_INDUSTRY',
            message:
              'Your account needs a valid industry before continuing. Open Settings → Business profile, choose your industry, save, then return here.',
          },
        },
        { status: 400 }
      );
    }

    const fullPayload: QuestionnaireData = { ...validation.parsed, industry };

    // Prevent duplicate profiles
    const existing = await prisma.businessProfile.findUnique({ where: { tenantId } });
    if (existing) {
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

    const profile = await initializeProfile(tenantId, fullPayload);

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
