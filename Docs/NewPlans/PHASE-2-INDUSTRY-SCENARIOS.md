# PHASE 2: INDUSTRY TEMPLATES & SCENARIO SYSTEM

**Project**: MyInstinct.ai (SalesBrain)  
**Phase**: 2 of 8  
**Document Version**: 1.0.0  
**Date**: March 26, 2026  
**Purpose**: Industry-specific scenarios, persona generation, and adaptive scenario suggestions  
**Dependencies**: Phase 1 (Database Schema & Types)  
**Execution**: Claude CLI  

---

## 📋 OVERVIEW

This phase implements:
- 10 industry templates with 3-4 specific scenarios each
- Randomized persona generation for each scenario
- Adaptive scenario suggestion system based on profile gaps
- Industry-specific communication patterns and client types

---

## 🏢 INDUSTRY LIST & SCENARIO MAPPING

### 2.1 Complete Industry-Scenario Matrix

| Industry | Scenario 1 | Scenario 2 | Scenario 3 | Scenario 4 |
|----------|-----------|-----------|-----------|-----------|
| **Legal Services** | Urgent Case - Free Consult | Shopping for Lowest Rate | Complex Case - Budget Sensitive | Unrealistic Timeline |
| **Construction & Contracting** | Vague Scope - Tight Budget | Timeline Pressure | Homeowner Scope Creep | Premium Quality Skeptic |
| **Real Estate Services** | First-Time Buyer - Overwhelmed | Investor - Price Haggler | Unrealistic Expectations | Quick Sale Pressure |
| **Financial Advisory** | Small Portfolio - High Expectations | Fee-Focused Skeptic | Market Timer | Referral - Ready to Move |
| **Business Consulting** | Startup - Limited Budget | Scope Creep Risk | Wants Hands-On Work | Well-Funded - High Expectations |
| **Marketing & Creative** | Unclear Brief - Low Budget | Wants Everything Yesterday | Micro-Manager Client | Brand Overhaul - Big Budget |
| **Home Services** | Emergency Fix - Price Shopper | Preventive Maintenance Skeptic | DIY Gone Wrong | Premium Upgrade - Budget Conscious |
| **Health & Wellness Coaching** | Quick Fix Mindset | Price vs Value Conflict | Commitment Issues | Ready to Transform |
| **IT & Technology Services** | Break-Fix Only Client | Cheap MSP Burnout | Growth Company - Scaling | Security Incident Reactive |
| **Interior Design** | Pinterest Inspired - IKEA Budget | Style Indecisive | Timeline Unrealistic | Full Remodel - Premium |

---

## 📦 FILE STRUCTURE

```
lib/templates/
  ├── industry-scenarios.ts          (NEW - 1000+ lines)
  │   └── Complete scenario definitions for all 10 industries
  │
  ├── persona-generator.ts           (NEW - 300+ lines)
  │   └── Randomizes personas within scenario templates
  │
  ├── scenario-suggester.ts          (NEW - 400+ lines)
  │   └── Recommends next scenario based on profile gaps
  │
  └── industry-templates.ts          (MODIFY - keep for backward compatibility)
      └── Add reference to new scenario system
```

---

## 📄 DETAILED FILE SPECIFICATIONS

### 2.2 Industry Scenarios Definition

**File**: `lib/templates/industry-scenarios.ts` (NEW)

