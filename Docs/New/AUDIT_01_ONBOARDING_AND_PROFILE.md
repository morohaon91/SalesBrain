# Audit Prompt 1: Onboarding & Business Profile

**Purpose**: Understand how onboarding and business profile creation currently work vs. the baseline requirement.

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_01_ONBOARDING_AND_PROFILE.md`

---

# Analysis Request: Onboarding & Business Profile Implementation

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze the onboarding flow and business profile system in the provided codebase and compare it to the baseline specification.

---

## Baseline Requirements (from AI_Lead_Warmup_System_Baseline.md)

### Step 1: Business Information
- After registration, business owner answers questions about their business type
- **Supported business types**: Contractors, IT Services, Software Development Services, Financial Services, + 4-6 more (8-10 total)

### Step 2: Simulation Scenarios
- Business owner completes **3-5 simulation scenarios**
- Each scenario simulates a real customer interaction
- Owner types real-time responses as if chatting with actual leads
- Scenarios are type-specific (different for contractors vs. IT services)

### Step 3: AI Learning & Data Extraction
- System extracts and learns:
  - Communication style
  - Tone and phrasing
  - Thinking patterns
  - Frequently used words and sentences

### Step 4: Learning Progress Tracking
- System displays **learning progress percentage**
- Progress measured by:
  - Number of completed scenarios
  - Consistency in responses
  - Vocabulary coverage
  - Success rate in simulations
- **90% completion unlocks** the option to go live

### Step 5: Profile Approval
- Business owner reviews and approves their generated profile
- Profile is **editable at all times**, even after going live
- Profile includes:
  - Business hours
  - Services offered
  - Pricing ranges
  - Team size
  - Typical project timelines

---

## Analysis Questions

### Part 1: Business Type Selection

Examine the code that handles business type selection:

1. **What business types are currently supported?**
   - List them exactly as coded
   - Are they hard-coded, database enum, or config?
   - Do they match the baseline (Contractors, IT Services, Software Dev, Financial Services)?

2. **Is there validation for business type?**
   - Does the API validate against supported types?
   - What happens if invalid type is submitted?

3. **Are scenarios type-specific?**
   - Are there different simulation scenarios for different business types?
   - Or are all scenarios generic?

---

### Part 2: Simulation Scenarios

Examine the simulation engine:

1. **How many simulations can an owner complete?**
   - Is there a limit (3-5 as baseline)?
   - Can they complete unlimited simulations?

2. **How are scenarios generated?**
   - Are they hard-coded?
   - Are they AI-generated?
   - Are they specific to business type?
   - Show the code/data that defines a scenario

3. **What does an owner do in a simulation?**
   - Do they chat with an AI persona?
   - Is it a real-time conversation?
   - Can they see their responses before/after being analyzed?

4. **What data is captured from simulations?**
   - Are the owner's messages stored?
   - Is the conversational flow recorded?
   - What metadata is tracked?

---

### Part 3: Pattern Extraction & Learning

Examine how the system learns from simulations:

1. **How are communication patterns extracted?**
   - Is there code that analyzes the owner's responses?
   - What patterns are extracted (style, tone, phrasing)?
   - What data structure holds extracted patterns?
   - Show the code that does this extraction

2. **What gets stored in the BusinessProfile?**
   - List every field/property in the BusinessProfile model
   - Which fields are populated from simulations?
   - Which fields are entered manually?

3. **How is consistency measured?**
   - Does the system compare patterns across simulations?
   - Is there a consistency score?
   - Show code if this exists

---

### Part 4: Learning Progress Calculation

Examine the progress calculation:

1. **How is completionPercentage calculated?**
   - Is it just +20% per simulation?
   - Or does it consider quality/consistency?
   - Show the exact calculation logic

2. **What does 90% completion mean?**
   - Is there validation that blocks approval before 90%?
   - Or can owner approve at any percentage?
   - Show the code that enforces this gate

3. **Can the progress go above 90%?**
   - Does it reach 100%?
   - Or is it capped at 90%?

---

### Part 5: Profile Approval & Editability

Examine profile management:

1. **What is the approval flow?**
   - Does owner see a "Profile Summary" page?
   - Can they edit profile before approving?
   - Does approval change the profile status?
   - Show the state transitions

2. **Can profile be edited after approval?**
   - Is there an "Edit Profile" button on dashboard?
   - Can edits be made without re-approval?
   - Or does editing trigger a new approval cycle?

3. **What profile fields can be edited?**
   - Business hours
   - Services offered
   - Pricing ranges
   - Team size
   - Typical timelines
   - Are all of these editable?

4. **Where is the profile stored?**
   - In database as JSON?
   - As individual fields?
   - Show the schema

---

### Part 6: Gaps vs. Baseline

Based on your analysis, answer:

1. **What's missing?**
   - What baseline requirements don't exist in code?
   - What needs to be built?

2. **What's incomplete?**
   - What exists but isn't fully functional?
   - What needs fixing?

3. **What's over-engineered?**
   - What exists but isn't required by baseline?
   - What can be simplified?

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- What you found in the code (high-level overview)

### 2. Business Type Selection
- Supported types: [list]
- Validation: [yes/no/partial]
- Type-specific scenarios: [yes/no]

### 3. Simulation Engine
- How scenarios work: [description]
- Number of scenarios: [limit or unlimited]
- AI-generated vs. hard-coded: [which]
- Data captured: [what]

### 4. Pattern Extraction
- Extraction logic: [exists/missing/partial]
- Patterns extracted: [which ones]
- Consistency checking: [yes/no]
- Show code snippet of extraction logic

### 5. Learning Progress
- Calculation method: [description]
- 90% gate enforcement: [yes/no/partial]
- Code snippet of progress calculation

### 6. Profile Management
- Approval flow: [description]
- Post-approval editability: [yes/no]
- Editable fields: [list]
- Storage: [database location]

### 7. Gaps & Recommendations

**Missing Features**:
- [ ] Feature A
- [ ] Feature B

**Incomplete Features**:
- [ ] Feature X (reason)
- [ ] Feature Y (reason)

**Recommendations**:
1. Priority 1 fix
2. Priority 2 fix
3. Priority 3 fix

**Effort Estimates**:
- Missing features: X days
- Incomplete features: Y days
- Total: Z days

---

## Success Criteria

This audit is complete when you can answer all questions above with **specific code references** and **clear evidence** from the codebase.
