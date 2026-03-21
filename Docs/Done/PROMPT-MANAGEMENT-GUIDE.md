# Prompt Management System - Quick Start Guide

**Session**: 11
**Status**: ✅ Production Ready
**Last Updated**: March 21, 2026

---

## What Is It?

A centralized, version-controlled system for managing all AI prompts in SalesBrain. It eliminates duplication, provides reusable templates, and makes it easy to:
- Add new prompts
- Update existing prompts globally
- Track versions and changes
- Validate prompt sizes
- A/B test different approaches

---

## Quick Start: Using Prompts

### Importing from the central registry
```typescript
// ✅ CORRECT - Import from central registry
import {
  generateSimulationPrompt,
  generatePatternExtractionPrompt,
  getVersionInfo,
  estimateTokens
} from '@/lib/ai/prompts';

// ❌ WRONG - Don't import from submodules directly
import { generateSimulationPrompt } from '@/lib/ai/prompts/simulation';
```

### Getting prompt configuration
```typescript
import { getPromptConfig, getTokenBudget } from '@/lib/ai/prompts';

// Get config for a prompt type
const config = getPromptConfig('simulation');
console.log(config.version);      // '1.2.0'
console.log(config.temperature);  // 0.8
console.log(config.maxTokens);    // 300

// Get token budget
const budget = getTokenBudget('patternExtraction');  // 4000
```

### Checking system version
```typescript
import { getVersionInfo, PROMPT_SYSTEM_VERSION } from '@/lib/ai/prompts';

const info = getVersionInfo();
// { version: '1.0.0', lastUpdated: '2026-03-21', promptCount: 5, availablePrompts: [...] }

console.log(PROMPT_SYSTEM_VERSION);  // '1.0.0'
```

---

## Building Custom Prompts

### The buildPrompt() function
```typescript
import { buildPrompt, BEHAVIOR_RULES } from '@/lib/ai/prompts';

const prompt = buildPrompt({
  role: 'You are a helpful assistant...',
  behavior: 'professional',  // 'standard' | 'strict' | 'professional'
  industryContext: {
    industry: 'legal_services',
    service: 'Contract review',
    targetClient: 'Small businesses'
  },
  customInstructions: 'Additional specific instructions here...',
  outputFormat: 'json',  // 'json' | 'structured' | 'conversational'
  jsonSchema: '{ ... }'  // Required if outputFormat is 'json'
});
```

### Available components

**Behavior Rules**:
```typescript
import { BEHAVIOR_RULES } from '@/lib/ai/prompts';

BEHAVIOR_RULES.standard      // Default conversational behavior
BEHAVIOR_RULES.strict        // Strong "stay in character" rules
BEHAVIOR_RULES.professional  // Professional service tone
```

**Industry Communication Styles**:
```typescript
import { INDUSTRY_CONTEXT } from '@/lib/ai/prompts';

const style = INDUSTRY_CONTEXT.communicationStyle('legal_services');
// Returns industry-specific communication guidelines

// Available industries:
// - legal_services
// - fitness_coaching
// - mortgage_advisory
// - business_consulting
// - interior_design
// - real_estate
// - financial_advisory
// - marketing_agency
```

**Output Formats**:
```typescript
import { OUTPUT_FORMATS } from '@/lib/ai/prompts';

OUTPUT_FORMATS.json(schema)      // JSON-only output
OUTPUT_FORMATS.structured        // Structured text with sections
OUTPUT_FORMATS.conversational    // Natural language response
```

**Qualification Questions**:
```typescript
import { getQualificationQuestions } from '@/lib/ai/prompts';

const budgetQs = getQualificationQuestions('budget');
const authorityQs = getQualificationQuestions('authority');
const needQs = getQualificationQuestions('need');
```

---

## Validating Prompts

```typescript
import {
  validatePrompt,
  estimateTokens,
  exceedsTokenBudget,
  getPromptSizeWarning,
  getPromptMetrics
} from '@/lib/ai/prompts';

// Validate structure
const { valid, issues } = validatePrompt(myPrompt);
if (!valid) {
  console.error('Issues found:', issues);
}

// Check token count
const tokens = estimateTokens(myPrompt);
console.log(`Prompt is ~${tokens} tokens`);

// Check against budget
if (exceedsTokenBudget(myPrompt, 300)) {
  console.warn('Prompt exceeds budget!');
}

// Get warning if approaching budget
const warning = getPromptSizeWarning(myPrompt, 300);
if (warning) console.warn(warning);

// Get full metrics
const metrics = getPromptMetrics(myPrompt);
// { characters: 1234, tokens: 308, lines: 45, words: 201 }
```

---

## Adding a New Prompt Type

