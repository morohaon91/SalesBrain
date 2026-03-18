import { withPlatformAdmin } from "@/lib/auth/platform-admin-middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = withPlatformAdmin(async (req) => {
  const [
    totalTenants,
    activeTenants,
    totalUsers,
    totalConversations,
    totalLeads,
    qualifiedLeads,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: "ACTIVE" } }),
    prisma.user.count(),
    prisma.conversation.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { qualificationScore: { gte: 70 } } }),
  ]);

  // AI costs last 30 days
  const aiCosts = await prisma.apiUsage.aggregate({
    _sum: { cost: true },
    _count: true,
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Revenue estimate (simplified)
  const revenue = await prisma.tenant.groupBy({
    by: ["subscriptionTier"],
    _count: true,
    where: { subscriptionStatus: "ACTIVE" },
  });

  return NextResponse.json({
    success: true,
    data: {
      tenants: {
        total: totalTenants,
        active: activeTenants,
      },
      users: totalUsers,
      conversations: totalConversations,
      leads: {
        total: totalLeads,
        qualified: qualifiedLeads,
      },
      ai: {
        totalCost30Days: aiCosts._sum.cost || 0,
        totalCalls30Days: aiCosts._count,
      },
      revenue: revenue.map((r) => ({
        tier: r.subscriptionTier,
        count: r._count,
      })),
    },
  });
});
