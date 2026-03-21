/**
 * Industry-specific templates for simulations
 * Each template provides industry-realistic scenarios and business information
 */

export interface ScenarioPersona {
  clientType: string;
  budget: string;
  painPoints: string[];
  personality: string;
  openingLine: string;
  typicalObjections: string[];
}

export interface IndustryTemplate {
  industry: string;
  displayName: string;
  description: string;
  serviceDescription: string;
  targetClientType: string;
  typicalBudgetRange: string;
  commonClientQuestions: string[];
  scenarios: {
    PRICE_SENSITIVE: ScenarioPersona;
    INDECISIVE: ScenarioPersona;
    DEMANDING: ScenarioPersona;
    TIME_PRESSURED: ScenarioPersona;
    HIGH_BUDGET: ScenarioPersona;
  };
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  mortgage_advisory: {
    industry: "mortgage_advisory",
    displayName: "Mortgage Advisory",
    description: "Home loans, refinancing, and mortgage consulting",
    serviceDescription:
      "I help clients secure home loans with competitive rates and guide them through the mortgage process from pre-approval to closing.",
    targetClientType:
      "First-time homebuyers, families looking to refinance, real estate investors",
    typicalBudgetRange: "$200,000 - $500,000 home loans",
    commonClientQuestions: [
      "What interest rates do you currently offer?",
      "How much do I need for a down payment?",
      "What are the closing costs?",
      "Can I get pre-approved?",
      "What's the difference between fixed and adjustable rates?",
      "How does my credit score affect my rate?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "First-time homebuyer on tight budget",
        budget: "$280,000 home, concerned about rates and fees",
        painPoints: [
          "Worried about getting the best rate possible",
          "Doesn't understand all the fees involved",
          "Concerned about monthly payment affordability",
        ],
        personality: "Cautious, price-focused, needs education on process",
        openingLine:
          "Hi, I'm looking to buy my first home around $280k. I need to make sure I'm getting the best rate possible because every percentage point matters to my monthly payment. What kind of rates can you offer?",
        typicalObjections: [
          "That rate seems high compared to what I saw online",
          "Can you waive some of these fees?",
          "I heard I could get a better deal elsewhere",
        ],
      },
      INDECISIVE: {
        clientType: "Couple unsure about timing and loan type",
        budget: "$350,000, has down payment saved but hesitant",
        painPoints: [
          "Unsure if now is the right time to buy",
          "Confused about fixed vs. adjustable rates",
          "Worried about making the wrong decision",
        ],
        personality: "Overthinking, needs reassurance, asks many questions",
        openingLine:
          "Hi, my partner and I are thinking about buying a home around $350k. We have about $50k saved for a down payment, but we're not sure if we should wait or if rates might go down. What do you think?",
        typicalObjections: [
          "Should we wait for rates to drop?",
          "What if we find a better deal in 6 months?",
          "Is a 30-year or 15-year mortgage better for us?",
        ],
      },
      DEMANDING: {
        clientType: "Experienced buyer with high expectations",
        budget: "$600,000 investment property, knows the process",
        painPoints: [
          "Has specific rate and term requirements",
          "Wants fast approval and closing",
          "Expects premium service and attention",
        ],
        personality: "Direct, impatient, high standards, no-nonsense",
        openingLine:
          "I'm looking at a $600k investment property and I need this closed in 30 days. I have excellent credit (780+) and 25% down. I expect rates in the low 6% range. Can you deliver on that timeline, or should I look elsewhere?",
        typicalObjections: [
          "I don't have time for delays or paperwork issues",
          "Your competitor quoted me a better rate",
          "This is taking too long, I need updates daily",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Buyer with urgent closing deadline",
        budget: "$320,000, needs to close within 3 weeks",
        painPoints: [
          "Seller wants quick closing",
          "Worried about losing the house",
          "Needs expedited approval",
        ],
        personality: "Stressed, urgent, willing to pay more for speed",
        openingLine:
          "Hi, I found my dream home at $320k but the seller wants to close in 3 weeks or they'll move to another buyer. My credit is good (710) and I have 15% down. Can you help me get approved and close that fast?",
        typicalObjections: [
          "That timeline sounds too long, I might lose the house",
          "Can you guarantee we'll close on time?",
          "What if something delays the process?",
        ],
      },
      HIGH_BUDGET: {
        clientType: "High-net-worth client buying luxury property",
        budget: "$1.2M+ jumbo loan, sophisticated buyer",
        painPoints: [
          "Needs jumbo loan expertise",
          "Wants portfolio diversification advice",
          "Expects white-glove service",
        ],
        personality: "Professional, expects expertise, values relationship",
        openingLine:
          "I'm purchasing a $1.2 million property in [upscale area] and I'm looking for a mortgage advisor who specializes in jumbo loans. I have significant assets and want to explore the best financing structure for tax optimization. What's your experience with high-net-worth clients?",
        typicalObjections: [
          "I need someone who understands complex financial situations",
          "My private banker offered me a different structure",
          "Can you coordinate with my CPA and financial advisor?",
        ],
      },
    },
  },

