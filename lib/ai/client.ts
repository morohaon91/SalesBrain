import Anthropic from "@anthropic-ai/sdk";
import { logAIUsage } from "@/lib/ai/usage";
import { AI_MODELS } from "@/lib/ai/prompts/config";

/**
 * AI Configuration
 */
export const AI_CONFIG = {
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
  maxTokens: 300,
  temperature: 0.8,
  topP: 0.9,
};

export type AIOperationType =
  | "lead_chat"
  | "extraction"
  | "scoring"
  | "simulation"
  | "reanalyze"
  | "lead_analysis"
  | "unknown";

/**
 * Default Sonnet for quality paths; Haiku for structured JSON classifiers.
 */
const TASK_MODELS: Partial<Record<AIOperationType, string>> = {
  scoring: process.env.ANTHROPIC_HAIKU_MODEL || AI_MODELS.HAIKU,
};

function resolveModel(operationType?: AIOperationType, explicitModel?: string): string {
  if (explicitModel) return explicitModel;
  if (operationType && TASK_MODELS[operationType]) {
    return TASK_MODELS[operationType] as string;
  }
  return AI_CONFIG.model;
}

/**
 * AI Response with metadata
 */
export interface AIResponse {
  content: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableApiError(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    const s = error.status ?? 0;
    return s === 429 || s >= 500;
  }
  return false;
}

export interface CreateChatCompletionOptions {
  maxTokens?: number;
  temperature?: number;
  /** Wall-clock cap for the API request (default 30s). */
  timeoutMs?: number;
  tenantId?: string;
  operationType?: AIOperationType;
  metadata?: Record<string, unknown>;
  /** Overrides model resolution from operationType. */
  model?: string;
  /**
   * When true, the main system string is sent as a cacheable Anthropic block.
   * Optional `systemSuffix` is appended as a second, non-cached block.
   */
  cacheSystemPrompt?: boolean;
  /** Volatile system fragment (e.g. CLOSER progress) — not cached. */
  systemSuffix?: string;
}

type SystemBlock = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

function buildCreateParams(
  model: string,
  maxTokens: number,
  temperature: number,
  systemPrompt: string,
  systemSuffix: string | undefined,
  cacheSystemPrompt: boolean | undefined,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  };

  if (cacheSystemPrompt) {
    const blocks: SystemBlock[] = [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ];
    if (systemSuffix?.trim()) {
      blocks.push({ type: "text", text: systemSuffix });
    }
    base.system = blocks;
    return base;
  }

  const fullSystem = systemSuffix?.trim()
    ? `${systemPrompt}\n\n${systemSuffix}`
    : systemPrompt;
  base.system = fullSystem;
  return base;
}

/**
 * Create chat completion with Anthropic Claude.
 * Supports timeouts, bounded retries (429 / 5xx), optional prompt caching, and usage logging.
 */
export async function createChatCompletion(
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
  systemPrompt: string,
  options: CreateChatCompletionOptions = {}
): Promise<AIResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxTokens = options.maxTokens ?? AI_CONFIG.maxTokens;
  const temperature = options.temperature ?? AI_CONFIG.temperature;
  const model = resolveModel(options.operationType, options.model);
  const systemSuffix = options.systemSuffix;
  const cacheSystemPrompt =
    options.cacheSystemPrompt === true &&
    process.env.ANTHROPIC_DISABLE_PROMPT_CACHE !== "1";

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI_REQUEST_TIMEOUT")), timeoutMs);
    });

    try {
      const params = buildCreateParams(
        model,
        maxTokens,
        temperature,
        systemPrompt,
        systemSuffix,
        cacheSystemPrompt,
        messages
      );

      const response = (await Promise.race([
        client.messages.create(params as any),
        timeoutPromise,
      ])) as Anthropic.Message;

      const latencyMs = Date.now() - startTime;
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const totalTokens = inputTokens + outputTokens;

      const textContent = response.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in AI response");
      }

      const result: AIResponse = {
        content: textContent.text,
        tokensUsed: totalTokens,
        inputTokens,
        outputTokens,
        latencyMs,
      };

      if (options.tenantId) {
        await logAIUsage({
          tenantId: options.tenantId,
          operationType: options.operationType || "unknown",
          model,
          inputTokens,
          outputTokens,
          latencyMs,
          metadata: options.metadata,
        }).catch((err) => {
          console.error("[AI] Failed to log usage:", err);
        });
      }

      return result;
    } catch (error) {
      lastError = error;
      const latencyMs = Date.now() - startTime;

      if (error instanceof Error && error.message === "AI_REQUEST_TIMEOUT") {
        console.error(`AI request timeout after ${timeoutMs}ms`);
        if (options.tenantId) {
          await logAIUsage({
            tenantId: options.tenantId,
            operationType: options.operationType || "unknown",
            model,
            inputTokens: 0,
            outputTokens: 0,
            latencyMs,
            metadata: { ...(options.metadata ?? {}), error: "timeout" },
          }).catch(() => {});
        }
        throw new Error("AI service timed out. Please try again.");
      }

      if (attempt < MAX_RETRIES && isRetryableApiError(error)) {
        const status = error instanceof Anthropic.APIError ? error.status : 0;
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.warn(`[AI] Retry ${attempt + 1}/${MAX_RETRIES} after status ${status}, waiting ${delay}ms`);
        await sleep(delay);
        continue;
      }

      if (error instanceof Anthropic.AuthenticationError) {
        console.error("AI Authentication error:", error.message);
        throw new Error(
          "AI service authentication failed. Please check your API key configuration."
        );
      }

      if (error instanceof Anthropic.RateLimitError && attempt === MAX_RETRIES) {
        console.warn("AI rate limit hit after retries");
        throw new Error("AI service rate limited, please try again");
      }

      if (error instanceof Anthropic.APIError) {
        console.error(`AI API error (${error.status}):`, error.message);
        throw new Error(`AI service error: ${error.message}`);
      }

      console.error("Unexpected AI error:", error);
      throw error;
    }
  }

  console.error("Unexpected AI error after retries:", lastError);
  throw lastError;
}

/**
 * Estimate tokens for a string (rough approximation)
 * ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Parse JSON from an AI response, stripping any markdown code fences the model
 * may have added despite being asked for plain JSON.
 */
export function parseAiJson<T = unknown>(text: string): T {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  const match = stripped.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  return JSON.parse(match ? match[0] : stripped) as T;
}
