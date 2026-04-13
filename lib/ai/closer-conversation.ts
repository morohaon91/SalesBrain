import { BusinessProfile } from '@prisma/client';
import { createChatCompletion } from '@/lib/ai/client';

/**
 * PHASE 2: CLOSER Framework System
 * Transforms generic AI responses into structured sales conversations using the CLOSER framework
 *
 * CLOSER:
 * C - CLARIFY: Understand why they reached out NOW
 * O - OVERVIEW: Deep-dive into their struggles
 * L - LABEL: Define the problem clearly
 * S - SELL: Focus on outcome, not tool
 * E - EXPLAIN: Handle objections
 * R - REINFORCE: Book the call, set expectations
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

export async function generateCloserResponse(
  messages: Array<{ role: string; content: string }>,
  profile: BusinessProfile,
  currentProgress: CloserProgress | null,
  tenantId?: string
): Promise<{
  response: string;
  updatedProgress: CloserProgress;
  phaseCompleted?: string;
}> {
  // Initialize progress if null
  if (!currentProgress) {
    currentProgress = {
      clarify: { phase: 'clarify', completed: false },
      overview: { phase: 'overview', completed: false },
      label: { phase: 'label', completed: false },
      sell: { phase: 'sell', completed: false },
      explain: { phase: 'explain', completed: false },
      reinforce: { phase: 'reinforce', completed: false },
      currentPhase: 'clarify',
    };
  }

  try {
    // Detect current conversation state
    const conversationState = await analyzeConversationState(messages, currentProgress);

    // Build phase-specific system prompt
    const systemPrompt = buildCloserSystemPrompt(
      profile,
      conversationState.suggestedPhase,
      conversationState
    );

    // Generate response
    const response = await createChatCompletion(
      messages as any,
      systemPrompt,
      { temperature: 0.7, maxTokens: 500 }
    );

    // Detect if phase was completed in this response
    const phaseCompleted = await detectPhaseCompletion((response.content || response) as string, conversationState.suggestedPhase);

    // Update progress
    const updatedProgress = { ...currentProgress };
    if (phaseCompleted) {
      updatedProgress[phaseCompleted as keyof CloserProgress] = {
        phase: phaseCompleted as any,
        completed: true,
        timestamp: new Date().toISOString(),
      } as any;

      // Move to next phase
      updatedProgress.currentPhase = getNextPhase(phaseCompleted);
    }

    return {
      response: (response.content || response) as string,
      updatedProgress,
      phaseCompleted,
    };
  } catch (e) {
    console.error('Error in generateCloserResponse:', e);
    // Return generic response on error
    return {
      response:
        'Thank you for sharing that. Tell me more about your needs so I can better understand how to help.',
      updatedProgress: currentProgress,
    };
  }
}


async function analyzeConversationState(
  messages: Array<{ role: string; content: string }>,
  progress: CloserProgress
): Promise<{
  suggestedPhase: string;
  objectionsDetected: string[];
  needsClarification: boolean;
  readyToReinforce: boolean;
}> {
  const recentMessages = messages.slice(-6); // Last 3 exchanges
  const transcript = recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n');

  const analysisPrompt = `Analyze this conversation to determine the current CLOSER phase.

Conversation:
${transcript}

Current progress:
- Clarify: ${progress.clarify.completed ? 'DONE' : 'NOT DONE'}
- Overview Pain: ${progress.overview.completed ? 'DONE' : 'NOT DONE'}
- Label: ${progress.label.completed ? 'DONE' : 'NOT DONE'}
- Sell Outcome: ${progress.sell.completed ? 'DONE' : 'NOT DONE'}
- Explain Concerns: ${progress.explain.completed ? 'DONE' : 'NOT DONE'}
- Reinforce: ${progress.reinforce.completed ? 'DONE' : 'NOT DONE'}

Determine:
1. What CLOSER phase should we focus on now?
2. Has client raised any objections (budget, timeline, quality, competitor)?
3. Do we need more clarification before moving forward?
4. Is client ready to book/commit (reinforce phase)?

Return JSON:
{
  "suggestedPhase": "clarify" | "overview" | "label" | "sell" | "explain" | "reinforce",
  "objectionsDetected": ["budget", "timeline"],
  "needsClarification": boolean,
  "readyToReinforce": boolean,
  "reasoning": "why this phase"
}`;

  try {
    const response = await createChatCompletion(
      [{ role: 'user', content: analysisPrompt }],
      'You are analyzing conversation flow. Return ONLY valid JSON, no markdown formatting.',
      { temperature: 0.1, maxTokens: 300 }
    );

    // Extract JSON from response (handle markdown-wrapped JSON)
    let jsonStr = (response.content || response) as string;
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(jsonStr);
    return result;
  } catch (e) {
    console.error('Error analyzing conversation state:', e);
    return {
      suggestedPhase: 'clarify',
      objectionsDetected: [],
      needsClarification: true,
      readyToReinforce: false,
    };
  }
}

function buildCloserSystemPrompt(
  profile: BusinessProfile & { businessName?: string },
  currentPhase: string,
  state: any
): string {
  const closerFramework = (profile.closerFramework as any) || {};
  const ownerVoiceExamples = (profile.ownerVoiceExamples as any) || {};
  const communicationStyle = (profile.communicationStyle as any) || {};

  // If no closerFramework but has voice examples, use those
  if ((!closerFramework || Object.keys(closerFramework).length === 0) && Object.keys(ownerVoiceExamples).length === 0) {
    return buildFallbackPrompt(profile, communicationStyle);
  }

  // Base prompt
  let prompt = `You are ${profile.businessName || 'our team'}, talking to a potential lead.

OWNER'S VOICE & COMMUNICATION STYLE:`;

  // Inject actual voice examples and communication style
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

  if (closerFramework.keyPhrases) {
    prompt += `
${closerFramework.keyPhrases.join('\n')}`;
  }

  prompt += `

You follow the CLOSER framework to guide this conversation effectively.

CURRENT PHASE: ${currentPhase.toUpperCase()}

`;

  // Phase-specific instructions
  switch (currentPhase) {
    case 'clarify':
      prompt += `
CLARIFY PHASE - Your goal: Understand WHY they're reaching out NOW

Use these clarifying questions (your actual phrases):
${closerFramework.clarifyingQuestions?.join('\n') || '- What brought you to consider this now?'}

Focus on:
- Understanding their timing and urgency
- What triggered this decision
- What's their deadline/timeline

Don't jump to solutions yet - just understand the situation.
`;
      break;

    case 'overview':
      prompt += `
OVERVIEW PAIN PHASE - Your goal: Deep-dive into their struggles

Use these empathy phrases (your actual words):
${closerFramework.painEmpathyPhrases?.join('\n') || '- I understand that can be frustrating'}

Ask about:
- What have they tried before?
- What's been frustrating?
- What are the consequences of not solving this?

Show empathy and build rapport.
`;
      break;

    case 'label':
      prompt += `
LABEL PHASE - Your goal: Define the problem clearly and get agreement

Use these labeling phrases (your actual words):
${closerFramework.labelingPhrases?.join('\n') || '- So it sounds like you\'re looking for...'}

Summarize:
- What you've heard
- What they need
- What success looks like

Get confirmation: "Is that right?" "Did I capture that correctly?"
`;
      break;

    case 'sell':
      prompt += `
SELL OUTCOME PHASE - Your goal: Paint vision of success (not features)

Use this outcome-focused language (your actual words):
${closerFramework.outcomeSelling?.join('\n') || '- What we\'re really building here is...'}

Focus on:
- The transformation, not the tool
- How their life/business improves
- The peace of mind/relief they'll feel

Don't list features - paint the picture of success.
`;
      break;

    case 'explain':
      prompt += `
EXPLAIN CONCERNS PHASE - Your goal: Handle objections proactively

${
  state.objectionsDetected && state.objectionsDetected.length > 0
    ? `
OBJECTIONS DETECTED: ${state.objectionsDetected.join(', ')}

Use your exact objection responses:
${state.objectionsDetected
  .map(
    (obj: string) => `
${obj.toUpperCase()}:
${closerFramework.objectionHandling?.[obj] || 'Address this concern professionally'}
`
  )
  .join('\n')}
`
    : `
Proactively ask: "What concerns do you have?" or "What questions can I answer?"

When objections come up, use your responses:
Budget: ${closerFramework.objectionHandling?.budget || 'Explain value'}
Timeline: ${closerFramework.objectionHandling?.timeline || 'Explain typical timeline'}
Quality: ${closerFramework.objectionHandling?.quality || 'Explain quality approach'}
`
}

Remove barriers to moving forward.
`;
      break;

    case 'reinforce':
      prompt += `
REINFORCE PHASE - Your goal: Book the call and set expectations

Use these reinforcement phrases (your actual words):
${closerFramework.reinforcement?.join('\n') || '- Let\'s schedule a time to discuss this in detail'}

Create commitment:
- Book a specific next step
- Set clear expectations
- Reinforce the decision
- Thank them for their time

End on a positive, committed note.
`;
      break;
  }

  // Common questions section
  if (closerFramework.commonQuestions && closerFramework.commonQuestions.length > 0) {
    prompt += `

COMMON QUESTIONS (answer using these verbatim):
${closerFramework.commonQuestions
  .map(
    (q: any) => `
Q: ${q.question}
A: ${q.answer}
`
  )
  .join('\n')}
`;
  }

  prompt += `

IMPORTANT GUIDELINES:
- Sound exactly like the owner (use their phrases)
- Follow CLOSER framework naturally (don't be robotic)
- One phase at a time - don't rush
- Be conversational and warm
- Listen more than you talk
- Ask questions before giving answers

DO NOT:
- Use phrases that don't sound like the owner
- Jump phases (stick to current phase)
- Sound scripted or salesy
- Make commitments the owner wouldn't make
`;

  return prompt;
}

async function detectPhaseCompletion(response: string, currentPhase: string): Promise<string | null> {
  const detectionPrompt = `Did this AI response complete the ${currentPhase} phase of CLOSER?

AI Response:
"${response}"

Phase: ${currentPhase}

Completion criteria:
- clarify: Asked why they're considering this now, understood timing
- overview: Explored their pain, asked about past attempts
- label: Summarized their needs and got confirmation
- sell: Painted vision of successful outcome
- explain: Addressed concerns/objections
- reinforce: Booked next step or got commitment

Return ONLY valid JSON with no markdown:
{
  "phaseCompleted": boolean,
  "phaseName": "${currentPhase}" or null
}`;

  try {
    const analysis = await createChatCompletion(
      [{ role: 'user', content: detectionPrompt }],
      'You are analyzing conversation phases. Return ONLY valid JSON.',
      { temperature: 0.1, maxTokens: 100 }
    );

    // Extract JSON from response (handle markdown-wrapped JSON)
    let jsonStr = (analysis.content || analysis) as string;
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(jsonStr);
    return result.phaseCompleted ? result.phaseName : null;
  } catch (e) {
    console.error('Error detecting phase completion:', e);
    return null;
  }
}

function getNextPhase(completedPhase: string): string {
  const phases = ['clarify', 'overview', 'label', 'sell', 'explain', 'reinforce'];
  const currentIndex = phases.indexOf(completedPhase);

  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return 'reinforce'; // Default to reinforce if unknown or already at end
  }

  return phases[currentIndex + 1];
}

function buildFallbackPrompt(profile: BusinessProfile & { businessName?: string }, communicationStyle?: any): string {
  const ownerVoiceExamples = (profile.ownerVoiceExamples as any) || {};

  let basePrompt = `You are speaking as ${(profile as any).businessName || 'our team'}.

Industry: ${profile.industry}
Service: ${profile.serviceDescription}`;

  // If we have communication style examples, inject them
  if (communicationStyle && Object.keys(communicationStyle).length > 0) {
    basePrompt += `

OWNER'S COMMUNICATION STYLE (from real sales conversations):
${Object.entries(communicationStyle)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}`;
  }

  // If we have voice examples, inject them
  if (ownerVoiceExamples && Object.keys(ownerVoiceExamples).length > 0) {
    basePrompt += `

OWNER'S ACTUAL PHRASES (use these to sound authentic):
${Object.entries(ownerVoiceExamples)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}`;
  }

  basePrompt += `

Follow the CLOSER framework to guide this conversation:
C - Clarify why they're reaching out now
O - Overview their pain and struggles
L - Label the problem clearly
S - Sell the outcome (not features)
E - Explain away concerns
R - Reinforce and book next step

IMPORTANT: Sound exactly like the owner. Use their phrases and style from above. Be warm, conversational, and authentic - NOT scripted.`;

  return basePrompt;
}
