# AI Integration Implementation Guide

## Overview

The SalesBrain AI integration enables realistic sales practice simulations using Anthropic's Claude Sonnet 4 model. This document covers the implemented system and how to use it.

## Architecture

### Core Components

1. **AI Client Wrapper** (`lib/ai/client.ts`)
   - Wraps Anthropic SDK with error handling and token tracking
   - Handles rate limiting, retries, and cost calculation
   - Tracks token usage and latency for each API call

2. **Prompt Templates** (`lib/ai/prompts/simulation.ts`)
   - Generates system prompts for 5 scenario types
   - Configurable AI persona for each scenario
   - Context-aware user prompts for conversation continuation

3. **API Endpoints**
   - `POST /api/v1/simulations/start` - Create new simulation
   - `POST /api/v1/simulations/{id}/message` - Send message and get AI response
   - `GET /api/v1/simulations/{id}` - Get simulation details and transcript
   - `POST /api/v1/simulations/{id}/complete` - Mark simulation complete
   - `GET /api/v1/simulations` - List all simulations

4. **Usage Tracking** (`lib/ai/usage.ts`)
   - Calculates token usage and cost per API call
   - Ready for database logging (currently logs to console)

## Scenario Types

### PRICE_SENSITIVE
- **Client Type**: Budget-Conscious Startup Founder
- **Budget**: $5k-15k
- **Behavior**: Price-focused, negotiation-oriented, skeptical of ROI
- **Use Case**: Practice handling budget objections

### INDECISIVE
- **Client Type**: Hesitant Mid-Level Manager
- **Budget**: $10k-30k (has budget but unsure about use)
- **Behavior**: Asks many questions, needs reassurance, risk-averse
- **Use Case**: Practice building confidence and overcoming objections

### DEMANDING
- **Client Type**: Perfectionist Executive
- **Budget**: $30k+
- **Behavior**: High expectations, detail-oriented, wants premium service
- **Use Case**: Practice handling difficult personalities and scope management

### TIME_PRESSURED
- **Client Type**: Urgent Problem-Solver
- **Budget**: $15k-40k (flexible)
- **Behavior**: Urgent, fast-paced, solutions-focused
- **Use Case**: Practice handling pressure and quick decision-making

### HIGH_BUDGET
- **Client Type**: Enterprise Decision Maker
- **Budget**: $50k+
- **Behavior**: Professional, formal, values relationships
- **Use Case**: Practice high-value, complex deals

## API Usage Examples

### Start a Simulation

```bash
curl -X POST http://localhost:3000/api/v1/simulations/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioType": "PRICE_SENSITIVE"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simulationId": "uuid",
    "scenarioType": "PRICE_SENSITIVE",
    "aiPersona": {
      "clientType": "Budget-Conscious Startup Founder",
      "budget": "Limited, looking for value ($5k-15k range)",
      "painPoints": ["Need results fast", "Limited budget"],
      "personality": "Direct, data-driven, negotiation-focused"
    },
    "initialMessage": "Hi, I'm interested in your services...",
    "status": "IN_PROGRESS"
  }
}
```

### Send a Message

```bash
curl -X POST http://localhost:3000/api/v1/simulations/{simulationId}/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I understand budget is important. Let me explain our pricing structure..."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "uuid",
    "role": "BUSINESS_OWNER",
    "content": "I understand budget is important...",
    "aiResponse": {
      "messageId": "uuid",
      "role": "AI_CLIENT",
      "content": "That sounds reasonable, but I'm still concerned about...",
      "latencyMs": 1250,
      "tokensUsed": 85
    }
  }
}
```

### Get Simulation Details

```bash
curl http://localhost:3000/api/v1/simulations/{simulationId} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "scenarioType": "PRICE_SENSITIVE",
    "status": "IN_PROGRESS",
    "duration": 480,
    "createdAt": "2026-03-18T10:00:00Z",
    "qualityScore": null,
    "aiPersona": { /* ... */ },
    "messages": [
      {
        "id": "uuid",
        "role": "AI_CLIENT",
        "content": "Hi, I'm interested in your services...",
        "createdAt": "2026-03-18T10:00:00Z",
        "latencyMs": 1250,
        "tokensUsed": 85
      },
      {
        "id": "uuid",
        "role": "BUSINESS_OWNER",
        "content": "I understand budget is important...",
        "createdAt": "2026-03-18T10:01:00Z"
      }
    ]
  }
}
```

### Complete a Simulation

```bash
curl -X POST http://localhost:3000/api/v1/simulations/{simulationId}/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simulationId": "uuid",
    "status": "COMPLETED",
    "duration": 480,
    "messageCount": 12,
    "qualityScore": 92
  }
}
```

## Environment Variables

