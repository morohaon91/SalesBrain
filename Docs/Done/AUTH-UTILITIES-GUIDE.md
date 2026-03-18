# Authentication Utilities - Complete Implementation Guide

**Status**: ✅ COMPLETE
**Date**: March 17, 2026
**Reference Documents**:
- `05-AUTHENTICATION-SECURITY.md`
- `02-API-ARCHITECTURE.md`

---

## Overview

Three core authentication utility files have been created to handle:
1. **Password hashing & verification** (bcrypt)
2. **JWT token generation & validation**
3. **Request authentication middleware**

---

## File 1: lib/auth/password.ts

**Purpose**: Secure password handling using bcrypt

### Functions

#### `hashPassword(password: string): Promise<string>`
Hashes a password using bcrypt with 10 salt rounds.

**Usage**:
```typescript
import { hashPassword } from '@/lib/auth/password';

const hashedPassword = await hashPassword('UserPassword123!');
// Store hashedPassword in database
```

**Parameters**:
- `password` (string): Plain text password to hash

**Returns**: Promise<string> - Hashed password (60 characters)

**Throws**: Error if hashing fails

---

#### `verifyPassword(password: string, hash: string): Promise<boolean>`
Verifies a plain text password against its bcrypt hash.

**Usage**:
```typescript
import { verifyPassword } from '@/lib/auth/password';

const isValid = await verifyPassword('UserPassword123!', storedHash);
if (isValid) {
  // Password matches
} else {
  // Password incorrect
}
```

**Parameters**:
- `password` (string): Plain text password to verify
- `hash` (string): Bcrypt hash from database

**Returns**: Promise<boolean> - True if password matches, false otherwise

**Throws**: Error if verification fails

---

### Configuration

- **Salt Rounds**: 10 (recommended balance of security and performance)
- **Algorithm**: bcrypt
- **Cost**: ~100ms per hash (suitable for auth endpoints)

---

## File 2: lib/auth/jwt.ts

**Purpose**: JWT token creation and validation

### Types

#### `TokenPayload` Interface
```typescript
interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  iat?: number;  // Issued at (seconds)
  exp?: number;  // Expiration (seconds)
}
```

---

### Functions

#### `generateAccessToken(user: User): string`
Creates a short-lived JWT access token (15 minutes expiry).

**Usage**:
```typescript
import { generateAccessToken } from '@/lib/auth/jwt';
import { User } from '@prisma/client';

const user = await prisma.user.findUnique({ where: { id: userId } });
const token = generateAccessToken(user);

// Send to client in response
return NextResponse.json({
  success: true,
  data: { token }
});
```

**Parameters**:
- `user` (User): User object from Prisma

**Returns**: string - Signed JWT token

**Token Structure**:
```json
{
  "userId": "uuid",
  "tenantId": "uuid",
  "email": "user@example.com",
  "role": "OWNER",
  "iat": 1710756000,
  "exp": 1710756900
}
```

**Expiry**: 15 minutes

---

#### `generateRefreshToken(user: User): string`
Creates a long-lived JWT refresh token (7 days expiry).

**Usage**:
```typescript
import { generateRefreshToken } from '@/lib/auth/jwt';

const refreshToken = generateRefreshToken(user);

// Set as HTTP-only cookie
response.cookies.set('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60, // 7 days
});
```

**Parameters**:
- `user` (User): User object from Prisma

**Returns**: string - Signed JWT token

**Expiry**: 7 days

---

#### `verifyAccessToken(token: string): TokenPayload`
Verifies and decodes an access token.

**Usage**:
```typescript
import { verifyAccessToken } from '@/lib/auth/jwt';

try {
  const payload = verifyAccessToken(token);
  // Use payload.userId, payload.tenantId, etc.
} catch (error) {
  // Token invalid or expired
  return error401Response();
}
```

**Parameters**:
- `token` (string): JWT token to verify

**Returns**: TokenPayload - Decoded token data

**Throws**:
- `Error: "Access token expired"` - Token has expired
- `Error: "Invalid access token"` - Token signature invalid
- `Error: "Authentication failed"` - Unexpected error

---

#### `verifyRefreshToken(token: string): TokenPayload`
Verifies and decodes a refresh token.

**Usage**:
```typescript
import { verifyRefreshToken } from '@/lib/auth/jwt';

try {
  const payload = verifyRefreshToken(refreshToken);
  // Generate new access token
  const newToken = generateAccessToken(user);
} catch (error) {
  // Refresh token invalid or expired
  return error401Response();
}
```

**Parameters**:
- `token` (string): JWT token to verify

**Returns**: TokenPayload - Decoded token data

**Throws**:
- `Error: "Refresh token expired"` - Token has expired
- `Error: "Invalid refresh token"` - Token signature invalid

---

#### `extractTokenFromHeader(authHeader: string | null): string | null`
Safely extracts JWT from "Bearer <token>" Authorization header.

