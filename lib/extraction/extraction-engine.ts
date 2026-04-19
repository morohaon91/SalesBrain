/**
 * Pattern Extraction Engine
 *
 * Analyzes completed simulations and updates BusinessProfile JSON fields.
 * Uses the universal mandatory-scenarios system and the shared AI client.
 */

import { prisma } from '@/lib/prisma';
import { createChatCompletion } from '@/lib/ai/client';
import { getScenarioById } from '@/lib/scenarios/mandatory-scenarios';
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionPrompt } from './extraction-prompts';
import { calculateProfileCompletion } from './completion';
import { updateProfileReadiness } from '@/lib/learning/readiness-calculator';
import { clampConfidence, crossScenarioCeiling } from '@/lib/learning/evidence-ceiling';
import type {
  CommunicationStyle,
  ObjectionHandling,
  ObjectionPlaybook,
  QualificationCriteria,
  DecisionMakingPatterns,
  PricingLogic,
  OwnerVoiceExamples,
  RawExtractionResponse,
  GreenFlag,
  YellowFlag,
  RedFlag,
  DealBreaker,
  ValuePositioning,
} from './schemas';

interface ExistingProfileSnapshot {
  communicationStyle: CommunicationStyle | null;
  objectionHandling: ObjectionHandling | null;
  qualificationCriteria: QualificationCriteria | null;
  decisionMakingPatterns: DecisionMakingPatterns | null;
  pricingLogic: PricingLogic | null;
  ownerVoiceExamples: OwnerVoiceExamples | null;
}

/**
 * Main extraction function — call after simulation completion.
 */
export async function extractPatternsFromSimulation(simulationId: string): Promise<{
  extracted: RawExtractionResponse;
  quality: number;
  confidence: number;
}> {
  console.log(`[Extraction] Starting for simulation ${simulationId}`);

  const simulation = await prisma.simulation.findUnique({
    where: { id: simulationId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      tenant: { include: { profiles: true } },
    },
  });

  if (!simulation) throw new Error('Simulation not found');
  if (simulation.status !== 'COMPLETED') throw new Error('Simulation not completed');

  const profile = simulation.tenant.profiles[0];
  if (!profile) throw new Error('Business profile not found');

  const scenario = getScenarioById(simulation.scenarioType);
  if (!scenario) console.warn(`Scenario ${simulation.scenarioType} not found - using legacy`);

  const existing: ExistingProfileSnapshot = {
    communicationStyle: profile.communicationStyle as any,
    objectionHandling: profile.objectionHandling as any,
    qualificationCriteria: profile.qualificationCriteria as any,
    decisionMakingPatterns: profile.decisionMakingPatterns as any,
    pricingLogic: profile.pricingLogic as any,
    ownerVoiceExamples: profile.ownerVoiceExamples as any,
  };

  const prompt = buildExtractionPrompt(
    scenario || { scenarioType: simulation.scenarioType },
    simulation.messages,
    existing
  );

  console.log('[Extraction] Calling Claude API...');
  const response = await createChatCompletion(
    [{ role: 'user', content: prompt }],
    EXTRACTION_SYSTEM_PROMPT,
    { temperature: 0.1, maxTokens: 4000 }
  );

  const extracted = parseExtractionResponse(response.content);

  console.log('[Extraction] Parsed results:', {
    quality: extracted.overallQuality,
    confidence: extracted.extractionConfidence,
  });

  await mergeExtractionWithProfile(profile.id, simulation.scenarioType, extracted, existing);

  await prisma.simulation.update({
    where: { id: simulationId },
    data: {
      extractedPatterns: extracted as any,
      validatedAt: new Date(),
      ownerApprovalStatus: 'EXTRACTED',
    },
  });

  if (scenario && !profile.completedScenarios.includes(scenario.id)) {
    await prisma.businessProfile.update({
      where: { id: profile.id },
      data: { completedScenarios: { push: scenario.id } },
    });
  }

  // Recalculate Go-Live readiness & next-recommended scenario
  await updateProfileReadiness(profile.id).catch((err) => {
    console.error('[Extraction] Readiness update failed:', err);
  });

  console.log('[Extraction] Complete');

  return {
    extracted,
    quality: extracted.overallQuality,
    confidence: extracted.extractionConfidence,
  };
}

