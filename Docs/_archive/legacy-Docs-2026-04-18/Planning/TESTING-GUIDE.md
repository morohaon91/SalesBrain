# AI Simulation API Testing Guide

## Prerequisites

1. **Environment Setup**
   - Ensure `.env.local` has `ANTHROPIC_API_KEY` set
   - Run `npm run dev` to start dev server
   - API running on `http://localhost:3000`

2. **Get Authentication Token**
   - Register or login via http://localhost:3000/register or /login
   - Extract the JWT token from localStorage after login:
     ```javascript
     // In browser console
     console.log(localStorage.getItem('token'))
     ```
   - Use this token in all API requests as: `Authorization: Bearer {TOKEN}`

## Test Scenarios

### Quick Test (5 minutes)

#### 1. Start Simulation
```bash
curl -X POST http://localhost:3000/api/v1/simulations/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenarioType": "PRICE_SENSITIVE"}' | jq
```

**Expected Response**:
- `success: true`
- `simulationId`: UUID
- `initialMessage`: Multi-sentence greeting from AI client
- `aiPersona`: Client details

**Save the `simulationId` for next steps**

---

#### 2. Send First Message
```bash
curl -X POST http://localhost:3000/api/v1/simulations/{simulationId}/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Thanks for reaching out. Id like to understand your needs better before discussing pricing."}' | jq
```

**Expected Response**:
- `success: true`
- `messageId`: Your message ID
- `aiResponse`:
  - `messageId`: AI response ID
  - `content`: Price-focused objection or question
  - `latencyMs`: 1000-2000 (normal)
  - `tokensUsed`: 50-200

---

#### 3. Get Simulation Status
```bash
curl http://localhost:3000/api/v1/simulations/{simulationId} \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

**Expected Response**:
- `success: true`
- `messages`: Array with your message and AI response
- `status`: "IN_PROGRESS"
- `duration`: Seconds elapsed
- `aiPersona`: Client details

---

#### 4. Complete Simulation
```bash
curl -X POST http://localhost:3000/api/v1/simulations/{simulationId}/complete \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

**Expected Response**:
- `success: true`
- `status`: "COMPLETED"
- `qualityScore`: 0-100
- `messageCount`: Number of exchanges

---

### Full Test (30 minutes)

Follow the Quick Test above, but do it for all 5 scenarios:

```bash
for scenario in PRICE_SENSITIVE INDECISIVE DEMANDING TIME_PRESSURED HIGH_BUDGET
do
  echo "Testing: $scenario"

  # Start
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/simulations/start \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"scenarioType\": \"$scenario\"}")

  SIM_ID=$(echo $RESPONSE | jq -r '.data.simulationId')
  echo "Simulation: $SIM_ID"

  # Send 3 messages
  for i in 1 2 3
  do
    curl -s -X POST http://localhost:3000/api/v1/simulations/$SIM_ID/message \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"content\": \"Message $i\"}" > /dev/null
    echo "Message $i sent"
    sleep 1
  done

  # Complete
  curl -s -X POST http://localhost:3000/api/v1/simulations/$SIM_ID/complete \
    -H "Authorization: Bearer $TOKEN" | jq '.data.qualityScore'

  echo "---"
done
```

---

### Performance Test (10 concurrent simulations)

```bash
#!/bin/bash

TOKEN="YOUR_TOKEN"

for i in {1..10}
do
  (
    # Start simulation
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/simulations/start \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"scenarioType": "PRICE_SENSITIVE"}')

    SIM_ID=$(echo $RESPONSE | jq -r '.data.simulationId')
    echo "[$i] Started: $SIM_ID"

    # Send 5 messages
    for j in {1..5}
    do
      START=$(date +%s%N | cut -b1-13)
      curl -s -X POST http://localhost:3000/api/v1/simulations/$SIM_ID/message \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"content\": \"Message $j\"}" > /dev/null
      END=$(date +%s%N | cut -b1-13)
      LATENCY=$((END - START))
      echo "[$i:$j] Latency: ${LATENCY}ms"
    done

    # Complete
    curl -s -X POST http://localhost:3000/api/v1/simulations/$SIM_ID/complete \
      -H "Authorization: Bearer $TOKEN" > /dev/null
    echo "[$i] Completed"
  ) &
done

wait
echo "All done"
```

---

## Expected Behavior by Scenario

### PRICE_SENSITIVE
- **First message** should mention budget concerns
- **Objections** about pricing, value for money
- **Questions** about minimum spend, payment terms
- **Tone** direct, negotiation-focused

Example conversation:
```
You: "Our pricing is $15k for a 3-month engagement"
AI: "That's quite a bit for a startup. Can you break down what's included?"
```

### INDECISIVE
- **First message** asks exploratory questions
- **Objections** about risk, ROI uncertainty
- **Questions** about guarantees, success metrics
- **Tone** cautious, needs reassurance

Example conversation:
```
You: "We have a proven track record with 50+ clients"
AI: "That's good to hear, but how do I know it will work for my specific situation?"
```

### DEMANDING
- **First message** sets high expectations
- **Objections** about execution, team quality
- **Questions** detailed about scope, timeline, deliverables
- **Tone** professional, detail-oriented

