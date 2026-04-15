# Audit Prompt 5: Communication Channels

**Purpose**: Understand how leads enter the system (widget, WhatsApp, etc.) and if they work correctly.

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_05_COMMUNICATION_CHANNELS.md`

---

# Analysis Request: Communication Channels Implementation

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze how leads interact with the system through different channels (website chat widget, WhatsApp, etc.).

---

## Baseline Requirements

### Communication Channels (MVP)
1. **Website Chat Widget** – Embedded on business owner's website
   - Must be embeddable on external sites
   - Must be functional and deliver messages
   - Must be the primary MVP channel

### Communication Channels (Future)
2. **WhatsApp** – Future phase, not MVP
3. **Phone Calls** – Future phase, not MVP

---

## Analysis Questions

### Part 1: Website Chat Widget

#### 1.1 Widget Existence & Location

1. **Does a chat widget exist?**
   - Where is the code (file path)?
   - Is it a React component, vanilla JS, iframe?

2. **Is widget embeddable on external websites?**
   - Can it be dropped on any website?
   - How does integration work (script tag, iframe, etc.)?
   - Show the embedding code/instructions

3. **Is widget public/accessible?**
   - What's the URL to load the widget?
   - Does it use a widgetApiKey or similar authentication?
   - Show the public route

#### 1.2 Widget Functionality

1. **What can a lead do in the widget?**
   - Can they type messages?
   - Can they see conversation history?
   - Can they see AI's responses in real-time?

2. **What information is collected from lead?**
   - Name, email, phone?
   - Company name?
   - Reason for contact?
   - When is this data collected (before chat, during, after)?

3. **What does the widget UI look like?**
   - Show screenshot or component code
   - Is it branded for the business owner?
   - Can owner customize colors/text?

#### 1.3 Widget Message Flow

1. **When lead types a message, what happens?**
   - Is it sent to backend?
   - Does it trigger AI response?
   - How long does response take (show timing)?

2. **How are messages delivered to lead?**
   - Real-time updates?
   - Polling?
   - WebSocket?
   - What's the latency?

3. **Are messages persisted?**
   - Stored in database?
   - Associated with a lead?
   - Associated with a conversation?

#### 1.4 Widget Technical Implementation

1. **What API does widget call?**
   - Show the endpoint(s) used
   - POST /api/v1/public/lead-chat/[widgetApiKey]/message?
   - What's the request/response format?

2. **How is the widget authenticated?**
   - Does it use widgetApiKey?
   - How is the key secured?
   - Can anyone get the key and spam the endpoint?

3. **Is there rate limiting on widget?**
   - Can someone spam messages?
   - Is there protection?

4. **Widget styling/customization**:
   - Can owner customize widget?
   - Colors, fonts, company branding?
   - Or is it one-size-fits-all?

#### 1.5 Widget Reliability

1. **Is widget production-ready?**
   - Tested on multiple browsers?
   - Mobile friendly?
   - Any known issues?

2. **Error handling**:
   - What if API fails?
   - Does user see error?
   - Can they still send messages?

3. **Conversation persistence**:
   - If page reloads, does conversation continue?
   - Or starts fresh?

---

### Part 2: WhatsApp Integration

#### 2.1 WhatsApp Status

1. **Is WhatsApp integration implemented?**
   - Yes / No / Partially

2. **If implemented, what's the status?**
   - Fully working?
   - Stub/placeholder code?
   - Show the code

3. **If not implemented, where is it in roadmap?**
   - Is it Phase 2?
   - Is it deferred post-MVP?

#### 2.2 WhatsApp Architecture (if implemented)

1. **How does WhatsApp integration work?**
   - Owner provides phone number?
   - QR code to scan?
   - API credentials?

2. **Message routing:**
   - Messages come in to WhatsApp → backend routes → conversation?
   - How is lead identified (phone number)?

3. **How many leads can use WhatsApp simultaneously?**
   - Can multiple leads chat at same time?

---

### Part 3: Lead Creation & Session Management

#### 3.1 Lead Creation from Widget

1. **How is a lead created when someone uses widget?**
   - Automatically on first message?
   - After collecting info?
   - Show the code flow

2. **Is a session created?**
   - Is there a sessionId?
   - How long does session last?
   - Can same person have multiple sessions?

3. **How is returning visitor detected?**
   - By email?
   - By IP?
   - By browser cookie/localStorage?

#### 3.2 Conversation Association

1. **How is conversation linked to lead?**
   - One lead → one conversation?
   - One lead → multiple conversations?
   - Show the schema

2. **Is conversation status tracked?**
   - ACTIVE, ENDED, etc.?

---

### Part 4: Widget Configuration per Tenant

#### 4.1 Customization Options

1. **Can each owner customize their widget?**
   - Different colors/fonts per owner?
   - Different greeting message?
   - Show the customization UI/code

2. **Does widget know which owner it belongs to?**
   - Via widgetApiKey?
   - Via domain?
   - Show how tenant is identified

3. **Can owner enable/disable widget?**
   - Toggle on/off?
   - Or always live?

---

### Part 5: Widget Analytics & Monitoring

1. **Can owner see widget usage?**
   - How many leads used widget?
   - How many sessions?
   - Where in dashboard?

2. **Can owner test their widget?**
   - Is there a preview/test mode?
   - Can they test without creating real leads?

---

### Part 6: Mobile & Cross-Browser

1. **Does widget work on mobile?**
   - Tested on iOS/Android?
   - Responsive design?

2. **Does widget work on different browsers?**
   - Chrome, Safari, Firefox, Edge?
   - Any known issues?

---

### Part 7: Gaps vs. Baseline

Analyze:

1. **Is website widget MVP-ready?**
   - Fully functional? [yes/no]
   - Tested? [yes/no]
   - Production-ready? [yes/no]

2. **WhatsApp status for MVP:**
   - Needed? [yes/no]
   - Implemented? [yes/no]
   - Decision: Include in MVP or defer to Phase 2?

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- Widget status: [working / broken / missing]
- WhatsApp status: [implemented / stub / not started]

### 2. Website Chat Widget
- Location: [file path]
- Type: [React / vanilla JS / iframe / other]
- Embeddable: [yes/no]
- Public URL: [shows where to embed]
- Authentication: [widgetApiKey / other]

### 3. Widget Message Flow
```
Lead types message → 
  API call to: [endpoint] → 
  AI response generated → 
  Message delivered: [method: polling/WebSocket/SSE] → 
  Lead sees response in: [X seconds]
