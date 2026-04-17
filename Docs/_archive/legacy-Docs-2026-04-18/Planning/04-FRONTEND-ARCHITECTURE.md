# Frontend Architecture - Next.js 14 App

## Tech Stack

### Core Framework
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for component library
- **Radix UI** (primitives under shadcn)
- **Lucide React** for icons

### State Management
- **React Context** for global state (auth, tenant)
- **TanStack Query (React Query)** for server state
- **Zustand** for client-side state (optional, if needed)

### Forms & Validation
- **React Hook Form** for form management
- **Zod** for schema validation

### Real-time
- **Socket.io Client** for live updates
- **Server-Sent Events** (alternative for simpler use cases)

### Charts & Visualization
- **Recharts** for analytics dashboard
- **Chart.js** (alternative)

---

## Project Structure

```
/app                          # Next.js 14 App Router
  /(auth)                     # Auth routes group
    /login
      page.tsx
    /register
      page.tsx
    /forgot-password
      page.tsx
    layout.tsx                # Auth layout (centered, no nav)
  
  /(dashboard)               # Protected dashboard routes
    /dashboard
      page.tsx               # Main dashboard/overview
    /conversations
      page.tsx               # Conversations list
      /[id]
        page.tsx            # Conversation detail
    /leads
      page.tsx              # Leads list
      /[id]
        page.tsx            # Lead detail
    /simulations
      page.tsx              # Simulations list
      /new
        page.tsx            # Start new simulation
      /[id]
        page.tsx            # Simulation in progress
    /profile
      page.tsx              # Business profile view/edit
    /analytics
      page.tsx              # Analytics dashboard
    /settings
      page.tsx              # Account settings
      /widget
        page.tsx            # Widget configuration
      /subscription
        page.tsx            # Subscription management
    layout.tsx              # Dashboard layout (sidebar, header)
  
  /widget                    # Public widget route
    /[widgetApiKey]
      page.tsx              # Embeddable chat widget
  
  /api                       # API routes
    /v1
      /auth
        /login
          route.ts
        /register
          route.ts
        /refresh
          route.ts
      /conversations
        route.ts            # GET, POST
        /[id]
          route.ts          # GET, PUT, DELETE
      /simulations
        route.ts
        /[id]
          /message
            route.ts
      # ... other API routes
  
  layout.tsx                # Root layout
  page.tsx                  # Landing page (redirect to dashboard or login)

/components                 # Reusable components
  /ui                       # shadcn/ui components
    button.tsx
    card.tsx
    dialog.tsx
    input.tsx
    # ... other primitives
  
  /auth
    login-form.tsx
    register-form.tsx
  
  /dashboard
    sidebar.tsx
    header.tsx
    stats-card.tsx
  
  /conversations
    conversation-list.tsx
    conversation-item.tsx
    message-bubble.tsx
    conversation-filters.tsx
  
  /simulations
    simulation-scenario-selector.tsx
    simulation-chat.tsx
    simulation-summary.tsx
  
  /leads
    lead-list.tsx
    lead-card.tsx
    lead-detail-panel.tsx
  
  /analytics
    overview-stats.tsx
    conversation-chart.tsx
    lead-funnel.tsx
  
  /widget
    chat-widget.tsx
    widget-config-preview.tsx
  
  /shared
    loading-spinner.tsx
    error-boundary.tsx
    empty-state.tsx
    pagination.tsx

/lib                        # Utility libraries
  /api
    client.ts              # API client wrapper
    endpoints.ts           # API endpoint definitions
  /auth
    session.ts             # Session management
    middleware.ts          # Auth middleware
  /hooks
    useAuth.ts
    useConversations.ts
    useSimulations.ts
    useLeads.ts
    useRealtime.ts
  /utils
    format.ts              # Date, number formatting
    validation.ts          # Validation helpers
    constants.ts           # App constants
  /types
    api.ts                 # API response types
    models.ts              # Data model types

/styles
  globals.css              # Global styles, Tailwind imports

/public
  /widget
    embed.js               # Widget embed script
  /images
    logo.svg
  favicon.ico

.env.local                 # Environment variables
next.config.js
tailwind.config.js
tsconfig.json
package.json
```

---

## Component Architecture

### Design System Foundation

#### Colors (Tailwind Config)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
};
```

#### Typography
```css
/* globals.css */
.text-display {
  @apply text-4xl font-bold tracking-tight;
}

.text-heading-1 {
  @apply text-3xl font-semibold;
}

.text-heading-2 {
  @apply text-2xl font-semibold;
}

.text-heading-3 {
  @apply text-xl font-semibold;
}

.text-body {
  @apply text-base;
}

.text-small {
  @apply text-sm;
}

.text-tiny {
  @apply text-xs;
}
```

---

## Key Pages & Components

### 1. Dashboard Layout

```tsx
// app/(dashboard)/layout.tsx
'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useAuth } from '@/lib/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### 2. Sidebar Component

```tsx
// components/dashboard/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BrainCircuit,
  BarChart3,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Simulations', href: '/simulations', icon: BrainCircuit },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Your Business Brain
        </h1>
      </div>
      
      <nav className="px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

### 3. Dashboard Overview Page

```tsx
// app/(dashboard)/dashboard/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ConversationChart } from '@/components/analytics/conversation-chart';
import { RecentLeads } from '@/components/leads/recent-leads';
import { MessageSquare, Users, TrendingUp, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.analytics.getOverview({ period: 'week' }),
  });
  
  const { data: recentLeads } = useQuery({
    queryKey: ['leads', 'recent'],
    queryFn: () => api.leads.list({ limit: 5, sortBy: 'createdAt' }),
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of your lead qualification activity
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Conversations"
          value={analytics?.totalConversations || 0}
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Qualified Leads"
          value={analytics?.qualifiedLeads || 0}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Avg. Lead Score"
          value={analytics?.averageScore || 0}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Needs Review"
          value={analytics?.uncertainInteractions || 0}
          icon={AlertCircle}
          variant="warning"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversationChart period="7d" />
        <RecentLeads leads={recentLeads?.data || []} />
      </div>
    </div>
  );
}
```

---

### 4. Simulation Chat Interface

```tsx
// components/simulations/simulation-chat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from '@/components/conversations/message-bubble';
import { Loader2, Send } from 'lucide-react';

