# Cursor Prompt — Concierge Redesign v2
> Full redesign + safe rename across all screens and files

---

## ✅ PROGRESS TRACKER

### PART 1 — SAFE RENAME ✅ COMPLETE

- [x] `locales/en/common.json` — `appName`, `home.title` → "Concierge"
- [x] `locales/en/dashboard.json` — `howItWorks.title`, `step1Body` → "Concierge"
- [x] `locales/en/admin.json` — `login.title` → "Concierge Admin"
- [x] `locales/en/widget.json` — `poweredBy` → "Powered by Concierge"
- [x] `locales/he/common.json` — `appName`, `home.title` → "Concierge"
- [x] `locales/he/dashboard.json` — `howItWorks.title`, `step1Body` → "Concierge"
- [x] `locales/he/admin.json` — `login.title` → "מנהל Concierge"
- [x] `locales/he/widget.json` — `poweredBy` → "מופעל על ידי Concierge"
- [x] `app/layout.tsx` — metadata title → "Concierge — Your AI Sales Rep, Always On"
- [x] `app/(auth)/layout.tsx` — h1 headings (×2) → "Concierge"
- [x] `components/dashboard/sidebar.tsx` — wordmark → "Concierge"

**Did NOT rename (correct — code identifiers):**
- `window.SalesBrainConfig` (widget global object)
- `salesbrain-*` DOM IDs and CSS animation names in widget.js
- `package.json` `name: "salesbrain"`
- API URLs (`widget.salesbrain.ai`, `api.salesbrain.ai`)
- Prisma seed email addresses

---

### PART 2 — UI/UX REDESIGN

#### 1. Global Design System ✅ COMPLETE
- [x] **`tailwind.config.js`** — Primary color palette changed to **warm amber** (was generic corporate blue)
- [x] **`app/globals.css`** — Full token system: warm off-white background, near-black warm foreground, amber primary, teal accent, score system tokens (cold/warm/hot), sidebar CSS variables
- [x] **`components/shared/loading-screen.tsx`** — Redesigned with Concierge wordmark, amber mark animation

#### 2. Sidebar ✅ COMPLETE
- [x] **`components/dashboard/sidebar.tsx`** — New Concierge wordmark (geometric amber mark + "CONCIERGE" text)
- [x] Active nav item: **amber left-border accent** + white text (replaces plain bg highlight)
- [x] Plan badge with Zap icon in footer
- [x] Mobile close button updated
- [x] Upgrade button in amber

#### 3. Auth Layout ✅ COMPLETE
- [x] **`app/(auth)/layout.tsx`** — Premium dark left panel (slate-950) with radial amber glow
- [x] Concierge wordmark on brand panel
- [x] "Your AI sales rep. Always on." tagline with amber accent
- [x] Feature bullet list with amber dot indicators
- [x] Mobile wordmark on right panel

#### 4. Dashboard ✅ COMPLETE
- [x] **`app/(dashboard)/dashboard/page.tsx`** — Full redesign
- [x] `SetupProgressBar` component — dismissable, replaces permanent "How it Works" block; disappears at 100%
- [x] Setup steps with circle/check indicators and amber progress bar
- [x] `ScoreBadge` — color-coded hot/warm/cold pill
- [x] `RelativeTime` — "2m ago" / "3h ago" format
- [x] Recent conversations: lead avatar (amber), score badge, summary excerpt, relative time
- [x] Stat cards: amber icons, warm borders
- [x] Trial block: dark slate card with amber CTA
- [x] Quick links using amber color

#### 5. Conversations ✅ COMPLETE
- [x] **`app/(dashboard)/conversations/page.tsx`** — Full redesign
- [x] `ScorePill` — hot/warm/cold color-coded with dot indicator
- [x] `QualBadge` — colored by qualification status
- [x] Sortable table layout with header row (hidden on mobile)
- [x] Lead avatars with amber initials
- [x] Stats row with amber/teal/green metric colors
- [x] Filters panel: warm background, proper input styling

#### 6. Simulations ✅ COMPLETE
- [x] **`app/(dashboard)/simulations/page.tsx`** — Full redesign
- [x] `TrainingProgress` dark card — X/3 required, % trained, step indicators
- [x] `ScenarioBadge` — amber/teal/green difficulty color system
- [x] Filter: pill-tab selector (replaces dropdown)
- [x] Simulation cards: icon showing completed (green check) vs in-progress (amber play)
- [x] Empty state with clear CTA

#### 7. Leads ✅ COMPLETE
- [x] **`app/(dashboard)/leads/page.tsx`** — Full redesign
- [x] `ScoreBar` — visual bar + hot/warm/cold label (not plain text number)
- [x] `StatusPill` — amber/orange/green color coding
- [x] Sortable table layout with header row
- [x] Lead avatars, unread dot indicator
- [x] Stats row with colored metrics

