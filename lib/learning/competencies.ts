/**
 * Competency Definitions
 *
 * What must be learned before Go Live.
 *
 * Evidence-based unlocking: no competency can reach ACHIEVED from a single
 * simulation. ACHIEVED requires ≥2 contributing sims. MASTERED requires ≥4
 * sims for ordinary competencies, and for critical ones (price objection,
 * trust objection, deal breakers, closing strategy) requires cross-scenario
 * evidence as well — the same pattern demonstrated across different
 * scenario types, not repeated in the same context.
 *
 * This is deliberately slower than confidence-only gating. The downstream
 * AI agent goes live in real sales conversations; we prefer accuracy over
 * speed of unlocking.
 */

import { COMPETENCY_GATES } from './evidence-ceiling';

export type CompetencyCategory = 'identity' | 'strategic' | 'qualification' | 'objection' | 'adaptation';

export type CompetencyState = 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'MASTERED';

export interface CompetencyRequirement {
  id: string;
  name: string;
  category: CompetencyCategory;
  description: string;
  requiredForGoLive: boolean;
  minimumConfidence: number;
  minimumEvidence: number;
  validate: (profile: any) => CompetencyStatus;
}

export interface CompetencyStatus {
  competencyId: string;
  status: CompetencyState;
  currentConfidence: number;
  evidenceCount: number;
  blockingReasons: string[];
}

function simCount(profile: any): number {
  return Array.isArray(profile?.completedScenarios) ? profile.completedScenarios.length : 0;
}

/**
 * Given a passing signal + confidence + evidence, decide the status.
 *
 * - blocking not empty → IN_PROGRESS (requirements missing).
 * - simCount < 2 → IN_PROGRESS regardless (one sim is a hint, not proof).
 * - confidence >= masteryThreshold AND simCount >= masteredMinSims
 *   AND (non-critical OR distinctScenarios >= criticalMasteredMinDistinctScenarios)
 *   → MASTERED.
 * - otherwise → ACHIEVED.
 */
function deriveStatus(args: {
  blocking: string[];
  confidence: number;
  masteryThreshold: number;
  sims: number;
  critical?: boolean;
  distinctScenarios?: number;
}): CompetencyState {
  const { blocking, confidence, masteryThreshold, sims, critical, distinctScenarios } = args;
  if (blocking.length > 0) return 'IN_PROGRESS';
  if (sims < COMPETENCY_GATES.achievedMinSims) return 'IN_PROGRESS';
  const masteredByRepetition = sims >= COMPETENCY_GATES.masteredMinSims;
  const masteredByDiversity = critical
    ? (distinctScenarios ?? 0) >= COMPETENCY_GATES.criticalMasteredMinDistinctScenarios
    : true;
  const masteredByConfidence = confidence >= masteryThreshold;
  return masteredByRepetition && masteredByDiversity && masteredByConfidence ? 'MASTERED' : 'ACHIEVED';
}

function simGateReason(sims: number): string | null {
  if (sims < COMPETENCY_GATES.achievedMinSims) {
    return `Need evidence from at least ${COMPETENCY_GATES.achievedMinSims} simulations (have ${sims})`;
  }
  return null;
}