**Usage**:
```typescript
import { extractTokenFromHeader } from '@/lib/auth/jwt';

const authHeader = req.headers.get('authorization');
const token = extractTokenFromHeader(authHeader);
// Expected: "Bearer eyJhbGci..."
// Extracted: "eyJhbGci..."
```

**Parameters**:
- `authHeader` (string | null): Authorization header value

**Returns**: string | null - Token if valid format, null if invalid

---

#### `isTokenExpired(token: string): boolean`
Checks if token is expired without throwing error.

**Usage**:
```typescript
import { isTokenExpired } from '@/lib/auth/jwt';

if (isTokenExpired(token)) {
  // Request new token
}
```

**Parameters**:
- `token` (string): JWT token

**Returns**: boolean - True if expired, false otherwise

---

#### `getTokenTimeToExpiry(token: string): number | null`
Gets seconds until token expires.

**Usage**:
```typescript
import { getTokenTimeToExpiry } from '@/lib/auth/jwt';

const secondsLeft = getTokenTimeToExpiry(token);
if (secondsLeft && secondsLeft < 300) {
  // Token expires in < 5 minutes, refresh it
}
```

**Parameters**:
- `token` (string): JWT token

**Returns**: number | null - Seconds until expiry, null if invalid

---

### Configuration

**Environment Variables Required**:
```bash
JWT_ACCESS_SECRET="openssl rand -base64 32"
JWT_REFRESH_SECRET="openssl rand -base64 32"
```

**Token Expiry**:
- Access Token: 15 minutes
- Refresh Token: 7 days

**Algorithm**: HS256 (HMAC with SHA-256)

---

## File 3: lib/auth/middleware.ts

**Purpose**: Authentication and authorization middleware for API routes

### Types

#### `AuthenticatedRequest` Interface
Extended NextRequest with authentication context.

```typescript
interface AuthenticatedRequest extends NextRequest {
  auth: TokenPayload;
}
```

**Available Properties**:
- `req.auth.userId` - User ID
- `req.auth.tenantId` - Tenant ID (for multi-tenancy)
- `req.auth.email` - User email
- `req.auth.role` - User role (OWNER, ADMIN, VIEWER, etc.)

---

### Middleware Functions

#### `withAuth(handler: Function): Function`
Requires valid JWT token in Authorization header.

**Usage**:
```typescript
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { NextResponse } from 'next/server';

async function handler(req: AuthenticatedRequest) {
  const { userId, tenantId, email, role } = req.auth;

  // Fetch data for authenticated user/tenant
  const conversations = await prisma.conversation.findMany({
    where: { tenantId }
  });

  return NextResponse.json({
    success: true,
    data: conversations
  });
}

export const GET = withAuth(handler);
```

**Response on Success**: Handler executes with `req.auth` populated

**Response on Failure**: 401 Unauthorized with error message

---

#### `withRole(allowedRoles: string | string[]): Function`
Requires valid token AND specific role(s).

**Usage**:
```typescript
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest) {
  // Only OWNER can access
  return NextResponse.json({ /* response */ });
}

export const POST = withRole('OWNER')(handler);
```

**Multiple Roles**:
```typescript
export const DELETE = withRole(['OWNER', 'ADMIN'])(handler);
```

**Response on Failure**: 403 Forbidden if user lacks required role

---

#### `withTenant(handler: Function): Function`
Ensures user can only access their own tenant's data.

**Usage**:
```typescript
import { withTenant, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;

  // Only access data for this tenant
  const data = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  return NextResponse.json({ success: true, data });
}

export const GET = withTenant(handler);
```

---

#### `pipe(...middlewares: Function[]): Function`
Combine multiple middleware functions.

**Usage**:
```typescript
import { withAuth, withRole, withTenant } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest) {
  // Protected by auth, role, and tenant checks
}

export const PUT = pipe(
  withAuth,
  withRole('OWNER'),
  withTenant
)(handler);
```

---

### Helper Functions

#### `getAuth(req: NextRequest): TokenPayload | null`
Safely get auth context from request.

```typescript
const auth = getAuth(req);
if (auth) {
  console.log(`User ${auth.userId} from tenant ${auth.tenantId}`);
}
```

---

#### `isAuthenticated(req: NextRequest): boolean`
Check if request is authenticated.

```typescript
if (!isAuthenticated(req)) {
  return forbiddenResponse();
}
```

---

#### `hasRole(req: AuthenticatedRequest, role: string): boolean`
Check if user has specific role.

```typescript
if (hasRole(req, 'OWNER')) {
  // User is owner
}
```

---

#### `hasAnyRole(req: AuthenticatedRequest, roles: string[]): boolean`
Check if user has one of multiple roles.

```typescript
if (hasAnyRole(req, ['OWNER', 'ADMIN'])) {
  // User is owner or admin
}
```

---

#### `isTenantOwner(req: AuthenticatedRequest, tenantId: string): boolean`
Check if user is owner of specific tenant.