  interior_design: {
    industry: "interior_design",
    displayName: "Interior Design",
    description: "Residential and commercial interior design services",
    serviceDescription:
      "I create beautiful, functional spaces that reflect your personality and lifestyle, from concept to completion.",
    targetClientType:
      "Homeowners renovating, new construction clients, commercial space owners",
    typicalBudgetRange: "$10,000 - $50,000 per room or project",
    commonClientQuestions: [
      "What's your design process?",
      "How do you charge - flat fee or percentage?",
      "Can you work within my budget?",
      "How long does a typical project take?",
      "Do you source furniture and materials?",
      "Can I see your portfolio?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "Young couple renovating first home",
        budget: "$15,000 for living room and dining area",
        painPoints: [
          "Limited budget but wants designer look",
          "Doesn't know where to start",
          "Worried about hidden costs",
        ],
        personality:
          "Budget-conscious, has Pinterest inspiration, DIY willing",
        openingLine:
          "Hi! My partner and I just bought our first home and we want to renovate the living room and dining area. We have about $15k total. We love modern farmhouse style but we're worried that's too expensive. Can you work with our budget and still make it look amazing?",
        typicalObjections: [
          "That seems expensive for what we're getting",
          "Can we do some of the work ourselves to save money?",
          "We saw similar furniture cheaper at [big box store]",
        ],
      },
      INDECISIVE: {
        clientType: "Homeowner unsure about style direction",
        budget: "$25,000 for master bedroom suite, flexible",
        painPoints: [
          "Too many ideas from different styles",
          "Wants everything but can't decide",
          "Afraid of making wrong choices",
        ],
        personality:
          "Overthinking, seeks validation, changes mind frequently",
        openingLine:
          "I'm redoing my master bedroom and I have about $25k to spend. I love the coastal vibe but also really like modern minimalist, and some industrial elements. I have so many ideas but I don't know how to make them work together. Where do I even start?",
        typicalObjections: [
          "What if I don't like it once it's done?",
          "Can we change direction mid-project if I change my mind?",
          "I need to think about this more before committing",
        ],
      },
      DEMANDING: {
        clientType: "High-end client with specific vision",
        budget: "$80,000+ whole home design, luxury finishes",
        painPoints: [
          "Has very specific aesthetic requirements",
          "Expects designer availability 24/7",
          "No patience for delays or mistakes",
        ],
        personality: "Detail-oriented, controlling, high expectations",
        openingLine:
          "I'm looking for a designer to completely redo my 4,000 sq ft home. I have a very specific vision - think Restoration Hardware meets Kelly Wearstler. Budget isn't the issue, but I need perfection. I've worked with three designers before and wasn't satisfied. Can you execute at this level?",
        typicalObjections: [
          "That fabric choice isn't quite right",
          "I expected more design options to choose from",
          "This isn't moving fast enough, I need daily updates",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Client moving in 6 weeks, needs fast turnaround",
        budget: "$30,000, willing to pay premium for speed",
        painPoints: [
          "Relocating for job, must be done before move",
          "Stressed about timeline",
          "Willing to compromise for faster completion",
        ],
        personality: "Urgent, decisive, trusts expertise",
        openingLine:
          "Hi, I'm relocating for work and I need my new home designed and ready in 6 weeks. I have $30k to work with for the main living areas. I know that's tight, but I'm flexible on choices if it means getting done on time. Can you make this happen?",
        typicalObjections: [
          "6 weeks is all I have, can you guarantee completion?",
          "What if materials are delayed?",
          "I can't extend my timeline, what's plan B?",
        ],
      },
      HIGH_BUDGET: {
        clientType: "Luxury client designing vacation home",
        budget: "$150,000+ full property design and furnishing",
        painPoints: [
          "Wants showpiece property",
          "Needs coordination with architect and contractors",
          "Expects concierge-level service",
        ],
        personality:
          "Sophisticated, expects white-glove service, relationship-focused",
        openingLine:
          "I'm designing a vacation property in [luxury location] and I need a designer who can handle the entire process - architecture coordination, custom furniture, art curation, everything. Budget is $150k+. I'm looking for someone who understands high-end clients and can manage this end-to-end. Is this your specialty?",
        typicalObjections: [
          "I need someone who can work with my architect seamlessly",
          "My timeline is flexible but quality is non-negotiable",
          "Can you source exclusive pieces not available to the public?",
        ],
      },
    },
  },

