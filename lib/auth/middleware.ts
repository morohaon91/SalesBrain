import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload, extractTokenFromHeader } from "./jwt";

/**
 * Extended NextRequest with authentication context
 * Contains decoded JWT payload and user information
 */
export interface AuthenticatedRequest extends NextRequest {
  auth: TokenPayload;
}

/**
 * Standard error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Create unauthorized error response
 */
function unauthorizedError(message: string = "Invalid or missing token"): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message,
      },
    },
    { status: 401 }
  );
}

/**
 * Create forbidden error response
 */
function forbiddenError(message: string = "Insufficient permissions"): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "FORBIDDEN",
        message,
      },
    },
    { status: 403 }
  );
}

/**
 * Middleware to require authentication
 * Verifies JWT token from Authorization header and attaches user context to request
 *
 * Usage:
 * export const GET = withAuth(async (req: AuthenticatedRequest) => {
 *   const { userId, tenantId } = req.auth;
 *   // Handle authenticated request
 * });
 *
 * @param handler - Request handler function
 * @returns NextResponse with either authenticated request or error
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get Authorization header
      const authHeader = req.headers.get("authorization");
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return unauthorizedError("No token provided");
      }

      // Verify token
      const payload = verifyAccessToken(token);

      // Attach auth payload to request
      (req as AuthenticatedRequest).auth = payload;

      // Call handler with authenticated request
      return handler(req as AuthenticatedRequest);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("expired")) {
          // Expected — client will refresh and retry. Not an error condition.
          return unauthorizedError("Token expired");
        } else if (error.message.includes("Invalid")) {
          console.warn("Auth: invalid token presented");
          return unauthorizedError("Invalid token");
        }
      }

      console.error("Authentication error:", error);
      return unauthorizedError("Authentication failed");
    }
  };
}

/**
 * Middleware to require specific role(s)
 * Extends withAuth to also check user role
 *
 * Usage:
 * export const POST = withRole("OWNER", async (req: AuthenticatedRequest) => {
 *   // Only OWNER can access
 * });
 *
 * export const DELETE = withRole(["OWNER", "ADMIN"], async (req: AuthenticatedRequest) => {
 *   // OWNER or ADMIN can access
 * });
 *
 * @param allowedRoles - Single role string or array of allowed roles
 * @returns Middleware function
 */
export function withRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      // Check if user's role is in allowed roles
      if (!roles.includes(req.auth.role)) {
        return forbiddenError(
          `Insufficient permissions. Required role(s): ${roles.join(", ")}`
        );
      }

      return handler(req);
    });
  };
}

/**
 * Middleware to require specific tenant
 * Ensures user can only access their own tenant's data
 *
 * Usage:
 * export const GET = withTenant(async (req: AuthenticatedRequest) => {
 *   const { tenantId } = req.auth;
 *   // Fetch data for tenant
 * });
 *
 * @param handler - Request handler function
 * @returns NextResponse with tenant-scoped request
 */
export function withTenant(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    // Verify that URL tenant param matches authenticated tenant
    // This is optional but recommended for extra security
    const params = req.nextUrl.pathname.match(/\/tenants\/([^/]+)/);
    if (params && params[1] !== req.auth.tenantId) {
      return forbiddenError("Cannot access other tenant's data");
    }

    return handler(req);
  });
}

/**
 * Combine multiple middleware functions
 * Useful when requiring both auth and specific role/tenant
 *
 * Usage:
 * export const POST = pipe(
 *   withAuth,
 *   withRole("OWNER"),
 *   withTenant
 * )(handler);
 *
 * @param middlewares - Array of middleware functions
 * @returns Combined middleware function
 */
export function pipe(...middlewares: any[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Get authentication context from request
 * Safe to call even if not authenticated - returns null
 *
 * @param req - Request object
 * @returns TokenPayload | null
 */
export function getAuth(req: NextRequest): TokenPayload | null {
  try {
    const authReq = req as AuthenticatedRequest;
    return authReq.auth || null;
  } catch {
    return null;
  }
}

/**
 * Check if request is authenticated
 * @param req - Request object
 * @returns boolean
 */
export function isAuthenticated(req: NextRequest): boolean {
  return getAuth(req) !== null;
}

/**
 * Check if user has specific role
 * @param req - Request object
 * @param role - Role to check
 * @returns boolean
 */
export function hasRole(req: AuthenticatedRequest, role: string): boolean {
  return req.auth?.role === role;
}

/**
 * Check if user has one of multiple roles
 * @param req - Request object
 * @param roles - Array of roles to check
 * @returns boolean
 */
export function hasAnyRole(req: AuthenticatedRequest, roles: string[]): boolean {
  return roles.includes(req.auth?.role || "");
}

/**
 * Check if user is owner of tenant
 * @param req - Request object
 * @param tenantId - Tenant ID to check
 * @returns boolean
 */
export function isTenantOwner(req: AuthenticatedRequest, tenantId: string): boolean {
  return req.auth?.tenantId === tenantId && hasRole(req, "OWNER");
}

/**
 * Extract tenant ID from authenticated request
 * @param req - Request object
 * @returns string | null
 */
export function getTenantId(req: AuthenticatedRequest): string | null {
  return req.auth?.tenantId || null;
}

/**
 * Extract user ID from authenticated request
 * @param req - Request object
 * @returns string | null
 */
export function getUserId(req: AuthenticatedRequest): string | null {
  return req.auth?.userId || null;
}
