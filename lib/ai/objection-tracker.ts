import { createChatCompletion } from '@/lib/ai/client';

/**
 * PHASE 2: Objection Tracking System
 * Identifies objections raised during conversation and tracks how they're handled
 */

export interface ObjectionData {
  raised: boolean;
  handled?: boolean;
  howHandled?: string;
}

export interface ObjectionsAnalysis {
  objectionsRaised: string[];
  objectionsHandled: Record<string, ObjectionData>;
}

export async function trackObjections(
  messages: Array<{ role: string; content: string }>
): Promise<ObjectionsAnalysis> {
  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

  const objectionPrompt = `Identify objections raised in this conversation.

Transcript:
${transcript}

Identify if lead raised concerns about:
- Budget (price too high, can't afford, cheaper options)
- Timeline (too long, too short, specific deadline)
- Quality (skeptical about quality, wants proof)
- Competitor (comparing to other options, got other quotes)
- Process (unclear on how it works)
- Trust (skeptical, wants references)

For each objection:
- Was it raised?
- Was it handled/addressed?
- How was it handled?

Return JSON:
{
  "objectionsRaised": ["budget", "timeline"],
  "objectionsHandled": {
    "budget": {
      "raised": true,
      "handled": true,
      "howHandled": "Explained value breakdown and showed ROI"
    },
    "timeline": {
      "raised": true,
      "handled": false,
      "howHandled": null
    },
    "quality": {
      "raised": false,
      "handled": false,
      "howHandled": null
    }
  }
}`;

  try {
    const response = await createChatCompletion(
      [{ role: 'user', content: objectionPrompt }],
      'You are analyzing objections in sales conversations. Return precise JSON.',
      { temperature: 0.1, maxTokens: 400 }
    );

    const parsed = JSON.parse((response.content || response) as string);
    return {
      objectionsRaised: parsed.objectionsRaised || [],
      objectionsHandled: parsed.objectionsHandled || {},
    };
  } catch (e) {
    console.error('Error tracking objections:', e);
    return {
      objectionsRaised: [],
      objectionsHandled: {},
    };
  }
}

/**
 * Analyze objections in a conversation and return a summary for the owner
 */
export async function getObjectionsSummary(
  objectionsHandled: Record<string, ObjectionData>
): Promise<{
  handled: string[];
  unresolved: string[];
  summary: string;
}> {
  const handled = Object.entries(objectionsHandled)
    .filter(([_, data]) => data.handled)
    .map(([key]) => key);

  const unresolved = Object.entries(objectionsHandled)
    .filter(([_, data]) => data.raised && !data.handled)
    .map(([key]) => key);

  let summary = '';
  if (unresolved.length === 0) {
    summary = '✅ All objections were handled smoothly!';
  } else {
    summary = `⚠️ ${unresolved.length} unresolved objection${unresolved.length > 1 ? 's' : ''}: ${unresolved.join(', ')}`;
  }

  return { handled, unresolved, summary };
}
