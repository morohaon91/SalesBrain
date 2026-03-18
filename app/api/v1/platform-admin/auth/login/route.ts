import { NextRequest, NextResponse } from "next/server";
import { loginPlatformAdmin } from "@/lib/auth/platform-admin";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const result = await loginPlatformAdmin(data.email, data.password);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "LOGIN_FAILED",
          message: error.message || "Invalid credentials",
        },
      },
      { status: 401 }
    );
  }
}
