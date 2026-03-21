/**
 * POST /api/v1/profile/re-extract
 * Re-analyze all completed simulations and merge patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { mergePatterns } from '@/lib/ai/merge-patterns';
import { calculateCompletionPercentage } from '@/lib/utils/completion';
import { v4 as uuidv4 } from 'uuid';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // 1. Get all completed simulations
    const completedSimulations = await prisma.simulation.findMany({
      where: {
        tenantId,
        status: 'COMPLETED'
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (completedSimulations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_COMPLETED_SIMULATIONS',
            message: 'No completed simulations to analyze'
          },
          meta: { timestamp, requestId }
        },
        { status: 400 }
      );
    }

    // 2. Get business profile
    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId }
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: 'Business profile not found'
          },
          meta: { timestamp, requestId }
        },
        { status: 404 }
      );
    }

    const industry = profile.industry || 'business_consulting';

    // 3. Extract patterns from each simulation and merge
    let mergedPatterns: any = null;

    for (const simulation of completedSimulations) {
      if (simulation.messages.length < 4) continue;

      try {
        const extracted = await extractPatternsFromSimulation(
          simulation.messages,
          industry,
          simulation.scenarioType
        );

        mergedPatterns = mergePatterns(mergedPatterns, extracted);
      } catch (error) {
        console.error(
          `Failed to extract from simulation ${simulation.id}:`,
          error
        );
        // Continue with next simulation
        continue;
      }
    }

    if (!mergedPatterns) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXTRACTION_FAILED',
            message: 'Could not extract patterns from any simulation'
          },
          meta: { timestamp, requestId }
        },
        { status: 500 }
      );
    }

    // 4. Calculate completion
    const simulationCount = completedSimulations.length;
    const completionPercentage = calculateCompletionPercentage(simulationCount);

    // 5. Update profile
    await prisma.businessProfile.update({
      where: { tenantId },
      data: {
        communicationStyle: mergedPatterns.communicationStyle,
        pricingLogic: mergedPatterns.pricingLogic,
        qualificationCriteria: mergedPatterns.qualificationCriteria,
        objectionHandling: mergedPatterns.objectionHandling,
        decisionMakingPatterns: mergedPatterns.decisionMakingPatterns,
        knowledgeBase: mergedPatterns.knowledgeBase,

        completionPercentage,
        simulationCount,
        lastExtractedAt: new Date(),
        isComplete: completionPercentage >= 100,
        completionScore: completionPercentage
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          extractedPatterns: mergedPatterns,
          completionPercentage,
          simulationCount
        },
        meta: { timestamp, requestId }
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
          message: error.message || 'Failed to re-extract patterns'
        },
        meta: { timestamp, requestId }
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
