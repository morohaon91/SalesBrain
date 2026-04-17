# RBAC Extension - Role-Based Access Control

## Overview

Adding role-based access control to support multiple user types per tenant:
- **Owner**: Full access (current default)
- **Admin**: Can manage everything except billing
- **Sales**: Can view and manage leads only
- **Viewer**: Read-only access

---

## Database Schema Changes

### 1. Update User Role Enum

```prisma
// In schema.prisma - UPDATE existing UserRole enum

enum UserRole {
  OWNER          // Full access, billing, settings
  ADMIN          // Full access except billing
  SALES          // Leads and conversations only
  VIEWER         // Read-only access
}
```

### 2. Add Permission System (Optional Advanced Approach)

If you want fine-grained permissions, add these tables:

```prisma
// Optional: For very granular permissions
model Role {
  id          String   @id @default(uuid())
  name        String   // "Sales Manager", "Junior Sales Rep"
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  permissions Permission[]
  users       User[]
  
  @@unique([tenantId, name])
  @@index([tenantId])
}

model Permission {
  id          String   @id @default(uuid())
  roleId      String
  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  resource    String   // "leads", "conversations", "settings"
  action      String   // "read", "write", "delete"
  
  @@unique([roleId, resource, action])
  @@index([roleId])
}

// Update User model to reference Role
model User {
  // ... existing fields
  roleId      String?
  customRole  Role?    @relation(fields: [roleId], references: [id])
}
```

**Recommendation for MVP:** Stick with simple enum-based roles (OWNER, ADMIN, SALES, VIEWER). Add custom roles later if needed.

---

## Permission Matrix

### What Each Role Can Do:

| Feature | Owner | Admin | Sales | Viewer |
|---------|-------|-------|-------|--------|
| **Dashboard** | ✅ Full | ✅ Full | ✅ Leads only | ✅ View |
| **Conversations** | ✅ All | ✅ All | ✅ View/Manage | ✅ View only |
| **Leads** | ✅ All | ✅ All | ✅ All | ✅ View only |
| **Simulations** | ✅ All | ✅ All | ❌ No access | ✅ View only |
| **Business Profile** | ✅ Edit | ✅ Edit | ❌ No access | ✅ View only |
| **Widget Settings** | ✅ All | ✅ All | ❌ No access | ✅ View only |
| **Team Management** | ✅ All | ✅ Invite/Remove | ❌ No access | ❌ No access |
| **Billing** | ✅ All | ❌ No access | ❌ No access | ❌ No access |
| **Account Settings** | ✅ All | ✅ All | ❌ No access | ❌ No access |
| **Analytics** | ✅ All | ✅ All | ✅ Leads only | ✅ View only |

---

## Implementation

### 1. Update Auth Middleware

```typescript
// lib/auth/middleware.ts - ADD role checking

export interface AuthenticatedRequest extends NextRequest {
  auth: {
    userId: string;
    tenantId: string;
    email: string;
    role: UserRole; // Now used for permissions
  };
}

// New: Role-based authorization
export function withRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!roles.includes(req.auth.role)) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'FORBIDDEN', 
              message: 'Insufficient permissions' 
            } 
          },
          { status: 403 }
        );
      }
      
      return handler(req);
    });
  };
}

// New: Resource-based authorization
export function canAccess(
  role: UserRole, 
  resource: string, 
  action: 'read' | 'write' | 'delete'
): boolean {
  const permissions = {
    OWNER: { leads: ['read', 'write', 'delete'], conversations: ['read', 'write', 'delete'], settings: ['read', 'write'] },
    ADMIN: { leads: ['read', 'write', 'delete'], conversations: ['read', 'write', 'delete'], settings: ['read', 'write'] },
    SALES: { leads: ['read', 'write'], conversations: ['read', 'write'], settings: [] },
    VIEWER: { leads: ['read'], conversations: ['read'], settings: [] },
  };
  
  return permissions[role]?.[resource]?.includes(action) ?? false;
}
```

---

### 2. Protect API Endpoints

```typescript
// Example: Settings endpoint (Owner/Admin only)
// app/api/v1/tenant/settings/route.ts

import { withRole } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest) {
  // Only Owner and Admin can update settings
  const { tenantId } = req.auth;
  
  const body = await req.json();
  
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: body,
  });
  
  return NextResponse.json({ success: true, data: updatedTenant });
}

export const PUT = withRole(['OWNER', 'ADMIN'])(handler);
```