  business_consulting: {
    industry: "business_consulting",
    displayName: "Business Consulting",
    description: "Strategy, operations, and growth consulting for businesses",
    serviceDescription:
      "I help businesses improve operations, develop growth strategies, and solve complex business challenges through data-driven insights and proven frameworks.",
    targetClientType: "Small to mid-size businesses, startups, entrepreneurs",
    typicalBudgetRange: "$5,000 - $50,000 per engagement",
    commonClientQuestions: [
      "What's your consulting process?",
      "What industries do you specialize in?",
      "How do you measure ROI?",
      "Do you have case studies or references?",
      "How long is a typical engagement?",
      "What deliverables do I receive?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "Startup founder with limited budget",
        budget: "$5,000 - $10,000, needs quick ROI",
        painPoints: [
          "Tight budget, needs proof of value",
          "Concerned about wasting money on consulting",
          "Wants specific deliverables not ongoing advice",
        ],
        personality: "Pragmatic, data-driven, ROI-focused, skeptical",
        openingLine:
          "Hi, I'm running a SaaS startup and we're at $20k MRR but growth has plateaued. I have maybe $5-10k budget for consulting. I've been burned by consultants before who gave generic advice. I need specific, actionable strategies that will move the needle. Can you show me concrete results you've delivered for similar companies?",
        typicalObjections: [
          "That's expensive - how do I know this will generate ROI?",
          "Can we do this on a project basis instead of retainer?",
          "Your competitor charges half that",
        ],
      },
      INDECISIVE: {
        clientType: "Small business owner unsure about direction",
        budget: "$15,000, flexible but hesitant",
        painPoints: [
          "Multiple problems, doesn't know where to start",
          "Overwhelmed by options and advice",
          "Never hired consultant before",
        ],
        personality: "Uncertain, seeks reassurance, asks many questions",
        openingLine:
          "I run a $2M/year manufacturing business and I'm struggling with operations, hiring, and scaling. I've read books and taken courses but I'm still confused about what to prioritize. I have about $15k budget. I've never worked with a consultant - how does this work? Where do we even start?",
        typicalObjections: [
          "How do I know you'll focus on the right problems?",
          "What if this doesn't work for my specific situation?",
          "Can I think about this and get back to you?",
        ],
      },
      DEMANDING: {
        clientType: "Experienced CEO with high expectations",
        budget: "$50,000+ strategic engagement",
        painPoints: [
          "Has worked with McKinsey/BCG before",
          "Expects top-tier expertise and insights",
          "No tolerance for generic frameworks",
        ],
        personality: "Sophisticated, challenging, expects excellence",
        openingLine:
          "I'm the CEO of a $50M B2B company and we're considering expansion into a new vertical. I've worked with McKinsey on past initiatives. I need strategic analysis and market entry recommendations at that level of rigor. Budget is $50k+ for the right advisor. What's your experience with market entry strategy for companies at our scale?",
        typicalObjections: [
          "I need someone who can challenge my thinking, not agree with everything",
          "Your framework seems generic - how will this be tailored to our specific situation?",
          "I've seen this analysis before, what's your unique insight?",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Business owner facing urgent decision",
        budget: "$20,000, needs fast turnaround",
        painPoints: [
          "Major decision deadline approaching",
          "Needs expert analysis quickly",
          "Willing to pay premium for speed",
        ],
        personality: "Decisive, urgent, trusts expertise",
        openingLine:
          "I have an acquisition opportunity that I need to evaluate in the next 3 weeks. The target company does $5M revenue. I need due diligence, financial analysis, and integration planning fast. Budget is $20k. Can you turn this around in that timeframe with quality work?",
        typicalObjections: [
          "3 weeks is hard deadline, can you commit to that?",
          "What if you need more information and it delays things?",
          "I can't miss this opportunity, what's your contingency plan?",
        ],
      },
      HIGH_BUDGET: {
        clientType: "Large company seeking strategic transformation",
        budget: "$100,000+ multi-month engagement",
        painPoints: [
          "Complex organizational challenges",
          "Needs change management expertise",
          "Expects ongoing partnership not one-time project",
        ],
        personality: "Strategic, relationship-focused, values expertise",
        openingLine:
          "We're a $200M company going through digital transformation and organizational restructuring. This is a 6-12 month initiative with budget of $100k+. We need someone who can work alongside our leadership team, not just deliver a report. What's your experience leading transformations at this scale?",
        typicalObjections: [
          "We need someone embedded with our team, not remote consulting",
          "How will you transfer knowledge so we're not dependent on you?",
          "Can you work with our existing systems and culture?",
        ],
      },
    },
  },

