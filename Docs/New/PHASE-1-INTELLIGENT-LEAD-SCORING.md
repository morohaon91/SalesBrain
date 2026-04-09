# PHASE 1: INTELLIGENT LEAD SCORING
## Transform Basic AI Scoring into Hybrid Intelligence System

**Duration:** Week 1 (5-7 days)  
**Complexity:** Medium  
**Impact:** 🔥 CRITICAL - Foundation for everything else  
**Current State:** AI scores 0-100 based on "gut feeling"  
**Target State:** Hybrid scoring (rules + AI) using extracted qualification criteria

---

## OBJECTIVES

### Primary Goals:
1. ✅ Wire qualification criteria into AI chat prompts
2. ✅ Implement hybrid scoring (30% rules + 70% AI intelligence)
3. ✅ Add early exit logic for impossible leads
4. ✅ Show scoring breakdown to owner

### Success Metrics:
- Lead scores correlate with actual conversion (validate with owner feedback)
- Early exit rate: 10-15% of conversations (impossible leads)
- Scoring breakdown visible on lead detail page
- Owner can see WHY a lead scored 85/100

---

## CURRENT STATE ANALYSIS

### What Exists Today:

**File:** `/app/api/v1/public/lead-chat/[widgetApiKey]/end/route.ts`

```typescript
// Current AI scoring prompt (lines 131-151)
const analysisPrompt = `You are analyzing a lead conversation transcript.

Transcript:
${transcript}

Return this exact JSON structure:
{
  "leadName": "...",
  "leadEmail": "...",
  "summary": "...",
  "leadScore": <integer 0-100 based on interest level and fit>,
  "qualificationStatus": "QUALIFIED" | "UNQUALIFIED" | "MAYBE" | "UNKNOWN"
}

Scoring guide:
- 80-100 = clearly interested, good fit, ready to move forward
- 50-79 = interested but some uncertainty
- 20-49 = lukewarm or poor fit
- 0-19 = not interested or wrong fit
`;
```

### The Problem:
- ❌ AI scores based on vague "interest level and fit"
- ❌ Doesn't use extracted qualification criteria (green flags, red flags, deal-breakers)
- ❌ No structured scoring logic
- ❌ Owner can't see WHY the score is what it is

---

## TARGET STATE ARCHITECTURE

### Hybrid Scoring Formula:

```
Total Score (0-100) = 
  Budget Fit Score (0-30 points) +       [RULES-BASED]
  Timeline Fit Score (0-20 points) +     [RULES-BASED]
  Engagement Quality (0-25 points) +     [AI-POWERED]
  Value Alignment (0-25 points)          [AI-POWERED]

Temperature Assignment:
  80-100 points = 🔥 HOT
  50-79 points = 🟡 WARM
  0-49 points = ❄️ COLD
```

### Scoring Breakdown Stored:

```typescript
interface ScoringBreakdown {
  totalScore: number;           // 0-100
  temperature: 'hot' | 'warm' | 'cold';
  
  components: {
    budgetFit: {
      score: number;            // 0-30
      reasoning: string;        // "Budget $50k fits range $40k-$65k"
      leadBudget?: number;
      ownerRange?: { min: number; max: number };
    };
    timelineFit: {
      score: number;            // 0-20
      reasoning: string;        // "Timeline 8 weeks is realistic (typical 6-8 weeks)"
      leadTimeline?: string;
      ownerTypical?: string;
    };
    engagement: {
      score: number;            // 0-25
      reasoning: string;        // "Asked 5 detailed questions, showed buying signals"
      signals: string[];        // ["booked meeting", "asked about process"]
    };
    valueAlignment: {
      score: number;            // 0-25
      reasoning: string;        // "Values transparency (matches owner priority)"
      matchedValues: string[];  // ["transparency", "quality over price"]
    };
  };
  
  qualificationAnalysis: {
    greenFlagsMatched: string[];    // ["asked detailed questions"]
    redFlagsDetected: string[];     // ["shopping on price"]
    dealBreakersPresent: string[];  // ["budget below minimum"]
    mustHavesMet: string[];         // ["has permits ready"]
  };
  
  recommendation: {
    action: 'call_immediately' | 'call_soon' | 'email_first' | 'skip';
    reasoning: string;
    talkingPoints: string[];
  };
}
```

---

## IMPLEMENTATION PLAN

### STEP 1: Update Database Schema

Add scoring breakdown field to Conversation model.