```typescript
import { IndustryScenario } from '@/lib/types/scenarios';

/**
 * Industry-Specific Scenario Definitions
 * 
 * Each industry has 3-4 carefully designed scenarios that test different
 * aspects of the business owner's decision-making and communication.
 */

// ============================================================================
// LEGAL SERVICES SCENARIOS
// ============================================================================

const legalServicesScenarios: IndustryScenario[] = [
  {
    id: 'legal_urgent_free_consult',
    industry: 'Legal Services',
    name: 'Urgent Case - Wants Free Consultation',
    description: 'Client has an urgent legal matter but expects a free initial consultation to "see if it\'s worth it"',
    difficulty: 'medium',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Urgent legal case, wants free consultation first',
    focusAreas: [
      'pricing_boundaries',
      'objection_handling_price',
      'qualification_urgency',
      'communication_professional'
    ],
    personaTemplate: {
      budgetRange: { min: 2000, max: 8000 },
      ageRange: { min: 28, max: 55 },
      personalityOptions: [
        'skeptical and cautious',
        'price-focused but stressed',
        'inexperienced with lawyers',
        'direct and businesslike'
      ],
      painPointOptions: [
        'facing legal deadline',
        'unsure if they have a case',
        'talked to other lawyers already',
        'worried about costs getting out of control',
        'needs quick resolution'
      ],
      timelineOptions: [
        'need help this week',
        'court date in 2 weeks',
        'urgent but flexible',
        'deadline approaching fast'
      ]
    }
  },
  {
    id: 'legal_lowest_rate_shopper',
    industry: 'Legal Services',
    name: 'Shopping for Lowest Rate',
    description: 'Client is shopping around and explicitly comparing hourly rates, treating legal services like a commodity',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Rate shopping, comparing multiple lawyers',
    focusAreas: [
      'pricing_logic_flexibility',
      'objection_handling_competitor',
      'decision_making_value_vs_price',
      'qualification_deal_breakers'
    ],
    personaTemplate: {
      budgetRange: { min: 1500, max: 5000 },
      ageRange: { min: 25, max: 50 },
      personalityOptions: [
        'extremely price-conscious',
        'comparing multiple quotes',
        'treats lawyers as interchangeable',
        'focuses on hourly rate only'
      ],
      painPointOptions: [
        'got quotes from 3 other lawyers',
        'doesn\'t understand why rates vary',
        'wants cheapest option',
        'questions value of experience',
        'sees legal help as commodity'
      ],
      timelineOptions: [
        'deciding this week',
        'need to file soon',
        'no rush but want best deal',
        'waiting on one more quote'
      ]
    }
  },
  {
    id: 'legal_complex_budget_sensitive',
    industry: 'Legal Services',
    name: 'Complex Case - Budget Sensitive',
    description: 'Legitimate complex case but client has limited budget and is nervous about total costs',
    difficulty: 'medium',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Complex legal matter, limited budget, needs reassurance',
    focusAreas: [
      'pricing_logic_payment_plans',
      'communication_reassurance',
      'objection_handling_scope',
      'qualification_budget_fit'
    ],
    personaTemplate: {
      budgetRange: { min: 3000, max: 12000 },
      ageRange: { min: 30, max: 60 },
      personalityOptions: [
        'worried about runaway costs',
        'needs payment plan',
        'genuinely concerned about case',
        'wants transparency on fees'
      ],
      painPointOptions: [
        'heard horror stories about legal bills',
        'fixed income or limited savings',
        'case is important but budget is real',
        'wants clear cost breakdown',
        'concerned about hidden fees'
      ],
      timelineOptions: [
        'not urgent but important',
        'can start in a month',
        'flexible if costs are managed',
        'needs time to budget'
      ]
    }
  },
  {
    id: 'legal_unrealistic_timeline',
    industry: 'Legal Services',
    name: 'Unrealistic Timeline Expectations',
    description: 'Client wants complex legal work done in impossibly short timeframe',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Complex case, expects it done in days',
    focusAreas: [
      'objection_handling_timeline',
      'decision_making_saying_no',
      'communication_setting_expectations',
      'qualification_realistic_fit'
    ],
    personaTemplate: {
      budgetRange: { min: 5000, max: 20000 },
      ageRange: { min: 35, max: 65 },
      personalityOptions: [
        'impatient and demanding',
        'doesn\'t understand legal process',
        'used to fast business decisions',
        'willing to pay premium for speed'
      ],
      painPointOptions: [
        'facing unexpected deadline',
        'assumes lawyers work like other vendors',
        'frustrated with legal system',
        'heard it "should be simple"',
        'previous lawyer was too slow'
      ],
      timelineOptions: [
        'need it done in 48 hours',
        'court in 1 week',
        'business deal closing fast',
        'emergency situation'
      ]
    }
  }
];

// ============================================================================
// CONSTRUCTION & CONTRACTING SCENARIOS
// ============================================================================

const constructionScenarios: IndustryScenario[] = [
  {
    id: 'construction_vague_scope_tight_budget',
    industry: 'Construction & Contracting',
    name: 'Vague Scope - Tight Budget',
    description: 'Homeowner has Pinterest ideas but unclear scope and limited budget',
    difficulty: 'medium',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Kitchen remodel, vague ideas, budget-conscious',
    focusAreas: [
      'qualification_scope_clarity',
      'pricing_logic_material_flexibility',
      'communication_educational',
      'objection_handling_budget'
    ],
    personaTemplate: {
      budgetRange: { min: 8000, max: 25000 },
      ageRange: { min: 28, max: 50 },
      personalityOptions: [
        'first-time renovator',
        'inspired by social media',
        'doesn\'t know what things cost',
        'wants high-end look on mid-range budget'
      ],
      painPointOptions: [
        'unclear on what they actually want',
        'budget is fixed but scope isn\'t',
        'doesn\'t understand trade-offs',
        'expects HGTV timelines and budgets',
        'overwhelmed by choices'
      ],
      timelineOptions: [
        'want to start soon',
        'flexible if price is right',
        'targeting specific date (holiday/event)',
        'no hard deadline'
      ]
    }
  },
  {
    id: 'construction_timeline_pressure',
    industry: 'Construction & Contracting',
    name: 'Extreme Timeline Pressure',
    description: 'Client needs work done impossibly fast, willing to pay premium',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Bathroom remodel, needs it done in 2 weeks',
    focusAreas: [
      'objection_handling_timeline',
      'pricing_logic_rush_premium',
      'decision_making_realistic_fit',
      'qualification_timeline_expectations'
    ],
    personaTemplate: {
      budgetRange: { min: 15000, max: 50000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: [
        'impatient and demanding',
        'willing to pay for speed',
        'doesn\'t understand construction timeline',
        'has unrealistic expectations'
      ],
      painPointOptions: [
        'in-laws visiting soon',
        'house going on market',
        'emergency situation (pipe burst, etc.)',
        'previous contractor bailed',
        'urgent need for completion'
      ],
      timelineOptions: [
        'need it done in 2 weeks',
        'start immediately',
        'absolute deadline approaching',
        'will pay premium for rush'
      ]
    }
  },
  {
    id: 'construction_scope_creep',
    industry: 'Construction & Contracting',
    name: 'Homeowner Scope Creep Risk',
    description: 'Client starts with simple project but keeps adding "while you\'re at it" requests',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Simple deck repair, but mentions many "bonus" ideas',
    focusAreas: [
      'communication_setting_boundaries',
      'pricing_logic_change_orders',
      'qualification_scope_discipline',
      'decision_making_project_limits'
    ],
    personaTemplate: {
      budgetRange: { min: 5000, max: 30000 },
      ageRange: { min: 30, max: 65 },
      personalityOptions: [
        'creative and spontaneous',
        'sees opportunities everywhere',
        'doesn\'t understand project boundaries',
        'thinks additional work is "easy to add"'
      ],
      painPointOptions: [
        'wants to maximize contractor visit',
        'unclear on priorities',
        'budget flexible but undefined',
        'lots of ideas, poor planning',
        'assumes "while you\'re here" is free'
      ],
      timelineOptions: [
        'flexible timeline',
        'want to do it all at once',
        'phased approach if needed',
        'no rush but want efficiency'
      ]
    }
  },
  {
    id: 'construction_premium_skeptic',
    industry: 'Construction & Contracting',
    name: 'Premium Quality Skeptic',
    description: 'Client wants premium work but questions why it costs more than "basic" contractors',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Full kitchen remodel, questions premium pricing',
    focusAreas: [
      'objection_handling_quality',
      'communication_value_demonstration',
      'pricing_logic_premium_justification',
      'qualification_quality_vs_price'
    ],
    personaTemplate: {
      budgetRange: { min: 30000, max: 80000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: [
        'wants quality but questions cost',
        'comparing multiple quotes',
        'sophisticated but price-conscious',
        'needs value justification'
      ],
      painPointOptions: [
        'got quote for half the price elsewhere',
        'doesn\'t see difference in contractors',
        'wants premium outcome, not premium price',
        'questions warranty value',
        'skeptical of "you get what you pay for"'
      ],
      timelineOptions: [
        'planning phase, not urgent',
        'want to start in 2-3 months',
        'flexible with right contractor',
        'getting quotes before deciding'
      ]
    }
  }
];

// ============================================================================
// REAL ESTATE SERVICES SCENARIOS
// ============================================================================

const realEstateScenarios: IndustryScenario[] = [
  {
    id: 'realestate_first_buyer_overwhelmed',
    industry: 'Real Estate Services',
    name: 'First-Time Buyer - Overwhelmed',
    description: 'First-time homebuyer overwhelmed by process, needs hand-holding but is commission-sensitive',
    difficulty: 'easy',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: First-time buyer, nervous, needs guidance',
    focusAreas: [
      'communication_educational',
      'qualification_readiness',
      'objection_handling_process',
      'pricing_logic_commission_questions'
    ],
    personaTemplate: {
      budgetRange: { min: 250000, max: 500000 },
      ageRange: { min: 25, max: 35 },
      personalityOptions: [
        'nervous and uncertain',
        'needs education on process',
        'first major financial decision',
        'wants trusted advisor'
      ],
      painPointOptions: [
        'doesn\'t understand closing costs',
        'confused by mortgage options',
        'worried about making wrong choice',
        'heard scary stories about agents',
        'questions why commission is percentage'
      ],
      timelineOptions: [
        'looking to buy in 3-6 months',
        'just starting research',
        'pre-approved and ready',
        'flexible on timing'
      ]
    }
  },
  {
    id: 'realestate_investor_haggler',
    industry: 'Real Estate Services',
    name: 'Investor - Price Haggler',
    description: 'Real estate investor looking for deals, wants to negotiate commission down',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Investor, multiple properties, wants commission discount',
    focusAreas: [
      'pricing_logic_volume_flexibility',
      'objection_handling_commission',
      'qualification_serious_buyer',
      'decision_making_value_vs_volume'
    ],
    personaTemplate: {
      budgetRange: { min: 300000, max: 2000000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: [
        'transactional and direct',
        'experienced with agents',
        'treats agents as vendors',
        'volume-focused mindset'
      ],
      painPointOptions: [
        'wants lower commission for volume',
        'used to negotiating everything',
        'compares agents solely on rate',
        'doesn\'t value relationship',
        'focused on investment returns'
      ],
      timelineOptions: [
        'actively looking now',
        'buying multiple properties this year',
        'ready to move fast on right deal',
        'ongoing acquisition strategy'
      ]
    }
  },
  {
    id: 'realestate_unrealistic_expectations',
    industry: 'Real Estate Services',
    name: 'Unrealistic Price Expectations',
    description: 'Seller has emotional attachment and unrealistic pricing expectations',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Selling family home, wants above-market price',
    focusAreas: [
      'communication_empathy',
      'objection_handling_pricing_reality',
      'qualification_realistic_seller',
      'decision_making_difficult_conversations'
    ],
    personaTemplate: {
      budgetRange: { min: 400000, max: 900000 },
      ageRange: { min: 45, max: 70 },
      personalityOptions: [
        'emotionally attached to property',
        'remembers what neighbor sold for',
        'defensive about home value',
        'dismisses market data'
      ],
      painPointOptions: [
        'recent renovations they overpaid for',
        'sentimental value clouds judgment',
        'neighbor sold for more (different market)',
        'doesn\'t want to "lose money"',
        'convinced they know better than data'
      ],
      timelineOptions: [
        'not in a rush to sell',
        'will wait for right price',
        'market will come around',
        'flexible on timing'
      ]
    }
  },
  {
    id: 'realestate_quick_sale_pressure',
    industry: 'Real Estate Services',
    name: 'Quick Sale Pressure',
    description: 'Client needs to sell fast (job relocation, financial pressure) and is anxious',
    difficulty: 'medium',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Urgent sale needed, job relocation in 6 weeks',
    focusAreas: [
      'communication_reassurance',
      'qualification_urgency_real',
      'objection_handling_timeline',
      'pricing_logic_quick_sale_strategy'
    ],
    personaTemplate: {
      budgetRange: { min: 350000, max: 750000 },
      ageRange: { min: 30, max: 55 },
      personalityOptions: [
        'stressed and anxious',
        'needs quick resolution',
        'willing to price aggressively',
        'focused on timeline over price'
      ],
      painPointOptions: [
        'job starting in different city',
        'carrying two mortgages',
        'financial pressure mounting',
        'previous agent couldn\'t sell fast enough',
        'worried about missing window'
      ],
      timelineOptions: [
        'must sell in 4-6 weeks',
        'job starts in 2 months',
        'absolute deadline',
        'will accept lower offer for speed'
      ]
    }
  }
];

// ============================================================================
// FINANCIAL ADVISORY SCENARIOS
// ============================================================================

const financialAdvisoryScenarios: IndustryScenario[] = [
  {
    id: 'financial_small_portfolio_high_expectations',
    industry: 'Financial Advisory',
    name: 'Small Portfolio - High Expectations',
    description: 'Client with $50k wants same service as high-net-worth clients',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Small portfolio, expects premium service',
    focusAreas: [
      'pricing_logic_minimum_fit',
      'qualification_portfolio_size',
      'communication_expectations_setting',
      'decision_making_client_fit'
    ],
    personaTemplate: {
      budgetRange: { min: 30000, max: 100000 },
      ageRange: { min: 28, max: 45 },
      personalityOptions: [
        'early career professional',
        'high expectations',
        'wants personalized service',
        'doesn\'t understand fee structures'
      ],
      painPointOptions: [
        'frustrated by roboadvisors',
        'wants human advisor',
        'expects weekly check-ins',
        'doesn\'t realize they\'re below minimum',
        'confused why bigger firms won\'t take them'
      ],
      timelineOptions: [
        'ready to transfer funds now',
        'interviewing advisors this month',
        'wants to start immediately',
        'flexible but eager'
      ]
    }
  },
  {
    id: 'financial_fee_skeptic',
    industry: 'Financial Advisory',
    name: 'Fee-Focused Skeptic',
    description: 'Sophisticated investor who questions every basis point of fees',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Experienced investor, fee-sensitive, DIY mindset',
    focusAreas: [
      'objection_handling_fees',
      'communication_value_justification',
      'qualification_DIY_vs_advisor',
      'pricing_logic_fee_transparency'
    ],
    personaTemplate: {
      budgetRange: { min: 500000, max: 3000000 },
      ageRange: { min: 40, max: 65 },
      personalityOptions: [
        'financially sophisticated',
        'reads financial news daily',
        'questions value of active management',
        'compares to index fund fees'
      ],
      painPointOptions: [
        'can get index funds for 0.04%',
        'doesn\'t see value in advice',
        'thinks advisors don\'t beat market',
        'DIY investor considering help',
        'wants proof of value before committing'
      ],
      timelineOptions: [
        'exploring options',
        'not in a rush',
        'will decide based on value prop',
        'currently self-managing'
      ]
    }
  },
  {
    id: 'financial_market_timer',
    industry: 'Financial Advisory',
    name: 'Market Timer',
    description: 'Client wants to actively time the market and trade frequently',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Wants help timing market, frequent trading',
    focusAreas: [
      'decision_making_philosophy_fit',
      'communication_education',
      'qualification_investment_philosophy',
      'objection_handling_strategy_mismatch'
    ],
    personaTemplate: {
      budgetRange: { min: 200000, max: 1000000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: [
        'active trader mentality',
        'watches market constantly',
        'believes they can beat market',
        'reads tips from online forums'
      ],
      painPointOptions: [
        'previous advisor "too conservative"',
        'wants to capitalize on volatility',
        'doesn\'t believe in buy-and-hold',
        'excited by crypto and meme stocks',
        'frustrated by boring portfolios'
      ],
      timelineOptions: [
        'ready to move money now',
        'market timing is urgent',
        'wants to act on opportunities',
        'impatient with slow approaches'
      ]
    }
  },
  {
    id: 'financial_referral_ready',
    industry: 'Financial Advisory',
    name: 'Referral - Ready to Move',
    description: 'High-quality referral from existing client, pre-qualified and ready',
    difficulty: 'easy',
    estimatedDuration: '5-7 minutes',
    teaser: 'Incoming lead: Referral from top client, portfolio $1.5M',
    focusAreas: [
      'communication_relationship_building',
      'qualification_confirming_fit',
      'pricing_logic_value_proposition',
      'decision_making_closing'
    ],
    personaTemplate: {
      budgetRange: { min: 1000000, max: 5000000 },
      ageRange: { min: 45, max: 70 },
      personalityOptions: [
        'trusts referrer judgment',
        'wants to move quickly',
        'less price-sensitive',
        'values relationship'
      ],
      painPointOptions: [
        'unhappy with current advisor',
        'friend recommended you highly',
        'ready for change',
        'wants more attention',
        'seeking better communication'
      ],
      timelineOptions: [
        'ready to start this month',
        'can transfer funds quickly',
        'eager to get started',
        'minimal shopping around'
      ]
    }
  }
];

// ============================================================================
// BUSINESS CONSULTING SCENARIOS
// ============================================================================

const businessConsultingScenarios: IndustryScenario[] = [
  {
    id: 'consulting_startup_limited_budget',
    industry: 'Business Consulting',
    name: 'Startup - Limited Budget',
    description: 'Early-stage startup wants enterprise consulting on startup budget',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Pre-seed startup, wants strategic help, limited cash',
    focusAreas: [
      'pricing_logic_minimum_viable',
      'qualification_stage_fit',
      'objection_handling_budget',
      'decision_making_client_readiness'
    ],
    personaTemplate: {
      budgetRange: { min: 5000, max: 25000 },
      ageRange: { min: 25, max: 40 },
      personalityOptions: [
        'ambitious but cash-strapped',
        'wants premium advice cheap',
        'doesn\'t understand consulting rates',
        'willing to offer equity instead'
      ],
      painPointOptions: [
        'raised small friends/family round',
        'needs help with pitch deck',
        'wants ongoing strategic advisor',
        'can\'t afford market rates',
        'expects consultant to be invested in success'
      ],
      timelineOptions: [
        'fundraising in 3 months',
        'need help now',
        'flexible on timeline if affordable',
        'urgent but budget-constrained'
      ]
    }
  },
  {
    id: 'consulting_scope_creep_risk',
    industry: 'Business Consulting',
    name: 'Scope Creep Risk',
    description: 'Client wants "quick strategy" but keeps expanding scope without expanding budget',
    difficulty: 'hard',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: "Simple" market analysis, but scope keeps growing',
    focusAreas: [
      'communication_scope_management',
      'pricing_logic_change_management',
      'qualification_scope_discipline',
      'decision_making_boundaries'
    ],
    personaTemplate: {
      budgetRange: { min: 15000, max: 50000 },
      ageRange: { min: 35, max: 55 },
      personalityOptions: [
        'unclear on deliverables',
        'adds requirements mid-conversation',
        'doesn\'t understand project boundaries',
        'assumes consulting is unlimited advice'
      ],
      painPointOptions: [
        'complex problem, simple view',
        'wants "just quick help" (that isn\'t quick)',
        'unclear priorities',
        'expects consultant to solve everything',
        'scope keeps expanding organically'
      ],
      timelineOptions: [
        'need deliverable in 4 weeks',
        'ongoing engagement',
        'flexible timeline',
        'phased approach possible'
      ]
    }
  },
  {
    id: 'consulting_wants_hands_on',
    industry: 'Business Consulting',
    name: 'Wants Hands-On Implementation',
    description: 'Client wants consultant to do the work, not just advise',
    difficulty: 'medium',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Wants consultant to implement, not just recommend',
    focusAreas: [
      'communication_role_clarity',
      'qualification_expectations_alignment',
      'decision_making_service_fit',
      'objection_handling_deliverable_type'
    ],
    personaTemplate: {
      budgetRange: { min: 30000, max: 100000 },
      ageRange: { min: 40, max: 60 },
      personalityOptions: [
        'wants execution not advice',
        'small internal team',
        'previous consultants "just talked"',
        'confused about consultant vs contractor'
      ],
      painPointOptions: [
        'paid for strategy deck they can\'t execute',
        'needs someone to do the work',
        'limited internal capacity',
        'wants results not recommendations',
        'frustrated with "ivory tower" consulting'
      ],
      timelineOptions: [
        'need implementation in 2-3 months',
        'ready to start immediately',
        'flexible on timeline',
        'ongoing implementation support'
      ]
    }
  },
  {
    id: 'consulting_well_funded_high_expectations',
    industry: 'Business Consulting',
    name: 'Well-Funded - High Expectations',
    description: 'Series B company with budget but demanding timelines and deliverables',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Series B company, big budget, tight timeline',
    focusAreas: [
      'communication_managing_expectations',
      'qualification_capacity_fit',
      'objection_handling_timeline',
      'pricing_logic_premium_pricing'
    ],
    personaTemplate: {
      budgetRange: { min: 100000, max: 500000 },
      ageRange: { min: 35, max: 50 },
      personalityOptions: [
        'high expectations',
        'used to big consulting firms',
        'demanding but reasonable',
        'wants best-in-class work'
      ],
      painPointOptions: [
        'board wants results fast',
        'previous consultant underdelivered',
        'high stakes decision',
        'expects McKinsey quality',
        'competitive pressure mounting'
      ],
      timelineOptions: [
        'board meeting in 6 weeks',
        'need deliverable before next quarter',
        'tight but realistic deadline',
        'will pay premium for quality + speed'
      ]
    }
  }
];

// Continue with remaining 6 industries following same pattern...
// (Marketing, Home Services, Health & Wellness, IT Services, Interior Design)

// Export all scenarios grouped by industry
export const INDUSTRY_SCENARIOS = {
  'Legal Services': legalServicesScenarios,
  'Construction & Contracting': constructionScenarios,
  'Real Estate Services': realEstateScenarios,
  'Financial Advisory': financialAdvisoryScenarios,
  'Business Consulting': businessConsultingScenarios,
  // ... remaining industries
} as const;

// Helper function to get scenarios for an industry
export function getScenariosForIndustry(industry: string): IndustryScenario[] {
  return INDUSTRY_SCENARIOS[industry as keyof typeof INDUSTRY_SCENARIOS] || [];
}

// Helper function to get a specific scenario by ID
export function getScenarioById(scenarioId: string): IndustryScenario | null {
  for (const scenarios of Object.values(INDUSTRY_SCENARIOS)) {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) return scenario;
  }
  return null;
}

// Get all scenario IDs for a given industry
export function getScenarioIds(industry: string): string[] {
  const scenarios = getScenariosForIndustry(industry);
  return scenarios.map(s => s.id);
}
```

