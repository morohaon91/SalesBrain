import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { createChatCompletion } from "@/lib/ai/client";
import { getScenarioConfig, generateSimulationPrompt } from "@/lib/ai/prompts";
import { getScenarioById } from "@/lib/scenarios/mandatory-scenarios";
import { generateUniversalPersona } from "@/lib/scenarios/persona-generator-v2";
import { v4 as uuidv4 } from "uuid";

const startSimulationSchema = z.object({
  scenarioType: z.string().optional(),
  scenarioId: z.string().optional(),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    const body = await req.json();
    const validation = startSimulationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" }, meta: { timestamp, requestId } },
        { status: 400 }
      );
    }

    const { tenantId } = req.auth;
    const { scenarioId, scenarioType } = validation.data;

    if (!scenarioId && !scenarioType) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "scenarioId or scenarioType required" }, meta: { timestamp, requestId } },
        { status: 400 }
      );
    }

    const businessProfile = await prisma.businessProfile.findUnique({ where: { tenantId } });
    if (!businessProfile) {
      return NextResponse.json(
        { success: false, error: { code: "PROFILE_NOT_FOUND", message: "Business profile not found. Please complete your profile first." }, meta: { timestamp, requestId } },
        { status: 404 }
      );
    }

    // New universal scenario path
    if (scenarioId) {
      const scenario = getScenarioById(scenarioId);
      if (!scenario) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Scenario not found" }, meta: { timestamp, requestId } },
          { status: 404 }
        );
      }

      const ownerIndustry = businessProfile.industry ?? 'Business Consulting';
      const persona = generateUniversalPersona(scenario, ownerIndustry);

      const ownerService = businessProfile.serviceDescription ?? `professional ${ownerIndustry} services`;
      const ownerTargetClient = (businessProfile as any).targetClientType ?? 'businesses and homeowners';
      const ownerBudgetRange = (businessProfile as any).typicalBudgetRange ?? 'varies by project';

      const personaPrompt = `You are roleplaying as a potential CLIENT reaching out to a ${ownerIndustry} professional.

THE BUSINESS YOU ARE CONTACTING:
- Industry: ${ownerIndustry}
- What they do: ${ownerService}
- Their typical clients: ${ownerTargetClient}
- Typical budget range they work with: ${ownerBudgetRange}

YOUR CLIENT PERSONA:
- Name: ${persona.name}
- Role: ${persona.role}
- Company type: ${persona.company}
- Scenario: ${scenario.name}
- Your situation: ${scenario.description}
- Personality: ${persona.personality}
- Communication style: ${persona.communicationStyle}
- Technical level: ${persona.technicalLevel}
- Main concerns: ${persona.painPoints.join(', ')}
- Your budget: ${persona.budget}
- Your timeline: ${persona.timeline}
- Prior experience: ${persona.priorExperience}
${persona.objectionsToRaise.length > 0 ? `- Objections to raise naturally: ${persona.objectionsToRaise.join(', ')}` : ''}

CRITICAL RULES:
- You are ALWAYS contacting a ${ownerIndustry} professional — NEVER change this industry
- Stay in character as ${persona.name} for the entire conversation
- Do NOT switch industries or invent a different type of business
- Keep responses conversational (2-4 sentences max)
- Gradually reveal concerns — don't dump everything at once

Start the simulation now with this opening: "${persona.openingMessage}"`;

      const aiResponse = await createChatCompletion(
        [{ role: "user", content: "Start the simulation with your opening line as the client." }],
        personaPrompt,
        { maxTokens: 300, temperature: 0.8 }
      );

      const personaDetails = persona as unknown as Record<string, unknown>;

      const simulation = await prisma.simulation.create({
        data: {
          tenantId,
          scenarioType: scenarioId,
          status: "IN_PROGRESS",
          duration: 0,
          aiPersona: personaDetails as any,
          personaDetails: personaDetails as any,
          demonstratedPatterns: [],
          liveScore: 0,
        },
      });

      await prisma.simulationMessage.create({
        data: {
          simulationId: simulation.id,
          role: "AI_CLIENT",
          content: aiResponse.content,
          tokensUsed: aiResponse.tokensUsed,
          latencyMs: aiResponse.latencyMs,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            simulationId: simulation.id,
            scenarioType: scenarioId,
            persona: { name: persona.name, teaser: scenario.description },
            initialMessage: aiResponse.content,
            status: simulation.status,
          },
          meta: { timestamp, requestId },
        },
        { status: 201 }
      );
    }

    // Legacy path: old enum scenario type
    const systemPrompt = await generateSimulationPrompt(scenarioType as any, businessProfile);
    const scenarioConfig = getScenarioConfig(scenarioType as any);

    const aiResponse = await createChatCompletion(
      [{ role: "user", content: "Start the conversation. You are a potential client. Begin naturally, as if making first contact." }],
      systemPrompt,
      { maxTokens: 300, temperature: 0.8 }
    );

    const simulation = await prisma.simulation.create({
      data: {
        tenantId,
        scenarioType: scenarioType!,
        status: "IN_PROGRESS",
        duration: 0,
        aiPersona: {
          clientType: scenarioConfig.clientType,
          budget: scenarioConfig.budget,
          painPoints: scenarioConfig.painPoints,
          personality: scenarioConfig.personality,
        },
        demonstratedPatterns: [],
        liveScore: 0,
      },
    });

    await prisma.simulationMessage.create({
      data: {
        simulationId: simulation.id,
        role: "AI_CLIENT",
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
        latencyMs: aiResponse.latencyMs,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          simulationId: simulation.id,
          scenarioType,
          aiPersona: {
            clientType: scenarioConfig.clientType,
            budget: scenarioConfig.budget,
            painPoints: scenarioConfig.painPoints,
            personality: scenarioConfig.personality,
          },
          initialMessage: aiResponse.content,
          status: simulation.status,
        },
        meta: { timestamp, requestId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Simulation start error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to start simulation. Please try again." }, meta: { timestamp, requestId } },
      { status: 500 }
    );
  }
});
