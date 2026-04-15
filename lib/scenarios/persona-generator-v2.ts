/**
 * Universal Persona Generator
 *
 * Generates industry-specific prospect personas based on:
 * - Universal scenario rules
 * - Tenant's business vertical
 * - Business profile context
 */

import { UniversalScenario, ScenarioType } from './mandatory-scenarios';

export interface GeneratedPersona {
  name: string;
  role: string;
  company: string;
  companySize: string;

  painPoints: string[];
  budget: string;
  timeline: string;
  priorExperience: string;

  openingMessage: string;

  personality: string;
  communicationStyle: string;
  technicalLevel: string;

  objectionsToRaise: string[];
}

interface IndustryContext {
  companyTypes: string[];
  painTypes: {
    critical: string[];
    moderate: string[];
    minor: string[];
  };
  budgetRanges: {
    tight: string;
    moderate: string;
    approved: string;
    flexible: string;
  };
  roleTypes: string[];
}

const INDUSTRY_CONTEXTS: Record<string, IndustryContext> = {
  'Legal Services': {
    companyTypes: ['small business', 'startup', 'mid-size company', 'enterprise'],
    painTypes: {
      critical: ['contract dispute threatening major loss', 'regulatory compliance violation', 'litigation risk'],
      moderate: ['contract review backlog', 'IP protection needs', 'employment law questions'],
      minor: ['general legal advice', 'document templates', 'consultation'],
    },
    budgetRanges: {
      tight: '$1,000-2,000',
      moderate: '$3,000-7,000',
      approved: '$8,000-15,000',
      flexible: '$15,000+',
    },
    roleTypes: ['CEO', 'CFO', 'Operations Manager', 'Business Owner'],
  },
  'Construction & Contracting': {
    companyTypes: ['homeowner', 'property management company', 'commercial developer', 'general contractor'],
    painTypes: {
      critical: ['project delay costing thousands per day', 'failed inspection', 'contractor walked off job'],
      moderate: ['renovation estimate needed', 'permit issues', 'subcontractor coordination'],
      minor: ['maintenance quote', 'small repair', 'consultation'],
    },
    budgetRanges: {
      tight: '$5,000-10,000',
      moderate: '$15,000-35,000',
      approved: '$40,000-80,000',
      flexible: '$100,000+',
    },
    roleTypes: ['Homeowner', 'Property Manager', 'Project Manager', 'Developer'],
  },
  'Real Estate Services': {
    companyTypes: ['first-time buyer', 'investor', 'commercial buyer', 'property owner'],
    painTypes: {
      critical: ['closing deadline approaching', 'lost dream property', 'market moving fast'],
      moderate: ['looking to buy in 2-3 months', 'want to sell soon', 'portfolio expansion'],
      minor: ['market research', 'casual browsing', 'valuation curiosity'],
    },
    budgetRanges: {
      tight: '$200,000-350,000',
      moderate: '$400,000-700,000',
      approved: '$750,000-1.5M',
      flexible: '$2M+',
    },
    roleTypes: ['Buyer', 'Seller', 'Investor', 'Business Owner'],
  },
  'Financial Advisory': {
    companyTypes: ['young professional', 'mid-career', 'pre-retiree', 'business owner'],
    painTypes: {
      critical: ['retirement portfolio underwater', 'unexpected tax burden', 'business valuation for sale'],
      moderate: ['retirement planning', 'investment strategy', 'estate planning'],
      minor: ['financial checkup', 'savings advice', 'general questions'],
    },
    budgetRanges: {
      tight: '$1,000-3,000',
      moderate: '$5,000-10,000',
      approved: '$12,000-25,000',
      flexible: '$30,000+',
    },
    roleTypes: ['Professional', 'Executive', 'Business Owner', 'Retiree'],
  },
  'Business Consulting': {
    companyTypes: ['startup', 'small business', 'mid-size company', 'enterprise'],
    painTypes: {
      critical: ['revenue declining 30%', 'team dysfunction', 'operational crisis'],
      moderate: ['growth planning', 'process optimization', 'strategy development'],
      minor: ['general advice', 'workshop request', 'exploratory call'],
    },
    budgetRanges: {
      tight: '$3,000-7,000',
      moderate: '$10,000-20,000',
      approved: '$25,000-50,000',
      flexible: '$75,000+',
    },
    roleTypes: ['Founder', 'CEO', 'Operations Director', 'Department Head'],
  },
  'Marketing & Creative Agencies': {
    companyTypes: ['startup', 'local business', 'mid-size company', 'enterprise'],
    painTypes: {
      critical: ['product launch in 4 weeks', 'rebrand needed urgently', 'campaign failed'],
      moderate: ['need ongoing marketing', 'website redesign', 'brand identity work'],
      minor: ['logo design', 'social media help', 'consultation'],
    },
    budgetRanges: {
      tight: '$2,000-5,000',
      moderate: '$8,000-15,000',
      approved: '$20,000-40,000',
      flexible: '$50,000+',
    },
    roleTypes: ['Founder', 'Marketing Director', 'Product Manager', 'CEO'],
  },
  'Home Services': {
    companyTypes: ['homeowner', 'rental property owner', 'property manager', 'business owner'],
    painTypes: {
      critical: ['emergency repair needed', 'tenant complaint urgent', 'system failure'],
      moderate: ['seasonal maintenance', 'upgrade project', 'inspection needed'],
      minor: ['quote request', 'preventive maintenance', 'general question'],
    },
    budgetRanges: {
      tight: '$500-1,500',
      moderate: '$2,000-5,000',
      approved: '$6,000-12,000',
      flexible: '$15,000+',
    },
    roleTypes: ['Homeowner', 'Property Manager', 'Landlord', 'Facility Manager'],
  },
  'Health & Wellness Coaching': {
    companyTypes: ['individual', 'couple', 'small group', 'corporate wellness'],
    painTypes: {
      critical: ['health scare', 'relationship crisis', 'burnout'],
      moderate: ['weight loss goals', 'stress management', 'life transition'],
      minor: ['curiosity', 'maintenance', 'exploration'],
    },
    budgetRanges: {
      tight: '$500-1,200',
      moderate: '$1,500-3,000',
      approved: '$3,500-7,000',
      flexible: '$10,000+',
    },
    roleTypes: ['Individual', 'Professional', 'Executive', 'Team Leader'],
  },
  'IT & Technology Services': {
    companyTypes: ['small business', 'mid-size company', 'enterprise', 'startup'],
    painTypes: {
      critical: ['systems down', 'security breach', 'data loss'],
      moderate: ['slow performance', 'outdated infrastructure', 'scaling needs'],
      minor: ['IT assessment', 'consultation', 'minor upgrade'],
    },
    budgetRanges: {
      tight: '$1,500-3,000',
      moderate: '$4,000-8,000',
      approved: '$10,000-20,000',
      flexible: '$25,000+',
    },
    roleTypes: ['CEO', 'Operations Manager', 'IT Manager', 'CFO'],
  },
  'Interior Design': {
    companyTypes: ['homeowner', 'business owner', 'developer', 'property investor'],
    painTypes: {
      critical: ['renovation deadline approaching', 'space unusable', 'design disaster'],
      moderate: ['home refresh', 'office redesign', 'staging for sale'],
      minor: ['consultation', 'color advice', 'furniture selection'],
    },
    budgetRanges: {
      tight: '$3,000-8,000',
      moderate: '$10,000-25,000',
      approved: '$30,000-60,000',
      flexible: '$75,000+',
    },
    roleTypes: ['Homeowner', 'Business Owner', 'Developer', 'Property Manager'],
  },
};

