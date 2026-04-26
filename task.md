Reduce AI costs by 50-70% and cut latency in half while improving reliability.

📊 Current State (The Problem)
Your top 3 money burners:

Lead chat: 3 AI calls per message ($0.03-0.09 each)
Extraction: 6,000 token limit ($0.15+ per extraction)
Conversation end: 3 AI calls ($0.02-0.08)

Performance killers:

Lead waits for 3 sequential API calls (3-15 seconds)
No tracking on lead chat (you're blind to costs)
No prompt caching (paying full price every time)


✅ EXECUTION PLAN (3 Phases)
PHASE 1: Stop the Bleeding (1 week, HIGH ROI)
Goal: Fix the most expensive operation (lead chat) and start tracking costs.
Task 1.1: Reduce Lead Chat from 3 Calls to 1 Call
Impact: ~67% cost reduction + 3x faster
Effort: 4-6 hours
File: lib/ai/closer-conversation.ts
Current (BAD):
typescript// 3 separate calls
const state = await analyzeConversationState(...);  // Call 1
const reply = await generateCloserResponse(...);    // Call 2  
const phase = await detectPhaseCompletion(...);     // Call 3
New (GOOD):
typescriptexport async function generateCloserResponse(
  conversationHistory: Array<{ role: string; content: string }>,
  businessProfile: any,
  tenantId: string
): Promise<{
  response: string;
  phase: string;
  phaseComplete: boolean;
  tokensUsed: number;
  latencyMs: number;
}> {

  const systemPrompt = `You are representing ${businessProfile.businessName}.

Your task: 
1. Analyze the conversation state
2. Generate a response in the owner's voice
3. Determine if the current CLOSER phase is complete

Return this EXACT JSON structure:
{
  "currentPhase": "clarify|label|overview|sell|explain|reinforce",
  "phaseComplete": true|false,
  "response": "your reply here"
}

Business context:
${JSON.stringify(businessProfile.communicationStyle, null, 2)}
${JSON.stringify(businessProfile.decisionMakingPatterns, null, 2)}`;

  const result = await createChatCompletion(
    conversationHistory,
    systemPrompt,
    {
      maxTokens: 800,  // Combined limit
      temperature: 0.7,
      tenantId,
      operationType: 'lead_chat',
      metadata: { conversationId: conversationHistory[0]?.conversationId }
    }
  );

  const parsed = parseAiJson(result.content);  // Use existing helper

  return {
    response: parsed.response,
    phase: parsed.currentPhase,
    phaseComplete: parsed.phaseComplete,
    tokensUsed: result.inputTokens + result.outputTokens,
    latencyMs: result.latencyMs
  };
}
Delete these functions:

analyzeConversationState
detectPhaseCompletion


Task 1.2: Track Real Costs on Lead Chat
Impact: Stop flying blind
Effort: 1 hour
File: app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts
Current (BAD):
typescriptconst ai = {
  content: closerResponse.response,
  tokensUsed: 0,  // TODO: Track from actual API call
  latencyMs: 0,   // TODO: Measure actual latency
};
New (GOOD):
typescriptconst closerResponse = await generateCloserResponse(
  conversationHistory,
  businessProfile,
  conversation.tenantId
);

const ai = {
  content: closerResponse.response,
  tokensUsed: closerResponse.tokensUsed,
  latencyMs: closerResponse.latencyMs,
};

Task 1.3: Add Request Timeout
Impact: Prevent infinite hangs
Effort: 30 minutes
File: lib/ai/client.ts
Add:
typescriptexport async function createChatCompletion(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;  // NEW
  } = {}
): Promise<AIResponse> {
  
  const startTime = Date.now();
  const timeout = options.timeoutMs || 30000; // 30s default

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('AI request timeout')), timeout);
  });

  try {
    const response = await Promise.race([
      client.messages.create({
        model: AI_CONFIG.model,
        max_tokens: options.maxTokens ?? AI_CONFIG.maxTokens,
        temperature: options.temperature ?? AI_CONFIG.temperature,
        system: systemPrompt,
        messages: messages,
      }),
      timeoutPromise
    ]);
    
    // rest of function...
  }
}

Phase 1 Checklist:

 Merge 3 lead calls into 1 (Task 1.1)
 Fix tokensUsed/latencyMs tracking (Task 1.2)
 Add timeout protection (Task 1.3)
 Deploy and test with real lead
 Monitor costs for 3 days

Expected result: Lead chat costs drop 60-70%, latency cuts by 50%+

PHASE 2: Enable Cost Visibility (1 week, CRITICAL)
Goal: Know where every dollar goes.
Task 2.1: Implement Usage Logging
Impact: See real costs per tenant
Effort: 2-3 hours
File: lib/ai/client.ts
Add to bottom of createChatCompletion success block:
typescript// After successful response
const usage = {
  tenantId: options.tenantId,
  operationType: options.operationType || 'unknown',
  model: AI_CONFIG.model,
  inputTokens: response.usage.input_tokens,
  outputTokens: response.usage.output_tokens,
  latencyMs,
  metadata: options.metadata || {}
};