#### 8. Analytics ✅ COMPLETE
- [x] **`app/(dashboard)/analytics/page.tsx`** — Full redesign
- [x] Period selector as button group (not separate buttons)
- [x] `SegmentBar` — animated, color-coded by score temperature
- [x] Conversion funnel visualization
- [x] `MetricCard` components with icon bg + color
- [x] Empty state with actionable hint

#### 9. Settings ✅ COMPLETE
- [x] **`app/(dashboard)/settings/page.tsx`** — Full redesign
- [x] Tab nav with amber active indicator + icons
- [x] Account, Subscription, Widget, Security tabs all updated
- [x] Subscription: amber trial card
- [x] Widget: dark code block for embed code
- [x] Security: danger zone with rose color tokens

#### 10. Profile ✅ COMPLETE
- [x] **`app/(dashboard)/profile/page.tsx`** — Key improvements
- [x] **"Extracted Patterns" is now the default/first tab** (hero content, not secondary)
- [x] "AI is live" animated pulse indicator in header when profile is approved
- [x] Tab nav with amber active indicator
- [x] Readiness banner updated to amber tokens
- [x] Header uses new typography tokens

#### 11. Header ✅ COMPLETE
- [x] **`components/dashboard/header.tsx`** — Redesigned
- [x] Amber avatar background
- [x] Cleaner dropdown menu
- [x] Consistent border/bg token usage

#### 12. Dashboard Layout ✅ COMPLETE
- [x] **`app/(dashboard)/layout.tsx`** — Uses CSS variable background

#### 13. Stats Card ✅ COMPLETE
- [x] **`components/shared/stats-card.tsx`** — Amber/teal/green icon backgrounds using CSS vars
- [x] `trend.period` field for "vs. last period" sub-label
- [x] Border-shift hover (card-hover class)

---

### PENDING / NOT YET TOUCHED
- [ ] `app/(dashboard)/conversations/[id]/page.tsx` — Conversation detail with split pane + takeover banner
- [ ] `app/(dashboard)/leads/[id]/page.tsx` — Lead detail CRM card
- [ ] `app/(dashboard)/simulations/new/page.tsx` — Scenario selection (featured hero slot)
- [ ] `app/(dashboard)/simulations/[id]/page.tsx` — Active simulation view
- [ ] `app/(onboarding)/questionnaire/page.tsx` — Onboarding flow
- [ ] `components/ui/button.tsx` — Could update primary variant to amber
- [ ] `components/ui/badge.tsx` — Update variant colors

---

You are a senior product designer and frontend engineer. Your task has two parts:

PART 1 — SAFE RENAME: "SalesBrain" → "Concierge"
PART 2 — FULL UI/UX REDESIGN across every screen

Execute Part 1 first, confirm with me, then proceed to Part 2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — SAFE RENAME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rename the product from "SalesBrain" to "Concierge" everywhere it appears as a DISPLAY string.

SAFE TO RENAME (display text only):
- UI text: page titles, headings, labels, button text
- i18n translation VALUES (the text after the colon, never the key)
- metadata: <title> tags, og:title, og:site_name, manifest name/short_name
- Comments that describe the product by name
- README and documentation text
- Email templates and notification copy
- Onboarding copy and empty state messages
- console.log messages and user-facing error strings

DO NOT RENAME (would break the system):
- i18n translation KEYS (e.g. "salesbrain.dashboard.title" — key stays, value changes)
- Environment variable names (SALESBRAIN_API_KEY stays as-is)
- Database table names, column names, or migration files
- API endpoint paths (/api/salesbrain/... stays as-is)
- Package names in package.json
- Git repository references
- Internal code identifiers: variable names, function names, class names, type names
- Import paths and file names
- Any string used as a code value (object keys, enum values, constants)

RENAME STRATEGY:
1. First, search the entire codebase for every occurrence of "SalesBrain" and "salesbrain" (case-insensitive)
2. Categorize each occurrence: is it a display string or a code identifier?
3. Show me the categorized list before making any changes
4. Only proceed with renaming after I confirm the list looks correct
5. After renaming, search again to confirm zero display occurrences remain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — FULL UI/UX REDESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCT CONTEXT

Concierge is an AI-powered lead warm-up SaaS. The AI learns the business owner's exact communication style through simulations, then talks to incoming leads 24/7 — qualifying them, warming them up, and handing off hot leads to the owner. The core concept: "your concierge is always on."

DESIGN DIRECTION

Target aesthetic: Linear meets a luxury hotel concierge desk. Think understated confidence, white-glove service, high information density that still feels calm. Reference points: Linear, Vercel dashboard, Raycast. Not Notion, not Salesforce, not a dashboard template.