const FIRST_NAMES = ['Sarah', 'Michael', 'Jennifer', 'David', 'Emily', 'James', 'Lisa', 'Robert', 'Jessica', 'John'];
const LAST_NAMES = ['Chen', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];

type GreetingMap = Record<ScenarioType, (ctx: GreetingCtx) => string>;
interface GreetingCtx {
  name: string;
  role: string;
  companyType: string;
  pain: string;
}

const GREETINGS: Record<string, GreetingMap> = {
  'Legal Services': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. We have ${c.pain} and need legal help immediately. Can you assist?`,
    PRICE_OBJECTION: () => `Hello, I'm looking for legal services. I got a quote from you and another firm — yours is higher. Why should we go with you?`,
    WRONG_FIT: (c) => `Hi, we're a ${c.companyType} and need occasional legal advice. What would basic support cost?`,
    SKEPTICAL_LEAD: (c) => `I'm ${c.name}. We used a lawyer before and it was a disaster — overcharged, poor communication. How are you different?`,
    COMPETITOR_COMPARISON: () => `Hi, we're comparing three law firms for ongoing support. What makes your practice stand out?`,
    BUSY_NOT_READY: () => `Your services look good, but we're swamped with other priorities right now. Maybe in a few months?`,
    CONFUSED_LEAD: () => `Hi, we're having some legal issues but I'm not sure exactly what we need. Can you help figure that out?`,
    TECHNICAL_ADAPTATION: (c) => `I'm ${c.name}, ${c.role}. We need help with ${c.pain.toLowerCase()}. What's your approach to this type of case?`,
  },
  'Construction & Contracting': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. We've got ${c.pain} and need a contractor who can start this week. Are you available?`,
    PRICE_OBJECTION: () => `I got your estimate and another one 30% lower. Both cover the same work. Why the difference?`,
    WRONG_FIT: () => `Hi, we need some small repairs around the house. What do you charge for handyman-type work?`,
    SKEPTICAL_LEAD: () => `Our last contractor was a nightmare — delays, cost overruns, poor quality. How do I know you won't be the same?`,
    COMPETITOR_COMPARISON: () => `We're getting bids from three contractors. You're the highest. What am I getting for that extra cost?`,
    BUSY_NOT_READY: () => `This project sounds great but we're in the middle of selling our business. Can we reconnect in Q3?`,
    CONFUSED_LEAD: (c) => `Our ${c.companyType} has some issues but I'm not sure if it's structural, cosmetic, or what. Where do we even start?`,
    TECHNICAL_ADAPTATION: (c) => `I'm ${c.name}. We need ${c.pain.toLowerCase()}. I've worked with contractors before — what's your timeline and process?`,
  },
  'Real Estate Services': {
    HOT_LEAD: (c) => `Hi, ${c.name} here. I've got ${c.pain} and need to move fast. Can you help me today?`,
    PRICE_OBJECTION: () => `Your commission is higher than another agent I spoke with. Why should I pay more?`,
    WRONG_FIT: () => `I'm just casually looking at what's out there. Not really ready to buy for at least a year. Any info?`,
    SKEPTICAL_LEAD: () => `The last agent we used ghosted us after we signed. How can I trust you'll be different?`,
    COMPETITOR_COMPARISON: () => `I'm interviewing three agents. What makes you better than the big-name firms?`,
    BUSY_NOT_READY: () => `Market's hot and we're interested, but work's crazy right now. Can you keep me posted for a few months?`,
    CONFUSED_LEAD: () => `We're thinking about buying/selling but honestly have no idea where to start. Can you walk us through?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name} here — I've done a few deals before. Let's talk comps, cap rates, and your marketing strategy.`,
  },
  'Financial Advisory': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. I've got ${c.pain} — I need an advisor who can move quickly. Are you taking new clients?`,
    PRICE_OBJECTION: () => `Your fee is above what another advisor quoted. Why is the AUM percentage higher?`,
    WRONG_FIT: () => `I've got some savings I want to invest but nothing huge. What's your minimum?`,
    SKEPTICAL_LEAD: () => `Last advisor lost us money and kept charging fees. What guarantees do I have this time?`,
    COMPETITOR_COMPARISON: () => `I'm evaluating three advisors. What's your edge over a robo-advisor or larger firm?`,
    BUSY_NOT_READY: () => `I know I should plan better, but year-end is insane. Can we revisit in Q1?`,
    CONFUSED_LEAD: () => `I honestly don't know if I need a financial planner, investment manager, or what. Can you help sort that out?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name}. I manage my own portfolio but want professional help on tax-advantaged structures and estate planning. Your approach?`,
  },
  'Business Consulting': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. We have ${c.pain} and need outside help now. Can you start immediately?`,
    PRICE_OBJECTION: () => `Your proposal is significantly more than another consultant. What justifies the gap?`,
    WRONG_FIT: () => `We're a small team and want occasional advice. Do you offer something light-touch?`,
    SKEPTICAL_LEAD: () => `Last consultant gave us a 100-page deck and nothing changed. How do you actually deliver results?`,
    COMPETITOR_COMPARISON: () => `We're talking to three consulting firms. Why you over a big name like McKinsey-tier?`,
    BUSY_NOT_READY: () => `This is relevant but we're heads-down on a product launch. Can we talk again in Q3?`,
    CONFUSED_LEAD: () => `Something's off in the business but I can't put my finger on it. Where would you even start?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name}, ${c.role}. Looking for help with ${c.pain.toLowerCase()}. Share your methodology and past engagements.`,
  },
  'Marketing & Creative Agencies': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. We have ${c.pain} — need a team that can kick off next week. Available?`,
    PRICE_OBJECTION: () => `Your retainer is higher than two other agencies we've quoted. What's the difference?`,
    WRONG_FIT: () => `We just need a logo and maybe a few social posts. What would that run us?`,
    SKEPTICAL_LEAD: () => `Last agency burned through our budget with nothing to show. How's your process different?`,
    COMPETITOR_COMPARISON: () => `We're down to three agencies. Walk me through why you're the better fit.`,
    BUSY_NOT_READY: () => `We love the pitch but funding timing is off. Can we reconnect next quarter?`,
    CONFUSED_LEAD: () => `We know we need marketing but have no strategy. Where do we start — brand, ads, content?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name}. I run growth in-house — let's talk CAC, attribution, and creative testing cadence.`,
  },
  'Home Services': {
    HOT_LEAD: (c) => `Hi, this is ${c.name} — we have ${c.pain} and need someone out today if possible. Can you come?`,
    PRICE_OBJECTION: () => `Your quote is higher than the other guy who came out. Same job — why?`,
    WRONG_FIT: () => `Just need a quick fix, nothing major. What's your minimum service call?`,
    SKEPTICAL_LEAD: () => `Last company we used did sloppy work and wouldn't return calls. How are you different?`,
    COMPETITOR_COMPARISON: () => `I've got three quotes. Yours isn't the cheapest. Why should I pick you?`,
    BUSY_NOT_READY: () => `We know it needs doing but it's not urgent. Can we schedule for a couple months out?`,
    CONFUSED_LEAD: () => `Something's wrong but I'm not sure what — could be plumbing, could be electrical. Can you help diagnose?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name}. I know the system specs and what's failing. What's your diagnostic and repair process?`,
  },
  'Health & Wellness Coaching': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. I'm dealing with ${c.pain} and need real help — soon. Can we start this week?`,
    PRICE_OBJECTION: () => `Your package is more than another coach I looked at. What am I actually paying for?`,
    WRONG_FIT: () => `I'm curious about coaching but not sure if it's for me. What's the lowest-commitment option?`,
    SKEPTICAL_LEAD: () => `Tried coaching before and didn't stick. Why would this time be different?`,
    COMPETITOR_COMPARISON: () => `I'm looking at a few coaches. What's your approach vs. someone more well-known?`,
    BUSY_NOT_READY: () => `I know I need this but work is overwhelming. Can we talk again when things calm down?`,
    CONFUSED_LEAD: () => `I feel off — stressed, tired, unmotivated — but don't know what I actually need. Can you help?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name}. I've done therapy and coaching before. Tell me about your framework and outcomes.`,
  },
  'IT & Technology Services': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. We have ${c.pain} and need help immediately. Can you respond today?`,
    PRICE_OBJECTION: () => `Your quote is significantly higher than another MSP we've contacted. Why?`,
    WRONG_FIT: () => `We're a 3-person shop and just need occasional help. What's your smallest package?`,
    SKEPTICAL_LEAD: () => `Last IT vendor overpromised and things still break weekly. How are you different?`,
    COMPETITOR_COMPARISON: () => `We're comparing three managed service providers. What's your differentiator?`,
    BUSY_NOT_READY: () => `Infrastructure needs updating but we're mid-product-cycle. Can we revisit next quarter?`,
    CONFUSED_LEAD: () => `Stuff keeps breaking and I don't know if it's the servers, network, or software. Where do we start?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name}. Running hybrid infra with some AWS, on-prem AD. Need help with ${c.pain.toLowerCase()}. Your stack expertise?`,
  },
  'Interior Design': {
    HOT_LEAD: (c) => `Hi, I'm ${c.name}. We have ${c.pain} and need to start design work ASAP. Are you available?`,
    PRICE_OBJECTION: () => `Your design fee is higher than another designer I've talked to. What's the difference?`,
    WRONG_FIT: () => `Just need help picking paint colors and a couple furniture pieces. What's your hourly rate?`,
    SKEPTICAL_LEAD: () => `Last designer gave us a concept we hated and charged full price. How do we avoid that?`,
    COMPETITOR_COMPARISON: () => `I've narrowed it to three designers. Why should I choose you over a more established firm?`,
    BUSY_NOT_READY: () => `We love the space ideas but can't start until after the holidays. Can we connect in January?`,
    CONFUSED_LEAD: () => `We know the space doesn't work but can't articulate what we want. Can you guide us?`,
    TECHNICAL_ADAPTATION: (c) => `${c.name}. I have architectural plans and a clear vision. Talk me through your process and deliverables.`,
  },
};

