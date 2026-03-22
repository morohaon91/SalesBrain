/**
 * Grammar Normalization Layer
 * Fixes spelling and grammar errors in extracted patterns
 * while preserving meaning, tone, and intent
 */

import { createChatCompletion } from './client';

/**
 * Normalize grammar and spelling in extracted patterns
 * Preserves meaning, tone, and style
 */
export async function normalizePatterns(rawPatterns: any): Promise<any> {
  const prompt = `
You are a professional copy editor specializing in preserving authentic voice while fixing technical errors.

TASK: Fix spelling and grammar ONLY. Do NOT change meaning, tone, or style.

INPUT (extracted patterns with potential spelling/grammar errors):
${JSON.stringify(rawPatterns, null, 2)}

RULES:

1. FIX TECHNICAL ERRORS:
   ✅ Fix spelling: "profssionals" → "professionals"
   ✅ Fix grammar: "does it related" → "is it related"
   ✅ Fix typos: "exprince" → "experience"

2. PRESERVE EVERYTHING ELSE:
   ✅ Keep casual tone if casual
   ✅ Keep contractions ("I'm", "we're", "can't")
   ✅ Keep personality and voice
   ✅ Keep sentence structure
   ✅ Keep emphasis and energy

3. SPECIAL CASES:

   Intent-based phrases (already cleaned):
   - Input: "emphasizes professionalism and credentials"
   - Output: "emphasizes professionalism and credentials" (no change)

   Verbatim quotes with errors:
   - Input: "we are profssionals with 15 years exprince"
   - Output: "we are professionals with 15 years experience"

   Casual phrases:
   - Input: "I'm here to change that! We're pros"
   - Output: "I'm here to change that! We're pros" (keep casual)

4. VALIDATION:
   - After fixing, does it still sound like the same person?
   - If yes → good correction
   - If no → you changed too much, revert

EXAMPLES:

Input: "we are profssionals and we have exprince with luxury builds"
Output: "we are professionals and we have experience with luxury builds"

Input: "does it related to constructions quality?"
Output: "is it related to construction quality?"

Input: "I'm here to change it! We are profssionals."
Output: "I'm here to change it! We are professionals."

Input: "emphasizes professionalism and extensive experience"
Output: "emphasizes professionalism and extensive experience" (no change - already intent-based)

OUTPUT:
Return ONLY the corrected JSON.
No markdown formatting, no explanations.
`;

  const response = await createChatCompletion(
    [
      {
        role: 'user',
        content: prompt
      }
    ],
    'You are a professional copy editor. Fix only spelling and grammar, preserving tone and meaning.',
    {
      maxTokens: 4000,
      temperature: 0.1 // Very low for consistent corrections
    }
  );

  const correctedText = response.content;

  const cleaned = correctedText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse normalized patterns:', cleaned);
    // Return original if normalization fails
    return rawPatterns;
  }
}

/**
 * Check if patterns need normalization
 * Detects common spelling mistakes
 */
export function needsNormalization(patterns: any): boolean {
  const jsonString = JSON.stringify(patterns);

  // Common spelling mistakes to detect
  const errorPatterns = [
    /profssionals?/i,
    /exprince/i,
    /constructions/i,
    /schehule/i,
    /secvond/i,
    /simukation/i,
    /recieve/i,
    /occured/i,
    /teh /i,
    /becuase/i,
    /seperate/i,
    /realy/i
  ];

  return errorPatterns.some(pattern => pattern.test(jsonString));
}

/**
 * Get normalization score (0-100)
 * Returns how many errors were likely present
 */
export function getNormalizationScore(patterns: any): number {
  const jsonString = JSON.stringify(patterns);

  const errorPatterns = [
    /profssionals?/i,
    /exprince/i,
    /constructions/i,
    /schehule/i,
    /secvond/i,
    /simukation/i,
    /recieve/i,
    /occured/i,
    /teh /i,
    /becuase/i,
    /seperate/i,
    /realy/i
  ];

  const errorCount = errorPatterns.filter(pattern =>
    pattern.test(jsonString)
  ).length;

  // Score inversely: more errors = lower score
  return Math.max(0, 100 - errorCount * 10);
}
