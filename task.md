# Business Types & Simulation Templates Audit

You are a technical architect auditing the SalesBrain codebase to understand how business types and simulations are structured.

**Your task**: Map all supported business types and their associated simulation templates.

---

## What You Need to Find

### Part 1: Business Types

Find where business types are defined in the codebase.

**Look for**:
- Enum or constant list of business types
- Database table storing business types
- Where business type is selected during onboarding
- What information is stored per business type

**Questions to answer**:
1. What business types are supported? (List all)
2. Where is this list defined? (File + line numbers)
3. How does a user select their business type?
4. What data is stored for each business type?

**Expected findings**:
```
Business Types Found:
- Contractors
- IT Services
- Software Development
- Financial Services
- [others...]

Location: prisma/schema.prisma (enum or table)
Selection: app/(onboarding)/business-type/page.tsx (or similar)
```

---

### Part 2: Simulation Templates

For EACH business type, find its simulation templates.

**Look for**:
- Simulation scenario definitions
- Where scenarios are retrieved based on business type
- Template content (what questions/situations are asked)
- How many simulations per business type

**Questions to answer for each business type**:
1. How many simulation templates exist for this type?
2. What are the scenarios/situations presented?
3. What is the owner expected to respond to?
4. Where are templates stored? (Database, files, hardcoded?)

**Expected findings**:
```
Business Type: Contractors
├─ Simulation 1: Roofing contractor gets inquiry about pricing
├─ Simulation 2: Timeline negotiation with client
├─ Simulation 3: Scope creep conversation
├─ Simulation 4: Budget discussion
└─ Simulation 5: Handling objection about experience

Location: [file path]
Storage: [database/hardcoded/files]
```

---

## Execution Steps

### Step 1: Find Business Type Definitions

Search the codebase for:
- `enum.*BusinessType` or `BusinessType = {`
- Prisma schema with business type field
- Onboarding questionnaire that asks about business type

**Report**:
- List all supported business types
- Show where defined
- Show code snippet

---

### Step 2: Find Business Type-to-Simulation Mapping

Search for:
- How simulations are retrieved for a selected business type
- Function like `getSimulationsForBusinessType()`
- Database queries filtering by business type
- Configuration mapping business types to templates

**Report**:
- How is the mapping done? (Database, hardcoded, config file?)
- Show the code that retrieves simulations

---

### Step 3: Map Each Business Type to Simulations

For each business type found:

1. List the business type name
2. List number of simulation templates
3. List each simulation template name/scenario
4. Show where templates are defined
5. Show example content (what owner responds to)

**Format your output**:

```
# Business Type: [Name]

## Simulation Templates
- **Simulation 1**: [Scenario name]
  - Content: [What owner responds to]
  - Location: [File path]
  
- **Simulation 2**: [Scenario name]
  - Content: [What owner responds to]
  - Location: [File path]

[Continue for all simulations for this type]
```

---

### Step 4: Create Complete Mapping Document

Create a comprehensive mapping showing:

```
┌─ Business Types Supported
│
├─ Contractors
│  ├─ Simulation 1: [name]
│  ├─ Simulation 2: [name]
│  └─ Simulation 3: [name]
│
├─ IT Services
│  ├─ Simulation 1: [name]
│  ├─ Simulation 2: [name]
│  └─ Simulation 3: [name]
│
├─ Software Development
│  ├─ Simulation 1: [name]
│  ├─ Simulation 2: [name]
│  └─ Simulation 3: [name]
│
└─ [Other types...]
```

---

## Output Format

Create a document called `BUSINESS_TYPES_AND_SIMULATIONS_MAPPING.md` with:

### Section 1: Business Types Summary
- List all supported types
- Count total types
- Where defined in codebase

### Section 2: Simulation Templates Summary
- Total number of templates across all types
- Average templates per type
- Template storage location

### Section 3: Detailed Mapping
For each business type:

**[Business Type Name]**
- Location: [where defined]
- Selection interface: [where user selects this]
- Number of simulations: [X]

**Simulations**:
1. [Scenario name]
   - What owner responds to: [description]
   - File location: [path]
   - Content preview: [first 2-3 lines of scenario]

2. [Scenario name]
   - What owner responds to: [description]
   - File location: [path]
   - Content preview: [first 2-3 lines]

[Continue for all simulations]

---

### Section 4: Code Locations Reference

**File 1**: [File path]
- Purpose: [What's here]
- Key functions: [List functions]
- Snippet: [Code snippet]

**File 2**: [File path]
- Purpose: [What's here]
- Key functions: [List functions]
- Snippet: [Code snippet]

[Continue for all relevant files]

---

### Section 5: Gaps & Issues

**If any of these are missing, report it**:
- [ ] Some business types missing simulation templates
- [ ] Simulations hardcoded (should be configurable)
- [ ] Business type selection not wired to simulations
- [ ] Template content unclear or generic
- [ ] Missing support for a baseline business type

---

## Success Criteria

This audit is complete when you can answer:

1. ✅ What are ALL business types supported?
2. ✅ For each type, how many simulations exist?
3. ✅ For each simulation, what is the owner expected to respond to?
4. ✅ Where in codebase is each piece defined?
5. ✅ How does the system map business type → simulations?

---

## Go Ahead

Audit the codebase. Find all business types and their simulation templates. Create the mapping document.

You have everything you need. No more instructions.