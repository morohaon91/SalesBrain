import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { mergeExtractionWithProfile } from '@/lib/extraction/extraction-engine';
import { updateProfileReadiness } from '@/lib/learning/readiness-calculator';
import type { RawExtractionResponse } from '@/lib/extraction/schemas';

const MERGEABLE_SECTIONS = [
  'communicationStyle',
  'objectionHandling',
  'qualificationCriteria',
  'decisionMakingPatterns',
  'pricingLogic',
  'ownerVoiceExamples',
] as const;

type MergeableSection = (typeof MERGEABLE_SECTIONS)[number];

const validateSchema = z.object({
  action: z.enum(['approve', 'partial', 'reject']),
  approvedSections: z.array(z.string()).optional(),
});

async function handler(req: AuthenticatedRequest) {
  const simulationId = req.nextUrl.pathname.split('/')[4];
  const { tenantId } = req.auth;

  const body = await req.json();
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } },
      { status: 400 }
    );
  }

  const { action, approvedSections } = parsed.data;

  const simulation = await prisma.simulation.findUnique({
    where: { id: simulationId, tenantId },
    include: { tenant: { include: { profiles: true } } },
  });

  if (!simulation) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Simulation not found' } },
      { status: 404 }
    );
  }

  const statusMap: Record<string, string> = {
    approve: 'APPROVED',
    partial: 'PARTIAL',
    reject: 'REJECTED',
  };

  await prisma.simulation.update({
    where: { id: simulationId },
    data: {
      ownerApprovalStatus: statusMap[action] as any,
      ownerReviewedAt: new Date(),
    },
  });

  // Rejection means owner doesn't want this sim's patterns in their profile.
  if (action === 'reject') {
    return NextResponse.json({ success: true, action, simulationId, approvedSections: [] });
  }

  const profile = simulation.tenant.profiles[0];
  const rawExtracted = simulation.extractedPatterns as any;

  if (!profile || !rawExtracted) {
    return NextResponse.json({
      success: true,
      action,
      simulationId,
      approvedSections: approvedSections ?? [],
    });
  }

  // Determine which sections to merge. Partial approval only merges sections
  // the owner explicitly approved; full approval merges everything.
  const sectionsToMerge: MergeableSection[] =
    action === 'partial' && approvedSections && approvedSections.length > 0
      ? MERGEABLE_SECTIONS.filter((s) => approvedSections.includes(s))
      : [...MERGEABLE_SECTIONS];

  // Build a filtered extraction containing only the approved sections.
  // Unapproved sections are omitted so the merge treats them as "no new data".
  const filteredExtracted: Partial<RawExtractionResponse> & Pick<RawExtractionResponse, 'overallQuality' | 'extractionConfidence'> = {
    overallQuality: rawExtracted.overallQuality ?? 0,
    extractionConfidence: rawExtracted.extractionConfidence ?? 0,
  };

  for (const section of sectionsToMerge) {
    (filteredExtracted as any)[section] = rawExtracted[section];
  }

  await mergeExtractionWithProfile(
    profile.id,
    simulation.scenarioType,
    filteredExtracted as RawExtractionResponse,
    {
      communicationStyle: profile.communicationStyle as any,
      objectionHandling: profile.objectionHandling as any,
      qualificationCriteria: profile.qualificationCriteria as any,
      decisionMakingPatterns: profile.decisionMakingPatterns as any,
      pricingLogic: profile.pricingLogic as any,
      ownerVoiceExamples: profile.ownerVoiceExamples as any,
    }
  );

  await updateProfileReadiness(profile.id).catch((err) => {
    console.error('[Approval] Readiness update failed:', err);
  });

  return NextResponse.json({
    success: true,
    action,
    simulationId,
    approvedSections: sectionsToMerge,
  });
}

export const POST = withAuth(handler);
