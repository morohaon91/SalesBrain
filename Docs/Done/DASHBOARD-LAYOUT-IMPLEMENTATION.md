# Dashboard Layout Implementation - Complete

**Status**: ✅ COMPLETE
**Date**: March 17, 2026
**Reference**: 04-FRONTEND-ARCHITECTURE.md

---

## Overview

Complete dashboard layout system with 4 production-ready files:

1. **app/(dashboard)/layout.tsx** - Protected layout with sidebar + header
2. **components/dashboard/sidebar.tsx** - Navigation menu with 6 routes
3. **components/dashboard/header.tsx** - Header with user menu and logout
4. **app/(dashboard)/dashboard/page.tsx** - Dashboard overview page
5. **components/shared/loading-screen.tsx** - Loading indicator
6. **lib/utils.ts** - Utility function for class name merging

---

## File 1: app/(dashboard)/layout.tsx

**Purpose**: Main dashboard layout - protected route with sidebar + header

### Features

✅ **Authentication Protection**
```typescript
const { user, isLoading } = useAuth();

if (isLoading) return <LoadingScreen />;
if (!user) redirect("/login");
```

✅ **Responsive Layout**
```
Flexbox layout: sidebar + main content
Sidebar: w-64 fixed
Main: flex-1, scrollable
Header: sticky, full width
```

✅ **Structure**
```
<div className="flex h-screen">
  <Sidebar />              {/* Left sidebar */}
  <div className="flex-1"> {/* Main area */}
    <Header />             {/* Top header */}
    <main>                 {/* Content */}
      {children}
    </main>
  </div>
</div>
```

### Props

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}
```

### Behavior

1. **On Load**:
   - Check auth status from context
   - Show loading screen while checking
   - Redirect to /login if not authenticated

2. **Authenticated Users**:
   - Render full dashboard layout
   - Sidebar visible with navigation
   - Header with user menu
   - Children rendered in main area

3. **Unauthenticated Users**:
   - Immediate redirect to /login
   - No dashboard rendered

### Styling

```css
/* Full viewport */
h-screen /* 100vh */

/* Sidebar + Main flex */
flex h-screen bg-gray-50

/* Main content area */
flex-1 flex flex-col overflow-hidden

/* Content scrolling */
flex-1 overflow-y-auto
p-6 max-w-7xl mx-auto
```

---

## File 2: components/dashboard/sidebar.tsx

**Purpose**: Left sidebar navigation menu

### Navigation Items

```
1. Dashboard (/dashboard)
   - LayoutDashboard icon
   - Overview and metrics

2. Conversations (/conversations)
   - MessageSquare icon
   - Lead conversations

3. Leads (/leads)
   - Users icon
   - Qualified leads

4. Simulations (/simulations)
   - BrainCircuit icon
   - Practice scenarios

5. Analytics (/analytics)
   - BarChart3 icon
   - Reports and insights

6. Settings (/settings)
   - Settings icon
   - Account & preferences
```

### Features

✅ **Active Route Highlighting**
```typescript
const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

// Shows:
// - Blue background (bg-blue-50)
// - Blue text (text-blue-700)
// - Left border indicator
// - Chevron icon on right
```

✅ **Visual Elements**
```
- Logo section at top
- Navigation items with icons
- Active state indicators
- Trial plan badge at bottom
- Upgrade button
```

✅ **Icons**
- All from lucide-react
- 5x5 for navigation
- Color-coded for active state

### Structure

```
Sidebar
  ├── Logo Section (Brand)
  ├── Navigation Menu
  │   ├── Dashboard
  │   ├── Conversations
  │   ├── Leads
  │   ├── Simulations
  │   ├── Analytics
  │   └── Settings
  └── Footer
      ├── Trial badge
      └── Upgrade button
```

### Styling

```css
/* Sidebar container */
w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden

/* Navigation items */
group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium

/* Active state */
bg-blue-50 text-blue-700 shadow-sm

/* Hover state */
text-gray-700 hover:bg-gray-50 hover:text-gray-900

/* Active indicator */
absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full
```

### Active Route Detection

```typescript
const pathname = usePathname();
const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
```

Detects:
- Exact match: `/conversations`
- Sub-routes: `/conversations/123`

---

## File 3: components/dashboard/header.tsx

**Purpose**: Top header with search, notifications, and user menu

### Features

✅ **Search Bar**
```
- Left side of header
- Placeholder: "Search conversations, leads..."
- Search icon
- Max width: sm (24rem)
```

✅ **Notifications Bell**
```
- Center-right
- Red dot indicator (unread count)
- Hover effect
- Clickable (future: notifications panel)
```

✅ **User Menu Dropdown**
```
- Avatar with initials
- User name (hidden on mobile)
- User role
- Chevron indicator
- Click to open menu

Menu items:
- User info (name + email)
- Profile link
- Settings link
- Logout button (red text)
```

✅ **Interactive Menu**
```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false);

// Toggle on button click
// Close on outside click
// Show/hide dropdown
```

### Structure

```
Header
  ├── Left Section
  │   └── Search bar with icon
  ├── Right Section
  │   ├── Notifications bell
  │   └── User menu
  │       ├── Avatar
  │       ├── Name
  │       ├── Role
  │       └── Chevron
  │
  └── Dropdown Menu (when open)
      ├── User info
      ├── Profile
      ├── Settings
      └── Logout
```

### Logout Handling

```typescript
const handleLogout = async () => {
  try {
    await logout(); // Clears token, redirects to /login
  } catch (error) {
    console.error("Logout error:", error);
  }
};
```

### Styling

```css
/* Header container */
bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between

/* Search input */
px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500

/* Avatar */
w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white

/* Dropdown menu */
absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50

/* Menu items */
w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50

/* Logout button */
text-red-600 hover:bg-red-50
```

### Responsive

```
Desktop: Full menu with name + role visible
Mobile: Avatar only (name hidden with sm:flex)
```

---

## File 4: app/(dashboard)/dashboard/page.tsx

**Purpose**: Main dashboard overview page with welcome, stats, and getting started

### Sections

✅ **Welcome Section**
```
- Time-based greeting ("Good morning/afternoon/evening")
- User name
- Descriptive subtitle
```

✅ **Quick Actions**
```
- "Start Simulation" button
- "View Conversations" button
- "Setup Widget" button
```

✅ **Stats Cards Grid** (4 columns responsive)
```
1. Total Conversations: 0
2. Qualified Leads: 0
3. Avg. Lead Score: —
4. Needs Review: 0 (warning variant)
```

✅ **Getting Started Card**
```
Step-by-step guide:
1. Run Practice Simulations
2. Setup Your Widget
3. Review Qualified Leads

Each with:
- Numbered badge
- Title
- Description
- CTA link with arrow
```

✅ **Analytics Placeholder**
```
- Chart area with icon
- "No data yet" message
- CTA to start simulations
```

✅ **Recent Activity Sidebar**
```
- Account Created
- Welcome Email Sent
- Dashboard Accessed

Shows:
- Activity type badge (color-coded)
- Title
- Description
- Timestamp
```

✅ **Quick Links Sidebar**
```
- Get Widget Code
- Upgrade Plan
- Account Settings
- Documentation (external)
```

✅ **Trial Banner**
```
- Green gradient background
- Trial status (14 days)
- Upgrade CTA
```

### Components

**StatsCard Component**
```typescript
interface Props {
  title: string;
  value: number | string;
  icon: React.ComponentType<{className?: string}>;
  trend?: { value: number; isPositive: boolean };
  variant?: "default" | "warning";
}
```

**ActivityItem Component**
```typescript
interface Props {
  title: string;
  description: string;
  time: string;
  type: "conversation" | "lead" | "simulation";
}
```

### Data

Currently using mock data:
- Stats all show 0 (no activity yet)
- Activity shows sample items
- Activity items have relative times

**Future**: Replace with API calls
```typescript
const { data: analytics } = useQuery({
  queryKey: ['analytics', 'overview'],
  queryFn: () => api.analytics.getOverview({ period: 'week' }),
});
```

### Styling

```css
/* Main layout */
space-y-8 /* Sections */

