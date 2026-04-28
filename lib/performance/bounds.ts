/** Default number of recent messages returned on conversation detail GET. */
export const CONVERSATION_DETAIL_MESSAGES_DEFAULT = 200;
/** Hard cap for messages returned in one conversation detail response. */
export const CONVERSATION_DETAIL_MESSAGES_MAX = 500;

/** Recent messages loaded for public lead-chat AI context. */
export const LEAD_CHAT_MESSAGE_WINDOW = 100;

/** Recent simulation messages for AI + live scoring context. */
export const SIMULATION_MESSAGE_WINDOW = 80;

/** Re-extract processes completed simulations in DB batches of this size. */
export const RE_EXTRACT_SIMULATION_BATCH_SIZE = 25;

/** Reanalyze transcript uses at most this many recent messages. */
export const REANALYZE_MESSAGE_CAP = 400;