**File to modify:** `prisma/schema.prisma`

```prisma
model Conversation {
  // ... existing fields ...
  
  leadScore         Int?
  qualificationStatus String?
  
  // NEW: Add scoring breakdown
  scoringBreakdown  Json?     @db.JsonB
  // Stores full ScoringBreakdown structure
  
  // NEW: Add early exit tracking
  endedEarly        Boolean   @default(false)
  earlyExitReason   String?
}
```

**Migration command:**
```bash
npx prisma migrate dev --name add_scoring_breakdown
```

---

### STEP 2: Extract Owner's "Normal" from Business Profile

Current `BusinessProfile` has qualification criteria but no structured "normal" data.

**Add to extraction logic:**

**File to modify:** `lib/ai/prompts/pattern-extraction.ts`

**New extraction section:**

```typescript
// Add to extraction prompt:

OWNER'S TYPICAL RANGES (extract exact numbers from conversation):

From the conversation, extract the owner's typical:

1. BUDGET RANGES:
   - What budget ranges did owner mention for different services?
   - Extract as: { "serviceName": { "min": number, "max": number } }
   - Example: { "fullKitchen": { "min": 40000, "max": 65000 } }

2. TIMELINE RANGES:
   - What timelines did owner mention?
   - Extract as: { "serviceName": { "min": number, "max": number, "unit": "weeks"|"months" } }
   - Example: { "fullKitchen": { "min": 6, "max": 8, "unit": "weeks" } }

3. SERVICE TYPES:
   - What services does owner offer?
   - Extract as array: ["Kitchen remodels", "Bathroom renovations"]

4. OWNER'S VALUES (what owner cares about):
   - What does owner like in clients? (green flags)
   - What does owner dislike? (red flags)
   - What are owner's priorities? ["quality over price", "transparency"]

OUTPUT STRUCTURE:
{
  "ownerNorms": {
    "typicalBudgets": {
      "fullKitchen": { "min": 40000, "max": 65000 }
    },
    "typicalTimelines": {
      "fullKitchen": { "min": 6, "max": 8, "unit": "weeks" }
    },
    "serviceTypes": ["Kitchen remodels", "Bathroom renovations"]
  },
  "ownerValues": {
    "likesInClients": [
      "asks detailed questions upfront",
      "values transparency",
      "plans ahead"
    ],
    "dislikesInClients": [
      "shopping purely on price",
      "vague expectations",
      "unrealistic timelines"
    ],
    "priorities": ["quality over price", "transparency", "clear communication"]
  }
}
```

**Update BusinessProfile schema:**

```prisma
model BusinessProfile {
  // ... existing fields ...
  
  // NEW: Add owner norms
  ownerNorms        Json?     @db.JsonB
  // Structure: { typicalBudgets, typicalTimelines, serviceTypes }
  
  ownerValues       Json?     @db.JsonB
  // Structure: { likesInClients, dislikesInClients, priorities }
}
```

---

### STEP 3: Build Hybrid Scoring Engine

Create new scoring service that combines rules + AI.

**New file:** `lib/scoring/hybrid-scorer.ts`

