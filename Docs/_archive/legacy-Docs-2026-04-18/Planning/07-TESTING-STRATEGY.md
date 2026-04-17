# Testing Strategy

## Testing Philosophy

**Goal**: High confidence in critical user flows with minimal test maintenance burden.

**Approach**:
- **Unit tests**: Critical business logic and utilities
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Essential user journeys
- **Manual testing**: UI/UX validation before releases

**Coverage Target**: 70%+ overall, 90%+ for critical paths

---

## Testing Stack

### Core Testing Tools
- **Vitest**: Unit and integration test runner (faster than Jest)
- **Testing Library**: React component testing
- **Playwright**: E2E testing
- **MSW (Mock Service Worker)**: API mocking
- **Faker.js**: Test data generation

### Additional Tools
- **Prisma Client Mock**: Database mocking
- **SuperTest**: HTTP testing (alternative to direct API calls)

---

## Project Structure for Tests

```
/__tests__
  /unit
    /lib
      /auth
        password.test.ts
        jwt.test.ts
      /utils
        validation.test.ts
        format.test.ts
    /components
      button.test.tsx
      simulation-chat.test.tsx
  
  /integration
    /api
      /auth
        register.test.ts
        login.test.ts
        refresh.test.ts
      /simulations
        simulations.test.ts
      /conversations
        conversations.test.ts
    /database
      tenant-isolation.test.ts
      migrations.test.ts
  
  /e2e
    onboarding.spec.ts
    simulation.spec.ts
    lead-conversation.spec.ts
    dashboard.spec.ts
  
  /fixtures
    users.ts
    tenants.ts
    conversations.ts
  
  /helpers
    db-setup.ts
    api-client.ts
    auth-helpers.ts

vitest.config.ts
playwright.config.ts
```

---

## Unit Tests

### 1. Testing Utilities

```typescript
// __tests__/unit/lib/auth/password.test.ts
import { describe, it, expect } from 'vitest';
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
  
  it('should generate different hashes for same password', async () => {
    const password = 'TestPass123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    
    expect(hash1).not.toBe(hash2);
  });
});
```

---

### 2. Testing JWT

```typescript
// __tests__/unit/lib/auth/jwt.test.ts
import { describe, it, expect } from 'vitest';
import { generateAccessToken, verifyAccessToken } from '@/lib/auth/jwt';
import { User } from '@prisma/client';

describe('JWT Token Management', () => {
  const mockUser: User = {
    id: 'test-user-id',
    tenantId: 'test-tenant-id',
    email: 'test@example.com',
    role: 'OWNER',
    name: 'Test User',
    password: 'hashed',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };
  
  it('should generate valid access token', () => {
    const token = generateAccessToken(mockUser);
    
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });
  
  it('should verify valid token', () => {
    const token = generateAccessToken(mockUser);
    const payload = verifyAccessToken(token);
    
    expect(payload.userId).toBe(mockUser.id);
    expect(payload.tenantId).toBe(mockUser.tenantId);
    expect(payload.email).toBe(mockUser.email);
    expect(payload.role).toBe(mockUser.role);
  });
  
  it('should reject invalid token', () => {
    expect(() => {
      verifyAccessToken('invalid-token');
    }).toThrow();
  });
  
  it('should reject expired token', async () => {
    // Mock token with immediate expiry
    const expiredToken = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '0s' }
    );
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(() => {
      verifyAccessToken(expiredToken);
    }).toThrow();
  });
});
```

---

### 3. Testing Validation

```typescript
// __tests__/unit/lib/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { registerSchema } from '@/lib/validation/auth';

describe('Registration Validation', () => {
  it('should accept valid registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'John Doe',
      businessName: 'Test Business',
    };
    
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'TestPass123!',
      name: 'John Doe',
      businessName: 'Test Business',
    };
    
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
  
  it('should reject weak password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'weak',
      name: 'John Doe',
      businessName: 'Test Business',
    };
    
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
  
  it('should require name', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'TestPass123!',
      businessName: 'Test Business',
    };
    
    const result = registerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

---

## Integration Tests

### Test Database Setup

```typescript
// __tests__/helpers/db-setup.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export async function setupTestDatabase() {
  // Run migrations
  execSync('npx prisma migrate deploy');
  
  // Clear all data
  await prisma.apiUsage.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.conversationMetrics.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.conversationMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.simulationMessage.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
}

export async function teardownTestDatabase() {
  await prisma.$disconnect();
}

