import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { v4 as uuidv4 } from "uuid";

/**
 * Response type
 */
interface RefreshResponse {
  success: boolean;
  data?: {
    token: string;
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
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token from HTTP-only cookie
 */
export async function POST(req: NextRequest): Promise<NextResponse<RefreshResponse>> {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No refresh token provided",
          },
          meta: { timestamp, requestId },
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired refresh token",
          },
          meta: { timestamp, requestId },
        },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User not found",
          },
          meta: { timestamp, requestId },
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    // Optionally generate new refresh token for sliding window
    const newRefreshToken = generateRefreshToken(user);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          token: newAccessToken,
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );

    // Optionally update refresh token cookie (sliding window)
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Token refresh failed. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}
