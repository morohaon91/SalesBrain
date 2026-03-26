/**
 * Extraction Queue
 * Manages async pattern extraction after simulation completion
 * Uses a fire-and-forget approach with status tracking via DB
 */

import { prisma } from '@/lib/prisma';
import { extractPatternsFromSimulation } from '@/lib/ai/extract-patterns';
import { mergePatterns, mergeOwnerVoiceExamples } from '@/lib/ai/merge-patterns';
import { calculateProfileCompletion } from '@/lib/utils/profile-completion';

/**
 * Trigger async extraction for a completed simulation.
 * Sets ownerApprovalStatus to PENDING, then runs extraction in background.
 */
export async function triggerAsyncExtraction(simulationId: string, tenantId: string): Promise<void> {
  // Run extraction asynchronously (don't await — fire and forget)
  runExtraction(simulationId, tenantId).catch((err) => {
    console.error(`Async extraction failed for simulation ${simulationId}:`, err);
  });
}

async function runExtraction(simulationId: string, tenantId: string): Promise<void> {
  try {
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        tenant: { include: { profiles: true } },
      },
    });

    if (!simulation || simulation.messages.length < 4) return;

    const profile = simulation.tenant.profiles[0];
    if (!profile) return;

    const patterns = await extractPatternsFromSimulation(
      simulation.messages,
      profile.industry ?? '',
      simulation.scenarioType
    );

    const existingPatterns = profile.communicationStyle
      ? {
          communicationStyle: profile.communicationStyle as any,
          pricingLogic: profile.pricingLogic as any,
          qualificationCriteria: profile.qualificationCriteria as any,
          objectionHandling: profile.objectionHandling as any,
          decisionMakingPatterns: profile.decisionMakingPatterns as any,
        }
      : null;

    const merged = mergePatterns(existingPatterns, patterns);
    const newVoiceExamples = (patterns as any).verbatimVoiceExamples ?? null;
    const mergedVoice = mergeOwnerVoiceExamples(
      profile.ownerVoiceExamples as any ?? null,
      newVoiceExamples
    );

    const newSimCount = profile.simulationCount + 1;

    // Build the updated profile shape to calculate completion percentage
    const updatedProfileShape = {
      ...profile,
      communicationStyle: merged.communicationStyle,
      pricingLogic: merged.pricingLogic,
      qualificationCriteria: merged.qualificationCriteria,
      objectionHandling: merged.objectionHandling,
      decisionMakingPatterns: merged.decisionMakingPatterns,
      ownerVoiceExamples: mergedVoice,
      simulationCount: newSimCount,
    };
    const newCompletion = calculateProfileCompletion(updatedProfileShape).total;

    await prisma.$transaction([
      prisma.simulation.update({
        where: { id: simulationId },
        data: {
          extractedPatterns: patterns as any,
          ownerApprovalStatus: 'EXTRACTED',
        },
      }),
      prisma.businessProfile.update({
        where: { tenantId },
        data: {
          communicationStyle: merged.communicationStyle as any,
          pricingLogic: merged.pricingLogic as any,
          qualificationCriteria: merged.qualificationCriteria as any,
          objectionHandling: merged.objectionHandling as any,
          decisionMakingPatterns: merged.decisionMakingPatterns as any,
          ownerVoiceExamples: mergedVoice as any,
          completedScenarios: [...new Set([...profile.completedScenarios, simulation.scenarioType])],
          simulationCount: newSimCount,
          lastExtractedAt: new Date(),
          completionPercentage: newCompletion,
          completionScore: newCompletion,
        },
      }),
    ]);

    console.log(`Async extraction complete for simulation ${simulationId}`);
  } catch (error) {
    console.error(`Extraction error for simulation ${simulationId}:`, error);
    // Mark as failed
    await prisma.simulation.update({
      where: { id: simulationId },
      data: { ownerApprovalStatus: 'REJECTED' },
    }).catch(() => {});
  }
}