### Step 1: Add configuration
```typescript
// In lib/ai/prompts/config.ts
export const PROMPT_CONFIGS: Record<string, PromptConfig> = {
  // ... existing configs ...
  myNewPrompt: {
    version: '1.0.0',
    model: AI_MODELS.SONNET,
    temperature: 0.7,
    maxTokens: 500,
    description: 'Description of what this prompt does',
  },
};
```

### Step 2: Create prompt file
```typescript
// In lib/ai/prompts/my-new-prompt.ts
import { buildPrompt, OUTPUT_FORMATS } from './templates';

export function generateMyPrompt(params: any): string {
  return buildPrompt({
    role: 'Your role description...',
    behavior: 'professional',
    customInstructions: 'Specific instructions...',
    outputFormat: 'conversational'
  });
}
```

### Step 3: Export from central registry
```typescript
// In lib/ai/prompts/index.ts
export * from './my-new-prompt';

// And add to available prompts
export const AVAILABLE_PROMPTS = [
  'simulation',
  'patternExtraction',
  'leadQualification',
  'summarization',
  'intentDetection',
  'myNewPrompt',  // ← Add here
] as const;
```

### Step 4: Document the change
```markdown
# In lib/ai/prompts/CHANGELOG.md

## [1.1.0] - 2026-03-21

### Added
- New prompt type: myNewPrompt for [use case]
- Configuration in config.ts
```

---

## Existing Prompts & Their Purposes

| Prompt | File | Purpose | Temp | Budget |
|--------|------|---------|------|--------|
| **Simulation** | `simulation.ts` | AI client personas for practice conversations | 0.8 | 300 |
| **PatternExtraction** | `pattern-extraction.ts` | Analyze conversations to extract business patterns | 0.3 | 4000 |
| **LeadQualification** | Future | Engage with real leads | 0.7 | 200 |
| **Summarization** | Future | Generate conversation summaries | 0.5 | 500 |
| **IntentDetection** | Future | Classify user intent | 0.2 | 100 |

---

## Common Tasks

### Update behavior rules across all prompts
1. Edit `lib/ai/prompts/templates.ts` → `BEHAVIOR_RULES.standard`
2. All prompts using `behavior: 'standard'` now use the new rules
3. No need to touch individual prompt files

### Change industry communication style
1. Edit `lib/ai/prompts/templates.ts` → `INDUSTRY_CONTEXT.communicationStyle()`
2. All industry-specific prompts immediately use the new style
3. Update CHANGELOG

### Add a new qualification question set
1. Edit `QUALIFICATION_TEMPLATES` in `templates.ts`
2. Prompts can access via `getQualificationQuestions()`

### A/B Test prompt variations
1. Add variant to `PROMPT_CONFIGS` with different version
2. Use `getPromptConfig()` to select variant
3. Track metrics and update CHANGELOG with winner

---

## Files & Structure

```
lib/ai/prompts/
├── index.ts                          ← MAIN ENTRY POINT
├── config.ts                         ← Model configs, versions, budgets
├── templates.ts                      ← Reusable components & buildPrompt()
├── simulation.ts                     ← Simulation client prompts
├── pattern-extraction.ts             ← Pattern analysis prompts
├── utils/
│   └── validation.ts                 ← Token/size validation
└── CHANGELOG.md                      ← Version history
```

---

## Best Practices

### ✅ Do This
- Import from `@/lib/ai/prompts` (central registry)
- Use `buildPrompt()` for new prompts
- Validate prompts before deployment
- Update CHANGELOG when making changes
- Use industry-specific styles from templates

### ❌ Don't Do This
- Import directly from submodules like `./simulation`
- Hardcode behavior rules in individual prompts
- Skip token budget checks
- Forget to document changes in CHANGELOG
- Create custom industry styles instead of using templates

---

## Troubleshooting

**Q: "Cannot find module '@/lib/ai/prompts/simulation'"**
A: Update import to `'@/lib/ai/prompts'` instead

**Q: Prompt exceeds token budget**
A: Use `getPromptSizeWarning()` to identify issues, then condense or split the prompt

**Q: Industry communication style not applied**
A: Make sure you're using `buildPrompt()` with `industryContext` parameter

**Q: New prompt type not recognized**
A: Add it to `AVAILABLE_PROMPTS` array in `index.ts`

---

## Next Steps

- [ ] Review current simulations using new template system
- [ ] Test pattern extraction with new unified prompts
- [ ] Plan Session 12 (lead qualification prompts)
- [ ] Set up A/B testing for prompt variations
- [ ] Document industry-specific customizations

---

**Questions?** Check `Docs/Planning/17-PROMPT-MANAGEMENT-SYSTEM.md` for technical details.
