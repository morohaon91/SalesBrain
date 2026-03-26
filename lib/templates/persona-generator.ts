import { SimulationPersona, IndustryScenario } from '@/lib/types/scenarios';

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomMultiple<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

const FIRST_NAMES = {
  young: ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Parker'],
  middle: ['Chris', 'Pat', 'Sam', 'Jamie', 'Dana', 'Cameron', 'Quinn', 'Drew'],
  older: ['Robin', 'Terry', 'Leslie', 'Tracy', 'Jesse', 'Kelly', 'Kim', 'Lee'],
};

const OPENING_LINE_TEMPLATES: Record<string, string[]> = {
  legal_urgent_free_consult: [
    `Hi, I'm {name}. I have a legal issue and I'm hoping you do free consultations? I need help but want to make sure it's worth pursuing first.`,
    `Hello, {name} here. I heard you might be able to help with my case. Do you offer a free initial consultation?`,
    `Hi there, I'm {name} and I'm dealing with a legal matter. Can we talk for a bit before I commit?`,
  ],
  legal_lowest_rate_shopper: [
    `Hi, I'm {name}. I'm shopping around for a lawyer and comparing hourly rates. What do you charge?`,
    `Hello, {name} here. I've already talked to two other lawyers. What's your hourly rate?`,
    `Hi, {name} calling. Before anything else, can you tell me your hourly rate? I'm comparing attorneys.`,
  ],
  legal_complex_budget_sensitive: [
    `Hi, I'm {name}. I have a legal issue but I'm worried about costs. Can you give me a sense of what this might run?`,
    `Hello, {name} here. I need legal help but I'm on a tight budget. Do you work with people who can't spend a fortune?`,
  ],
  legal_unrealistic_timeline: [
    `Hi, I'm {name}. I need this handled in the next 48 hours. Can you do that?`,
    `Hello, {name}. I have a legal situation that needs to be resolved this week. Are you available immediately?`,
  ],
  construction_vague_scope_tight_budget: [
    `Hi! I'm {name} and I'm thinking about redoing my kitchen. I have some ideas from Pinterest but I'm not totally sure what I want yet. My budget is around ${'{budget}'},is that doable?`,
    `Hello, I'm {name}. I want to remodel but I'm new to this — what can I get for around ${'{budget}'}?`,
    `Hey, {name} here. I've been looking at renovation ideas online and I'd love to update my space. Not exactly sure on scope yet but working with about ${'{budget}'}.`,
  ],
  construction_timeline_pressure: [
    `Hi I'm {name}. I need a bathroom renovation done in 2 weeks. Is that something you can do?`,
    `Hello, {name} here. I have an urgent situation — need work completed ASAP. Can you start this week?`,
  ],
  realestate_first_buyer_overwhelmed: [
    `Hi, I'm {name} and I'm looking to buy my first home. I honestly don't know where to start — this whole process seems really complicated.`,
    `Hello! My name is {name} and I'm a first-time buyer. I'm pre-approved for about ${'{budget}'} but I have so many questions. Do you work with first-timers?`,
  ],
  financial_referral_ready: [
    `Hi, I'm {name}. My friend {name2} recommended you highly. I have a portfolio of about ${'{budget}'} I'd like to discuss moving.`,
    `Hello, {name} here. I was referred by a mutual friend and I'm looking to switch advisors. Can we talk?`,
  ],
};

export function generatePersona(scenario: IndustryScenario): SimulationPersona {
  const template = scenario.personaTemplate;

  const age = randomInRange(template.ageRange.min, template.ageRange.max);
  let namePool: string[];
  if (age < 35) namePool = FIRST_NAMES.young;
  else if (age < 55) namePool = FIRST_NAMES.middle;
  else namePool = FIRST_NAMES.older;

  const name = randomFromArray(namePool);

  const budgetMin = randomInRange(template.budgetRange.min, Math.floor(template.budgetRange.max * 0.7));
  const budgetMax = randomInRange(budgetMin, template.budgetRange.max);
  const budgetFlexibility = randomFromArray(['rigid', 'moderate', 'flexible'] as const);

  const personalityCount = randomInRange(2, Math.min(3, template.personalityOptions.length));
  const personality = randomMultiple(template.personalityOptions, personalityCount);

  const painPointCount = randomInRange(2, Math.min(4, template.painPointOptions.length));
  const painPoints = randomMultiple(template.painPointOptions, painPointCount);

  const timeline = randomFromArray(template.timelineOptions);

  const openingLine = generateOpeningLine(scenario, name, budgetMin, budgetMax, timeline);
  const backstory = generateBackstory(scenario, name, age, personality, painPoints);

  return {
    name,
    age,
    budget: { min: budgetMin, max: budgetMax, flexibility: budgetFlexibility },
    timeline,
    painPoints,
    personality,
    openingLine,
    backstory,
  };
}

function generateOpeningLine(
  scenario: IndustryScenario,
  name: string,
  budgetMin: number,
  _budgetMax: number,
  timeline: string
): string {
  const templates = OPENING_LINE_TEMPLATES[scenario.id];
  if (templates && templates.length > 0) {
    const template = randomFromArray(templates);
    return template
      .replace(/{name}/g, name)
      .replace(/{name2}/g, randomFromArray(FIRST_NAMES.middle))
      .replace(/\${'{budget}'}/g, `$${budgetMin.toLocaleString()}`);
  }

  // Generic fallback based on teaser
  return `Hi, I'm ${name}. ${scenario.teaser.replace('Incoming lead: ', '')}. ${timeline}`;
}

function generateBackstory(
  scenario: IndustryScenario,
  name: string,
  age: number,
  personality: string[],
  painPoints: string[]
): string {
  const howFound = randomFromArray([
    'Google search',
    'referral from friend',
    'Yelp',
    'social media',
    'previous customer recommendation',
  ]);
  return `${name}, ${age} years old. Personality: ${personality.join(', ')}. Key concerns: ${painPoints.join('; ')}. Found you through ${howFound}.`;
}

export function getPersonaDisplayData(persona: SimulationPersona): Record<string, string> {
  return {
    Name: persona.name,
    Age: String(persona.age),
    'Budget Range': `$${persona.budget.min.toLocaleString()} - $${persona.budget.max.toLocaleString()}`,
    'Budget Flexibility': persona.budget.flexibility,
    Timeline: persona.timeline,
    'Personality Traits': persona.personality.join(', '),
    'Pain Points': persona.painPoints.join('; '),
    Backstory: persona.backstory,
  };
}
