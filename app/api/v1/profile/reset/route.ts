import { NextRequest, NextResponse } from 'next/server';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { getIndustryTemplate } from '@/lib/templates';
import { v4 as uuidv4 } from 'uuid';

interface ResetProfileResponse {
  success: boolean;
  data?: {
    id: string;
    industry?: string | null;
    serviceDescription?: string | null;
    targetClientType?: string | null;
    typicalBudgetRange?: string | null;
    commonClientQuestions?: string[];
  };
  error?: {
    code: string;
    message: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * POST /api/v1/profile/reset
 * Reset Basic Info fields to industry template defaults
 */
export const POST = withAuth(
  async (req: AuthenticatedRequest): Promise<NextResponse<ResetProfileResponse>> => {
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    try {
      const tenantId = (req as any).auth?.tenantId;
      if (!tenantId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'No tenant context' },
            meta: { timestamp, requestId },
          },
          { status: 401 }
        );
      }

      setTenantContext(tenantId);

      // Get current profile
      const profile = await prisma.businessProfile.findUnique({
        where: { tenantId },
      });

      if (!profile) {
        clearTenantContext();
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Profile not found' },
            meta: { timestamp, requestId },
          },
          { status: 404 }
        );
      }

      // Get template for current industry
      const template = getIndustryTemplate(profile.industry);

      if (!template) {
        clearTenantContext();
        return NextResponse.json(
          {
            success: false,
            error: { code: 'NOT_FOUND', message: 'No template found for this industry' },
            meta: { timestamp, requestId },
          },
          { status: 404 }
        );
      }

      // Reset to template defaults
      const updatedProfile = await prisma.businessProfile.update({
        where: { tenantId },
        data: {
          serviceDescription: template.serviceDescription,
          targetClientType: template.targetClientType,
          typicalBudgetRange: template.typicalBudgetRange,
          commonClientQuestions: template.commonClientQuestions,
        },
      });

      clearTenantContext();

      return NextResponse.json(
        {
          success: true,
          data: {
            id: updatedProfile.id,
            industry: updatedProfile.industry,
            serviceDescription: updatedProfile.serviceDescription,
            targetClientType: updatedProfile.targetClientType,
            typicalBudgetRange: updatedProfile.typicalBudgetRange,
            commonClientQuestions: updatedProfile.commonClientQuestions,
          },
          meta: { timestamp, requestId },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error resetting profile:', error);
      clearTenantContext();

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to reset profile',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
  }
);
