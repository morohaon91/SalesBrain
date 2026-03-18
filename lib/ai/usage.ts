/**
 * AI Usage Tracking & Cost Management
 * Tracks token usage, API costs, and performance metrics
 */

import { prisma } from "@/lib/prisma";

export interface AIUsageMetrics {
  tenantId: string;
  conversationId?: string;
  simulationId?: string;
  model: string;
  task: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  errorType?: string;
}

/**
 * Cost per 1M tokens (approximate pricing for Claude Sonnet 4)
 */
const PRICING = {
  "claude-sonnet-4-20250514": {
    input: 3.0, // $3 per 1M input tokens
    output: 15.0, // $15 per 1M output tokens
  },
};

/**
 * Calculate cost of AI call in USD
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const modelPricing = PRICING[model as keyof typeof PRICING] || PRICING["claude-sonnet-4-20250514"];

  const inputCost = (inputTokens / 1000000) * modelPricing.input;
  const outputCost = (outputTokens / 1000000) * modelPricing.output;

  return inputCost + outputCost;
}

/**
 * Log AI API usage to database (for future analytics)
 * Currently just logs to console - can be extended to save to database
 */
export async function logAIUsage(metrics: AIUsageMetrics): Promise<void> {
  const totalTokens = metrics.inputTokens + metrics.outputTokens;
  const cost = calculateCost("claude-sonnet-4-20250514", metrics.inputTokens, metrics.outputTokens);

  // Log to console for debugging
  console.log(`[AI Usage] ${metrics.task} - ${totalTokens} tokens (${metrics.latencyMs}ms) - $${cost.toFixed(4)}`);

  // TODO: Save to database
  // await prisma.apiUsage.create({
  //   data: {
  //     tenantId: metrics.tenantId,
  //     conversationId: metrics.conversationId,
  //     simulationId: metrics.simulationId,
  //     model: metrics.model,
  //     task: metrics.task,
  //     inputTokens: metrics.inputTokens,
  //     outputTokens: metrics.outputTokens,
  //     totalTokens,
  //     costUsd: cost,
  //     latencyMs: metrics.latencyMs,
  //     success: metrics.success,
  //     errorType: metrics.errorType,
  //   },
  // });
}

/**
 * Get AI usage stats for tenant
 */
export async function getTenantAIStats(tenantId: string, days: number = 30): Promise<{
  totalCalls: number;
  totalTokens: number;
  estimatedCost: number;
  avgLatency: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // TODO: Query from database when ApiUsage table is implemented
  return {
    totalCalls: 0,
    totalTokens: 0,
    estimatedCost: 0,
    avgLatency: 0,
  };
}
