import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { validateQuestionnaireData } from '@/lib/onboarding/questionnaire-validator';
import { initializeProfile } from '@/lib/onboarding/profile-initializer';
import { suggestNextScenario } from '@/lib/templates/scenario-suggester';
import { prisma } from '@/lib/prisma';
import type { BusinessProfile } from '@/lib/types/business-profile';

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

    // Build typed profile for suggestion
    const typedProfile: BusinessProfile = {
      id: profile.id,
      tenantId: profile.tenantId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      industry: profile.industry,
      serviceDescription: profile.serviceDescription,
      targetClientType: profile.targetClientType,
      typicalBudgetRange: profile.typicalBudgetRange,
      commonClientQuestions: profile.commonClientQuestions,
      yearsExperience: profile.yearsExperience,
      serviceOfferings: profile.serviceOfferings,
      specializations: profile.specializations,
      certifications: profile.certifications,
      serviceArea: profile.serviceArea,
      teamSize: profile.teamSize,
      communicationStyle: null,
      pricingLogic: null,
      qualificationCriteria: null,
      objectionHandling: null,
      decisionMakingPatterns: null,
      ownerVoiceExamples: null,
      profileApprovalStatus: 'PENDING',
      approvedAt: null,
      goLiveAt: null,
      completedScenarios: profile.completedScenarios,
      suggestedNextScenario: profile.suggestedNextScenario,
      simulationCount: profile.simulationCount,
      completionPercentage: profile.completionPercentage,
      isComplete: profile.isComplete,
      completionScore: profile.completionScore,
      lastExtractedAt: profile.lastExtractedAt,
      embeddedMessageCount: profile.embeddedMessageCount,
      pineconeNamespace: profile.pineconeNamespace,
      embeddingsCount: profile.embeddingsCount,
    };

    const suggestion = suggestNextScenario(typedProfile);

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      completionPercentage: profile.completionPercentage,
      nextStep: 'simulations',
      suggestedScenario: suggestion?.scenario.id ?? null,
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
