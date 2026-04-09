# CLAUDE CLI INVESTIGATION PROMPT
## Check What Actually Exists vs What We Think is Missing

I need you to investigate my codebase and tell me EXACTLY what exists related to:
1. Vector search (Pinecone integration)
2. Lead qualification/scoring
3. Embeddable widget
4. Conversations dashboard
5. Leads management
6. Analytics

---

## PART 1: VECTOR SEARCH (PINECONE)

### Check if Pinecone exists:

```bash
# Check for Pinecone config
grep -r "pinecone" . --include="*.ts" --include="*.tsx" --include="*.env*"

# Check for vector embedding code
find . -name "*embed*" -o -name "*vector*" | grep -v node_modules

# Check BusinessProfile for Pinecone fields
cat prisma/schema.prisma | grep -A 5 "pineconeNamespace"
```

**Report:**
- ✅ or ❌ Pinecone API key configured
- ✅ or ❌ Pinecone namespace in BusinessProfile
- ✅ or ❌ Embedding creation code exists
- ✅ or ❌ Vector search query code exists

If exists, show:
- Which files have Pinecone code
- How it's being used
- Is it actually working?

---

## PART 2: LEAD QUALIFICATION API

### Check for lead scoring/qualification:

```bash
# Check for scoring logic
grep -r "leadScore\|qualificationScore" app/api --include="*.ts"

# Check for qualification endpoints
ls app/api/v1/conversations/ 2>/dev/null
ls app/api/v1/leads/ 2>/dev/null

# Check for CLOSER framework implementation
grep -r "CLOSER\|closer" lib/ai --include="*.ts"

# Check conversation endpoints
find app/api -name "*conversation*" -o -name "*message*" | grep -v node_modules
```

**Report:**
- ✅ or ❌ POST /api/v1/conversations/start endpoint exists
- ✅ or ❌ POST /api/v1/conversations/[id]/message endpoint exists
- ✅ or ❌ Lead scoring logic exists
- ✅ or ❌ CLOSER framework in AI prompts
- ✅ or ❌ Hybrid scoring (rules + AI) exists

If exists, show:
- What endpoints exist
- How scoring works
- Is CLOSER framework implemented?
- Show example of scoring logic

---

## PART 3: EMBEDDABLE WIDGET

### Check for widget:

```bash
# Check for widget files
find . -name "*widget*" | grep -v node_modules

# Check public directory for widget.js
ls public/widget* 2>/dev/null

# Check for widget component
find app -name "*[Ww]idget*" -o -name "*[Cc]hat*" | grep -v node_modules

# Check for embed code generation
grep -r "embed\|widget" app/api --include="*.ts" | grep -i script
```

**Report:**
- ✅ or ❌ public/widget.js exists
- ✅ or ❌ Widget embed code generation exists
- ✅ or ❌ Chat widget component exists
- ✅ or ❌ Widget connects to conversation API

If exists, show:
- Where widget files are
- How to embed it
- Does it work?

---

## PART 4: CONVERSATIONS DASHBOARD

### Check for conversations UI:

```bash
# Check for conversations pages
find app -path "*conversations*" -name "page.tsx" | grep -v node_modules

# Check for conversation list component
find app -name "*[Cc]onversation*" | grep -v node_modules | grep -v api

# Check for API endpoints that dashboard uses
ls app/api/v1/conversations/ 2>/dev/null
```

**Report:**
- ✅ or ❌ /conversations page exists
- ✅ or ❌ /conversations/[id] detail page exists
- ✅ or ❌ Conversation list component exists
- ✅ or ❌ Can view all conversations
- ✅ or ❌ Can filter/search conversations

If exists, show:
- What pages exist
- What you can do on these pages
- Screenshots or description of UI

---

## PART 5: LEADS MANAGEMENT

### Check for leads UI:

```bash
# Check for leads pages
find app -path "*leads*" -name "page.tsx" | grep -v node_modules

# Check for lead detail page
find app -path "*leads/[id]*" | grep -v node_modules

# Check for lead management API
ls app/api/v1/leads/ 2>/dev/null

# Check for lead scoring display
grep -r "temperature\|leadScore" app --include="*.tsx" | grep -v node_modules
```

