export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import {
  getMandatoryScenarios,
  getNextRecommendedScenario,
} from '@/lib/scenarios/mandatory-scenarios';

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

    const allScenarios = getMandatoryScenarios();
    const completedIds = profile.completedScenarios || [];
    const nextRecommended = getNextRecommendedScenario(completedIds);

    const scenarios = allScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      difficulty: s.difficulty,
      estimatedDuration: s.estimatedDuration,
      isMandatory: s.isMandatory,
      isCompleted: completedIds.includes(s.id),
      orderIndex: s.orderIndex,
      scenarioType: s.scenarioType,
    }));

    const suggestion = nextRecommended
      ? {
          scenarioId: nextRecommended.id,
          scenarioName: nextRecommended.name,
          reason: `Next in sequence — ${nextRecommended.purpose}`,
        }
      : null;

    return NextResponse.json({
      success: true,
      scenarios,
      suggestion,
      completedScenarios: completedIds,
      industry: profile.industry,
      completionStats: {
        completed: completedIds.length,
        total: allScenarios.length,
        percentage: Math.round((completedIds.length / allScenarios.length) * 100),
      },
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
