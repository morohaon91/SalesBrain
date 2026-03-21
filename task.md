# CLAUDE CLI PROMPT - Prompt Management System Implementation

## OBJECTIVE

Implement a centralized, version-controlled prompt management system for the SalesBrain AI platform. This system will consolidate ALL existing prompts, eliminate duplication, provide reusable templates, and enable easy maintenance and future improvements.

**REFERENCE DOCUMENT:** 17-PROMPT-MANAGEMENT-SYSTEM.md

---

## CONTEXT

**Current State:**
- Prompts are in `lib/ai/prompts/simulation.ts` (exists)
- Pattern extraction prompts will be in `lib/ai/prompts/pattern-extraction.ts` (Session 10)
- Future prompts for lead qualification, summarization, intent detection (Sessions 12-16)
- Found duplication across prompts (behavior rules, industry context, output formatting)

**Goal:**
Create a smart, scalable prompt management system that:
1. Eliminates all duplication
2. Provides reusable templates
3. Tracks versions
4. Enables A/B testing
5. Supports localization (future)
6. Makes adding new prompts easy

---

## IMPLEMENTATION TASKS

═══════════════════════════════════════════════════════════════════
TASK 1: Create Directory Structure & Configuration (15 min)
═══════════════════════════════════════════════════════════════════

**Create these new files:**

1. **lib/ai/prompts/config.ts**
   - Define `AI_MODELS` constant (SONNET, HAIKU, OPUS)
   - Define `PromptConfig` interface
   - Create `PROMPT_CONFIGS` object with configs for:
     * simulation (v1.2.0, temp 0.8, 300 tokens)
     * patternExtraction (v1.0.0, temp 0.3, 4000 tokens)
     * leadQualification (v1.0.0, temp 0.7, 200 tokens)
     * summarization (v1.0.0, temp 0.5, 500 tokens)
     * intentDetection (v1.0.0, temp 0.2, 100 tokens)
   - Create `TOKEN_BUDGETS` for each use case
   - Export helper functions: `getPromptConfig(type)`

