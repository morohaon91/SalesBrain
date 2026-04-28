import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
  var currentTenantId: string | undefined;
}

const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : process.env.PRISMA_LOG_QUERIES === "1"
      ? ["query", "error", "warn"]
      : ["error"];

// Pin on global in all environments so Next.js dev HMR and serverless-style isolates reuse one client.
export const prisma = global.prisma ?? new PrismaClient({ log: logLevels });

global.prisma = prisma;

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
