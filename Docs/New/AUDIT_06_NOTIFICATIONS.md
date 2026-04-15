# Audit Prompt 6: Notifications

**Purpose**: Understand how owners are notified of important events (Hot leads, urgent messages, etc.).

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_06_NOTIFICATIONS.md`

---

# Analysis Request: Notifications System

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze how the notification system works (or doesn't) for alerting owners of important events.

---

## Baseline Requirements

### Notifications (MVP)
- **In-app notifications only** for MVP
- **Hot leads trigger priority notifications** to owner
- Owner can see unread notification count

### Notifications (Future)
- Email notifications (Phase 2)
- Push notifications (Phase 2)

---

## Analysis Questions

### Part 1: Notification Infrastructure

#### 1.1 Notification Table/Model

1. **Does a Notification model exist?**
   - Show the schema
   - What fields exist?
   - What types of notifications are tracked?

2. **What data is stored per notification?**
   - Type (WARM_LEAD, HOT_LEAD, etc.)?
   - Message/content?
   - Related lead/conversation ID?
   - Read/unread status?
   - Timestamp?
   - Show the exact schema

3. **Is there a relationship from Notification to other entities?**
   - Notification → Lead?
   - Notification → Conversation?
   - Notification → User?

#### 1.2 Notification Types

1. **What notification types exist in code?**
   - List all types (enum, constants, or hard-coded)
   - For each type, what triggers it?

2. **MVP notification types (must have):**
   - Hot lead detected?
   - Conversation ended?
   - Warm lead detected?
   - AI uncertain/needs input?
   - Other?

3. **Are all MVP types implemented?**
   - For each type, is it working or missing?

---

### Part 2: Notification Triggering

#### 2.1 Hot Lead Notification

1. **When a lead is scored as Hot, does a notification trigger?**
   - Yes / No / Partially
   - Show the code that triggers it

2. **What's the flow?**
   ```
   Lead conversation ends → 
   Scoring happens → 
   Score is Hot → 
   Notification created → 
   Owner sees alert?
   ```
   Show the code for each step

3. **Timing:**
   - Is notification created immediately?
   - Or only when owner refreshes dashboard?
   - Any delay?

#### 2.2 Other Event Notifications

1. **What other events trigger notifications?**
   - Conversation ended (any lead)?
   - Warm lead detected?
   - AI couldn't understand?
   - Lead asked to speak to owner?
   - Other?

2. **For each trigger, show:**
   - Event condition
   - Code location
   - Whether it's working

---

### Part 3: In-App Notification Display

#### 3.1 Notification UI

1. **Is there a notification bell/icon on dashboard?**
   - Where is it located?
   - Show the component code
   - Does it show unread count?

2. **Is there a notifications page/list?**
   - URL: [/dashboard/notifications]?
   - Show the component code
   - What's displayed for each notification?

3. **Notification appearance:**
   - Toast notification (popup)?
   - Bell badge?
   - Dedicated page?
   - Combination?

#### 3.2 Notification Content

1. **What does a notification display?**
   - Type: "Hot Lead Detected"
   - Lead name?
   - Lead email?
   - Summary of lead's interest?
   - Link to conversation?
   - Show an example

#### 3.3 Notification Interactions

1. **Can owner click on notification?**
   - Does it take them to the lead/conversation?
   - Show the code

2. **Can owner mark notification as read?**
   - Is there a read/unread status?
   - Can they clear/dismiss?

3. **Can owner delete notifications?**
   - Or do they persist forever?

---

### Part 4: Real-Time Notification Delivery

#### 4.1 How Notifications Reach Owner

1. **How does owner see new notifications?**
   - Polling (refresh every X seconds)?
   - WebSocket?
   - Server-Sent Events (SSE)?
   - Long polling?
   - Show the code

2. **Is notification delivery real-time?**
   - Owner sees notification immediately?
   - Any delay?
   - What's the latency?

3. **Is there a notification queue/worker?**
   - Or notifications created directly?
   - Show the implementation

---

### Part 5: Notification Persistence

#### 5.1 Storage

1. **Are notifications persisted in database?**
   - Yes/No
   - If yes, how long are they kept?
   - Archive/delete old ones?

2. **Can owner see notification history?**
   - All notifications ever sent?
   - Or only recent?
   - How far back?

---

### Part 6: Multi-User Notifications

#### 6.1 Team Member Notifications

1. **If there are multiple team members, who gets notifications?**
   - Only owner?
   - All team members?
   - Configurable?

2. **Can team member assignment affect notifications?**
   - If lead assigned to Team Member A, does only Team Member A get notified?
   - Show the logic

3. **Is there per-user notification settings?**
   - Can user disable certain notifications?
   - Show the settings UI/code

---

### Part 7: Gaps vs. Baseline

Analyze:

1. **Is in-app notification system complete?**
   - Model exists? [yes/no]
   - UI exists? [yes/no]
   - Triggers working? [yes/no/partial]

2. **Hot lead notifications specifically:**
   - Implemented? [yes/no]
   - Working? [yes/no]
   - Tested? [yes/no]

3. **Is notification delivery real-time?**
   - [yes/no]
   - If no, what's the delay?

4. **What's missing:**
   - Notification creation logic?
   - UI to display them?
   - Real-time delivery?
   - Multiple notification types?

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- Notification system status: [working / partial / missing]
- Hot lead notifications: [working / missing]
- Real-time delivery: [working / polling / missing]

### 2. Notification Model/Schema
```
Notification:
  id: String
  tenantId: String
  userId: String
  type: Enum (HOT_LEAD, WARM_LEAD, CONVERSATION_ENDED, etc.)
  title: String
  message: String
  relatedLeadId: String?
  relatedConversationId: String?
  read: Boolean
  createdAt: DateTime
  [other fields]
