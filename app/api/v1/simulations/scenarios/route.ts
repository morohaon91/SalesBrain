import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { getScenariosForIndustry } from '@/lib/templates/industry-scenarios';
import { suggestNextScenario } from '@/lib/templates/scenario-suggester';
import type { BusinessProfile } from '@/lib/types/business-profile';

async function handler(req: AuthenticatedRequest) {
  try {
    const tenantId = req.auth.tenantId;

    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } },
        { status: 404 }
      );
    }

    const scenarios = getScenariosForIndustry(profile.industry ?? '');

    // Map profile to our BusinessProfile type
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
      communicationStyle: profile.communicationStyle as any,
      pricingLogic: profile.pricingLogic as any,
      qualificationCriteria: profile.qualificationCriteria as any,
      objectionHandling: profile.objectionHandling as any,
      decisionMakingPatterns: profile.decisionMakingPatterns as any,
      ownerVoiceExamples: profile.ownerVoiceExamples as any,
      profileApprovalStatus: profile.profileApprovalStatus as any,
      approvedAt: profile.approvedAt,
      goLiveAt: profile.goLiveAt,
      completedScenarios: profile.completedScenarios,
      suggestedNextScenario: profile.suggestedNextScenario,
      simulationCount: profile.simulationCount,
      completionPercentage: profile.completionPercentage,
      isComplete: profile.isComplete,
      completionScore: profile.completionScore,
      lastExtractedAt: profile.lastExtractedAt,
      embeddedMessageCount: profile.embeddedMessageCount,
    };

    const suggestion = suggestNextScenario(typedProfile);

    return NextResponse.json({
      success: true,
      scenarios,
      suggestion,
      completedScenarios: profile.completedScenarios,
      industry: profile.industry,
    });
  } catch (error) {
    console.error('Scenarios endpoint error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