/**
 * Re-extract from a specific simulation given an already-loaded profile
 * (used by re-extract flow that iterates sims in order).
 */
export async function extractRawFromMessages(
  messages: any[],
  scenarioType: string,
  existing: ExistingProfileSnapshot | null
): Promise<RawExtractionResponse> {
  const scenario = getScenarioById(scenarioType);
  const prompt = buildExtractionPrompt(
    scenario || { scenarioType },
    messages,
    existing
  );

  const response = await createChatCompletion(
    [{ role: 'user', content: prompt }],
    EXTRACTION_SYSTEM_PROMPT,
    { temperature: 0.1, maxTokens: 4000 }
  );

  return parseExtractionResponse(response.content);
}

function parseExtractionResponse(text: string): RawExtractionResponse {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in extraction response');

  try {
    return unwrapScalarObjects(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Failed to parse extraction JSON:', jsonMatch[0]);
    throw new Error('Invalid JSON in extraction response');
  }
}

// The AI sometimes wraps scalars as { value, status, evidence, confidence }.
// Schema expects bare scalars — unwrap recursively before merge.
export function unwrapScalarObjects(node: any): any {
  if (node == null) return node;
  if (Array.isArray(node)) return node.map(unwrapScalarObjects);
  if (typeof node !== 'object') return node;

  // { value, status?, evidence?, confidence?, source?, reasoning? } → value
  if ('value' in node && ('status' in node || 'evidence' in node || 'confidence' in node)) {
    const keys = Object.keys(node);
    const known = new Set(['value', 'status', 'evidence', 'confidence', 'source', 'reasoning']);
    if (keys.every((k) => known.has(k))) return unwrapScalarObjects(node.value);
  }

  // { signal|phrase|text|example, evidence?, ownerReaction?, ... } → signal/phrase/text/example
  const scalarKey = ['signal', 'phrase', 'text', 'example', 'quote'].find((k) => k in node);
  if (scalarKey) {
    const keys = Object.keys(node);
    const known = new Set([scalarKey, 'evidence', 'ownerReaction', 'confidence', 'context', 'source', 'reasoning', 'status']);
    if (keys.every((k) => known.has(k))) return unwrapScalarObjects(node[scalarKey]);
  }

  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(node)) out[k] = unwrapScalarObjects(v);
  return out;
}

// ============================================
// MERGE LOGIC
// ============================================

export async function mergeExtractionWithProfile(
  profileId: string,
  scenarioId: string,
  extracted: RawExtractionResponse,
  existing: ExistingProfileSnapshot
): Promise<void> {
  const now = new Date().toISOString();

  // Sim count AFTER this extraction lands. Used for evidence-based ceilings.
  const profile = await prisma.businessProfile.findUnique({
    where: { id: profileId },
    select: { completedScenarios: true },
  });
  const existingScenarios = profile?.completedScenarios ?? [];
  const projectedScenarios = existingScenarios.includes(scenarioId)
    ? existingScenarios
    : [...existingScenarios, scenarioId];
  const simCount = projectedScenarios.length;

  let snapshot: ExistingProfileSnapshot = {
    communicationStyle: mergeCommunicationStyle(existing.communicationStyle, extracted.communicationStyle, now),
    objectionHandling: mergeObjectionHandling(existing.objectionHandling, extracted.objectionHandling, scenarioId, now),
    qualificationCriteria: mergeQualificationCriteria(existing.qualificationCriteria, extracted.qualificationCriteria, now),
    decisionMakingPatterns: mergeDecisionMaking(existing.decisionMakingPatterns, extracted.decisionMakingPatterns, now),
    pricingLogic: mergePricingLogic(existing.pricingLogic, extracted.pricingLogic, now),
    ownerVoiceExamples: mergeOwnerVoice(existing.ownerVoiceExamples, extracted.ownerVoiceExamples, now),
  };

  snapshot = applyEvidenceCeilings(snapshot, simCount);

  const breakdown = calculateProfileCompletion({
    ...snapshot,
    completedScenarios: projectedScenarios,
  });

  await prisma.businessProfile.update({
    where: { id: profileId },
    data: {
      communicationStyle: snapshot.communicationStyle as any,
      objectionHandling: snapshot.objectionHandling as any,
      qualificationCriteria: snapshot.qualificationCriteria as any,
      decisionMakingPatterns: snapshot.decisionMakingPatterns as any,
      pricingLogic: snapshot.pricingLogic as any,
      ownerVoiceExamples: snapshot.ownerVoiceExamples as any,
      completionPercentage: breakdown.total,
      completionScore: breakdown.total,
      isComplete: breakdown.total >= 100,
      lastExtractedAt: new Date(),
    },
  });
}