  real_estate: {
    industry: "real_estate",
    displayName: "Real Estate",
    description: "Residential and commercial real estate sales and consulting",
    serviceDescription:
      "I help buyers and sellers navigate the real estate market with expert guidance, market insights, and personalized service to achieve their property goals.",
    targetClientType:
      "First-time buyers, sellers, investors, luxury clients",
    typicalBudgetRange: "$250,000 - $2,000,000 property transactions",
    commonClientQuestions: [
      "What's the current market like in this area?",
      "How do you determine listing price?",
      "What's your commission structure?",
      "How long does it typically take to sell?",
      "Do you have buyers for this type of property?",
      "What marketing do you do for listings?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "First-time homebuyer watching every dollar",
        budget: "$350,000 max, concerned about overpaying",
        painPoints: [
          "Afraid of bidding wars and overpaying",
          "Doesn't understand all the costs involved",
          "Wants best deal possible in competitive market",
        ],
        personality: "Cautious, analytical, needs education",
        openingLine:
          "Hi, I'm looking to buy my first home with a budget of $350k max. The market seems crazy right now and I'm worried about overpaying or missing out. I've heard horror stories about bidding wars. How do you help buyers get a fair deal in this market?",
        typicalObjections: [
          "Should we wait for the market to cool down?",
          "That house seems overpriced for the neighborhood",
          "Can you negotiate a better price for us?",
        ],
      },
      INDECISIVE: {
        clientType: "Couple unsure about location and home type",
        budget: "$500,000, flexible on details",
        painPoints: [
          "Too many options and neighborhoods",
          "Can't agree on priorities (yard vs. location vs. size)",
          "Analysis paralysis from endless research",
        ],
        personality: "Overthinking, wants to see everything, hard to please",
        openingLine:
          "My partner and I are looking to buy but we can't decide between a newer home in the suburbs or an older home closer to downtown. We have $500k budget. We've been looking for 6 months and keep going back and forth. How do you help clients figure out what they really want?",
        typicalObjections: [
          "We like this house but what if something better comes up?",
          "Can we see a few more properties before deciding?",
          "We need to think about this more",
        ],
      },
      DEMANDING: {
        clientType: "Luxury seller with high expectations",
        budget: "$2M+ luxury property, expects premium service",
        painPoints: [
          "Wants top dollar for property",
          "Expects aggressive marketing and staging",
          "Needs discretion and white-glove service",
        ],
        personality:
          "High standards, impatient, expects constant updates",
        openingLine:
          "I'm selling my $2.5M property and I need an agent who specializes in luxury markets. I expect professional photography, staging, targeted marketing to high-net-worth buyers, and regular updates. I've interviewed three agents already. What makes you different in the luxury segment?",
        typicalObjections: [
          "Your marketing plan seems standard, not luxury-focused",
          "I'm not seeing enough showings, what's the problem?",
          "Another agent said they could get $2.7M for this property",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Seller relocating, needs quick sale",
        budget: "$600,000 property, must sell in 60 days",
        painPoints: [
          "Relocating for job, hard deadline",
          "Worried about selling fast at good price",
          "Stressed about timing and logistics",
        ],
        personality: "Urgent, motivated, willing to price competitively",
        openingLine:
          "I'm relocating for work in 60 days and I need to sell my $600k home fast. I'm willing to price it competitively to sell quickly but I don't want to give it away. What's your strategy for quick sales and can you handle the timeline pressure?",
        typicalObjections: [
          "60 days is all I have, what if it doesn't sell?",
          "Should I rent it out instead and sell later?",
          "What's your backup plan if we don't get offers quickly?",
        ],
      },
      HIGH_BUDGET: {
        clientType: "High-net-worth investor or luxury buyer",
        budget: "$3M+ investment or luxury primary residence",
        painPoints: [
          "Needs investment analysis and portfolio strategy",
          "Wants off-market opportunities",
          "Expects relationship-based service",
        ],
        personality: "Sophisticated, values expertise and access",
        openingLine:
          "I'm looking at luxury properties in the $3-5M range, either as a primary residence or investment property. I'm interested in exclusive listings and off-market opportunities. What's your experience working with high-net-worth clients and what kind of access do you have to luxury inventory?",
        typicalObjections: [
          "I need someone with connections to see properties before they hit the market",
          "Can you provide investment analysis and rental projections?",
          "Do you work with my wealth manager to structure the purchase?",
        ],
      },
    },
  },

