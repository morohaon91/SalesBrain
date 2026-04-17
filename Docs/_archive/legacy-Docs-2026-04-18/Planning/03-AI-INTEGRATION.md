# AI Integration & Prompting Strategy

## AI Provider: Anthropic Claude

### Model Selection
- **Primary**: Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Reasoning**: Best balance of intelligence, speed, and cost
- **Fallback**: Claude Haiku 4 for simple responses (cost optimization)

### API Configuration
```typescript
// lib/ai/config.ts
export const AI_CONFIG = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 2000,
  temperature: 0.7, // Slightly creative but consistent
  topP: 0.9,
};
```

---

## AI Use Cases in the Platform

### 1. Simulation Training (Onboarding)
**Purpose**: AI plays difficult client roles to train business profile

**Context Requirements**:
- Scenario type (price-sensitive, indecisive, etc.)
- Business owner's industry
- Conversation history in simulation
- Current simulation state

**Output**:
- Natural client responses
- Realistic objections
- Budget concerns
- Timeline questions

---

### 2. Lead Qualification (Live Chat)
**Purpose**: AI engages with leads using business owner's voice

**Context Requirements**:
- Business profile (communication style, pricing logic, qualification criteria)
- Conversation history
- Lead's previous questions
- Current qualification score

**Output**:
- Business owner-style responses
- Qualification questions
- Red flag detection
- Warm lead signals

---

### 3. Pattern Extraction
**Purpose**: Analyze simulations to extract business logic

**Context Requirements**:
- Full simulation transcript
- Multiple simulations (for patterns)

**Output**:
- Communication style analysis
- Pricing boundaries
- Deal-breakers
- Objection handling patterns
- Qualification criteria

---

### 4. Conversation Summarization
**Purpose**: Generate lead summaries for business owner

**Context Requirements**:
- Full conversation transcript
- Qualification score
- Detected topics

**Output**:
- Executive summary
- Key pain points
- Budget/timeline info
- Recommended next steps

---

## Prompt Engineering Strategy

### Principle: System + User Pattern
- **System Prompt**: Role, constraints, output format
- **User Prompt**: Specific context and task
- **Few-shot Examples**: 2-3 examples for complex tasks
- **Chain-of-Thought**: For analysis tasks

---

## Prompt Templates

### 1. Simulation - AI Client Role

#### System Prompt
```typescript
const SIMULATION_CLIENT_SYSTEM_PROMPT = `You are roleplaying as a potential client inquiring about professional services.

SCENARIO: {scenarioType}
CLIENT PROFILE:
- Type: {clientType}
- Budget: {budget}
- Pain Points: {painPoints}
- Personality: {personality}