/**
 * Public merge — returns merged objects without persisting.
 * Used by re-extract loop to merge across many sims before a single DB write.
 * Caller is responsible for applying ceilings with the final sim count.
 */
export function mergeAll(
  existing: ExistingProfileSnapshot,
  extracted: RawExtractionResponse,
  scenarioId: string
): ExistingProfileSnapshot {
  const now = new Date().toISOString();
  return {
    communicationStyle: mergeCommunicationStyle(existing.communicationStyle, extracted.communicationStyle, now),
    objectionHandling: mergeObjectionHandling(existing.objectionHandling, extracted.objectionHandling, scenarioId, now),
    qualificationCriteria: mergeQualificationCriteria(existing.qualificationCriteria, extracted.qualificationCriteria, now),
    decisionMakingPatterns: mergeDecisionMaking(existing.decisionMakingPatterns, extracted.decisionMakingPatterns, now),
    pricingLogic: mergePricingLogic(existing.pricingLogic, extracted.pricingLogic, now),
    ownerVoiceExamples: mergeOwnerVoice(existing.ownerVoiceExamples, extracted.ownerVoiceExamples, now),
  };
}

/**
 * Clamp all confidence numbers in the merged snapshot to what the evidence
 * actually supports. The raw merge functions may inflate confidence as
 * patterns repeat; this pass is the single authority on what confidence can
 * actually be reported. See lib/learning/evidence-ceiling.ts for rationale.
 *
 *   - Pattern-level confidences (communicationStyle, pricingLogic, overalls)
 *     clamp to confidenceCeiling(simCount).
 *   - Objection playbooks and deal breakers additionally clamp to
 *     crossScenarioCeiling(distinct scenarios where they were seen) — the
 *     same price objection handled in PRICE_OBJECTION + HOT_LEAD is worth
 *     more than PRICE_OBJECTION run twice.
 */