```typescript
import { BusinessProfile, Conversation } from '@prisma/client';

interface ScoringBreakdown {
  totalScore: number;
  temperature: 'hot' | 'warm' | 'cold';
  components: {
    budgetFit: { score: number; reasoning: string; leadBudget?: number; ownerRange?: { min: number; max: number } };
    timelineFit: { score: number; reasoning: string; leadTimeline?: string; ownerTypical?: string };
    engagement: { score: number; reasoning: string; signals: string[] };
    valueAlignment: { score: number; reasoning: string; matchedValues: string[] };
  };
  qualificationAnalysis: {
    greenFlagsMatched: string[];
    redFlagsDetected: string[];
    dealBreakersPresent: string[];
    mustHavesMet: string[];
  };
  recommendation: {
    action: 'call_immediately' | 'call_soon' | 'email_first' | 'skip';
    reasoning: string;
    talkingPoints: string[];
  };
}

export async function scoreConversation(
  transcript: string,
  profile: BusinessProfile
): Promise<ScoringBreakdown> {
  
  // PART 1: Extract lead information from transcript using AI
  const leadInfo = await extractLeadInfo(transcript);
  
  // PART 2: Rules-based scoring (60% - deterministic)
  const budgetScore = calculateBudgetFit(
    leadInfo.budget,
    profile.ownerNorms?.typicalBudgets
  );
  
  const timelineScore = calculateTimelineFit(
    leadInfo.timeline,
    profile.ownerNorms?.typicalTimelines
  );
  
  // PART 3: AI-powered scoring (40% - intelligence)
  const aiAnalysis = await analyzeEngagementAndAlignment(
    transcript,
    profile.qualificationCriteria,
    profile.ownerValues
  );
  
  // PART 4: Combine scores
  const totalScore = 
    budgetScore.score +
    timelineScore.score +
    aiAnalysis.engagementScore +
    aiAnalysis.alignmentScore;
  
  // PART 5: Determine temperature
  const temperature = 
    totalScore >= 80 ? 'hot' :
    totalScore >= 50 ? 'warm' :
    'cold';
  
  // PART 6: Generate recommendation
  const recommendation = generateRecommendation(
    totalScore,
    temperature,
    aiAnalysis.qualificationAnalysis
  );
  
  return {
    totalScore,
    temperature,
    components: {
      budgetFit: budgetScore,
      timelineFit: timelineScore,
      engagement: {
        score: aiAnalysis.engagementScore,
        reasoning: aiAnalysis.engagementReasoning,
        signals: aiAnalysis.signals
      },
      valueAlignment: {
        score: aiAnalysis.alignmentScore,
        reasoning: aiAnalysis.alignmentReasoning,
        matchedValues: aiAnalysis.matchedValues
      }
    },
    qualificationAnalysis: aiAnalysis.qualificationAnalysis,
    recommendation
  };
}

// ============================================================================
// RULES-BASED SCORING FUNCTIONS
// ============================================================================

function calculateBudgetFit(
  leadBudget: number | null,
  ownerBudgets: any
): { score: number; reasoning: string; leadBudget?: number; ownerRange?: { min: number; max: number } } {
  
  if (!leadBudget) {
    return {
      score: 15, // Neutral - budget not discussed
      reasoning: "Budget not mentioned in conversation"
    };
  }
  
  // Get owner's typical range (try to match service type, or use first available)
  const ownerRange = ownerBudgets?.fullKitchen || Object.values(ownerBudgets || {})[0];
  
  if (!ownerRange) {
    return {
      score: 15,
      reasoning: "Owner's typical budget range not defined",
      leadBudget
    };
  }
  
  const { min, max } = ownerRange;
  
  // Scoring logic:
  // - Perfect fit (within range): 30 points
  // - Close fit (10% below min or above max): 25 points
  // - Moderate fit (20% below min or above max): 20 points
  // - Poor fit (30% below min): 10 points
  // - Deal-breaker (50%+ below min): 0 points
  
  if (leadBudget >= min && leadBudget <= max) {
    return {
      score: 30,
      reasoning: `Budget $${leadBudget.toLocaleString()} fits perfectly within range $${min.toLocaleString()}-$${max.toLocaleString()}`,
      leadBudget,
      ownerRange: { min, max }
    };
  }
  
  const belowMinPercent = ((min - leadBudget) / min) * 100;
  const aboveMaxPercent = ((leadBudget - max) / max) * 100;
  
  if (leadBudget < min) {
    if (belowMinPercent <= 10) {
      return {
        score: 25,
        reasoning: `Budget $${leadBudget.toLocaleString()} is slightly below range (${belowMinPercent.toFixed(0)}% below minimum)`,
        leadBudget,
        ownerRange: { min, max }
      };
    } else if (belowMinPercent <= 20) {
      return {
        score: 20,
        reasoning: `Budget $${leadBudget.toLocaleString()} is below range (${belowMinPercent.toFixed(0)}% below minimum)`,
        leadBudget,
        ownerRange: { min, max }
      };
    } else if (belowMinPercent <= 30) {
      return {
        score: 10,
        reasoning: `Budget $${leadBudget.toLocaleString()} is significantly below range (${belowMinPercent.toFixed(0)}% below minimum)`,
        leadBudget,
        ownerRange: { min, max }
      };
    } else {
      return {
        score: 0,
        reasoning: `Budget $${leadBudget.toLocaleString()} is way below minimum (${belowMinPercent.toFixed(0)}% below) - likely deal-breaker`,
        leadBudget,
        ownerRange: { min, max }
      };
    }
  }
  
  // Above max
  if (aboveMaxPercent <= 20) {
    return {
      score: 28,
      reasoning: `Budget $${leadBudget.toLocaleString()} is above typical range (${aboveMaxPercent.toFixed(0)}% above) - excellent!`,
      leadBudget,
      ownerRange: { min, max }
    };
  }
  
  return {
    score: 25,
    reasoning: `Budget $${leadBudget.toLocaleString()} is well above typical range`,
    leadBudget,
    ownerRange: { min, max }
  };
}

function calculateTimelineFit(
  leadTimeline: string | null,
  ownerTimelines: any
): { score: number; reasoning: string; leadTimeline?: string; ownerTypical?: string } {
  
  if (!leadTimeline) {
    return {
      score: 10,
      reasoning: "Timeline not discussed"
    };
  }
  
  const ownerRange = ownerTimelines?.fullKitchen || Object.values(ownerTimelines || {})[0];
  
  if (!ownerRange) {
    return {
      score: 10,
      reasoning: "Owner's typical timeline not defined",
      leadTimeline
    };
  }
  
  const { min, max, unit } = ownerRange;
  const ownerTypical = `${min}-${max} ${unit}`;
  
  // Extract number from lead timeline (simple regex)
  const leadWeeks = extractWeeksFromTimeline(leadTimeline);
  
  if (!leadWeeks) {
    return {
      score: 10,
      reasoning: `Timeline mentioned: "${leadTimeline}" but couldn't parse`,
      leadTimeline,
      ownerTypical
    };
  }
  
  // Convert owner range to weeks if needed
  const minWeeks = unit === 'months' ? min * 4 : min;
  const maxWeeks = unit === 'months' ? max * 4 : max;
  
  if (leadWeeks >= minWeeks && leadWeeks <= maxWeeks) {
    return {
      score: 20,
      reasoning: `Timeline ${leadWeeks} weeks is realistic (typical ${minWeeks}-${maxWeeks} weeks)`,
      leadTimeline,
      ownerTypical
    };
  }
  
  if (leadWeeks < minWeeks) {
    const rushPercent = ((minWeeks - leadWeeks) / minWeeks) * 100;
    if (rushPercent <= 20) {
      return {
        score: 15,
        reasoning: `Timeline ${leadWeeks} weeks is slightly rushed (typical ${minWeeks}-${maxWeeks} weeks)`,
        leadTimeline,
        ownerTypical
      };
    } else {
      return {
        score: 5,
        reasoning: `Timeline ${leadWeeks} weeks is unrealistic (typical ${minWeeks}-${maxWeeks} weeks)`,
        leadTimeline,
        ownerTypical
      };
    }
  }
  
  // Longer timeline is usually OK
  return {
    score: 18,
    reasoning: `Timeline ${leadWeeks} weeks is flexible (typical ${minWeeks}-${maxWeeks} weeks)`,
    leadTimeline,
    ownerTypical
  };
}

