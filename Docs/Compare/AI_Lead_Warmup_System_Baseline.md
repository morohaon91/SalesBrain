# AI-Based Lead Warm-Up System – Baseline Document

## Overview

This is a multi-tenant SaaS application designed to function as an AI-powered lead warm-up system for businesses. The core value proposition is to replace basic chatbots with an intelligent AI agent that learns and replicates the business owner's communication style, behavior, and thinking patterns.

The system interacts with incoming leads 24/7, providing fast, intelligent responses that mirror how the business owner would naturally communicate. After each interaction, leads are evaluated and scored (Cold, Warm, or Hot), enabling business owners to prioritize and act on qualified opportunities efficiently.

---

## Core Purpose

**The system is NOT designed to:**
- Replace the business owner
- Close sales automatically
- Make pricing decisions or commitments

**The system IS designed to:**
- Act as the business owner when engaging with leads
- Be available 24/7 with fast response times
- Warm up leads using the owner's authentic communication style
- Qualify and score leads based on conversation quality
- Provide business owners with actionable insights and summaries

---

## Architecture

### Multi-Tenant System
- Each registered user receives their own isolated tenant environment
- Full data separation between tenants
- Scalable infrastructure to support multiple businesses simultaneously

---

## Communication Channels

Leads interact with the AI agent through:

1. **Website Chat Widget** – Embedded on the business owner's website
2. **WhatsApp** – Integration method to be defined (possible options: business phone number or QR-based entry)
3. **Phone Calls (Future)** – Voice-based interaction capability

---

## Onboarding & Learning Process

### Step 1: Business Information
After registration, the business owner is asked questions about their business type.

**Supported Business Types (Initial Launch):**
- Contractors
- IT Services
- Software Development Services
- Financial Services
- *(8–10 business types total)*

### Step 2: Simulation Scenarios
The business owner completes **3–5 simulation scenarios** where:
- The AI acts as potential customers relevant to the business type
- Each scenario represents different real-life situations
- The owner types real-time responses as if chatting with actual leads
- *(Future: Voice-based simulations)*

### Step 3: AI Learning & Data Extraction
After simulations, the system uses AI to extract and learn:
- Communication style
- Tone and phrasing
- Thinking patterns
- Frequently used words and sentences

### Step 4: Learning Progress Tracking
- The system displays a **learning progress percentage**
- Progress is measured based on:
  - Number of completed scenarios
  - Consistency in responses
  - Vocabulary coverage
  - Success rate in simulations (e.g., booking meetings or moving toward a "yes")
- **90% completion** unlocks the option to go live

### Step 5: Profile Approval
- The business owner reviews and approves their generated profile
- Profile remains **editable at all times**, even after going live
- Profile includes:
  - Business hours
  - Services offered
  - Pricing ranges
  - Team size
  - Typical project timelines

---

## AI Agent Behavior

### Conversation Framework: The CLOSER Model
The AI agent is designed to warm up leads using the **CLOSER methodology**:

- **C – Clarify**: Understand why the lead reached out now
- **L – Label**: Clearly define the problem so the lead resonates with it
- **O – Overview the pain**: Identify challenges and past attempts
- **S – Sell the outcome**: Focus on desired results, not just solutions
- **E – Explain away concerns**: Identify and address objections
- **R – Reinforce the decision**: Guide toward booking a call and set expectations

### Agent Identity
The AI represents the business using a defined identity, such as:
- "The team of [Business Name]"

### Agent Limitations
The AI will **never**:
- Engage in pricing negotiations
- Handle contracts
- Make promises about deliverables

### Conversation Guidelines
- Interactions should remain **short and efficient** to maintain lead engagement
- At the appropriate moment, the system suggests a handoff or meeting
- *(Time/message limits to be defined)*

---

## Manual Takeover & Real-Time Monitoring

### Dashboard View
- Business owners can view **all active chats** in a real-time dashboard
- Conversations can be monitored as they happen

### Manual Takeover
- Business owners can **take over any conversation manually** at any time
- Once takeover occurs, the AI agent **stops completely**
- The owner assumes full control of the interaction

---

## Lead Scoring & Management