export function applyEvidenceCeilings(
  snapshot: ExistingProfileSnapshot,
  simCount: number
): ExistingProfileSnapshot {
  const cs = snapshot.communicationStyle;
  const oh = snapshot.objectionHandling;
  const qc = snapshot.qualificationCriteria;
  const dm = snapshot.decisionMakingPatterns;
  const pl = snapshot.pricingLogic;

  // Spread guard: the AI sometimes returns a bare string where the schema
  // expects an object. Spreading a string produces { 0, 1, ..., N } — which
  // breaks both the schema and React rendering. Only spread real objects.
  const isObj = (v: any): v is Record<string, any> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);

  return {
    communicationStyle: cs
      ? { ...cs, confidence: clampConfidence(cs.confidence, cs.evidenceCount ?? simCount) }
      : null,
    objectionHandling: oh
      ? {
          ...oh,
          playbooks: oh.playbooks.filter(isObj).map((p: any) => {
            const repCeiling = clampConfidence(p.confidenceScore, p.evidenceCount ?? 1);
            const crossCeiling = crossScenarioCeiling(p.scenariosEncountered?.length ?? 1);
            return { ...p, confidenceScore: Math.min(repCeiling, crossCeiling) };
          }),
          overallConfidence: clampConfidence(oh.overallConfidence, simCount),
        }
      : null,
    qualificationCriteria: qc
      ? {
          ...qc,
          greenFlags: qc.greenFlags.filter(isObj).map((f: any) => ({ ...f, confidence: clampConfidence(f.confidence, simCount) })),
          yellowFlags: qc.yellowFlags.filter(isObj).map((f: any) => ({ ...f, confidence: clampConfidence(f.confidence, simCount) })),
          redFlags: qc.redFlags.filter(isObj).map((f: any) => ({ ...f, confidence: clampConfidence(f.confidence, simCount) })),
          // Deal breakers are critical — use cross-scenario ceiling against
          // the scenarios they've been demonstrated in.
          dealBreakers: qc.dealBreakers.filter(isObj).map((db: any) => {
            const repCeiling = clampConfidence(db.confidence, db.evidenceCount ?? 1);
            const crossCeiling = crossScenarioCeiling(db.scenariosDemonstrated?.length ?? 1);
            return { ...db, confidence: Math.min(repCeiling, crossCeiling) };
          }),
          overallConfidence: clampConfidence(qc.overallConfidence, simCount),
        }
      : null,
    decisionMakingPatterns: dm
      ? { ...dm, overallConfidence: clampConfidence(dm.overallConfidence, simCount) }
      : null,
    pricingLogic: pl ? { ...pl, confidence: clampConfidence(pl.confidence, simCount) } : null,
    ownerVoiceExamples: snapshot.ownerVoiceExamples,
  };
}

function mergeCommunicationStyle(
  existing: CommunicationStyle | null,
  extracted: Partial<CommunicationStyle> | undefined,
  now: string
): CommunicationStyle {
  const e = extracted ?? {};
  if (!existing) {
    return {
      tone: e.tone ?? null,
      energyLevel: e.energyLevel ?? null,
      sentenceLength: e.sentenceLength ?? null,
      complexityLevel: e.complexityLevel ?? null,
      usesHumor: e.usesHumor ?? false,
      humorExamples: e.humorExamples ?? [],
      usesEmpathy: e.usesEmpathy ?? false,
      empathyExamples: e.empathyExamples ?? [],
      pressureLevel: e.pressureLevel ?? null,
      commonPhrases: e.commonPhrases ?? [],
      commonOpenings: e.commonOpenings ?? [],
      commonClosings: e.commonClosings ?? [],
      favoriteWords: e.favoriteWords ?? [],
      punctuationStyle: e.punctuationStyle ?? null,
      emojiUsage: e.emojiUsage ?? null,
      typoTolerance: e.typoTolerance ?? null,
      verbosityPattern: e.verbosityPattern ?? null,
      confidence: e.confidence ?? 30,
      evidenceCount: 1,
      lastUpdated: now,
    };
  }

  return {
    tone: e.tone ?? existing.tone,
    energyLevel: e.energyLevel ?? existing.energyLevel,
    sentenceLength: e.sentenceLength ?? existing.sentenceLength,
    complexityLevel: e.complexityLevel ?? existing.complexityLevel,

    usesHumor: e.usesHumor || existing.usesHumor,
    humorExamples: [...(existing.humorExamples ?? []), ...(e.humorExamples ?? [])].slice(0, 10),

    usesEmpathy: e.usesEmpathy || existing.usesEmpathy,
    empathyExamples: [...(existing.empathyExamples ?? []), ...(e.empathyExamples ?? [])].slice(0, 10),

    pressureLevel: e.pressureLevel ?? existing.pressureLevel,

    commonPhrases: mergeUnique(existing.commonPhrases, e.commonPhrases).slice(0, 20),
    commonOpenings: mergeUnique(existing.commonOpenings, e.commonOpenings).slice(0, 10),
    commonClosings: mergeUnique(existing.commonClosings, e.commonClosings).slice(0, 10),
    favoriteWords: mergeUnique(existing.favoriteWords, e.favoriteWords).slice(0, 20),

    punctuationStyle: e.punctuationStyle ?? existing.punctuationStyle,
    emojiUsage: e.emojiUsage ?? existing.emojiUsage,
    typoTolerance: e.typoTolerance ?? existing.typoTolerance,
    verbosityPattern: e.verbosityPattern ?? existing.verbosityPattern,

    confidence: Math.min(100, (((existing.confidence ?? 0) + (e.confidence ?? 50)) / 2) + 5),
    evidenceCount: existing.evidenceCount + 1,
    lastUpdated: now,
  };
}