Example conversation:
```
You: "We'll provide weekly updates"
AI: "That's helpful, but I need daily visibility into progress."
```

### TIME_PRESSURED
- **First message** emphasizes urgency
- **Objections** about timeline delays
- **Questions** about speed of implementation
- **Tone** urgent, solutions-focused

Example conversation:
```
You: "We can start in 2 weeks"
AI: "2 weeks is too long. We need to start this week."
```

### HIGH_BUDGET
- **First message** explores partnership
- **Objections** about long-term commitment, cultural fit
- **Questions** about team, approach, company vision
- **Tone** formal, relationship-focused

Example conversation:
```
You: "We work with companies to scale their operations"
AI: "Interesting. How do you approach understanding company culture?"
```

---

## Debugging

### Check API Logs

The server logs API calls. Look for:
```
[AI Usage] simulation - 400 tokens (1250ms) - $0.0045
```

This shows:
- Type of request: `simulation`
- Tokens used: `400` (input + output)
- Response time: `1250ms`
- Estimated cost: `$0.0045`

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `UNAUTHORIZED` | Invalid/missing token | Re-login, check localStorage |
| `FORBIDDEN` | Accessing another tenant's data | Check simulation belongs to you |
| `NOT_FOUND` | Simulation doesn't exist | Check simulation ID is correct |
| `AI_ERROR` | Anthropic API down/rate limited | Wait and retry, check API status |
| `VALIDATION_ERROR` | Invalid request body | Check field types and required fields |

### Test with Different Tokens

Ensure authentication works:
```bash
# Without token - should fail
curl http://localhost:3000/api/v1/simulations/start \
  -H "Content-Type: application/json" \
  -d '{"scenarioType": "PRICE_SENSITIVE"}'

# With invalid token - should fail
curl http://localhost:3000/api/v1/simulations/start \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{"scenarioType": "PRICE_SENSITIVE"}'

# With valid token - should succeed
curl http://localhost:3000/api/v1/simulations/start \
  -H "Authorization: Bearer $VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scenarioType": "PRICE_SENSITIVE"}'
```

---

## Load Testing

### Using Apache Bench

```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -p body.json \
  http://localhost:3000/api/v1/simulations/start

# body.json contents:
# {"scenarioType": "PRICE_SENSITIVE"}
```

Expected results (dev server):
- **Requests/sec**: 5-10
- **Mean latency**: 1000-2000ms (dominated by AI API call)
- **95th percentile**: 2000-3000ms

### Using Artillery

```bash
npm install -g artillery

# Create load-test.yml
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Simulation Flow"
    flow:
      - post:
          url: "/api/v1/simulations/start"
          headers:
            Authorization: "Bearer {{ $env.TOKEN }}"
          json:
            scenarioType: PRICE_SENSITIVE
          capture:
            json: $.data.simulationId
            as: simulationId
      - think: 2
      - post:
          url: "/api/v1/simulations/{{ simulationId }}/message"
          headers:
            Authorization: "Bearer {{ $env.TOKEN }}"
          json:
            content: "Tell me more about your pricing"
```

Run:
```bash
TOKEN=YOUR_TOKEN artillery run load-test.yml
```

---

## Database Verification

Check simulations were saved:

```sql
-- Connect to your database
psql $DATABASE_URL

-- List all simulations
SELECT id, "scenarioType", status, duration, "qualityScore", "createdAt"
FROM "Simulation"
ORDER BY "createdAt" DESC
LIMIT 10;

-- List all messages for a simulation
SELECT id, role, "createdAt", "tokensUsed", "latencyMs"
FROM "SimulationMessage"
WHERE "simulationId" = '{simulationId}'
ORDER BY "createdAt" ASC;
```

---

## Frontend Integration Test

Once frontend is ready:

1. Open http://localhost:3000/simulations
2. Click "Start New Simulation"
3. Select scenario type
4. Send messages and verify they work
5. Check:
   - Messages appear immediately
   - AI responses within 2-3 seconds
   - Conversation flows naturally
   - Quality score shows on completion

---

## Cost Tracking

Each API call logs cost. Monitor with:

```bash
npm run dev 2>&1 | grep "AI Usage"
```

Expected cost:
- Per exchange: ~$0.003-0.005
- Per 10-exchange simulation: ~$0.04
- Typical usage: 1 sim/user/day = ~$0.04 per user per month

---

## Checklist

- [ ] Start simulation - success
- [ ] Send message - success
- [ ] Get simulation - shows full transcript
- [ ] Complete simulation - shows quality score
- [ ] List simulations - pagination works
- [ ] All 5 scenarios behave differently
- [ ] Error handling works (invalid token, not found)
- [ ] Latency acceptable (1-2 sec per message)
- [ ] Tokens tracked in response
- [ ] Database stores all messages
- [ ] No TypeScript errors

---

## Support

If tests fail:

1. **Check server logs** for errors
2. **Verify ANTHROPIC_API_KEY** is set
3. **Check database connection** is working
4. **Verify token is valid** and not expired
5. **Check request format** matches schema

Questions? See `docs/AI-INTEGRATION.md` for detailed docs.
