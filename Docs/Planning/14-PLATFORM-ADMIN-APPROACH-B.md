# Platform Admin - Approach B (Separate Table)

## **Complete Implementation Guide**

This approach creates a completely separate `PlatformAdmin` table, isolated from tenant users.

---

## **Step 1: Update Prisma Schema**

Add these new models to `prisma/schema.prisma`:

```prisma
// ============================================
// PLATFORM ADMIN (Separate from Tenant Users)
// ============================================

model PlatformAdmin {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Authentication
  email             String   @unique
  password          String   // bcrypt hashed
  emailVerified     Boolean  @default(false)
  
  // Profile
  name              String
  
  // Role & Permissions
  role              PlatformAdminRole @default(ADMIN)
  permissions       Json     @db.JsonB
  // Example permissions:
  // {
  //   canViewAllTenants: true,
  //   canManageSubscriptions: true,
  //   canImpersonate: true,
  //   canBanTenants: true,
  //   canViewAnalytics: true,
  //   canManageBilling: true,
  //   canAccessSupport: true
  // }
  
  // Status
  isActive          Boolean  @default(true)
  lastLoginAt       DateTime?
  
  // Relations
  auditLogs         PlatformAuditLog[]
  
  @@index([email])
  @@index([isActive])
}

enum PlatformAdminRole {
  SUPER_ADMIN    // Full access to everything
  ADMIN          // Standard admin access
  SUPPORT        // Customer support only
  BILLING        // Billing and subscriptions only
  DEVELOPER      // Technical access, analytics
  VIEWER         // Read-only access
}

model PlatformAuditLog {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  
  // Who performed the action
  adminId           String
  admin             PlatformAdmin @relation(fields: [adminId], references: [id], onDelete: Cascade)
  
  // What action
  action            PlatformAdminAction
  description       String?  @db.Text
  
  // What was affected
  targetType        String?  // 'tenant', 'user', 'subscription', 'system'
  targetId          String?
  
  // Context
  metadata          Json?    @db.JsonB
  // {
  //   tenantName: "Acme Corp",
  //   oldValue: {...},
  //   newValue: {...},
  //   reason: "Customer request",
  //   ipAddress: "1.2.3.4"
  // }
  
  ipAddress         String?
  userAgent         String?  @db.Text
  
  @@index([adminId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([createdAt])
}

enum PlatformAdminAction {
  // Tenant Management
  VIEWED_TENANT
  VIEWED_ALL_TENANTS
  SUSPENDED_TENANT
  ACTIVATED_TENANT
  DELETED_TENANT
  UPDATED_TENANT_SETTINGS
  
  // User Management
  IMPERSONATED_USER
  VIEWED_USER
  RESET_USER_PASSWORD
  DELETED_USER
  
  // Subscription Management
  UPDATED_SUBSCRIPTION
  APPLIED_DISCOUNT
  REFUNDED_PAYMENT
  CANCELLED_SUBSCRIPTION
  
  // System
  VIEWED_ANALYTICS
  EXPORTED_DATA
  UPDATED_PLATFORM_SETTINGS
  RAN_MIGRATION
  
  // Security
  LOGGED_IN
  LOGGED_OUT
  FAILED_LOGIN
  CHANGED_PASSWORD
}

// ============================================
// Platform-Wide Settings (Optional)
// ============================================

model PlatformSettings {
  id                String   @id @default(uuid())
  updatedAt         DateTime @updatedAt
  updatedBy         String?  // PlatformAdmin ID
  
  // Feature Flags
  maintenanceMode   Boolean  @default(false)
  signupsEnabled    Boolean  @default(true)
  
  // Pricing
  defaultTrialDays  Int      @default(14)
  
  // AI Limits
  aiCostBudget      Float    @default(1000.00) // Monthly budget alert
  
  // Email
  supportEmail      String   @default("support@yourplatform.com")
  
  // Other settings as JSON
  settings          Json?    @db.JsonB
  
  @@index([updatedAt])
}
```

---

## **Step 2: Create Migration**

