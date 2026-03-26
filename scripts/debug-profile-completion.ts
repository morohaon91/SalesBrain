import { prisma } from '../lib/prisma';
import { calculateProfileCompletion } from '../lib/utils/profile-completion';

async function main() {
  const email = process.argv[2] ?? 'test@test.com';

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, tenantId: true },
  });

  if (!user) {
    console.log(JSON.stringify({ error: 'NO_USER', email }, null, 2));
    return;
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { tenantId: user.tenantId },
  });

  if (!profile) {
    console.log(JSON.stringify({ error: 'NO_PROFILE', tenantId: user.tenantId }, null, 2));
    return;
  }

  const breakdown = calculateProfileCompletion(profile as any);

  console.log(
    JSON.stringify(
      {
        user,
        storedCompletionPercentage: profile.completionPercentage,
        computedTotal: breakdown.total,
        breakdown,
        profileSnapshot: {
          // questionnaire-relevant fields
          industry: profile.industry,
          serviceDescription: profile.serviceDescription ? '(set)' : null,
          targetClientType: profile.targetClientType,
          typicalBudgetRange: profile.typicalBudgetRange,
          commonClientQuestionsCount: Array.isArray(profile.commonClientQuestions)
            ? profile.commonClientQuestions.length
            : null,
          serviceArea: profile.serviceArea,
          teamSize: profile.teamSize,
          yearsExperience: profile.yearsExperience,
          certificationsCount: Array.isArray(profile.certifications) ? profile.certifications.length : null,

          // extracted-pattern fields
          communicationStyle: profile.communicationStyle ? '(set)' : null,
          pricingLogic: profile.pricingLogic ? '(set)' : null,
          qualificationCriteria: profile.qualificationCriteria ? '(set)' : null,
          objectionHandling: profile.objectionHandling ? '(set)' : null,
          decisionMakingPatterns: profile.decisionMakingPatterns ? '(set)' : null,
          ownerVoiceExamples: profile.ownerVoiceExamples ? '(set)' : null,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });

