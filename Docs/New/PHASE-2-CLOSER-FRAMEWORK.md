# PHASE 2: CLOSER FRAMEWORK IMPLEMENTATION
## Transform Generic AI Chat into Structured Sales Conversation System

**Duration:** Week 2-3 (10-12 days)  
**Complexity:** High  
**Impact:** 🔥 GAME-CHANGER - Structured, effective lead conversations  
**Current State:** AI responds naturally but generically  
**Target State:** AI follows CLOSER framework using owner's verbatim phrases

---

## OBJECTIVES

### Primary Goals:
1. ✅ Extract CLOSER components from simulations (verbatim phrases)
2. ✅ Implement CLOSER-aware AI conversation system
3. ✅ Build multi-turn qualification (don't just score at end)
4. ✅ Create objection handling database
5. ✅ Track conversation progress through CLOSER phases

### Success Metrics:
- AI covers all 6 CLOSER steps in 80%+ of conversations
- Uses owner's verbatim phrases throughout
- Handles objections using owner's exact responses
- Conversation feels natural, not scripted
- Owner recognizes their voice in AI responses

---

## UNDERSTANDING CLOSER

### The Framework:

```
C - CLARIFY: Understand why they reached out NOW
  → "What brought you to consider this right now?"
  → Uncover timing, trigger events

O - OVERVIEW PAIN: Deep-dive into their struggles
  → "What have you tried before?"
  → "What's been frustrating about that?"
  → Build empathy, surface pain

L - LABEL: Define the problem clearly
  → "So it sounds like you're looking for..."
  → "If I'm understanding correctly, the main challenge is..."
  → Get agreement on problem definition

S - SELL OUTCOME: Focus on result, not tool
  → "What we're really building here is..."
  → "The outcome you'll get is..."
  → Paint vision of success

E - EXPLAIN CONCERNS: Identify and address objections
  → "What concerns do you have?"
  → Handle budget, timeline, quality questions
  → Remove barriers proactively

R - REINFORCE: Book the call, set expectations
  → "Let's schedule a time to discuss in detail"
  → "Here's what to expect next"
  → Commitment and next steps
```

### How It Works in Practice:

**Bad (Generic AI):**
```
Lead: "I'm thinking about remodeling my kitchen"
AI: "That sounds great! I'd be happy to help. What's your budget?"
```

**Good (CLOSER Framework):**
```
Lead: "I'm thinking about remodeling my kitchen"

AI (C - Clarify): "That's exciting! What brought you to consider 
a remodel right now? Is there something specific that's driving 
the decision?"

Lead: "Our kitchen is 20 years old and we're hosting Thanksgiving"

AI (O - Overview Pain): "I completely understand - that's a common 
frustration. What's been the biggest challenge with the current setup?"

Lead: "The layout is terrible and appliances keep breaking"

AI (L - Label): "So it sounds like you're looking for a functional 
layout upgrade plus reliable appliances, and you'd like it done 
before the holidays. Is that right?"

Lead: "Exactly"

AI (S - Sell Outcome): "What we're really building here isn't just 
a new kitchen - it's peace of mind when you're hosting family. No 
more worrying about appliances failing or struggling with the layout."

Lead: "That would be great. How much does something like this cost?"

AI (E - Explain Concerns): "Great question. For a full kitchen with 
layout changes and new appliances, we're typically looking at 
$40k-$65k depending on materials and scope. I know that might sound 
high, but let me break down what that includes..."
```

---

## CURRENT STATE ANALYSIS

### What Exists:

**File:** `/lib/ai/prompts/lead-assistant.ts`

```typescript
export function buildLeadAssistantSystemPrompt(profile: BusinessProfile): string {
  return `You are speaking as a representative of ${profile.businessName}.

Industry: ${profile.industry}
Service: ${profile.serviceDescription}
Target Clients: ${profile.targetClientDescription}

Your role:
- Answer questions about the business
- Help understand their needs
- Qualify if they're a good fit
- Book a consultation if appropriate

Be professional, helpful, and conversational.`;
}
```

### The Problem:
- ❌ No CLOSER framework awareness
- ❌ Generic, bland prompt
- ❌ Doesn't use owner's actual phrases
- ❌ No structured conversation flow
- ❌ No objection handling database
- ❌ Doesn't guide conversation through phases

---

## TARGET STATE ARCHITECTURE

### 1. Database Schema Updates

Add CLOSER tracking to conversations:

```prisma
model Conversation {
  // ... existing fields ...
  
  // CLOSER framework tracking
  closerProgress      Json?     @db.JsonB
  // Structure:
  // {
  //   "clarify": { "completed": boolean, "timestamp": ISO string },
  //   "overview": { "completed": boolean, "timestamp": ISO string },
  //   "label": { "completed": boolean, "timestamp": ISO string },
  //   "sell": { "completed": boolean, "timestamp": ISO string },
  //   "explain": { "completed": boolean, "timestamp": ISO string },
  //   "reinforce": { "completed": boolean, "timestamp": ISO string },
  //   "currentPhase": "clarify" | "overview" | "label" | "sell" | "explain" | "reinforce"
  // }
  
  // Objections raised and handled
  objectionsRaised    String[]  @default([])
  objectionsHandled   Json?     @db.JsonB
  // Structure: { "budget": { "raised": true, "handled": true, "response": "..." } }
}
```

### 2. BusinessProfile Schema Updates

Add CLOSER framework examples:

```prisma
model BusinessProfile {
  // ... existing fields ...
  
  // Owner's CLOSER framework (extracted from simulations)
  ownerVoiceExamples  Json?     @db.JsonB
  // Structure:
  // {
  //   "keyPhrases": string[],              // General phrases
  //   "closerFramework": {
  //     "clarifyingQuestions": string[],   // C - questions to understand why now
  //     "painEmpathyPhrases": string[],    // O - empathy and pain exploration
  //     "labelingPhrases": string[],       // L - problem definition
  //     "outcomeSelling": string[],        // S - outcome-focused language
  //     "objectionHandling": {             // E - objection responses
  //       "budget": string,
  //       "timeline": string,
  //       "quality": string,
  //       "competitor": string
  //     },
  //     "reinforcement": string[]          // R - closing and booking
  //   },
  //   "commonQuestions": Array<{           // FAQ with verbatim answers
  //     "question": string,
  //     "answer": string
  //   }>
  // }
}
```

---

## IMPLEMENTATION PLAN

### STEP 1: Update Pattern Extraction to Capture CLOSER Components

**File to modify:** `lib/ai/prompts/pattern-extraction.ts`

Add new extraction section:

```typescript
const closerExtractionPrompt = `
OWNER VOICE EXTRACTION - CLOSER FRAMEWORK

From this simulation conversation, extract how the owner demonstrates each part of the CLOSER framework.

Extract VERBATIM phrases - exact words owner used, not summaries.

C - CLARIFYING QUESTIONS:
What questions did owner ask to understand:
- Why the client is considering this now?
- What triggered the decision?
- What's the timeline/urgency?

Extract exact questions owner asked.

Example:
Owner: "What brought you to consider a remodel right now?"
✅ EXTRACT: "What brought you to consider a remodel right now?"
❌ DON'T: "owner asked about timing"

O - PAIN EMPATHY & OVERVIEW:
How did owner show empathy and explore pain?
Extract exact phrases owner used to:
- Acknowledge client frustration
- Explore what they've tried before
- Understand their struggles

Example:
Owner: "I completely understand - that's frustrating. What's been the biggest challenge?"
✅ EXTRACT: "I completely understand - that's frustrating"

L - LABELING PHRASES:
How did owner label/summarize the problem?
Extract exact phrases owner used to:
- Summarize what client needs
- Get confirmation on understanding
- Define the problem clearly

Example:
Owner: "So it sounds like you're looking for quality work with transparent pricing"
✅ EXTRACT: "So it sounds like you're looking for..."

S - OUTCOME SELLING:
How did owner sell the outcome (not the tool)?
Extract exact phrases owner used to:
- Paint vision of success
- Focus on result/benefit
- Describe transformation

Example:
Owner: "What we're really building here is peace of mind - no more worrying about..."
✅ EXTRACT: "What we're really building here is peace of mind"

E - OBJECTION HANDLING:
How did owner handle different objections?
Extract FULL responses (not summaries) for:
- Budget objections
- Timeline objections
- Quality concerns
- Competitor comparisons

Example:
Client: "That seems expensive"
Owner: "I understand budget is important. Let me break down what's included in that price. You're getting premium materials, full warranty, and..."
✅ EXTRACT FULL RESPONSE as string under "budget" key

R - REINFORCEMENT & BOOKING:
How did owner close and book next steps?
Extract exact phrases owner used to:
- Reinforce the decision
- Book meetings
- Set expectations
- Create commitment

Example:
Owner: "Let's schedule a time to discuss this in detail. I'll make sure you go into this with full clarity."
✅ EXTRACT: "Let's schedule a time to discuss this in detail"

COMMON QUESTIONS & ANSWERS:
Extract FAQ-style questions clients ask and owner's VERBATIM answers.

Example:
Q: "How do you price projects?"
A: "Before I finalize any number, I make sure we define exactly what you're getting - layout changes, cabinetry level, materials, electrical, plumbing, finishes, everything."

OUTPUT JSON STRUCTURE:
{
  "ownerVoice": {
    "keyPhrases": [
      "I focus on building a clear, transparent scope upfront",
      "My approach is scope first, price second"
    ],
    "closerFramework": {
      "clarifyingQuestions": [
        "What brought you to consider this right now?",
        "What's driving the timeline for you?"
      ],
      "painEmpathyPhrases": [
        "I completely understand - that's frustrating",
        "I've heard that from other clients who came to me"
      ],
      "labelingPhrases": [
        "So it sounds like you're looking for...",
        "If I'm understanding correctly, the main challenge is..."
      ],
      "outcomeSelling": [
        "What we're really building here is peace of mind",
        "The outcome you'll get is..."
      ],
      "objectionHandling": {
        "budget": "I understand budget is important. With $40k, we can absolutely create a high-quality kitchen. Let me break down what that includes - premium materials, full warranty, professional installation. Two quotes might look similar on paper but be very different in what you actually get.",
        "timeline": "Typically 6-8 weeks for a full kitchen. That includes planning, permitting, demolition, and installation. I know that might feel long, but rushing often means cutting corners. Would you rather have it done right or done fast?",
        "quality": "For cabinets, we use solid plywood boxes with quality hardware - not particle board. For countertops, I'll show you samples so you can see exactly what you're getting. Quality is my first priority because I want you to love this kitchen in 10 years, not just today.",
        "competitor": "I've reviewed competitor quotes for clients before. Often what looks cheaper is missing key items - permit fees, electrical upgrades, disposal costs. I'd be happy to review their quote with you and show you exactly what's different."
      },
      "reinforcement": [
        "Let's schedule a time to discuss this in detail",
        "I'll make sure you go into this with full clarity",
        "My goal is simple: no surprises, no hidden costs"
      ]
    },
    "commonQuestions": [
      {
        "question": "How do you price projects?",
        "answer": "Before I finalize any number, I make sure we define exactly what you're getting - layout changes, cabinetry level, materials, electrical, plumbing, finishes, everything. Two quotes can look similar on paper but be very different in reality."
      },
      {
        "question": "How long does a typical kitchen take?",
        "answer": "Typically 6-8 weeks for a full kitchen. That includes planning, permitting, demolition, and installation. Timeline depends on scope and material availability."
      }
    ]
  }
}

CRITICAL RULES:
1. Extract VERBATIM - exact words owner said
2. For objection handling, extract FULL responses (not summaries)
3. If owner didn't demonstrate a CLOSER component, mark as empty array or null
4. Focus on phrases that sound natural, not scripted
5. Grammar is OK to fix, but keep the owner's voice/style
`;
```

---

### STEP 2: Build CLOSER-Aware Conversation System

**New file:** `lib/ai/closer-conversation.ts`

```typescript
import { BusinessProfile, Conversation } from '@prisma/client';
import { createChatCompletion } from './anthropic-client';

interface CloserPhase {
  phase: 'clarify' | 'overview' | 'label' | 'sell' | 'explain' | 'reinforce';
  completed: boolean;
  timestamp?: string;
}

interface CloserProgress {
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
  currentProgress: CloserProgress | null
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
      currentPhase: 'clarify'
    };
  }
  
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
    messages,
    systemPrompt,
    { temperature: 0.7, maxTokens: 500 }
  );
  
  // Detect if phase was completed in this response
  const phaseCompleted = await detectPhaseCompletion(
    response,
    conversationState.suggestedPhase
  );
  
  // Update progress
  const updatedProgress = { ...currentProgress };
  if (phaseCompleted) {
    updatedProgress[phaseCompleted] = {
      phase: phaseCompleted as any,
      completed: true,
      timestamp: new Date().toISOString()
    };
    
    // Move to next phase
    updatedProgress.currentPhase = getNextPhase(phaseCompleted);
  }
  
  return {
    response,
    updatedProgress,
    phaseCompleted
  };
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
  const transcript = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');
  
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

  const response = await createChatCompletion(
    [{ role: 'user', content: analysisPrompt }],
    'You are analyzing conversation flow. Return precise JSON.',
    { temperature: 0.1, maxTokens: 300 }
  );
  
  return JSON.parse(response);
}

function buildCloserSystemPrompt(
  profile: BusinessProfile,
  currentPhase: string,
  state: any
): string {
  
  const ownerVoice = profile.ownerVoiceExamples;
  
  if (!ownerVoice) {
    // Fallback if owner voice not extracted yet
    return buildFallbackPrompt(profile);
  }
  
  const { closerFramework } = ownerVoice;
  
  // Base prompt
  let prompt = `You are ${profile.businessName}, talking to a potential lead.

Your communication style:
${ownerVoice.keyPhrases?.join('\n') || ''}

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

${state.objectionsDetected.length > 0 ? `
OBJECTIONS DETECTED: ${state.objectionsDetected.join(', ')}

Use your exact objection responses:
${state.objectionsDetected.map(obj => `
${obj.toUpperCase()}:
${closerFramework.objectionHandling?.[obj] || 'Address this concern professionally'}
`).join('\n')}
` : `
Proactively ask: "What concerns do you have?" or "What questions can I answer?"

When objections come up, use your responses:
Budget: ${closerFramework.objectionHandling?.budget || 'Explain value'}
Timeline: ${closerFramework.objectionHandling?.timeline || 'Explain typical timeline'}
Quality: ${closerFramework.objectionHandling?.quality || 'Explain quality approach'}
`}

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
  if (ownerVoice.commonQuestions && ownerVoice.commonQuestions.length > 0) {
    prompt += `

COMMON QUESTIONS (answer using these verbatim):
${ownerVoice.commonQuestions.map(q => `
Q: ${q.question}
A: ${q.answer}
`).join('\n')}
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

async function detectPhaseCompletion(
  response: string,
  currentPhase: string
): Promise<string | null> {
  
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

Return JSON:
{
  "phaseCompleted": boolean,
  "phaseName": "${currentPhase}" or null
}`;

  const analysis = await createChatCompletion(
    [{ role: 'user', content: detectionPrompt }],
    'You are analyzing conversation phases.',
    { temperature: 0.1, maxTokens: 100 }
  );
  
  const result = JSON.parse(analysis);
  return result.phaseCompleted ? result.phaseName : null;
}

function getNextPhase(completedPhase: string): string {
  const phases = ['clarify', 'overview', 'label', 'sell', 'explain', 'reinforce'];
  const currentIndex = phases.indexOf(completedPhase);
  
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return 'reinforce'; // Default to reinforce if unknown or already at end
  }
  
  return phases[currentIndex + 1];
}

