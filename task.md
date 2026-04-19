## Context

This system extracts behavioral patterns from simulation conversations and stores them 
in BusinessProfile JSON fields. These patterns are later used to power the AI agent 
that talks to real leads on behalf of the business owner. Accuracy is critical — 
a wrong pattern means the AI misrepresents the owner in a live sales conversation.

## The Problem

Right now, patterns can reach maximum confidence after a single simulation. A competency 
like "Discovery Mastery" can show 100% after 1 conversation. This is not trustworthy 
enough to represent someone in real sales conversations.

The system should treat patterns like a professional would treat any behavioral assessment 
— one data point is a hint, not a conclusion. The same behavior seen consistently across 
different contexts and scenario types is what makes it reliable.

## What We Want

Implement a multi-simulation confidence system with these properties:

1. **Evidence accumulation** — confidence in a pattern should grow with repetition. 
   Seeing the same behavior once is a signal. Seeing it across 3 different simulations 
   is a fact.

2. **Cross-scenario validation** — the most critical competencies (objection handling, 
   closing strategy, deal breakers) should only reach high confidence when demonstrated 
   across different scenario types, not just repeated in the same type. A price objection 
   handled well in the PRICE_OBJECTION scenario AND again in a HOT_LEAD scenario is 
   more trustworthy than the same scenario run twice.

3. **Tiered confidence ceilings per simulation count** — no competency should be able 
   to max out from a single simulation. The ceiling should rise as evidence accumulates 
   across simulations. The exact tiers and thresholds should match the actual data 
   structure and what realistically gets extracted per scenario type.

4. **Natural pacing** — a user doing all 8 mandatory scenarios in order should reach 
   go-live readiness (~90% activation score) around simulation 6-7, not simulation 1-2. 
   The last 2-3 simulations should feel meaningful, not redundant.

5. **Accuracy over speed** — this is not a gamification system. The goal is that when 
   the AI goes live, every pattern it uses has been genuinely validated. We prefer a 
   system that takes longer to reach 90% but is trustworthy over one that inflates 
   quickly.

## Your Task

1. Audit the current confidence and evidence tracking across:
   - `lib/extraction/extraction-engine.ts` (merge functions)
   - `lib/learning/competencies.ts` (competency validators)
   - `lib/extraction/completion.ts` (completion formula)
   - The actual DB data for existing profiles

2. Design and implement a multi-simulation confidence system that solves the problem 
   above. You have full freedom to improve or replace the approach — you know the 
   actual code and data structures better than anyone. The solution should be:
   - Based on what data the extraction engine actually produces per scenario type
   - Realistic about what can be extracted from 1 vs 3 vs 8 simulations
   - Consistent across both the Activation Score competencies and the Extracted 
     Data Coverage formula
   - Clean — no hacks, no magic numbers without explanation

3. Update the competency validators in `lib/learning/competencies.ts` so that 
   "Achieved" and "Mastered" statuses require cross-simulation evidence, not just 
   single-simulation confidence scores.

4. Update the completion formula in `lib/extraction/completion.ts` so section scores 
   have evidence-based ceilings that rise with simulation count.

5. Delete any dead code or stale logic that this change makes obsolete.

Do not over-engineer. If the right solution is simple, implement the simple solution. 
Document your design decisions in comments so the reasoning is clear to anyone 
reading the code later.