The UI must visually communicate: intelligence, personalization, and trust. Not just another lead tool.

VISUAL IDENTITY

Color palette direction:
- Move away from generic corporate blue
- Primary palette: deep slate (near-black with a warm undertone), clean off-white surfaces
- Single accent color: a warm amber or deep teal — pick whichever feels more premium and service-oriented given the design system tokens available
- Status colors (Cold/Warm/Hot lead scores) should feel like a considered system, not traffic lights
- All colors must still use design system tokens only — zero hardcoded values

Typography:
- Tighten the type scale — headings should have more weight contrast vs body
- Use font-weight hierarchy deliberately: one weight for data/labels, one for headings
- Increase base font size slightly if current scale feels small

Logo / wordmark:
- Design a simple wordmark for "Concierge" in the sidebar
- Style: minimal, single weight, optionally a small geometric mark before the name
- Should feel like it could be a real company logo, not placeholder text
- Keep it implementable in pure CSS/SVG — no image files

SCREENS TO REDESIGN

Redesign every screen. Execute in this order, confirm with me between each:

1. Global: design system adjustments, CSS tokens, typography scale, sidebar, top nav
2. Dashboard
3. Conversations (list + detail/split pane)
4. Leads (list + detail)
5. Simulations (scenario selection + active simulation)
6. AI Training / learning progress
7. Business Profile (basic info + extracted patterns)
8. Analytics
9. Settings
10. Onboarding flow

SPECIFIC IMPROVEMENTS

Sidebar:
- Strong visual identity — wordmark area at top with the Concierge mark
- Active state: more intentional than a background highlight (left border accent or similar)
- Tenant context: business name and plan badge visible, not buried
- Collapsible to icon-only mode for more content space

Dashboard:
- Stat cards: add trend indicators and period comparison — not just raw numbers
- Replace the permanent "How it Works" onboarding block with a dismissable setup progress bar that disappears at 100%
- Recent Conversations: show lead name, score badge, last message preview, elapsed time
- Quick actions: clear primary/secondary visual hierarchy

Simulations:
- Remove the "card inside a card" pattern for the recommended scenario — make it a proper featured hero slot
- Each scenario card shows state: not started / in progress / completed
- Top of page shows overall training progress: X of N required completed, % AI trained
- Difficulty badges are color-coded and visually distinct

Profile:
- Extracted Patterns is the hero content — make it prominent, not a secondary tab
- Profile should feel like an identity card, not a settings form
- Visual cue showing "AI is actively using this profile"

Conversations:
- Split-pane layout: list left, conversation right
- List items: lead name, score badge with color, last message excerpt, timestamp
- Conversation view: clear AI vs owner message distinction, always-visible takeover button
- Manual takeover = distinct mode with a persistent "You are in control — AI is paused" banner
- Lead score card visible in conversation sidebar

Leads:
- Sortable table: name, score, channel, last activity, assigned status
- Score as a color-coded visual indicator, not plain text
- Lead detail: CRM-style card with summary, score history, conversation links

AI Training:
- Visual progress gauge (not just a percentage text)
- Break down what AI has learned: tone, objection handling, closing style, vocabulary
- Show which simulations contributed to which learned behaviors

Analytics:
- Proper chart components using the existing charting library (recharts or equivalent)
- Key metrics: conversations over time, lead score distribution, avg time to qualify, common objections

UX SYSTEM RULES

Empty states:
- Every empty state must explain why it is empty and what action fixes it
- Never just "No data yet"

Loading states:
- Skeleton loaders for content areas, not spinners

Error states:
- Friendly and actionable — never raw error messages shown to users

Micro-interactions:
- Button hover, active, focus states feel alive but not overdone
- Card hover should lift subtly (no shadow — use border color shift instead)
- Lead score badge change (Cold → Warm) shows a brief animated indicator

Responsive:
- All layouts must work at 1280px minimum width
- Do not optimize for ultrawide — design for a real laptop screen

HARD CONSTRAINTS

- Use ONLY CSS custom properties from the existing design token system — zero hardcoded color, spacing, or radius values
- RTL support must be fully preserved — use logical CSS properties (margin-inline-start, padding-inline-end, border-inline-start, etc.) wherever you touch layout
- Do not change i18n translation keys — only update values and surrounding UI
- Do not install new dependencies
- TypeScript strict — no `any` types in new code
- Do not change: routing, API calls, state management, data fetching logic
- Keep components small and composable — split only if you are already touching that component

EXECUTION PROTOCOL

- Do Part 1 (rename audit) first — show me the list, wait for confirmation
- Then do Part 2 one section at a time in the order listed
- After each screen: summarize what changed and what you intentionally did not touch
- If you encounter an architectural ambiguity, stop and ask — do not guess
