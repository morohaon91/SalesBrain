import {
  PlatformAdminRequest,
  requirePermission,
} from "@/lib/auth/platform-admin-middleware";
import { prisma } from "@/lib/prisma";
import { logPlatformAdminAction } from "@/lib/auth/platform-admin";
import { NextResponse } from "next/server";
import { parsePagination } from "@/lib/pagination";

async function handler(req: PlatformAdminRequest) {
  const { page, pageSize } = parsePagination(req.nextUrl.searchParams, {
    defaultPageSize: 25,
    maxPageSize: 100,
  });

  const [total, tenants] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.findMany({
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  await logPlatformAdminAction(req.platformAdmin.adminId, "VIEWED_ALL_TENANTS", {
    count: total,
    page,
    pageSize,
  });

  return NextResponse.json({
    success: true,
    data: tenants,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}

export const GET = requirePermission("canViewAllTenants")(handler);
