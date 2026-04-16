/**
 * Readiness Calculator
 *
 * Updates profileApprovalStatus and suggestedNextScenario.
 */

import { prisma } from '@/lib/prisma';
import type { ProfileApprovalStatus } from '@prisma/client';
import { canGoLive, validateAllGates, type GateValidationResult } from './go-live-gates';
import { evaluateAllCompetencies, type CompetencyStatus } from './competencies';
import { getNextRecommendedScenario, MANDATORY_SCENARIOS } from '@/lib/scenarios/mandatory-scenarios';

export interface ReadinessReport {
  canGoLive: boolean;
  overallReadiness: number;
  gates: {
    total: number;
    passed: number;
    details: GateValidationResult[];
  };
  competencies: {
    total: number;
    achieved: number;
    details: CompetencyStatus[];
  };
  scenarios: {
    completed: number;
    total: number;
    nextRecommended: {
      id: string;
      name: string;
      reason: string;
    } | null;
  };
  blockingReasons: string[];
}

/**
 * Recalculate readiness and persist profileApprovalStatus + suggestedNextScenario.
 * Call after each extraction.
 */
export async function updateProfileReadiness(profileId: string): Promise<void> {
  const profile = await prisma.businessProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) throw new Error('Profile not found');

  const isReady = canGoLive(profile);
  const nextScenario = getNextRecommendedScenario(profile.completedScenarios || []);

  let newStatus: ProfileApprovalStatus = profile.profileApprovalStatus;

  // Don't override APPROVED/LIVE/PAUSED — those are owner-controlled terminal/paused states.
  if (profile.profileApprovalStatus !== 'APPROVED' &&
      profile.profileApprovalStatus !== 'LIVE' &&
      profile.profileApprovalStatus !== 'PAUSED') {
    if (isReady) {
      newStatus = 'READY';
    } else {
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
    canGoLive: isReady,
    nextScenario: nextScenario?.name ?? null,
  });
}

export function getReadinessReport(profile: any): ReadinessReport {
  const gates = validateAllGates(profile);
  const competencies = evaluateAllCompetencies(profile);
  const nextScenario = getNextRecommendedScenario(profile?.completedScenarios || []);

  const gatesPassed = gates.filter((g) => g.status === 'PASSED').length;
  const competenciesAchieved = competencies.filter(
    (c) => c.status === 'ACHIEVED' || c.status === 'MASTERED'
  ).length;

  return {
    canGoLive: gates.every((g) => g.status === 'PASSED'),
    overallReadiness: profile?.completionPercentage || 0,
    gates: {
      total: gates.length,
      passed: gatesPassed,
      details: gates,
    },
    competencies: {
      total: competencies.length,
      achieved: competenciesAchieved,
      details: competencies,
    },
    scenarios: {
      completed: profile?.completedScenarios?.length || 0,
      total: MANDATORY_SCENARIOS.length,
      nextRecommended: nextScenario
        ? {
            id: nextScenario.id,
            name: nextScenario.name,
            reason: nextScenario.purpose,
          }
        : null,
    },
    blockingReasons: gates.flatMap((g) => g.blockingReasons),
  };
}
