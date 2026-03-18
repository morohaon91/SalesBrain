# Frontend Authentication Implementation - Complete

**Status**: ✅ COMPLETE
**Date**: March 17, 2026
**Reference**: 04-FRONTEND-ARCHITECTURE.md

---

## Overview

Complete frontend authentication system with 5 production-ready files:

1. **lib/api/client.ts** - Axios-based API client with auto-token and 401 refresh
2. **lib/hooks/useAuth.ts** - Auth context, provider, and useAuth hook
3. **app/(auth)/layout.tsx** - Centered auth layout (login/register)
4. **app/(auth)/login/page.tsx** - Login form with React Hook Form + Zod
5. **app/(auth)/register/page.tsx** - Register form with validation

All components use shadcn/ui, Tailwind CSS, and follow Next.js 14 best practices.

---

## File 1: lib/api/client.ts

**Purpose**: Centralized API client with automatic token management and 401 handling

### Features

✅ **Automatic Token Management**
```typescript
// Auto-includes JWT from localStorage on every request
// Authorization: Bearer <token>
```

✅ **Automatic Token Refresh (401 Handler)**
```typescript
// When 401 received:
// 1. POST to /api/v1/auth/refresh with credentials (cookie)
// 2. Get new token
// 3. Store in localStorage
// 4. Retry original request
```

✅ **Request Queue for Concurrent 401s**
```typescript
// If 2+ requests fail with 401 simultaneously:
// 1. First refresh attempt proceeds
// 2. Other requests wait in queue
// 3. All retry when refresh succeeds
// 4. Prevents multiple refresh calls
```

✅ **Organized API Endpoints**
```typescript
// Grouped by resource
api.auth.login()      // POST /auth/login
api.auth.register()   // POST /auth/register
api.auth.logout()     // POST /auth/logout
api.auth.refresh()    // POST /auth/refresh

api.user.getProfile() // GET /user/profile

api.conversations.list()
api.conversations.get(id)
api.conversations.review(id, data)

api.simulations.start()
api.simulations.get(id)
api.simulations.sendMessage(id, data)
api.simulations.complete(id)

api.leads.list()
api.leads.get(id)
api.leads.update(id, data)

api.analytics.getOverview(params)
api.analytics.getTrends(params)

api.tenant.get()
api.tenant.updateSettings(data)
```

### Implementation Details

**Axios Interceptors**:
```typescript
// Request interceptor: Add token
// Response interceptor: Handle 401 + refresh
// Includes request queue for concurrent failures
```

**Token Storage**:
```typescript
// Access token: localStorage (JWT)
// Refresh token: HTTP-only cookie (auto-managed)
```

**Error Handling**:
```typescript
// 401: Attempt refresh
// Refresh fails: Clear token, redirect to /login
// Other errors: Return to caller
```

### Usage

```typescript
import { api } from '@/lib/api/client';

// Login
const response = await api.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Token auto-stored, ready to use

// API calls automatically include token
const conversations = await api.conversations.list();

// 401 auto-refreshes token and retries
// No manual handling needed
```

---

## File 2: lib/hooks/useAuth.ts

**Purpose**: Authentication context and hooks for managing user state

### Types

**User Interface**:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
  createdAt: string;
}
```

**RegisterData Interface**:
```typescript
interface RegisterData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  industry?: string;
}
```

**AuthContext Interface**:
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  clearError: () => void;
}
```

### AuthProvider Component

**Initialization**:
```typescript
// On mount: Fetch user profile to check for existing session
// Sets user or null
// Sets isLoading to false when complete
```

**login(email, password)**:
```typescript
// 1. Call api.auth.login()
// 2. Fetch user profile
// 3. Set user state
// 4. Redirect to /dashboard
// 5. Catch and set error state
```

**logout()**:
```typescript
// 1. Call api.auth.logout()
// 2. Clear user state
// 3. Redirect to /login
```

**register(data)**:
```typescript
// 1. Call api.auth.register() with full data
// 2. Fetch user profile
// 3. Set user state
// 4. Redirect to /dashboard
```

**clearError()**:
```typescript
// Clear error message (e.g., after user acknowledges)
```

### useAuth Hook

