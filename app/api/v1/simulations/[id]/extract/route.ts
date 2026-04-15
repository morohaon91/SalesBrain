/**
 * POST /api/v1/simulations/[id]/extract
 * Synchronously extract patterns from a completed simulation.
 * (The /complete route triggers this asynchronously; this endpoint is for
 * on-demand / manual re-runs from the UI.)
 */

import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { extractPatternsFromSimulation } from '@/lib/extraction/extraction-engine';
import { v4 as uuidv4 } from 'uuid';

async function handler(req: AuthenticatedRequest) {
  const simulationId = req.nextUrl.pathname.split('/')[4];
  const { tenantId } = req.auth;
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    const simulation = await prisma.simulation.findUnique({
      where: { id: simulationId, tenantId },
      include: { messages: true },
    });

    if (!simulation) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'SIMULATION_NOT_FOUND', message: 'Simulation not found' },
          meta: { timestamp, requestId },
        },
        { status: 404 }
      );
    }

    if (simulation.status !== 'COMPLETED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SIMULATION_NOT_COMPLETED',
            message: 'Can only extract patterns from completed simulations',
          },
          meta: { timestamp, requestId },
        },
        { status: 400 }
      );
    }

    if (simulation.messages.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_MESSAGES',
            message: 'Need at least 4 messages to extract patterns',
          },
          meta: { timestamp, requestId },
        },
        { status: 400 }
      );
    }

    const result = await extractPatternsFromSimulation(simulationId);

    const profile = await prisma.businessProfile.findUnique({ where: { tenantId } });

    return NextResponse.json(
      {
        success: true,
        data: {
          extractedPatterns: result.extracted,
          quality: result.quality,
          confidence: result.confidence,
          completionPercentage: profile?.completionPercentage ?? 0,
          simulationCount: profile?.simulationCount ?? 0,
        },
        meta: { timestamp, requestId },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Pattern extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXTRACTION_FAILED',
          message: error.message || 'Failed to extract patterns',
        },
        meta: { timestamp, requestId },
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
