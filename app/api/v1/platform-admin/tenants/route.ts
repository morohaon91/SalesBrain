import {
  PlatformAdminRequest,
  requirePermission,
} from "@/lib/auth/platform-admin-middleware";
import { prisma } from "@/lib/prisma";
import { logPlatformAdminAction } from "@/lib/auth/platform-admin";
import { NextResponse } from "next/server";

async function handler(req: PlatformAdminRequest) {
  const tenants = await prisma.tenant.findMany({
    include: {
      users: {
        select: { id: true, email: true, name: true, role: true },
      },
      _count: {
        select: {
          conversations: true,
          leads: true,
          simulations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Log the action
  await logPlatformAdminAction(
    req.platformAdmin.adminId,
    "VIEWED_ALL_TENANTS",
    { count: tenants.length }
  );

  return NextResponse.json({
    success: true,
    data: tenants,
  });
}

export const GET = requirePermission("canViewAllTenants")(handler);
