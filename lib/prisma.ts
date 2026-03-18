import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
  var currentTenantId: string | undefined;
}

// Create base Prisma client
const baseClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export const prisma =
  global.prisma || baseClient;

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;

/**
 * Helper to set current tenant context
 * Call this in API routes to ensure tenant isolation
 */
export function setTenantContext(tenantId: string) {
  global.currentTenantId = tenantId;
}

/**
 * Helper to clear tenant context
 */
export function clearTenantContext() {
  global.currentTenantId = undefined;
}