function mergeObjectionHandling(
  existing: ObjectionHandling | null,
  extracted: { playbooks?: ObjectionPlaybook[]; overallConfidence?: number } | undefined,
  scenarioId: string,
  now: string
): ObjectionHandling {
  const incomingPlaybooks = extracted?.playbooks ?? [];

  if (!existing) {
    return {
      playbooks: incomingPlaybooks.map((p) => ({
        ...p,
        lastSeenAt: now,
        scenariosEncountered: p.scenariosEncountered?.length ? p.scenariosEncountered : [scenarioId],
      })),
      overallConfidence: extracted?.overallConfidence ?? 0,
      lastUpdated: now,
    };
  }

  const merged = [...existing.playbooks];

  for (const incoming of incomingPlaybooks) {
    const i = merged.findIndex((p) => p.objectionType === incoming.objectionType);
    if (i >= 0) {
      const current = merged[i];
      merged[i] = {
        ...current,
        signalExamples: mergeUnique(current.signalExamples, incoming.signalExamples).slice(0, 10),
        responseExamples: mergeUnique(current.responseExamples, incoming.responseExamples).slice(0, 10),
        responseStrategy: incoming.responseStrategy || current.responseStrategy,
        reframingMethod: incoming.reframingMethod ?? current.reframingMethod,
        escalationLogic: incoming.escalationLogic ?? current.escalationLogic,
        exitLogic: incoming.exitLogic ?? current.exitLogic,
        confidenceScore: Math.min(100, current.confidenceScore + 10),
        evidenceCount: current.evidenceCount + 1,
        lastSeenAt: now,
        scenariosEncountered: mergeUnique(
          current.scenariosEncountered,
          incoming.scenariosEncountered?.length ? incoming.scenariosEncountered : [scenarioId]
        ),
      };
    } else {
      merged.push({
        ...incoming,
        lastSeenAt: now,
        scenariosEncountered: incoming.scenariosEncountered?.length ? incoming.scenariosEncountered : [scenarioId],
      });
    }
  }

  return {
    playbooks: merged,
    overallConfidence: Math.min(100, existing.overallConfidence + 5),
    lastUpdated: now,
  };
}