function buildFallbackPrompt(profile: BusinessProfile): string {
  return `You are speaking as ${profile.businessName}.

Industry: ${profile.industry}
Service: ${profile.serviceDescription}

Follow the CLOSER framework to guide this conversation:
C - Clarify why they're reaching out now
O - Overview their pain and struggles
L - Label the problem clearly
S - Sell the outcome (not features)
E - Explain away concerns
R - Reinforce and book next step

Be professional, warm, and conversational.`;
}
```

---

### STEP 3: Integrate CLOSER System into Message Endpoint

**File to modify:** `/app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts`

Replace AI response generation (around line 95) with CLOSER system:

```typescript
import { generateCloserResponse } from '@/lib/ai/closer-conversation';

// ... existing code ...

// Get current CLOSER progress from conversation
const currentProgress = conversation.closerProgress as CloserProgress | null;

// Generate CLOSER-aware response
const { response: aiResponse, updatedProgress, phaseCompleted } = await generateCloserResponse(
  transcript,
  profile,
  currentProgress
);

// Update conversation with new progress
await prisma.conversation.update({
  where: { id: conversationId },
  data: {
    closerProgress: updatedProgress
  }
});

// If phase was completed, log it
if (phaseCompleted) {
  console.log(`CLOSER phase completed: ${phaseCompleted}`);
}

