import { BusinessProfile } from '@prisma/client';
import { createChatCompletion } from '@/lib/ai/client';

/**
 * PHASE 1: Early Exit Detector
 * Detects COLD signals (impossible fit) during conversation
 * to end conversation early and save time for both parties
 */

export async function checkForEarlyExit(
  messages: Array<{ role: string; content: string }>,
  profile: BusinessProfile
): Promise<{
  exit: boolean;
  reason?: string;
  politeMessage?: string;
}> {
  // Only check after lead has sent at least 2 messages
  const leadMessages = messages.filter((m) => m.role === 'user' || m.role === 'LEAD');
  if (leadMessages.length < 2) {
    return { exit: false };
  }

  const lastFewMessages = messages.slice(-6); // Last 3 exchanges
  const transcript = lastFewMessages.map((m) => `${m.role}: ${m.content}`).join('\n');

  const detectionPrompt = `Analyze this conversation for COLD signals (impossible fit).

Conversation:
${transcript}

Owner's Typical Ranges:
${JSON.stringify((profile.ownerNorms as any), null, 2)}

Owner's Deal-Breakers:
${JSON.stringify((profile.qualificationCriteria as any)?.dealBreakers, null, 2)}

COLD SIGNALS (should exit early):
1. Budget mentioned is 50%+ below owner's minimum
2. Timeline is impossible (less than 50% of owner's minimum)
3. Lead explicitly says they're just browsing/researching with no timeline
4. Deal-breaker present (budget way off, wrong service type, outside service area)

Return JSON:
{
  "shouldExit": boolean,
  "reason": "why exit" or null,
  "confidence": "high" | "medium" | "low"
}`;

  try {
    const response = await createChatCompletion(
      [{ role: 'user', content: detectionPrompt }],
      'You are analyzing lead fit. Be conservative - only exit if clearly impossible.',
      { temperature: 0.2, maxTokens: 300 }
    );

    const analysis = JSON.parse((response.content || response) as string);

    if (analysis.shouldExit && analysis.confidence === 'high') {
      // Generate polite exit message
      const exitMessage = await generatePoliteExit(analysis.reason, profile);

      return {
        exit: true,
        reason: analysis.reason,
        politeMessage: exitMessage,
      };
    }

    return { exit: false };
  } catch (e) {
    console.error('Error in early exit detection:', e);
    return { exit: false };
  }
}

async function generatePoliteExit(reason: string, profile: BusinessProfile): Promise<string> {
  const prompt = `Generate a polite, professional message to end this conversation.

Reason: ${reason}

Business: ${profile.serviceDescription}
Typical range: ${JSON.stringify((profile.ownerNorms as any)?.typicalBudgets)}

The message should:
- Be warm and professional
- Explain reality honestly
- Suggest alternatives if appropriate (partial service, different contractor)
- Thank them for reaching out
- Not make them feel rejected

Return just the message text, no JSON.`;

  try {
    const response = await createChatCompletion(
      [{ role: 'user', content: prompt }],
      'You are a professional sales assistant. Be empathetic but honest.',
      { temperature: 0.7, maxTokens: 200 }
    );

    return ((response.content || response) as string) || 'Thank you for reaching out. Unfortunately, we may not be the best fit for this project.';
  } catch (e) {
    console.error('Error generating polite exit message:', e);
    return 'Thank you for reaching out. Unfortunately, we may not be the best fit for this project.';
  }
}
