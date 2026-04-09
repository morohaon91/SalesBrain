import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { createChatCompletion } from '@/lib/ai/client';

/**
 * POST /api/v1/conversations/[id]/reanalyze
 * Re-runs AI analysis on an existing ended conversation to populate missing fields.
 */
async function handler(req: AuthenticatedRequest) {
  const pathParts = req.nextUrl.pathname.split('/').filter(Boolean);
  const id = pathParts[pathParts.length - 2]; // .../conversations/[id]/reanalyze
  const { tenantId } = req.auth;

  const conversation = await prisma.conversation.findFirst({
    where: { id, tenantId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!conversation) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
      { status: 404 }
    );
  }

  if (conversation.messages.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: 'EMPTY', message: 'No messages to analyze' } },
      { status: 400 }
    );
  }

  const transcript = conversation.messages
    .map((m) => `${m.role === 'LEAD' ? 'Lead' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const analysisPrompt = `You are analyzing a lead conversation transcript. Extract the following information and respond with ONLY valid JSON, no markdown, no explanation.

Transcript:
${transcript}

Return this exact JSON structure:
{
  "leadName": "extracted name or null",
  "leadEmail": "extracted email or null",
  "summary": "2-3 sentence summary of what the lead wanted and how the conversation went",
  "leadScore": <integer 0-100 based on interest level and fit>,
  "qualificationStatus": "QUALIFIED" | "UNQUALIFIED" | "MAYBE" | "UNKNOWN",
  "keyTopics": ["topic1", "topic2"]
}

Scoring guide: 80-100 = clearly interested, good fit, ready to move forward; 50-79 = interested but some uncertainty; 20-49 = lukewarm or poor fit; 0-19 = not interested or wrong fit.`;

  const aiResponse = await createChatCompletion(
    [{ role: 'user', content: analysisPrompt }],
    'You are a precise data extraction assistant. Always respond with valid JSON only.',
    { maxTokens: 400, temperature: 0.2 }
  );

  const parsed = JSON.parse(aiResponse.content);

  const leadName: string | null = parsed.leadName ?? null;
  const leadEmail: string | null = parsed.leadEmail ?? null;
  const summary: string = parsed.summary || 'No summary available';
  const leadScore: number = typeof parsed.leadScore === 'number'
    ? Math.min(100, Math.max(0, parsed.leadScore))
    : 0;
  const qualificationStatus: string = ['QUALIFIED', 'UNQUALIFIED', 'MAYBE', 'UNKNOWN'].includes(parsed.qualificationStatus)
    ? parsed.qualificationStatus
    : 'UNKNOWN';
  const keyTopics: string[] = Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [];

  // Create or update Lead record
  let leadId: string | null = conversation.leadId ?? null;
  if (leadName || leadEmail) {
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          name: leadName ?? undefined,
          email: leadEmail ?? undefined,
          qualificationScore: leadScore,
        },
      });
    } else {
      const lead = await prisma.lead.create({
        data: {
          tenantId,
          name: leadName ?? undefined,
          email: leadEmail ?? undefined,
          source: 'widget',
          qualificationScore: leadScore,
        },
      });
      leadId = lead.id;
    }
  }

  await prisma.conversation.update({
    where: { id },
    data: {
      leadId: leadId ?? undefined,
      summary,
      leadScore,
      qualificationStatus: qualificationStatus as any,
      keyTopics,
    },
  });

  return NextResponse.json({
    success: true,
    data: { leadName, leadEmail, summary, leadScore, qualificationStatus, keyTopics },
  });
}

export const POST = withAuth(handler);
