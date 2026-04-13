/**
 * POST /api/v1/profile/re-extract
 * Re-analyze all completed simulations and merge patterns
 */

import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { mergePatterns, mergeOwnerVoiceExamples } from '@/lib/ai/merge-patterns';
import { calculateProfileCompletion } from '@/lib/utils/profile-completion';
import { generateCloserExtractionPrompt } from '@/lib/ai/prompts/closer-extraction';
import { createChatCompletion } from '@/lib/ai/client';
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
          success: true,
          data: {
            extractedPatterns: null,
            closerFramework: null,
            completionPercentage: 0,
            simulationCount: 0,
            simulationsProcessed: 0,
            simulationsTotal: 0,
            message: 'No simulations yet'
          },
          meta: { timestamp, requestId }
        },
        { status: 200 }
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

    // 3. Extract patterns from each simulation, bypassing the quality gate
    // (re-extraction is a manual action — we extract from all completed sims)
    let mergedPatterns: any = null;
    let mergedVoiceExamples: any = profile.ownerVoiceExamples ?? null;
    let closerFramework: any = null;
    let successCount = 0;

    for (const simulation of completedSimulations) {
      if (simulation.messages.length < 4) continue;

      try {
        const extracted = await extractPatternsFromSimulation(
          simulation.messages,
          industry,
          simulation.scenarioType
        );

        successCount++;
        mergedPatterns = mergePatterns(mergedPatterns, extracted);

        const newVoice = (extracted as any).verbatimVoiceExamples ?? null;
        if (newVoice) {
          mergedVoiceExamples = mergeOwnerVoiceExamples(mergedVoiceExamples, newVoice);
        }

        // Extract CLOSER Framework from this simulation
        try {
          const transcript = simulation.messages
            .map((m) => `${m.role === 'BUSINESS_OWNER' ? 'Owner' : 'Client'}: ${m.content}`)
            .join('\n');

          const closerExtractionPrompt = generateCloserExtractionPrompt(transcript);
          const closerResponse = await createChatCompletion(
            [{ role: 'user', content: closerExtractionPrompt }],
            'You are extracting sales framework patterns from a conversation. Return ONLY valid JSON, no markdown.',
            { temperature: 0.3, maxTokens: 3000 }
          );

          let closerJsonStr = closerResponse.content;
          closerJsonStr = closerJsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          closerFramework = JSON.parse(closerJsonStr);
          console.log(`✅ CLOSER framework extracted from simulation ${simulation.id}`);
        } catch (closerError) {
          console.warn(`⚠️  Failed to extract CLOSER framework from simulation ${simulation.id}:`, closerError);
          // Continue - CLOSER extraction is optional
        }
      } catch (error) {
        console.error(`Failed to extract from simulation ${simulation.id}:`, error);
        continue;
      }
    }

    if (!mergedPatterns || successCount === 0) {
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

    // 4. Calculate completion using the depth-based algorithm (same as everywhere else)
    const updatedProfileShape = {
      ...profile,
      communicationStyle: mergedPatterns.communicationStyle,
      pricingLogic: mergedPatterns.pricingLogic,
      qualificationCriteria: mergedPatterns.qualificationCriteria,
      objectionHandling: mergedPatterns.objectionHandling,
      decisionMakingPatterns: mergedPatterns.decisionMakingPatterns,
      ownerVoiceExamples: mergedVoiceExamples,
      simulationCount: successCount,
    };
    const completionPercentage = calculateProfileCompletion(updatedProfileShape).total;

    // 5. Update profile with merged data
    await prisma.businessProfile.update({
      where: { tenantId },
      data: {
        communicationStyle: mergedPatterns.communicationStyle,
        pricingLogic: mergedPatterns.pricingLogic,
        qualificationCriteria: mergedPatterns.qualificationCriteria,
        objectionHandling: mergedPatterns.objectionHandling,
        decisionMakingPatterns: mergedPatterns.decisionMakingPatterns,
        ownerVoiceExamples: mergedVoiceExamples as any,
        // CLOSER Framework (use if extracted)
        ...(closerFramework ? { closerFramework: closerFramework as any } : {}),
        simulationCount: successCount,
        completionPercentage,
        completionScore: completionPercentage,
        lastExtractedAt: new Date(),
        isComplete: completionPercentage >= 100,
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          extractedPatterns: mergedPatterns,
          closerFramework,
          completionPercentage,
          simulationCount: successCount,
          simulationsProcessed: successCount,
          simulationsTotal: completedSimulations.length,
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