function extractWeeksFromTimeline(timeline: string): number | null {
  const lowerTimeline = timeline.toLowerCase();
  
  // Match patterns like "8 weeks", "2 months", "3-4 weeks"
  const weeksMatch = lowerTimeline.match(/(\d+)[\s-]*weeks?/);
  if (weeksMatch) {
    return parseInt(weeksMatch[1]);
  }
  
  const monthsMatch = lowerTimeline.match(/(\d+)[\s-]*months?/);
  if (monthsMatch) {
    return parseInt(monthsMatch[1]) * 4;
  }
  
  return null;
}

// ============================================================================
// AI-POWERED SCORING FUNCTIONS
// ============================================================================

async function extractLeadInfo(transcript: string): Promise<{
  budget: number | null;
  timeline: string | null;
  projectType: string | null;
}> {
  
  const extractionPrompt = `Extract lead information from this conversation transcript.

Transcript:
${transcript}

Extract:
1. Budget (if mentioned) - return as number or null
2. Timeline (if mentioned) - return as string or null
3. Project type (if mentioned) - return as string or null

Return JSON only:
{
  "budget": number | null,
  "timeline": string | null,
  "projectType": string | null
}`;

  const response = await createChatCompletion(
    [{ role: 'user', content: extractionPrompt }],
    'You are a precise data extraction assistant. Return only valid JSON.',
    { temperature: 0.1, maxTokens: 200 }
  );
  
  return JSON.parse(response);
}

