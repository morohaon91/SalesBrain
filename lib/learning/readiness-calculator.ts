/**
 * Readiness Calculator
 *
 * Updates profileApprovalStatus and suggestedNextScenario.
 */

import { prisma } from '@/lib/prisma';
import type { ProfileApprovalStatus } from '@prisma/client';
import { getNextRecommendedScenario } from '@/lib/scenarios/mandatory-scenarios';
import { calculateActivationScore } from './activation-score';

/**
 * Recalculate readiness and persist profileApprovalStatus + suggestedNextScenario.
 * Call after each extraction.
 */
export async function updateProfileReadiness(profileId: string): Promise<void> {
  const profile = await prisma.businessProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) throw new Error('Profile not found');

  const score = calculateActivationScore(profile);
  const nextScenario = getNextRecommendedScenario(profile.completedScenarios || []);

  let newStatus: ProfileApprovalStatus = profile.profileApprovalStatus;

  // Don't override APPROVED/LIVE/PAUSED — those are owner-controlled terminal/paused states.
  if (profile.profileApprovalStatus !== 'APPROVED' &&
      profile.profileApprovalStatus !== 'LIVE' &&
      profile.profileApprovalStatus !== 'PAUSED') {
    if (score.canRequestGoLive) {
      newStatus = 'READY';
    } else if ((profile.completedScenarios?.length ?? 0) >= 1) {
      newStatus = 'PENDING';
    }
  }

  await prisma.businessProfile.update({
    where: { id: profileId },
    data: {
      profileApprovalStatus: newStatus,
      suggestedNextScenario: nextScenario?.id ?? null,
    },
  });

  console.log(`[Readiness] Profile ${profileId} updated:`, {
    status: newStatus,
    canRequestGoLive: score.canRequestGoLive,
    nextScenario: nextScenario?.name ?? null,
  });
}