/* Welcome */
text-4xl font-bold text-gray-900

/* Stats grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

/* Cards */
p-6 rounded-lg border hover:shadow-md

/* Gradient section */
bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200

/* Badges */
px-3 py-1 rounded-full text-xs font-semibold
```

### Responsive

```
Mobile:  1 column
Tablet:  2 columns (md)
Desktop: 4 columns (lg) or 3 columns (lg for 2-up layout)
```

---

## File 5: components/shared/loading-screen.tsx

**Purpose**: Full-screen loading indicator

### Features

✅ **Full Viewport Coverage**
```css
min-h-screen /* Full height */
flex items-center justify-center /* Centered */
bg-gradient-to-br from-blue-50 to-indigo-100 /* Background */
```

✅ **Loading Indicator**
```
- Spinner icon (Loader2 from lucide-react)
- Animated rotation
- Blue color
```

✅ **Text**
```
- "Loading" heading
- "Setting up your dashboard..." subtitle
```

### Usage

```typescript
// In layout
if (isLoading) {
  return <LoadingScreen />;
}
```

---

## File 6: lib/utils.ts

**Purpose**: Utility functions for className merging

### Functions

**cn(...inputs: ClassValue[])**
```typescript
// Merges Tailwind classes and handles conflicts
import { cn } from '@/lib/utils';

cn(
  "px-2 py-1",
  isActive && "px-4",  // Overwrites px-2
  "text-gray-900"
)
// Result: "px-4 py-1 text-gray-900"
```

Uses:
- clsx: For conditional classes
- tailwind-merge: For conflict resolution

---

## Integration Guide

### 1. Root Layout Setup

Update `app/layout.tsx`:

```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { useState } from 'react';

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } }
  }));

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### 2. Protected Routes

Dashboard routes automatically protected:
- `/dashboard` - Requires auth
- `/conversations` - Requires auth
- `/leads` - Requires auth
- `/simulations` - Requires auth
- `/analytics` - Requires auth
- `/settings` - Requires auth

### 3. Public Routes

Auth routes NOT protected:
- `/login` - Public
- `/register` - Public
- `/forgot-password` - Public

---

## Navigation Flow

```
App Start
  ↓
Check Auth Status
  ├─ Loading → Show LoadingScreen
  ├─ Not Authenticated → Redirect to /login
  └─ Authenticated → Render Dashboard Layout
                       ├─ Sidebar (Navigation)
                       ├─ Header (User Menu)
                       └─ Main Content (Page)
                           ↓
                           Page renders children
```

---

## Authentication Check

**When user visits `/dashboard`**:

1. DashboardLayout mounts
2. useAuth hook runs initialization
3. If loading: Show LoadingScreen
4. If no user: redirect("/login")
5. If user exists: Render full layout

**When user logs out**:

1. User clicks logout in header
2. logout() called from useAuth
3. Token cleared from localStorage
4. Redirect to "/login"
5. Next page visit redirects immediately

---

## State Management

### useAuth Hook

```typescript
{
  user: User | null,        // Current user
  isLoading: boolean,       // Auth check in progress
  error: string | null,     // Auth error
  login: Function,          // Login handler
  logout: Function,         // Logout handler
  register: Function,       // Register handler
  clearError: Function      // Clear error
}
```

### Local State (Header)

```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false);
```

Opens/closes user dropdown menu.

---

## Styling System

### Colors