function mergeQualificationCriteria(
  existing: QualificationCriteria | null,
  extracted: Partial<QualificationCriteria> | undefined,
  now: string
): QualificationCriteria {
  const e = extracted ?? {};

  if (!existing) {
    const allFlags = [...(e.greenFlags ?? []), ...(e.redFlags ?? [])];
    const overallConfidence = allFlags.length > 0
      ? Math.round(allFlags.reduce((sum, f) => sum + (f.confidence || 0), 0) / allFlags.length)
      : 0;
    return {
      greenFlags: e.greenFlags ?? [],
      yellowFlags: e.yellowFlags ?? [],
      redFlags: e.redFlags ?? [],
      dealBreakers: e.dealBreakers ?? [],
      walkAwayStrategy: e.walkAwayStrategy ?? {
        exitLanguage: [],
        leavesDoorOpen: true,
        exitFirmness: null,
        offersAlternatives: false,
        alternativeExamples: [],
      },
      overallConfidence,
      lastUpdated: now,
    };
  }

  const mergedGreenFlags = mergeFlags<GreenFlag>(existing.greenFlags, e.greenFlags ?? []);
  const mergedYellowFlags = mergeFlags<YellowFlag>(existing.yellowFlags, e.yellowFlags ?? []);
  const mergedRedFlags = mergeFlags<RedFlag>(existing.redFlags, e.redFlags ?? []);
  const allFlags = [...mergedGreenFlags, ...mergedRedFlags];
  const overallConfidence = allFlags.length > 0
    ? Math.round(allFlags.reduce((sum, f) => sum + (f.confidence || 0), 0) / allFlags.length)
    : 0;

  return {
    greenFlags: mergedGreenFlags,
    yellowFlags: mergedYellowFlags,
    redFlags: mergedRedFlags,
    dealBreakers: mergeDealBreakers(existing.dealBreakers, e.dealBreakers ?? []),
    walkAwayStrategy: {
      exitLanguage: mergeUnique(
        existing.walkAwayStrategy.exitLanguage,
        e.walkAwayStrategy?.exitLanguage ?? []
      ),
      leavesDoorOpen: e.walkAwayStrategy?.leavesDoorOpen ?? existing.walkAwayStrategy.leavesDoorOpen,
      exitFirmness: e.walkAwayStrategy?.exitFirmness ?? existing.walkAwayStrategy.exitFirmness,
      offersAlternatives:
        e.walkAwayStrategy?.offersAlternatives ?? existing.walkAwayStrategy.offersAlternatives,
      alternativeExamples: mergeUnique(
        existing.walkAwayStrategy.alternativeExamples,
        e.walkAwayStrategy?.alternativeExamples ?? []
      ),
    },
    overallConfidence,
    lastUpdated: now,
  };
}

function mergeDecisionMaking(
  existing: DecisionMakingPatterns | null,
  extracted: Partial<DecisionMakingPatterns> | undefined,
  now: string
): DecisionMakingPatterns {
  const e = extracted ?? {};

  if (!existing) {
    const discovery = e.discovery ?? { firstQuestions: [], discoveryOrder: [], prioritizedInfo: [], moveToValueTrigger: null };
    const vp = e.valuePositioning ?? { primaryValueLens: null, secondaryValueLens: [], proofSignalsUsed: [] };
    const closing = e.closing ?? { asksForNextStep: false, ctaTiming: null, ctaDirectness: null, preferredNextStep: null, createsUrgency: false, urgencyMethod: null };
    const filledFields = [
      (discovery.firstQuestions?.length ?? 0) >= 3,
      !!discovery.moveToValueTrigger,
      !!vp.primaryValueLens,
      (vp.proofSignalsUsed?.length ?? 0) >= 1,
      !!closing.asksForNextStep,
      !!closing.preferredNextStep,
    ].filter(Boolean).length;
    const overallConfidence = Math.round((filledFields / 6) * 100);
    return {
      discovery,
      pain: e.pain ?? { deepensPain: false, painDepthLevel: null, normalizesProblem: false, painApproach: null },
      valuePositioning: vp,
      closing,
      overallConfidence,
      lastUpdated: now,
    };
  }

  const mergedDiscovery = {
    firstQuestions: mergeUnique(
      existing.discovery?.firstQuestions ?? [],
      e.discovery?.firstQuestions ?? []
    ).slice(0, 15),
    discoveryOrder: e.discovery?.discoveryOrder ?? existing.discovery?.discoveryOrder ?? [],
    prioritizedInfo: mergeUnique(existing.discovery?.prioritizedInfo ?? [], e.discovery?.prioritizedInfo ?? []),
    moveToValueTrigger: e.discovery?.moveToValueTrigger ?? existing.discovery?.moveToValueTrigger ?? null,
  };
  const rawExistingVP = existing.valuePositioning as any;
  const existingVP = typeof rawExistingVP === 'string'
    ? { primaryValueLens: rawExistingVP as ValuePositioning['primaryValueLens'], secondaryValueLens: [] as string[], proofSignalsUsed: [] as string[] }
    : (existing.valuePositioning ?? { primaryValueLens: null as ValuePositioning['primaryValueLens'], secondaryValueLens: [] as string[], proofSignalsUsed: [] as string[] });
  const mergedValuePositioning = {
    primaryValueLens: e.valuePositioning?.primaryValueLens ?? existingVP.primaryValueLens,
    secondaryValueLens: mergeUnique(existingVP.secondaryValueLens ?? [], e.valuePositioning?.secondaryValueLens ?? []),
    proofSignalsUsed: mergeUnique(existingVP.proofSignalsUsed ?? [], e.valuePositioning?.proofSignalsUsed ?? []),
  };
  const mergedClosing = {
    asksForNextStep: e.closing?.asksForNextStep ?? existing.closing?.asksForNextStep ?? false,
    ctaTiming: e.closing?.ctaTiming ?? existing.closing?.ctaTiming ?? null,
    ctaDirectness: e.closing?.ctaDirectness ?? existing.closing?.ctaDirectness ?? null,
    preferredNextStep: e.closing?.preferredNextStep ?? existing.closing?.preferredNextStep ?? null,
    createsUrgency: e.closing?.createsUrgency ?? existing.closing?.createsUrgency ?? false,
    urgencyMethod: e.closing?.urgencyMethod ?? existing.closing?.urgencyMethod ?? null,
  };

  const filledFields = [
    (mergedDiscovery.firstQuestions?.length ?? 0) >= 3,
    !!mergedDiscovery.moveToValueTrigger,
    !!mergedValuePositioning.primaryValueLens,
    (mergedValuePositioning.proofSignalsUsed?.length ?? 0) >= 1,
    !!mergedClosing.asksForNextStep,
    !!mergedClosing.preferredNextStep,
  ].filter(Boolean).length;
  const overallConfidence = Math.round((filledFields / 6) * 100);

  return {
    discovery: mergedDiscovery,
    pain: {
      deepensPain: e.pain?.deepensPain ?? existing.pain.deepensPain,
      painDepthLevel: e.pain?.painDepthLevel ?? existing.pain.painDepthLevel,
      normalizesProblem: e.pain?.normalizesProblem ?? existing.pain.normalizesProblem,
      painApproach: e.pain?.painApproach ?? existing.pain.painApproach,
    },
    valuePositioning: mergedValuePositioning,
    closing: mergedClosing,
    overallConfidence,
    lastUpdated: now,
  };
}