**Report:**
- ✅ or ❌ /leads page exists
- ✅ or ❌ /leads/[id] detail page exists
- ✅ or ❌ Can see lead scores
- ✅ or ❌ Can see temperature (hot/warm/cold)
- ✅ or ❌ Can update lead status
- ✅ or ❌ Can add notes to leads

If exists, show:
- What pages exist
- What lead information is shown
- Can you manage leads (update status, add notes)?

---

## PART 6: ANALYTICS

### Check for analytics:

```bash
# Check for analytics pages
find app -path "*analytics*" -name "page.tsx" | grep -v node_modules

# Check for metrics/stats components
find app -name "*[Mm]etric*" -o -name "*[Ss]tat*" | grep -v node_modules | grep tsx

# Check for analytics API
find app/api -name "*analytics*" -o -name "*metrics*" | grep -v node_modules
```

**Report:**
- ✅ or ❌ /analytics page exists
- ✅ or ❌ Metrics tracking exists
- ✅ or ❌ Charts/graphs components exist
- ✅ or ❌ Can see conversation metrics
- ✅ or ❌ Can see lead conversion rates

If exists, show:
- What analytics exist
- What metrics are tracked

---

## PART 7: THE CHAT PAGE YOU CREATED

### Investigate the lead chat link:

```bash
# Find the chat page
find app -path "*/chat/*" -name "page.tsx" | grep -v node_modules

# Find conversation start logic
grep -r "conversation.*start\|createConversation" app/api --include="*.ts" -A 10

# Find AI response logic
grep -r "claude\|anthropic" app/api --include="*.ts" | grep conversation
```

**Report:**
- ✅ Page location: [show path]
- ✅ How it creates conversations
- ✅ How AI responds
- ✅ Does it use BusinessProfile data?
- ✅ Does it use CLOSER framework?
- ✅ Does it score the lead?

Show:
- The actual code for the chat page
- The API endpoint it uses
- How AI generates responses

---

## OUTPUT FORMAT

Create a report like this:

```markdown
# INVESTIGATION REPORT

## 1. VECTOR SEARCH (PINECONE)
Status: ✅ EXISTS / ❌ MISSING / ⚠️ PARTIAL

[Details of what exists]

## 2. LEAD QUALIFICATION API
Status: ✅ EXISTS / ❌ MISSING / ⚠️ PARTIAL

Endpoints Found:
- POST /api/v1/conversations/start: ✅/❌
- POST /api/v1/conversations/[id]/message: ✅/❌
- Lead scoring logic: ✅/❌
- CLOSER framework: ✅/❌

[Details and code snippets]

## 3. EMBEDDABLE WIDGET
Status: ✅ EXISTS / ❌ MISSING / ⚠️ PARTIAL

[Details of what exists]

## 4. CONVERSATIONS DASHBOARD
Status: ✅ EXISTS / ❌ MISSING / ⚠️ PARTIAL

Pages Found:
- /conversations: ✅/❌
- /conversations/[id]: ✅/❌

[Details and screenshots]

## 5. LEADS MANAGEMENT
Status: ✅ EXISTS / ❌ MISSING / ⚠️ PARTIAL

Pages Found:
- /leads: ✅/❌
- /leads/[id]: ✅/❌

[Details]

## 6. ANALYTICS
Status: ✅ EXISTS / ❌ MISSING / ⚠️ PARTIAL

[Details]

## 7. YOUR CHAT PAGE
Location: [path]
How it works: [explanation]
Uses BusinessProfile: ✅/❌
Uses CLOSER: ✅/❌
Scores leads: ✅/❌

[Code snippets]

---

## SUMMARY

What EXISTS:
- [list everything that's actually built]

What's MISSING:
- [list what doesn't exist]

What's PARTIAL:
- [list what's half-built]

---

## RECOMMENDATIONS

Based on what I found, here's what you should do next:
[numbered list of next steps]
```

---

## INSTRUCTIONS

1. Run all the checks above
2. Look at actual code files
3. Check if things actually work or just have empty stubs
4. Be thorough - check API endpoints, UI pages, database queries
5. Show code snippets for important findings
6. Tell me what's actually working vs what's just scaffolding

Create the complete investigation report now.
