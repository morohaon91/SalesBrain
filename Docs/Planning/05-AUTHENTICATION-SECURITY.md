# Authentication & Security Implementation

## Authentication Strategy

### Approach: JWT + HTTP-Only Cookies
- **Access tokens**: Short-lived JWT (15 minutes)
- **Refresh tokens**: Long-lived, HTTP-only cookie (7 days)
- **Session management**: Redis for token blacklist
- **Password hashing**: bcrypt (10 rounds)

---

## Authentication Flow

### Registration Flow
```mermaid
sequenceDiagram
    User->>Frontend: Submit registration form
    Frontend->>API: POST /auth/register
    API->>Database: Check email uniqueness
    API->>Database: Create tenant + user
    API->>API: Generate JWT tokens
    API->>Frontend: Return tokens + user data
    Frontend->>Frontend: Store access token
    Frontend->>Dashboard: Redirect to onboarding
```

### Login Flow
```mermaid
sequenceDiagram
    User->>Frontend: Submit credentials
    Frontend->>API: POST /auth/login
    API->>Database: Verify credentials
    API->>API: Generate JWT tokens
    API->>Frontend: Set refresh token cookie
    API->>Frontend: Return access token
    Frontend->>Frontend: Store access token
    Frontend->>Dashboard: Redirect
```

### Token Refresh Flow
```mermaid
sequenceDiagram
    Frontend->>API: Request with expired access token
    API->>Frontend: 401 Unauthorized
    Frontend->>API: POST /auth/refresh (with cookie)
    API->>Redis: Verify refresh token not blacklisted
    API->>API: Generate new access token
    API->>Frontend: Return new access token
    Frontend->>API: Retry original request
```

---

## Implementation Details

### 1. Password Hashing

```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

### 2. JWT Token Generation

```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
}
```

---

### 3. Registration Endpoint

```typescript
// app/api/v1/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)/),
  name: z.string().min(2).max(100),
  businessName: z.string().min(2).max(200),
  industry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const data = registerSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(data.password);
    
    // Create tenant and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          businessName: data.businessName,
          industry: data.industry,
          subscriptionTier: 'TRIAL',
          subscriptionStatus: 'ACTIVE',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      });
      
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          tenantId: tenant.id,
          role: 'OWNER',
        },
      });
      
      // Create empty business profile
      await tx.businessProfile.create({
        data: {
          tenantId: tenant.id,
          isComplete: false,
          completionScore: 0,
        },
      });
      
      return { user, tenant };
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(result.user);
    const refreshToken = generateRefreshToken(result.user);
    
    // Set refresh token as HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        tenantId: result.user.tenantId,
        email: result.user.email,
        name: result.user.name,
        token: accessToken,
      },
    });
    
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } },
      { status: 500 }
    );
  }
}
```

---

### 4. Login Endpoint

```typescript
// app/api/v1/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(data.password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    const response = NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        role: user.role,
        token: accessToken,
      },
    });
    
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

---

### 5. Token Refresh Endpoint

```typescript
// app/api/v1/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_REFRESH_TOKEN' } },
        { status: 401 }
      );
    }
    
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Check if token is blacklisted (logout)
    // TODO: Implement Redis check
    
    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND' } },
        { status: 401 }
      );
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    return NextResponse.json({
      success: true,
      data: {
        token: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_REFRESH_TOKEN' } },
      { status: 401 }
    );
  }
}
```

---

### 6. Authentication Middleware

```typescript
// lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  auth: {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
  };
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } },
          { status: 401 }
        );
      }
      
      const token = authHeader.substring(7);
      
      // Verify token
      const payload = verifyAccessToken(token);
      
      // Attach auth data to request
      (req as AuthenticatedRequest).auth = payload;
      
      return handler(req as AuthenticatedRequest);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      );
    }
  };
}

export function withRole(role: string | string[]) {
  const allowedRoles = Array.isArray(role) ? role : [role];
  
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!allowedRoles.includes(req.auth.role)) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
          { status: 403 }
        );
      }
      
      return handler(req);
    });
  };
}
```

---

### 7. Usage in Protected Endpoints

```typescript
// app/api/v1/conversations/route.ts
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

async function handler(req: AuthenticatedRequest) {
  const { tenantId } = req.auth;
  
  // Fetch conversations for this tenant only
  const conversations = await prisma.conversation.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  
  return NextResponse.json({
    success: true,
    data: conversations,
  });
}

export const GET = withAuth(handler);
```

---

## Security Best Practices

### 1. Input Validation
```typescript
// All user inputs validated with Zod schemas
import { z } from 'zod';

const emailSchema = z.string().email().max(255);
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');
```

---