```bash
npx prisma migrate dev --name add_platform_admin_table

# This creates:
# - PlatformAdmin table
# - PlatformAuditLog table
# - PlatformSettings table
# - All enums
```

---

## **Step 3: Create Seed Script for Platform Admin**

```typescript
// prisma/seed-platform-admin.ts

import { PrismaClient, PlatformAdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating platform admin user...');
  
  const password = await bcrypt.hash('SuperSecurePassword123!', 10);
  
  const superAdmin = await prisma.platformAdmin.create({
    data: {
      email: 'admin@yourplatform.com',
      password,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
      permissions: {
        canViewAllTenants: true,
        canManageSubscriptions: true,
        canImpersonate: true,
        canBanTenants: true,
        canViewAnalytics: true,
        canManageBilling: true,
        canAccessSupport: true,
      },
    },
  });
  
  // Create initial audit log entry
  await prisma.platformAuditLog.create({
    data: {
      adminId: superAdmin.id,
      action: 'LOGGED_IN',
      description: 'Platform admin account created',
      metadata: {
        createdBy: 'seed script',
      },
    },
  });
  
  // Create platform settings
  await prisma.platformSettings.create({
    data: {
      maintenanceMode: false,
      signupsEnabled: true,
      defaultTrialDays: 14,
      aiCostBudget: 1000.00,
      supportEmail: 'support@yourplatform.com',
      updatedBy: superAdmin.id,
    },
  });
  
  console.log('✅ Platform Admin Created!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:', superAdmin.email);
  console.log('Password: SuperSecurePassword123!');
  console.log('Role:', superAdmin.role);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run it:
```bash
npx ts-node prisma/seed-platform-admin.ts
```

---

## **Step 4: Create Platform Admin Auth Logic**

```typescript
// lib/auth/platform-admin.ts

import { PrismaClient } from '@prisma/client';
import { verifyPassword, hashPassword } from './password';
import { sign, verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

interface PlatformAdminTokenPayload {
  adminId: string;
  email: string;
  role: string;
  type: 'platform_admin'; // Distinguish from regular user tokens
}

const PLATFORM_ADMIN_SECRET = process.env.JWT_PLATFORM_ADMIN_SECRET!;
const ACCESS_TOKEN_EXPIRY = '8h'; // Longer for admins

export async function loginPlatformAdmin(email: string, password: string) {
  // Find admin
  const admin = await prisma.platformAdmin.findUnique({
    where: { email },
  });
  
  if (!admin) {
    throw new Error('Invalid credentials');
  }
  
  if (!admin.isActive) {
    throw new Error('Account is deactivated');
  }
  
  // Verify password
  const isValid = await verifyPassword(password, admin.password);
  
  if (!isValid) {
    // Log failed attempt
    await prisma.platformAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'FAILED_LOGIN',
        description: 'Invalid password attempt',
        metadata: { email },
      },
    });
    
    throw new Error('Invalid credentials');
  }
  
  // Update last login
  await prisma.platformAdmin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  
  // Log successful login
  await prisma.platformAuditLog.create({
    data: {
      adminId: admin.id,
      action: 'LOGGED_IN',
      description: 'Platform admin logged in',
    },
  });
  
  // Generate token
  const token = generatePlatformAdminToken(admin);
  
  return {
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    },
    token,
  };
}