export { prisma };
```

---

### API Endpoint Tests

```typescript
// __tests__/integration/api/auth/register.test.ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, prisma } from '@/tests/helpers/db-setup';

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  it('should register new user successfully', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        businessName: 'New Business',
        industry: 'Consulting',
      }),
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe('newuser@example.com');
    expect(data.data.token).toBeTruthy();
    
    // Verify user in database
    const user = await prisma.user.findUnique({
      where: { email: 'newuser@example.com' },
    });
    expect(user).toBeTruthy();
    
    // Verify tenant created
    const tenant = await prisma.tenant.findUnique({
      where: { id: user!.tenantId },
    });
    expect(tenant?.businessName).toBe('New Business');
  });
  
  it('should reject duplicate email', async () => {
    // Create existing user
    await prisma.tenant.create({
      data: {
        businessName: 'Existing Business',
        users: {
          create: {
            email: 'existing@example.com',
            password: 'hash',
            name: 'Existing User',
          },
        },
      },
    });
    
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        businessName: 'New Business',
      }),
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('EMAIL_EXISTS');
  });
  
  it('should reject invalid data', async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'weak',
        name: 'A',
      }),
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

### Tenant Isolation Tests

```typescript
// __tests__/integration/database/tenant-isolation.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestDatabase, prisma } from '@/tests/helpers/db-setup';

describe('Tenant Isolation', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  
  beforeEach(async () => {
    await setupTestDatabase();
    
    // Create two tenants
    const tenant1 = await prisma.tenant.create({
      data: {
        businessName: 'Tenant 1',
        users: {
          create: {
            email: 'tenant1@example.com',
            password: 'hash',
            name: 'Tenant 1 User',
          },
        },
      },
    });
    
    const tenant2 = await prisma.tenant.create({
      data: {
        businessName: 'Tenant 2',
        users: {
          create: {
            email: 'tenant2@example.com',
            password: 'hash',
            name: 'Tenant 2 User',
          },
        },
      },
    });
    
    tenant1Id = tenant1.id;
    tenant2Id = tenant2.id;
  });
  
  it('should not access other tenant conversations', async () => {
    // Create conversation for tenant1
    await prisma.conversation.create({
      data: {
        tenantId: tenant1Id,
        sessionId: 'session-1',
        status: 'ACTIVE',
        qualificationStatus: 'UNKNOWN',
      },
    });
    
    // Try to fetch as tenant2
    const conversations = await prisma.conversation.findMany({
      where: { tenantId: tenant2Id },
    });
    
    expect(conversations.length).toBe(0);
  });
  
  it('should isolate simulations between tenants', async () => {
    // Create simulation for tenant1
    await prisma.simulation.create({
      data: {
        tenantId: tenant1Id,
        scenarioType: 'PRICE_SENSITIVE',
        status: 'IN_PROGRESS',
        aiPersona: { clientType: 'test' },
      },
    });
    
    // Count simulations for tenant2
    const count = await prisma.simulation.count({
      where: { tenantId: tenant2Id },
    });
    
    expect(count).toBe(0);
  });
  
  it('should prevent cross-tenant lead access', async () => {
    // Create lead for tenant1
    await prisma.lead.create({
      data: {
        tenantId: tenant1Id,
        status: 'NEW',
        firstContactAt: new Date(),
        lastContactAt: new Date(),
      },
    });
    
    // Attempt to access from tenant2
    const leads = await prisma.lead.findMany({
      where: { tenantId: tenant2Id },
    });
    
    expect(leads.length).toBe(0);
  });
});
```

---

## E2E Tests (Playwright)

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### E2E Test Examples

```typescript
// __tests__/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Onboarding Flow', () => {
  test('should complete registration and onboarding', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="businessName"]', 'Doe Consulting');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show welcome message or onboarding prompt
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
  
  test('should start simulation training', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    // Navigate to simulations
    await page.click('a[href="/simulations"]');
    await page.click('text=Start New Simulation');
    
    // Select scenario
    await page.click('text=Price-Sensitive Client');
    await page.click('button:has-text("Start Simulation")');
    
    // Should see simulation chat
    await expect(page.locator('[data-testid="simulation-chat"]')).toBeVisible();
    
    // AI should send first message
    await expect(page.locator('.message.ai-client')).toBeVisible();
    
    // Send response
    await page.fill('textarea[placeholder*="response"]', 'Hello! How can I help you today?');
    await page.click('button:has-text("Send")');
    
    // Should see user message
    await expect(page.locator('.message.business-owner')).toContainText('Hello! How can I help you today?');
    
    // AI should respond
    await expect(page.locator('.message.ai-client').nth(1)).toBeVisible({ timeout: 10000 });
  });
});
```

