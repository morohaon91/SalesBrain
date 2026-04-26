import { BusinessProfile } from '@prisma/client';
import { createChatCompletion, parseAiJson } from '@/lib/ai/client';

/**
 * CLOSER framework — single round-trip per lead message (state + reply + phase).
 */

export interface CloserPhase {
  phase: 'clarify' | 'overview' | 'label' | 'sell' | 'explain' | 'reinforce';
  completed: boolean;
  timestamp?: string;
}

export interface CloserProgress {
  clarify: CloserPhase;
  overview: CloserPhase;
  label: CloserPhase;
  sell: CloserPhase;
  explain: CloserPhase;
  reinforce: CloserPhase;
  currentPhase: string;
}

const PHASE_ORDER = ['clarify', 'overview', 'label', 'sell', 'explain', 'reinforce'] as const;
type CloserPhaseName = (typeof PHASE_ORDER)[number];

export interface GenerateCloserContext {
  conversationId?: string;
}

export async function generateCloserResponse(
  messages: Array<{ role: string; content: string }>,
  profile: BusinessProfile,
  currentProgress: CloserProgress | null,
  tenantId: string,
  context?: GenerateCloserContext
): Promise<{
  response: string;
  updatedProgress: CloserProgress;
  phaseCompleted?: string | null;
  tokensUsed: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}> {
  const startWall = Date.now();
  let progress = currentProgress ?? initialProgress();

  const apiMessages = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'LEAD')
    .map((m) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }));

  try {
    const cacheableCore = buildCacheableCloserCore(profile);
    const systemSuffix = buildCloserDynamicSuffix(progress);

    const ai = await createChatCompletion(apiMessages, cacheableCore, {
      systemSuffix,
      cacheSystemPrompt: true,
      temperature: 0.7,
      maxTokens: 900,
      tenantId,
      operationType: 'lead_chat',
      metadata: {
        conversationId: context?.conversationId,
      },
    });

    let parsed: {
      currentPhase?: string;
      phaseComplete?: boolean;
      response?: string;
    };
    try {
      parsed = parseAiJson<typeof parsed>(ai.content);
    } catch (e) {
      console.error('Closer JSON parse failed:', e);
      return {
        response:
          'Thanks for your message. Could you share a bit more about what you need so I can help?',
        updatedProgress: progress,
        tokensUsed: ai.tokensUsed,
        latencyMs: ai.latencyMs,
        inputTokens: ai.inputTokens,
        outputTokens: ai.outputTokens,
      };
    }

    const phaseRaw = (parsed.currentPhase || progress.currentPhase || 'clarify').toLowerCase();
    const currentPhase = PHASE_ORDER.includes(phaseRaw as CloserPhaseName)
      ? (phaseRaw as CloserPhaseName)
      : (progress.currentPhase as CloserPhaseName) || 'clarify';

    const reply =
      typeof parsed.response === 'string' && parsed.response.trim().length > 0
        ? parsed.response.trim()
        : 'Thanks for reaching out. What should we tackle first?';

    const updatedProgress = { ...progress };
    let phaseCompleted: string | null = null;

    if (parsed.phaseComplete === true) {
      updatedProgress[currentPhase] = {
        phase: currentPhase,
        completed: true,
        timestamp: new Date().toISOString(),
      } as CloserPhase;
      phaseCompleted = currentPhase;
      updatedProgress.currentPhase = getNextPhase(currentPhase);
    } else {
      updatedProgress.currentPhase = currentPhase;
    }

    return {
      response: reply,
      updatedProgress,
      phaseCompleted,
      tokensUsed: ai.tokensUsed,
      latencyMs: ai.latencyMs,
      inputTokens: ai.inputTokens,
      outputTokens: ai.outputTokens,
    };
  } catch (e) {
    console.error('Error in generateCloserResponse:', e);
    return {
      response:
        'Thank you for sharing that. Tell me more about your needs so I can better understand how to help.',
      updatedProgress: progress,
      tokensUsed: 0,
      latencyMs: Date.now() - startWall,
      inputTokens: 0,
      outputTokens: 0,
    };
  }
}

function initialProgress(): CloserProgress {
  return {
    clarify: { phase: 'clarify', completed: false },
    overview: { phase: 'overview', completed: false },
    label: { phase: 'label', completed: false },
    sell: { phase: 'sell', completed: false },
    explain: { phase: 'explain', completed: false },
    reinforce: { phase: 'reinforce', completed: false },
    currentPhase: 'clarify',
  };
}

function buildCloserDynamicSuffix(progress: CloserProgress): string {
  const snapshot = {
    clarify: progress.clarify.completed,
    overview: progress.overview.completed,
    label: progress.label.completed,
    sell: progress.sell.completed,
    explain: progress.explain.completed,
    reinforce: progress.reinforce.completed,
    suggestedFocus: progress.currentPhase,
  };

  return `CONVERSATION PROGRESS (authoritative):
${JSON.stringify(snapshot, null, 2)}

You must produce ONE JSON object only (no markdown), with this exact shape:
{
  "currentPhase": "clarify" | "overview" | "label" | "sell" | "explain" | "reinforce",
  "phaseComplete": boolean,
  "response": "plain text the lead reads — no JSON inside this string"
}

Rules:
- "response" is the only text the lead sees: warm, concise (usually 2–5 sentences), in the owner's voice.
- currentPhase is the CLOSER step you are executing in this turn (normally the earliest step not yet true in progress above).
- phaseComplete is true only if this reply substantially completes that step's goals (see phase guide in the cached system instructions).
- Never put markdown or JSON inside "response".`;
}

