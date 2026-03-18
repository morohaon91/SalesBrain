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

// Add tenant isolation middleware
// This ensures all queries are automatically filtered by tenantId
baseClient.$use(async (params, next) => {
  // Skip middleware for certain models that don't have tenantId
  const skipTenantFiltering = [
    "User",
    "Tenant",
    "ApiKey",
    "AuditLog",
  ];

  if (
    skipTenantFiltering.includes(params.model || "") ||
    params.action === "create"
  ) {
    return next(params);
  }

  // For read/update/delete operations, add tenantId filter
  if (
    ["findFirst", "findMany", "findUnique", "update", "delete"].includes(
      params.action
    )
  ) {
    const tenantId = global.currentTenantId;

    if (tenantId && params.model !== "User" && params.model !== "Tenant") {
      // Add tenantId to where clause
      if (params.args.where === undefined) {
        params.args.where = {};
      }

      params.args.where.tenantId = tenantId;
    }
  }

  return next(params);
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
