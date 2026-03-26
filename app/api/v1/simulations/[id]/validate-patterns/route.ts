import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const validateSchema = z.object({
  action: z.enum(['approve', 'partial', 'reject']),
  approvedSections: z.array(z.string()).optional(),
});

async function handler(req: AuthenticatedRequest) {
  const simulationId = req.nextUrl.pathname.split('/')[4];
  const { tenantId } = req.auth;

  const body = await req.json();
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } }, { status: 400 });
  }

  const { action, approvedSections } = parsed.data;

  const simulation = await prisma.simulation.findUnique({
    where: { id: simulationId, tenantId },
  });

  if (!simulation) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Simulation not found' } }, { status: 404 });
  }

  const statusMap: Record<string, string> = {
    approve: 'APPROVED',
    partial: 'PARTIAL',
    reject: 'REJECTED',
  };

  await prisma.simulation.update({
    where: { id: simulationId },
    data: {
      ownerApprovalStatus: statusMap[action] as any,
      ownerReviewedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    action,
    simulationId,
    approvedSections: approvedSections ?? [],
  });
}

export const POST = withAuth(handler);