/** Static owner + CLOSER guidance — safe to prompt-cache per profile. */
function buildCacheableCloserCore(profile: BusinessProfile & { businessName?: string }): string {
  const closerFramework = (profile.closerFramework as Record<string, unknown>) || {};
  const ownerVoiceExamples = (profile.ownerVoiceExamples as Record<string, unknown>) || {};
  const communicationStyle = (profile.communicationStyle as Record<string, unknown>) || {};

  if (
    (!closerFramework || Object.keys(closerFramework).length === 0) &&
    Object.keys(ownerVoiceExamples).length === 0
  ) {
    return `${buildFallbackPrompt(profile, communicationStyle)}

${allPhaseReferenceGuide()}
`;
  }

  let prompt = `You are ${profile.businessName || 'our team'}, talking to a potential lead.

OWNER'S VOICE & COMMUNICATION STYLE:`;

  if (Object.keys(ownerVoiceExamples).length > 0) {
    prompt += `
${Object.entries(ownerVoiceExamples)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}`;
  }

  if (Object.keys(communicationStyle).length > 0) {
    prompt += `
${Object.entries(communicationStyle)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}`;
  }

  const fw = closerFramework as any;
  if (fw.keyPhrases?.length) {
    prompt += `
Key phrases:
${fw.keyPhrases.join('\n')}`;
  }

  prompt += `

You follow the CLOSER framework. Phase order: clarify → overview → label → sell → explain → reinforce.
Only advance when the prior phase is complete in progress (provided separately each request).

${buildAllPhaseGuidance(fw)}

${fw.commonQuestions?.length ? `COMMON Q&A (answer using these when relevant):\n${fw.commonQuestions.map((q: any) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n')}` : ''}

IMPORTANT:
- Sound exactly like the owner.
- One primary CLOSER focus per reply; do not rush phases.
- Listen more than you talk; ask before pitching.
- Do not make commitments the owner would not make.`;

  return prompt;
}

function allPhaseReferenceGuide(): string {
  return `CLOSER phases (in order):
1) CLARIFY — why they reached out now, timing, urgency.
2) OVERVIEW — struggles, what they tried, consequences.
3) LABEL — summarize needs, confirm understanding.
4) SELL — outcome vision, transformation (not feature dump).
5) EXPLAIN — objections, concerns, trust.
6) REINFORCE — next step, commitment, expectations.`;
}

function buildAllPhaseGuidance(framework: any): string {
  const clar = framework.clarifyingQuestions?.join('\n') || '- What brought you to consider this now?';
  const emp = framework.painEmpathyPhrases?.join('\n') || '- I understand that can be frustrating';
  const lab = framework.labelingPhrases?.join('\n') || "- So it sounds like you're looking for...";
  const out = framework.outcomeSelling?.join('\n') || "- What we're really building here is...";
  const rein = framework.reinforcement?.join('\n') || "- Let's schedule a time to discuss this in detail";

  return `
### CLARIFY
Use clarifying questions:
${clar}

### OVERVIEW
Empathy / pain exploration:
${emp}

### LABEL
Labeling / confirmation:
${lab}

### SELL
Outcome selling:
${out}

### EXPLAIN
If objections appear (budget, timeline, quality, competitor, process, trust), address using the owner's patterns:
Budget: ${framework.objectionHandling?.budget || 'Explain value'}
Timeline: ${framework.objectionHandling?.timeline || 'Explain typical timeline'}
Quality: ${framework.objectionHandling?.quality || 'Explain quality approach'}

### REINFORCE
Commitment / next step:
${rein}
`;
}

function buildFallbackPrompt(
  profile: BusinessProfile & { businessName?: string },
  communicationStyle?: Record<string, unknown>
): string {
  const ownerVoiceExamples = (profile.ownerVoiceExamples as Record<string, unknown>) || {};

  let base = `You are speaking as ${(profile as any).businessName || 'our team'}.

Industry: ${profile.industry}
Service: ${profile.serviceDescription}`;

  if (communicationStyle && Object.keys(communicationStyle).length > 0) {
    base += `

OWNER'S COMMUNICATION STYLE:
${Object.entries(communicationStyle)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}`;
  }

  if (Object.keys(ownerVoiceExamples).length > 0) {
    base += `

OWNER'S ACTUAL PHRASES:
${Object.entries(ownerVoiceExamples)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}`;
  }

  base += `

Follow CLOSER: Clarify → Overview pain → Label → Sell outcome → Explain concerns → Reinforce next step.
Sound authentic, not scripted.`;

  return base;
}

function getNextPhase(completedPhase: string): string {
  const currentIndex = PHASE_ORDER.indexOf(completedPhase as CloserPhaseName);

  if (currentIndex === -1 || currentIndex === PHASE_ORDER.length - 1) {
    return 'reinforce';
  }

  return PHASE_ORDER[currentIndex + 1];
}
