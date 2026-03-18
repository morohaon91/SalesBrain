import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Response type
 */
interface ProfileResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    createdAt: string;
  };
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * Handler function
 */
async function handler(req: AuthenticatedRequest): Promise<NextResponse<ProfileResponse>> {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // Get user ID from authenticated request
    const userId = req.auth.userId;
    const tenantId = req.auth.tenantId;

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User not found",
          },
          meta: { timestamp, requestId },
        },
        { status: 404 }
      );
    }

    // Verify tenant isolation (optional but recommended)
    if (user.tenantId !== tenantId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cannot access other user profiles",
          },
          meta: { timestamp, requestId },
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          createdAt: user.createdAt.toISOString(),
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch profile. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/user/profile
 * Get current user profile (protected with withAuth)
 */
export const GET = withAuth(handler);