async function analyzeEngagementAndAlignment(
  transcript: string,
  qualificationCriteria: any,
  ownerValues: any
): Promise<{
  engagementScore: number;
  engagementReasoning: string;
  signals: string[];
  alignmentScore: number;
  alignmentReasoning: string;
  matchedValues: string[];
  qualificationAnalysis: {
    greenFlagsMatched: string[];
    redFlagsDetected: string[];
    dealBreakersPresent: string[];
    mustHavesMet: string[];
  };
}> {
  
  const analysisPrompt = `Analyze this lead conversation for engagement quality and value alignment.

Transcript:
${transcript}

Owner's Qualification Criteria:
${JSON.stringify(qualificationCriteria, null, 2)}

Owner's Values:
${JSON.stringify(ownerValues, null, 2)}

Analyze:

1. ENGAGEMENT QUALITY (0-25 points):
   - Did lead ask thoughtful questions? (+5)
   - Did lead show buying signals (ready to move forward)? (+5)
   - Did lead book a meeting/next step? (+10)
   - How engaged was the conversation? (+5)
   
2. VALUE ALIGNMENT (0-25 points):
   - Which of owner's values did lead demonstrate?
   - Which green flags were matched?
   - Which red flags were detected?
   - Were any deal-breakers present?
   
Return JSON:
{
  "engagementScore": number (0-25),
  "engagementReasoning": "explanation of score",
  "signals": ["booked meeting", "asked about process", etc],
  "alignmentScore": number (0-25),
  "alignmentReasoning": "explanation of alignment",
  "matchedValues": ["transparency", "quality focus", etc],
  "qualificationAnalysis": {
    "greenFlagsMatched": ["asked detailed questions upfront"],
    "redFlagsDetected": ["shopping on price"],
    "dealBreakersPresent": [],
    "mustHavesMet": ["has permits ready"]
  }
}`;

  const response = await createChatCompletion(
    [{ role: 'user', content: analysisPrompt }],
    'You are an expert sales analyst. Analyze conversations and return precise JSON.',
    { temperature: 0.2, maxTokens: 600 }
  );
  
  return JSON.parse(response);
}

function generateRecommendation(
  totalScore: number,
  temperature: string,
  qualificationAnalysis: any
): {
  action: 'call_immediately' | 'call_soon' | 'email_first' | 'skip';
  reasoning: string;
  talkingPoints: string[];
} {
  
  const { greenFlagsMatched, redFlagsDetected, dealBreakersPresent } = qualificationAnalysis;
  
  // Deal-breakers present = skip
  if (dealBreakersPresent.length > 0) {
    return {
      action: 'skip',
      reasoning: `Deal-breakers detected: ${dealBreakersPresent.join(', ')}`,
      talkingPoints: []
    };
  }
  
  // Hot lead = call immediately
  if (temperature === 'hot') {
    return {
      action: 'call_immediately',
      reasoning: `High score (${totalScore}/100) with strong green flags`,
      talkingPoints: [
        ...greenFlagsMatched.map(flag => `Lead showed: ${flag}`),
        'Lead is ready to move forward',
        'Strike while interest is high'
      ]
    };
  }
  
  // Warm lead with more green than red = call soon
  if (temperature === 'warm' && greenFlagsMatched.length > redFlagsDetected.length) {
    return {
      action: 'call_soon',
      reasoning: `Good potential (${totalScore}/100) but some uncertainty`,
      talkingPoints: [
        ...greenFlagsMatched.map(flag => `Positive: ${flag}`),
        ...redFlagsDetected.map(flag => `Address: ${flag}`)
      ]
    };
  }
  
  // Warm lead with red flags = email first
  if (temperature === 'warm') {
    return {
      action: 'email_first',
      reasoning: `Mixed signals (${totalScore}/100) - nurture via email first`,
      talkingPoints: [
        ...redFlagsDetected.map(flag => `Concern to address: ${flag}`),
        'Send educational content',
        'Build trust before calling'
      ]
    };
  }
  
  // Cold lead = skip
  return {
    action: 'skip',
    reasoning: `Low score (${totalScore}/100) - not a good fit`,
    talkingPoints: []
  };
}
```

---

### STEP 4: Implement Early Exit Logic

Add real-time COLD detection during conversation to end early.

**File to modify:** `/app/api/v1/public/lead-chat/[widgetApiKey]/message/route.ts`

Add after AI response generation (around line 98):

```typescript
// After AI responds, check if we should end conversation early
const shouldExitEarly = await checkForEarlyExit(
  [...messages, userMessage, { role: 'assistant', content: aiResponse }],
  profile
);

