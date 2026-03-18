# Platform Admin - Quick Start Guide

## ✅ Implementation Complete!

All Platform Admin functionality is ready to test. Here's how to get started.

---

## 1️⃣ Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## 2️⃣ Access Admin Login

**URL**: `http://localhost:3000/admin/login`

**Credentials** (created via seed script):
```
Email: admin@salesbrain.local
Password: SuperSecurePassword123!
```

⚠️ **IMPORTANT**: Change this password after first login!

---

## 3️⃣ Admin Dashboard

After login, you'll be redirected to:
`http://localhost:3000/admin/dashboard`

**Dashboard Shows**:
- Total Tenants (active/inactive)
- Total Users
- Total Conversations
- AI Costs (last 30 days)
- Total Leads (qualified/unqualified)
- Revenue breakdown by tier
- Complete tenants list with metrics

---

## 4️⃣ Test APIs with cURL

### Login and Get Token

```bash
RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/platform-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@salesbrain.local",
    "password": "SuperSecurePassword123!"
  }')

echo $RESPONSE | jq .

# Extract token from response
TOKEN=$(echo $RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"
```

### View All Tenants

```bash
curl -X GET http://localhost:3000/api/v1/platform-admin/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### View Analytics

```bash
curl -X GET http://localhost:3000/api/v1/platform-admin/analytics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

---

## 5️⃣ Database Tables Created

Three new tables for platform administration:

### PlatformAdmin
- Separate from regular users
- Email authentication
- 6 role levels (SUPER_ADMIN, ADMIN, SUPPORT, BILLING, DEVELOPER, VIEWER)
- Granular JSONB permissions
- Active/inactive status
- Login tracking

### PlatformAuditLog
- Complete audit trail
- 25+ action types
- Admin + target tracking
- Metadata storage
- IP address logging

### PlatformSettings
- Platform-wide configuration
- Feature flags (maintenance mode, signups enabled)
- AI cost budgets
- Support contact
- Customizable JSON settings

---

## 6️⃣ File Structure

### Authentication
```
lib/auth/
  ├── password.ts                    - bcrypt utilities
  ├── platform-admin.ts              - login & token logic
  └── platform-admin-middleware.ts  - route protection
```

### API Endpoints
```
app/api/v1/platform-admin/
  ├── auth/login/route.ts            - POST /auth/login
  ├── tenants/route.ts               - GET /tenants
  └── analytics/route.ts             - GET /analytics
```

### Frontend Pages
```
app/admin/
  ├── login/page.tsx                 - Login UI
  └── dashboard/page.tsx             - Dashboard UI
```

---

## 7️⃣ Environment Variables

Your `.env.local` now includes:

```bash
# Platform Admin Authentication
JWT_PLATFORM_ADMIN_SECRET="hQIhWzkb0BKu68Mg3gZt1t/Qe6xZFRHbNv8Z1oXt1h0="
```

This is separate from regular user JWT secrets for security.

---

## 8️⃣ Create More Platform Admins

To create additional admin users via database:

```bash
npm run db:studio
```

Then manually create a new `PlatformAdmin` record with:
- email (unique)
- password (use an online bcrypt generator, or create a small script)
- name
- role (SUPER_ADMIN, ADMIN, SUPPORT, BILLING, DEVELOPER, VIEWER)
- permissions (JSON object)

Or programmatically:

```typescript
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';

const admin = await prisma.platformAdmin.create({
  data: {
    email: "newadmin@example.com",
    password: await hashPassword("SecurePassword123!"),
    name: "New Admin",
    role: "ADMIN",
    permissions: {
      canViewAllTenants: true,
      canManageSubscriptions: true,
      canViewAnalytics: true,
      // ... other permissions
    }
  }
});
```

---

## 9️⃣ Audit Log

Every admin action is logged to `PlatformAuditLog`:

**Actions Logged**:
- ✅ LOGGED_IN - Admin login
- ✅ FAILED_LOGIN - Failed login attempt
- ✅ VIEWED_ALL_TENANTS - Accessed tenants list
- ✅ VIEWED_ANALYTICS - Accessed analytics
- ⏳ VIEWED_TENANT - (ready to implement)
- ⏳ IMPERSONATED_USER - (ready to implement)
- ⏳ UPDATED_SUBSCRIPTION - (ready to implement)
- ... and more