### Scoring System
After each conversation, the AI evaluates the lead and assigns a score:
- **Cold** – Low engagement or unclear intent
- **Warm** – Moderate interest, needs nurturing
- **Hot** – High intent, ready for direct engagement

### Lead List & Prioritization
- All leads are displayed in a **Leads List**
- **Hot leads** trigger priority notifications to the business owner
- *(Specific scoring criteria to be defined)*

### Post-Conversation Output
Business owners receive:
- Full conversation summary
- Lead's needs and intentions
- AI-assigned lead score
- Relevant context for follow-up

---

## Notifications

### Initial MVP
- Notifications available **within the system only**

### Future Enhancements
- Email notifications
- Push notifications

---

## Follow-Up & Nurturing

- The system supports **automated follow-ups**
- Follow-up criteria are **defined by the business owner**
- Automated nurturing can continue after initial conversations based on owner settings

---

## Analytics & Insights

Business owners will have access to:
- **Conversation trends** – Patterns in lead inquiries
- **Common objections** – Frequently raised concerns
- **Time-to-response metrics** – Speed of engagement
- **Qualified leads** – Summary of warm/hot opportunities

---

## Multi-User & Team Training

### Team Access
- The system supports **multiple team members** per business
- Access depends on the selected pricing plan

### Training Use Case
- The simulation system can be used to **train sales teams**
- After the profile is completed and the system goes live, simulations continue as a training mechanism
- Ongoing simulations refine the system over time
- No automatic changes to the live profile—updates require manual approval

---

## Pricing & Plans

- **Multiple pricing tiers** with different usage limits per business owner
- Plan details to be defined
- Limits may include:
  - Number of leads per month
  - Number of team members
  - Access to advanced analytics
  - Integration options

---

## Integrations

### Not Included
- CRM platforms (e.g., Salesforce, HubSpot)

### Planned Integrations
- **Calendar systems** – AI agent can schedule meetings
- **Lead-providing platforms** (e.g., Yelp) – System receives incoming leads and initiates contact

---

## Data & Privacy

### Data Retention
- Conversation histories and lead data are stored within the system
- Retention policies to be defined

### Compliance
- **MVP stage**: GDPR and compliance frameworks not required
- **Future consideration**: Compliance may be introduced as the platform scales

### Lead Transparency
- The system should maintain a natural conversation feel
- Should not feel like interacting with a "bot"
- *(Disclosure policies to be defined)*

---

## Key Features Summary

| Feature | Description |
|---------|-------------|
| **Multi-Tenant Architecture** | Isolated environments for each business |
| **AI Learning via Simulations** | 3–5 real-time chat scenarios to train the AI |
| **CLOSER Conversation Model** | Structured lead warm-up methodology |
| **Multi-Channel Support** | Website widget, WhatsApp, future voice calls |
| **Real-Time Monitoring** | Dashboard view of all active conversations |
| **Manual Takeover** | Owner can assume control at any time |
| **Lead Scoring** | Cold, Warm, Hot classification |
| **Automated Follow-Ups** | Configurable nurturing sequences |
| **Team Training Mode** | Ongoing simulations for sales team development |
| **Analytics & Insights** | Trends, objections, response times, qualified leads |
| **Calendar Integration** | AI schedules meetings |
| **Editable Profile** | Always customizable, even post-launch |

---

## Success Metrics

The system is considered successful when:
- Learning progress reaches **90%** based on simulation performance
- AI agent accurately replicates the business owner's style
- Leads are qualified and scored effectively
- Business owners can prioritize high-value opportunities
- Response times are significantly faster than manual engagement
- Sales teams are trained and aligned with the owner's approach

---

## Future Enhancements (Not in MVP)

- Voice-based simulations and interactions
- CRM integrations
- Advanced compliance and data governance (GDPR, SOC 2)
- Email and push notification systems
- Deeper lead platform integrations (Yelp, Angi, Thumbtack, etc.)

---

## Document Status

**Version**: 1.0 – Baseline  
**Date**: April 12, 2026  
**Purpose**: Foundation document for planning and development  
**Next Steps**: Define technical architecture, UI/UX design, scoring criteria, pricing tiers
