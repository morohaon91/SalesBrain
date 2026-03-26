/**
 * Pattern Validation Endpoints (Phase 4)
 * POST /api/v1/profile/validate - Get pending patterns for owner review
 * POST /api/v1/profile/approve - Approve specific pattern field
 * POST /api/v1/profile/approve-all - Approve all extracted patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/profile/validate
 * Retrieve patterns pending owner validation
 */
async function handleGetValidation(req: AuthenticatedRequest) {
  try {
    const { tenantId } = req.auth;

    // Get user's business profile
    const profile = await prisma.businessProfile.findFirst({
      where: { tenantId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if patterns are pending validation
    // Patterns are "pending" if extracted but not yet validated
    const recentExtraction = await prisma.simulation.findFirst({
      where: {
        tenantId,
        extractedPatterns: { not: null },
        status: 'COMPLETED',
        validatedAt: null // Not yet validated
      },
      orderBy: { completedAt: 'desc' }
    });

    if (!recentExtraction?.extractedPatterns) {
      return NextResponse.json(
        { data: null },
        { status: 200 }
      );
    }

    // Return patterns with last simulation info
    return NextResponse.json({
      success: true,
      data: {
        ...(recentExtraction.extractedPatterns as any),
        simulationId: recentExtraction.id,
        scenarioType: recentExtraction.scenarioType
      }
    });
  } catch (error) {
    console.error('Validation retrieval failed:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve patterns' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/profile/validate/approve
 * Approve a specific pattern field
 */
async function handleApprovePattern(req: AuthenticatedRequest) {
  try {
    const { tenantId } = req.auth;
    const { field, value } = await req.json();

    // Get user's profile
    const profile = await prisma.businessProfile.findFirst({
      where: { tenantId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update the specific field in the profile
    // This marks it as approved (not pending validation)
    const updateData: Record<string, any> = {};
    const fieldPath = field.split('.');

    if (fieldPath.length === 1) {
      // Top-level field
      updateData[fieldPath[0]] = value;
    } else {
      // Nested field - e.g., "qualificationCriteria.dealBreakers"
      const [parent, child] = fieldPath;
      const parentData = (profile as any)[parent] || {};
      updateData[parent] = {
        ...parentData,
        [child]: value
      };
    }

    const updated = await prisma.businessProfile.update({
      where: { id: profile.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Pattern approval failed:', error);
    return NextResponse.json(
      { error: 'Failed to approve pattern' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/profile/validate/reject
 * Reject/remove a specific pattern
 */
async function handleRejectPattern(req: AuthenticatedRequest) {
  try {
    const { tenantId } = req.auth;
    const { field } = await req.json();

    const profile = await prisma.businessProfile.findFirst({
      where: { tenantId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Remove the specific pattern element
    // e.g., "dealBreakers.2" removes index 2 from dealBreakers array
    const updateData: Record<string, any> = {};
    const fieldPath = field.split('.');

    if (fieldPath.length === 2) {
      const [parent, index] = fieldPath;
      const parentData = Array.isArray((profile as any)[parent])
        ? [...((profile as any)[parent] || [])]
        : (profile as any)[parent] || {};

      if (Array.isArray(parentData)) {
        // Remove from array
        parentData.splice(parseInt(index), 1);
      }

      updateData[parent] = parentData;
    }

    const updated = await prisma.businessProfile.update({
      where: { id: profile.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Pattern rejection failed:', error);
    return NextResponse.json(
      { error: 'Failed to reject pattern' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/profile/validate/approve-all
 * Approve all pending patterns at once
 */
async function handleApproveAll(req: AuthenticatedRequest) {
  try {
    const { tenantId } = req.auth;

    // Get the simulation being validated
    const simulation = await prisma.simulation.findFirst({
      where: {
        tenantId,
        extractedPatterns: { not: null },
        status: 'COMPLETED',
        validatedAt: null
      },
      orderBy: { completedAt: 'desc' }
    });

    if (!simulation) {
      return NextResponse.json(
        { error: 'No patterns pending validation' },
        { status: 404 }
      );
    }

    // Mark simulation as validated
    const validated = await prisma.simulation.update({
      where: { id: simulation.id },
      data: { validatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: 'All patterns approved and validated',
      data: validated
    });
  } catch (error) {
    console.error('Approve all failed:', error);
    return NextResponse.json(
      { error: 'Failed to approve all patterns' },
      { status: 500 }
    );
  }
}

/**
 * Route handler
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const path = req.nextUrl.pathname;

  if (path.includes('/validate/approve')) {
    return handleApprovePattern(req);
  } else if (path.includes('/validate/reject')) {
    return handleRejectPattern(req);
  } else if (path.includes('/validate/approve-all')) {
    return handleApproveAll(req);
  } else if (path.includes('/validate')) {
    return handleGetValidation(req);
  }

  return NextResponse.json({ error: 'Unknown endpoint' }, { status: 404 });
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  return handleGetValidation(req);
});
