/**
 * Pattern Extraction Logic
 * Analyzes simulation conversations and extracts business patterns
 */

import {
  generatePatternExtractionPrompt,
  PATTERN_EXTRACTION_SYSTEM_PROMPT,
  formatConversationTranscript
} from './prompts/pattern-extraction';
import { ExtractedPatternsSchema } from '@/lib/validation/pattern-schemas';
import type { ExtractedPatterns } from '@/lib/types/business-profile';
import { createChatCompletion } from './client';

export async function extractPatternsFromSimulation(
  messages: any[],
  industry: string,
  scenarioType: string
): Promise<ExtractedPatterns> {
  // Format conversation transcript
  const transcript = formatConversationTranscript(messages);

  // Generate user prompt
  const userPrompt = generatePatternExtractionPrompt(transcript, industry, scenarioType);

  // Call Claude with extraction prompt
  const response = await createChatCompletion(
    [
      {
        role: 'user',
        content: userPrompt
      }
    ],
    PATTERN_EXTRACTION_SYSTEM_PROMPT,
    {
      maxTokens: 2000,
      temperature: 0.3  // Lower temperature for more consistent extraction
    }
  );

  // Extract text from response
  const rawText = response.content;

  // Clean up response (remove markdown if present)
  const cleanedText = rawText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  // Parse JSON
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', cleanedText);
    throw new Error('AI returned invalid JSON');
  }

  // Validate against schema
  const validated = ExtractedPatternsSchema.parse(parsedJson);

  return validated as ExtractedPatterns;
}