**NOTE**: Due to length, I've shown the complete structure for 4 industries. The actual file would include all 10 industries following the same pattern. Each industry has 3-4 carefully designed scenarios with persona templates.

---

### 2.3 Persona Generator

**File**: `lib/templates/persona-generator.ts` (NEW)

```typescript
import { SimulationPersona, IndustryScenario } from '@/lib/types/scenarios';

/**
 * Generates a randomized persona based on a scenario template
 * 
 * Each time a simulation starts, this creates a unique client persona
 * within the boundaries defined by the scenario template.
 */

// Helper function to pick random item from array
function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate random number in range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to pick multiple random items
function randomMultiple<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Common first names by age group (for realism)
const FIRST_NAMES = {
  young: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Parker'],
  middle: ['Chris', 'Pat', 'Sam', 'Jamie', 'Dana', 'Cameron', 'Quinn', 'Drew'],
  older: ['Robin', 'Terry', 'Leslie', 'Tracy', 'Jesse', 'Kelly', 'Kim', 'Lee']
};

/**
 * Generate a randomized persona from a scenario template
 */
export function generatePersona(scenario: IndustryScenario): SimulationPersona {
  const template = scenario.personaTemplate;
  
  // Generate age and determine name pool
  const age = randomInRange(template.ageRange.min, template.ageRange.max);
  let namePool: string[];
  if (age < 35) namePool = FIRST_NAMES.young;
  else if (age < 55) namePool = FIRST_NAMES.middle;
  else namePool = FIRST_NAMES.older;
  
  const name = randomFromArray(namePool);
  
  // Generate budget within range
  const budgetMin = randomInRange(template.budgetRange.min, template.budgetRange.max * 0.7);
  const budgetMax = randomInRange(budgetMin, template.budgetRange.max);
  const budgetFlexibility = randomFromArray(['rigid', 'moderate', 'flexible'] as const);
  
  // Pick personality traits (2-3 random traits)
  const personalityCount = randomInRange(2, 3);
  const personality = randomMultiple(template.personalityOptions, personalityCount);
  
  // Pick pain points (2-4 random pain points)
  const painPointCount = randomInRange(2, 4);
  const painPoints = randomMultiple(template.painPointOptions, painPointCount);
  
  // Pick timeline
  const timeline = randomFromArray(template.timelineOptions);
  
  // Generate opening line based on scenario and persona
  const openingLine = generateOpeningLine(scenario, name, budgetMin, budgetMax, timeline);
  
  // Generate backstory
  const backstory = generateBackstory(scenario, name, age, personality, painPoints);
  
  return {
    name,
    age,
    budget: {
      min: budgetMin,
      max: budgetMax,
      flexibility: budgetFlexibility
    },
    timeline,
    painPoints,
    personality,
    openingLine,
    backstory
  };
}

/**
 * Generate a natural opening line for the persona
 */
function generateOpeningLine(
  scenario: IndustryScenario,
  name: string,
  budgetMin: number,
  budgetMax: number,
  timeline: string
): string {
  const templates = {
    'legal_urgent_free_consult': [
      `Hi, I'm ${name}. I have a legal issue and I'm hoping you do free consultations? I need help but want to make sure it's worth pursuing first.`,
      `Hello, ${name} here. I heard you might be able to help with my case. Do you offer a free initial consultation? I'm ${timeline}.`,
      `Hi there, I'm ${name} and I'm dealing with a legal matter. Can we talk for a bit before I commit? I understand lawyers are expensive.`
    ],
    'construction_vague_scope_tight_budget': [
      `Hi! I'm ${name} and I'm thinking about redoing my kitchen. I have some ideas from Pinterest but I'm not totally sure what I want yet. My budget is around $${budgetMin.toLocaleString()}, is that doable?`,
      `Hello, I'm ${name}. I want to remodel but I'm new to this - what can I get for around $${budgetMin.toLocaleString()} to $${budgetMax.toLocaleString()}?`,
      `Hey, ${name} here. I've been looking at renovation ideas online and I'd love to update my space. Not exactly sure on scope yet but working with a budget of about $${budgetMin.toLocaleString()}.`
    ],
    'realestate_first_buyer_overwhelmed': [
      `Hi, I'm ${name} and I'm looking to buy my first home. I honestly don't know where to start - this whole process seems really complicated. My budget is around $${budgetMin.toLocaleString()}.`,
      `Hello! My name is ${name} and I'm a first-time buyer. I'm pre-approved for about $${budgetMax.toLocaleString()} but I have so many questions. Do you work with first-timers?`,
      `Hi there, ${name} here. I've been saving up to buy a place and I'm ready to start looking, but I'm pretty overwhelmed by the whole process. Can you help guide me through it?`
    ],
    // Add templates for all scenario IDs...
  };
  
  const scenarioTemplates = templates[scenario.id as keyof typeof templates];
  if (scenarioTemplates) {
    return randomFromArray(scenarioTemplates);
  }
  
  // Fallback generic opening
  return `Hi, I'm ${name} and I'm interested in your services. ${timeline}`;
}