```typescript
// Example: Leads endpoint (Owner/Admin/Sales can write, Viewer read-only)
// app/api/v1/leads/[id]/route.ts

async function handleGet(req: AuthenticatedRequest) {
  // All roles can read leads
  const { tenantId, role } = req.auth;
  const { id } = req.params;
  
  const lead = await prisma.lead.findUnique({
    where: { id, tenantId },
  });
  
  return NextResponse.json({ success: true, data: lead });
}

async function handlePut(req: AuthenticatedRequest) {
  // Only Owner/Admin/Sales can update leads
  const { tenantId, role } = req.auth;
  const { id } = req.params;
  
  if (!canAccess(role, 'leads', 'write')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    );
  }
  
  const body = await req.json();
  
  const updatedLead = await prisma.lead.update({
    where: { id, tenantId },
    data: body,
  });
  
  return NextResponse.json({ success: true, data: updatedLead });
}

export const GET = withAuth(handleGet);
export const PUT = withAuth(handlePut);
```

---

### 3. Frontend - Role-Based UI

```typescript
// lib/hooks/usePermissions.ts

import { useAuth } from './useAuth';

export function usePermissions() {
  const { user } = useAuth();
  
  const can = (resource: string, action: 'read' | 'write' | 'delete') => {
    if (!user) return false;
    return canAccess(user.role, resource, action);
  };
  
  const isOwner = user?.role === 'OWNER';
  const isAdmin = user?.role === 'ADMIN';
  const isSales = user?.role === 'SALES';
  const isViewer = user?.role === 'VIEWER';
  
  const canManageTeam = isOwner || isAdmin;
  const canManageLeads = isOwner || isAdmin || isSales;
  const canViewAnalytics = true; // All roles
  const canEditSettings = isOwner || isAdmin;
  
  return {
    can,
    isOwner,
    isAdmin,
    isSales,
    isViewer,
    canManageTeam,
    canManageLeads,
    canViewAnalytics,
    canEditSettings,
  };
}
```

```typescript
// Example: Hide settings menu for Sales/Viewer
// components/dashboard/sidebar.tsx

import { usePermissions } from '@/lib/hooks/usePermissions';

export function Sidebar() {
  const { canEditSettings } = usePermissions();
  
  return (
    <nav>
      {/* ... other menu items */}
      
      {canEditSettings && (
        <Link href="/settings">
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      )}
    </nav>
  );
}
```

```typescript
// Example: Disable edit for Viewer role
// app/(dashboard)/leads/[id]/page.tsx

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const { can } = usePermissions();
  const canEdit = can('leads', 'write');
  
  return (
    <div>
      {/* ... lead details */}
      
      <Button 
        onClick={handleUpdate}
        disabled={!canEdit}
      >
        Update Lead
      </Button>
    </div>
  );
}
```

---

### 4. Team Management UI

```typescript
// app/(dashboard)/settings/team/page.tsx

import { usePermissions } from '@/lib/hooks/usePermissions';

export default function TeamManagementPage() {
  const { canManageTeam } = usePermissions();
  
  if (!canManageTeam) {
    return <div>You don't have permission to manage team members.</div>;
  }
  
  return (
    <div>
      <h1>Team Members</h1>
      
      {/* List of team members */}
      <TeamMembersList />
      
      {/* Invite new member */}
      <InviteForm />
    </div>
  );
}
```

**Invite Form Component:**
```typescript
function InviteForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');
  
  const handleInvite = async () => {
    await api.team.invite({ email, role });
  };
  
  return (
    <form onSubmit={handleInvite}>
      <Input 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="colleague@example.com"
      />
      
      <Select value={role} onChange={setRole}>
        <option value="ADMIN">Admin</option>
        <option value="SALES">Sales</option>
        <option value="VIEWER">Viewer</option>
      </Select>
      
      <Button type="submit">Send Invite</Button>
    </form>
  );
}
```

---

## API Endpoints for Team Management

### POST /api/v1/team/invite
**Permission:** Owner or Admin only

```typescript
// app/api/v1/team/invite/route.ts

import { withRole } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  const { email, role } = await req.json();
  
  // Validate role
  if (!['ADMIN', 'SALES', 'VIEWER'].includes(role)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ROLE' } },
      { status: 400 }
    );
  }
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser && existingUser.tenantId === tenantId) {
    return NextResponse.json(
      { success: false, error: { code: 'USER_ALREADY_MEMBER' } },
      { status: 400 }
    );
  }
  
  // Create invitation (you could use a separate Invitation table)
  // For MVP, just create the user with temporary password
  const tempPassword = generateSecureToken();
  
  const newUser = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(tempPassword),
      name: email.split('@')[0], // Default name
      tenantId,
      role,
      emailVerified: false,
    },
  });
  
  // Send invitation email
  await sendInvitationEmail({
    to: email,
    tempPassword,
    inviterName: req.auth.email,
  });
  
  return NextResponse.json({
    success: true,
    data: {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    },
  });
}

export const POST = withRole(['OWNER', 'ADMIN'])(handler);
```

---

### GET /api/v1/team
**Permission:** Owner or Admin only

