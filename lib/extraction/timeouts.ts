/**
 * Pattern extraction can run 30–120s+ (large system prompt + JSON output).
 * Must exceed `createChatCompletion` default (30s) and stay below HTTP limits you configure.
 */
const parsed = Number(process.env.AI_EXTRACTION_TIMEOUT_MS);
export const EXTRACTION_AI_TIMEOUT_MS =
  Number.isFinite(parsed) && parsed >= 45_000 ? parsed : 120_000;

/** Outer `Promise.race` in re-extract should allow the inner AI call to finish first. */
export const RE_EXTRACT_OUTER_TIMEOUT_MS = EXTRACTION_AI_TIMEOUT_MS + 45_000;
