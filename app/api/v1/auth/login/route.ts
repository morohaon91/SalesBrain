import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { v4 as uuidv4 } from "uuid";

/**
 * Request body validation schema
 */
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginRequest = z.infer<typeof loginSchema>;

/**
 * Response type
 */
interface LoginResponse {
  success: boolean;
  data?: {
    userId: string;
    tenantId: string;
    name: string;
    email: string;
    token: string;
    refreshToken?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * POST /api/v1/auth/login
 * Login existing user with email and password
 */
export async function POST(req: NextRequest): Promise<NextResponse<LoginResponse>> {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    const body = await req.json();

    // Validate request body
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((issue) => ({
        field: String(issue.path[0]),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details,
          },
          meta: { timestamp, requestId },
        },
        { status: 400 }
      );
    }

    const data = validation.data as LoginRequest;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { tenant: true },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          },
          meta: { timestamp, requestId },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(data.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          },
          meta: { timestamp, requestId },
        },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          tenantId: user.tenantId,
          name: user.name,
          email: user.email,
          token: accessToken,
          refreshToken,
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );

    // Set refresh token as HTTP-only cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Login failed. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}
