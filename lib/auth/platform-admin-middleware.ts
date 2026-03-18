import { NextRequest, NextResponse } from "next/server";
import { verifyPlatformAdminToken } from "./platform-admin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface PlatformAdminRequest extends NextRequest {
  platformAdmin: {
    adminId: string;
    email: string;
    role: string;
    permissions: any;
  };
}

export function withPlatformAdmin(
  handler: (req: PlatformAdminRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // Get token
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED" } },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Verify token
      const payload = verifyPlatformAdminToken(token);

      // Get admin from database (to check active status)
      const admin = await prisma.platformAdmin.findUnique({
        where: { id: payload.adminId },
        select: {
          id: true,
          email: true,
          role: true,
          permissions: true,
          isActive: true,
        },
      });

      if (!admin || !admin.isActive) {
        return NextResponse.json(
          { success: false, error: { code: "ADMIN_DEACTIVATED" } },
          { status: 403 }
        );
      }

      // Attach admin to request
      (req as PlatformAdminRequest).platformAdmin = {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions as any,
      };

      return handler(req as PlatformAdminRequest);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }
  };
}

// Permission-based authorization
export function requirePermission(permission: string) {
  return (handler: (req: PlatformAdminRequest) => Promise<NextResponse>) => {
    return withPlatformAdmin(async (req: PlatformAdminRequest) => {
      const perms = req.platformAdmin.permissions as any;

      if (!perms[permission]) {
        return NextResponse.json(
          { success: false, error: { code: "INSUFFICIENT_PERMISSIONS" } },
          { status: 403 }
        );
      }

      return handler(req);
    });
  };
}
