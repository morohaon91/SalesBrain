# Responsive & Viewport Audit (SalesBrain)

**Date:** 2026-03-18  
**Overall Score:** 3/10  
**Responsive Maturity Level:** Early Production  

## Executive Summary
This audit reviewed the responsive behavior of the Next.js UI by inspecting the dashboard/auth layouts, navigation components, form controls, and key page templates for viewport configuration, breakpoint usage, touch target sizing, and common overflow risks.

**Severity distribution (total findings: 7):**
Critical: 1  
High: 2  
Medium: 3  
Low: 1  

**Main takeaways:**
1. The dashboard’s navigation layout is not mobile-collapsed (fixed sidebar width), which makes the authenticated app potentially unusable on small screens.
2. There is no explicit viewport configuration in the root layout.
3. Multiple “fixed width / fixed padding” choices (landing + admin login) and several touch target sizes fall below common mobile accessibility expectations.

## Audit Scope and Methodology
**Scope (code evidence-based):**
- Viewport configuration and root HTML markup: `app/layout.tsx`
- Breakpoint behavior and responsive class usage: Tailwind-generated CSS and `lg`/`md`/`sm` modifiers in layout/page components
- Navigation & layout composition:
  - Dashboard shell: `app/(dashboard)/layout.tsx`
  - Sidebar: `components/dashboard/sidebar.tsx`
  - Header: `components/dashboard/header.tsx`
