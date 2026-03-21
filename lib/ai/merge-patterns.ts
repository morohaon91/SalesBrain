/**
 * Pattern Merging Logic
 * Merges new extracted patterns with existing patterns from previous simulations
 */

import type { ExtractedPatterns } from '@/lib/types/business-profile';

/**
 * Merge new extracted patterns with existing patterns from previous simulations
 */
export function mergePatterns(
  existing: ExtractedPatterns | null,
  newPatterns: ExtractedPatterns
): ExtractedPatterns {
  // If no existing patterns, return new patterns
  if (!existing) {
    return newPatterns;
  }

  return {
    communicationStyle: mergeCommunicationStyle(
      existing.communicationStyle,
      newPatterns.communicationStyle
    ),
    pricingLogic: mergePricingLogic(
      existing.pricingLogic,
      newPatterns.pricingLogic
    ),
    qualificationCriteria: mergeQualificationCriteria(
      existing.qualificationCriteria,
      newPatterns.qualificationCriteria
    ),
    objectionHandling: mergeObjectionHandling(
      existing.objectionHandling,
      newPatterns.objectionHandling
    ),
    decisionMakingPatterns: mergeDecisionMakingPatterns(
      existing.decisionMakingPatterns,
      newPatterns.decisionMakingPatterns
    ),
    knowledgeBase: existing.knowledgeBase || newPatterns.knowledgeBase
  };
}

function mergeCommunicationStyle(existing: any, newData: any) {
  return {
    // Use most recent tone/style (they shouldn't change much)
    tone: newData.tone,
    style: newData.style,
    formality: newData.formality,

    // Merge and deduplicate key phrases
    keyPhrases: uniqueArray([
      ...(existing.keyPhrases || []),
      ...(newData.keyPhrases || [])
    ])
  };
}

function mergePricingLogic(existing: any, newData: any) {
  return {
    // Use lowest minBudget seen
    minBudget:
      existing.minBudget && newData.minBudget
        ? Math.min(existing.minBudget, newData.minBudget)
        : existing.minBudget || newData.minBudget,

    // Use highest maxBudget seen
    maxBudget:
      existing.maxBudget && newData.maxBudget
        ? Math.max(existing.maxBudget, newData.maxBudget)
        : existing.maxBudget || newData.maxBudget,

    // Update typical range
    typicalRange: newData.typicalRange || existing.typicalRange,

    // Merge and deduplicate factors and deal-breakers
    flexibilityFactors: uniqueArray([
      ...(existing.flexibilityFactors || []),
      ...(newData.flexibilityFactors || [])
    ]),
    dealBreakers: uniqueArray([
      ...(existing.dealBreakers || []),
      ...(newData.dealBreakers || [])
    ])
  };
}

function mergeQualificationCriteria(existing: any, newData: any) {
  return {
    mustHaves: uniqueArray([
      ...(existing.mustHaves || []),
      ...(newData.mustHaves || [])
    ]),
    dealBreakers: uniqueArray([
      ...(existing.dealBreakers || []),
      ...(newData.dealBreakers || [])
    ]),
    greenFlags: uniqueArray([
      ...(existing.greenFlags || []),
      ...(newData.greenFlags || [])
    ]),
    redFlags: uniqueArray([
      ...(existing.redFlags || []),
      ...(newData.redFlags || [])
    ])
  };
}

function mergeObjectionHandling(existing: any, newData: any) {
  // For objection handling, keep all unique objection types
  // If same objection appears twice, keep most recent
  return {
    ...existing,
    ...newData
  };
}

function mergeDecisionMakingPatterns(existing: any, newData: any) {
  return {
    whenToSayYes: uniqueArray([
      ...(existing.whenToSayYes || []),
      ...(newData.whenToSayYes || [])
    ]),
    whenToSayNo: uniqueArray([
      ...(existing.whenToSayNo || []),
      ...(newData.whenToSayNo || [])
    ]),
    warningSignsToWatch: uniqueArray([
      ...(existing.warningSignsToWatch || []),
      ...(newData.warningSignsToWatch || [])
    ])
  };
}

/**
 * Deduplicate array (case-insensitive for strings)
 */
function uniqueArray(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
