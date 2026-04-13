import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createChatCompletion } from '@/lib/ai/client';
import { scoreConversation } from '@/lib/scoring/hybrid-scorer';

const bodySchema = z.object({
  conversationId: z.string().uuid(),
});

/**
 * POST /api/v1/public/lead-chat/[widgetApiKey]/end
 * Marks a lead conversation as ended and runs AI analysis (summary, score, qualification).
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ widgetApiKey: string }> }
) {
  const { widgetApiKey } = await context.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { widgetApiKey },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Invalid link' } },
        { status: 404 }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid body' } },
        { status: 400 }
      );
    }

    const { conversationId } = parsed.data;

    // Load conversation with messages and tenant's business profile
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, tenantId: tenant.id, status: 'ACTIVE' },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    const businessProfile = await prisma.businessProfile.findFirst({
      where: { tenantId: tenant.id },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found or already ended' } },
        { status: 404 }
      );
    }

    // Build transcript for AI analysis
    const transcript = conversation.messages
      .map((m) => `${m.role === 'LEAD' ? 'Lead' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // If no messages were ever sent, just abandon the conversation silently
    if (conversation.messages.length === 0) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: 'ABANDONED', endedAt: new Date() },
      });
      return NextResponse.json({ success: true, data: { ended: true } });
    }

    // PHASE 1: Hybrid Scoring + Basic Info Extraction
    let analysis = {
      leadName: null as string | null,
      leadEmail: null as string | null,
      summary: 'No summary available',
      leadScore: 0,
      qualificationStatus: 'UNKNOWN' as 'QUALIFIED' | 'UNQUALIFIED' | 'MAYBE' | 'UNKNOWN',
      keyTopics: [] as string[],
    };

    let scoringBreakdown: any = null;

    if (conversation.messages.length > 0) {
      try {
        // Use hybrid scorer if business profile exists, otherwise fall back to basic analysis
        if (businessProfile) {
          scoringBreakdown = await scoreConversation(transcript, businessProfile);

          // Extract basic info for backward compatibility
          const basicInfoPrompt = `Extract name and email from this conversation.

Transcript:
${transcript}

Return JSON:
{
  "leadName": "name or null",
  "leadEmail": "email or null"
}`;

          const basicResponse = await createChatCompletion(
            [{ role: 'user', content: basicInfoPrompt }],
            'You are a data extraction assistant.',
            { maxTokens: 100, temperature: 0.1 }
          );

          const basicParsed = JSON.parse(basicResponse.content || '{}');

          analysis = {
            leadName: basicParsed.leadName ?? null,
            leadEmail: basicParsed.leadEmail ?? null,
            summary: `${basicParsed.summary || ''}\n\nScore: ${scoringBreakdown.totalScore}/100 (${scoringBreakdown.temperature.toUpperCase()})`,
            leadScore: scoringBreakdown.totalScore,
            qualificationStatus:
              scoringBreakdown.temperature === 'hot' ? 'QUALIFIED' :
              scoringBreakdown.temperature === 'warm' ? 'MAYBE' :
              'UNQUALIFIED',
            keyTopics: scoringBreakdown.qualificationAnalysis.greenFlagsMatched || [],
          };
        } else {
          // Fallback to basic analysis if no business profile
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
          analysis = {
            leadName: parsed.leadName ?? null,
            leadEmail: parsed.leadEmail ?? null,
            summary: parsed.summary || 'No summary available',
            leadScore: typeof parsed.leadScore === 'number' ? Math.min(100, Math.max(0, parsed.leadScore)) : 0,
            qualificationStatus: ['QUALIFIED', 'UNQUALIFIED', 'MAYBE', 'UNKNOWN'].includes(parsed.qualificationStatus)
              ? parsed.qualificationStatus
              : 'UNKNOWN',
            keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
          };
        }
      } catch (e) {
        console.error('lead-chat analysis error:', e);
        // Continue with defaults — don't fail the whole end request
      }
    }

    // Create or find Lead record if we have identifying info
    let leadId: string | null = conversation.leadId ?? null;
    if (!leadId && (analysis.leadName || analysis.leadEmail)) {
      const lead = await prisma.lead.create({
        data: {
          tenantId: tenant.id,
          name: analysis.leadName ?? undefined,
          email: analysis.leadEmail ?? undefined,
          source: 'widget',
          qualificationScore: analysis.leadScore,
        },
      });
      leadId = lead.id;
    }

    // Mark conversation ended with all analysis data
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        leadId: leadId ?? undefined,
        summary: analysis.summary,
        leadScore: analysis.leadScore,
        qualificationStatus: analysis.qualificationStatus,
        keyTopics: analysis.keyTopics,
        scoringBreakdown: scoringBreakdown, // PHASE 1: Store full scoring breakdown
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ended: true,
        summary: analysis.summary,
        leadScore: analysis.leadScore,
        qualificationStatus: analysis.qualificationStatus,
      },
    });
  } catch (e) {
    console.error('lead-chat end:', e);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to end chat' } },
      { status: 500 }
    );
  }
}