- Key screens and form UX:
  - Landing: `app/page.tsx`
  - Auth pages: `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
  - Platform admin login: `app/admin/login/page.tsx`
  - Representative dashboard pages: dashboard home, leads, conversations
  - Admin dashboard page stats grid: `app/admin/dashboard/page.tsx`

**Method:**
- Searched for viewport configuration and examined root layout markup.
- Identified breakpoint usage from Tailwind media queries in `.next/static/css/app/layout.css` and from `lg:`/`md:`/`sm:` Tailwind modifiers in source components.
- Checked for common mobile issues: fixed widths, large fixed padding, missing layout reflow at small widths, truncated critical information, and touch target sizes.

## Findings

### 1) Missing explicit viewport configuration
**File(s):** `app/layout.tsx`  
**Location:** `app/layout.tsx` lines **6-25** (root `metadata` defines `title`/`description` only; RootLayout markup on lines **17-24** has no viewport config/meta).  
**Severity:** High  
**Impact:** On mobile browsers, the page may render with an incorrect default viewport scaling behavior (commonly causing UI to appear too small/zoomed out), which can degrade layout correctness even if Tailwind responsive classes exist.  
**Recommended solution:** Add Next.js viewport configuration at the root layout (e.g., `export const viewport = { width: 'device-width', initialScale: 1 }`) or include a `<meta name="viewport" ...>` tag so that all pages share consistent mobile scaling.

### 2) Dashboard navigation is not mobile-collapsed (fixed sidebar causes unusable narrow layouts)
**File(s):**
- `app/(dashboard)/layout.tsx`
- `components/dashboard/sidebar.tsx`  
**Location:**
- `app/(dashboard)/layout.tsx` lines **31-44**: dashboard shell uses `className="flex h-screen ..."` and always renders `<Sidebar />` (no `sm/md/lg` collapse).  
- `components/dashboard/sidebar.tsx` lines **60-110**: sidebar uses a fixed width `className="w-64 ... h-screen"` (no `hidden`/responsive collapse).  
**Severity:** Critical  
**Impact:** On small screens (e.g., ~320px width), a fixed `w-64` sidebar consumes most/all horizontal space, leaving the main content extremely narrow. This makes key navigation and page interactions effectively unusable and can also lead to horizontal overflow/clipping.  
**Recommended solution:** Implement a responsive sidebar pattern:
1. Hide sidebar below a chosen breakpoint (e.g., `md`/`lg`) and provide a hamburger button to open a drawer/sheet.
2. Ensure the main content container can shrink safely (e.g., using `min-w-0` patterns where needed) and verify no horizontal overflow occurs at 320px.

### 3) Platform admin login uses fixed width that overflows on small devices
**File:** `app/admin/login/page.tsx`  
**Location:** `app/admin/login/page.tsx` line **46**: login card uses `className="... w-96"` (fixed width).  
**Severity:** High  
**Impact:** On phones narrower than the fixed card width, the form may overflow horizontally (horizontal scroll or clipped content), making login actions harder or impossible.  
**Recommended solution:** Replace fixed width with responsive sizing (e.g., `w-full max-w-sm` / `max-w-xs`) so the card fits within the viewport and remains centered.

### 4) Landing page uses large fixed padding on all viewports
**File:** `app/page.tsx`  
**Location:** `app/page.tsx` line **3**: `<main ... className="... p-24">` uses fixed padding with no small-screen override.  
**Severity:** Medium  
**Impact:** On small screens, large padding reduces usable content width dramatically, forcing extra wrapping and producing a cramped/less readable hero.  
**Recommended solution:** Use responsive padding (e.g., smaller base padding and increased values at `sm`/`lg` breakpoints), so content remains readable at 320–480px widths.

### 5) Touch targets are likely below typical minimums on mobile (inputs/buttons/icon buttons)
**File(s):**
- `components/ui/input.tsx` (`h-10`)
- `components/ui/button.tsx` (default `size: default` sets `h-10`)
- `components/dashboard/header.tsx` (notification icon uses `p-2`)
- `app/(dashboard)/leads/page.tsx` (search input/select use `py-2`)  
**Location:**
- `components/ui/input.tsx` line **12**: `Input` sets `className="... flex h-10 ..."` (40px height).  
- `components/ui/button.tsx` line **19**: `Button` default size sets `h-10 px-4 py-2` (40px height).  
- `components/dashboard/header.tsx` lines **82-85**: notification icon-only button uses `p-2` around `<Bell className="w-5 h-5" />`.  
- `app/(dashboard)/leads/page.tsx` lines **253-280**: search input and `select` controls use `py-2` without explicit min-height.  
**Severity:** Medium  
**Impact:** Common mobile touch guidelines often recommend ~44x44px targets. At `h-10` (40px) and icon-button `p-2` configurations, several interactive elements may be small enough to increase mis-taps, especially on smaller screens or with thicker fingers.  
**Recommended solution:** Standardize minimum touch target sizing:
1. Set base `Input`/`Button` heights to `h-11` or `min-h-[44px]`.
2. Ensure icon-only buttons meet minimum width/height (e.g., `h-11 w-11`).
3. For page-level `input`/`select` usages (like leads search filters), apply consistent sizing classes or reuse the shared UI components.

### 6) Admin dashboard stats grids use non-responsive column counts
**File:** `app/admin/dashboard/page.tsx`  
**Location:**
- `app/admin/dashboard/page.tsx` lines **123-146**: stats grid uses `grid grid-cols-4 ...` with no responsive override.  
- `app/admin/dashboard/page.tsx` lines **148-168**: additional stats grid uses `grid grid-cols-3 ...` with no responsive override.  
**Severity:** Medium  
**Impact:** On narrow devices, fixed column counts force cards into very small widths, harming readability and tapability.  
**Recommended solution:** Add responsive grid modifiers (e.g., `grid-cols-1 md:grid-cols-4` and `grid-cols-1 md:grid-cols-3`) so cards reflow into a single column (or 2 columns) at smaller widths.

### 7) Conversation list truncation can hide important context on small screens
**File:** `app/(dashboard)/conversations/page.tsx`  
**Location:** `app/(dashboard)/conversations/page.tsx` lines **333-338**: conversation row uses `truncate` on email and `line-clamp-2` on summary.  
**Severity:** Low  
**Impact:** On mobile, truncated email/summary reduces glanceability and may hide critical identifying information, increasing reliance on opening the detail page.  
**Recommended solution:** Reassess truncation strategy:
1. Increase clamp allowance at smaller breakpoints or provide an accessible expanded view.
2. Ensure truncation applies only to non-critical text or adds supporting UI (e.g., tooltip on hover/focus or a secondary visible line).

## Task Consolidation
1. **T1 (Viewport):** Add root viewport configuration to prevent mobile scaling/layout issues.  
2. **T2 (Mobile Dashboard Nav):** Make dashboard sidebar responsive via a collapsed drawer/sheet on small screens.  
3. **T3 (Admin Login Fit):** Replace `w-96` fixed admin login card width with responsive `w-full max-w-*`.  
4. **T4 (Small-screen Spacing):** Reduce fixed landing padding (`p-24`) and add responsive padding ranges.  
5. **T5 (Touch Targets):** Standardize touch target sizes for inputs/buttons and icon buttons; unify inconsistent filter control sizing.  
6. **T6 (Admin Grid Responsiveness):** Add responsive column modifiers to admin dashboard stat grids.  
7. **T7 (Truncation UX):** Adjust truncation/clamping to preserve critical context on mobile.

## Recommendations
1. Prioritize making the authenticated dashboard usable at 320–480px widths (sidebar pattern + overflow checks).
2. Add explicit viewport configuration at the root so Tailwind breakpoints map to expected physical screen sizes.
3. Remove remaining fixed-width/fixed-padding patterns where they affect narrow screens (admin login card; landing padding).
4. Standardize interactive control heights to reduce mis-taps (inputs, selects, icon buttons).
5. Ensure admin and dashboard content grids reflow at `sm`/`md`, not only at larger breakpoints.

## Phased Fix Plan
### Phase 1 (Immediate: address Critical/High)
1. T1: Root viewport configuration in `app/layout.tsx`.
2. T2: Responsive dashboard navigation (sidebar collapse + mobile drawer).
3. T3: Admin login responsive width (`w-96` -> `w-full max-w-*`).

### Phase 2 (Short-term: address Medium)
1. T4: Landing padding responsiveness (`p-24` adjustments).
2. T5: Touch target standardization (min heights for inputs/buttons and icon controls; align page-level filters).
3. T6: Admin dashboard stats grid responsive column counts.

### Phase 3 (Later: address Low / polish)
1. T7: Review truncation/clamping behavior in conversation lists and adjust for mobile readability.

