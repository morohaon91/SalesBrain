# Audit Prompt 4: Manual Takeover & Real-Time Monitoring

**Purpose**: Understand if manual takeover is implemented and how real-time monitoring works.

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_04_MANUAL_TAKEOVER.md`

---

# Analysis Request: Manual Takeover & Real-Time Monitoring

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze whether manual takeover and real-time monitoring are implemented per the baseline.

---

## Baseline Requirements

### Dashboard View
- Business owners can view **all active chats** in real-time dashboard
- Conversations can be monitored as they happen

### Manual Takeover
- Business owners can **take over any conversation manually at any time**
- Once takeover occurs, the **AI agent stops completely**
- The owner assumes **full control** of the interaction

---

## Analysis Questions

### Part 1: Real-Time Dashboard

Examine the dashboard:

1. **Does a dashboard for conversations exist?**
   - At what URL?
   - Show the component/page code

2. **What conversations are displayed?**
   - Only active (ongoing) conversations?
   - Or all conversations (past + active)?
   - How are they filtered/sorted?

3. **Is the display truly real-time?**
   - Does it update as lead sends messages?
   - What mechanism updates the view (polling, WebSocket, SSE)?
   - What's the refresh frequency?

4. **What information is shown for each conversation?**
   - Lead name?
   - Lead email?
   - Messages preview?
   - Current conversation stage?
   - Time of last message?
   - Show the component code

5. **Can owner click into a conversation?**
   - Is there a detail view?
   - Full conversation history shown?
   - Show the code

---

### Part 2: Manual Takeover - UI

Examine the user interface for takeover:

1. **Is there a "Take Over" button visible?**
   - On dashboard conversation list?
   - In conversation detail view?
   - Where exactly is it?
   - Show the code

2. **When can takeover happen?**
   - Only when AI is actively responding?
   - Or anytime during conversation?
   - Is there any validation?

3. **What happens when owner clicks takeover?**
   - Is there confirmation dialog?
   - Does UI change immediately?
   - What does owner see after takeover?
   - Show the UI flow

4. **Does lead see notification of takeover?**
   - Does lead see "you're now chatting with owner"?
   - Or is it transparent?
   - Show what lead sees

---

### Part 3: Manual Takeover - Backend Logic

Examine the API/backend implementation:

1. **Is there a takeover endpoint?**
   - What's the endpoint path?
   - POST /api/v1/conversations/[id]/takeover?
   - Show the code

2. **What validation happens on takeover?**
   - Is owner/team member authorized?
   - Can only owner do it, or team members?
   - What if conversation doesn't exist?
   - Show the validation code

3. **What changes when takeover happens?**
   - Conversation status changes (ACTIVE → MANUAL)?
   - Is timestamp recorded (takenOverAt)?
   - Who is recorded as who took over?
   - Show the database update

4. **Is takeover reversible?**
   - Can owner give control back to AI?
   - Or is it permanent once manual?

---

### Part 4: AI Stopping on Takeover

Examine whether AI actually stops:

1. **Does AI stop responding after takeover?**
   - Is there code that checks conversation status?
   - Does message endpoint check if status is MANUAL?
   - Show the validation code

2. **What happens if AI tries to respond after takeover?**
   - Is the response blocked?
   - Error returned?
   - Or does it generate response anyway?

3. **Can there be race conditions?**
   - What if owner takes over while AI is generating response?
   - Is there mutual exclusion?
   - Show thread/concurrency handling

---

### Part 5: Owner Messaging After Takeover

Examine how owner sends messages:

1. **Is there a separate message input after takeover?**
   - Does UI change to show owner can type?
   - Or is it the same interface?
   - Show the code

2. **How are owner messages stored?**
   - In ConversationMessage table?
   - Is role marked as "owner" or "human"?
   - Is there a timestamp?
   - Show the schema

3. **Are owner messages sent to lead differently?**
   - Real-time delivery?
   - Any processing?
   - Show the code path

4. **What information identifies owner message?**
   - Does it say "Owner" vs "AI"?
   - Or is it transparent?
   - Show what lead sees

---

### Part 6: Data Model for Takeover

Examine the database:

1. **Is conversation status tracked?**
   - Enum with ACTIVE, MANUAL, ENDED, etc.?
   - Show the schema

2. **Is takeover metadata stored?**
   - takenOverAt timestamp?
   - takenOverBy (which user)?
   - Reason? (if captured)
   - Show the schema

3. **Is there a separate table for takeover events?**
   - Or just flags in Conversation?

4. **Can history show who was "driving" at each point?**
   - Can owner see "AI was responding until 3:00 PM, then I took over"?

---

### Part 7: Message Flow During Takeover

Trace a complete flow:

1. **Before takeover:**
   - Lead sends message → AI responds → message appears
   - Show code flow

2. **Takeover happens:**
   - Owner clicks "Take Over" → endpoint called → conversation updated
   - Show code flow

3. **After takeover:**
   - Lead sends message → AI does NOT respond (blocked)
   - Lead sees owner's response instead
   - Show code flow

---

### Part 8: Edge Cases & Problems

Examine potential issues:

1. **What if lead sends message while owner is typing?**
   - Does conversation stay synchronized?
   - Any race conditions?

2. **What if AI response is mid-generation during takeover?**
   - Is it cancelled?
   - Or completed and then suppressed?

3. **What if network fails during takeover?**
   - Is takeover rolled back?
   - Or stuck in inconsistent state?

4. **Can two team members both take over simultaneously?**
   - Who wins?
   - Both blocked?
   - Show the logic

---

### Part 9: Real-Time Updates

Examine the live update mechanism:

1. **How does dashboard update in real-time?**
   - Polling (every N seconds)?
   - WebSocket?
   - Server-Sent Events (SSE)?
   - Long polling?
   - Show the implementation

2. **What's the latency?**
   - How quickly does owner see new messages?
   - Is it noticeable lag?

3. **What triggers an update?**
   - Only new messages?
   - Status changes?
   - Score updates?

4. **Is real-time working in current codebase?**
   - Tested and working?
   - Partially implemented?
   - Missing?

---

### Part 10: Notifications for Intervention

Examine whether owner is notified when attention is needed:

1. **Does owner get notified when lead sends message?**
   - In-app notification?
   - Browser notification?
   - Badge count?

2. **Are there alerts for conversation issues?**
   - AI uncertain (needs human input)?
   - Lead seems frustrated?
   - Conversation stalling?

3. **How does owner know conversation needs attention?**
   - Visual indicator on dashboard?
   - Notification?
   - Color change?

---

## Gaps vs. Baseline

Analyze:

1. **Is manual takeover fully implemented?**
   - UI exists? [yes/no]
   - Backend works? [yes/no]
   - AI stops? [yes/no]
   - Tested? [yes/no]

2. **Is real-time dashboard working?**
   - Implemented? [yes/no]
   - Updates correctly? [yes/no]
   - Latency acceptable? [yes/no]

3. **Is it production-ready?**
   - Edge cases handled? [yes/no/partially]
   - Race conditions resolved? [yes/no]

---

## Output Format

Create a document with sections:

### 1. Current Implementation Summary
- Is manual takeover implemented? [yes/no/partial]
- Is real-time monitoring implemented? [yes/no/partial]

### 2. Real-Time Dashboard
- URL: [path]
- Updates via: [polling / WebSocket / SSE / other]
- Latency: [X seconds]
- Components shown: [list]
- Status: [working / broken / missing]

### 3. Manual Takeover UI
- Button location: [code location]
- Visible when: [always / only when AI active / other]
- User experience: [describe flow]
- Code location: [file]
- Status: [working / missing]

### 4. Manual Takeover Backend
- Endpoint: [POST /api/v1/conversations/[id]/takeover]
- Validation: [auth + conversation exists]
- Changes made: [status → MANUAL, timestamp recorded]
- Code location: [file]
- Status: [working / missing]

### 5. AI Stop Mechanism
- Check on AI response: [yes / no]
- Blocks response if MANUAL: [yes / no]
- Code location: [file]
- Race condition handling: [description]
- Status: [safe / vulnerable / missing]

### 6. Data Model
```
Conversation:
  status: Enum (ACTIVE, MANUAL, ENDED, etc.)
  takenOverAt: DateTime?
  takenOverBy: User relationship?
  
ConversationMessage:
  role: "AI" | "owner" | "lead"
  [other fields]
```

### 7. Owner Messaging After Takeover
- Input available: [yes/no]
- Messages stored as: [role = "owner"]
- Delivered to lead: [real-time / batched / other]
- Code location: [file]

### 8. Critical Gaps & Recommendations

**Missing**:
- Manual takeover completely missing → CRITICAL
- Real-time dashboard missing → HIGH

**Broken/Incomplete**:
- [Feature] exists but [specific issue]

**Needs Fixing**:
1. Implement manual takeover (X days)
2. Implement real-time dashboard (Y days)
3. Handle race conditions (Z days)

---

## Success Criteria

This audit is complete when you can:
1. Answer YES/NO to: "Is manual takeover fully implemented?"
2. Answer YES/NO to: "Is real-time dashboard working?"
3. Identify all gaps that prevent MVP launch
4. Provide effort estimates to fix each gap