```

### 4. Widget UI/UX
- Customizable per owner: [yes/no]
- Mobile responsive: [yes/no]
- Browser compatibility: [list tested browsers]

### 5. Lead Creation from Widget
- Lead created: [on first message / after form / other]
- Session tracking: [yes/no]
- Returning visitor detection: [email/IP/cookie/none]

### 6. Widget Reliability
- Production-ready: [yes/no/needs fixes]
- Known issues: [list any]
- Error handling: [robust / basic / missing]
- Rate limiting: [yes/no]

### 7. WhatsApp Status
- Implemented: [yes/no/partial]
- Status: [working / stub / planned for Phase 2]
- If planned: [what needs to be done]

### 8. Critical Gaps & Recommendations

**Widget Gaps**:
- [ ] Widget not embeddable
- [ ] Messages not persisting
- [ ] Real-time updates not working
- [ ] Mobile not responsive

**Needed for MVP**:
- Widget fully tested and production-ready

**Deferred to Phase 2**:
- [ ] WhatsApp integration
- [ ] Advanced customization

**Effort to Fix**:
- Widget issues: X days
- WhatsApp: Y days (Phase 2)

---

## Success Criteria

This audit is complete when you can:
1. Confirm widget is functional and production-ready OR identify what needs fixing
2. State whether WhatsApp is needed for MVP (likely NO, defer to Phase 2)
3. Identify all gaps preventing MVP launch