/**
 * Generate a backstory for internal reference (not shown to owner)
 */
function generateBackstory(
  scenario: IndustryScenario,
  name: string,
  age: number,
  personality: string[],
  painPoints: string[]
): string {
  return `${name}, ${age} years old. Personality: ${personality.join(', ')}. Key concerns: ${painPoints.join('; ')}. Found you through ${randomFromArray(['Google search', 'referral from friend', 'Yelp', 'social media', 'previous customer recommendation'])}.`;
}

/**
 * Get persona details for display (admin/debug view)
 */
export function getPersonaDisplayData(persona: SimulationPersona): Record<string, any> {
  return {
    'Name': persona.name,
    'Age': persona.age,
    'Budget Range': `$${persona.budget.min.toLocaleString()} - $${persona.budget.max.toLocaleString()}`,
    'Budget Flexibility': persona.budget.flexibility,
    'Timeline': persona.timeline,
    'Personality Traits': persona.personality.join(', '),
    'Pain Points': persona.painPoints.join('; '),
    'Backstory': persona.backstory
  };
}
```

---

### 2.4 Scenario Suggester

**File**: `lib/templates/scenario-suggester.ts` (NEW)

```typescript
import { BusinessProfile, ExtractedPatterns } from '@/lib/types/business-profile';
import { IndustryScenario, ScenarioSuggestion } from '@/lib/types/scenarios';
import { getScenariosForIndustry, getScenarioById } from './industry-scenarios';

