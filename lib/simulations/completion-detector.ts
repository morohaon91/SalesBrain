/**
 * Completion Detector
 * Determines when the AI should wrap up the simulation
 */

interface MessageLike {
  role: string;
  content: string;
}

export const SOFT_CAP = 10;  // Exchanges before AI should start wrapping up
export const HARD_CAP = 15;  // Maximum exchanges — force completion

/**
 * Detect if simulation should trigger completion wrap-up
 */
export function detectCompletionTrigger(
  ownerMessageCount: number,
  conversationHistory: MessageLike[]
): boolean {
  if (ownerMessageCount >= HARD_CAP) return true;

  if (ownerMessageCount >= SOFT_CAP) {
    // Check if conversation reached natural conclusion signals
    const lastMessages = conversationHistory.slice(-4);
    const lastText = lastMessages.map((m) => m.content).join(' ').toLowerCase();

    const conclusionSignals = [
      "thank you", "thanks", "i'll think about it", 'i will think about it',
      "follow up", "get back to you", 'schedule', "sounds good", "perfect",
      "appreciate", "moving forward", "not interested", "not the right",
    ];

    const hasConclusionSignal = conclusionSignals.some((s) => lastText.includes(s));
    if (hasConclusionSignal) return true;
  }

  return false;
}

/**
 * Get wrap-up instruction for AI prompt based on current state
 */
export function getWrapUpInstruction(ownerMessageCount: number): string | null {
  if (ownerMessageCount >= HARD_CAP) {
    return 'The conversation has reached its maximum length. Wrap up naturally in this message — thank the owner, indicate your next steps (e.g., "I\'ll think about it and get back to you" or "Let\'s schedule a call"), and end the conversation.';
  }
  if (ownerMessageCount >= SOFT_CAP) {
    return 'The conversation is at a natural stopping point. Start guiding toward a conclusion in the next 1-2 exchanges.';
  }
  return null;
}
