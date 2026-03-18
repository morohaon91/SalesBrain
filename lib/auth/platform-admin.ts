import { PrismaClient } from "@prisma/client";
import { verifyPassword, hashPassword } from "./password";
import { sign, verify } from "jsonwebtoken";

const prisma = new PrismaClient();

interface PlatformAdminTokenPayload {
  adminId: string;
  email: string;
  role: string;
  type: "platform_admin";
}

const PLATFORM_ADMIN_SECRET = process.env.JWT_PLATFORM_ADMIN_SECRET!;
const ACCESS_TOKEN_EXPIRY = "8h";

export async function loginPlatformAdmin(
  email: string,
  password: string
) {
  // Find admin
  const admin = await prisma.platformAdmin.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  if (!admin.isActive) {
    throw new Error("Account is deactivated");
  }

  // Verify password
  const isValid = await verifyPassword(password, admin.password);

  if (!isValid) {
    // Log failed attempt
    await prisma.platformAuditLog.create({
      data: {
        adminId: admin.id,
        action: "FAILED_LOGIN",
        description: "Invalid password attempt",
        metadata: { email },
      },
    });

    throw new Error("Invalid credentials");
  }

  // Update last login
  await prisma.platformAdmin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  // Log successful login
  await prisma.platformAuditLog.create({
    data: {
      adminId: admin.id,
      action: "LOGGED_IN",
      description: "Platform admin logged in",
    },
  });

  // Generate token
  const token = generatePlatformAdminToken(admin);

  return {
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    },
    token,
  };
}

export function generatePlatformAdminToken(admin: any): string {
  const payload: PlatformAdminTokenPayload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
    type: "platform_admin",
  };

  return sign(payload, PLATFORM_ADMIN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function verifyPlatformAdminToken(
  token: string
): PlatformAdminTokenPayload {
  try {
    const payload = verify(token, PLATFORM_ADMIN_SECRET) as PlatformAdminTokenPayload;

    if (payload.type !== "platform_admin") {
      throw new Error("Invalid token type");
    }

    return payload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Audit logging helper
export async function logPlatformAdminAction(
  adminId: string,
  action: string,
  metadata?: any
) {
  await prisma.platformAuditLog.create({
    data: {
      adminId,
      action: action as any,
      description: `Admin performed: ${action}`,
      metadata: metadata || {},
    },
  });
}