  financial_advisory: {
    industry: "financial_advisory",
    displayName: "Financial Advisory",
    description: "Investment planning, retirement planning, and wealth management",
    serviceDescription:
      "I help clients build and protect wealth through personalized financial planning, investment strategies, and comprehensive financial guidance.",
    targetClientType:
      "Young professionals, families, pre-retirees, high-net-worth individuals",
    typicalBudgetRange: "$100,000 - $5,000,000+ assets under management",
    commonClientQuestions: [
      "How do you charge for your services?",
      "What's your investment philosophy?",
      "Are you a fiduciary?",
      "What returns can I expect?",
      "How often will we meet?",
      "What makes you different from other advisors?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "Young professional starting to save",
        budget: "$50,000 in savings, wants to start investing",
        painPoints: [
          "Knows needs to invest but doesn't know how",
          "Worried about fees eating returns",
          "Concerned about making wrong investment choices",
        ],
        personality: "Cost-conscious, DIY-inclined, needs education",
        openingLine:
          "Hi, I'm 28 and I've saved about $50k that's just sitting in a savings account. I know I should invest it but I'm intimidated by the options and worried about fees. I've looked at robo-advisors but I'd like human guidance. How do you charge and is it worth it for someone at my level?",
        typicalObjections: [
          "1% AUM fee seems high when I could use Vanguard for less",
          "Can I just get a one-time plan instead of ongoing management?",
          "I can learn this myself from YouTube, why do I need an advisor?",
        ],
      },
      INDECISIVE: {
        clientType: "Mid-career professional unsure about strategy",
        budget: "$300,000 in 401k and savings, confused about direction",
        painPoints: [
          "Overwhelmed by financial advice and information",
          "Worried about market volatility",
          "Doesn't know if they're on track for retirement",
        ],
        personality: "Analysis paralysis, risk-averse, seeks reassurance",
        openingLine:
          "I'm 45 with about $300k saved between my 401k and savings. I keep reading conflicting advice about what to do - some say be aggressive, others say protect what I have. I'm worried I'm not on track for retirement but also scared of losing money. How do you help someone figure out the right strategy?",
        typicalObjections: [
          "What if the market crashes right after I invest more?",
          "Should I wait until things stabilize?",
          "I'm not sure I'm comfortable with that level of risk",
        ],
      },
      DEMANDING: {
        clientType: "Successful executive with complex finances",
        budget: "$2M+ in assets, stock options, multiple accounts",
        painPoints: [
          "Complex financial situation (RSUs, options, deferred comp)",
          "Needs tax optimization strategies",
          "Expects sophisticated wealth management",
        ],
        personality: "High expectations, analytical, wants expertise",
        openingLine:
          "I'm a tech executive with $2M in various accounts, significant RSUs vesting quarterly, and complex compensation. I need more than basic investment management - tax optimization, estate planning coordination, equity compensation strategy. What's your experience with clients at my level of complexity?",
        typicalObjections: [
          "My situation is unique, can you handle equity compensation planning?",
          "I need someone who works with my tax attorney and estate planner",
          "Your investment approach seems too conservative for my risk tolerance",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Pre-retiree needing urgent planning",
        budget: "$800,000, retiring in 12 months",
        painPoints: [
          "Retirement date approaching, not ready",
          "Worried about having enough",
          "Needs to make big decisions quickly",
        ],
        personality: "Anxious, urgent, needs clear guidance",
        openingLine:
          "I'm 62 and planning to retire in 12 months. I have about $800k saved but I'm worried it's not enough. I need to figure out Social Security timing, how to draw down my accounts, healthcare before Medicare. This is overwhelming and I'm running out of time. Can you help me create a plan quickly?",
        typicalObjections: [
          "Should I delay retirement if I'm not ready?",
          "What if I run out of money in retirement?",
          "12 months isn't enough time to fix mistakes I've made",
        ],
      },
      HIGH_BUDGET: {
        clientType: "High-net-worth client or recent liquidity event",
        budget: "$5M+ from business sale or inheritance",
        painPoints: [
          "Sudden wealth, needs comprehensive planning",
          "Tax implications and wealth preservation",
          "Multi-generational planning needs",
        ],
        personality:
          "Sophisticated, values relationship and expertise",
        openingLine:
          "I recently sold my business for $7M and I need comprehensive wealth management - investment strategy, tax planning, estate planning, charitable giving. I'm interviewing advisors who specialize in serving families at this level. What's your approach to working with clients who've had liquidity events?",
        typicalObjections: [
          "I need a team approach, not just investment management",
          "How do you coordinate with my existing tax and legal advisors?",
          "What experience do you have preserving wealth across generations?",
        ],
      },
    },
  },