if (shouldExitEarly.exit) {
  // Update conversation as ended early
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status: 'ENDED',
      endedEarly: true,
      earlyExitReason: shouldExitEarly.reason
    }
  });
  
  // Return special response indicating conversation is ending
  return NextResponse.json({
    response: shouldExitEarly.politeMessage,
    conversationEnded: true,
    reason: shouldExitEarly.reason
  });
}
```

**New function:** `lib/scoring/early-exit-detector.ts`

```typescript
export async function checkForEarlyExit(
  messages: Array<{ role: string; content: string }>,
  profile: BusinessProfile
): Promise<{
  exit: boolean;
  reason?: string;
  politeMessage?: string;
}> {
  
  // Only check after lead has sent at least 2 messages
  const leadMessages = messages.filter(m => m.role === 'user');
  if (leadMessages.length < 2) {
    return { exit: false };
  }
  
  const lastFewMessages = messages.slice(-6); // Last 3 exchanges
  const transcript = lastFewMessages.map(m => `${m.role}: ${m.content}`).join('\n');
  
  const detectionPrompt = `Analyze this conversation for COLD signals (impossible fit).

Conversation:
${transcript}

Owner's Typical Ranges:
${JSON.stringify(profile.ownerNorms, null, 2)}

Owner's Deal-Breakers:
${JSON.stringify(profile.qualificationCriteria?.dealBreakers, null, 2)}

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
}

If shouldExit=true, also suggest a polite exit message that:
- Doesn't reject harshly
- Explains reality professionally
- Suggests alternatives if appropriate
- Thanks them for their time`;

  const response = await createChatCompletion(
    [{ role: 'user', content: detectionPrompt }],
    'You are analyzing lead fit. Be conservative - only exit if clearly impossible.',
    { temperature: 0.2, maxTokens: 300 }
  );
  
  const analysis = JSON.parse(response);
  
  if (analysis.shouldExit && analysis.confidence === 'high') {
    // Generate polite exit message
    const exitMessage = await generatePoliteExit(
      analysis.reason,
      profile
    );
    
    return {
      exit: true,
      reason: analysis.reason,
      politeMessage: exitMessage
    };
  }
  
  return { exit: false };
}

async function generatePoliteExit(
  reason: string,
  profile: BusinessProfile
): Promise<string> {
  
  const prompt = `Generate a polite, professional message to end this conversation.

Reason: ${reason}

Business: ${profile.serviceDescription}
Typical range: ${JSON.stringify(profile.ownerNorms?.typicalBudgets)}

The message should:
- Be warm and professional
- Explain reality honestly
- Suggest alternatives if appropriate (partial service, different contractor)
- Thank them for reaching out
- Not make them feel rejected

Return just the message text, no JSON.`;

  return await createChatCompletion(
    [{ role: 'user', content: prompt }],
    'You are a professional sales assistant. Be empathetic but honest.',
    { temperature: 0.7, maxTokens: 200 }
  );
}
```

---

### STEP 5: Update /end Endpoint to Use Hybrid Scoring

**File to modify:** `/app/api/v1/public/lead-chat/[widgetApiKey]/end/route.ts`

Replace current scoring logic (lines 80-145) with:

```typescript
import { scoreConversation } from '@/lib/scoring/hybrid-scorer';

// ... existing code ...

// Line 80: Replace entire analysis block with hybrid scorer
const scoringBreakdown = await scoreConversation(transcript, profile);

// Extract for backward compatibility
const leadScore = scoringBreakdown.totalScore;
const qualificationStatus = 
  scoringBreakdown.temperature === 'hot' ? 'QUALIFIED' :
  scoringBreakdown.temperature === 'warm' ? 'MAYBE' :
  'UNQUALIFIED';

// Try to extract name/email (keep existing logic)
const basicInfo = await extractBasicInfo(transcript);

// Update conversation with full scoring breakdown
await prisma.conversation.update({
  where: { id: conversationId },
  data: {
    status: 'ENDED',
    leadScore,
    qualificationStatus,
    scoringBreakdown, // NEW: Store full breakdown
    summary: `${basicInfo.summary}\n\nScore: ${leadScore}/100 (${scoringBreakdown.temperature.toUpperCase()})`,
    keyTopics: scoringBreakdown.qualificationAnalysis.greenFlagsMatched
  }
});

// ... rest of endpoint logic ...
```

---

### STEP 6: Update UI to Show Scoring Breakdown

**File to modify:** `/app/(dashboard)/leads/[id]/page.tsx`

Add scoring breakdown section:

```typescript
// After lead details, add scoring breakdown