YOUR BEHAVIOR:
- Stay in character as this specific client type
- Ask realistic questions based on the scenario
- Raise objections that match the scenario (e.g., price concerns for PRICE_SENSITIVE)
- Be somewhat skeptical but genuinely interested
- Don't make it too easy - challenge the business owner
- Keep responses conversational and natural (2-4 sentences)
- Gradually reveal information (don't dump everything at once)

WHAT YOU KNOW:
- The business owner sells: {businessType}
- Their industry: {industry}

DO NOT:
- Break character or mention you're an AI
- Be overly agreeable or hostile
- Ask about things unrelated to the service
- Provide unrealistic scenarios

Respond as this client would in a real conversation.`;

const SIMULATION_CLIENT_USER_PROMPT = `Business owner's response: "{ownerMessage}"

How does the {clientType} client respond? Remember to stay in character and continue the {scenarioType} scenario.`;
```

#### Example Usage
```typescript
const response = await claude.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 300,
  temperature: 0.8,
  system: SIMULATION_CLIENT_SYSTEM_PROMPT
    .replace('{scenarioType}', 'PRICE_SENSITIVE')
    .replace('{clientType}', 'Startup Founder')
    .replace('{budget}', 'Limited, $5k-10k range')
    .replace('{painPoints}', 'Need results fast but budget constrained')
    .replace('{personality}', 'Direct, data-driven, pragmatic'),
  messages: conversationHistory,
});
```

---

### 2. Lead Qualification - Business Owner Voice

#### System Prompt
```typescript
const LEAD_QUALIFICATION_SYSTEM_PROMPT = `You are an AI assistant representing {businessOwnerName}, a {industry} professional.

Your job is to:
1. Engage with potential leads naturally
2. Answer questions the way {businessOwnerName} would
3. Qualify leads based on their criteria
4. Politely filter out poor-fit leads
5. Identify warm leads ready for human contact

BUSINESS OWNER'S COMMUNICATION STYLE:
{communicationStyle}

PRICING APPROACH:
{pricingLogic}

QUALIFICATION CRITERIA:
Must-haves: {mustHaves}
Deal-breakers: {dealBreakers}
Ideal client: {idealClient}

RED FLAGS TO WATCH FOR:
{redFlags}

GREEN FLAGS (warm lead signals):
{greenFlags}

HOW TO QUALIFY:
- Ask smart follow-up questions to understand fit
- Listen for budget, timeline, decision-making authority
- Detect pain points and urgency
- Identify if they match ideal client profile

WHEN TO ESCALATE TO HUMAN:
- Lead is clearly qualified (score >70)
- Complex question you're unsure about
- Lead specifically asks to speak with owner
- Detected red flags need human judgment

RESPONSE GUIDELINES:
- Match the owner's tone and style
- Keep responses concise (2-4 sentences typically)
- Be helpful but honest about fit
- Don't overpromise or make up information
- If unsure, say: "Let me connect you with {businessOwnerName} for that specific question"

IMPORTANT:
- Never share specific pricing without understanding their needs first
- Always qualify before providing detailed information
- Be professional but personable
- Politely disengage if it's clearly not a fit

Current confidence level: Respond naturally but track your confidence. If <70% confident, suggest human follow-up.`;

const LEAD_QUALIFICATION_USER_PROMPT = `Lead's message: "{leadMessage}"

Current conversation context:
- Lead qualification score: {currentScore}/100
- Topics discussed: {topics}
- Budget mentioned: {budget}
- Timeline mentioned: {timeline}

Respond as {businessOwnerName} would. Be helpful, qualify the lead, and determine if this is a good fit.`;
```

#### Response Format (Structured Output)
```typescript
interface LeadResponse {
  message: string; // The actual response to show the lead
  internal: {
    confidenceScore: number; // 0-1
    detectedIntent: 'question' | 'objection' | 'booking_intent' | 'unqualified';
    qualificationUpdate: {
      score: number; // 0-100
      status: 'UNKNOWN' | 'QUALIFIED' | 'UNQUALIFIED' | 'MAYBE';
      reasoning: string;
    };
    extractedInfo: {
      budget?: string;
      timeline?: string;
      painPoints?: string[];
      redFlags?: string[];
      greenFlags?: string[];
    };
    suggestedNextStep: string;
  };
}
```

---

### 3. Pattern Extraction from Simulations

#### System Prompt
```typescript
const PATTERN_EXTRACTION_SYSTEM_PROMPT = `You are an expert business analyst extracting decision-making patterns from conversation transcripts.

Analyze the provided simulation conversations where a business owner practiced handling difficult clients. Extract:

1. COMMUNICATION STYLE
- Tone (professional, casual, friendly, authoritative)
- Formality level (1-5 scale)
- Response length preference (brief, balanced, detailed)
- Key phrases they frequently use
- Emoji/emoticon usage
- Overall personality in communication

2. PRICING LOGIC
- Minimum budget they accept
- Maximum budget range
- Flexibility in pricing (rigid, moderate, flexible)
- How they handle budget objections
- What makes them negotiate vs. stay firm
- Price-related deal-breakers

3. QUALIFICATION CRITERIA
- Must-haves in a client
- Absolute deal-breakers
- Ideal client characteristics
- Warning signs they watch for
- Green flags they look for

4. OBJECTION HANDLING
- Common objections they face
- Their typical responses
- Patterns in how they overcome objections
- When they push back vs. accommodate

5. DECISION-MAKING PATTERNS
- How quickly they respond
- Their questioning style
- How they handle uncertainty
- Level of empathy shown
- Directness vs. diplomacy

IMPORTANT:
- Base conclusions on actual behavior, not stated intentions
- Look for patterns across multiple conversations
- Note confidence level for each extracted pattern
- Provide specific examples to support each pattern

Output as structured JSON.`;

const PATTERN_EXTRACTION_USER_PROMPT = `Analyze these {count} simulation transcripts:

{transcripts}

Extract the business owner's patterns and decision-making logic. Be specific and evidence-based.`;
```

#### Expected Output Structure
```json
{
  "communicationStyle": {
    "tone": "professional-friendly",
    "formality": 4,
    "responseLength": "detailed",
    "keyPhrases": [
      "I understand your concern",
      "Let me break that down",
      "Here's what I typically recommend"
    ],
    "emojiUsage": false,
    "confidence": 0.95
  },
  "pricingLogic": {
    "minBudget": 5000,
    "maxBudget": 50000,
    "flexibility": 3,
    "negotiationStyle": "Firm on value, flexible on payment terms",
    "dealBreakers": [
      "Budget under $5k",
      "Unrealistic timeline expectations",
      "No budget allocated"
    ],
    "confidence": 0.88
  },
  "qualificationCriteria": {
    "mustHaves": [
      "Clear project scope",
      "Decision-maker involvement",
      "Realistic timeline"
    ],
    "dealBreakers": [
      "No budget defined",
      "Looking for free consultation",
      "Competitor research"
    ],
    "idealClient": [
      "B2B SaaS",
      "Series A+ funding",
      "Growth phase"
    ],
    "confidence": 0.91
  },
  "objectionHandling": {
    "patterns": [
      {
        "objection": "Price too high",
        "approach": "Reframe on ROI and long-term value",
        "examples": ["Let me show you what this translates to in revenue..."]
      }
    ],
    "confidence": 0.85
  }
}
```

---

### 4. Conversation Summarization

#### System Prompt
```typescript
const CONVERSATION_SUMMARY_SYSTEM_PROMPT = `You are summarizing a lead conversation for a busy business owner.

Create a concise, actionable summary that helps the owner decide whether to follow up and how.

INCLUDE:
- Lead's basic info (name, company, contact)
- Main pain points/needs
- Budget and timeline (if mentioned)
- Qualification status and score
- Red flags or concerns
- Green flags or positive signals
- Recommended next steps

FORMAT:
- Executive summary: 2-3 sentences
- Key details: Bullet points
- Action items: Clear next steps

Be direct and honest about fit. The owner needs to make quick decisions.`;

const CONVERSATION_SUMMARY_USER_PROMPT = `Summarize this conversation:

LEAD INFO:
Name: {leadName}
Email: {leadEmail}
Company: {leadCompany}

CONVERSATION:
{transcript}

QUALIFICATION SCORE: {score}/100
STATUS: {qualificationStatus}

Provide a summary that helps the owner decide on next steps.`;
```

#### Expected Output
```
EXECUTIVE SUMMARY:
Sarah from TechStart Inc is a qualified lead (Score: 85) looking for growth consulting. Series A startup, $15k budget, wants to start in 6 weeks. Strong fit for ideal client profile.

KEY DETAILS:
✅ Green Flags:
- Series A funded ($8M)
- Clear budget ($15k-20k range)
- Decision maker (CEO)
- Understands consulting value
- Realistic timeline (6 weeks to start)

⚠️ Potential Concerns:
- First-time working with external consultant
- Needs some education on process

PAIN POINTS:
- Struggling to scale sales team
- No clear growth strategy
- Limited internal resources

BUDGET & TIMELINE:
- Budget: $15k-20k allocated
- Timeline: Start in 6 weeks, 3-month engagement
- Authority: CEO decision, board approved

RECOMMENDED NEXT STEPS:
1. Schedule 30-min discovery call within 48 hours
2. Send case study of similar Series A client
3. Prepare proposal for 3-month engagement
4. Priority: HIGH - Don't let this one cool off
```

---

## Vector Embeddings Strategy

### Use Case: Semantic Search in Business Profile

**What to Embed**:
1. Simulation transcripts (chunked)
2. Q&A pairs extracted from simulations
3. Business owner's key responses
4. Objection handling examples

**Embedding Process**:
```typescript
// For each simulation
const chunks = chunkTranscript(transcript, {
  maxChunkSize: 500, // tokens
  overlap: 50, // tokens
});

for (const chunk of chunks) {
  const embedding = await anthropic.embeddings.create({
    model: 'voyage-2',
    input: chunk.text,
  });
  
  await pinecone.upsert({
    namespace: tenantId,
    vectors: [{
      id: chunk.id,
      values: embedding,
      metadata: {
        text: chunk.text,
        simulationId: simulation.id,
        scenarioType: simulation.scenarioType,
        timestamp: chunk.timestamp,
      },
    }],
  });
}
```

**Query Process** (during lead conversation):
```typescript
async function findRelevantContext(question: string, tenantId: string) {
  // Embed the question
  const queryEmbedding = await embedQuestion(question);
  
  // Search in tenant's namespace
  const results = await pinecone.query({
    namespace: tenantId,
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });
  
  // Return relevant chunks
  return results.matches.map(m => m.metadata.text);
}
```

---

## Confidence Scoring

### AI Confidence Detection
```typescript
interface ConfidenceSignals {
  explicit: string[]; // Phrases like "I'm not sure", "Let me check"
  hedging: string[]; // "Maybe", "Possibly", "It depends"
  specificity: number; // How specific vs. vague
  contradictions: boolean; // Contradictory statements
}

function calculateConfidence(response: string, context: any): number {
  let confidence = 1.0;
  
  // Explicit uncertainty
  const uncertainPhrases = [
    "I'm not sure",
    "I don't know",
    "Let me check",
    "I need to verify"
  ];
  if (uncertainPhrases.some(p => response.toLowerCase().includes(p))) {
    confidence -= 0.4;
  }
  
  // Hedging language
  const hedges = ["maybe", "possibly", "might", "could be"];
  const hedgeCount = hedges.filter(h => 
    response.toLowerCase().includes(h)
  ).length;
  confidence -= (hedgeCount * 0.1);
  
  // Low relevance to context (simplified)
  if (context.relevantChunks.length === 0) {
    confidence -= 0.3;
  }
  
  return Math.max(0, Math.min(1, confidence));
}
```

---

## AI Cost Optimization

### Token Management
```typescript
const TOKEN_BUDGETS = {
  simulation: {
    systemPrompt: 800, // tokens
    conversationHistory: 2000, // tokens
    maxResponse: 300, // tokens
  },
  leadChat: {
    systemPrompt: 1200, // tokens (includes profile)
    conversationHistory: 1500, // tokens
    maxResponse: 200, // tokens
  },
  patternExtraction: {
    systemPrompt: 400,
    transcripts: 4000,
    maxResponse: 2000,
  },
};

// Truncate conversation history intelligently
function truncateHistory(messages: Message[], maxTokens: number) {
  // Keep first message (greeting/context)
  // Keep last N messages (recent context)
  // Summarize middle messages
  
  const first = messages[0];
  const recent = messages.slice(-10);
  const middle = messages.slice(1, -10);
  
  if (estimateTokens(messages) <= maxTokens) {
    return messages;
  }
  
  const middleSummary = summarizeMessages(middle);
  return [first, middleSummary, ...recent];
}
```

### Model Selection Logic
```typescript
function selectModel(task: string, complexity: 'low' | 'medium' | 'high') {
  if (task === 'greeting' || complexity === 'low') {
    return 'claude-haiku-4'; // Cheaper, faster
  }
  
  if (task === 'qualification' || task === 'simulation') {
    return 'claude-sonnet-4'; // Balance
  }
  
  if (task === 'pattern-extraction') {
    return 'claude-sonnet-4'; // Needs reasoning
  }
  
  return 'claude-sonnet-4'; // Default
}
```

---

## Error Handling

### AI Provider Errors
```typescript
async function aiWithRetry(
  prompt: string,
  options: any,
  maxRetries = 3
): Promise<AIResponse> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await anthropic.messages.create({
        model: options.model,
        messages: prompt,
        ...options,
      });
    } catch (error) {
      if (error.status === 429) {
        // Rate limit - exponential backoff
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      
      if (error.status >= 500) {
        // Server error - retry
        await sleep(1000);
        continue;
      }
      
      // Client error - don't retry
      throw error;
    }
  }
  
  throw new Error('AI request failed after retries');
}
```

### Fallback Responses
```typescript
const FALLBACK_RESPONSES = {
  uncertainty: "I want to make sure I give you accurate information. Let me connect you with {ownerName} who can answer this specifically.",
  
  error: "I'm having a technical issue right now. Please leave your email and {ownerName} will get back to you shortly.",
  
  timeout: "This is taking longer than expected. Would you like to leave your contact info so we can follow up?",
};
```

---

## Testing AI Behavior

### Unit Tests for Prompts
```typescript
describe('Lead Qualification AI', () => {
  it('should detect qualified lead signals', async () => {
    const conversation = [
      { role: 'lead', content: 'I have a $20k budget and need to start next month' }
    ];
    
    const response = await qualifyLead(conversation, businessProfile);
    
    expect(response.internal.qualificationUpdate.score).toBeGreaterThan(70);
    expect(response.internal.extractedInfo.budget).toBe('$20k');
  });
  
  it('should identify red flags', async () => {
    const conversation = [
      { role: 'lead', content: 'Can you work for free first?' }
    ];
    
    const response = await qualifyLead(conversation, businessProfile);
    
    expect(response.internal.extractedInfo.redFlags).toContain('free work request');
    expect(response.internal.qualificationUpdate.status).toBe('UNQUALIFIED');
  });
});
```

---

## Monitoring & Analytics

### Track AI Performance
```typescript
interface AIMetrics {
  modelUsed: string;
  tokensInput: number;
  tokensOutput: number;
  latencyMs: number;
  cost: number;
  confidenceScore: number;
  task: string;
  success: boolean;
  errorType?: string;
}

// Log every AI call
await logAIUsage({
  tenantId,
  conversationId,
  metrics: {
    modelUsed: 'claude-sonnet-4',
    tokensInput: 850,
    tokensOutput: 180,
    latencyMs: 1250,
    cost: 0.0025,
    confidenceScore: 0.92,
    task: 'lead-qualification',
    success: true,
  },
});
```

---

**Next Steps:**
1. Implement AI client wrapper
2. Create prompt template library
3. Set up Pinecone for embeddings
4. Build confidence scoring logic
5. Implement fallback handlers
6. Create AI performance monitoring
7. Write comprehensive AI tests

---

**Document Status**: Complete - Ready for Implementation
**Last Updated**: March 2026
