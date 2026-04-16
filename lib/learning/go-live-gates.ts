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
    MANDATORY_SCENARIOS.some((s) => s.id === id)
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
  const blocking = statuses
    .filter((s) => s.status !== 'ACHIEVED' && s.status !== 'MASTERED')
    .flatMap((s) => s.blockingReasons);

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

  const validated = dealBreakers.filter((db) => (db?.confidence ?? 0) >= 75);
  const hasMinimum = validated.length >= 1;

  return {
    gateId: 'deal_breakers',
    name: 'At Least 1 Deal Breaker Validated',
    status: hasMinimum ? 'PASSED' : 'BLOCKED',
    progress: hasMinimum ? 100 : Math.min(80, validated.length * 40),
    blockingReasons: hasMinimum ? [] : ['Need at least 1 deal breaker with 75%+ confidence'],
  };
}

export function validateLinguisticFingerprintGate(profile: any): GateValidationResult {
  const cs = profile?.communicationStyle;
  const voice = profile?.ownerVoiceExamples;

  if (!cs || !voice) {
    return {
      gateId: 'linguistic_fingerprint',
      name: 'Linguistic Fingerprint Captured',
      status: 'BLOCKED',
      progress: 0,
      blockingReasons: ['No communication data extracted yet'],
    };
  }

  const hasStyle = !!(cs.tone && cs.sentenceLength);
  const hasPhrases = (cs.commonPhrases?.length || 0) >= 5;
  const hasVoice =
    (voice.greetings?.length || 0) >= 3 && (voice.closingStatements?.length || 0) >= 3;

  const checks = [hasStyle, hasPhrases, hasVoice];
  const passed = checks.filter(Boolean).length;

  const blocking: string[] = [];
  if (!hasStyle) blocking.push('Need tone and sentence patterns');
  if (!hasPhrases) blocking.push('Need at least 5 common phrases');
  if (!hasVoice) blocking.push('Need greetings and closing examples');

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