/**
 * Scenario Suggestion Engine
 * 
 * Analyzes business profile to recommend next best scenario
 * based on what patterns are missing or under-demonstrated.
 */

interface ProfileGaps {
  communicationStyle: boolean;      // Missing or low confidence
  pricingLogic: boolean;
  qualificationCriteria: boolean;
  objectionHandling: boolean;
  decisionMaking: boolean;
  businessFacts: boolean;
  
  // Specific sub-gaps
  pricingFlexibility: boolean;
  timelineHandling: boolean;
  budgetObjections: boolean;
  competitorHandling: boolean;
  scopeManagement: boolean;
  qualityVsPrice: boolean;
}

/**
 * Analyze profile and identify gaps
 */
export function analyzeProfileGaps(profile: BusinessProfile): ProfileGaps {
  const patterns = profile.extractedPatterns as ExtractedPatterns | null;
  
  if (!patterns) {
    // No patterns at all - everything is a gap
    return {
      communicationStyle: true,
      pricingLogic: true,
      qualificationCriteria: true,
      objectionHandling: true,
      decisionMaking: true,
      businessFacts: true,
      pricingFlexibility: true,
      timelineHandling: true,
      budgetObjections: true,
      competitorHandling: true,
      scopeManagement: true,
      qualityVsPrice: true
    };
  }
  
  return {
    // High-level gaps (missing or low confidence)
    communicationStyle: !patterns.communicationStyle || 
                       patterns.communicationStyle.confidence.overall !== 'high',
    pricingLogic: !patterns.pricingLogic || 
                 patterns.pricingLogic.confidence.overall !== 'high',
    qualificationCriteria: !patterns.qualificationCriteria ||
                          patterns.qualificationCriteria.confidence.overall !== 'high',
    objectionHandling: !patterns.objectionHandling ||
                      patterns.objectionHandling.confidence.overall !== 'high',
    decisionMaking: !patterns.decisionMakingPatterns ||
                   patterns.decisionMakingPatterns.confidence.overall !== 'high',
    businessFacts: !patterns.businessFacts ||
                  !patterns.businessFacts.mentionedExperience,
    
    // Specific sub-gaps
    pricingFlexibility: !patterns.pricingLogic?.flexibilityFactors ||
                       patterns.pricingLogic?.flexibilityFactors.length === 0,
    timelineHandling: !patterns.objectionHandling?.timelineObjection ||
                     patterns.objectionHandling?.timelineObjection === 'not_demonstrated',
    budgetObjections: !patterns.objectionHandling?.priceObjection ||
                     patterns.objectionHandling?.priceObjection === 'not_demonstrated',
    competitorHandling: !patterns.objectionHandling?.competitorObjection ||
                       patterns.objectionHandling?.competitorObjection === 'not_demonstrated',
    scopeManagement: !patterns.objectionHandling?.scopeObjection ||
                    patterns.objectionHandling?.scopeObjection === 'not_demonstrated',
    qualityVsPrice: !patterns.objectionHandling?.qualityObjection ||
                   patterns.objectionHandling?.qualityObjection === 'not_demonstrated'
  };
}