function mergePricingLogic(
  existing: PricingLogic | null,
  extracted: Partial<PricingLogic> | undefined,
  now: string
): PricingLogic {
  const e = extracted ?? {};

  if (!existing) {
    return {
      minimumBudget: e.minimumBudget ?? null,
      preferredBudgetRange: e.preferredBudgetRange ?? null,
      flexibleOn: e.flexibleOn ?? [],
      notFlexibleOn: e.notFlexibleOn ?? [],
      priceDefenseStrategy: e.priceDefenseStrategy ?? null,
      valueAnchorPoints: e.valueAnchorPoints ?? [],
      confidence: e.confidence ?? 0,
      lastUpdated: now,
    };
  }

  return {
    minimumBudget: e.minimumBudget ?? existing.minimumBudget,
    preferredBudgetRange: e.preferredBudgetRange ?? existing.preferredBudgetRange,
    flexibleOn: mergeUnique(existing.flexibleOn, e.flexibleOn ?? []),
    notFlexibleOn: mergeUnique(existing.notFlexibleOn, e.notFlexibleOn ?? []),
    priceDefenseStrategy: e.priceDefenseStrategy ?? existing.priceDefenseStrategy,
    valueAnchorPoints: mergeUnique(existing.valueAnchorPoints, e.valueAnchorPoints ?? []),
    confidence: Math.min(100, existing.confidence + 5),
    lastUpdated: now,
  };
}

