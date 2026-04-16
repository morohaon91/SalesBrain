/**
 * GET /api/v1/profile/readiness
 * Returns Go-Live readiness report for the authenticated tenant's profile.
 */

import { NextResponse } from 'next/server';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { getReadinessReport } from '@/lib/learning/readiness-calculator';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const tenantId = req.auth?.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { tenantId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const report = getReadinessReport(profile);
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error getting readiness:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
