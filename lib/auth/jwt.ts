import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

/**
 * JWT Token Payload Interface
 * Contains user information encoded in the token
 */
export interface TokenPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

// JWT Secrets from environment variables
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

// Token Expiry Times
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

/**
 * Validate that required secrets are set
 */
function validateSecrets(): void {
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("JWT_ACCESS_SECRET environment variable is not set");
  }
  if (!REFRESH_TOKEN_SECRET) {
    throw new Error("JWT_REFRESH_SECRET environment variable is not set");
  }
}

/**
 * Generate a short-lived access token (15 minutes)
 * Used for API request authentication
 * @param user - User object from database
 * @returns string - Signed JWT token
 */
export function generateAccessToken(user: User): string {
  validateSecrets();

  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Generate a long-lived refresh token (7 days)
 * Stored in HTTP-only cookie for token refresh flow
 * @param user - User object from database
 * @returns string - Signed JWT token
 */
export function generateRefreshToken(user: User): string {
  validateSecrets();

  const payload: TokenPayload = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Verify and decode an access token
 * @param token - JWT token to verify
 * @returns TokenPayload - Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): TokenPayload {
  validateSecrets();

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      algorithms: ["HS256"],
    }) as TokenPayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    }
    throw error;
  }
}

/**
 * Verify and decode a refresh token
 * @param token - JWT token to verify
 * @returns TokenPayload - Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): TokenPayload {
  validateSecrets();

  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
    }) as TokenPayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
}

/**
 * Extract token from Authorization header
 * Expected format: "Bearer <token>"
 * @param authHeader - Authorization header value
 * @returns string | null - Token if present and valid format, null otherwise
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Check if token is expired (without throwing error)
 * @param token - JWT token to check
 * @returns boolean - True if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded || !decoded.exp) {
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Get time until token expires in seconds
 * @param token - JWT token
 * @returns number | null - Seconds until expiry, null if invalid or expired
 */
export function getTokenTimeToExpiry(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded || !decoded.exp) {
      return null;
    }

    const secondsUntilExpiry = decoded.exp - Math.floor(Date.now() / 1000);
    return Math.max(0, secondsUntilExpiry);
  } catch {
    return null;
  }
}
