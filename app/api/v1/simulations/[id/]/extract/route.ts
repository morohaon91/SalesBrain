/**
 * POST /api/v1/simulations/[id]/extract
 * Extract patterns from a completed simulation with quality gating
 * Phase 3: Quality check prevents extraction from incomplete simulations
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { extractPatternsWithQualityCheck } from '@/lib/ai/extract-patterns';
import { mergePatterns, mergePatternsWithConfidence } from '@/lib/ai/merge-patterns';
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

    // 4. Extract patterns using AI with quality check (Phase 3)
    const businessProfile = simulation.tenant?.profiles?.[0];
    const industry = businessProfile?.industry || 'business_consulting';

    const { patterns: extractedPatterns, qualityReport } = await extractPatternsWithQualityCheck(
      simulation.messages as any,
      industry,
      simulation.scenarioType
    );

    // 5. If quality score is too low, return quality report instead of extracting
    if (!extractedPatterns) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXTRACTION_BLOCKED_LOW_QUALITY',
            message: `Extraction blocked: ${qualityReport.recommendation}`,
            details: {
              score: qualityReport.completenessScore,
              recommendation: qualityReport.recommendation,
              feedback: qualityReport.feedback
            }
          },
          meta: { timestamp, requestId }
        },
        { status: 400 }
      );
    }

    // 6. Get existing profile patterns
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

    // 7. Merge with existing patterns (Phase 5: with confidence)
    const newSimulationCount = (existingProfile?.simulationCount || 0) + 1;
    const mergedPatterns = mergePatternsWithConfidence(
      existingPatterns,
      extractedPatterns,
      newSimulationCount
    );

    // 8. Calculate metrics
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

    const completionPercentage = calculateCompletionPercentage(
      newSimulationCount
    );

    // 9. Update database in transaction
    await prisma.$transaction([
      // Update simulation with extracted patterns and quality score
      prisma.simulation.update({
        where: { id: simulationId },
        data: {
          extractedPatterns: extractedPatterns as any,
          qualityScore,
          // Note: validatedAt remains null until owner approves via validation endpoint
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
          simulationCount: newSimulationCount,
          qualityReport: {
            completenessScore: qualityReport.completenessScore,
            recommendation: qualityReport.recommendation,
            feedback: qualityReport.feedback
          }
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
