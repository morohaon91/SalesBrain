/**
 * Lead Conversations Guard
 * Ensures lead conversations can only be started after profile approval
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Check if a tenant has lead conversations activated (approved profile)
 * Returns an error response if not active, null if active
 */
export async function checkLeadConversationsActive(tenantId: string): Promise<NextResponse | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { leadConversationsActive: true, onboardingComplete: true },
  });

  if (!tenant || !tenant.leadConversationsActive) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LEAD_CONVERSATIONS_INACTIVE',
          message: 'Lead conversations are not active. The business owner must approve their profile before AI conversations can begin.',
        },
      },
      { status: 403 }
    );
  }

  return null;
}