{conversation?.scoringBreakdown && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold mb-4">Scoring Breakdown</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Budget Fit */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Budget Fit</span>
          <span className="text-2xl font-bold">
            {conversation.scoringBreakdown.components.budgetFit.score}/30
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {conversation.scoringBreakdown.components.budgetFit.reasoning}
        </p>
        {conversation.scoringBreakdown.components.budgetFit.leadBudget && (
          <div className="mt-2 text-xs">
            <div>Lead budget: ${conversation.scoringBreakdown.components.budgetFit.leadBudget.toLocaleString()}</div>
            {conversation.scoringBreakdown.components.budgetFit.ownerRange && (
              <div>
                Typical range: ${conversation.scoringBreakdown.components.budgetFit.ownerRange.min.toLocaleString()} - 
                ${conversation.scoringBreakdown.components.budgetFit.ownerRange.max.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Timeline Fit */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Timeline Fit</span>
          <span className="text-2xl font-bold">
            {conversation.scoringBreakdown.components.timelineFit.score}/20
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {conversation.scoringBreakdown.components.timelineFit.reasoning}
        </p>
      </div>
      
      {/* Engagement Quality */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Engagement Quality</span>
          <span className="text-2xl font-bold">
            {conversation.scoringBreakdown.components.engagement.score}/25
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {conversation.scoringBreakdown.components.engagement.reasoning}
        </p>
        {conversation.scoringBreakdown.components.engagement.signals.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {conversation.scoringBreakdown.components.engagement.signals.map((signal, i) => (
              <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {signal}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Value Alignment */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Value Alignment</span>
          <span className="text-2xl font-bold">
            {conversation.scoringBreakdown.components.valueAlignment.score}/25
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {conversation.scoringBreakdown.components.valueAlignment.reasoning}
        </p>
        {conversation.scoringBreakdown.components.valueAlignment.matchedValues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {conversation.scoringBreakdown.components.valueAlignment.matchedValues.map((value, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
    
    {/* Qualification Analysis */}
    <div className="mt-6 border rounded-lg p-4">
      <h4 className="font-medium mb-3">Qualification Analysis</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conversation.scoringBreakdown.qualificationAnalysis.greenFlagsMatched.length > 0 && (
          <div>
            <p className="text-sm font-medium text-green-700 mb-2">
              ✅ Green Flags Matched ({conversation.scoringBreakdown.qualificationAnalysis.greenFlagsMatched.length})
            </p>
            <ul className="text-sm space-y-1">
              {conversation.scoringBreakdown.qualificationAnalysis.greenFlagsMatched.map((flag, i) => (
                <li key={i} className="text-gray-700">• {flag}</li>
              ))}
            </ul>
          </div>
        )}
        
        {conversation.scoringBreakdown.qualificationAnalysis.redFlagsDetected.length > 0 && (
          <div>
            <p className="text-sm font-medium text-orange-700 mb-2">
              ⚠️ Red Flags Detected ({conversation.scoringBreakdown.qualificationAnalysis.redFlagsDetected.length})
            </p>
            <ul className="text-sm space-y-1">
              {conversation.scoringBreakdown.qualificationAnalysis.redFlagsDetected.map((flag, i) => (
                <li key={i} className="text-gray-700">• {flag}</li>
              ))}
            </ul>
          </div>
        )}
        
        {conversation.scoringBreakdown.qualificationAnalysis.dealBreakersPresent.length > 0 && (
          <div>
            <p className="text-sm font-medium text-red-700 mb-2">
              🚫 Deal-Breakers Present ({conversation.scoringBreakdown.qualificationAnalysis.dealBreakersPresent.length})
            </p>
            <ul className="text-sm space-y-1">
              {conversation.scoringBreakdown.qualificationAnalysis.dealBreakersPresent.map((flag, i) => (
                <li key={i} className="text-gray-700">• {flag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
    
    {/* Recommendation */}
    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
      <h4 className="font-medium mb-2">Recommendation</h4>
      <div className="flex items-center gap-2 mb-2">
        <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
          {conversation.scoringBreakdown.recommendation.action.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-sm text-gray-600">
          {conversation.scoringBreakdown.recommendation.reasoning}
        </span>
      </div>
      
      {conversation.scoringBreakdown.recommendation.talkingPoints.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium mb-2">Talking Points:</p>
          <ul className="text-sm space-y-1">
            {conversation.scoringBreakdown.recommendation.talkingPoints.map((point, i) => (
              <li key={i} className="text-gray-700">• {point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}
```

---

## TESTING PLAN

### Test Case 1: Perfect Fit Lead
**Setup:**
- Lead budget: $50k (owner range: $40k-$65k)
- Lead timeline: 8 weeks (owner typical: 6-8 weeks)
- Lead asks detailed questions
- Lead values transparency

**Expected:**
- Budget score: 30/30
- Timeline score: 20/20
- Engagement: 20-25/25
- Alignment: 20-25/25
- Total: 90-100 (HOT)
- Recommendation: "call_immediately"

---

### Test Case 2: Impossible Lead (Early Exit)
**Setup:**
- Lead budget: $15k (owner minimum: $40k)
- Lead timeline: 2 weeks (owner minimum: 6 weeks)

**Expected:**
- Early exit triggered after 2-3 messages
- Polite exit message generated
- Conversation ends with `endedEarly: true`
- Final score: 0-20 (COLD)
- Recommendation: "skip"

---

### Test Case 3: Warm Lead (Some Concerns)
**Setup:**
- Lead budget: $35k (owner minimum: $40k - slightly below)
- Lead timeline: flexible
- Lead shopping around (red flag)
- But asked good questions (green flag)

**Expected:**
- Budget score: 20-25/30
- Timeline score: 15/20
- Engagement: 15/25
- Alignment: 10/25
- Total: 60-75 (WARM)
- Recommendation: "call_soon" or "email_first"

---

## SUCCESS METRICS

After Phase 1 completion:

### Quantitative:
- ✅ 100% of conversations get scored with breakdown
- ✅ 10-15% early exit rate (impossible leads filtered out)
- ✅ Score accuracy: Owner agrees with score 80%+ of time
- ✅ Scoring breakdown visible on every lead detail page

### Qualitative:
- ✅ Owner can see WHY a lead scored 85/100
- ✅ Owner knows which talking points to use
- ✅ Owner spends less time on bad-fit leads
- ✅ Conversion rate improves (fewer wasted calls)

---

## PHASE 1 COMPLETION CHECKLIST

### Database:
- [ ] Add `scoringBreakdown` field to Conversation
- [ ] Add `endedEarly` and `earlyExitReason` fields
- [ ] Add `ownerNorms` and `ownerValues` to BusinessProfile
- [ ] Run migration

### Extraction:
- [ ] Update pattern extraction prompt to extract owner norms
- [ ] Update extraction to capture owner values
- [ ] Test extraction on existing simulations
- [ ] Verify ownerNorms populated correctly

### Scoring:
- [ ] Create `lib/scoring/hybrid-scorer.ts`
- [ ] Implement budget fit calculator
- [ ] Implement timeline fit calculator
- [ ] Implement AI engagement analyzer
- [ ] Implement AI alignment analyzer
- [ ] Implement recommendation generator
- [ ] Unit test all scoring functions

### Early Exit:
- [ ] Create `lib/scoring/early-exit-detector.ts`
- [ ] Implement COLD detection logic
- [ ] Implement polite exit message generation
- [ ] Add early exit check to message endpoint
- [ ] Test early exit with impossible budgets

### API Updates:
- [ ] Update `/end` endpoint to use hybrid scorer
- [ ] Store full scoring breakdown
- [ ] Test end endpoint with new scoring
- [ ] Verify backward compatibility

### UI Updates:
- [ ] Add scoring breakdown section to lead detail page
- [ ] Show budget/timeline/engagement/alignment scores
- [ ] Show green flags matched
- [ ] Show red flags detected
- [ ] Show recommendation with talking points
- [ ] Test UI with various score scenarios

### Testing:
- [ ] Test perfect fit lead (90-100 score)
- [ ] Test impossible lead (early exit)
- [ ] Test warm lead (50-79 score)
- [ ] Test cold lead (0-49 score)
- [ ] Verify scores make sense
- [ ] Get owner feedback on accuracy

---

## NEXT PHASE PREVIEW

**Phase 2: CLOSER Framework** will build on this intelligent scoring by teaching the AI to have structured, effective conversations that:
- Follow the CLOSER model deliberately
- Use owner's verbatim phrases at each step
- Guide leads through qualification naturally
- Handle objections using owner's exact responses

The hybrid scoring from Phase 1 provides the foundation for Phase 2's structured conversations.

---

**END OF PHASE 1**
