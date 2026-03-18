import { NextRequest, NextResponse } from 'next/server';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { v4 as uuidv4 } from 'uuid';

interface ProfileResponse {
  success: boolean;
  data?: {
    id: string;
    isComplete: boolean;
    completionScore: number;
    communicationStyle?: {
      tone: string;
      formality: number;
      responseLength: string;
      keyPhrases?: string[];
    };
    pricingLogic?: {
      minBudget?: number;
      maxBudget?: number;
      flexibility: number;
      dealBreakers?: string[];
    };
    qualificationCriteria?: {
      mustHaves?: string[];
      idealClient?: string[];
    };
    embeddingsCount: number;
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
 * GET /api/v1/profile
 * Fetch business profile for authenticated user's tenant
 */
export const GET = withAuth(
  async (req): Promise<NextResponse<ProfileResponse>> => {
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

      // Set tenant context for Prisma middleware
      setTenantContext(tenantId);

      // Fetch business profile
      const profile = await prisma.businessProfile.findUnique({
        where: { tenantId },
      });

      clearTenantContext();

      // If no profile exists yet, return empty profile
      if (!profile) {
        return NextResponse.json(
          {
            success: true,
            data: {
              id: uuidv4(),
              isComplete: false,
              completionScore: 0,
              embeddingsCount: 0,
            },
            meta: { timestamp, requestId },
          },
          { status: 200 }
        );
      }

      // Transform response
      return NextResponse.json(
        {
          success: true,
          data: {
            id: profile.id,
            isComplete: profile.isComplete || false,
            completionScore: profile.completionScore || 0,
            communicationStyle: profile.communicationStyle as any,
            pricingLogic: profile.pricingLogic as any,
            qualificationCriteria: profile.qualificationCriteria as any,
            embeddingsCount: profile.embeddingsCount || 0,
          },
          meta: { timestamp, requestId },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching profile:', error);
      clearTenantContext();

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch profile',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
  }
);