**Usage**:
```typescript
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function MyComponent() {
  const { user, isLoading, error, login, logout, register, clearError } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;

  return (
    <div>
      <p>Welcome {user.name}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Setup in Root Layout

```typescript
// app/layout.tsx
import { AuthProvider } from '@/lib/hooks/useAuth';
import { QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## File 3: app/(auth)/layout.tsx

**Purpose**: Clean, centered layout for authentication pages

### Features

✅ **Gradient Background**
```
from-blue-50 to-indigo-100
Creates professional, welcoming appearance
```

✅ **Centered Content Container**
```
max-w-md (medium: 448px)
Optimized for form display
Responsive: px-4 on mobile
```

✅ **Visual Hierarchy**
```
1. Brand/Logo section
2. White card with form
3. Footer with marketing copy
```

### Structure

```
min-h-screen (full viewport height)
  |
  +-- Gradient Background
  |
  +-- Centered Container
       |
       +-- Brand Section
       |   - Logo/App Name
       |   - Tagline
       |
       +-- White Card
       |   - Form Content
       |
       +-- Footer Text
           - Marketing copy
```

### Styling

```css
/* Gradient background */
bg-gradient-to-br from-blue-50 to-indigo-100

/* Content card */
bg-white rounded-lg shadow-lg p-8

/* Full height on small screens */
min-h-screen flex items-center justify-center
```

---

## File 4: app/(auth)/login/page.tsx

**Purpose**: User login form with validation and error handling

### Form Fields

**Email**:
- Type: email
- Validation: Valid email format
- Error: Shows if invalid

**Password**:
- Type: password
- Validation: Min 1 character (required)
- Error: Shows if empty

**Checkboxes**:
- Remember me (optional)
- Can submit with/without

**Links**:
- Forgot password (functional link)
- Sign up (routing to /register)

### Features

✅ **React Hook Form Integration**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

✅ **Zod Validation Schema**
```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

✅ **Error Display**
```
- Under each field
- Red text color
- Clear error message
```

✅ **Loading State**
```
- Button disabled during submission
- Spinner animation
- "Signing in..." text
- Input fields disabled
```

✅ **Error Alert**
```
- Top of form
- Red background
- Icon + message
- Shows auth errors
```

✅ **Demo Credentials**
```
Blue info box with:
- demo@example.com
- Demo123!
```

### Form Validation Schema

```typescript
z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})
```

### Submission Flow

```
1. User enters email/password
2. Form validates with Zod
3. If invalid, show field errors
4. If valid, disable inputs, show loading
5. Call auth.login(email, password)
6. On success: Redirect to /dashboard
7. On error: Show error alert, enable inputs
8. User can clear error and retry
```

### UI Components

- **Button** (shadcn/ui)
- **Input** (shadcn/ui)
- **Icons**: AlertCircle, Loader2 (lucide-react)

---

## File 5: app/(auth)/register/page.tsx

**Purpose**: New user registration with comprehensive validation

### Form Fields

**Name**:
- Type: text
- Validation: 2-100 chars
- Error: Shows if invalid

**Email**:
- Type: email
- Validation: Valid email format
- Error: Shows if invalid

**Business Name**:
- Type: text
- Validation: 2-200 chars
- Error: Shows if invalid

**Industry** (optional):
- Type: text
- Placeholder: e.g., Business Consulting
- No validation

**Password**:
- Type: password
- Validation:
  - Min 8 characters
  - Min 1 uppercase letter
  - Min 1 number
- Strength indicator shown
- Error: Shows specific requirement not met

**Confirm Password**:
- Type: password
- Validation: Must match password
- Error: "Passwords don't match"

**Terms & Conditions**:
- Type: checkbox
- Validation: Must be checked
- Links to /terms and /privacy
- Error: "You must agree..."

### Features

✅ **Password Strength Indicator**
```
Visual bars: Weak → Fair → Good → Strong
Updates as user types
Shows requirements:
- 8+ characters
- Uppercase letter
- Number
- Special character
```

✅ **Zod Validation Schema**
```typescript
z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  businessName: z.string().min(2).max(200),
  industry: z.string().optional(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, "uppercase")
    .regex(/[0-9]/, "number"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true),
})
.refine(data => data.password === data.confirmPassword)
```

✅ **Loading State**
```
- Disable all inputs
- Show spinner + "Creating account..."
- Prevent multiple submissions
```

✅ **Error Alert**
```
- Top of form
- Red background
- Shows auth errors
```

✅ **Benefits Section**
```
Green info box showing:
- 14-day free trial
- Unlimited simulations
- AI-powered qualification
- 24/7 support
```

### Submission Flow

```
1. User enters all fields
2. Form validates with Zod
3. If invalid: Show field errors
4. If valid: Disable inputs, show loading
5. Call auth.register(name, email, businessName, industry, password)
6. On success: Redirect to /dashboard
7. On error: Show error alert, enable inputs
8. User can fix and retry
```

### Password Requirements

- ✅ 8+ characters
- ✅ 1 uppercase letter (A-Z)
- ✅ 1 number (0-9)
- ❌ Passwords must match

---

## Integration with Root Layout

Add AuthProvider to root layout:

```typescript
// app/layout.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/hooks/useAuth';

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 }
    }
  }));

  return (
    <html>
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

---

## Protected Routes Pattern

Create protected layout for dashboard:

```typescript
// app/(dashboard)/layout.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## Error Handling

### Network Errors
```
- Caught and displayed in error alert
- User can retry
- Loading state prevents double-submission
```

### Validation Errors (401, 400, etc)
```
- API returns { success: false, error: { code, message } }
- Message displayed in alert
- User can fix and retry
```

### Session Expiry (401)
```
- API client detects 401
- Attempts refresh
- If refresh fails:
  - Clears localStorage
  - Redirects to /login
  - User must login again
```

---

## State Management Flow

```
User visits /login
  ↓
Browser has no token
  ↓
useAuth hook initializes
  ↓
Fetch /api/v1/user/profile fails (no token)
  ↓
User = null, isLoading = false
  ↓
Show login form
  ↓
User submits credentials
  ↓
api.auth.login() called
  ↓
Token received, stored in localStorage
  ↓
api.user.getProfile() called
  ↓
User profile set in context
  ↓
Redirect to /dashboard
  ↓
useAuth returns user object
  ↓
Dashboard rendered with user data
```

---

## Security Features

✅ **Token Storage**
- Access token: localStorage (XSS vulnerable but needed for mobile)
- Refresh token: HTTP-only cookie (CSRF protection)

✅ **Auto-Refresh**
- 401 triggers refresh endpoint
- New tokens obtained automatically
- User not redirected unless refresh fails

✅ **Password Validation**
- Min 8 chars (prevents weak passwords)
- Uppercase required (improves entropy)
- Number required (improves entropy)
- Client-side + server-side validation

✅ **CSRF Protection**
- Refresh token in HTTP-only cookie
- Same-site cookie policy
- withCredentials: true on requests

✅ **XSS Protection**
- Zod validates inputs
- React escapes all rendered content
- No dangerouslySetInnerHTML used

---

## TypeScript Types

All components are fully typed:

```typescript
// API client returns typed responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta: { timestamp: string; requestId: string };
}