---

```typescript
// __tests__/e2e/lead-conversation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Widget Lead Conversation', () => {
  test('should handle lead conversation in widget', async ({ page, context }) => {
    // Open widget page (simulating embed)
    await page.goto('/widget/test-api-key');
    
    // Widget button should be visible
    await expect(page.locator('button[aria-label="Open chat"]')).toBeVisible();
    
    // Click to open chat
    await page.click('button[aria-label="Open chat"]');
    
    // Should show greeting
    await expect(page.locator('text=How can I help you today?')).toBeVisible();
    
    // Send message as lead
    await page.fill('textarea', "I'm interested in your consulting services");
    await page.click('button:has-text("Send")');
    
    // Should see lead message
    await expect(page.locator('.message.lead')).toContainText('interested in your consulting');
    
    // AI should respond
    await expect(page.locator('.message.ai').first()).toBeVisible({ timeout: 5000 });
    
    // Continue conversation
    await page.fill('textarea', 'What is your pricing?');
    await page.click('button:has-text("Send")');
    
    // AI should ask qualifying questions
    await expect(page.locator('.message.ai').nth(1)).toBeVisible({ timeout: 5000 });
    
    // Provide budget
    await page.fill('textarea', 'I have a budget of $15,000');
    await page.click('button:has-text("Send")');
    
    // Should eventually ask for contact info (qualified lead)
    await page.waitForSelector('text=email', { timeout: 10000 });
    
    // Provide email
    await page.fill('input[type="email"]', 'lead@example.com');
    await page.click('button:has-text("Submit")');
    
    // Should show confirmation
    await expect(page.locator('text=Thank you')).toBeVisible();
  });
});
```

---

## Test Fixtures

```typescript
// __tests__/fixtures/users.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/tests/helpers/db-setup';
import { hashPassword } from '@/lib/auth/password';

export async function createTestTenant(overrides = {}) {
  return prisma.tenant.create({
    data: {
      businessName: faker.company.name(),
      industry: faker.commerce.department(),
      subscriptionTier: 'TRIAL',
      subscriptionStatus: 'ACTIVE',
      ...overrides,
    },
  });
}

export async function createTestUser(tenantId: string, overrides = {}) {
  return prisma.user.create({
    data: {
      tenantId,
      email: faker.internet.email(),
      password: await hashPassword('TestPass123!'),
      name: faker.person.fullName(),
      role: 'OWNER',
      emailVerified: true,
      ...overrides,
    },
  });
}

export async function createTestConversation(tenantId: string, overrides = {}) {
  return prisma.conversation.create({
    data: {
      tenantId,
      sessionId: faker.string.uuid(),
      status: 'ACTIVE',
      qualificationStatus: 'UNKNOWN',
      ...overrides,
    },
  });
}
```

---

## Running Tests

### Package Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

### CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          
      - name: Run unit tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Coverage Goals

### Critical Paths (90%+ coverage)
- Authentication (register, login, token refresh)
- Tenant isolation
- AI conversation logic
- Lead qualification scoring
- Pattern extraction

### Important Features (70%+ coverage)
- Dashboard analytics
- Conversation management
- Simulation system
- Settings and configuration

### Nice-to-Have (50%+ coverage)
- UI components
- Formatting utilities
- Email templates

---

## Manual Testing Checklist

Before each release:

### Functional Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] Simulation training completes
- [ ] Pattern extraction produces valid profile
- [ ] Widget loads on external site
- [ ] Lead conversations qualify correctly
- [ ] Email notifications send
- [ ] Dashboard shows accurate metrics
- [ ] Settings save correctly

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Testing
- [ ] Widget works on iOS Safari
- [ ] Widget works on Android Chrome
- [ ] Dashboard responsive on tablets

### Performance Testing
- [ ] Page load <2s
- [ ] API response <500ms
- [ ] Widget loads <1s
- [ ] No memory leaks in long sessions

---

**Next Steps:**
1. Set up testing infrastructure
2. Write unit tests for critical functions
3. Create integration tests for APIs
4. Build E2E test suite
5. Integrate into CI/CD
6. Monitor coverage metrics
7. Add tests as bugs are found

---

**Document Status**: Complete - Ready for Implementation
**Last Updated**: March 2026