function mergeOwnerVoice(
  existing: OwnerVoiceExamples | null,
  extracted: Partial<OwnerVoiceExamples> | undefined,
  now: string
): OwnerVoiceExamples {
  const e = extracted ?? {};

  if (!existing) {
    return {
      greetings: e.greetings ?? [],
      discoveryQuestions: e.discoveryQuestions ?? [],
      empathyStatements: e.empathyStatements ?? [],
      valueStatements: e.valueStatements ?? [],
      objectionResponses: e.objectionResponses ?? [],
      closingStatements: e.closingStatements ?? [],
      exitStatements: e.exitStatements ?? [],
      fullMessages: e.fullMessages ?? [],
      lastUpdated: now,
    };
  }

  return {
    greetings: mergeUnique(existing.greetings, e.greetings ?? []).slice(0, 10),
    discoveryQuestions: mergeUnique(existing.discoveryQuestions, e.discoveryQuestions ?? []).slice(0, 20),
    empathyStatements: mergeUnique(existing.empathyStatements, e.empathyStatements ?? []).slice(0, 15),
    valueStatements: mergeUnique(existing.valueStatements, e.valueStatements ?? []).slice(0, 15),
    objectionResponses: mergeUnique(existing.objectionResponses, e.objectionResponses ?? []).slice(0, 20),
    closingStatements: mergeUnique(existing.closingStatements, e.closingStatements ?? []).slice(0, 10),
    exitStatements: mergeUnique(existing.exitStatements, e.exitStatements ?? []).slice(0, 10),
    fullMessages: [...(existing.fullMessages ?? []), ...(e.fullMessages ?? [])].slice(-30),
    lastUpdated: now,
  };
}

function mergeUnique(arr1: string[] = [], arr2: string[] = []): string[] {
  const a = Array.isArray(arr1) ? arr1 : [];
  const b = Array.isArray(arr2) ? arr2 : [];
  return Array.from(new Set([...a, ...b]));
}

function mergeFlags<T extends { flagType: string; signalExamples: string[]; confidence: number }>(
  existing: T[],
  extracted: T[]
): T[] {
  // Drop non-object entries — the AI occasionally returns bare strings that
  // would break both the schema and downstream rendering.
  const isFlag = (f: any): f is T => f !== null && typeof f === 'object' && !Array.isArray(f);
  const merged = [...(existing ?? []).filter(isFlag)];
  for (const incoming of (extracted ?? []).filter(isFlag)) {
    const i = merged.findIndex((f) => f.flagType === incoming.flagType);
    if (i >= 0) {
      merged[i] = {
        ...merged[i],
        signalExamples: mergeUnique(merged[i].signalExamples, incoming.signalExamples).slice(0, 10),
        confidence: Math.min(100, merged[i].confidence + 5),
      };
    } else {
      merged.push(incoming);
    }
  }
  return merged;
}

function mergeDealBreakers(existing: DealBreaker[], extracted: DealBreaker[]): DealBreaker[] {
  const isDB = (d: any): d is DealBreaker =>
    d !== null && typeof d === 'object' && !Array.isArray(d) && typeof d.rule === 'string';
  const merged = [...(existing ?? []).filter(isDB)];
  for (const incoming of (extracted ?? []).filter(isDB)) {
    const i = merged.findIndex((d) => d.rule === incoming.rule);
    if (i >= 0) {
      merged[i] = {
        ...merged[i],
        evidenceCount: merged[i].evidenceCount + 1,
        confidence: Math.min(100, merged[i].confidence + 10),
        scenariosDemonstrated: mergeUnique(
          merged[i].scenariosDemonstrated,
          incoming.scenariosDemonstrated ?? []
        ),
      };
    } else {
      merged.push(incoming);
    }
  }
  return merged;
}

// ============================================
// ASYNC QUEUE (fire-and-forget from /complete)
// ============================================

export function triggerAsyncExtraction(simulationId: string): void {
  extractPatternsFromSimulation(simulationId).catch((err) => {
    console.error(`[Extraction] Async failure for simulation ${simulationId}:`, err);
    prisma.simulation
      .update({
        where: { id: simulationId },
        data: { ownerApprovalStatus: 'REJECTED' },
      })
      .catch(() => {});
  });
}