// ... rest of endpoint logic (save message, return response) ...
```

---

### STEP 4: Build Objection Tracking System

**New file:** `lib/closer/objection-tracker.ts`

```typescript
export async function trackObjections(
  messages: Array<{ role: string; content: string }>,
  conversation: Conversation
): Promise<{
  objectionsRaised: string[];
  objectionsHandled: Record<string, any>;
}> {
  
  const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  
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
    }
  }
}`;

  const response = await createChatCompletion(
    [{ role: 'user', content: objectionPrompt }],
    'You are analyzing objections in sales conversations.',
    { temperature: 0.1, maxTokens: 400 }
  );
  
  return JSON.parse(response);
}
```

Add objection tracking to message endpoint after AI responds:

```typescript
// After generating response, track objections
const objectionData = await trackObjections(
  [...transcript, { role: 'assistant', content: aiResponse }],
  conversation
);

// Update conversation
await prisma.conversation.update({
  where: { id: conversationId },
  data: {
    objectionsRaised: objectionData.objectionsRaised,
    objectionsHandled: objectionData.objectionsHandled
  }
});
```

---

### STEP 5: Update UI to Show CLOSER Progress

**File to create:** `components/closer/CloserProgressIndicator.tsx`

```typescript
import { CloserProgress } from '@/lib/ai/closer-conversation';

interface Props {
  progress: CloserProgress;
}

export function CloserProgressIndicator({ progress }: Props) {
  const phases = [
    { key: 'clarify', label: 'Clarify', icon: '❓' },
    { key: 'overview', label: 'Overview Pain', icon: '😔' },
    { key: 'label', label: 'Label', icon: '🏷️' },
    { key: 'sell', label: 'Sell Outcome', icon: '🎯' },
    { key: 'explain', label: 'Explain Concerns', icon: '💬' },
    { key: 'reinforce', label: 'Reinforce', icon: '✅' }
  ];
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-medium mb-3">CLOSER Progress</h3>
      
      <div className="space-y-2">
        {phases.map((phase, index) => {
          const phaseData = progress[phase.key];
          const isCompleted = phaseData?.completed;
          const isCurrent = progress.currentPhase === phase.key;
          
          return (
            <div key={phase.key} className="flex items-center gap-2">
              {/* Phase number */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${isCompleted ? 'bg-green-500 text-white' : 
                  isCurrent ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 text-gray-600'}
              `}>
                {isCompleted ? '✓' : index + 1}
              </div>
              
              {/* Phase info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{phase.icon}</span>
                  <span className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>
                    {phase.label}
                  </span>
                </div>
                {phaseData?.timestamp && (
                  <div className="text-xs text-gray-500">
                    Completed {new Date(phaseData.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              {/* Status indicator */}
              {isCurrent && !isCompleted && (
                <span className="text-xs text-blue-600 font-medium">In Progress</span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Overall progress */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Overall Progress</span>
          <span>
            {Object.values(progress).filter((p: any) => p.completed).length} / 6 phases
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(progress).filter((p: any) => p.completed).length / 6) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

Add to conversation detail page:

```typescript
// In /app/(dashboard)/conversations/[id]/page.tsx

{conversation.closerProgress && (
  <CloserProgressIndicator progress={conversation.closerProgress} />
)}
```

---

### STEP 6: Build Objection Handling Dashboard

**File to create:** `components/closer/ObjectionsSummary.tsx`

```typescript
interface Props {
  objectionsRaised: string[];
  objectionsHandled: Record<string, any>;
}

export function ObjectionsSummary({ objectionsRaised, objectionsHandled }: Props) {
  if (objectionsRaised.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">✅ No objections raised - smooth conversation!</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-medium mb-3">Objections Tracking</h3>
      
      <div className="space-y-3">
        {objectionsRaised.map(objection => {
          const objData = objectionsHandled[objection];
          const handled = objData?.handled;
          
          return (
            <div key={objection} className={`
              border rounded-lg p-3
              ${handled ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}
            `}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{objection}</span>
                {handled ? (
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                    ✓ Handled
                  </span>
                ) : (
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                    ⚠️ Unresolved
                  </span>
                )}
              </div>
              
              {objData?.howHandled && (
                <p className="text-sm text-gray-700">{objData.howHandled}</p>
              )}
              
              {!handled && (
                <p className="text-sm text-orange-700 mt-1">
                  💡 Follow up on this during your call
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## TESTING PLAN

### Test Case 1: Full CLOSER Flow
**Scenario:** Lead completes all phases

**Expected:**
- AI asks clarifying questions first
- Then explores pain
- Then labels problem
- Then sells outcome
- Then handles objections
- Then reinforces and books
- All 6 phases marked complete
- Progress indicator shows 6/6

---

### Test Case 2: Objection Handling
**Scenario:** Lead raises budget objection

**Expected:**
- AI uses owner's exact objection response
- Objection marked as "raised" in database
- If handled well, marked as "handled"
- Shows in objections summary

---

### Test Case 3: Non-Linear Flow
**Scenario:** Lead jumps to objection before pain overview

**Expected:**
- AI handles objection (explain phase)
- Then returns to appropriate phase
- Doesn't force linear progression
- Adapts to conversation flow

---

## SUCCESS METRICS

After Phase 2 completion:

### Quantitative:
- ✅ 80%+ of conversations complete all 6 CLOSER phases
- ✅ Owner recognizes their voice in 90%+ of responses
- ✅ Objections handled using owner responses in 85%+ of cases
- ✅ Conversation feels natural (not robotic) to 90%+ of leads

### Qualitative:
- ✅ AI sounds exactly like owner
- ✅ Conversations feel structured but natural
- ✅ Leads get value from conversation (not just interrogation)
- ✅ Owner gets better-qualified leads

---

## PHASE 2 COMPLETION CHECKLIST

### Database:
- [ ] Add `closerProgress` to Conversation
- [ ] Add `objectionsRaised` and `objectionsHandled` to Conversation
- [ ] Add `ownerVoiceExamples` to BusinessProfile
- [ ] Run migration

### Extraction:
- [ ] Update pattern extraction to capture CLOSER components
- [ ] Extract verbatim phrases for each CLOSER step
- [ ] Extract objection handling responses
- [ ] Extract common Q&A
- [ ] Test extraction on simulations
- [ ] Verify owner voice captured correctly

### CLOSER System:
- [ ] Create `lib/ai/closer-conversation.ts`
- [ ] Implement conversation state analyzer
- [ ] Implement phase-specific system prompts
- [ ] Implement phase completion detector
- [ ] Test CLOSER flow with mock conversations
- [ ] Verify prompts use verbatim phrases

### Objection Tracking:
- [ ] Create `lib/closer/objection-tracker.ts`
- [ ] Implement objection detection
- [ ] Implement handling verification
- [ ] Test objection tracking
- [ ] Verify objections stored correctly

### API Updates:
- [ ] Update message endpoint to use CLOSER system
- [ ] Add CLOSER progress tracking
- [ ] Add objection tracking
- [ ] Test API with CLOSER flow
- [ ] Verify progress updates correctly

### UI Updates:
- [ ] Create CloserProgressIndicator component
- [ ] Create ObjectionsSummary component
- [ ] Add to conversation detail page
- [ ] Add to lead detail page
- [ ] Test UI with various CLOSER states
- [ ] Verify visual feedback works

### Testing:
- [ ] Test full CLOSER flow (all 6 phases)
- [ ] Test objection handling
- [ ] Test non-linear conversations
- [ ] Test with owner's actual phrases
- [ ] Get owner feedback on voice accuracy
- [ ] Verify conversations feel natural

---

## NEXT PHASE PREVIEW

**Phase 3: Vector Search & Knowledge Base** will enhance CLOSER conversations by giving the AI access to:
- Full business knowledge base
- Past successful conversations
- Detailed product/service information
- Case studies and examples

This makes the AI not just sound like the owner, but know everything the owner knows.

---

**END OF PHASE 2**
