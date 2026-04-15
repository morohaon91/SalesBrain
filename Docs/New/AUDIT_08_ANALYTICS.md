# Audit Prompt 8: Analytics & Reporting

**Purpose**: Understand what metrics and insights are available to owners.

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_08_ANALYTICS.md`

---

# Analysis Request: Analytics & Reporting System

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze what analytics and insights are available to business owners.

---

## Baseline Requirements

### Analytics & Insights
Business owners have access to:
- **Conversation trends** – Patterns in lead inquiries
- **Common objections** – Frequently raised concerns
- **Time-to-response metrics** – Speed of engagement
- **Qualified leads** – Summary of warm/hot opportunities

---

## Analysis Questions

### Part 1: Analytics Data Model

#### 1.1 Metrics Storage

1. **Is there a metrics/analytics table?**
   - ConversationMetrics? AnalyticsEvent? DailyStats?
   - Show the schema

2. **What's captured for analytics?**
   - Daily aggregates?
   - Per-conversation metrics?
   - Real-time counters?
   - Show all fields

3. **What data points are tracked?**
   - Number of conversations per day?
   - Number of qualified leads?
   - Average response time?
   - Common objections?
   - Lead source (widget, WhatsApp)?
   - Conversion rates?

#### 1.2 Aggregation Logic

1. **Are metrics aggregated?**
   - Raw event → aggregated daily?
   - Real-time calculation?
   - Batch job?
   - Show the code

2. **How often are metrics updated?**
   - Real-time?
   - Every N minutes?
   - Daily?
   - Show the timing/cron job

---

### Part 2: Dashboard & Visualization

#### 2.1 Analytics Dashboard

1. **Is there an analytics page?**
   - URL: [/dashboard/analytics or similar]?
   - Show the component code

2. **What metrics are displayed?**
   - Conversation count?
   - Qualified leads count?
   - Average response time?
   - Hot/Warm/Cold breakdown?
   - Common objections?
   - Other?

3. **What's the UI?**
   - Charts/graphs?
   - Tables?
   - Numbers/KPIs?
   - Screenshots or component code?

#### 2.2 Time Range Filtering

1. **Can owner filter by date range?**
   - Last 7 days?
   - Last 30 days?
   - Custom range?
   - Show the UI

2. **Are there preset options?**
   - "This week", "This month", "Last month"?

---

### Part 3: Conversation Trends

#### 3.1 Trend Tracking

1. **Are conversation trends tracked?**
   - Yes / No
   - Show the code

2. **What constitutes a "trend"?**
   - Number of conversations per day?
   - Growth/decline?
   - Seasonality?

3. **How is it displayed?**
   - Line chart?
   - Bar chart?
   - Table?
   - Show the component

#### 3.2 Inquiry Patterns

1. **Are inquiry patterns identified?**
   - Most common reasons for contact?
   - Industry/business type specific patterns?

2. **How is this analyzed?**
   - Lead description analyzed?
   - Conversation summary analyzed?
   - Objections extracted?
   - Show the code

---

### Part 4: Objection Analysis

#### 4.1 Objection Tracking

1. **Are objections tracked?**
   - Yes / No
   - Show where (Conversation model, separate table)?

2. **What objections are captured?**
   - "Budget too high"?
   - "Timeline not right"?
   - "Needs competitor comparison"?
   - How are they identified?

3. **How many are tracked?**
   - Free-form text or pre-defined list?
   - Show the schema

#### 4.2 Objection Analytics

1. **Can owner see most common objections?**
   - Yes / No
   - Display method? (chart, table, list)

2. **Is success rate tracked by objection?**
   - Which objections lead to qualified leads?
   - Which objections lead to lost leads?

3. **Are there insights/recommendations?**
   - "Budget is raised in 40% of conversations"?
   - "Successfully overcome in 60% of cases"?

---

### Part 5: Response Time Metrics

#### 5.1 Latency Tracking

1. **Is response time measured?**
   - Time to first AI response?
   - Time to owner response (post-takeover)?
   - Average per conversation?
   - Show the code

2. **Is it aggregated?**
   - Daily average?
   - Weekly average?
   - Overall average?

#### 5.2 Response Time Display

1. **How is response time shown?**
   - Dashboard metric?
   - Chart over time?
   - Benchmark (industry average)?

---

### Part 6: Lead Qualification Metrics

#### 6.1 Qualified Leads Summary

1. **Is there a "qualified leads" metric?**
   - Count of Warm leads?
   - Count of Hot leads?
   - Trend over time?

2. **How is "qualified" defined?**
   - Score >= 70 (Hot)?
   - Score >= 50 (Warm + Hot)?
   - Custom threshold?

3. **Is qualification rate shown?**
   - "X% of leads are qualified"?
   - "Y of last Z conversations produced qualified leads"?

#### 6.2 Conversion Tracking

1. **Is lead conversion tracked?**
   - Qualified lead → booked call?
   - Qualified lead → deal?

2. **Is there follow-up data?**
   - Did qualified lead respond to follow-up?
   - Did they close?

---

### Part 7: Source Analytics

#### 7.1 Lead Source

1. **Is lead source tracked?**
   - Lead came from widget?
   - Lead came from WhatsApp?
   - Show the data field

2. **Is source analytics available?**
   - "X leads from widget, Y from WhatsApp"?
   - Conversion rate by source?

---

### Part 8: Export & Reporting

#### 8.1 Data Export

1. **Can owner export analytics?**
   - CSV download?
   - PDF report?
   - Show the code

2. **What can be exported?**
   - Conversation list?
   - Lead list?
   - Metrics summary?

#### 8.2 Scheduled Reports

1. **Are there automated reports?**
   - Daily summary email?
   - Weekly digest?
   - Show the code

2. **Can owner customize reports?**
   - Choose which metrics to include?
   - Custom date ranges?

---

### Part 9: Performance & Scalability

#### 9.1 Query Performance

1. **How are analytics queries optimized?**
   - Aggregate tables (don't query raw data)?
   - Indices?
   - Caching?
   - Show the query logic

2. **Is there pagination?**
   - If showing list of conversations, limit to N per page?

#### 9.2 Real-Time vs. Batch

1. **Are metrics real-time or batch?**
   - Updated as events happen?
   - Updated nightly?
   - Show the mechanism

---

### Part 10: Gaps vs. Baseline

Analyze:

1. **Are conversation trends tracked?**
   - [yes/no/partial]

2. **Are objections analyzed?**
   - [yes/no/partial]

3. **Is response time tracked?**
   - [yes/no/partial]

4. **Is qualified lead summary available?**
   - [yes/no/partial]

5. **Is analytics dashboard functional?**
   - [yes/no/partial]

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- Analytics dashboard: [working / partial / missing]
- Metrics tracked: [list which ones]
- Data freshness: [real-time / daily batch / other]

### 2. Metrics Data Model
```
ConversationMetrics (or equivalent):
  id: String
  tenantId: String
  date: DateTime
  totalConversations: Int
  qualifiedLeads: Int (Warm + Hot)
  hotLeads: Int
  warmLeads: Int
  coldLeads: Int
  avgResponseTime: Float
  avgDuration: Int
  [other fields]
