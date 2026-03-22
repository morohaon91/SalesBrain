/**
 * Pattern Extraction Logic
 * Analyzes simulation conversations and extracts business patterns
 * Phase 1: Fixed AI extraction logic with perspective rules
 * Phase 2: Grammar normalization layer
 */

import {
  generatePatternExtractionPrompt,
  PATTERN_EXTRACTION_SYSTEM_PROMPT,
  formatConversationTranscript
} from './prompts/pattern-extraction';
import { ExtractedPatternsSchema } from '@/lib/validation/pattern-schemas';
import type { ExtractedPatterns } from '@/lib/types/business-profile';
import { createChatCompletion } from './client';
import { normalizePatterns, needsNormalization } from './normalize-patterns';
import { checkSimulationQuality, type SimulationQualityReport } from '@/lib/simulations/quality-checker';

/**
 * Extract patterns from simulation with quality check (Phase 3)
 * Returns both patterns and quality report
 */
export async function extractPatternsWithQualityCheck(
  messages: any[],
  industry: string,
  scenarioType: string
): Promise<{ patterns: ExtractedPatterns | null; qualityReport: SimulationQualityReport }> {
  // Phase 3: Check simulation quality first
  const qualityReport = checkSimulationQuality(messages, scenarioType);

  console.log(`\n📊 Quality Score: ${qualityReport.completenessScore}/100`);
  console.log(`📋 Recommendation: ${qualityReport.recommendation}`);

  if (!qualityReport.isComplete) {
    console.warn(`⚠️  Simulation incomplete. Recommendation: ${qualityReport.recommendation}`);
    return {
      patterns: null,
      qualityReport
    };
  }

  // Quality passed - proceed with extraction
  const patterns = await extractPatternsFromSimulation(messages, industry, scenarioType);

  return {
    patterns,
    qualityReport
  };
}

/**
 * Extract patterns from simulation (core extraction logic)
 * Applies Phase 1 (fixed perspective) and Phase 2 (grammar normalization)
 */
export async function extractPatternsFromSimulation(
  messages: any[],
  industry: string,
  scenarioType: string
): Promise<ExtractedPatterns> {
  // Step 1: Format conversation transcript
  const transcript = formatConversationTranscript(messages);

  // Step 2: Generate user prompt with fixed perspective rules (Phase 1)
  const userPrompt = generatePatternExtractionPrompt(transcript, industry, scenarioType);

  // Step 3: Call Claude with extraction prompt (Phase 1: fixed perspective)
  const response = await createChatCompletion(
    [
      {
        role: 'user',
        content: userPrompt
      }
    ],
    PATTERN_EXTRACTION_SYSTEM_PROMPT,
    {
      maxTokens: 4000,  // Increased for new schema with confidence + quality + notes
      temperature: 0.3  // Lower temperature for more consistent extraction
    }
  );

  // Step 4: Extract text from response
  const rawText = response.content;

  // Step 5: Clean up response (remove markdown if present)
  const cleanedText = rawText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  // Step 6: Parse JSON
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', cleanedText);
    throw new Error('AI returned invalid JSON');
  }

  // Step 7: Phase 2 - Grammar normalization (fix spelling/grammar errors)
  let finalPatterns = parsedJson;

  if (needsNormalization(parsedJson)) {
    console.log('🔧 Normalizing grammar and spelling...');
    finalPatterns = await normalizePatterns(parsedJson);
  } else {
    console.log('✅ Patterns already clean, skipping normalization');
  }

  // Step 8: Validate against schema
  const validated = ExtractedPatternsSchema.parse(finalPatterns);

  return validated as ExtractedPatterns;
}