/**
 * Get next recommended scenario based on profile gaps
 */
export function suggestNextScenario(profile: BusinessProfile): ScenarioSuggestion | null {
  const industry = profile.industry;
  if (!industry) return null;
  
  const availableScenarios = getScenariosForIndustry(industry);
  if (availableScenarios.length === 0) return null;
  
  // Get completed scenario IDs
  const completedScenarios = profile.completedScenarios || [];
  
  // Filter out completed scenarios
  const remainingScenarios = availableScenarios.filter(
    s => !completedScenarios.includes(s.id)
  );
  
  // If all scenarios completed, return null
  if (remainingScenarios.length === 0) return null;
  
  // Analyze gaps
  const gaps = analyzeProfileGaps(profile);
  
  // Score each remaining scenario based on how well it fills gaps
  const scoredScenarios = remainingScenarios.map(scenario => {
    let score = 0;
    const fillsGaps: string[] = [];
    
    // Check which gaps this scenario addresses
    if (scenario.focusAreas.includes('pricing_logic_flexibility') && gaps.pricingFlexibility) {
      score += 10;
      fillsGaps.push('pricing flexibility');
    }
    if (scenario.focusAreas.includes('objection_handling_timeline') && gaps.timelineHandling) {
      score += 10;
      fillsGaps.push('timeline handling');
    }
    if (scenario.focusAreas.includes('objection_handling_price') && gaps.budgetObjections) {
      score += 10;
      fillsGaps.push('budget objections');
    }
    if (scenario.focusAreas.includes('objection_handling_competitor') && gaps.competitorHandling) {
      score += 10;
      fillsGaps.push('competitor comparisons');
    }
    if (scenario.focusAreas.includes('objection_handling_scope') && gaps.scopeManagement) {
      score += 10;
      fillsGaps.push('scope management');
    }
    if (scenario.focusAreas.includes('objection_handling_quality') && gaps.qualityVsPrice) {
      score += 10;
      fillsGaps.push('quality vs price');
    }
    
    // High-level pattern gaps
    if (gaps.communicationStyle) score += 5;
    if (gaps.pricingLogic) score += 5;
    if (gaps.qualificationCriteria) score += 5;
    if (gaps.objectionHandling) score += 5;
    if (gaps.decisionMaking) score += 5;
    
    // Prioritize easier scenarios early
    if (profile.simulationCount === 0 && scenario.difficulty === 'easy') score += 15;
    if (profile.simulationCount === 1 && scenario.difficulty === 'medium') score += 10;
    if (profile.simulationCount >= 2 && scenario.difficulty === 'hard') score += 5;
    
    return {
      scenario,
      score,
      fillsGaps
    };
  });
  
  // Sort by score (highest first)
  scoredScenarios.sort((a, b) => b.score - a.score);
  
  // Get top scenario
  const top = scoredScenarios[0];
  
  // Determine priority and reason
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let reason = '';
  
  if (profile.simulationCount === 0) {
    priority = 'high';
    reason = 'Perfect starting scenario for your industry';
  } else if (top.fillsGaps.length >= 3) {
    priority = 'high';
    reason = `This scenario addresses multiple gaps: ${top.fillsGaps.join(', ')}`;
  } else if (top.fillsGaps.length >= 1) {
    priority = 'medium';
    reason = `This will help demonstrate ${top.fillsGaps.join(', ')}`;
  } else {
    priority = 'low';
    reason = 'Continuing to build your profile depth';
  }
  
  return {
    scenario: top.scenario,
    reason,
    priority,
    fillsGaps: top.fillsGaps
  };
}

