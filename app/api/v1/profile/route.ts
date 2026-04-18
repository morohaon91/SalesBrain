import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, setTenantContext, clearTenantContext } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { calculateProfileCompletion } from '@/lib/extraction/completion';
import { unwrapScalarObjects } from '@/lib/extraction/extraction-engine';
import { v4 as uuidv4 } from 'uuid';

interface ProfileResponse {
  success: boolean;
  data?: {
    id: string;
    isComplete: boolean;
    completionScore: number;

    // Manual fields
    industry?: string | null;
    serviceDescription?: string | null;
    targetClientType?: string | null;
    typicalBudgetRange?: string | null;
    commonClientQuestions?: string[];

    // Extracted fields
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
    objectionHandling?: any;
    decisionMakingPatterns?: any;

    // Progress
    completionPercentage?: number;
    simulationCount?: number;
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

      // Fetch business profile + tenant (for shareable lead chat link)
      const [profile, tenantRow] = await Promise.all([
        prisma.businessProfile.findUnique({
          where: { tenantId },
        }),
        prisma.tenant.findUnique({
          where: { id: tenantId },
          select: {
            widgetApiKey: true,
            businessName: true,
            leadConversationsActive: true,
            widgetGreeting: true,
          },
        }),
      ]);

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
            },
            meta: { timestamp, requestId },
          },
          { status: 200 }
        );
      }

      // Always recompute completion from actual field data so the UI is never stale
      const liveCompletion = calculateProfileCompletion(profile as any);
      const liveCompletionPct = liveCompletion.total;

      // Persist if different (keeps DB in sync without a dedicated cron job)
      if (liveCompletionPct !== profile.completionPercentage) {
        prisma.businessProfile.update({
          where: { tenantId },
          data: { completionPercentage: liveCompletionPct, completionScore: liveCompletionPct },
        }).catch(() => {}); // fire-and-forget, non-blocking
      }

      // Transform response
      return NextResponse.json(
        {
          success: true,
          data: {
            id: profile.id,
            isComplete: liveCompletionPct >= 100,
            completionScore: liveCompletionPct,

            // Manual fields
            industry: profile.industry,
            serviceDescription: profile.serviceDescription,
            targetClientType: profile.targetClientType,
            typicalBudgetRange: profile.typicalBudgetRange,
            commonClientQuestions: profile.commonClientQuestions,
            yearsExperience: profile.yearsExperience,
            serviceArea: profile.serviceArea,
            teamSize: profile.teamSize,
            certifications: profile.certifications,

            // Extracted fields (unwrap any AI-wrapped scalars for legacy rows)
            communicationStyle: unwrapScalarObjects(profile.communicationStyle),
            pricingLogic: unwrapScalarObjects(profile.pricingLogic),
            qualificationCriteria: unwrapScalarObjects(profile.qualificationCriteria),
            objectionHandling: unwrapScalarObjects(profile.objectionHandling),
            decisionMakingPatterns: unwrapScalarObjects(profile.decisionMakingPatterns),
            ownerVoiceExamples: unwrapScalarObjects(profile.ownerVoiceExamples),

            // Approval
            profileApprovalStatus: profile.profileApprovalStatus,
            approvedAt: profile.approvedAt?.toISOString() ?? null,
            goLiveAt: profile.goLiveAt?.toISOString() ?? null,

            // Progress — use live computed value, not stale DB value
            completionPercentage: liveCompletionPct,
            completionBreakdown: liveCompletion,
            simulationCount: profile.simulationCount || 0,
            lastExtractedAt: profile.lastExtractedAt?.toISOString() ?? null,

            // Shareable lead chat (public /l/[widgetApiKey] — requires go-live)
            widgetApiKey: tenantRow?.widgetApiKey ?? null,
            leadChatPath:
              tenantRow?.widgetApiKey != null ? `/l/${tenantRow.widgetApiKey}` : null,
            leadConversationsActive: tenantRow?.leadConversationsActive ?? false,
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

/**
 * Update profile schema
 */
const updateProfileSchema = z.object({
  industry: z.string().optional(),
  serviceDescription: z.string().optional(),
  targetClientType: z.string().optional(),
  typicalBudgetRange: z.string().optional(),
  commonClientQuestions: z.array(z.string()).optional(),
  yearsExperience: z.number().nullable().optional(),
  certifications: z.array(z.string()).optional(),
  serviceArea: z.string().optional(),
  teamSize: z.string().optional(),
});

type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

/**
 * PATCH /api/v1/profile
 * Update business profile Basic Info fields
 */
export const PATCH = withAuth(
  async (req: AuthenticatedRequest): Promise<NextResponse<ProfileResponse>> => {
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

      const body = await req.json();
      const validation = updateProfileSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
            },
            meta: { timestamp, requestId },
          },
          { status: 400 }
        );
      }

      const data = validation.data as UpdateProfileRequest;

      setTenantContext(tenantId);

      // Upsert profile — create if it doesn't exist yet (new onboarding flow skips auto-creation)
      const updateData = {
        ...(data.industry !== undefined && { industry: data.industry }),
        ...(data.serviceDescription !== undefined && { serviceDescription: data.serviceDescription }),
        ...(data.targetClientType !== undefined && { targetClientType: data.targetClientType }),
        ...(data.typicalBudgetRange !== undefined && { typicalBudgetRange: data.typicalBudgetRange }),
        ...(data.commonClientQuestions !== undefined && { commonClientQuestions: data.commonClientQuestions }),
        ...(data.yearsExperience !== undefined && { yearsExperience: data.yearsExperience }),
        ...(data.certifications !== undefined && { certifications: data.certifications }),
        ...(data.serviceArea !== undefined && { serviceArea: data.serviceArea }),
        ...(data.teamSize !== undefined && { teamSize: data.teamSize }),
      };

      const profile = await prisma.businessProfile.upsert({
        where: { tenantId },
        update: updateData,
        create: {
          tenantId,
          ...updateData,
          completionPercentage: 0,
          isComplete: false,
          simulationCount: 0,
          profileApprovalStatus: 'PENDING',
          completedScenarios: [],
        },
      });

      clearTenantContext();

      return NextResponse.json(
        {
          success: true,
          data: {
            id: profile.id,
            isComplete: profile.isComplete || false,
            completionScore: profile.completionScore || 0,
            industry: profile.industry,
            serviceDescription: profile.serviceDescription,
            targetClientType: profile.targetClientType,
            typicalBudgetRange: profile.typicalBudgetRange,
            commonClientQuestions: profile.commonClientQuestions,
            communicationStyle: profile.communicationStyle as any,
            pricingLogic: profile.pricingLogic as any,
            qualificationCriteria: profile.qualificationCriteria as any,
            objectionHandling: profile.objectionHandling as any,
            completionPercentage: profile.completionPercentage || 0,
            simulationCount: profile.simulationCount || 0,
          },
          meta: { timestamp, requestId },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      clearTenantContext();

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update profile',
          },
          meta: { timestamp, requestId },
        },
        { status: 500 }
      );
    }
  }
);
