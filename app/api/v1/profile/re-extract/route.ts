/**
 * POST /api/v1/profile/re-extract
 * Re-analyze all completed simulations and merge patterns (universal engine).
 */

import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { extractRawFromMessages, mergeAll, applyEvidenceCeilings } from '@/lib/extraction/extraction-engine';
import { calculateProfileCompletion } from '@/lib/extraction/completion';
import { v4 as uuidv4 } from 'uuid';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    const completedSimulations = await prisma.simulation.findMany({
      where: { tenantId, status: 'COMPLETED' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    if (completedSimulations.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            extractedPatterns: null,
            completionPercentage: 0,
            simulationCount: 0,
            simulationsProcessed: 0,
            simulationsTotal: 0,
            message: 'No simulations yet',
          },
          meta: { timestamp, requestId },
        },
        { status: 200 }
      );
    }

    const profile = await prisma.businessProfile.findUnique({ where: { tenantId } });
    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PROFILE_NOT_FOUND', message: 'Business profile not found' },
          meta: { timestamp, requestId },
        },
        { status: 404 }
      );
    }

    // Start from a blank slate — full re-extraction overwrites.
    let accumulated = {
      communicationStyle: null,
      objectionHandling: null,
      qualificationCriteria: null,
      decisionMakingPatterns: null,
      pricingLogic: null,
      ownerVoiceExamples: null,
    } as Parameters<typeof mergeAll>[0];

    let successCount = 0;
    const completedScenarioIds = new Set<string>(profile.completedScenarios ?? []);

    for (const sim of completedSimulations) {
      if (sim.messages.length < 4) continue;
      try {
        const raw = await extractRawFromMessages(sim.messages, sim.scenarioType, accumulated);
        accumulated = mergeAll(accumulated, raw, sim.scenarioType);
        completedScenarioIds.add(sim.scenarioType);
        successCount++;
      } catch (error) {
        console.error(`Re-extract failed for simulation ${sim.id}:`, error);
      }
    }

    if (successCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'EXTRACTION_FAILED', message: 'Could not extract patterns from any simulation' },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }

    const finalScenarios = Array.from(completedScenarioIds);
    accumulated = applyEvidenceCeilings(accumulated, finalScenarios.length);

    const breakdown = calculateProfileCompletion({
      ...profile,
      ...accumulated,
      completedScenarios: finalScenarios,
    });

    await prisma.businessProfile.update({
      where: { tenantId },
      data: {
        communicationStyle: accumulated.communicationStyle as any,
        objectionHandling: accumulated.objectionHandling as any,
        qualificationCriteria: accumulated.qualificationCriteria as any,
        decisionMakingPatterns: accumulated.decisionMakingPatterns as any,
        pricingLogic: accumulated.pricingLogic as any,
        ownerVoiceExamples: accumulated.ownerVoiceExamples as any,
        simulationCount: successCount,
        completedScenarios: finalScenarios,
        completionPercentage: breakdown.total,
        completionScore: breakdown.total,
        isComplete: breakdown.total >= 100,
        lastExtractedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          extractedPatterns: accumulated,
          completionPercentage: breakdown.total,
          completionBreakdown: breakdown,
          simulationCount: successCount,
          simulationsProcessed: successCount,
          simulationsTotal: completedSimulations.length,
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Re-extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RE_EXTRACTION_FAILED',
          message: error.message || 'Failed to re-extract patterns',
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
