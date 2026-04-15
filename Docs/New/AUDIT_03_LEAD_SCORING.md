# Audit Prompt 3: Lead Scoring & Management

**Purpose**: Understand how leads are scored and managed in the current system vs. the baseline.

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_03_LEAD_SCORING.md`

---

# Analysis Request: Lead Scoring & Management

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze how leads are scored and managed, comparing current implementation to baseline requirements.

---

## Baseline Requirements

### Lead Scoring System
- After each conversation, the AI evaluates the lead
- Three-tier classification: **Cold**, **Warm**, or **Hot**
- Scoring is automatic and happens end-of-conversation

### Lead List & Prioritization
- All leads displayed in a **Leads List**
- **Hot leads trigger priority notifications** to owner
- Business owner can see:
  - Lead's contact info
  - Conversation summary
  - Assigned score
  - Relevant context for follow-up

### Post-Conversation Output
Business owner receives:
- Full conversation summary
- Lead's needs and intentions
- AI-assigned lead score
- Relevant context for follow-up

---

## Analysis Questions

### Part 1: Scoring Algorithm

Examine how leads are scored:

1. **How is a lead classified as Cold/Warm/Hot?**
   - Show the scoring algorithm code
   - What factors determine the score?
   - Is it rule-based or AI-based?
   - What's the exact logic?

2. **When does scoring happen?**
   - After every message?
   - Only at conversation end?
   - On-demand?
   - Show the code that triggers scoring

3. **What metrics are evaluated?**
   - Lead engagement level?
   - Intent signals?
   - Budget/timeline mentions?
   - Objection count?
   - Show which fields are evaluated

4. **What's the scoring range?**
   - Is it 0-100?
   - 0-10?
   - Categorical (Cold/Warm/Hot)?
   - Are there thresholds for each tier?
   - Show exact thresholds

5. **How is score stored?**
   - In Lead model as integer/float?
   - In Conversation model?
   - Both?
   - Show the database schema

---

### Part 2: Cold/Warm/Hot Classification

Examine the tier definitions:

1. **What makes a lead "Cold"?**
   - Score below X?
   - No engagement signals?
   - Show the exact criteria

2. **What makes a lead "Warm"?**
   - Score range X-Y?
   - Specific signals?
   - Show the exact criteria

3. **What makes a lead "Hot"?**
   - Score above X?
   - Multiple intent signals?
   - Budget/timeline mentioned?
   - Show the exact criteria

4. **Is the classification accurate?**
   - Has it been tested?
   - Any false positives/negatives?

---

### Part 3: Lead Detection & Creation

Examine how leads are identified:

1. **How is a lead created?**
   - When someone fills out a contact form?
   - When someone starts a widget chat?
   - Manually by owner?
   - Show the code that creates leads

2. **What lead data is captured?**
   - Name, email, phone?
   - Company?
   - Intent/reason for contact?
   - How much is captured?

3. **Is a lead created per conversation?**
   - Or can one lead have multiple conversations?
   - Show the Lead ↔ Conversation relationship

4. **How is lead identity tracked?**
   - Email dedupe?
   - Phone dedupe?
   - Session tracking?

---

### Part 4: Lead List & Display

Examine how leads are shown to owner:

1. **Is there a Leads dashboard page?**
   - At what URL?
   - Show the code/component

2. **What information is displayed for each lead?**
   - Name, email, phone?
   - Score (Cold/Warm/Hot)?
   - Last contact date?
   - Status?
   - Number of conversations?

3. **Can leads be filtered/sorted?**
   - Filter by score (show me Hot leads)?
   - Sort by most recent?
   - Sort by priority?

4. **Can leads be assigned to team members?**
   - Is there an assignment field?
   - Show the schema

---

### Part 5: Scoring Reliability

Examine how accurate scoring is:

1. **Is scoring validated?**
   - Are there tests for scoring logic?
   - Has it been compared to manual scoring?

2. **Can owner override score?**
   - Can they manually change a lead's score?
   - Or is it AI-determined only?

3. **Is score explanation provided?**
   - Does owner see why a lead is scored as Hot?
   - What reasons are shown?

4. **Are false signals detected?**
   - What stops a spammer from being marked Hot?
   - Any verification?

---

### Part 6: Lead Qualification Analysis

Examine what happens after scoring:

1. **Is there a qualification summary?**
   - Does owner see why lead is qualified/not qualified?
   - What summary text is generated?
   - Show an example

2. **What context is provided for follow-up?**
   - Lead's stated needs?
   - Budget/timeline mentioned?
   - Objections raised?
   - Next steps suggested?

3. **Where is this information stored?**
   - In Lead model as text?
   - In Conversation model?
   - Separate summary table?

---

### Part 7: Notifications for Hot Leads

Examine how Hot leads trigger alerts:

1. **Are Hot leads notified?**
   - Does owner get immediate notification?
   - In-app only?
   - Email?
   - Show the notification code

2. **When is notification sent?**
   - As soon as lead scored Hot?
   - End of conversation?
   - Manual trigger?

3. **What does the notification say?**
   - Just that a Hot lead arrived?
   - Or does it include context?
   - Show example notification text

---

### Part 8: Conversation-to-Lead Linking

Examine the data relationship:

1. **Is each conversation linked to a lead?**
   - Is there a Lead_ID in Conversation table?
   - Show the schema

2. **Can one lead have multiple conversations?**
   - Yes or no?
   - If yes, how is this handled?

3. **How is conversation ending detected?**
   - Manual end by owner?
   - Automatic timeout?
   - Lead says "goodbye"?
   - Show the code

4. **What triggers the score update?**
   - Conversation creation?
   - Conversation end?
   - Both?

---

### Part 9: Lead Status Tracking

Examine lead lifecycle:

1. **What statuses can a lead have?**
   - New / Contacted / Qualified / Lost?
   - Or different statuses?
   - Show the enum

2. **Who/what changes the status?**
   - Owner manually changes?
   - AI changes on scoring?
   - Automatic on conversation?

3. **Is status independent of score?**
   - Can a lead be Hot but Contacted?
   - Can a lead be Cold and Qualified?

---

### Part 10: Lead Data Model

Show the complete Lead model:

1. **What fields exist in Lead table?**
   - List all fields
   - Data types
   - Relationships to other models

2. **What's optional vs. required?**
   - Which fields must be filled?
   - Which can be empty?

3. **What's missing from baseline?**
   - Compare to baseline lead definition

---

## Gaps vs. Baseline

Analyze:

1. **Is scoring fully implemented?**
   - Algorithm exists? [yes/no]
   - Cold/Warm/Hot working? [yes/no]
   - Accurate? [yes/no/untested]

2. **Is lead list functional?**
   - Dashboard exists? [yes/no]
   - Filtering/sorting? [yes/no]
   - Real data shown? [yes/no]

3. **Are Hot leads notified?**
   - Notification triggers? [yes/no]
   - Tested? [yes/no]

4. **Is conversation-to-lead linking correct?**
   - Multiple conversations per lead? [yes/no]
   - Score updated correctly? [yes/no]

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- High-level overview

### 2. Scoring Algorithm
- How it works: [description + code location]
- Factors evaluated: [list]
- Thresholds: [Cold: 0-X, Warm: X-Y, Hot: Y-100]
- When triggered: [per message / end of conversation / both]
- Status: [working / needs adjustment / missing]

### 3. Cold/Warm/Hot Criteria
- Cold: [exact criteria from code]
- Warm: [exact criteria from code]
- Hot: [exact criteria from code]

### 4. Lead Model
```
Show the complete schema:
id: String
email: String
name: String
phone: String
status: Enum
qualificationScore: Int
conversation: Relationship
createdAt: DateTime
[other fields]
```

### 5. Lead List
- URL: [path]
- Implemented: [yes/no]
- Filters: [list available]
- Sorting: [list available]

### 6. Hot Lead Notifications
- Implemented: [yes/no]
- Trigger: [condition]
- Channel: [in-app / email / both]
- Code location: [file]

### 7. Conversation-Lead Linking
- One lead → many conversations: [yes/no]
- Relationship: [show database constraint]
- Score update timing: [when does it happen]

### 8. Critical Gaps & Recommendations

**Missing**:
- [ ] Feature A
- [ ] Feature B

**Broken**:
- [ ] Feature X (reason)

**Needs Refinement**:
- [ ] Scoring accuracy
- [ ] Notification timing

**Effort to Fix**:
- Missing: X days
- Broken: Y days
- Refinement: Z days

---

## Success Criteria

This audit is complete when you can:
1. Show the exact scoring algorithm
2. Explain how Cold/Warm/Hot are determined
3. Verify Hot leads trigger notifications
4. Confirm conversation-lead relationship is correct
5. Identify all gaps from baseline
