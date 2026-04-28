export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { calculateActivationScore } from '@/lib/learning/activation-score';
import { evaluateAllCompetencies } from '@/lib/learning/competencies';
import { getNextRecommendedScenario } from '@/lib/scenarios/mandatory-scenarios';
import { validateAllGates } from '@/lib/learning/go-live-gates';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const score = calculateActivationScore(profile);
    const nextScenario = getNextRecommendedScenario(profile.completedScenarios || []);
    const gates = validateAllGates(profile);
    const competencies = evaluateAllCompetencies(profile);

    return NextResponse.json({
      activationScore: score.total,
      canRequestGoLive: score.canRequestGoLive,
      breakdown: score.breakdown,
      blockingStep: score.blockingStep,
      nextAction: score.nextAction,
      nextScenario: nextScenario
        ? { id: nextScenario.id, name: nextScenario.name, purpose: nextScenario.purpose }
        : null,
      gates: gates.map((g) => ({
        gateId: g.gateId,
        name: g.name,
        status: g.status,
        progress: g.progress,
        blockingReasons: g.blockingReasons.slice(0, 2),
      })),
      competencies,
    });
  } catch (error) {
    console.error('Error fetching activation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