### 2. Rate Limiting
```typescript
// lib/security/rate-limit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / config.windowMs)}`;
  
  const current = await redis.incr(windowKey);
  
  if (current === 1) {
    await redis.expire(windowKey, Math.ceil(config.windowMs / 1000));
  }
  
  return {
    allowed: current <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - current),
  };
}

// Usage in endpoint
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  const limit = await rateLimit(`login:${ip}`, {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  });
  
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' } },
      { status: 429 }
    );
  }
  
  // Continue with login logic...
}
```

---

### 3. SQL Injection Prevention
```typescript
// Prisma ORM automatically prevents SQL injection
// NEVER use raw SQL with user input unless absolutely necessary

// Safe (Prisma)
await prisma.user.findUnique({
  where: { email: userInput },
});

// Unsafe (raw SQL) - AVOID
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;

// If raw SQL needed, use parameterized queries
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

---

### 4. XSS Prevention
```typescript
// React automatically escapes strings
// Additional sanitization for rich text (if needed)
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}
```

---

### 5. CSRF Protection
```typescript
// Next.js API routes include CSRF protection by default
// For additional security, use SameSite cookies

response.cookies.set('refreshToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax', // or 'strict'
});
```

---

### 6. Tenant Isolation (Critical)
```typescript
// Prisma middleware to enforce tenant isolation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add middleware
prisma.$use(async (params, next) => {
  // Skip for Tenant model itself
  if (params.model === 'Tenant') {
    return next(params);
  }
  
  // Get tenant from context (set by auth middleware)
  const tenantId = getTenantFromContext();
  
  if (!tenantId) {
    throw new Error('No tenant context');
  }
  
  // Read operations
  if (params.action === 'findUnique' || params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      tenantId,
    };
  }
  
  // Write operations
  if (params.action === 'create') {
    params.args.data = {
      ...params.args.data,
      tenantId,
    };
  }
  
  return next(params);
});

// Context management
let currentTenantId: string | null = null;

export function setTenantContext(tenantId: string) {
  currentTenantId = tenantId;
}

export function getTenantFromContext(): string | null {
  return currentTenantId;
}

export function clearTenantContext() {
  currentTenantId = null;
}

// Usage in endpoint
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  setTenantContext(req.auth.tenantId);
  
  try {
    // This query is automatically scoped to tenant
    const data = await prisma.conversation.findMany();
    return NextResponse.json({ success: true, data });
  } finally {
    clearTenantContext();
  }
});
```

---

### 7. Environment Variables
```bash
# .env.local
# Never commit this file!

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="your-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# API Keys
ANTHROPIC_API_KEY="sk-ant-..."
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="..."

# Redis
REDIS_URL="redis://localhost:6379"

# Email
RESEND_API_KEY="..."

# Environment
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

---

### 8. Security Headers
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

---

## Widget Authentication

### Widget-Specific Auth
```typescript
// Widget uses API key instead of JWT
export async function authenticateWidget(apiKey: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { widgetApiKey: apiKey },
  });
  
  if (!tenant || !tenant.widgetEnabled) {
    throw new Error('Invalid or disabled widget');
  }
  
  return tenant;
}

// Usage
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-widget-api-key');
  
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }
  
  const tenant = await authenticateWidget(apiKey);
  
  // Continue with widget logic...
}
```

---

## Testing Security

### Unit Tests
```typescript
// __tests__/auth/password.test.ts
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Hashing', () => {
  it('should hash password', async () => {
    const password = 'TestPass123!';
    const hash = await hashPassword(password);
    
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });
  
  it('should verify correct password', async () => {
    const password = 'TestPass123!';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });
  
  it('should reject incorrect password', async () => {
    const password = 'TestPass123!';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword('WrongPass123!', hash);
    expect(isValid).toBe(false);
  });
});
```

---

### Integration Tests
```typescript
// __tests__/api/auth/login.test.ts
import { POST } from '@/app/api/v1/auth/login/route';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    // Create test user
    await prisma.tenant.create({
      data: {
        id: 'test-tenant',
        businessName: 'Test Business',
        users: {
          create: {
            email: 'test@example.com',
            password: await hashPassword('TestPass123!'),
            name: 'Test User',
          },
        },
      },
    });
  });
  
  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
  });
  
  it('should login with valid credentials', async () => {
    const req = new NextRequest('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!',
      }),
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
  });
  
  it('should reject invalid credentials', async () => {
    const req = new NextRequest('http://localhost/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPass123!',
      }),
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });
});
```

---

**Next Steps:**
1. Set up environment variables
2. Implement authentication endpoints
3. Create auth middleware
4. Add rate limiting
5. Implement tenant isolation
6. Write security tests
7. Security audit before launch

---

**Document Status**: Complete - Ready for Implementation
**Last Updated**: March 2026