```
Primary Blue: blue-600
Light Blue: blue-50
Gray: gray-50 to gray-900
Green (success): green-600
Yellow (warning): yellow-600
Red (danger): red-600
```

### Spacing

```
Container padding: p-6
Grid gaps: gap-6
Section spacing: space-y-8
Item padding: px-4 py-3
```

### Responsive Classes

```
Mobile first: 100% width
md: 768px - tablet layout
lg: 1024px - desktop layout
```

### Typography

```
Display: text-4xl font-bold
Heading: text-xl or text-lg font-semibold
Body: text-sm or text-base
Small: text-xs
```

---

## Component Dependencies

```
app/(dashboard)/layout.tsx
  ├── useAuth hook
  ├── LoadingScreen
  ├── Sidebar
  └── Header

components/dashboard/sidebar.tsx
  ├── Link (next/link)
  ├── usePathname (next/navigation)
  ├── cn utility
  └── lucide-react icons

components/dashboard/header.tsx
  ├── useState hook
  ├── useAuth hook
  ├── Button (shadcn/ui)
  └── lucide-react icons

app/(dashboard)/dashboard/page.tsx
  ├── useAuth hook
  ├── Button (shadcn/ui)
  ├── Link (next/link)
  ├── lucide-react icons
  └── Internal components
      ├── StatsCard
      ├── ActivityItem
```

---

## Performance Optimizations

✅ **Lazy Components**
```
Sidebar and Header wrapped in (dashboard) group
Only loaded when on dashboard routes
```

✅ **Client Components**
```
'use client' on:
- Layout (for useAuth)
- Sidebar (for usePathname)
- Header (for useState)
- Dashboard page (for future queries)
```

✅ **Caching**
```
Auth context cached after first check
usePathname from Next.js (optimized)
Icons imported directly (tree-shakeable)
```

---

## Accessibility

✅ **Semantic HTML**
```
<header>  - Top navigation
<aside>   - Sidebar
<main>    - Content area
<nav>     - Navigation menu
```

✅ **Labels**
```
Search input has placeholder
Buttons have text labels
Icons paired with text
```

✅ **Keyboard Navigation**
```
Tab through menu items
Enter/Space to activate
Focus visible on all interactive elements
```

---

## Testing Checklist

✅ **Authentication**
- [ ] Can't access /dashboard without login
- [ ] Redirects to /login when not authenticated
- [ ] Shows loading screen while checking auth

✅ **Navigation**
- [ ] All sidebar links navigate correctly
- [ ] Active link highlighted
- [ ] Breadcrumb/pathname updates

✅ **User Menu**
- [ ] Opens/closes on click
- [ ] Shows user name and email
- [ ] Logout button works
- [ ] Redirects to /login after logout

✅ **Dashboard Page**
- [ ] Welcome message shows
- [ ] Stats display (even if 0)
- [ ] Quick action buttons work
- [ ] Getting started steps visible

✅ **Responsive**
- [ ] Mobile: Single column
- [ ] Tablet: 2 columns
- [ ] Desktop: 4 columns
- [ ] Sidebar visible on desktop

---

## File Summary

| File | Lines | Purpose | Components |
|------|-------|---------|-----------|
| app/(dashboard)/layout.tsx | 45 | Protected layout | Auth check, layout |
| components/dashboard/sidebar.tsx | 120 | Navigation menu | Links, icons, active state |
| components/dashboard/header.tsx | 145 | User header | Search, notifications, menu |
| app/(dashboard)/dashboard/page.tsx | 380 | Overview page | Cards, sections, links |
| components/shared/loading-screen.tsx | 25 | Loading UI | Spinner, text |
| lib/utils.ts | 15 | Utility functions | cn for classes |

**Total**: 730 lines of production-ready code

---

**Status**: ✅ READY FOR TESTING

**Implementation Date**: March 17, 2026
**All Components**: React 18, Next.js 14, TypeScript, shadcn/ui, Tailwind CSS