```

### 3. Notification Types Implemented
- [ ] HOT_LEAD: [implemented / missing]
- [ ] WARM_LEAD: [implemented / missing]
- [ ] CONVERSATION_ENDED: [implemented / missing]
- [ ] AI_UNCERTAIN: [implemented / missing]
- [ ] DAILY_SUMMARY: [implemented / missing]
- [List all actual types in code]

### 4. Triggering Logic
For each type, show:
```
HOT_LEAD:
  Trigger: Score >= 70 AND conversation ends
  Code location: [file]
  Status: [working / missing]
```

### 5. In-App UI
- Notification bell: [location / code]
- Unread count: [yes/no]
- Notifications list page: [URL / code]
- Toast notifications: [yes/no]
- Notification content example: [what owner sees]

### 6. Real-Time Delivery
- Method: [polling / WebSocket / SSE / other]
- Frequency: [every X seconds / real-time]
- Latency: [X ms typical]
- Code location: [file]

### 7. Notification Interactions
- Mark as read: [yes/no]
- Delete: [yes/no]
- Click to view lead: [yes/no]
- Archive: [yes/no]

### 8. Multi-User Support
- Multiple team members get notifications: [yes/no]
- Assignment-based notifications: [yes/no]
- Per-user notification settings: [yes/no]

### 9. Critical Gaps & Recommendations

**Missing**:
- [ ] Notification model doesn't exist
- [ ] No UI to display notifications
- [ ] Hot lead notification trigger missing
- [ ] Real-time delivery not implemented

**Incomplete**:
- [ ] Notification types partially implemented
- [ ] Some triggers working, others not

**Needed for MVP**:
1. Complete notification model (if missing)
2. Hot lead notification trigger
3. Simple in-app UI (toast or badge)
4. Real-time delivery (even basic polling is OK)

**Deferred to Phase 2**:
- [ ] Email notifications
- [ ] Push notifications
- [ ] Advanced notification settings

**Effort to Fix**:
- Missing model: X days
- UI: Y days
- Triggers: Z days
- Real-time: W days

---

## Success Criteria

This audit is complete when you can:
1. Confirm if notification system is implemented or missing
2. State which notification types work and which don't
3. Verify Hot lead notifications are working
4. Identify all gaps preventing MVP launch
