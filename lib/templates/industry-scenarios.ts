import { IndustryScenario } from '@/lib/types/scenarios';

// ============================================================================
// LEGAL SERVICES SCENARIOS
// ============================================================================

const legalServicesScenarios: IndustryScenario[] = [
  {
    id: 'legal_urgent_free_consult',
    industry: 'Legal Services',
    name: 'Urgent Case - Wants Free Consultation',
    description: 'Client has an urgent legal matter but expects a free initial consultation',
    difficulty: 'medium',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Urgent legal case, wants free consultation first',
    focusAreas: ['pricing_boundaries', 'objection_handling_price', 'qualification_urgency', 'communication_professional'],
    personaTemplate: {
      budgetRange: { min: 2000, max: 8000 },
      ageRange: { min: 28, max: 55 },
      personalityOptions: ['skeptical and cautious', 'price-focused but stressed', 'inexperienced with lawyers', 'direct and businesslike'],
      painPointOptions: ['facing legal deadline', 'unsure if they have a case', 'talked to other lawyers already', 'worried about costs getting out of control', 'needs quick resolution'],
      timelineOptions: ['need help this week', 'court date in 2 weeks', 'urgent but flexible', 'deadline approaching fast'],
    },
  },
  {
    id: 'legal_lowest_rate_shopper',
    industry: 'Legal Services',
    name: 'Shopping for Lowest Rate',
    description: 'Client is shopping around and explicitly comparing hourly rates',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Rate shopping, comparing multiple lawyers',
    focusAreas: ['pricing_logic_flexibility', 'objection_handling_competitor', 'decision_making_value_vs_price', 'qualification_deal_breakers'],
    personaTemplate: {
      budgetRange: { min: 1500, max: 5000 },
      ageRange: { min: 25, max: 50 },
      personalityOptions: ['extremely price-conscious', 'comparing multiple quotes', 'treats lawyers as interchangeable', 'focuses on hourly rate only'],
      painPointOptions: ['got quotes from 3 other lawyers', "doesn't understand why rates vary", 'wants cheapest option', 'questions value of experience', 'sees legal help as commodity'],
      timelineOptions: ['deciding this week', 'need to file soon', 'no rush but want best deal', 'waiting on one more quote'],
    },
  },
  {
    id: 'legal_complex_budget_sensitive',
    industry: 'Legal Services',
    name: 'Complex Case - Budget Sensitive',
    description: 'Legitimate complex case but client has limited budget and is nervous about total costs',
    difficulty: 'medium',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Complex legal matter, limited budget, needs reassurance',
    focusAreas: ['pricing_logic_payment_plans', 'communication_reassurance', 'objection_handling_scope', 'qualification_budget_fit'],
    personaTemplate: {
      budgetRange: { min: 3000, max: 12000 },
      ageRange: { min: 30, max: 60 },
      personalityOptions: ['worried about runaway costs', 'needs payment plan', 'genuinely concerned about case', 'wants transparency on fees'],
      painPointOptions: ['heard horror stories about legal bills', 'fixed income or limited savings', 'case is important but budget is real', 'wants clear cost breakdown', 'concerned about hidden fees'],
      timelineOptions: ['not urgent but important', 'can start in a month', 'flexible if costs are managed', 'needs time to budget'],
    },
  },
  {
    id: 'legal_unrealistic_timeline',
    industry: 'Legal Services',
    name: 'Unrealistic Timeline Expectations',
    description: 'Client wants complex legal work done in impossibly short timeframe',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Complex case, expects it done in days',
    focusAreas: ['objection_handling_timeline', 'decision_making_saying_no', 'communication_setting_expectations', 'qualification_realistic_fit'],
    personaTemplate: {
      budgetRange: { min: 5000, max: 20000 },
      ageRange: { min: 35, max: 65 },
      personalityOptions: ['impatient and demanding', "doesn't understand legal process", 'used to fast business decisions', 'willing to pay premium for speed'],
      painPointOptions: ['facing unexpected deadline', 'assumes lawyers work like other vendors', 'frustrated with legal system', 'heard it "should be simple"', 'previous lawyer was too slow'],
      timelineOptions: ['need it done in 48 hours', 'court in 1 week', 'business deal closing fast', 'emergency situation'],
    },
  },
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
    focusAreas: ['qualification_scope_clarity', 'pricing_logic_material_flexibility', 'communication_educational', 'objection_handling_budget'],
    personaTemplate: {
      budgetRange: { min: 8000, max: 25000 },
      ageRange: { min: 28, max: 50 },
      personalityOptions: ['first-time renovator', 'inspired by social media', "doesn't know what things cost", 'wants high-end look on mid-range budget'],
      painPointOptions: ['unclear on what they actually want', 'budget is fixed but scope isn\'t', "doesn't understand trade-offs", 'expects HGTV timelines and budgets', 'overwhelmed by choices'],
      timelineOptions: ['want to start soon', 'flexible if price is right', 'targeting specific date (holiday/event)', 'no hard deadline'],
    },
  },
  {
    id: 'construction_timeline_pressure',
    industry: 'Construction & Contracting',
    name: 'Extreme Timeline Pressure',
    description: 'Client needs work done impossibly fast, willing to pay premium',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Bathroom remodel, needs it done in 2 weeks',
    focusAreas: ['objection_handling_timeline', 'pricing_logic_rush_premium', 'decision_making_realistic_fit', 'qualification_timeline_expectations'],
    personaTemplate: {
      budgetRange: { min: 15000, max: 50000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: ['impatient and demanding', 'willing to pay for speed', "doesn't understand construction timeline", 'has unrealistic expectations'],
      painPointOptions: ['in-laws visiting soon', 'house going on market', 'emergency situation (pipe burst, etc.)', 'previous contractor bailed', 'urgent need for completion'],
      timelineOptions: ['need it done in 2 weeks', 'start immediately', 'absolute deadline approaching', 'will pay premium for rush'],
    },
  },
  {
    id: 'construction_scope_creep',
    industry: 'Construction & Contracting',
    name: 'Homeowner Scope Creep Risk',
    description: 'Client starts with simple project but keeps adding requests',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Simple deck repair, but mentions many "bonus" ideas',
    focusAreas: ['communication_setting_boundaries', 'pricing_logic_change_orders', 'qualification_scope_discipline', 'decision_making_project_limits'],
    personaTemplate: {
      budgetRange: { min: 5000, max: 30000 },
      ageRange: { min: 30, max: 65 },
      personalityOptions: ['creative and spontaneous', 'sees opportunities everywhere', "doesn't understand project boundaries", 'thinks additional work is "easy to add"'],
      painPointOptions: ['wants to maximize contractor visit', 'unclear on priorities', 'budget flexible but undefined', 'lots of ideas, poor planning', 'assumes "while you\'re here" is free'],
      timelineOptions: ['flexible timeline', 'want to do it all at once', 'phased approach if needed', 'no rush but want efficiency'],
    },
  },
  {
    id: 'construction_premium_skeptic',
    industry: 'Construction & Contracting',
    name: 'Premium Quality Skeptic',
    description: 'Client wants premium work but questions why it costs more',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Full kitchen remodel, questions premium pricing',
    focusAreas: ['objection_handling_quality', 'communication_value_demonstration', 'pricing_logic_premium_justification', 'qualification_quality_vs_price'],
    personaTemplate: {
      budgetRange: { min: 30000, max: 80000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: ['wants quality but questions cost', 'comparing multiple quotes', 'sophisticated but price-conscious', 'needs value justification'],
      painPointOptions: ['got quote for half the price elsewhere', "doesn't see difference in contractors", 'wants premium outcome, not premium price', 'questions warranty value', 'skeptical of "you get what you pay for"'],
      timelineOptions: ['planning phase, not urgent', 'want to start in 2-3 months', 'flexible with right contractor', 'getting quotes before deciding'],
    },
  },
];

// ============================================================================
// REAL ESTATE SERVICES SCENARIOS
// ============================================================================

const realEstateScenarios: IndustryScenario[] = [
  {
    id: 'realestate_first_buyer_overwhelmed',
    industry: 'Real Estate Services',
    name: 'First-Time Buyer - Overwhelmed',
    description: 'First-time homebuyer overwhelmed by process, needs hand-holding',
    difficulty: 'easy',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: First-time buyer, nervous, needs guidance',
    focusAreas: ['communication_educational', 'qualification_readiness', 'objection_handling_process', 'pricing_logic_commission_questions'],
    personaTemplate: {
      budgetRange: { min: 250000, max: 500000 },
      ageRange: { min: 25, max: 35 },
      personalityOptions: ['nervous and uncertain', 'needs education on process', 'first major financial decision', 'wants trusted advisor'],
      painPointOptions: ["doesn't understand closing costs", 'confused by mortgage options', 'worried about making wrong choice', 'heard scary stories about agents', 'questions why commission is percentage'],
      timelineOptions: ['looking to buy in 3-6 months', 'just starting research', 'pre-approved and ready', 'flexible on timing'],
    },
  },
  {
    id: 'realestate_investor_haggler',
    industry: 'Real Estate Services',
    name: 'Investor - Price Haggler',
    description: 'Real estate investor looking for deals, wants to negotiate commission down',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Investor, multiple properties, wants commission discount',
    focusAreas: ['pricing_logic_volume_flexibility', 'objection_handling_commission', 'qualification_serious_buyer', 'decision_making_value_vs_volume'],
    personaTemplate: {
      budgetRange: { min: 300000, max: 2000000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: ['transactional and direct', 'experienced with agents', 'treats agents as vendors', 'volume-focused mindset'],
      painPointOptions: ['wants lower commission for volume', 'used to negotiating everything', 'compares agents solely on rate', "doesn't value relationship", 'focused on investment returns'],
      timelineOptions: ['actively looking now', 'buying multiple properties this year', 'ready to move fast on right deal', 'ongoing acquisition strategy'],
    },
  },
  {
    id: 'realestate_unrealistic_expectations',
    industry: 'Real Estate Services',
    name: 'Unrealistic Price Expectations',
    description: 'Seller has emotional attachment and unrealistic pricing expectations',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Selling family home, wants above-market price',
    focusAreas: ['communication_empathy', 'objection_handling_pricing_reality', 'qualification_realistic_seller', 'decision_making_difficult_conversations'],
    personaTemplate: {
      budgetRange: { min: 400000, max: 900000 },
      ageRange: { min: 45, max: 70 },
      personalityOptions: ['emotionally attached to property', 'remembers what neighbor sold for', 'defensive about home value', 'dismisses market data'],
      painPointOptions: ['recent renovations they overpaid for', 'sentimental value clouds judgment', "neighbor sold for more (different market)", "doesn't want to lose money", 'convinced they know better than data'],
      timelineOptions: ['not in a rush to sell', 'will wait for right price', 'market will come around', 'flexible on timing'],
    },
  },
  {
    id: 'realestate_quick_sale_pressure',
    industry: 'Real Estate Services',
    name: 'Quick Sale Pressure',
    description: 'Client needs to sell fast (job relocation, financial pressure) and is anxious',
    difficulty: 'medium',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Urgent sale needed, job relocation in 6 weeks',
    focusAreas: ['communication_reassurance', 'qualification_urgency_real', 'objection_handling_timeline', 'pricing_logic_quick_sale_strategy'],
    personaTemplate: {
      budgetRange: { min: 350000, max: 750000 },
      ageRange: { min: 30, max: 55 },
      personalityOptions: ['stressed and anxious', 'needs quick resolution', 'willing to price aggressively', 'focused on timeline over price'],
      painPointOptions: ['job starting in different city', 'carrying two mortgages', 'financial pressure mounting', "previous agent couldn't sell fast enough", 'worried about missing window'],
      timelineOptions: ['must sell in 4-6 weeks', 'job starts in 2 months', 'absolute deadline', 'will accept lower offer for speed'],
    },
  },
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
    focusAreas: ['pricing_logic_minimum_fit', 'qualification_portfolio_size', 'communication_expectations_setting', 'decision_making_client_fit'],
    personaTemplate: {
      budgetRange: { min: 30000, max: 100000 },
      ageRange: { min: 28, max: 45 },
      personalityOptions: ['early career professional', 'high expectations', 'wants personalized service', "doesn't understand fee structures"],
      painPointOptions: ['frustrated by roboadvisors', 'wants human advisor', 'expects weekly check-ins', "doesn't realize they're below minimum", 'confused why bigger firms won\'t take them'],
      timelineOptions: ['ready to transfer funds now', 'interviewing advisors this month', 'wants to start immediately', 'flexible but eager'],
    },
  },
  {
    id: 'financial_fee_skeptic',
    industry: 'Financial Advisory',
    name: 'Fee-Focused Skeptic',
    description: 'Sophisticated investor who questions every basis point of fees',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Experienced investor, fee-sensitive, DIY mindset',
    focusAreas: ['objection_handling_fees', 'communication_value_justification', 'qualification_DIY_vs_advisor', 'pricing_logic_fee_transparency'],
    personaTemplate: {
      budgetRange: { min: 500000, max: 3000000 },
      ageRange: { min: 40, max: 65 },
      personalityOptions: ['financially sophisticated', 'reads financial news daily', 'questions value of active management', 'compares to index fund fees'],
      painPointOptions: ['can get index funds for 0.04%', "doesn't see value in advice", "thinks advisors don't beat market", 'DIY investor considering help', 'wants proof of value before committing'],
      timelineOptions: ['exploring options', 'not in a rush', 'will decide based on value prop', 'currently self-managing'],
    },
  },
  {
    id: 'financial_market_timer',
    industry: 'Financial Advisory',
    name: 'Market Timer',
    description: 'Client wants to actively time the market and trade frequently',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Wants help timing market, frequent trading',
    focusAreas: ['decision_making_philosophy_fit', 'communication_education', 'qualification_investment_philosophy', 'objection_handling_strategy_mismatch'],
    personaTemplate: {
      budgetRange: { min: 200000, max: 1000000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: ['active trader mentality', 'watches market constantly', 'believes they can beat market', 'reads tips from online forums'],
      painPointOptions: ['previous advisor "too conservative"', 'wants to capitalize on volatility', "doesn't believe in buy-and-hold", 'excited by crypto and meme stocks', 'frustrated by boring portfolios'],
      timelineOptions: ['ready to move money now', 'market timing is urgent', 'wants to act on opportunities', 'impatient with slow approaches'],
    },
  },
  {
    id: 'financial_referral_ready',
    industry: 'Financial Advisory',
    name: 'Referral - Ready to Move',
    description: 'High-quality referral from existing client, pre-qualified and ready',
    difficulty: 'easy',
    estimatedDuration: '5-7 minutes',
    teaser: 'Incoming lead: Referral from top client, portfolio $1.5M',
    focusAreas: ['communication_relationship_building', 'qualification_confirming_fit', 'pricing_logic_value_proposition', 'decision_making_closing'],
    personaTemplate: {
      budgetRange: { min: 1000000, max: 5000000 },
      ageRange: { min: 45, max: 70 },
      personalityOptions: ['trusts referrer judgment', 'wants to move quickly', 'less price-sensitive', 'values relationship'],
      painPointOptions: ['unhappy with current advisor', 'friend recommended you highly', 'ready for change', 'wants more attention', 'seeking better communication'],
      timelineOptions: ['ready to start this month', 'can transfer funds quickly', 'eager to get started', 'minimal shopping around'],
    },
  },
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
    focusAreas: ['pricing_logic_minimum_viable', 'qualification_stage_fit', 'objection_handling_budget', 'decision_making_client_readiness'],
    personaTemplate: {
      budgetRange: { min: 5000, max: 25000 },
      ageRange: { min: 25, max: 40 },
      personalityOptions: ['ambitious but cash-strapped', 'wants premium advice cheap', "doesn't understand consulting rates", 'willing to offer equity instead'],
      painPointOptions: ['raised small friends/family round', 'needs help with pitch deck', 'wants ongoing strategic advisor', "can't afford market rates", 'expects consultant to be invested in success'],
      timelineOptions: ['fundraising in 3 months', 'need help now', 'flexible on timeline if affordable', 'urgent but budget-constrained'],
    },
  },
  {
    id: 'consulting_scope_creep_risk',
    industry: 'Business Consulting',
    name: 'Scope Creep Risk',
    description: 'Client wants "quick strategy" but keeps expanding scope without expanding budget',
    difficulty: 'hard',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: "Simple" market analysis, but scope keeps growing',
    focusAreas: ['communication_scope_management', 'pricing_logic_change_management', 'qualification_scope_discipline', 'decision_making_boundaries'],
    personaTemplate: {
      budgetRange: { min: 15000, max: 50000 },
      ageRange: { min: 35, max: 55 },
      personalityOptions: ['unclear on deliverables', 'adds requirements mid-conversation', "doesn't understand project boundaries", 'assumes consulting is unlimited advice'],
      painPointOptions: ['complex problem, simple view', 'wants "just quick help" (that isn\'t quick)', 'unclear priorities', 'expects consultant to solve everything', 'scope keeps expanding organically'],
      timelineOptions: ['need deliverable in 4 weeks', 'ongoing engagement', 'flexible timeline', 'phased approach possible'],
    },
  },
  {
    id: 'consulting_wants_hands_on',
    industry: 'Business Consulting',
    name: 'Wants Hands-On Implementation',
    description: 'Client wants consultant to do the work, not just advise',
    difficulty: 'medium',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Wants consultant to implement, not just recommend',
    focusAreas: ['communication_role_clarity', 'qualification_expectations_alignment', 'decision_making_service_fit', 'objection_handling_deliverable_type'],
    personaTemplate: {
      budgetRange: { min: 30000, max: 100000 },
      ageRange: { min: 40, max: 60 },
      personalityOptions: ['wants execution not advice', 'small internal team', 'previous consultants "just talked"', 'confused about consultant vs contractor'],
      painPointOptions: ['paid for strategy deck they can\'t execute', 'needs someone to do the work', 'limited internal capacity', 'wants results not recommendations', 'frustrated with "ivory tower" consulting'],
      timelineOptions: ['need implementation in 2-3 months', 'ready to start immediately', 'flexible on timeline', 'ongoing implementation support'],
    },
  },
  {
    id: 'consulting_well_funded_high_expectations',
    industry: 'Business Consulting',
    name: 'Well-Funded - High Expectations',
    description: 'Series B company with budget but demanding timelines and deliverables',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Series B company, big budget, tight timeline',
    focusAreas: ['communication_managing_expectations', 'qualification_capacity_fit', 'objection_handling_timeline', 'pricing_logic_premium_pricing'],
    personaTemplate: {
      budgetRange: { min: 100000, max: 500000 },
      ageRange: { min: 35, max: 50 },
      personalityOptions: ['high expectations', 'used to big consulting firms', 'demanding but reasonable', 'wants best-in-class work'],
      painPointOptions: ['board wants results fast', 'previous consultant underdelivered', 'high stakes decision', 'expects McKinsey quality', 'competitive pressure mounting'],
      timelineOptions: ['board meeting in 6 weeks', 'need deliverable before next quarter', 'tight but realistic deadline', 'will pay premium for quality + speed'],
    },
  },
];

// ============================================================================
// MARKETING & CREATIVE SCENARIOS
// ============================================================================

const marketingCreativeScenarios: IndustryScenario[] = [
  {
    id: 'marketing_unclear_brief_low_budget',
    industry: 'Marketing & Creative Agencies',
    name: 'Unclear Brief - Low Budget',
    description: 'Client wants impressive results but has vague goals and tight budget',
    difficulty: 'medium',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: "We need marketing" — no brief, tiny budget',
    focusAreas: ['qualification_scope_clarity', 'pricing_boundaries', 'communication_educational', 'decision_making_client_readiness'],
    personaTemplate: {
      budgetRange: { min: 2000, max: 10000 },
      ageRange: { min: 28, max: 50 },
      personalityOptions: ['vague about goals', 'expects big results for small budget', 'never worked with agency before', 'confuses marketing tactics with strategy'],
      painPointOptions: ["doesn't know what they want", 'compares to DIY options', 'wants to go viral overnight', 'no defined target audience', 'previous agency disappointed them'],
      timelineOptions: ['want results in 2 weeks', 'no clear deadline', 'need to launch yesterday', 'flexible if results guaranteed'],
    },
  },
  {
    id: 'marketing_wants_everything_yesterday',
    industry: 'Marketing & Creative Agencies',
    name: 'Wants Everything Yesterday',
    description: 'Client has a massive scope but unrealistic turnaround expectations',
    difficulty: 'hard',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Full rebrand + website + ads — in 2 weeks',
    focusAreas: ['objection_handling_timeline', 'pricing_logic_rush_premium', 'communication_setting_expectations', 'qualification_realistic_fit'],
    personaTemplate: {
      budgetRange: { min: 20000, max: 80000 },
      ageRange: { min: 32, max: 55 },
      personalityOptions: ['driven and impatient', 'treats creative work like commodity', 'has seen competitors move fast', 'used to tech startup speed'],
      painPointOptions: ['product launch approaching', 'missed previous deadline', 'board pressure to show progress', 'compares to freelancer speed', 'underestimates creative process'],
      timelineOptions: ['product launches in 3 weeks', 'investor meeting next month', 'conference demo approaching', 'ASAP no exceptions'],
    },
  },
  {
    id: 'marketing_micromanager',
    industry: 'Marketing & Creative Agencies',
    name: 'Micro-Manager Client',
    description: 'Client wants to approve every word, color, and pixel — killing creative flow',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Needs campaign, wants to review everything before launch',
    focusAreas: ['communication_role_clarity', 'qualification_creative_freedom', 'pricing_logic_revision_limits', 'decision_making_client_fit'],
    personaTemplate: {
      budgetRange: { min: 15000, max: 60000 },
      ageRange: { min: 38, max: 60 },
      personalityOptions: ['detail-oriented perfectionist', 'has been burned before', 'struggles to delegate', 'very opinionated on design'],
      painPointOptions: ['previous agency went rogue', 'spent money on work they hated', 'CEO insists on final approval', 'brand guidelines very strict', 'worried about public image'],
      timelineOptions: ['flexible if done right', '3-month campaign', 'ongoing relationship', 'willing to take time for quality'],
    },
  },
  {
    id: 'marketing_brand_overhaul_big_budget',
    industry: 'Marketing & Creative Agencies',
    name: 'Brand Overhaul - Big Budget',
    description: 'Well-funded company wants complete rebrand, evaluating multiple agencies',
    difficulty: 'easy',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Complete rebrand, $100k+ budget, evaluating agencies',
    focusAreas: ['communication_relationship_building', 'qualification_confirming_fit', 'pricing_logic_value_proposition', 'decision_making_closing'],
    personaTemplate: {
      budgetRange: { min: 80000, max: 300000 },
      ageRange: { min: 40, max: 60 },
      personalityOptions: ['strategic and experienced', 'evaluating multiple agencies', 'values process and portfolio', 'wants long-term partner'],
      painPointOptions: ['brand feels outdated', 'losing to competitors visually', 'new CEO wants fresh start', 'entering new market', 'IPO or acquisition approaching'],
      timelineOptions: ['6-month project', 'starting in Q2', 'board approved budget', 'looking for right partner'],
    },
  },
];

// ============================================================================
// HOME SERVICES SCENARIOS
// ============================================================================

const homeServicesScenarios: IndustryScenario[] = [
  {
    id: 'homeservices_emergency_price_shopper',
    industry: 'Home Services',
    name: 'Emergency Fix - Price Shopper',
    description: 'Urgent repair needed but client is still price-shopping during the emergency',
    difficulty: 'medium',
    estimatedDuration: '5-8 minutes',
    teaser: 'Incoming lead: Burst pipe, calling 3 plumbers for cheapest quote',
    focusAreas: ['pricing_boundaries', 'objection_handling_price', 'qualification_urgency', 'communication_professional'],
    personaTemplate: {
      budgetRange: { min: 300, max: 2500 },
      ageRange: { min: 28, max: 65 },
      personalityOptions: ['panicked but price-focused', 'comparing quotes mid-crisis', 'questions emergency premium', 'wants immediate response'],
      painPointOptions: ['water actively leaking', 'afraid of being gouged', 'previous service was overpriced', 'on tight budget', 'neighbors warned about price inflation'],
      timelineOptions: ['need someone now', 'can wait 2 hours max', 'basement flooding', 'urgent same-day only'],
    },
  },
  {
    id: 'homeservices_preventive_skeptic',
    industry: 'Home Services',
    name: 'Preventive Maintenance Skeptic',
    description: 'Client questions whether preventive maintenance is really necessary',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: HVAC tune-up offer, skeptical about necessity',
    focusAreas: ['communication_value_demonstration', 'objection_handling_necessity', 'pricing_logic_value_vs_cost', 'qualification_homeowner_type'],
    personaTemplate: {
      budgetRange: { min: 150, max: 800 },
      ageRange: { min: 35, max: 65 },
      personalityOptions: ['DIY-minded homeowner', 'skeptical of upsells', '"if it ain\'t broke" mentality', 'questions everything'],
      painPointOptions: ['thinks maintenance is just money grab', 'HVAC working fine right now', 'was burned by unnecessary repairs', 'reads DIY forums', "doesn't trust service industry"],
      timelineOptions: ['calling for second opinion', 'might do it themselves', 'considering it but not urgent', 'comparing to DIY cost'],
    },
  },
  {
    id: 'homeservices_diy_gone_wrong',
    industry: 'Home Services',
    name: 'DIY Gone Wrong',
    description: 'Homeowner attempted DIY repair and made it worse, needs professional rescue',
    difficulty: 'easy',
    estimatedDuration: '5-8 minutes',
    teaser: 'Incoming lead: Tried to fix it themselves, now it\'s worse',
    focusAreas: ['communication_empathy', 'qualification_damage_assessment', 'pricing_logic_repair_complexity', 'objection_handling_blame'],
    personaTemplate: {
      budgetRange: { min: 500, max: 3000 },
      ageRange: { min: 25, max: 55 },
      personalityOptions: ['embarrassed but defensive', 'willing to pay now', 'just wants it fixed', 'learned their lesson'],
      painPointOptions: ['watched YouTube tutorial, failed', 'made small problem bigger', 'partner is angry about the mess', 'already spent money on parts', 'needs professional rescue'],
      timelineOptions: ['need it fixed today', 'wife/husband is upset', 'scheduled repair window', 'as soon as possible'],
    },
  },
  {
    id: 'homeservices_premium_upgrade_budget_conscious',
    industry: 'Home Services',
    name: 'Premium Upgrade - Budget Conscious',
    description: 'Client wants high-end upgrade but hesitates on the premium price',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Wants smart home upgrade, nervous about cost',
    focusAreas: ['objection_handling_price', 'communication_value_demonstration', 'pricing_logic_financing', 'qualification_upgrade_readiness'],
    personaTemplate: {
      budgetRange: { min: 3000, max: 15000 },
      ageRange: { min: 30, max: 55 },
      personalityOptions: ['wants the best but budget-aware', 'influenced by neighbor\'s upgrade', 'researched options online', 'open to financing'],
      painPointOptions: ['neighbor has smart thermostat and loves it', 'current system is old but working', 'worried about ROI', 'spouse is skeptical of spending', 'not sure which products are worth it'],
      timelineOptions: ['thinking about it for summer', 'home going on market in a year', 'want it before winter', 'whenever makes financial sense'],
    },
  },
];

// ============================================================================
// HEALTH & WELLNESS COACHING SCENARIOS
// ============================================================================

const healthWellnessScenarios: IndustryScenario[] = [
  {
    id: 'health_quick_fix_mindset',
    industry: 'Health & Wellness Coaching',
    name: 'Quick Fix Mindset',
    description: 'Client wants dramatic results in unrealistic timeframe',
    difficulty: 'hard',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Wants to lose 30 lbs in 6 weeks',
    focusAreas: ['communication_setting_expectations', 'objection_handling_timeline', 'qualification_commitment_level', 'decision_making_client_fit'],
    personaTemplate: {
      budgetRange: { min: 500, max: 3000 },
      ageRange: { min: 25, max: 50 },
      personalityOptions: ['wants instant results', 'has tried many quick fixes', 'impatient and easily frustrated', 'motivated but unrealistic'],
      painPointOptions: ['wedding/event coming up', 'tried every diet already', 'doctor told them to lose weight', 'clothes don\'t fit', 'summer approaching'],
      timelineOptions: ['need results in 6 weeks', 'event in 2 months', 'ready to start tomorrow', 'committed for 30 days'],
    },
  },
  {
    id: 'health_price_vs_value',
    industry: 'Health & Wellness Coaching',
    name: 'Price vs Value Conflict',
    description: 'Client sees value but struggles to justify coaching cost',
    difficulty: 'medium',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Interested but says coaching is "expensive"',
    focusAreas: ['objection_handling_price', 'communication_value_justification', 'pricing_logic_ROI', 'qualification_investment_mindset'],
    personaTemplate: {
      budgetRange: { min: 800, max: 5000 },
      ageRange: { min: 30, max: 55 },
      personalityOptions: ['values health but budget-cautious', 'compares to YouTube free content', 'has considered it for months', 'needs ROI justification'],
      painPointOptions: ['gym membership cheaper option exists', 'free apps available', 'partner questions the expense', 'income uncertainty', 'been thinking about it for 6 months'],
      timelineOptions: ['waiting for right time financially', 'could start next month', 'flexible if convinced', 'want to try one session first'],
    },
  },
  {
    id: 'health_commitment_issues',
    industry: 'Health & Wellness Coaching',
    name: 'Commitment Issues',
    description: 'Client is interested but has track record of not following through',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Excited about coaching but has quit programs before',
    focusAreas: ['qualification_consistency_level', 'communication_realistic_expectations', 'decision_making_client_readiness', 'objection_handling_past_failures'],
    personaTemplate: {
      budgetRange: { min: 1000, max: 4000 },
      ageRange: { min: 28, max: 52 },
      personalityOptions: ['enthusiastic but inconsistent', 'self-aware about pattern', 'needs accountability structure', 'has good intentions, poor follow-through'],
      painPointOptions: ['quit last 3 programs', 'life gets in the way', 'travel and work schedule', 'family obligations', 'starts strong, fades after month 1'],
      timelineOptions: ['this is the year', 'starting January', 'after this project ends', 'ready whenever they can commit'],
    },
  },
  {
    id: 'health_ready_to_transform',
    industry: 'Health & Wellness Coaching',
    name: 'Ready to Transform',
    description: 'Highly motivated client with realistic expectations — ideal client',
    difficulty: 'easy',
    estimatedDuration: '5-8 minutes',
    teaser: 'Incoming lead: Doctor\'s orders, fully committed, budget available',
    focusAreas: ['communication_relationship_building', 'qualification_confirming_fit', 'pricing_logic_package_selection', 'decision_making_closing'],
    personaTemplate: {
      budgetRange: { min: 2000, max: 8000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: ['seriously motivated', 'realistic about process', 'has support system', 'researched coaches extensively'],
      painPointOptions: ['doctor gave wake-up call', 'milestone birthday approaching', 'health scare in family', 'wants to be there for kids', 'career demands high energy'],
      timelineOptions: ['ready to start this week', 'committed for 6 months', 'budget approved by spouse', 'all in'],
    },
  },
];

// ============================================================================
// IT & TECHNOLOGY SERVICES SCENARIOS
// ============================================================================

const itTechScenarios: IndustryScenario[] = [
  {
    id: 'it_break_fix_only',
    industry: 'IT & Technology Services',
    name: 'Break-Fix Only Client',
    description: 'Client only wants to pay when something breaks, resists managed services',
    difficulty: 'medium',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: "Just fix it when it breaks, I don\'t need a contract"',
    focusAreas: ['pricing_logic_managed_vs_breakfix', 'objection_handling_contract', 'communication_value_demonstration', 'qualification_risk_tolerance'],
    personaTemplate: {
      budgetRange: { min: 500, max: 5000 },
      ageRange: { min: 35, max: 65 },
      personalityOptions: ['cost-focused small business owner', '"if it ain\'t broke" mentality', 'independent and resistant', 'had bad MSP experience'],
      painPointOptions: ["doesn't see value in proactive IT", 'previous MSP overcharged', 'small business, limited budget', 'only 5 computers', 'refuses ongoing commitment'],
      timelineOptions: ['needs help now with specific issue', 'one-time project', 'no contract preference', 'call when needed'],
    },
  },
  {
    id: 'it_cheap_msp_burnout',
    industry: 'IT & Technology Services',
    name: 'Cheap MSP Burnout',
    description: 'Client burned by low-cost provider, wants better service but is still price-focused',
    difficulty: 'medium',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Left offshore IT support after disaster, now comparing prices',
    focusAreas: ['objection_handling_price', 'communication_value_demonstration', 'qualification_pain_level', 'pricing_logic_quality_vs_cost'],
    personaTemplate: {
      budgetRange: { min: 2000, max: 15000 },
      ageRange: { min: 32, max: 58 },
      personalityOptions: ['burned and skeptical', 'wants premium but trained on price', 'comparing all options', 'has war stories from bad provider'],
      painPointOptions: ['offshore support couldn\'t solve problems', 'downtime cost them clients', 'data breach scare', 'response times were terrible', 'communication was impossible'],
      timelineOptions: ['switching immediately', 'contract ends in 30 days', 'ready if price is right', 'wants to start ASAP'],
    },
  },
  {
    id: 'it_growth_scaling',
    industry: 'IT & Technology Services',
    name: 'Growth Company - Scaling',
    description: 'Fast-growing company with IT infrastructure that hasn\'t kept up',
    difficulty: 'easy',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Grew from 5 to 50 employees, IT is chaos',
    focusAreas: ['qualification_growth_needs', 'communication_strategic_partnership', 'pricing_logic_scalable_solution', 'decision_making_long_term_fit'],
    personaTemplate: {
      budgetRange: { min: 5000, max: 30000 },
      ageRange: { min: 30, max: 50 },
      personalityOptions: ['growth-focused and ambitious', 'infrastructure overwhelm', 'wants to move fast', 'open to investment'],
      painPointOptions: ['onboarding new staff takes too long', 'security risks from rapid growth', 'no IT documentation exists', 'founder is the IT person', 'staff complaining about slow systems'],
      timelineOptions: ['hiring 10 more people next quarter', 'need infrastructure now', 'already behind on this', 'wants to fix before it gets worse'],
    },
  },
  {
    id: 'it_security_reactive',
    industry: 'IT & Technology Services',
    name: 'Security Incident Reactive',
    description: 'Company just had a security incident and is now scrambling for protection',
    difficulty: 'easy',
    estimatedDuration: '5-8 minutes',
    teaser: 'Incoming lead: Just got hit with ransomware, needs security overhaul',
    focusAreas: ['qualification_urgency_real', 'pricing_logic_security_investment', 'communication_reassurance', 'decision_making_immediate_action'],
    personaTemplate: {
      budgetRange: { min: 5000, max: 50000 },
      ageRange: { min: 35, max: 60 },
      personalityOptions: ['scared and motivated', 'budget is now approved', 'regrets not acting sooner', 'wants comprehensive solution'],
      painPointOptions: ['ransomware encrypted their files', 'paid ransom or lost data', 'customers were notified', 'CEO is demanding action', 'insurance requires security audit'],
      timelineOptions: ['needs help immediately', 'board meeting next week', 'must show action within 30 days', 'security audit required by contract'],
    },
  },
];

// ============================================================================
// INTERIOR DESIGN SCENARIOS
// ============================================================================

const interiorDesignScenarios: IndustryScenario[] = [
  {
    id: 'design_pinterest_ikea_budget',
    industry: 'Interior Design',
    name: 'Pinterest Inspired - IKEA Budget',
    description: 'Client has luxury design dreams but furniture-store budget',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: Wants Restoration Hardware look on IKEA budget',
    focusAreas: ['pricing_boundaries', 'communication_setting_expectations', 'qualification_budget_realistic', 'objection_handling_budget'],
    personaTemplate: {
      budgetRange: { min: 3000, max: 15000 },
      ageRange: { min: 26, max: 45 },
      personalityOptions: ['visually inspired but budget-limited', 'addicted to Pinterest/Instagram', 'first-time homeowner', "doesn't understand design fees"],
      painPointOptions: ['has 500 saved Pinterest pins', 'thinks designers just shop for furniture', "doesn't understand why design costs money", 'IKEA is their reference point', 'moved into first home'],
      timelineOptions: ['want it done before holidays', 'flexible but excited', 'needs one room at a time', 'want to start with living room'],
    },
  },
  {
    id: 'design_style_indecisive',
    industry: 'Interior Design',
    name: 'Style Indecisive',
    description: 'Client likes everything and nothing — keeps changing direction',
    difficulty: 'hard',
    estimatedDuration: '7-12 minutes',
    teaser: 'Incoming lead: "I love it all — modern AND rustic AND minimalist"',
    focusAreas: ['communication_direction_setting', 'qualification_decision_making_style', 'pricing_logic_revision_limits', 'decision_making_client_fit'],
    personaTemplate: {
      budgetRange: { min: 15000, max: 80000 },
      ageRange: { min: 30, max: 55 },
      personalityOptions: ['indecisive and easily influenced', 'loves all styles simultaneously', 'changes mind after each Instagram scroll', 'seeks constant validation'],
      painPointOptions: ['previous designer got frustrated', 'project dragged on for a year', 'husband and wife have different tastes', 'overwhelmed by choices', 'spends hours on Houzz changing mind'],
      timelineOptions: ['whenever we agree on direction', 'flexible but moving to new home', '6-month project', 'open-ended timeline'],
    },
  },
  {
    id: 'design_timeline_unrealistic',
    industry: 'Interior Design',
    name: 'Timeline Unrealistic',
    description: 'Client wants full design and installation completed before an event',
    difficulty: 'medium',
    estimatedDuration: '5-10 minutes',
    teaser: 'Incoming lead: Full living room design, done in 3 weeks (party coming)',
    focusAreas: ['objection_handling_timeline', 'pricing_logic_rush_premium', 'communication_setting_expectations', 'qualification_realistic_scope'],
    personaTemplate: {
      budgetRange: { min: 20000, max: 60000 },
      ageRange: { min: 35, max: 58 },
      personalityOptions: ['event-driven urgency', 'type-A planner', 'expects miracles on demand', 'willing to pay rush fees'],
      painPointOptions: ['hosting 50-person party in 4 weeks', 'just moved in and has nothing', 'in-laws visiting from abroad', 'husband surprised her with party invite', 'wants to impress specific person'],
      timelineOptions: ['party in exactly 4 weeks', 'event is non-negotiable', 'will pay for rush', 'needs key pieces at minimum'],
    },
  },
  {
    id: 'design_full_remodel_premium',
    industry: 'Interior Design',
    name: 'Full Remodel - Premium',
    description: 'Ideal client: full budget, clear vision, ready to commit',
    difficulty: 'easy',
    estimatedDuration: '7-10 minutes',
    teaser: 'Incoming lead: Full home redesign, referred by past client, $200k budget',
    focusAreas: ['communication_relationship_building', 'qualification_confirming_fit', 'pricing_logic_scope_definition', 'decision_making_project_start'],
    personaTemplate: {
      budgetRange: { min: 100000, max: 500000 },
      ageRange: { min: 42, max: 65 },
      personalityOptions: ['decisive and experienced', 'values quality and expertise', 'clear aesthetic vision', 'great referral client'],
      painPointOptions: ['bought dream home that needs work', 'previous designer moved away', 'wants consistent partner for long project', 'has specific pieces to incorporate', 'complex multi-room project'],
      timelineOptions: ['12-18 month project', 'ready to sign this month', 'phased by room', 'starting with primary suite and kitchen'],
    },
  },
];

// ============================================================================
// EXPORT ALL SCENARIOS
// ============================================================================

export const INDUSTRY_SCENARIOS: Record<string, IndustryScenario[]> = {
  'Legal Services': legalServicesScenarios,
  'Construction & Contracting': constructionScenarios,
  'Real Estate Services': realEstateScenarios,
  'Financial Advisory': financialAdvisoryScenarios,
  'Business Consulting': businessConsultingScenarios,
  'Marketing & Creative Agencies': marketingCreativeScenarios,
  'Home Services': homeServicesScenarios,
  'Health & Wellness Coaching': healthWellnessScenarios,
  'IT & Technology Services': itTechScenarios,
  'Interior Design': interiorDesignScenarios,
};

export const INDUSTRY_LIST = Object.keys(INDUSTRY_SCENARIOS);

export function getScenariosForIndustry(industry: string): IndustryScenario[] {
  return INDUSTRY_SCENARIOS[industry] ?? [];
}

export function getScenarioById(scenarioId: string): IndustryScenario | null {
  for (const scenarios of Object.values(INDUSTRY_SCENARIOS)) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) return scenario;
  }
  return null;
}

export function getScenarioIds(industry: string): string[] {
  return getScenariosForIndustry(industry).map((s) => s.id);
}

export function getAllScenarios(): IndustryScenario[] {
  return Object.values(INDUSTRY_SCENARIOS).flat();
}
