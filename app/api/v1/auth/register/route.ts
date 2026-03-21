import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { getIndustryTemplate } from "@/lib/templates";
import { v4 as uuidv4 } from "uuid";

/**
 * Request body validation schema
 */
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200),
  industry: z.string().optional(),
});

type RegisterRequest = z.infer<typeof registerSchema>;

/**
 * Response type
 */
interface RegisterResponse {
  success: boolean;
  data?: {
    userId: string;
    tenantId: string;
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
 * POST /api/v1/auth/register
 * Register new business owner (creates tenant + user in transaction)
 */
export async function POST(req: NextRequest): Promise<NextResponse<RegisterResponse>> {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    const body = await req.json();

    // Validate request body
    const validation = registerSchema.safeParse(body);
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

    const data = validation.data as RegisterRequest;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email already registered",
            details: [
              {
                field: "email",
                message: "This email is already in use",
              },
            ],
          },
          meta: { timestamp, requestId },
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create tenant and user in transaction
    const tenantId = uuidv4();
    const userId = uuidv4();

    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          id: tenantId,
          businessName: data.businessName,
          industry: data.industry || "",
          subscriptionTier: "TRIAL",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          widgetEnabled: false,
          widgetApiKey: uuidv4(),
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          id: userId,
          email: data.email,
          password: hashedPassword,
          name: data.name,
          tenantId: tenantId,
          role: "OWNER",
        },
      });

      // Get industry template to seed profile
      const template = getIndustryTemplate(data.industry);

      // Create business profile seeded with template
      await tx.businessProfile.create({
        data: {
          id: uuidv4(),
          tenantId: tenantId,
          isComplete: false,
          completionScore: 0,

          // Template fields
          industry: data.industry || null,
          serviceDescription: template?.serviceDescription || null,
          targetClientType: template?.targetClientType || null,
          typicalBudgetRange: template?.typicalBudgetRange || null,
          commonClientQuestions: template?.commonClientQuestions || [],
          completionPercentage: template ? 20 : 0,
        },
      });

      return { tenant, user };
    });

    // Generate tokens
    const accessToken = generateAccessToken(result.user);
    const refreshToken = generateRefreshToken(result.user);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          userId: result.user.id,
          tenantId: result.tenant.id,
          email: result.user.email,
          token: accessToken,
          refreshToken,
        },
        meta: { timestamp, requestId },
      },
      { status: 201 }
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
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Registration failed. Please try again.",
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}
