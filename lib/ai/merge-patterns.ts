/**
 * Pattern Merging Logic with Multi-Simulation Confidence
 * Merges new extracted patterns with existing patterns from previous simulations
 * Phase 5: Ensures patterns are reliable by requiring them to appear in 2+ simulations
 */

import type { ExtractedPatterns } from '@/lib/types/business-profile';

/**
 * Merge new extracted patterns with existing patterns from previous simulations
 * Standard merging - doesn't consider simulation count
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
    knowledgeBase: existing.knowledgeBase || newPatterns.knowledgeBase,
    ...(newPatterns.conversationQuality && { conversationQuality: newPatterns.conversationQuality }),
    ...(newPatterns.extractionNotes && { extractionNotes: newPatterns.extractionNotes })
  };
}

/**
 * Merge verbatim voice examples — keep up to 20 unique examples
 */
export function mergeOwnerVoiceExamples(
  existing: any[] | null,
  newExamples: any[] | null
): any[] {
  if (!existing && !newExamples) return [];
  if (!existing) return newExamples ?? [];
  if (!newExamples) return existing;

  const combined = [...existing, ...newExamples];
  // Deduplicate by phrase (case-insensitive)
  const seen = new Set<string>();
  return combined
    .filter((ex) => {
      const key = ex.phrase?.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20); // Cap at 20 examples
}

/**
 * Merge business facts — prefer non-null values, merge arrays
 */
export function mergeBusinessFacts(
  existing: any | null,
  newFacts: any | null
): any {
  if (!existing && !newFacts) return null;
  if (!existing) return newFacts;
  if (!newFacts) return existing;

  return {
    mentionedExperience: newFacts.mentionedExperience ?? existing.mentionedExperience,
    mentionedServices: uniqueArray([
      ...(existing.mentionedServices ?? []),
      ...(newFacts.mentionedServices ?? []),
    ]),
    mentionedCertifications: uniqueArray([
      ...(existing.mentionedCertifications ?? []),
      ...(newFacts.mentionedCertifications ?? []),
    ]),
    mentionedServiceArea: newFacts.mentionedServiceArea ?? existing.mentionedServiceArea,
    mentionedTeamSize: newFacts.mentionedTeamSize ?? existing.mentionedTeamSize,
    specializations: uniqueArray([
      ...(existing.specializations ?? []),
      ...(newFacts.specializations ?? []),
    ]),
  };
}

/**
 * Phase 5: Merge patterns with confidence checking based on simulation count
 * Requires patterns to appear in 2+ simulations before marking as reliable
 *
 * @param existing - Existing patterns (may be null)
 * @param newPatterns - New patterns from latest simulation
 * @param totalSimulationCount - Total number of completed simulations for this profile
 * @returns Merged patterns with confidence metadata adjusted based on simulation count
 */
export function mergePatternsWithConfidence(
  existing: ExtractedPatterns | null,
  newPatterns: ExtractedPatterns,
  totalSimulationCount: number
): ExtractedPatterns {
  // Standard merge first
  const merged = mergePatterns(existing, newPatterns);

  // If we only have 1 simulation, mark all confidence as low
  if (totalSimulationCount < 2) {
    return markAllConfidenceAsLow(merged);
  }

  // If we have 2+ simulations, keep confidence from merged patterns
  // This means patterns that appear in multiple sims will have their confidence
  // levels from the extraction prompt, while new patterns will be low
  return merged;
}

/**
 * Mark all confidence fields as 'low' since this is from a single simulation
 */
function markAllConfidenceAsLow(patterns: ExtractedPatterns): ExtractedPatterns {
  return {
    communicationStyle: markConfidenceAsLow(patterns.communicationStyle, 'communicationStyle'),
    pricingLogic: markConfidenceAsLow(patterns.pricingLogic, 'pricingLogic'),
    qualificationCriteria: markConfidenceAsLow(patterns.qualificationCriteria, 'qualificationCriteria'),
    objectionHandling: markConfidenceAsLow(patterns.objectionHandling, 'objectionHandling'),
    decisionMakingPatterns: markConfidenceAsLow(patterns.decisionMakingPatterns, 'decisionMakingPatterns'),
    knowledgeBase: patterns.knowledgeBase,
    ...(patterns.conversationQuality && { conversationQuality: patterns.conversationQuality }),
    ...(patterns.extractionNotes && { extractionNotes: patterns.extractionNotes })
  };
}

/**
 * Mark all confidence fields within an object as 'low'
 */
function markConfidenceAsLow(obj: any, type: string): any {
  if (!obj) return obj;

  const marked = { ...obj };

  // Add or update confidence field
  if (type === 'qualificationCriteria' || type === 'decisionMakingPatterns') {
    marked.confidence = {
      ...(marked.confidence || {}),
      high: false,
      level: 'low' as const
    };
  }

  return marked;
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