  legal_services: {
    industry: "legal_services",
    displayName: "Legal Services",
    description: "Legal consulting and representation",
    serviceDescription:
      "I provide expert legal guidance and representation to help clients navigate complex legal matters with confidence and clarity.",
    targetClientType:
      "Individuals, small businesses, startups, families",
    typicalBudgetRange: "$2,000 - $50,000+ depending on case complexity",
    commonClientQuestions: [
      "How do you charge - hourly or flat fee?",
      "What's your experience with cases like mine?",
      "How long will this take?",
      "What are my chances of success?",
      "Can I handle this myself or do I need a lawyer?",
      "What's the total cost likely to be?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "Individual with limited budget, simple legal need",
        budget: "$2,000 - $5,000, concerned about costs",
        painPoints: [
          "Worried about legal costs spiraling",
          "Doesn't know if lawyer is necessary",
          "Needs clear fee structure upfront",
        ],
        personality: "Cost-conscious, DIY-inclined, needs justification",
        openingLine:
          "Hi, I need help with [estate planning/contract review/small business setup]. I've looked at doing this myself with online tools but I'm worried about making mistakes. My budget is around $2-5k. Can you give me a flat fee quote and help me understand if I really need a lawyer for this?",
        typicalObjections: [
          "Can't I just use LegalZoom for this?",
          "That seems expensive for what seems straightforward",
          "Can you break down what I'm paying for?",
        ],
      },
      INDECISIVE: {
        clientType: "Client unsure about pursuing legal action",
        budget: "$10,000 available but hesitant to spend",
        painPoints: [
          "Not sure if case is worth pursuing",
          "Concerned about time and stress of legal process",
          "Wants to understand all options first",
        ],
        personality: "Risk-averse, overthinking, needs clarity",
        openingLine:
          "I have a situation with [contract dispute/employment issue/property matter]. I'm not sure if I should pursue this legally or try to resolve it another way. I have about $10k I could spend but I don't want to throw money away if my case isn't strong. What's your honest assessment?",
        typicalObjections: [
          "What if we spend all this money and lose?",
          "Can we try mediation first before going to court?",
          "I need time to think about whether this is worth it",
        ],
      },
      DEMANDING: {
        clientType: "Business client with complex legal needs",
        budget: "$50,000+ for ongoing legal support",
        painPoints: [
          "High-stakes legal matter",
          "Needs responsive, expert representation",
          "Expects strategic thinking not just legal advice",
        ],
        personality: "High expectations, no patience for delays",
        openingLine:
          "I'm dealing with a complex [business dispute/IP issue/regulatory matter]. This is high-stakes for my company. I need a lawyer who is strategic, responsive, and thinks like a business owner, not just applying law textbook answers. What's your experience with cases like this?",
        typicalObjections: [
          "I need responses within 24 hours, can you commit to that?",
          "This legal advice seems too conservative for my business needs",
          "Your competitor has deeper experience in this specific area",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Client facing urgent deadline or hearing",
        budget: "$15,000, needs immediate representation",
        painPoints: [
          "Court date or deadline approaching",
          "Previous lawyer dropped them or ineffective",
          "Stressed and needs help fast",
        ],
        personality: "Urgent, desperate, willing to pay for speed",
        openingLine:
          "I have a [hearing/deadline/filing] in 2 weeks and I need representation immediately. My previous lawyer [withdrew/wasn't effective/ghosted me]. I know the timing is terrible. Can you take this on and get up to speed quickly? I can pay rush fees if needed.",
        typicalObjections: [
          "Can you absolutely commit to being ready for the deadline?",
          "What if you need more time to prepare properly?",
          "How quickly can you get up to speed on the details?",
        ],
      },
      HIGH_BUDGET: {
        clientType: "Corporate client or high-net-worth individual",
        budget: "$100,000+ for complex representation",
        painPoints: [
          "Complex multi-faceted legal matter",
          "Needs team of specialists",
          "Long-term relationship and ongoing counsel",
        ],
        personality:
          "Sophisticated, values expertise and white-glove service",
        openingLine:
          "I need representation for [major litigation/M&A transaction/estate planning for family business]. This is complex and will require a team with specialized expertise. Budget isn't the primary concern - I need the best outcome. What's your experience leading this type of engagement?",
        typicalObjections: [
          "I need a team that can handle all aspects of this matter",
          "How will you coordinate with my other advisors (accountants, bankers)?",
          "What's your track record on matters of this complexity?",
        ],
      },
    },
  },