```typescript
if (isTenantOwner(req, requestedTenantId)) {
  // User owns this tenant
}
```

---

#### `getTenantId(req: AuthenticatedRequest): string | null`
Extract tenant ID from request.

```typescript
const tenantId = getTenantId(req);
```

---

#### `getUserId(req: AuthenticatedRequest): string | null`
Extract user ID from request.

```typescript
const userId = getUserId(req);
```

---

## Complete Example: Protected API Endpoint

```typescript
// app/api/v1/conversations/route.ts

import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

async function handler(req: AuthenticatedRequest) {
  const { tenantId, userId } = req.auth;

  // Get conversations for authenticated user's tenant
  const conversations = await prisma.conversation.findMany({
    where: { tenantId },
    include: {
      messages: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      lead: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return NextResponse.json({
    success: true,
    data: conversations,
    meta: {
      timestamp: new Date().toISOString(),
      userId,
      tenantId
    }
  });
}

export const GET = withAuth(handler);
```

---

## Authentication Flow

### 1. Login Endpoint
```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "UserPassword123!"
}
```

**Flow**:
1. Verify email exists
2. Hash provided password and compare with stored hash using `verifyPassword()`
3. Generate tokens using `generateAccessToken()` and `generateRefreshToken()`
4. Set refresh token in HTTP-only cookie
5. Return access token in response body

---

### 2. Authenticated Request
```
GET /api/v1/conversations
Authorization: Bearer <access_token>
```

**Flow**:
1. Middleware extracts token from header using `extractTokenFromHeader()`
2. Token verified using `verifyAccessToken()`
3. Payload attached to request as `req.auth`
4. Handler accesses `req.auth.userId`, `req.auth.tenantId`, etc.

---

### 3. Token Refresh
```
POST /api/v1/auth/refresh
(refreshToken in HTTP-only cookie)
```

**Flow**:
1. Extract refresh token from cookie
2. Verify using `verifyRefreshToken()`
3. Generate new access token using `generateAccessToken()`
4. Return new token to client

---

## Error Handling

### Authentication Errors

```typescript
// Invalid token
401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid access token"
  }
}
```

### Authorization Errors

```typescript
// Insufficient permissions
403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions. Required role(s): OWNER, ADMIN"
  }
}
```

---

## Security Best Practices

✅ **Implemented**:
- bcrypt for password hashing (10 rounds)
- HS256 algorithm for JWT signing
- Separate secrets for access and refresh tokens
- Short access token expiry (15 minutes)
- HTTP-only cookies for refresh tokens
- Token extraction validation (Bearer prefix check)
- Error messages don't reveal token validity
- Tenant isolation checks

⚠️ **Additional Recommendations**:
- Rate limit authentication endpoints
- Log failed login attempts
- Implement CSRF protection
- Use HTTPS in production
- Rotate JWT secrets periodically
- Consider implementing token blacklist for logout

---

## Testing

### Unit Tests

```typescript
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Hashing', () => {
  it('should hash password', async () => {
    const hash = await hashPassword('TestPass123!');
    expect(hash.length).toBeGreaterThan(50);
    expect(hash).not.toBe('TestPass123!');
  });

  it('should verify correct password', async () => {
    const password = 'TestPass123!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject wrong password', async () => {
    const hash = await hashPassword('TestPass123!');
    const isValid = await verifyPassword('WrongPass123!', hash);
    expect(isValid).toBe(false);
  });
});
```

### Integration Tests

```typescript
import { generateAccessToken, verifyAccessToken } from '@/lib/auth/jwt';
import { User } from '@prisma/client';

describe('JWT Tokens', () => {
  it('should generate and verify access token', () => {
    const user = {
      id: 'user-123',
      tenantId: 'tenant-456',
      email: 'test@example.com',
      role: 'OWNER'
    } as User;

    const token = generateAccessToken(user);
    const payload = verifyAccessToken(token);

    expect(payload.userId).toBe(user.id);
    expect(payload.tenantId).toBe(user.tenantId);
    expect(payload.email).toBe(user.email);
  });
});
```

---

## Environment Setup

Create `.env.local`:
```bash
# JWT Secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="<generated-secret>"
JWT_REFRESH_SECRET="<generated-secret>"

# Database
DATABASE_URL="postgresql://..."

# App
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

Generate secrets:
```bash
openssl rand -base64 32
openssl rand -base64 32
```

---

## Summary

| File | Purpose | Key Functions |
|------|---------|---|
| `password.ts` | Password hashing | `hashPassword()`, `verifyPassword()` |
| `jwt.ts` | Token management | `generateAccessToken()`, `verifyAccessToken()`, etc. |
| `middleware.ts` | Route protection | `withAuth()`, `withRole()`, helper functions |

All files follow TypeScript best practices with comprehensive error handling and JSDoc documentation.

---

**Status**: ✅ READY FOR USE

Next: Implement authentication endpoints (login, register, refresh)
