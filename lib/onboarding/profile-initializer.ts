import { QuestionnaireData } from '@/lib/types/onboarding';
import { prisma } from '@/lib/prisma';
import type { BusinessProfile } from '@prisma/client';

export async function initializeProfile(
  tenantId: string,
  data: QuestionnaireData
): Promise<BusinessProfile> {
  const completion = calculateInitialCompletion(data);

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

export function calculateInitialCompletion(data: QuestionnaireData): number {
  let base = 20;
  if (data.yearsExperience && data.yearsExperience > 0) base += 2;
  if (data.certifications && data.certifications.length > 0) base += 2;
  if (data.commonClientQuestions && data.commonClientQuestions.length >= 3) base += 1;
  return Math.min(base, 25);
}
