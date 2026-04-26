/**
 * POST /api/v1/profile/re-extract
 * Re-analyze all completed simulations and merge patterns (universal engine).
 *
 * Extractions run in parallel (max 3 concurrent) then merge sequentially.
 * Per-sim wall clock is bounded by RE_EXTRACT_OUTER_TIMEOUT_MS (must exceed AI client extraction timeout).
 */

import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { extractRawFromMessages, mergeAll, applyEvidenceCeilings } from '@/lib/extraction/extraction-engine';
import { RE_EXTRACT_OUTER_TIMEOUT_MS } from '@/lib/extraction/timeouts';
import { calculateProfileCompletion } from '@/lib/extraction/completion';
import { getScenarioById, getScenarioByType, type ScenarioType } from '@/lib/scenarios/mandatory-scenarios';
import { v4 as uuidv4 } from 'uuid';

/** Normalize a raw DB value ('HOT_LEAD' or 'hot_lead_universal') to the canonical scenario id. */
function normalizeScenarioId(raw: string): string {
  const byType = getScenarioByType(raw as ScenarioType);
  if (byType) return byType.id;
  const byId = getScenarioById(raw);
  if (byId) return byId.id;
  return raw;
}

const PER_SIM_TIMEOUT_MS = RE_EXTRACT_OUTER_TIMEOUT_MS;
const MAX_CONCURRENT = 3;

async function extractWithTimeout(
  messages: any[],
  scenarioType: string,
  tenantId: string
): Promise<{ raw: any; scenarioType: string } | null> {
  try {
    const raw = await Promise.race([
      extractRawFromMessages(messages, scenarioType, null, tenantId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${scenarioType}`)), PER_SIM_TIMEOUT_MS)
      ),
    ]);
    return { raw, scenarioType };
  } catch (err) {
    console.error(`[Re-extract] Failed for ${scenarioType}:`, err);
    return null;
  }
}

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

    // Filter to sims with enough messages to be worth extracting
    const eligible = completedSimulations.filter((s) => s.messages.length >= 4);

    // Run extractions in parallel batches (MAX_CONCURRENT at a time).
    // Each sim is extracted independently (no accumulated context passed) so
    // they can run concurrently. The merge step below combines all results.
    const results: Array<{ raw: any; scenarioType: string }> = [];
    for (let i = 0; i < eligible.length; i += MAX_CONCURRENT) {
      const batch = eligible.slice(i, i + MAX_CONCURRENT);
      const batchResults = await Promise.all(
        batch.map((sim) => extractWithTimeout(sim.messages, sim.scenarioType, tenantId))
      );
      for (const r of batchResults) {
        if (r) results.push(r);
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'EXTRACTION_FAILED', message: 'Could not extract patterns from any simulation' },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }

    // Merge all extraction results sequentially into an accumulated snapshot.
    let accumulated = {
      communicationStyle: null,
      objectionHandling: null,
      qualificationCriteria: null,
      decisionMakingPatterns: null,
      pricingLogic: null,
      ownerVoiceExamples: null,
    } as Parameters<typeof mergeAll>[0];

    // Seed with already-tracked scenarios, normalizing legacy 'HOT_LEAD' → 'hot_lead_universal'.
    const completedScenarioIds = new Set<string>(
      (profile.completedScenarios ?? []).map(normalizeScenarioId)
    );

    for (const { raw, scenarioType } of results) {
      const canonicalId = normalizeScenarioId(scenarioType);
      accumulated = mergeAll(accumulated, raw, canonicalId);
      completedScenarioIds.add(canonicalId);
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
        simulationCount: finalScenarios.length,
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
          simulationCount: finalScenarios.length,
          simulationsProcessed: results.length,
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
