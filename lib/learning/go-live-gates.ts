/**
 * Go-Live Gate Validation
 *
 * Hard gates that must pass before profile can go live.
 */

import { allMandatoryScenariosCompleted, MANDATORY_SCENARIOS } from '@/lib/scenarios/mandatory-scenarios';
import { allMandatoryCompetenciesAchieved, evaluateAllCompetencies } from './competencies';

export interface GateValidationResult {
  gateId: string;
  name: string;
  status: 'PASSED' | 'BLOCKED';
  progress: number;
  blockingReasons: string[];
}

export function validateMandatoryScenariosGate(completedScenarioIds: string[]): GateValidationResult {
  const allCompleted = allMandatoryScenariosCompleted(completedScenarioIds);
  const totalMandatory = MANDATORY_SCENARIOS.length;
  const completed = completedScenarioIds.filter((id) =>
    MANDATORY_SCENARIOS.some((s) => s.id === id || s.scenarioType === id)
  ).length;

  return {
    gateId: 'mandatory_scenarios',
    name: `Complete All ${totalMandatory} Mandatory Scenarios`,
    status: allCompleted ? 'PASSED' : 'BLOCKED',
    progress: Math.min(100, (completed / totalMandatory) * 100),
    blockingReasons: allCompleted
      ? []
      : [`Only ${completed}/${totalMandatory} mandatory scenarios completed`],
  };
}

export function validateCompetencyCoverageGate(profile: any): GateValidationResult {
  const allAchieved = allMandatoryCompetenciesAchieved(profile);
  const statuses = evaluateAllCompetencies(profile);

  const achieved = statuses.filter((s) => s.status === 'ACHIEVED' || s.status === 'MASTERED').length;
  const total = statuses.length;
  const unachieved = statuses.filter((s) => s.status !== 'ACHIEVED' && s.status !== 'MASTERED');

  // Show competency names only — NOT their individual blocking reasons.
  // Detailed reasons are shown on the learning page. Dumping all reasons here
  // creates misleading duplication with the dedicated deal_breakers and
  // objection_coverage gates that cover the same issues.
  const blocking = unachieved.length > 0
    ? [`${achieved}/${total} competencies achieved — ${unachieved.length} still need training`]
    : [];

  return {
    gateId: 'competency_coverage',
    name: 'All Mandatory Competencies Achieved',
    status: allAchieved ? 'PASSED' : 'BLOCKED',
    progress: total === 0 ? 0 : Math.min(100, (achieved / total) * 100),
    blockingReasons: blocking,
  };
}

export function validateObjectionCoverageGate(profile: any): GateValidationResult {
  const rawPlaybooks = profile?.objectionHandling?.playbooks;
  const playbooks: any[] = Array.isArray(rawPlaybooks) ? rawPlaybooks : [];
  const requiredObjections = ['price', 'trust'];

  const covered = requiredObjections.filter((type) =>
    playbooks.some((p) => p?.objectionType === type && (p?.confidenceScore ?? 0) >= 70)
  );

  const blocking = requiredObjections
    .filter((type) => !covered.includes(type))
    .map((type) => `Missing high-confidence ${type} objection handling`);

  return {
    gateId: 'objection_coverage',
    name: 'Price & Trust Objections Handled',
    status: covered.length === requiredObjections.length ? 'PASSED' : 'BLOCKED',
    progress: (covered.length / requiredObjections.length) * 100,
    blockingReasons: blocking,
  };
}