export function generatePlatformAdminToken(admin: any): string {
  const payload: PlatformAdminTokenPayload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    type: 'platform_admin',
  };
  
  return sign(payload, PLATFORM_ADMIN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function verifyPlatformAdminToken(token: string): PlatformAdminTokenPayload {
  try {
    const payload = verify(token, PLATFORM_ADMIN_SECRET) as PlatformAdminTokenPayload;
    
    if (payload.type !== 'platform_admin') {
      throw new Error('Invalid token type');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Audit logging helper
export async function logPlatformAdminAction(
  adminId: string,
  action: string,
  metadata?: any
) {
  await prisma.platformAuditLog.create({
    data: {
      adminId,
      action: action as any,
      description: `Admin performed: ${action}`,
      metadata: metadata || {},
    },
  });
}
```

---

## **Step 5: Create Platform Admin Middleware**

```typescript
// lib/auth/platform-admin-middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyPlatformAdminToken } from './platform-admin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PlatformAdminRequest extends NextRequest {
  platformAdmin: {
    adminId: string;
    email: string;
    role: string;
    permissions: any;
  };
}

export function withPlatformAdmin(
  handler: (req: PlatformAdminRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get token
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED' } },
          { status: 401 }
        );
      }
      
      const token = authHeader.substring(7);
      
      // Verify token
      const payload = verifyPlatformAdminToken(token);
      
      // Get admin from database (to check active status)
      const admin = await prisma.platformAdmin.findUnique({
        where: { id: payload.adminId },
        select: {
          id: true,
          email: true,
          role: true,
          permissions: true,
          isActive: true,
        },
      });
      
      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { success: false, error: { code: 'ADMIN_DEACTIVATED' } },
          { status: 403 }
        );
      }
      
      // Attach admin to request
      (req as PlatformAdminRequest).platformAdmin = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions as any,
      };
      
      return handler(req as PlatformAdminRequest);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }
  };
}

// Permission-based authorization
export function requirePermission(permission: string) {
  return (handler: (req: PlatformAdminRequest) => Promise<NextResponse>) => {
    return withPlatformAdmin(async (req: PlatformAdminRequest) => {
      const perms = req.platformAdmin.permissions as any;
      
      if (!perms[permission]) {
        return NextResponse.json(
          { success: false, error: { code: 'INSUFFICIENT_PERMISSIONS' } },
          { status: 403 }
        );
      }
      
      return handler(req);
    });
  };
}
```

---

## **Step 6: Create Platform Admin API Endpoints**

```typescript
// app/api/v1/platform-admin/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { loginPlatformAdmin } from '@/lib/auth/platform-admin';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);
    
    const result = await loginPlatformAdmin(data.email, data.password);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message || 'Invalid credentials',
        },
      },
      { status: 401 }
    );
  }
}
```

```typescript
// app/api/v1/platform-admin/tenants/route.ts

import { withPlatformAdmin, requirePermission } from '@/lib/auth/platform-admin-middleware';
import { prisma } from '@/lib/db';
import { logPlatformAdminAction } from '@/lib/auth/platform-admin';

