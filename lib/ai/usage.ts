/**
 * AI Usage Tracking & Cost Management
 * Tracks token usage, API costs, and performance metrics
 */

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

/** Per-token USD rates (not per 1M) for fast multiply */
const PER_TOKEN_USD: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3 / 1_000_000, output: 15 / 1_000_000 },
  "claude-sonnet-4-6": { input: 3 / 1_000_000, output: 15 / 1_000_000 },
  "claude-haiku-4-5-20251001": { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },
  "claude-haiku-4-20250514": { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },
  "claude-3-5-haiku-20241022": { input: 0.25 / 1_000_000, output: 1.25 / 1_000_000 },
};

/**
 * Cost per 1M tokens (approximate pricing for Claude Sonnet 4)
 */
const PRICING_PER_M = {
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
} as const;

/**
 * Calculate cost of AI call in USD
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const modelPricing =
    PRICING_PER_M[model as keyof typeof PRICING_PER_M] || PRICING_PER_M["claude-sonnet-4-20250514"];

  const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output;

  return inputCost + outputCost;
}

function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = PER_TOKEN_USD[model] || PER_TOKEN_USD["claude-sonnet-4-20250514"];
  return inputTokens * rates.input + outputTokens * rates.output;
}

export interface LogAIUsageInput {
  tenantId?: string;
  operationType: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  metadata?: Record<string, unknown>;
}

/**
 * Structured console logging for AI usage (DB persistence can be added later).
 * Never throws — callers wrap in .catch if needed.
 */
export async function logAIUsage(data: LogAIUsageInput): Promise<void> {
  if (!data.tenantId) return;

  const costUsd = estimateCostUsd(data.model, data.inputTokens, data.outputTokens);

  console.log("[AI USAGE]", {
    tenant: data.tenantId,
    type: data.operationType,
    model: data.model,
    cost: `$${costUsd.toFixed(4)}`,
    tokensIn: data.inputTokens,
    tokensOut: data.outputTokens,
    tokens: data.inputTokens + data.outputTokens,
    latency: `${data.latencyMs}ms`,
    meta: data.metadata ?? {},
  });
}

/**
 * @deprecated Prefer logAIUsage(LogAIUsageInput). Kept for any legacy callers.
 */
export async function logAIUsageLegacy(metrics: AIUsageMetrics): Promise<void> {
  const totalTokens = metrics.inputTokens + metrics.outputTokens;
  const cost = calculateCost(metrics.model, metrics.inputTokens, metrics.outputTokens);

  console.log(`[AI Usage] ${metrics.task} - ${totalTokens} tokens (${metrics.latencyMs}ms) - $${cost.toFixed(4)}`);

  // TODO: Save to database
  // await prisma.apiUsage.create({ ... });
}

/**
 * Get AI usage stats for tenant
 */
export async function getTenantAIStats(
  tenantId: string,
  days: number = 30
): Promise<{
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
