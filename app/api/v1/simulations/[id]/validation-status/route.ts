import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

async function handler(req: AuthenticatedRequest) {
  const simulationId = req.nextUrl.pathname.split('/')[4];
  const { tenantId } = req.auth;

  const simulation = await prisma.simulation.findUnique({
    where: { id: simulationId, tenantId },
    select: {
      id: true,
      ownerApprovalStatus: true,
      extractedPatterns: true,
      qualityScore: true,
      demonstratedPatterns: true,
      liveScore: true,
    },
  });

  if (!simulation) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Simulation not found' } }, { status: 404 });
  }

  const statusMap: Record<string, string> = {
    PENDING: 'extracting',
    EXTRACTED: 'ready',
    APPROVED: 'approved',
    PARTIAL: 'partial',
    REJECTED: 'failed',
  };

  return NextResponse.json({
    success: true,
    status: statusMap[simulation.ownerApprovalStatus] ?? 'extracting',
    rawStatus: simulation.ownerApprovalStatus,
    hasPatterns: !!simulation.extractedPatterns,
    extractedPatterns: simulation.extractedPatterns,
    demonstratedPatterns: simulation.demonstratedPatterns,
    qualityScore: simulation.qualityScore,
    liveScore: simulation.liveScore,
  });
}

export const GET = withAuth(handler);
