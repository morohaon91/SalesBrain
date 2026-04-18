import { QuestionnaireData } from '@/lib/types/onboarding';
import { prisma } from '@/lib/prisma';
import type { BusinessProfile } from '@prisma/client';
import { calculateProfileCompletion } from '@/lib/extraction/completion';

export async function initializeProfile(
  tenantId: string,
  data: QuestionnaireData
): Promise<BusinessProfile> {
  const completion = calculateProfileCompletion(data as any).total;

  const profile = await prisma.businessProfile.create({
    data: {
      tenantId,
      industry: data.industry,
      serviceDescription: data.serviceDescription,
      targetClientType: data.targetClientType,
      typicalBudgetRange: data.typicalBudgetRange,
      commonClientQuestions: data.commonClientQuestions,
      yearsExperience: data.yearsExperience ?? null,
      certifications: data.certifications ?? [],
      serviceArea: data.serviceArea,
      teamSize: data.teamSize,
      completionPercentage: completion,
      isComplete: false,
      simulationCount: 0,
      profileApprovalStatus: 'PENDING',
      completedScenarios: [],
      suggestedNextScenario: null,
    },
  });

  return profile;
}