// Call existing logger (fix it to actually work)
await logAIUsage(usage).catch(err => {
  console.error('[AI] Failed to log usage:', err);
  // Don't fail user request
});
File: lib/ai/usage.ts
Fix the implementation:
typescriptexport async function logAIUsage(data: {
  tenantId?: string;
  operationType: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  metadata: any;
}): Promise<void> {
  
  if (!data.tenantId) return; // Skip non-tenant calls
  
  const pricing = {
    'claude-sonnet-4-20250514': { input: 3/1_000_000, output: 15/1_000_000 }
  };
  
  const cost = pricing[data.model]
    ? (data.inputTokens * pricing[data.model].input) + 
      (data.outputTokens * pricing[data.model].output)
    : 0;

  // Log to console for now (move to DB later)
  console.log('[AI USAGE]', {
    tenant: data.tenantId,
    type: data.operationType,
    cost: `$${cost.toFixed(4)}`,
    tokens: data.inputTokens + data.outputTokens,
    latency: `${data.latencyMs}ms`
  });
  
  // TODO: Write to AIOperationLog table
}

Task 2.2: Fix Conversation End (Remove Duplicate Call)
Impact: -33% cost on /end
Effort: 1 hour
File: app/api/v1/public/lead-chat/[widgetApiKey]/end/route.ts
Current (BAD):
typescript// scoreConversation makes 2 calls
const scoring = await scoreConversation(...);

// THEN another call for name/email
const basicResponse = await createChatCompletion(...);
const { leadName, leadEmail } = parseAiJson(basicResponse.content);
New (GOOD):
typescript// Extend hybrid scorer to return name/email
const scoring = await scoreConversation(...);

// Use data from scoring instead of new call
const { leadName, leadEmail } = scoring.extractedInfo;
File: lib/scoring/hybrid-scorer.ts
Update extractLeadInfo to include name/email in its JSON output.

Phase 2 Checklist:

 Wire up logAIUsage in client (Task 2.1)
 Remove duplicate /end call (Task 2.2)
 Pass tenantId to ALL createChatCompletion calls
 Monitor logs for 1 week
 Build simple cost dashboard

Expected result: Full visibility into per-tenant costs

PHASE 3: Optimize Everything Else (2 weeks, MEDIUM ROI)
Goal: Squeeze every efficiency gain.
Task 3.1: Enable Prompt Caching
Impact: 50-90% discount on repeated content
Effort: 3-4 hours
File: lib/extraction/extraction-engine.ts
typescriptconst response = await client.messages.create({
  model: AI_CONFIG.model,
  max_tokens: 6000,
  system: [
    {
      type: "text",
      text: EXTRACTION_SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" }  // CACHE THIS
    }
  ],
  messages: [{ role: 'user', content: prompt }]
});
Do this for:

Extraction system prompt
CLOSER conversation system prompt
Simulation persona prompts


Task 3.2: Parallelize Hybrid Scorer
Impact: ~40% faster /end
Effort: 1 hour
File: lib/scoring/hybrid-scorer.ts
Current (BAD):
typescriptconst extraction = await extractLeadInfo(...);  // Wait
const engagement = await analyzeEngagementAndAlignment(...);  // Then wait
New (GOOD):
typescriptconst [extraction, engagement] = await Promise.all([
  extractLeadInfo(conversationMessages, businessProfile),
  analyzeEngagementAndAlignment(conversationMessages, businessProfile)
]);

Task 3.3: Reduce Extraction Token Limit
Impact: Lower peak costs
Effort: 2 hours
File: lib/extraction/extraction-engine.ts
Test if 4000 tokens is enough:
typescriptmaxTokens: 4000,  // Down from 6000
Monitor extraction quality. If truncations increase, revert.

Task 3.4: Switch Simple Tasks to Haiku
Impact: 88% cost reduction on classifiers
Effort: 4-6 hours
Create model routing:
typescript// lib/ai/client.ts
const TASK_MODELS = {
  'lead_chat': 'claude-sonnet-4-20250514',      // Keep quality
  'extraction': 'claude-sonnet-4-20250514',     // Complex task
  'scoring': 'claude-haiku-4-20250514',         // Simple JSON
  'simulation': 'claude-sonnet-4-20250514',     // Owner voice
};

export async function createChatCompletion(
  messages,
  systemPrompt,
  options: { operationType?: string; ... }
) {
  const model = options.model || 
                TASK_MODELS[options.operationType] || 
                AI_CONFIG.model;
  
  const response = await client.messages.create({
    model,  // Use dynamic model
    // ...
  });
}

Task 3.5: Add Retry Logic
Impact: Better reliability
Effort: 2 hours
typescriptasync function createChatCompletionWithRetry(
  messages,
  systemPrompt,
  options,
  retries = 2
): Promise<AIResponse> {
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await createChatCompletion(messages, systemPrompt, options);
    } catch (error) {
      if (attempt === retries) throw error;
      
      if (error.status === 429 || error.status >= 500) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error; // Don't retry client errors
    }
  }
}

Phase 3 Checklist:

 Enable prompt caching (Task 3.1)
 Parallelize hybrid scorer (Task 3.2)
 Test lower extraction limit (Task 3.3)
 Route to Haiku where possible (Task 3.4)
 Add retry logic (Task 3.5)
 Monitor for regressions

Expected result: Another 30-40% cost reduction + better UX

📈 Expected Impact Summary
MetricBeforeAfter Phase 1After Phase 3Total ImprovementLead message cost$0.06$0.02$0.01-83%Lead message latency6-12s2-4s2-4s-67%Conversation end cost$0.05$0.03$0.02-60%Monthly AI bill$500$200$100-80%Cost visibility0%100%100%Perfect