2. **lib/ai/prompts/utils/** (create directory)
   - Create empty directory for future utilities

**Deliverable:** Configuration system ready

═══════════════════════════════════════════════════════════════════
TASK 2: Build Reusable Template System (30 min)
═══════════════════════════════════════════════════════════════════

3. **lib/ai/prompts/templates.ts**

   **Section A: Behavior Rules**
   - `BEHAVIOR_RULES.standard` - Basic conversational behavior
   - `BEHAVIOR_RULES.strict` - Strict role-playing (with NEVER break character)
   - `BEHAVIOR_RULES.professional` - Professional service tone
   
   **Section B: Output Formats**
   - `OUTPUT_FORMATS.json(schema)` - JSON output instructions
   - `OUTPUT_FORMATS.structured` - Structured text
   - `OUTPUT_FORMATS.conversational` - Natural response
   
   **Section C: Industry Context**
   - `INDUSTRY_CONTEXT.generate(industry, service, targetClient)` - Context block
   - `INDUSTRY_CONTEXT.communicationStyle(industry)` - Industry-specific styles:
     * legal_services: Precise, professional, attorney-client tone
     * fitness_coaching: Motivational, energetic, supportive
     * mortgage_advisory: Clear, educational, trustworthy
     * business_consulting: Strategic, results-oriented, confident
     * interior_design: Creative, visual, enthusiastic
     * real_estate: Informative, market-aware, knowledgeable
     * financial_advisory: Precise, data-driven, analytical
     * marketing_agency: Creative, results-focused, energetic
     * default: Professional, clear, helpful
   
   **Section D: Confidence & Escalation**
   - `CONFIDENCE_GUIDELINES.escalation(ownerName)` - When/how to escalate
   - `CONFIDENCE_GUIDELINES.uncertaintyPhrases` - What to avoid
   
   **Section E: Qualification Logic**
   - `QUALIFICATION_TEMPLATES.budgetQuestions`
   - `QUALIFICATION_TEMPLATES.authorityQuestions`
   - `QUALIFICATION_TEMPLATES.needQuestions`
   
   **Section F: Helper Functions**
   - `buildPrompt(components)` - Assembles prompt from template pieces
   - `getIndustryGuidelines(industry)` - Get industry communication style
   - `getQualificationQuestions(focus)` - Get specific qualification questions

**CRITICAL:** Follow the exact structure in the reference doc (17-PROMPT-MANAGEMENT-SYSTEM.md, section "File 2")

**Deliverable:** Complete reusable template library

═══════════════════════════════════════════════════════════════════
TASK 3: Refactor Existing Simulation Prompts (20 min)
═══════════════════════════════════════════════════════════════════

4. **Update lib/ai/prompts/simulation.ts**

   **BEFORE (what it looks like now):**
   ```typescript
   const SIMULATION_CLIENT_SYSTEM_PROMPT = `
   You are roleplaying...
   YOUR BEHAVIOR:
   - Keep responses conversational (2-4 sentences)
   - Stay in character
   ... (all hardcoded)
   `;
   ```

   **AFTER (refactored to use templates):**
   ```typescript
   import { buildPrompt, BEHAVIOR_RULES } from './templates';
   import { INDUSTRY_TEMPLATES } from '@/lib/templates/industry-templates';

   export function generateSimulationPrompt(
     scenarioType: ScenarioType,
     businessProfile: any
   ): string {
     const industry = businessProfile?.industry || 'business_consulting';
     const template = INDUSTRY_TEMPLATES[industry];
     const scenario = template?.scenarios?.[scenarioType];

     const customInstructions = `
     SCENARIO: ${scenarioType}
     CLIENT PROFILE:
     - Type: ${scenario.clientType}
     - Budget: ${scenario.budget}
     ... (scenario-specific content)
     
     CRITICAL INSTRUCTION:
     You are a ${scenario.clientType} in the ${industry} industry.
     Stay in this role for the ENTIRE conversation.
     Do NOT switch industries, personas, or scenarios under any circumstances.
     `;

     return buildPrompt({
       role: `You are roleplaying as a potential client...`,
       behavior: 'strict',
       industryContext: {
         industry,
         service: businessProfile?.serviceDescription || template.serviceDescription,
         targetClient: businessProfile?.targetClientType || template.targetClientType
       },
       customInstructions,
       outputFormat: 'conversational'
     });
   }

   // Deprecate old constant
   export const SIMULATION_CLIENT_SYSTEM_PROMPT = 'USE generateSimulationPrompt() INSTEAD';
   ```

   **Key changes:**
   - Import `buildPrompt` from templates
   - Use `buildPrompt()` instead of string concatenation
   - Pass `behavior: 'strict'` to get strict role-playing rules
   - Industry context comes from template
   - No duplicate behavior rules

**Deliverable:** Simulation prompts refactored to use template system

═══════════════════════════════════════════════════════════════════
TASK 4: Implement Pattern Extraction Prompts (20 min)
═══════════════════════════════════════════════════════════════════

5. **Create lib/ai/prompts/pattern-extraction.ts**

   **Structure:**
   ```typescript
   import { buildPrompt, OUTPUT_FORMATS } from './templates';

   export const PATTERN_EXTRACTION_SYSTEM_PROMPT = `
   You are an expert business analyst...
   (role definition from doc)
   `;

   export function generatePatternExtractionPrompt(
     transcript: string,
     industry: string,
     scenarioType: string
   ): string {
     const jsonSchema = `
     {
       "communicationStyle": { ... },
       "pricingLogic": { ... },
       ... (complete schema)
     }
     `;

     const customInstructions = `
     Analyze this ${industry} sales conversation...
     
     CONVERSATION TRANSCRIPT:
     ${transcript}
     
     EXTRACT THE FOLLOWING PATTERNS:
     1. COMMUNICATION STYLE: ...
     2. PRICING LOGIC: ...
     ... (extraction instructions)
     `;

     return buildPrompt({
       role: PATTERN_EXTRACTION_SYSTEM_PROMPT,
       customInstructions,
       outputFormat: 'json',
       jsonSchema
     });
   }

   export function formatConversationTranscript(messages: any[]): string {
     return messages.map(message => {
       const role = message.role === 'AI_CLIENT' ? 'CLIENT' : 'YOU';
       return `${role}: ${message.content}`;
     }).join('\n\n');
   }
   ```

   **Use the complete implementation from doc section "File 4"**

**Deliverable:** Pattern extraction prompts using template system

═══════════════════════════════════════════════════════════════════
TASK 5: Create Central Registry (15 min)
═══════════════════════════════════════════════════════════════════

6. **Create lib/ai/prompts/index.ts**

   **This file is the SINGLE SOURCE OF TRUTH for all prompts**

   ```typescript
   // Re-export everything
   export * from './config';
   export * from './templates';
   export * from './simulation';
   export * from './pattern-extraction';
   // export * from './lead-qualification';  // Future
   // export * from './summarization';       // Future

   // Define available prompts
   export const AVAILABLE_PROMPTS = [
     'simulation',
     'patternExtraction',
     'leadQualification',
     'summarization',
     'intentDetection'
   ] as const;

   export type PromptType = typeof AVAILABLE_PROMPTS[number];

   // Helper functions
   export function getAllPromptConfigs() { ... }
   export function getConfig(promptType: PromptType) { ... }
   export function isPromptAvailable(promptType: string): boolean { ... }

   // Version info
   export const PROMPT_SYSTEM_VERSION = '1.0.0';
   export const LAST_UPDATED = '2026-03-20';
   export function getVersionInfo() { ... }
   ```

   **Follow exact implementation from doc section "File 5"**

**Deliverable:** Central registry for all prompts

═══════════════════════════════════════════════════════════════════
TASK 6: Add Validation Utilities (10 min)
═══════════════════════════════════════════════════════════════════

7. **Create lib/ai/prompts/utils/validation.ts**

   **Implement:**
   - `validatePrompt(prompt)` - Check structure, length, variables
   - `estimateTokens(text)` - Rough token count (~4 chars per token)
   - `exceedsTokenBudget(prompt, budget)` - Check if over budget

   **Follow implementation from doc section "File 7"**

**Deliverable:** Validation utilities ready

═══════════════════════════════════════════════════════════════════
TASK 7: Create Version Tracking (5 min)
═══════════════════════════════════════════════════════════════════

8. **Create lib/ai/prompts/CHANGELOG.md**

   **Content:**
   ```markdown
   # Prompt Changelog

   ## [1.0.0] - 2026-03-20

   ### Added
   - Initial prompt management system
   - Central registry in index.ts
   - Reusable templates
   - Simulation prompts with templates
   - Pattern extraction prompts
   - Version tracking

   ### Changed
   - Refactored simulation prompts to use templates
   - Consolidated behavior rules
   - Added industry-specific communication styles
   ```

   **Follow format from doc section "File 6"**

**Deliverable:** Version tracking in place

═══════════════════════════════════════════════════════════════════
TASK 8: Update Import Statements (15 min)
═══════════════════════════════════════════════════════════════════

9. **Find and update all files that import prompts:**

   **BEFORE:**
   ```typescript
   import { generateSimulationPrompt } from '@/lib/ai/prompts/simulation';
   ```

   **AFTER:**
   ```typescript
   import { generateSimulationPrompt } from '@/lib/ai/prompts';
   ```

   **Files to update:**
   - `app/api/v1/simulations/start/route.ts`
   - `app/api/v1/simulations/[id]/message/route.ts`
   - `lib/ai/extract-patterns.ts` (when created in Session 10)
   - Any other files importing from `lib/ai/prompts/`

   **Search command to find all imports:**
   ```bash
   grep -r "from '@/lib/ai/prompts/" --include="*.ts" --include="*.tsx"
   ```

**Deliverable:** All imports point to central registry

═══════════════════════════════════════════════════════════════════
TASK 9: Add Tests (Optional but Recommended - 15 min)
═══════════════════════════════════════════════════════════════════

10. **Create lib/ai/prompts/__tests__/simulation.test.ts**

    **Test cases:**
    - ✅ Generates valid prompt for each industry
    - ✅ Includes "stay in character" instruction
    - ✅ Includes scenario-specific details
    - ✅ Doesn't exceed token budget

    **Follow implementation from doc section "Testing Framework"**

11. **Create lib/ai/prompts/__tests__/templates.test.ts**

    **Test cases:**
    - ✅ buildPrompt() assembles correctly
    - ✅ Industry guidelines exist for all industries
    - ✅ Behavior rules are non-empty

**Deliverable:** Test suite passing

═══════════════════════════════════════════════════════════════════
DELIVERABLES CHECKLIST
═══════════════════════════════════════════════════════════════════

Provide complete, working code for:

**Core System:**
- ✅ lib/ai/prompts/config.ts (model configs, versions, token budgets)
- ✅ lib/ai/prompts/templates.ts (reusable components, buildPrompt function)
- ✅ lib/ai/prompts/index.ts (central registry)
- ✅ lib/ai/prompts/CHANGELOG.md (version history)

**Prompt Files:**
- ✅ lib/ai/prompts/simulation.ts (refactored to use templates)
- ✅ lib/ai/prompts/pattern-extraction.ts (new, using templates)

**Utilities:**
- ✅ lib/ai/prompts/utils/validation.ts (validation helpers)

**Tests (optional):**
- ✅ lib/ai/prompts/__tests__/simulation.test.ts
- ✅ lib/ai/prompts/__tests__/templates.test.ts

**Updates:**
- ✅ All import statements updated to use central registry

═══════════════════════════════════════════════════════════════════
REQUIREMENTS
═══════════════════════════════════════════════════════════════════

**Code Quality:**
- Use TypeScript with proper types
- Follow existing code patterns
- Add helpful comments
- Use ES6+ features

**Template System:**
- `buildPrompt()` must assemble prompts from components
- Industry-specific communication styles for all 8 industries
- No duplicate behavior rules across prompts
- All output formats centralized

**Validation:**
- Check prompt length (50-8000 tokens)
- Detect undefined variables
- Validate structure

**Version Control:**
- All prompts have version numbers
- CHANGELOG documents all changes
- config.ts tracks lastUpdated dates

**Testing:**
- Prompts validate successfully
- Token budgets not exceeded
- All industries covered

═══════════════════════════════════════════════════════════════════
TESTING CHECKLIST
═══════════════════════════════════════════════════════════════════

After implementation, verify:

**Functionality:**
- [ ] Import from `@/lib/ai/prompts` works
- [ ] `generateSimulationPrompt()` produces valid prompts
- [ ] `generatePatternExtractionPrompt()` produces valid prompts
- [ ] `buildPrompt()` assembles prompts correctly
- [ ] Industry-specific styles work for all 8 industries

**No Duplication:**
- [ ] Behavior rules appear only in templates.ts
- [ ] Industry context appears only in templates.ts
- [ ] Output formats appear only in templates.ts
- [ ] No hardcoded behavior rules in simulation.ts
- [ ] No hardcoded output formats in pattern-extraction.ts

**Configuration:**
- [ ] All prompt configs exist in PROMPT_CONFIGS
- [ ] Token budgets defined for all use cases
- [ ] Model selection correct for each prompt type

**Validation:**
- [ ] validatePrompt() catches long prompts
- [ ] validatePrompt() catches undefined variables
- [ ] estimateTokens() gives reasonable estimates

**Version Control:**
- [ ] CHANGELOG.md exists and is populated
- [ ] All prompts have version numbers
- [ ] getVersionInfo() returns correct data

═══════════════════════════════════════════════════════════════════
SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════

**System is successful when:**
- ✅ All imports come from single source (`@/lib/ai/prompts`)
- ✅ Zero duplicate behavior rules across prompts
- ✅ buildPrompt() works for all use cases
- ✅ Industry communication styles for all 8 industries
- ✅ Version tracking in place
- ✅ Validation tests pass
- ✅ CHANGELOG up to date
- ✅ Token budgets within limits

═══════════════════════════════════════════════════════════════════
IMPORTANT NOTES
═══════════════════════════════════════════════════════════════════

**Critical Details:**

1. **Industry Communication Styles:**
   Must cover ALL 8 industries from INDUSTRY_TEMPLATES:
   - mortgage_advisory
   - interior_design
   - business_consulting
   - real_estate
   - financial_advisory
   - legal_services
   - marketing_agency
   - contractors

2. **Behavior Rules - STRICT version:**
   MUST include "NEVER break character or switch roles or scenarios under ANY circumstances"
   This is critical for preventing persona switching bug

3. **buildPrompt() Function:**
   Core utility that assembles prompts from components
   Must handle all combinations of:
   - role + behavior
   - role + industryContext
   - role + customInstructions
   - role + outputFormat
   - All of the above combined

4. **Token Budgets:**
   Must stay within limits:
   - Simulation: 800 tokens for system prompt
   - Pattern extraction: 400 tokens for system prompt
   - Lead qualification: 1200 tokens for system prompt

5. **Version Numbering:**
   Use semantic versioning (MAJOR.MINOR.PATCH)
   Start all new prompts at 1.0.0
   Simulation is already at 1.2.0 (has been refined)

**Reference 17-PROMPT-MANAGEMENT-SYSTEM.md for:**
- Complete template implementations
- Exact function signatures
- Industry communication styles
- Validation logic
- Test cases

═══════════════════════════════════════════════════════════════════
FINAL NOTES
═══════════════════════════════════════════════════════════════════

This is a **foundational system** that will be used for ALL AI interactions in the platform.

**Quality is critical:**
- Every prompt will use this system
- Future developers will rely on these templates
- A/B testing will use this structure
- Localization will build on this foundation

**Implementation order matters:**
1. Config first (dependencies for templates)
2. Templates second (dependencies for prompts)
3. Refactor existing (simulation)
4. Add new (pattern-extraction)
5. Create registry (ties everything together)

**After this implementation:**
- Adding new prompts is EASY (just use buildPrompt)
- Changing behavior rules updates ALL prompts
- Testing prompts is SIMPLE (validation utilities)
- Tracking changes is CLEAR (CHANGELOG)

Implement all tasks in order. Provide complete, production-ready, well-commented code.