export function validateDealBreakersGate(profile: any): GateValidationResult {
  const raw = profile?.qualificationCriteria?.dealBreakers;
  const dealBreakers: any[] = Array.isArray(raw) ? raw : [];

  if (dealBreakers.length === 0) {
    return {
      gateId: 'deal_breakers',
      name: 'At Least 1 Deal Breaker Validated',
      status: 'BLOCKED',
      progress: 0,
      blockingReasons: ['No deal breakers extracted yet'],
    };
  }

  // 50% threshold: achievable when a deal breaker is extracted from any single
  // scenario with evidenceCount >= 1. Deal breakers are naturally scenario-specific
  // (pricing limits → PRICE_OBJECTION, scope → WRONG_FIT) so requiring cross-scenario
  // evidence was architecturally unreachable. One clear extraction is sufficient.
  const DEAL_BREAKER_THRESHOLD = 50;
  const validated = dealBreakers.filter((db) => (db?.confidence ?? 0) >= DEAL_BREAKER_THRESHOLD);
  const hasMinimum = validated.length >= 1;
  const bestConfidence = Math.max(0, ...dealBreakers.map((db) => db?.confidence ?? 0));

  return {
    gateId: 'deal_breakers',
    name: 'At Least 1 Deal Breaker Validated',
    status: hasMinimum ? 'PASSED' : 'BLOCKED',
    progress: hasMinimum ? 100 : Math.min(90, Math.round((bestConfidence / DEAL_BREAKER_THRESHOLD) * 100)),
    blockingReasons: hasMinimum ? [] : [
      bestConfidence > 0
        ? `Deal breaker found but confidence too low (${bestConfidence}% — need ${DEAL_BREAKER_THRESHOLD}%). Complete a Wrong Fit or Price Objection scenario to strengthen it.`
        : 'No deal breakers extracted yet. Complete a Wrong Fit scenario to demonstrate your minimum requirements.',
    ],
  };
}

export function validateLinguisticFingerprintGate(profile: any): GateValidationResult {
  const cs = profile?.communicationStyle;
  const voice = profile?.ownerVoiceExamples;

  if (!cs) {
    return {
      gateId: 'linguistic_fingerprint',
      name: 'Linguistic Fingerprint Captured',
      status: 'BLOCKED',
      progress: 0,
      blockingReasons: ['No communication data extracted yet'],
    };
  }

  const hasStyle = !!(cs.tone && cs.sentenceLength);
  const phraseCount = cs.commonPhrases?.length || 0;
  const hasPhrases = phraseCount >= 5;

  // Voice examples: check explicit voice arrays OR fall back to CS arrays.
  // A rich phrase set (15+) also satisfies this — it proves deep linguistic capture.
  const greetingCount = (voice?.greetings?.length || 0) + (cs.commonOpenings?.length || 0);
  const closingCount = (voice?.closingStatements?.length || 0) + (cs.commonClosings?.length || 0);
  const hasVoice = (greetingCount >= 3 && closingCount >= 3) || phraseCount >= 15;

  const checks = [hasStyle, hasPhrases, hasVoice];
  const passed = checks.filter(Boolean).length;

  const blocking: string[] = [];
  if (!hasStyle) blocking.push('Need tone and sentence patterns');
  if (!hasPhrases) blocking.push('Need at least 5 common phrases');
  if (!hasVoice) blocking.push('Need greetings and closing examples (or 15+ common phrases)');

  return {
    gateId: 'linguistic_fingerprint',
    name: 'Linguistic Fingerprint Captured',
    status: blocking.length === 0 ? 'PASSED' : 'BLOCKED',
    progress: (passed / checks.length) * 100,
    blockingReasons: blocking,
  };
}

export function validateAllGates(profile: any): GateValidationResult[] {
  return [
    validateMandatoryScenariosGate(profile?.completedScenarios || []),
    validateCompetencyCoverageGate(profile),
    validateObjectionCoverageGate(profile),
    validateDealBreakersGate(profile),
    validateLinguisticFingerprintGate(profile),
  ];
}

export function canGoLive(profile: any): boolean {
  return validateAllGates(profile).every((gate) => gate.status === 'PASSED');
}

export function getAllBlockingReasons(profile: any): string[] {
  return validateAllGates(profile).flatMap((gate) => gate.blockingReasons);
}