  marketing_agency: {
    industry: "marketing_agency",
    displayName: "Marketing Agency",
    description: "Digital marketing, branding, and growth strategies",
    serviceDescription:
      "I help businesses grow through data-driven marketing strategies, compelling brand storytelling, and measurable results across digital channels.",
    targetClientType:
      "Small businesses, startups, e-commerce brands, B2B companies",
    typicalBudgetRange: "$3,000 - $25,000 per month for ongoing services",
    commonClientQuestions: [
      "What services do you offer?",
      "How do you measure ROI?",
      "What results have you achieved for similar clients?",
      "Do you specialize in my industry?",
      "What's your pricing structure?",
      "How long until we see results?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "Small business owner with tight marketing budget",
        budget: "$2,000 - $3,000/month, needs proven ROI",
        painPoints: [
          "Has tried marketing before without results",
          "Limited budget, can't afford to waste money",
          "Needs to see leads and sales, not just metrics",
        ],
        personality: "Skeptical, ROI-focused, wants guarantees",
        openingLine:
          "Hi, I run a small [local service business/e-commerce store] and I've tried Facebook ads and SEO before but didn't see results. I have maybe $2-3k/month budget but I need to see actual customers, not just traffic or impressions. Can you show me specific results you've delivered for businesses like mine?",
        typicalObjections: [
          "How do I know this won't be another waste of money?",
          "Can you guarantee a certain number of leads?",
          "That's more than I was hoping to spend",
        ],
      },
      INDECISIVE: {
        clientType: "Business owner unsure about marketing approach",
        budget: "$5,000/month, flexible but confused",
        painPoints: [
          "Doesn't know what marketing they need",
          "Overwhelmed by options (SEO, PPC, social, email)",
          "Wants to do everything but doesn't know where to start",
        ],
        personality: "Uncertain, needs guidance, easily overwhelmed",
        openingLine:
          "I know I need marketing but I'm not sure where to focus. Should I do Google Ads? Social media? SEO? Email? I have about $5k/month budget. Everyone tells me something different. How do you help clients figure out the right marketing mix for their business?",
        typicalObjections: [
          "What if we invest in the wrong channel?",
          "Can we test multiple things to see what works?",
          "I need to do more research before committing",
        ],
      },
      DEMANDING: {
        clientType: "Growing company with high expectations",
        budget: "$15,000+/month, expects aggressive growth",
        painPoints: [
          "Scaling fast, needs marketing to keep pace",
          "Has worked with agencies before, expects excellence",
          "Wants strategic partner not just execution",
        ],
        personality: "High standards, data-driven, impatient with excuses",
        openingLine:
          "We're a fast-growing [SaaS/e-commerce/B2B] company doing $3M ARR and we need to hit $10M next year. Current marketing isn't scaling. We need a strategic partner who can build a demand gen engine, not just run ads. Budget is $15k+/month for the right team. What's your experience scaling companies like ours?",
        typicalObjections: [
          "These numbers aren't moving fast enough",
          "I need more strategic thinking, not just campaign execution",
          "Your competitor showed more aggressive growth projections",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Business launching product or entering busy season",
        budget: "$8,000/month, needs fast ramp-up",
        painPoints: [
          "Product launch or seasonal deadline approaching",
          "Needs campaigns live quickly",
          "Stressed about timing and getting it right",
        ],
        personality: "Urgent, decisive, trusts expertise",
        openingLine:
          "We're launching a new [product/service] in 6 weeks and we need marketing campaigns ready to go on day one. We have $8k/month budget and need everything set up fast - ads, landing pages, email sequences. Can you handle this timeline and deliver quality work under pressure?",
        typicalObjections: [
          "6 weeks is our hard deadline, can you commit?",
          "What if creative isn't ready or needs revisions?",
          "We can't miss this launch window, what's plan B?",
        ],
      },
      HIGH_BUDGET: {
        clientType: "Established company or well-funded startup",
        budget: "$25,000+/month for full-service marketing",
        painPoints: [
          "Needs comprehensive marketing strategy and execution",
          "Multiple channels and campaigns simultaneously",
          "Expects agency to operate as outsourced marketing dept",
        ],
        personality: "Strategic, relationship-focused, values partnership",
        openingLine:
          "We're a $20M company and we're looking for a full-service marketing partner - strategy, creative, media buying, content, everything. Budget is $25k+/month. We need an agency that can think strategically and execute flawlessly across all channels. What's your approach to becoming an integrated partner vs. just a vendor?",
        typicalObjections: [
          "We need someone who understands our business deeply, not surface-level",
          "How will you integrate with our internal team?",
          "What specialized expertise do you bring beyond general marketing?",
        ],
      },
    },
  },