Required environment variable:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Get your API key from [Anthropic Console](https://console.anthropic.com/account/keys)

## AI Configuration

Default configuration (from `lib/ai/client.ts`):

```typescript
export const AI_CONFIG = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 300,          // Response length limit
  temperature: 0.8,        // Creativity/variety
  topP: 0.9,              // Top-p sampling
};
```

These settings provide:
- **Fast responses** (Sonnet 4 is optimized for speed)
- **Reasonable cost** (~$0.003 per interaction)
- **Consistent behavior** (temperature 0.8 for realistic variety)
- **Natural conversations** (max 300 tokens = ~150 words per response)

## Cost Management

### Per-Interaction Cost

For a typical simulation exchange:
- User message: ~50 tokens
- System prompt: ~200 tokens
- AI response: ~150 tokens
- **Total**: ~400 tokens
- **Cost**: ~$0.004 USD

### Pricing (Claude Sonnet 4)
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

### Tracking Usage

Usage is logged automatically. Current implementation:
```typescript
[AI Usage] simulation - 400 tokens (1250ms) - $0.0045
```

To enable database logging, uncomment the `prisma.apiUsage.create()` call in `lib/ai/usage.ts` once the `ApiUsage` table is added to the schema.

## Error Handling

The system handles:

1. **Rate Limiting** (429 errors)
   - Logs warning, suggests implementing exponential backoff
   - Current: Would need manual retry

2. **API Errors** (5xx)
   - Returns user-friendly error message
   - Logs full error for debugging

3. **Invalid Input** (4xx)
   - Returns validation errors with field details

4. **Timeout Errors**
   - Return after 10 seconds
   - Can be configured via timeout parameter

Example error response:
```json
{
  "success": false,
  "error": {
    "code": "AI_ERROR",
    "message": "AI service rate limited, please try again"
  },
  "meta": {
    "timestamp": "2026-03-18T10:00:00Z",
    "requestId": "uuid"
  }
}
```

## Quality Scoring

Simulations receive a quality score (0-100) based on:

- **Conversation balance** (50%): Equal participation between business owner and AI
- **Conversation length** (50%): More messages = better practice

Formula:
```typescript
const balanceScore = // 0-100 based on equal turn-taking
const lengthBonus = Math.min(20, Math.floor(messageCount / 2))
const qualityScore = Math.min(100, balanceScore + lengthBonus)
```

## Testing

### Start a Test Simulation

1. Get your JWT token from login
2. Start simulation:
   ```bash
   curl -X POST http://localhost:3000/api/v1/simulations/start \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"scenarioType": "PRICE_SENSITIVE"}'
   ```
3. Save the `simulationId`
4. Send messages:
   ```bash
   curl -X POST http://localhost:3000/api/v1/simulations/$SIMULATION_ID/message \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content": "Thanks for reaching out. Tell me more about your needs."}'
   ```

## Frontend Integration

The frontend API client already has simulation endpoints (see `lib/api/client.ts`):

```typescript
// Start simulation
const response = await api.simulations.start({
  scenarioType: 'PRICE_SENSITIVE'
});

// Send message
const messageResponse = await api.simulations.sendMessage(simulationId, {
  content: 'Your response...'
});

// Get simulation
const simulation = await api.simulations.get(simulationId);

// Complete simulation
await api.simulations.complete(simulationId);
```

## Future Enhancements

1. **Pattern Extraction**
   - Analyze completed simulations to extract business owner patterns
   - Use results to train lead qualification AI

2. **Vector Embeddings**
   - Chunk simulation transcripts
   - Store in Pinecone for semantic search
   - Use during lead conversations for context

3. **Confidence Scoring**
   - Detect uncertain responses in AI
   - Flag for human review
   - Track confidence trends

4. **Token Optimization**
   - Summarize conversation history for longer simulations
   - Reduce tokens while maintaining context
   - Dynamic temperature adjustment based on scenario

5. **A/B Testing**
   - Compare AI responses to same user input
   - Measure effectiveness of different prompts
   - Optimize scenario configurations

## Troubleshooting

### "AI service rate limited"
- Anthropic has rate limits by plan
- Implement exponential backoff retry (currently not implemented)
- Contact Anthropic for higher limits if needed

### API Key Not Found
- Check `ANTHROPIC_API_KEY` is set in `.env.local`
- Verify key is valid at https://console.anthropic.com/account/keys

### Simulation Not Found
- Verify simulation ID is correct
- Verify you're accessing your own tenant's simulation (401/403 error)

### Slow Responses
- Normal: Claude Sonnet 4 takes 1-2 seconds
- If >5 seconds: Check Anthropic API status
- Latency is logged in response under `latencyMs`

## Architecture Diagram

```
User Action (Frontend)
    ↓
API Endpoint (/simulations/start, /message)
    ↓
withAuth Middleware
    ↓
Route Handler
    ├─ Validate Request
    ├─ Fetch Simulation from Prisma
    ├─ Generate Prompt
    └─ Call AI Client
         ↓
    lib/ai/client.ts
    ├─ Create Anthropic Client
    ├─ Send Request to Claude
    ├─ Track Tokens & Latency
    └─ Return Response
         ↓
    prisma.simulationMessage.create()
    └─ Store message in DB
         ↓
    Return Response to Frontend
```

## References

- [Anthropic API Docs](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Claude Models](https://docs.anthropic.com/claude/docs/models-overview)
- [Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/introduction-to-prompt-design)