**View Audit Logs**:
```bash
npm run db:studio
# Navigate to PlatformAuditLog table
```

---

## 🔟 Permissions Model

Each admin has granular permissions:

```json
{
  "canViewAllTenants": true,        // View all tenant data
  "canManageSubscriptions": true,   // Upgrade/downgrade tenants
  "canImpersonate": true,           // Log in as tenant user
  "canBanTenants": true,            // Suspend/activate tenants
  "canViewAnalytics": true,         // View platform analytics
  "canManageBilling": true,         // Handle payments/refunds
  "canAccessSupport": true          // Access support tickets
}
```

**Built-in Roles**:
- `SUPER_ADMIN` - All permissions true
- `ADMIN` - All permissions true
- `SUPPORT` - Only canAccessSupport
- `BILLING` - Only canManageBilling
- `DEVELOPER` - Only canViewAnalytics
- `VIEWER` - All permissions false

---

## Testing Checklist

- [ ] Start dev server with `npm run dev`
- [ ] Login at `http://localhost:3000/admin/login`
- [ ] See dashboard with stats
- [ ] Check if token is saved to localStorage
- [ ] Test logout button
- [ ] Call `/api/v1/platform-admin/tenants` endpoint with token
- [ ] Call `/api/v1/platform-admin/analytics` endpoint with token
- [ ] Try accessing with wrong password (should fail)
- [ ] Check `PlatformAuditLog` in Prisma Studio for logged actions
- [ ] Create new admin user in database

---

## Troubleshooting

### Login Not Working?

1. Check if dev server is running: `npm run dev`
2. Verify email: `admin@salesbrain.local`
3. Verify password: `SuperSecurePassword123!`
4. Check console for errors

### Token Invalid Error?

1. Ensure `JWT_PLATFORM_ADMIN_SECRET` is set in `.env.local`
2. Token expires after 8 hours
3. Copy exact token from login response
4. Include in header: `Authorization: Bearer <TOKEN>`

### Database Connection Issues?

1. Check if PostgreSQL is running: `pg_isready`
2. Verify `.env.local` has correct CONNECTION_URL
3. Credentials: root / Vasker0408$%
4. Run: `npx prisma db push`

### Permissions Check Failing?

1. Verify user has permission in database
2. Check `permissions` JSON in PlatformAdmin record
3. Permission key must match exactly (case-sensitive)

---

## API Response Examples

### Login Success
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid-here",
      "email": "admin@salesbrain.local",
      "name": "Super Admin",
      "role": "SUPER_ADMIN",
      "permissions": { "canViewAllTenants": true, ... }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login Failure
```json
{
  "success": false,
  "error": {
    "code": "LOGIN_FAILED",
    "message": "Invalid credentials"
  }
}
```

### Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

### Analytics Success
```json
{
  "success": true,
  "data": {
    "tenants": { "total": 1, "active": 1 },
    "users": 1,
    "conversations": 0,
    "leads": { "total": 0, "qualified": 0 },
    "ai": { "totalCost30Days": 0, "totalCalls30Days": 0 },
    "revenue": [
      { "tier": "TRIAL", "count": 1 }
    ]
  }
}
```

---

## What's Next?

The platform admin system is complete! Next tasks:

1. **Implement User Authentication** - Tenant user signup/login
2. **Create Business Profiles** - Platform admin manages profiles
3. **Add More Admin Features** - Impersonation, subscription management
4. **Build Public Landing Page** - For tenant signup
5. **Implement Dashboard** - For tenant users

---

## Documentation

- **Full Implementation Details**: `Docs/04-PLATFORM-ADMIN-IMPLEMENTATION.md`
- **Reference Document**: `Docs/14-PLATFORM-ADMIN-APPROACH-B.md`
- **Database Schema**: `Docs/01-DATABASE-SCHEMA.md`

---

## Questions?

Everything is implemented according to `14-PLATFORM-ADMIN-APPROACH-B.md`.

✅ All 8 implementation steps completed
✅ 3 database tables created
✅ 1 seed script run
✅ 3 API endpoints ready
✅ 2 frontend pages built
✅ Full authentication flow implemented

**Ready to test!** 🚀