  constructors: {
    industry: "constructors",
    displayName: "Construction/Contractors",
    description: "Residential and commercial construction and renovation",
    serviceDescription:
      "I deliver quality construction and renovation projects on time and on budget, with clear communication and craftsmanship you can trust.",
    targetClientType:
      "Homeowners, property developers, commercial clients",
    typicalBudgetRange:
      "$20,000 - $500,000+ depending on project scope",
    commonClientQuestions: [
      "How do you price projects - fixed bid or time and materials?",
      "What's your timeline for a project like this?",
      "Are you licensed and insured?",
      "Can you provide references?",
      "How do you handle change orders and unexpected issues?",
      "What's included in your quote?",
    ],
    scenarios: {
      PRICE_SENSITIVE: {
        clientType: "Homeowner with tight renovation budget",
        budget: "$40,000 for kitchen remodel, price shopping",
        painPoints: [
          "Gotten multiple quotes, shopping for best price",
          "Worried about hidden costs and overruns",
          "Wants quality but limited budget",
        ],
        personality: "Budget-focused, comparing options, skeptical",
        openingLine:
          "Hi, I'm looking to remodel my kitchen and I have about $40k budget. I've gotten quotes from $35k to $65k for similar scopes. I want quality work but I need to stay on budget. How do you price kitchen remodels and what does your quote actually include?",
        typicalObjections: [
          "I got a quote for $10k less from another contractor",
          "Can you match their price?",
          "What can we cut to bring the price down?",
        ],
      },
      INDECISIVE: {
        clientType: "Homeowner unsure about scope and materials",
        budget: "$80,000 for addition, flexible but uncertain",
        painPoints: [
          "Overwhelmed by material choices and options",
          "Can't decide on final scope (nice to have vs. must have)",
          "Worried about making wrong choices they'll regret",
        ],
        personality: "Overthinking, needs guidance, changes mind",
        openingLine:
          "We want to add a master suite addition to our home. Budget is around $80k but we're not sure exactly what we want - should we include a walk-in closet? What about the bathroom finishes? We have so many decisions to make and we don't want to regret choices later. How do you help clients figure this out?",
        typicalObjections: [
          "Can we change the plan if we decide differently later?",
          "What if we go over budget - can we adjust scope mid-project?",
          "We need more time to think about the material selections",
        ],
      },
      DEMANDING: {
        clientType: "High-end client with specific expectations",
        budget: "$250,000+ custom build or luxury remodel",
        painPoints: [
          "Very specific vision and quality expectations",
          "Expects premium materials and craftsmanship",
          "No tolerance for delays or mistakes",
        ],
        personality: "Detail-oriented, high standards, impatient",
        openingLine:
          "I'm building a custom [home/high-end renovation] and I need a contractor who can execute at the highest level. Budget is $250k+. I have a specific vision, I expect daily updates, and I've worked with contractors before who disappointed me. What makes you different and can you handle this level of client?",
        typicalObjections: [
          "That timeline seems too long",
          "I expected more attention to detail in your proposal",
          "Your competitor has more experience with luxury projects",
        ],
      },
      TIME_PRESSURED: {
        clientType: "Property owner facing urgent deadline",
        budget: "$60,000, needs project done fast",
        painPoints: [
          "Rental property needs work before new tenant moves in",
          "Selling home, needs repairs before listing",
          "Deadline-driven, stressed about timing",
        ],
        personality: "Urgent, motivated, willing to pay premium for speed",
        openingLine:
          "I have a rental property that needs a full renovation before my new tenant moves in 8 weeks from now. Budget is $60k. I know the timeline is tight but I'm losing rental income every day it's not done. Can you complete this on time and what would it cost to expedite?",
        typicalObjections: [
          "8 weeks is my absolute deadline, can you guarantee completion?",
          "What if materials are delayed or you run into issues?",
          "I can't afford delays, what's your contingency plan?",
        ],
      },
      HIGH_BUDGET: {
        clientType: "Developer or commercial client",
        budget: "$500,000+ commercial project or multi-unit development",
        painPoints: [
          "Complex project requiring coordination with multiple trades",
          "Needs proven track record on similar projects",
          "Expects partnership and problem-solving",
        ],
        personality: "Professional, strategic, values reliability",
        openingLine:
          "I'm developing a [commercial building/multi-unit residential] project with a $500k+ construction budget. I need a general contractor with experience managing projects of this scale - permitting, subcontractor coordination, timeline management, everything. What's your experience with commercial/multi-unit projects?",
        typicalObjections: [
          "I need someone who can problem-solve when issues come up",
          "How will you manage the schedule with multiple trades?",
          "Can you provide performance bonds and detailed project management?",
        ],
      },
    },
  },
};