```typescript
async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  
  const teamMembers = await prisma.user.findMany({
    where: { tenantId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
  
  return NextResponse.json({ success: true, data: teamMembers });
}

export const GET = withRole(['OWNER', 'ADMIN'])(handler);
```

---

### DELETE /api/v1/team/[userId]
**Permission:** Owner only (can't delete yourself)

```typescript
async function handler(req: AuthenticatedRequest) {
  const { tenantId, userId: currentUserId } = req.auth;
  const { userId } = req.params;
  
  // Can't delete yourself
  if (userId === currentUserId) {
    return NextResponse.json(
      { success: false, error: { code: 'CANNOT_DELETE_SELF' } },
      { status: 400 }
    );
  }
  
  // Can't delete other owners (only one owner per tenant)
  const userToDelete = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (userToDelete?.role === 'OWNER') {
    return NextResponse.json(
      { success: false, error: { code: 'CANNOT_DELETE_OWNER' } },
      { status: 400 }
    );
  }
  
  await prisma.user.delete({
    where: { id: userId, tenantId },
  });
  
  return NextResponse.json({ success: true });
}

export const DELETE = withRole(['OWNER'])(handler);
```

---

## Migration Guide

### Step 1: Update Database Schema
```bash
# Add Role enum values (if not already there)
# Prisma will handle this in migration

npx prisma migrate dev --name add_rbac_roles
```

### Step 2: Update Existing Users
```typescript
// prisma/migrations/add_default_roles.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Set all existing users to OWNER (they were the first users)
  await prisma.user.updateMany({
    where: { role: null },
    data: { role: 'OWNER' },
  });
}

main();
```

### Step 3: Update Frontend
- Add permission hooks
- Hide/disable UI based on role
- Add team management page

### Step 4: Update API
- Add role checks to endpoints
- Test permissions thoroughly

---

## Testing RBAC

```typescript
// __tests__/integration/rbac/permissions.test.ts

describe('Role-Based Access Control', () => {
  let ownerToken: string;
  let salesToken: string;
  let viewerToken: string;
  
  beforeEach(async () => {
    // Create tenant with multiple users
    const tenant = await createTestTenant();
    
    ownerToken = await loginAs({ role: 'OWNER', tenantId: tenant.id });
    salesToken = await loginAs({ role: 'SALES', tenantId: tenant.id });
    viewerToken = await loginAs({ role: 'VIEWER', tenantId: tenant.id });
  });
  
  it('should allow Owner to update settings', async () => {
    const response = await fetch('/api/v1/tenant/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ businessName: 'Updated Name' }),
    });
    
    expect(response.status).toBe(200);
  });
  
  it('should deny Sales from updating settings', async () => {
    const response = await fetch('/api/v1/tenant/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({ businessName: 'Updated Name' }),
    });
    
    expect(response.status).toBe(403);
  });
  
  it('should allow Sales to update leads', async () => {
    const lead = await createTestLead();
    
    const response = await fetch(`/api/v1/leads/${lead.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify({ status: 'CONTACTED' }),
    });
    
    expect(response.status).toBe(200);
  });
  
  it('should deny Viewer from updating leads', async () => {
    const lead = await createTestLead();
    
    const response = await fetch(`/api/v1/leads/${lead.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${viewerToken}` },
      body: JSON.stringify({ status: 'CONTACTED' }),
    });
    
    expect(response.status).toBe(403);
  });
});
```

---

## Pricing Implications

If you add team members:

### Option 1: Flat per-seat pricing
- Basic: $99/month (1 user)
- Pro: $149/month (up to 3 users, +$30/user after)
- Premium: $199/month (unlimited users)

### Option 2: Role-based pricing
- Owner/Admin: $99/month
- Sales users: +$40/month each
- Viewer users: +$20/month each

### Option 3: Include in tiers
- Basic: 1 Owner only
- Pro: 1 Owner + 2 team members
- Premium: Unlimited team members

**Recommendation:** Option 3 for simplicity in MVP.

---

## When to Implement

### MVP (Now):
- ✅ Keep simple: Only OWNER role
- ✅ Single user per tenant

### Post-MVP (v1.1):
- Add ADMIN and SALES roles
- Team invitation system
- Permission checks in API

### Later (v2):
- VIEWER role
- Custom roles
- Fine-grained permissions

---

## Summary

**For your MVP:**
1. Keep it simple - just OWNER role
2. Database schema already supports it (UserRole enum)
3. Add RBAC in v1.1 after validating core product

**To add RBAC later:**
1. Update UserRole enum (5 minutes)
2. Add permission middleware (30 minutes)
3. Update API endpoints (2-3 hours)
4. Build team management UI (4-6 hours)
5. Test thoroughly (2-3 hours)

**Total effort:** 1-2 days of work

---

**Document Status**: RBAC Extension - Optional Feature
**Complexity**: Low-Medium
**When to Add**: After MVP validation
