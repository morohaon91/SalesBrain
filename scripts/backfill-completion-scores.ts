import { prisma } from '../lib/prisma';
import { calculateProfileCompletion } from '../lib/extraction/completion';

async function backfill() {
  const profiles = await prisma.businessProfile.findMany();

  console.log(`Backfilling ${profiles.length} profiles...`);

  for (const profile of profiles) {
    try {
      const breakdown = calculateProfileCompletion(profile as any);
      await prisma.businessProfile.update({
        where: { id: profile.id },
        data: {
          completionPercentage: breakdown.total,
          completionScore: breakdown.total,
        },
      });
      console.log(`✓ ${profile.id} → ${breakdown.total}% (q:${breakdown.questionnaire} cs:${breakdown.communicationStyle} oh:${breakdown.objectionHandling} dm:${breakdown.decisionMaking} qc:${breakdown.qualificationCriteria} pl:${breakdown.pricingLogic})`);
    } catch (err) {
      console.error(`✗ ${profile.id}`, err);
    }
  }

  console.log('Done.');
  await prisma.$disconnect();
}

backfill();