// Auth hook provides typed context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  clearError: () => void;
}

// Form data types from Zod schemas
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
```

---

## Component Dependencies

```
app/layout.tsx (root)
  ├── QueryClientProvider
  └── AuthProvider
       ├── useAuth hook
       └── api.user.getProfile()

app/(auth)/layout.tsx
  ├── Auth pages layout
  └── Centered form container

app/(auth)/login/page.tsx
  ├── useAuth
  ├── useForm (React Hook Form)
  ├── zodResolver (Zod)
  ├── Button (shadcn/ui)
  ├── Input (shadcn/ui)
  └── Icons (lucide-react)

app/(auth)/register/page.tsx
  ├── useAuth
  ├── useForm (React Hook Form)
  ├── zodResolver (Zod)
  ├── Button (shadcn/ui)
  ├── Input (shadcn/ui)
  └── Icons (lucide-react)
```

---

## Styling

### Colors
```
Primary: Blue (blue-600)
Background: Light blue gradient (blue-50 to indigo-100)
Text: Dark gray (gray-900)
Borders: Light gray (gray-200)
Errors: Red (red-600)
Success: Green (green-600)
```

### Spacing
```
Form gap: 4 (1rem)
Container max-width: 448px
Padding: 8 (2rem)
```

### Responsive
```
Mobile: Full width with px-4
Desktop: Centered 448px card
```

---

## Testing

### Manual Testing Checklist

✅ **Login Flow**
```
1. Visit /login
2. Enter demo@example.com / Demo123!
3. Click Sign in
4. Should redirect to /dashboard
5. User should be in context
```

✅ **Register Flow**
```
1. Visit /register
2. Fill all fields
3. Password shows strength indicator
4. Click Create account
5. Should redirect to /dashboard
6. Verify in admin DB that user + tenant created
```

✅ **Error Handling**
```
1. Login with wrong password
2. See error alert
3. Email remains filled
4. Can retry
```

✅ **Token Refresh**
```
1. Login to dashboard
2. Wait 15 minutes (token expires)
3. Make API call
4. Should auto-refresh silently
5. Request succeeds
```

✅ **Session Expiry**
```
1. Login
2. Delete token from localStorage (dev tools)
3. Make API call
4. Should redirect to /login
```

---

## Deployment Notes

✅ **Environment Variables**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

✅ **CORS Configuration**
- API must allow credentials
- Frontend domain must be in CORS whitelist
- withCredentials: true enabled

✅ **Cookie Settings**
- Refresh token: HttpOnly, Secure (production), SameSite=Lax
- Must be set from same domain

✅ **SSL/TLS**
- Required for Secure cookie flag
- Configure before production

---

## Performance

✅ **Client Optimization**
- Lazy load form components
- Prevent unnecessary re-renders
- useCallback for handlers
- TanStack Query for server state

✅ **Network Optimization**
- Single API call for login (returns token)
- Additional call for profile (cached by TanStack)
- 401 interceptor queues concurrent requests

---

## File Summary

| File | Lines | Purpose | Components |
|------|-------|---------|-----------|
| lib/api/client.ts | 280+ | API client with auto-refresh | Axios, interceptors |
| lib/hooks/useAuth.ts | 200+ | Auth context & hook | Context, Provider |
| app/(auth)/layout.tsx | 45 | Auth layout | Gradient, centered |
| app/(auth)/login/page.tsx | 190 | Login form | RHF, Zod, validation |
| app/(auth)/register/page.tsx | 300+ | Register form | RHF, Zod, strength meter |

**Total**: 1,000+ lines of production-ready frontend code

---

**Status**: ✅ READY FOR TESTING

**Implementation Date**: March 17, 2026
**Reference Document**: 04-FRONTEND-ARCHITECTURE.md
**All Components**: TypeScript, shadcn/ui, React 18, Next.js 14