```

### 3. Tracked Metrics
- [ ] Conversation count: [implemented / missing]
- [ ] Qualified leads: [implemented / missing]
- [ ] Response time: [implemented / missing]
- [ ] Common objections: [implemented / missing]
- [ ] Conversion rate: [implemented / missing]
- [ ] Lead source: [implemented / missing]
- [ ] Trend analysis: [implemented / missing]

### 4. Dashboard
- URL: [/dashboard/analytics or N/A]
- Implemented: [yes/no]
- Metrics displayed: [list]
- Time range filter: [yes/no]
- Components: [code location]

### 5. Objection Analysis
- Tracked: [yes/no]
- Data source: [Conversation model / separate table]
- Display: [chart / table / missing]
- Common objections shown: [yes/no]
- Success rate by objection: [yes/no]

### 6. Conversation Trends
- Tracked: [yes/no]
- Display: [chart / missing]
- Time range: [daily / weekly / custom]
- Code location: [file / missing]

### 7. Response Time Metrics
- Tracked: [yes/no]
- Aggregation: [daily / real-time / missing]
- Display: [chart / number / missing]

### 8. Qualified Leads Summary
- Available: [yes/no]
- Shows: [count / percentage / trend]
- Definition of "qualified": [Score >= X]
- Code location: [file / missing]

### 9. Export & Reporting
- Data export: [yes/no]
- Format: [CSV / PDF / none]
- Automated reports: [yes/no]
- Schedule: [daily / weekly / none]

### 10. Critical Gaps & Recommendations

**Missing**:
- [ ] Analytics dashboard
- [ ] Metrics aggregation
- [ ] Objection tracking
- [ ] Response time tracking

**Incomplete**:
- [ ] Dashboard partially working
- [ ] Some metrics missing

**Needed for MVP**:
1. Basic dashboard showing:
   - Total conversations
   - Qualified lead count
   - Hot/Warm/Cold breakdown
2. Objection tracking (at least extraction)
3. Response time metric

**Deferred to Phase 2**:
- [ ] Advanced analytics (conversion tracking, ROI, etc.)
- [ ] Scheduled reports
- [ ] Data export

**Effort to Fix**:
- Dashboard: X days
- Metrics aggregation: Y days
- Objection analysis: Z days

---

## Success Criteria

This audit is complete when you can:
1. Confirm if analytics dashboard exists and works
2. List which metrics are tracked
3. Identify what insights owners can see
4. Identify all gaps from baseline