export function generateUniversalPersona(scenario: UniversalScenario, industry: string): GeneratedPersona {
  const context = INDUSTRY_CONTEXTS[industry];
  if (!context) {
    throw new Error(`Industry not supported: ${industry}`);
  }

  const rules = scenario.personaRules;

  const name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
  const companyType = randomFrom(context.companyTypes);
  const role = randomFrom(context.roleTypes);

  const painPool = context.painTypes[rules.painSeverity];
  const painPoints = [randomFrom(painPool)];

  let budget = 'Unknown';
  if (rules.budgetStatus !== 'none') {
    budget = context.budgetRanges[rules.budgetStatus] || 'Flexible';
  }

  const timeline =
    rules.timeframe === 'immediate'
      ? 'Within 1 week'
      : rules.timeframe === 'weeks'
      ? '2-4 weeks'
      : rules.timeframe === 'months'
      ? '2-3 months'
      : 'Exploring options';

  const priorExperience =
    rules.priorExperience === 'bad'
      ? 'Had negative experience with previous provider'
      : rules.priorExperience === 'good'
      ? 'Had positive experience before'
      : rules.priorExperience === 'mixed'
      ? 'Mixed results with past providers'
      : 'First time seeking this service';

  const technicalLevel =
    rules.technicalSavvy === 'high'
      ? 'Highly knowledgeable'
      : rules.technicalSavvy === 'medium'
      ? 'Moderately informed'
      : 'Limited technical knowledge';

  const personality =
    scenario.scenarioType === 'HOT_LEAD'
      ? 'Decisive and urgent'
      : scenario.scenarioType === 'PRICE_OBJECTION'
      ? 'Cost-conscious and analytical'
      : scenario.scenarioType === 'SKEPTICAL_LEAD'
      ? 'Cautious and questioning'
      : scenario.scenarioType === 'CONFUSED_LEAD'
      ? 'Uncertain and seeking guidance'
      : scenario.scenarioType === 'BUSY_NOT_READY'
      ? 'Interested but overwhelmed'
      : 'Professional and balanced';

  const communicationStyle =
    rules.technicalSavvy === 'high'
      ? 'Direct and detailed'
      : rules.technicalSavvy === 'low'
      ? 'Simple and question-heavy'
      : 'Clear and conversational';

  const openingMessage = generateOpeningMessage(scenario, industry, { name, role, companyType, pain: painPoints[0] });

  return {
    name,
    role,
    company: companyType,
    companySize: rules.decisionMaker ? '20-50 employees' : '50-100 employees',
    painPoints,
    budget,
    timeline,
    priorExperience,
    openingMessage,
    personality,
    communicationStyle,
    technicalLevel,
    objectionsToRaise: scenario.expectedObjections,
  };
}

function generateOpeningMessage(scenario: UniversalScenario, industry: string, ctx: GreetingCtx): string {
  const industryGreetings = GREETINGS[industry];
  if (industryGreetings) {
    const fn = industryGreetings[scenario.scenarioType];
    if (fn) return fn(ctx);
  }
  return `Hi, I'm ${ctx.name}, ${ctx.role} at a ${ctx.companyType}. We're dealing with ${ctx.pain.toLowerCase()} and need help. Can you assist?`;
}

function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