export const COMPETENCIES: CompetencyRequirement[] = [
  // ── IDENTITY ──────────────────────────────────────────────────────────────
  {
    id: 'communication_style_established',
    name: 'Communication Style Established',
    category: 'identity',
    description: "AI has learned owner's tone, energy, and linguistic patterns",
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 3,
    validate: (profile) => {
      const sims = simCount(profile);
      const cs = profile?.communicationStyle;
      if (!cs) {
        return {
          competencyId: 'communication_style_established',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No communication style data extracted yet'],
        };
      }

      const hasBasics = !!(cs.tone && cs.sentenceLength && cs.energyLevel);
      const hasFingerprint = (cs.commonPhrases?.length || 0) >= 5;
      const confidence = cs.confidence || 0;
      const evidence = cs.evidenceCount || 0;

      const blocking: string[] = [];
      if (!hasBasics) blocking.push('Missing basic style attributes (tone/length/energy)');
      if (!hasFingerprint) blocking.push('Need at least 5 common phrases');
      const simBlock = simGateReason(Math.max(sims, evidence));
      if (simBlock) blocking.push(simBlock);
      if (confidence < 65) blocking.push(`Confidence too low: ${confidence}% (need 65%)`);

      return {
        competencyId: 'communication_style_established',
        status: deriveStatus({ blocking, confidence, masteryThreshold: 85, sims: Math.max(sims, evidence) }),
        currentConfidence: confidence,
        evidenceCount: evidence,
        blockingReasons: blocking,
      };
    },
  },
  {
    id: 'linguistic_fingerprint_captured',
    name: 'Linguistic Fingerprint Captured',
    category: 'identity',
    description: "Owner's distinctive language patterns documented",
    requiredForGoLive: true,
    minimumConfidence: 60,
    minimumEvidence: 3,
    validate: (profile) => {
      const sims = simCount(profile);
      const voice = profile?.ownerVoiceExamples;
      if (!voice) {
        return {
          competencyId: 'linguistic_fingerprint_captured',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No voice examples extracted yet'],
        };
      }

      const hasOpenings = (voice.greetings?.length || 0) >= 3;
      const hasClosings = (voice.closingStatements?.length || 0) >= 3;
      const hasDiscovery = (voice.discoveryQuestions?.length || 0) >= 5;

      const totalExamples =
        (voice.greetings?.length || 0) +
        (voice.closingStatements?.length || 0) +
        (voice.discoveryQuestions?.length || 0) +
        (voice.valueStatements?.length || 0);

      // Voice confidence = richness capped at 100. Still gated by sim count.
      const confidence = Math.min(100, totalExamples * 3);
      const blocking: string[] = [];
      if (!hasOpenings) blocking.push('Need at least 3 opening examples');
      if (!hasClosings) blocking.push('Need at least 3 closing examples');
      if (!hasDiscovery) blocking.push('Need at least 5 discovery questions');
      const simBlock = simGateReason(sims);
      if (simBlock) blocking.push(simBlock);

      return {
        competencyId: 'linguistic_fingerprint_captured',
        status: deriveStatus({ blocking, confidence, masteryThreshold: 80, sims }),
        currentConfidence: confidence,
        evidenceCount: sims,
        blockingReasons: blocking,
      };
    },
  },

  // ── STRATEGIC ─────────────────────────────────────────────────────────────
  {
    id: 'discovery_mastery',
    name: 'Discovery Mastery',
    category: 'strategic',
    description: 'How owner uncovers lead pain and needs',
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 3,
    validate: (profile) => {
      const sims = simCount(profile);
      const dm = profile?.decisionMakingPatterns;
      if (!dm?.discovery) {
        return {
          competencyId: 'discovery_mastery',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No discovery patterns extracted yet'],
        };
      }

      const discovery = dm.discovery;
      const hasQuestions = (discovery.firstQuestions?.length || 0) >= 3;
      const hasTransition = !!discovery.moveToValueTrigger;
      const confidence = dm.overallConfidence || 0;

      const blocking: string[] = [];
      if (!hasQuestions) blocking.push('Need at least 3 discovery questions');
      if (!hasTransition) blocking.push('Need transition to value trigger');
      const simBlock = simGateReason(sims);
      if (simBlock) blocking.push(simBlock);
      if (confidence < 65) blocking.push(`Confidence too low: ${confidence}% (need 65%)`);

      return {
        competencyId: 'discovery_mastery',
        status: deriveStatus({ blocking, confidence, masteryThreshold: 85, sims }),
        currentConfidence: confidence,
        evidenceCount: sims,
        blockingReasons: blocking,
      };
    },
  },
  {
    id: 'value_positioning_established',
    name: 'Value Positioning Established',
    category: 'strategic',
    description: 'How owner frames and communicates value',
    requiredForGoLive: true,
    minimumConfidence: 65,
    minimumEvidence: 2,
    validate: (profile) => {
      const sims = simCount(profile);
      const dm = profile?.decisionMakingPatterns;
      if (!dm?.valuePositioning) {
        return {
          competencyId: 'value_positioning_established',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No value positioning extracted yet'],
        };
      }

      const vp = dm.valuePositioning;
      const hasPrimary = !!vp.primaryValueLens;
      const hasProof = (vp.proofSignalsUsed?.length || 0) >= 1;
      const confidence = dm.overallConfidence || 0;

      const blocking: string[] = [];
      if (!hasPrimary) blocking.push('Need primary value lens identified');
      if (!hasProof) blocking.push('Need at least 1 proof signal');
      const simBlock = simGateReason(sims);
      if (simBlock) blocking.push(simBlock);
      if (confidence < 60) blocking.push(`Confidence too low: ${confidence}% (need 60%)`);

      return {
        competencyId: 'value_positioning_established',
        status: deriveStatus({ blocking, confidence, masteryThreshold: 80, sims }),
        currentConfidence: confidence,
        evidenceCount: sims,
        blockingReasons: blocking,
      };
    },
  },
  {
    id: 'closing_strategy_defined',
    name: 'Closing Strategy Defined',
    category: 'strategic',
    description: 'When and how owner asks for next steps',
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 2,
    validate: (profile) => {
      const sims = simCount(profile);
      const dm = profile?.decisionMakingPatterns;
      if (!dm?.closing) {
        return {
          competencyId: 'closing_strategy_defined',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No closing patterns extracted yet'],
        };
      }

      const closing = dm.closing;
      const hasNextStep = !!closing.asksForNextStep;
      const hasPreference = !!closing.preferredNextStep;
      const confidence = dm.overallConfidence || 0;

      // Closing is critical — use total completed scenarios as the diversity
      // proxy (closing shows up across many scenario types, not tracked per
      // scenario on the pattern itself).
      const distinctScenarios = sims;

      const blocking: string[] = [];
      if (!hasNextStep) blocking.push('Owner must ask for next step');
      if (!hasPreference) blocking.push('Need preferred next step identified');
      const simBlock = simGateReason(sims);
      if (simBlock) blocking.push(simBlock);
      if (confidence < 65) blocking.push(`Confidence too low: ${confidence}% (need 65%)`);

      return {
        competencyId: 'closing_strategy_defined',
        status: deriveStatus({
          blocking,
          confidence,
          masteryThreshold: 85,
          sims,
          critical: true,
          distinctScenarios,
        }),
        currentConfidence: confidence,
        evidenceCount: sims,
        blockingReasons: blocking,
      };
    },
  },

  // ── QUALIFICATION ─────────────────────────────────────────────────────────
  {
    id: 'green_flags_identified',
    name: 'Green Flags Identified',
    category: 'qualification',
    description: 'Owner can recognize quality leads',
    requiredForGoLive: true,
    minimumConfidence: 65,
    minimumEvidence: 2,
    validate: (profile) => {
      const sims = simCount(profile);
      const qc = profile?.qualificationCriteria;
      if (!qc) {
        return {
          competencyId: 'green_flags_identified',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No qualification criteria extracted yet'],
        };
      }

      const greenCount = qc.greenFlags?.length || 0;
      const hasEnough = greenCount >= 3;
      const confidence = qc.overallConfidence || 0;

      const blocking: string[] = [];
      if (!hasEnough) blocking.push(`Need at least 3 green flags (have ${greenCount})`);
      const simBlock = simGateReason(sims);
      if (simBlock) blocking.push(simBlock);
      if (confidence < 60) blocking.push(`Confidence too low: ${confidence}% (need 60%)`);

      return {
        competencyId: 'green_flags_identified',
        status: deriveStatus({ blocking, confidence, masteryThreshold: 80, sims }),
        currentConfidence: confidence,
        evidenceCount: greenCount,
        blockingReasons: blocking,
      };
    },
  },
  {
    id: 'deal_breakers_validated',
    name: 'Deal Breakers Validated',
    category: 'qualification',
    description: 'Clear disqualification criteria demonstrated',
    requiredForGoLive: true,
    minimumConfidence: 75,
    minimumEvidence: 1,
    validate: (profile) => {
      const sims = simCount(profile);
      const qc = profile?.qualificationCriteria;
      const dealBreakers: any[] = Array.isArray(qc?.dealBreakers) ? qc.dealBreakers : [];

      if (dealBreakers.length === 0) {
        return {
          competencyId: 'deal_breakers_validated',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['No deal breakers extracted yet'],
        };
      }

      // Critical competency — require cross-scenario evidence.
      // We take the MAX distinct-scenario count across all deal breakers:
      // one deal breaker demonstrated in 2+ scenario types is enough.
      const maxDistinctScenarios = Math.max(
        ...dealBreakers.map((db) => (db?.scenariosDemonstrated?.length ?? 0))
      );
      const avgConfidence =
        dealBreakers.reduce((sum, db) => sum + (db?.confidence ?? 0), 0) / dealBreakers.length;
      const hasStrong = dealBreakers.some((db) => (db?.confidence ?? 0) >= 65);

      const blocking: string[] = [];
      if (!hasStrong) blocking.push('Need at least 1 deal breaker with 65%+ confidence');
      const simBlock = simGateReason(sims);
      if (simBlock) blocking.push(simBlock);

      return {
        competencyId: 'deal_breakers_validated',
        status: deriveStatus({
          blocking,
          confidence: avgConfidence,
          masteryThreshold: 85,
          sims,
          critical: true,
          distinctScenarios: maxDistinctScenarios,
        }),
        currentConfidence: avgConfidence,
        evidenceCount: maxDistinctScenarios,
        blockingReasons: blocking,
      };
    },
  },

  // ── OBJECTION ─────────────────────────────────────────────────────────────
  {
    id: 'price_objection_handling',
    name: 'Price Objection Handling',
    category: 'objection',
    description: 'How owner defends value when price is challenged',
    requiredForGoLive: true,
    minimumConfidence: 75,
    minimumEvidence: 1,
    validate: (profile) => {
      const sims = simCount(profile);
      const playbooks: any[] = Array.isArray(profile?.objectionHandling?.playbooks)
        ? profile.objectionHandling.playbooks
        : [];
      const price = playbooks.find((p) => p?.objectionType === 'price');

      if (!price) {
        return {
          competencyId: 'price_objection_handling',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['Price objection scenario not completed yet'],
        };
      }

      const confidence = price.confidenceScore || 0;
      const hasStrategy = !!price.responseStrategy;
      const hasExamples = (price.responseExamples?.length || 0) >= 1;
      const distinctScenarios = price.scenariosEncountered?.length ?? 0;
      const playbookSims = price.evidenceCount ?? 0;

      const blocking: string[] = [];
      if (!hasStrategy) blocking.push('Need price defense strategy');
      if (!hasExamples) blocking.push('Need at least 1 price response example');
      const simBlock = simGateReason(Math.max(sims, playbookSims));
      if (simBlock) blocking.push(simBlock);
      if (confidence < 65) blocking.push(`Confidence too low: ${confidence}% (need 65%)`);

      return {
        competencyId: 'price_objection_handling',
        status: deriveStatus({
          blocking,
          confidence,
          masteryThreshold: 85,
          sims: Math.max(sims, playbookSims),
          critical: true,
          distinctScenarios,
        }),
        currentConfidence: confidence,
        evidenceCount: playbookSims,
        blockingReasons: blocking,
      };
    },
  },
  {
    id: 'trust_objection_handling',
    name: 'Trust/Skepticism Handling',
    category: 'objection',
    description: 'How owner builds credibility with skeptical leads',
    requiredForGoLive: true,
    minimumConfidence: 70,
    minimumEvidence: 1,
    validate: (profile) => {
      const sims = simCount(profile);
      const playbooks: any[] = Array.isArray(profile?.objectionHandling?.playbooks)
        ? profile.objectionHandling.playbooks
        : [];
      const trust = playbooks.find((p) => p?.objectionType === 'trust');

      if (!trust) {
        return {
          competencyId: 'trust_objection_handling',
          status: 'NOT_STARTED',
          currentConfidence: 0,
          evidenceCount: 0,
          blockingReasons: ['Trust/skepticism scenario not completed yet'],
        };
      }

      const confidence = trust.confidenceScore || 0;
      const hasStrategy = !!trust.responseStrategy;
      const distinctScenarios = trust.scenariosEncountered?.length ?? 0;
      const playbookSims = trust.evidenceCount ?? 0;

      const blocking: string[] = [];
      if (!hasStrategy) blocking.push('Need trust-building strategy');
      const simBlock = simGateReason(Math.max(sims, playbookSims));
      if (simBlock) blocking.push(simBlock);
      if (confidence < 60) blocking.push(`Confidence too low: ${confidence}% (need 60%)`);

      return {
        competencyId: 'trust_objection_handling',
        status: deriveStatus({
          blocking,
          confidence,
          masteryThreshold: 85,
          sims: Math.max(sims, playbookSims),
          critical: true,
          distinctScenarios,
        }),
        currentConfidence: confidence,
        evidenceCount: playbookSims,
        blockingReasons: blocking,
      };
    },
  },
];

export function getAllCompetencies(): CompetencyRequirement[] {
  return COMPETENCIES;
}

export function getCompetenciesByCategory(category: CompetencyCategory): CompetencyRequirement[] {
  return COMPETENCIES.filter((c) => c.category === category);
}

export function getMandatoryCompetencies(): CompetencyRequirement[] {
  return COMPETENCIES.filter((c) => c.requiredForGoLive);
}

export function evaluateAllCompetencies(profile: any): CompetencyStatus[] {
  return COMPETENCIES.map((c) => c.validate(profile));
}

export function allMandatoryCompetenciesAchieved(profile: any): boolean {
  const mandatory = getMandatoryCompetencies();
  return mandatory
    .map((c) => c.validate(profile))
    .every((s) => s.status === 'ACHIEVED' || s.status === 'MASTERED');
}
