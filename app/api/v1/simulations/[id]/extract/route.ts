/**
 * POST /api/v1/simulations/[id]/extract
 * Extract patterns from a completed simulation
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { mergePatterns, mergeOwnerVoiceExamples, mergeBusinessFacts } from '@/lib/ai/merge-patterns';
import {
  calculateCompletionPercentage,
  calculateQualityScore
} from '@/lib/utils/completion';
import { v4 as uuidv4 } from 'uuid';

async function handler(req: AuthenticatedRequest) {
  // Extract ID from URL: /api/v1/simulations/[id]/extract -> index 4 is the ID
  const simulationId = req.nextUrl.pathname.split('/')[4];
  const { tenantId } = req.auth;
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // 1. Get simulation with messages
    const simulation = await prisma.simulation.findUnique({
      where: {
        id: simulationId,
        tenantId  // Ensure tenant isolation
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        tenant: {
          include: {
            profiles: true
          }
        }
      }
    });

    if (!simulation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SIMULATION_NOT_FOUND',
            message: 'Simulation not found'
          },
          meta: { timestamp, requestId }
        },
        { status: 404 }
      );
    }

    // 2. Validate simulation is completed
    if (simulation.status !== 'COMPLETED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SIMULATION_NOT_COMPLETED',
            message: 'Can only extract patterns from completed simulations'
          },
          meta: { timestamp, requestId }
        },
        { status: 400 }
      );
    }

    // 3. Check if enough messages
    if (simulation.messages.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_MESSAGES',
            message: 'Need at least 4 messages to extract patterns'
          },
          meta: { timestamp, requestId }
        },
        { status: 400 }
      );
    }

    // 4. Extract patterns using AI
    const businessProfile = simulation.tenant?.profiles?.[0];
    const industry = businessProfile?.industry || 'business_consulting';

    const extractedPatterns = await extractPatternsFromSimulation(
      simulation.messages,
      industry,
      simulation.scenarioType
    );

    // 5. Get existing profile patterns
    const existingProfile = businessProfile;

    const existingPatterns = existingProfile
      ? {
          communicationStyle: existingProfile.communicationStyle as any,
          pricingLogic: existingProfile.pricingLogic as any,
          qualificationCriteria: existingProfile.qualificationCriteria as any,
          objectionHandling: existingProfile.objectionHandling as any,
          decisionMakingPatterns: existingProfile.decisionMakingPatterns as any,
          knowledgeBase: existingProfile.knowledgeBase as any
        }
      : null;

    // 6. Merge with existing patterns
    const mergedPatterns = mergePatterns(existingPatterns, extractedPatterns);

    // Phase 5: Merge verbatim voice examples and business facts
    const newVoiceExamples = (extractedPatterns as any).verbatimVoiceExamples ?? null;
    const newBusinessFacts = (extractedPatterns as any).businessFacts ?? null;
    const mergedVoiceExamples = mergeOwnerVoiceExamples(
      existingProfile?.ownerVoiceExamples as any ?? null,
      newVoiceExamples
    );
    const mergedBusinessFacts = mergeBusinessFacts(null, newBusinessFacts);

    // 7. Calculate metrics
    const aiMessages = simulation.messages.filter(
      (m) => m.role === 'AI_CLIENT'
    ).length;
    const ownerMessages = simulation.messages.filter(
      (m) => m.role === 'BUSINESS_OWNER'
    ).length;

    const qualityScore = calculateQualityScore(
      simulation.messages.length,
      aiMessages,
      ownerMessages,
      simulation.status
    );

    const newSimulationCount = (existingProfile?.simulationCount || 0) + 1;
    const completionPercentage = calculateCompletionPercentage(
      newSimulationCount
    );

    // 8. Update database in transaction
    await prisma.$transaction([
      // Update simulation with extracted patterns and quality score
      prisma.simulation.update({
        where: { id: simulationId },
        data: {
          extractedPatterns: extractedPatterns as any,
          qualityScore
        }
      }),

      // Update business profile with merged patterns
      prisma.businessProfile.update({
        where: { tenantId },
        data: {
          communicationStyle: mergedPatterns.communicationStyle as any,
          pricingLogic: mergedPatterns.pricingLogic as any,
          qualificationCriteria: mergedPatterns.qualificationCriteria as any,
          objectionHandling: mergedPatterns.objectionHandling as any,
          decisionMakingPatterns: mergedPatterns.decisionMakingPatterns as any,
          knowledgeBase: mergedPatterns.knowledgeBase as any,

          // Phase 5: Triple extraction fields
          ownerVoiceExamples: mergedVoiceExamples as any,
          ...(mergedBusinessFacts?.mentionedExperience && !existingProfile?.yearsExperience
            ? { yearsExperience: parseInt(mergedBusinessFacts.mentionedExperience) || undefined }
            : {}),

          // Update completed scenarios list
          completedScenarios: existingProfile
            ? [...new Set([...existingProfile.completedScenarios, simulation.scenarioType])]
            : [simulation.scenarioType],

          // Update metadata
          completionPercentage,
          simulationCount: newSimulationCount,
          lastExtractedAt: new Date(),
          isComplete: completionPercentage >= 100,
          completionScore: completionPercentage
        }
      })
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          extractedPatterns: mergedPatterns,
          qualityScore,
          completionPercentage,
          simulationCount: newSimulationCount
        },
        meta: { timestamp, requestId }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Pattern extraction error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXTRACTION_FAILED',
          message: error.message || 'Failed to extract patterns'
        },
        meta: { timestamp, requestId }
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