interface Props {
  simulationId: string;
}

export function SimulationChat({ simulationId }: Props) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: simulation } = useQuery({
    queryKey: ['simulations', simulationId],
    queryFn: () => api.simulations.get(simulationId),
  });
  
  const sendMessage = useMutation({
    mutationFn: (content: string) =>
      api.simulations.sendMessage(simulationId, { content }),
    onSuccess: () => {
      setMessage('');
      scrollToBottom();
    },
  });
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [simulation?.messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessage.isPending) {
      sendMessage.mutate(message);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Scenario Info */}
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <h3 className="font-semibold text-blue-900">
          Scenario: {simulation?.scenarioType.replace('_', ' ')}
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          {simulation?.aiPersona.clientType} - {simulation?.aiPersona.personality}
        </p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {simulation?.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.createdAt}
          />
        ))}
        
        {sendMessage.isPending && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your response..."
            className="flex-1"
            rows={3}
            disabled={sendMessage.isPending}
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessage.isPending}
            className="self-end"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### 5. Chat Widget (Embeddable)

```tsx
// app/widget/[widgetApiKey]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api/widget-client'; // Separate client for widget
import { ChatInterface } from '@/components/widget/chat-interface';
import { X, MessageCircle } from 'lucide-react';

interface Props {
  params: { widgetApiKey: string };
}

export default function WidgetPage({ params }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  
  useEffect(() => {
    // Start conversation when widget opens
    if (isOpen && !conversation) {
      api.conversations
        .start(params.widgetApiKey, {
          sessionId: generateSessionId(),
          metadata: {
            page: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          },
        })
        .then(setConversation);
    }
  }, [isOpen]);
  
  return (
    <>
      {/* Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 bg-primary-600 text-white rounded-full p-4 shadow-lg hover:bg-primary-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      
      {/* Widget Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{conversation?.aiName}</h3>
              {conversation?.showAiBadge && (
                <p className="text-xs opacity-90">AI Assistant</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-700 rounded p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Interface */}
          {conversation && (
            <ChatInterface
              conversationId={conversation.id}
              widgetApiKey={params.widgetApiKey}
              greeting={conversation.greeting}
            />
          )}
        </div>
      )}
    </>
  );
}
```

---

## State Management

### Auth Context

```tsx
// lib/hooks/useAuth.ts
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
}

interface AuthContext {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Check for existing session on mount
    api.auth
      .getProfile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);
  
  const login = async (email: string, password: string) => {
    const response = await api.auth.login({ email, password });
    setUser(response.data);
    router.push('/dashboard');
  };
  
  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    router.push('/login');
  };
  
  const register = async (data: RegisterData) => {
    const response = await api.auth.register(data);
    setUser(response.data);
    router.push('/dashboard');
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

---

### TanStack Query Setup

```tsx
// app/layout.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );
  
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

## API Client Wrapper

```typescript
// lib/api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  withCredentials: true, // For cookies
});

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await axios.post('/api/v1/auth/refresh');
        // Retry original request
        return client(error.config);
      } catch {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (data) => client.post('/auth/login', data),
    register: (data) => client.post('/auth/register', data),
    logout: () => client.post('/auth/logout'),
    getProfile: () => client.get('/user/profile'),
  },
  conversations: {
    list: (params) => client.get('/conversations', { params }),
    get: (id) => client.get(`/conversations/${id}`),
    review: (id, data) => client.put(`/conversations/${id}/review`, data),
  },
  simulations: {
    start: (data) => client.post('/simulations/start', data),
    get: (id) => client.get(`/simulations/${id}`),
    sendMessage: (id, data) => client.post(`/simulations/${id}/message`, data),
    complete: (id) => client.post(`/simulations/${id}/complete`),
  },
  leads: {
    list: (params) => client.get('/leads', { params }),
    get: (id) => client.get(`/leads/${id}`),
    update: (id, data) => client.put(`/leads/${id}`, data),
  },
  analytics: {
    getOverview: (params) => client.get('/analytics/overview', { params }),
    getTrends: (params) => client.get('/analytics/trends', { params }),
  },
  tenant: {
    get: () => client.get('/tenant'),
    updateSettings: (data) => client.put('/tenant/settings', data),
  },
};
```

---

## Real-time Updates

```typescript
// lib/hooks/useRealtime.ts
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

export function useRealtime(tenantId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL!, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });
    
    // Listen for new conversations
    socket.on('conversation.started', (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Show notification
      showNotification('New conversation started');
    });
    
    // Listen for qualified leads
    socket.on('lead.qualified', (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      // Show high-priority notification
      showNotification(`New qualified lead: Score ${data.score}`, 'success');
    });
    
    return () => {
      socket.disconnect();
    };
  }, [tenantId, queryClient]);
}
```

---

**Next Steps:**
1. Initialize Next.js 14 project
2. Install dependencies (see package.json below)
3. Set up Tailwind and shadcn/ui
4. Implement authentication flow
5. Build core dashboard layout
6. Create reusable UI components
7. Implement each major page

---

**Document Status**: Complete - Ready for Implementation
**Last Updated**: March 2026