async function handler(req: PlatformAdminRequest) {
  const tenants = await prisma.tenant.findMany({
    include: {
      users: {
        select: { id: true, email: true, name: true, role: true },
      },
      _count: {
        select: {
          conversations: true,
          leads: true,
          simulations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  // Log the action
  await logPlatformAdminAction(
    req.platformAdmin.adminId,
    'VIEWED_ALL_TENANTS',
    { count: tenants.length }
  );
  
  return NextResponse.json({
    success: true,
    data: tenants,
  });
}

export const GET = requirePermission('canViewAllTenants')(handler);
```

```typescript
// app/api/v1/platform-admin/analytics/route.ts

import { withPlatformAdmin } from '@/lib/auth/platform-admin-middleware';
import { prisma } from '@/lib/db';

export const GET = withPlatformAdmin(async (req) => {
  const [
    totalTenants,
    activeTenants,
    totalUsers,
    totalConversations,
    totalLeads,
    qualifiedLeads,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { qualificationScore: { gte: 70 } } }),
  ]);
  
  // AI costs last 30 days
  const aiCosts = await prisma.apiUsage.aggregate({
    _sum: { cost: true },
    _count: true,
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });
  
  // Revenue estimate (simplified)
  const revenue = await prisma.tenant.groupBy({
    by: ['subscriptionTier'],
    _count: true,
    where: { subscriptionStatus: 'ACTIVE' },
  });
  
  return NextResponse.json({
    success: true,
    data: {
      tenants: {
        total: totalTenants,
        active: activeTenants,
      },
      users: totalUsers,
      conversations: totalConversations,
      leads: {
        total: totalLeads,
        qualified: qualifiedLeads,
      },
      ai: {
        totalCost30Days: aiCosts._sum.cost || 0,
        totalCalls30Days: aiCosts._count,
      },
      revenue: revenue.map(r => ({
        tier: r.subscriptionTier,
        count: r._count,
      })),
    },
  });
});
```

---

## **Step 7: Update .env.local**

Add new secret for platform admin JWTs:

```bash
# Platform Admin Authentication (separate from regular users)
JWT_PLATFORM_ADMIN_SECRET="GENERATE_WITH_OPENSSL_DIFFERENT_FROM_USER_SECRET"
```

Generate it:
```bash
openssl rand -base64 32
```

---

## **Step 8: Create Platform Admin Frontend**

```typescript
// app/(platform-admin)/admin/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlatformAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/v1/platform-admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error.message);
        return;
      }
      
      // Store token
      localStorage.setItem('platformAdminToken', data.data.token);
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Platform Admin Login
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login as Platform Admin
          </button>
        </form>
      </div>
    </div>
  );
}
```

```typescript
// app/(platform-admin)/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlatformAdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('platformAdminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchData(token);
  }, []);
  
  const fetchData = async (token: string) => {
    try {
      // Fetch analytics
      const analyticsRes = await fetch('/api/v1/platform-admin/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.data);
      
      // Fetch tenants
      const tenantsRes = await fetch('/api/v1/platform-admin/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tenantsData = await tenantsRes.json();
      setTenants(tenantsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      router.push('/admin/login');
    }
  };
  
  if (!analytics) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Platform Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tenants"
          value={analytics.tenants.total}
          subtitle={`${analytics.tenants.active} active`}
        />
        <StatCard
          title="Total Users"
          value={analytics.users}
        />
        <StatCard
          title="Conversations"
          value={analytics.conversations}
        />
        <StatCard
          title="AI Costs (30d)"
          value={`$${analytics.ai.totalCost30Days.toFixed(2)}`}
          subtitle={`${analytics.ai.totalCalls30Days} calls`}
        />
      </div>
      
      {/* Tenants List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Tenants</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Business Name</th>
                <th className="px-6 py-3 text-left">Users</th>
                <th className="px-6 py-3 text-left">Conversations</th>
                <th className="px-6 py-3 text-left">Leads</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-t">
                  <td className="px-6 py-4">{tenant.businessName}</td>
                  <td className="px-6 py-4">{tenant.users.length}</td>
                  <td className="px-6 py-4">{tenant._count.conversations}</td>
                  <td className="px-6 py-4">{tenant._count.leads}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      tenant.subscriptionStatus === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenant.subscriptionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm text-gray-500 mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
```

---

## **Comparison: Approach A vs B**

| Feature | Approach A (Flag) | Approach B (Separate Table) ✅ |
|---------|------------------|--------------------------------|
| **Setup Time** | 5 minutes | 15 minutes |
| **Code Clarity** | ⚠️ Mixed user types | ✅ Clean separation |
| **Security** | ⚠️ Same auth flow | ✅ Separate auth flow |
| **Audit Trail** | ❌ Manual | ✅ Built-in |
| **Permissions** | ❌ Hard to add | ✅ Granular from start |
| **Scalability** | ⚠️ Gets messy | ✅ Scales well |
| **Multiple Admin Roles** | ❌ Difficult | ✅ Easy (SUPER_ADMIN, SUPPORT, etc.) |
| **Null TenantId Issues** | ⚠️ Everywhere | ✅ No issues |

---

## **Recommendation: Use Approach B** ✅

**Why:**
- Only takes 10 extra minutes
- Much cleaner architecture
- Easier to maintain long-term
- Professional SaaS pattern
- No technical debt

---

## **Quick Implementation (Now)**

```bash
# 1. Add models to prisma/schema.prisma
# (Copy PlatformAdmin, PlatformAuditLog, PlatformSettings models above)

# 2. Create migration
npx prisma migrate dev --name add_platform_admin_table

# 3. Create platform admin
npx ts-node prisma/seed-platform-admin.ts

# 4. Add to .env.local
JWT_PLATFORM_ADMIN_SECRET="$(openssl rand -base64 32)"

# Done! Continue with Session 4
```

---

**You were right to question Approach A. Approach B is better!** 🎯
