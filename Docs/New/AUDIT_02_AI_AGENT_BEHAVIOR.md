# Audit Prompt 2: AI Agent Behavior & CLOSER Methodology

**Purpose**: Understand how the AI agent currently behaves and whether the CLOSER methodology is actually implemented.

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_02_AI_AGENT_BEHAVIOR.md`

---

# Analysis Request: AI Agent Behavior & CLOSER Methodology

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze how the AI agent behaves when chatting with leads, specifically whether the CLOSER methodology is actually implemented vs. just documented.

---

## Baseline Requirements

### CLOSER Methodology Framework

The AI agent should guide conversations through these stages:

1. **C – Clarify**: Understand why the lead reached out now
2. **L – Label**: Clearly define the problem so the lead resonates with it
3. **O – Overview the pain**: Identify challenges and past attempts
4. **S – Sell the outcome**: Focus on desired results, not just solutions
5. **E – Explain away concerns**: Identify and address objections
6. **R – Reinforce the decision**: Guide toward booking a call and set expectations

### Agent Context

- AI represents the business using a defined identity: "The team of [Business Name]"
- AI uses the owner's **extracted communication style, tone, and phrasing**
- AI never engages in pricing negotiations, handles contracts, or makes commitments
- Interactions remain **short and efficient** to maintain lead engagement

---

## Analysis Questions

### Part 1: Owner Profile in AI Context

Examine how owner's profile is used in AI calls:

1. **Is owner profile retrieved for each lead message?**
   - Show the code that retrieves BusinessProfile
   - When is it retrieved (per message? per conversation? once at start?)
   - What fields are included?

2. **Is the owner profile sent to Claude API?**
   - Show the system prompt that's sent to Claude
   - Does it include owner's communication style?
   - Does it include owner's tone/phrasing?
   - Does it include owner's business info?

3. **How is the profile formatted for the AI?**
   - Is it sent as plain text?
   - Is it structured (JSON, formatted string)?
   - Show an example of what Claude actually receives

4. **What happens if profile is incomplete?**
   - Does the AI still respond?
   - Or is there fallback behavior?

---

### Part 2: CLOSER Stage Implementation

Examine whether CLOSER stages are actually tracked and enforced:

1. **Are CLOSER stages tracked in conversations?**
   - Is there a `currentPhase` or `stage` field in Conversation model?
   - Does it store which CLOSER stage the conversation is in?
   - Show the database schema

2. **Does the AI know which stage it's in?**
   - Is the current stage passed to Claude API?
   - Does the system prompt instruct Claude about current stage?
   - Show the system prompt that mentions CLOSER

3. **Does stage progression happen automatically?**
   - Does the system track when to move from Clarify → Label?
   - Or does the AI just follow CLOSER loosely in the prompt?
   - Is there validation that prevents skipping stages?

4. **Is there logic to detect stage progression?**
   - Show code that determines current stage
   - What triggers moving to the next stage?

---

### Part 3: System Prompt Structure

Examine what the AI is actually told:

1. **What does the system prompt look like?**
   - Show the actual system prompt (not just structure, actual text)
   - Is CLOSER mentioned in the prompt?
   - How detailed is the CLOSER guidance?

2. **Is there a prompt template?**
   - Where is it defined (file location)?
   - Can it be customized per tenant?

3. **What business context is included?**
   - Company name?
   - Services offered?
   - Pricing?
   - Team size?
   - Typical timelines?

4. **What conversation guidelines are included?**
   - Message length expectations?
   - When to suggest handoff?
   - How to handle objections?

---

### Part 4: Lead Message Processing

Examine how incoming lead messages trigger AI responses:

1. **When a lead sends a message, what happens?**
   - Trace the code path: message arrives → AI response generated
   - What context is loaded (history, profile, etc.)?
   - What is sent to Claude API?

2. **How much conversation history is included?**
   - Is the entire conversation history sent?
   - Or just the last N messages?
   - Is there a context window limit?

3. **How is conversation state managed?**
   - After AI responds, what's updated in database?
   - Is stage tracked?
   - Are objections logged?

---

### Part 5: Handoff Detection

Examine when the AI suggests booking a call:

1. **Does the system detect when to suggest handoff?**
   - Is there code for handoff triggers?
   - What conditions trigger a handoff suggestion?
   - Show the logic

2. **When is handoff suggested?**
   - After N messages?
   - When lead seems qualified?
   - When lead expresses buying signal?

3. **What does a handoff suggestion look like?**
   - Show an example of what the AI says
   - Is it part of the CLOSER "Reinforce" stage?

---

### Part 6: Owner Communication Style Usage

Examine how extracted patterns are actually used:

1. **Where are communication patterns stored?**
   - In BusinessProfile.communicationStyle?
   - What format (string, JSON, structured)?
   - Show the schema

2. **How are patterns used in responses?**
   - Are they parsed and applied?
   - Or just included as text in system prompt?
   - Does Claude actually follow the patterns?

3. **What specific patterns are extracted?**
   - Tone/voice?
   - Frequently used phrases?
   - Objection-handling style?
   - Pricing discussion approach?

4. **Is there validation that AI follows owner style?**
   - Any mechanism to check AI matches owner?
   - Or is it just hoped that Claude follows the prompt?

---

### Part 7: Objection Handling

Examine how objections are managed:

1. **Are objections detected?**
   - Is there code to identify objections in lead messages?
   - What objections are tracked?
   - Where are they stored?

2. **How does AI handle objections?**
   - Is there specific logic in system prompt?
   - Or does Claude just respond naturally?
   - Are owner's historical objection-handling strategies included?

3. **Is there an objection tracker?**
   - Does the system learn which objections are common?
   - Is this data used in follow-ups?

---

### Part 8: Conversation Summary & Analysis

Examine what happens after a conversation ends:

1. **What's generated after conversation ends?**
   - Conversation summary?
   - Lead qualification assessment?
   - Objections raised?
   - Next steps suggested?

2. **Who creates this summary?**
   - Does Claude generate it?
   - Is it rule-based?
   - What information is included?

3. **Where is summary stored?**
   - In Conversation model?
   - In Lead model?
   - Show the database storage

---

### Part 9: Gaps vs. Baseline

Based on analysis, identify:

1. **CLOSER Implementation**
   - Is CLOSER actually guiding responses?
   - Or is it just documented?
   - Is stage tracking implemented?
   - Is stage progression enforced?

2. **Owner Profile Usage**
   - Is profile actually sent to Claude every message?
   - Or is it only loaded once?
   - Does Claude actually follow the style?

3. **Conversation Context**
   - How much history is sent to Claude?
   - Is there context window management?

4. **Critical Gaps**
   - What's completely missing?
   - What needs to be fixed?

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- High-level overview of AI agent behavior

### 2. Owner Profile Usage
- How profile is retrieved: [description + code location]
- What's sent to Claude: [code snippet of system prompt]
- Frequency: [per message / per conversation / once]
- Status: [working / partial / missing]

### 3. CLOSER Implementation
- Stage tracking: [yes/no/partial + code location]
- Stage progression: [automatic / manual / none + logic]
- Prompt guidance: [show actual prompt text]
- Status: [fully implemented / soft guidance / documented only]

### 4. System Prompt
- Template location: [file path]
- Full text: [paste the actual prompt]
- Updates per tenant: [yes/no]

### 5. Message Processing Flow
- Sequence: [incoming message → load context → call Claude → store response]
- Context loaded: [history, profile, stage, other]
- Claude receives: [what exactly is in the API call]

### 6. Handoff Detection
- Implemented: [yes/no]
- Triggers: [list conditions]
- Code location: [file path]

### 7. Objection Handling
- Tracking: [yes/no]
- AI response: [Claude follows prompt / specific logic]
- Historical use: [yes/no]

### 8. Conversation Summary
- Generated: [yes/no]
- What's included: [list items]
- Storage: [database location]

### 9. Critical Gaps & Recommendations

**Missing**:
- Owner profile not sent to Claude → CRITICAL FIX
- CLOSER stages not tracked → HIGH PRIORITY
- Handoff detection missing → MEDIUM PRIORITY

**Incomplete**:
- [Feature] is partially implemented → needs completion

**Required Fixes**:
1. Ensure owner profile in system prompt (CRITICAL)
2. Implement CLOSER stage tracking (HIGH)
3. Add handoff detection (MEDIUM)

**Effort Estimate**:
- Critical fixes: X days
- High priority: Y days
- Medium priority: Z days

---

## Success Criteria

This audit is complete when you can:
1. Show the exact system prompt that Claude receives
2. Confirm whether owner profile is included in every message
3. Determine if CLOSER is actually enforced or just suggested
4. Identify all gaps between baseline and current implementation
