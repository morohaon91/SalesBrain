I need to fix a critical bug in my AI simulation system where the AI is switching personas mid-conversation.

PROBLEM:
The AI starts as the correct industry persona (e.g., Real Estate homebuyer) but then switches to a different industry (e.g., Business Consulting startup founder) in the second message. This is because the simulation message endpoint is not fetching the tenant's industry and business profile, so the AI prompt generation has no context about what industry to use.

CURRENT BROKEN BEHAVIOR:
Message 1: "Hi, I'm looking to buy my first home..." ✅ Correct (Real Estate)
Message 2: "Wait, I'm actually a startup founder looking for consulting..." ❌ WRONG!

ROOT CAUSE IDENTIFIED:
Looking at the Prisma query logs, the simulation message endpoint is only fetching the Simulation table without including the Tenant or BusinessProfile relationships. This means generateSimulationPrompt() has no access to the industry field.

REQUIRED FIXES:

═══════════════════════════════════════════════════════════════
FIX 1: Update Simulation Message Endpoint Query
═══════════════════════════════════════════════════════════════

File: app/api/v1/simulations/[id]/message/route.ts

CURRENT CODE (BROKEN):
```typescript
const simulation = await prisma.simulation.findUnique({
  where: { id: simulationId }
});
```

CHANGE TO:
```typescript
const simulation = await prisma.simulation.findUnique({
  where: { id: simulationId },
  include: {
    tenant: {
      include: {
        businessProfile: true
      }
    }
  }
});
```

THEN UPDATE THE PROMPT GENERATION CALL:

CURRENT (BROKEN):
```typescript
const systemPrompt = await generateSimulationPrompt(
  simulation.scenarioType,
  simulation.tenantId
);
```

CHANGE TO:
```typescript
const systemPrompt = await generateSimulationPrompt(
  simulation.scenarioType,
  simulation.tenant.businessProfile
);
```

FULL CORRECTED ENDPOINT:
Provide the complete, working app/api/v1/simulations/[id]/message/route.ts file with:
- Proper Prisma query including tenant and businessProfile
- Save business owner's message
- Fetch conversation history
- Format messages for Claude API
- Generate system prompt with full profile context
- Call Anthropic API with system prompt included
- Save AI response
- Return response to frontend
- Proper error handling
- TypeScript types

═══════════════════════════════════════════════════════════════
FIX 2: Update generateSimulationPrompt Function Signature
═══════════════════════════════════════════════════════════════

File: lib/ai/prompts/simulation.ts

CURRENT SIGNATURE (BROKEN):
```typescript
export async function generateSimulationPrompt(
  scenarioType: ScenarioType,
  tenantId: string
): Promise<string>
```

CHANGE TO:
```typescript
export async function generateSimulationPrompt(
  scenarioType: ScenarioType,
  businessProfile: any
): Promise<string>
```

IMPLEMENTATION REQUIREMENTS:
1. Accept businessProfile object instead of tenantId
2. Extract industry from businessProfile.industry
3. Get the correct industry template using INDUSTRY_TEMPLATES[industry]
4. Get the scenario persona for this specific scenario type
5. Build comprehensive system prompt that includes:
   - Clear role definition for the AI
   - Client type, budget, personality from template
   - Pain points specific to this scenario
   - Behavioral instructions to stay in character
   - Typical objections to raise
   - Business context (service description, target client, budget range)
   - CRITICAL WARNING: Explicit instruction to NEVER break character or switch industries
6. Use businessProfile data if customized, otherwise fall back to template defaults
7. Return complete system prompt string

CRITICAL: Add explicit instruction in the system prompt like:
"CRITICAL: You are a [client type] in the [industry] industry. 
Stay in this role for the ENTIRE conversation. Do not switch industries or personas under any circumstances."

═══════════════════════════════════════════════════════════════
FIX 3: Update Simulation Start Endpoint
═══════════════════════════════════════════════════════════════

File: app/api/v1/simulations/start/route.ts

CURRENT (BROKEN):
```typescript
const systemPrompt = await generateSimulationPrompt(
  scenarioType,
  tenantId
);
```

CHANGE TO:
```typescript
// First, fetch business profile
const businessProfile = await prisma.businessProfile.findUnique({
  where: { tenantId }
});

if (!businessProfile) {
  return NextResponse.json(
    { success: false, error: { code: 'PROFILE_NOT_FOUND' } },
    { status: 404 }
  );
}

// Then pass profile to prompt generator
const systemPrompt = await generateSimulationPrompt(
  scenarioType,
  businessProfile
);
```

FULL CORRECTED ENDPOINT:
Provide the complete, working app/api/v1/simulations/start/route.ts file with:
- Fetch business profile
- Handle missing profile error
- Generate system prompt with profile
- Create simulation record
- Call Anthropic API with system prompt
- Save first AI message
- Return simulation ID and first message
- Proper error handling
- TypeScript types

═══════════════════════════════════════════════════════════════
DELIVERABLES
═══════════════════════════════════════════════════════════════

Provide complete, working code for:

1. ✅ app/api/v1/simulations/[id]/message/route.ts
   - Complete file with all fixes
   - Include proper Prisma query with relationships
   - Pass businessProfile to prompt generator
   - Include system prompt in every Anthropic API call
   
2. ✅ lib/ai/prompts/simulation.ts
   - Updated function signature accepting businessProfile
   - Extract industry from profile
   - Use INDUSTRY_TEMPLATES to get correct persona
   - Build comprehensive system prompt
   - Add explicit "stay in character" warnings
   
3. ✅ app/api/v1/simulations/start/route.ts
   - Fetch businessProfile before generating prompt
   - Pass profile to prompt generator
   - Include system prompt in API call

REQUIREMENTS:
- Use TypeScript with proper types
- Include comprehensive error handling
- Add comments explaining critical sections
- Ensure system prompt is included in EVERY Anthropic API call
- Make sure industry context is never lost between messages
- Follow existing code patterns and conventions

TESTING CHECKLIST:
After implementation, this should work:
- [ ] Start Real Estate simulation
- [ ] AI starts as homebuyer talking about houses
- [ ] Send message about houses
- [ ] AI responds still as homebuyer (no persona switch!)
- [ ] Continue conversation for 5+ messages
- [ ] AI NEVER switches to different industry
- [ ] Test with different industries (Mortgage Advisory, Interior Design)
- [ ] All maintain persona consistency

SUCCESS CRITERIA:
- Simulation message endpoint includes tenant + businessProfile in query
- generateSimulationPrompt receives full profile object
- System prompt explicitly tells AI to stay in character
- System prompt is included in every Anthropic API call
- AI maintains consistent persona throughout entire conversation
- No industry/persona switching occurs

IMPORTANT NOTES:
- The bug is caused by missing Prisma relationships in the query
- Without businessProfile, there's no industry context
- System prompt MUST be included in every API call to Anthropic
- The AI needs explicit instructions to not switch personas
- This is a critical bug affecting core product functionality

Please implement all three fixes and provide the complete, corrected code for each file.