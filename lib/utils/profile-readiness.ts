/**
 * Profile Readiness Check
 * 70% completion gate for go-live
 */

import { calculateProfileCompletion, CompletionBreakdown } from './profile-completion';

export interface ReadinessCheckResult {
  isReady: boolean;
  completionPercentage: number;
  breakdown: CompletionBreakdown;
  checklist: ReadinessItem[];
  missingItems: string[];
}

export interface ReadinessItem {
  label: string;
  completed: boolean;
  points: number;
  maxPoints: number;
}

export const READINESS_THRESHOLD = 70;

export function checkProfileReadiness(profile: Record<string, any>): ReadinessCheckResult {
  const breakdown = calculateProfileCompletion(profile);

  const checklist: ReadinessItem[] = [
    { label: 'Questionnaire completed', completed: breakdown.questionnaire >= 15, points: breakdown.questionnaire, maxPoints: 20 },
    { label: 'Communication style extracted', completed: breakdown.communicationStyle >= 10, points: breakdown.communicationStyle, maxPoints: 15 },
    { label: 'Pricing logic defined', completed: breakdown.pricingLogic >= 10, points: breakdown.pricingLogic, maxPoints: 15 },
    { label: 'Qualification criteria set', completed: breakdown.qualificationCriteria >= 10, points: breakdown.qualificationCriteria, maxPoints: 15 },
    { label: 'Objection handling demonstrated', completed: breakdown.objectionHandling >= 8, points: breakdown.objectionHandling, maxPoints: 15 },
    { label: 'Decision making patterns captured', completed: breakdown.decisionMaking >= 5, points: breakdown.decisionMaking, maxPoints: 10 },
    { label: 'Business facts provided', completed: breakdown.businessFacts >= 5, points: breakdown.businessFacts, maxPoints: 10 },
  ];

  const missingItems = checklist.filter((i) => !i.completed).map((i) => i.label);

  return {
    isReady: breakdown.total >= READINESS_THRESHOLD,
    completionPercentage: breakdown.total,
    breakdown,
    checklist,
    missingItems,
  };
}