/**
 * Get all suggestions (for displaying options)
 */
export function getAllSuggestions(profile: BusinessProfile): ScenarioSuggestion[] {
  const industry = profile.industry;
  if (!industry) return [];
  
  const availableScenarios = getScenariosForIndustry(industry);
  const completedScenarios = profile.completedScenarios || [];
  const gaps = analyzeProfileGaps(profile);
  
  return availableScenarios
    .filter(s => !completedScenarios.includes(s.id))
    .map(scenario => {
      const fillsGaps: string[] = [];
      let priority: 'high' | 'medium' | 'low' = 'low';
      
      // Analyze what this scenario fills
      if (scenario.focusAreas.some(area => area.includes('pricing')) && gaps.pricingLogic) {
        fillsGaps.push('pricing patterns');
        priority = 'high';
      }
      if (scenario.focusAreas.some(area => area.includes('objection')) && gaps.objectionHandling) {
        fillsGaps.push('objection handling');
        priority = priority === 'low' ? 'medium' : priority;
      }
      if (scenario.focusAreas.some(area => area.includes('qualification')) && gaps.qualificationCriteria) {
        fillsGaps.push('qualification criteria');
        priority = priority === 'low' ? 'medium' : priority;
      }
      
      return {
        scenario,
        reason: fillsGaps.length > 0 
          ? `Addresses: ${fillsGaps.join(', ')}`
          : 'Builds additional profile depth',
        priority,
        fillsGaps
      };
    })
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 2 Tasks

- [ ] **Create Industry Scenarios File**
  - [ ] Create `lib/templates/industry-scenarios.ts`
  - [ ] Define all 10 industries × 3-4 scenarios each (40 total scenarios)
  - [ ] Include persona templates for each scenario
  - [ ] Add helper functions (getScenariosForIndustry, getScenarioById)
  - [ ] Export INDUSTRY_SCENARIOS constant

- [ ] **Create Persona Generator**
  - [ ] Create `lib/templates/persona-generator.ts`
  - [ ] Implement generatePersona() function
  - [ ] Implement generateOpeningLine() for all scenarios
  - [ ] Implement generateBackstory() function
  - [ ] Add helper functions for randomization
  - [ ] Add persona display utilities

- [ ] **Create Scenario Suggester**
  - [ ] Create `lib/templates/scenario-suggester.ts`
  - [ ] Implement analyzeProfileGaps() function
  - [ ] Implement suggestNextScenario() function
  - [ ] Implement getAllSuggestions() function
  - [ ] Add gap detection logic for all pattern types
  - [ ] Add scenario scoring algorithm

- [ ] **Update Industry Templates** (backward compatibility)
  - [ ] Modify `lib/templates/industry-templates.ts`
  - [ ] Add reference to new scenario system
  - [ ] Keep existing template structure for migration
  - [ ] Add deprecation notices

- [ ] **Write Tests**
  - [ ] Test persona generation randomness
  - [ ] Test scenario suggestion logic
  - [ ] Test gap analysis accuracy
  - [ ] Test all helper functions
  - [ ] Verify all 40 scenarios load correctly

- [ ] **Integration Points**
  - [ ] Verify types from Phase 1 work with new code
  - [ ] Test scenario lookup performance
  - [ ] Validate persona data structures

---

## 🧪 TESTING REQUIREMENTS

**File**: `tests/templates/scenario-suggester.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { suggestNextScenario, analyzeProfileGaps } from '@/lib/templates/scenario-suggester';
import { BusinessProfile } from '@/lib/types/business-profile';

describe('Scenario Suggester', () => {
  it('should suggest easy scenario for first simulation', () => {
    const profile: Partial<BusinessProfile> = {
      industry: 'Legal Services',
      simulationCount: 0,
      completedScenarios: [],
      extractedPatterns: null
    };
    
    const suggestion = suggestNextScenario(profile as BusinessProfile);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.priority).toBe('high');
    expect(suggestion?.scenario.difficulty).toBe('easy');
  });
  
  it('should avoid completed scenarios', () => {
    const profile: Partial<BusinessProfile> = {
      industry: 'Legal Services',
      simulationCount: 2,
      completedScenarios: ['legal_urgent_free_consult', 'legal_lowest_rate_shopper'],
      extractedPatterns: null
    };
    
    const suggestion = suggestNextScenario(profile as BusinessProfile);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.scenario.id).not.toBe('legal_urgent_free_consult');
    expect(suggestion?.scenario.id).not.toBe('legal_lowest_rate_shopper');
  });
  
  it('should prioritize scenarios that fill gaps', () => {
    const profile: Partial<BusinessProfile> = {
      industry: 'Construction & Contracting',
      simulationCount: 1,
      completedScenarios: ['construction_vague_scope_tight_budget'],
      extractedPatterns: {
        pricingLogic: { /* has some data */ },
        objectionHandling: null,  // GAP
        // ... other fields
      }
    };
    
    const suggestion = suggestNextScenario(profile as BusinessProfile);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.fillsGaps.length).toBeGreaterThan(0);
  });
});
```

---

## 📚 REFERENCES

- Phase 1 types: `lib/types/scenarios.ts`
- Phase 1 schema: `prisma/schema.prisma`
- Existing templates: `lib/templates/industry-templates.ts`

---

## ✅ COMPLETION CRITERIA

Phase 2 is complete when:
- ✅ All 40 scenarios defined (10 industries × 4 scenarios)
- ✅ Persona generator creates unique personas
- ✅ Scenario suggester recommends appropriate next steps
- ✅ All tests passing
- ✅ TypeScript compilation successful
- ✅ Integration with Phase 1 types verified

---

**Status**: Ready for Implementation  
**Estimated Time**: 6-8 hours  
**Dependencies**: Phase 1 Complete  
**Next Phase**: Phase 3 - Initial Questionnaire
