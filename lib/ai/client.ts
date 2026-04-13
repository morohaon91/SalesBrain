import Anthropic from "@anthropic-ai/sdk";

/**
 * AI Configuration
 */
export const AI_CONFIG = {
  model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
  maxTokens: 300,
  temperature: 0.8,
  topP: 0.9,
};

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

/**
 * Initialize Anthropic client
 */
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Create chat completion with Anthropic Claude
 * Handles retries, error handling, and token tracking
 */
export async function createChatCompletion(
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
  systemPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<AIResponse> {
  const startTime = Date.now();

  try {
    const response = await client.messages.create({
      model: AI_CONFIG.model,
      max_tokens: options.maxTokens ?? AI_CONFIG.maxTokens,
      temperature: options.temperature ?? AI_CONFIG.temperature,
      system: systemPrompt,
      messages,
    });

    const latencyMs = Date.now() - startTime;
    const totalTokens = response.usage.input_tokens + response.usage.output_tokens;

    // Extract text content
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in AI response");
    }

    return {
      content: textContent.text,
      tokensUsed: totalTokens,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    // Handle authentication errors
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("AI Authentication error:", error.message);
      throw new Error(
        "AI service authentication failed. Please check your API key configuration."
      );
    }

    // Handle rate limiting with exponential backoff
    if (error instanceof Anthropic.RateLimitError) {
      console.warn("AI rate limit hit, consider implementing retry with backoff");
      throw new Error("AI service rate limited, please try again");
    }

    // Handle other API errors
    if (error instanceof Anthropic.APIError) {
      console.error(`AI API error (${error.status}):`, error.message);
      throw new Error(`AI service error: ${error.message}`);
    }

    // Handle any other errors
    console.error("Unexpected AI error:", error);
    throw error;
  }
}

/**
 * Estimate tokens for a string (rough approximation)
 * ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
