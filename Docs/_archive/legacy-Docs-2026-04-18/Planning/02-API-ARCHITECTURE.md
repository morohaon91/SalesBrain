# API Architecture & Endpoints

## API Design Philosophy

### Principles
- **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Tenant-scoped**: All endpoints require authentication and tenant context
- **Versioned**: `/api/v1/...` structure for future compatibility
- **Consistent**: Standardized response format across all endpoints
- **Secure**: JWT authentication, rate limiting, input validation

---

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "uuid",
  "tenantId": "uuid",
  "email": "user@example.com",
  "role": "OWNER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Refresh Strategy
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- HTTP-only cookies for refresh tokens
- Sliding window refresh (refresh when <5min remaining)

### Authorization Levels
1. **Public**: No auth required (widget endpoints)
2. **Authenticated**: Valid JWT required
3. **Owner**: OWNER or ADMIN role required
4. **System**: Internal API calls only

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2026-03-17T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2026-03-17T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## API Endpoints

## 1. Authentication & User Management

### POST /api/v1/auth/register
**Description**: Register new business owner (creates tenant + user)
**Auth**: Public
**Rate Limit**: 5 requests/hour per IP

**Request Body**:
```json
{
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "businessName": "Doe Consulting",
  "industry": "Business Consulting"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "tenantId": "uuid",
    "email": "owner@example.com",
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

**Validation**:
- Email: valid format, unique
- Password: min 8 chars, 1 uppercase, 1 number
- Name: 2-100 chars
- Business name: 2-200 chars

---

### POST /api/v1/auth/login
**Description**: Login existing user
**Auth**: Public
**Rate Limit**: 10 requests/hour per IP

**Request Body**:
```json
{
  "email": "owner@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "tenantId": "uuid",
    "name": "John Doe",
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

---

### POST /api/v1/auth/refresh
**Description**: Refresh access token
**Auth**: Refresh token in HTTP-only cookie
**Rate Limit**: Unlimited

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token"
  }
}
```

---

### POST /api/v1/auth/logout
**Description**: Logout and invalidate tokens
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### GET /api/v1/user/profile
**Description**: Get current user profile
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "owner@example.com",
    "name": "John Doe",
    "role": "OWNER",
    "tenantId": "uuid",
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

---

### PUT /api/v1/user/profile
**Description**: Update user profile
**Auth**: Authenticated

**Request Body**:
```json
{
  "name": "John M. Doe",
  "notificationEmail": "notifications@example.com"
}
```

---

## 2. Tenant & Settings Management

### GET /api/v1/tenant
**Description**: Get tenant details and settings
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessName": "Doe Consulting",
    "industry": "Business Consulting",
    "website": "https://example.com",
    "subscriptionTier": "PRO",
    "subscriptionStatus": "ACTIVE",
    "widgetEnabled": true,
    "widgetApiKey": "widget-api-key",
    "conversationsThisMonth": 45,
    "conversationsLimit": 500
  }
}
```

---

### PUT /api/v1/tenant/settings
**Description**: Update tenant settings
**Auth**: Owner

**Request Body**:
```json
{
  "businessName": "Doe Consulting LLC",
  "website": "https://doeconsulting.com",
  "notificationEmail": "leads@example.com",
  "emailNotifications": true,
  "widgetColor": "#3B82F6",
  "widgetPosition": "bottom-right",
  "widgetGreeting": "Hi! Looking for consulting help?",
  "aiTransparency": true,
  "leadHandoffMethod": "email"
}
```

---

### POST /api/v1/tenant/widget/regenerate-key
**Description**: Regenerate widget API key
**Auth**: Owner

**Response**:
```json
{
  "success": true,
  "data": {
    "widgetApiKey": "new-widget-api-key",
    "oldKeyValidUntil": "2026-03-24T10:00:00Z"
  }
}
```

---

## 3. Simulation System

### POST /api/v1/simulations/start
**Description**: Start a new simulation session
**Auth**: Authenticated

**Request Body**:
```json
{
  "scenarioType": "PRICE_SENSITIVE"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "simulationId": "uuid",
    "scenarioType": "PRICE_SENSITIVE",
    "aiPersona": {
      "clientType": "Startup founder",
      "budget": "Limited, looking for value",
      "painPoints": ["Need results fast", "Limited budget"],
      "personality": "Direct but price-conscious"
    },
    "status": "IN_PROGRESS"
  }
}
```

---

### POST /api/v1/simulations/{simulationId}/message
**Description**: Send message in simulation
**Auth**: Authenticated
**Rate Limit**: 60 requests/minute

**Request Body**:
```json
{
  "content": "I understand budget is important. Let me explain our pricing structure..."
}
```

**Response**:
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
      "latencyMs": 1250
    }
  }
}
```

---

### POST /api/v1/simulations/{simulationId}/complete
**Description**: Mark simulation as complete and trigger analysis
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "simulationId": "uuid",
    "status": "COMPLETED",
    "duration": 1845,
    "messageCount": 32,
    "extractedPatterns": {
      "communicationStyle": { /* ... */ },
      "pricingLogic": { /* ... */ }
    },
    "qualityScore": 85
  }
}
```

---

### GET /api/v1/simulations
**Description**: List all simulations for tenant
**Auth**: Authenticated

**Query Parameters**:
- `status`: COMPLETED | IN_PROGRESS | ABANDONED
- `scenarioType`: Filter by scenario
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "scenarioType": "PRICE_SENSITIVE",
      "status": "COMPLETED",
      "duration": 1845,
      "completedAt": "2026-03-15T14:30:00Z",
      "qualityScore": 85
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /api/v1/simulations/{simulationId}
**Description**: Get simulation details and transcript
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "scenarioType": "PRICE_SENSITIVE",
    "status": "COMPLETED",
    "duration": 1845,
    "messages": [
      {
        "id": "uuid",
        "role": "AI_CLIENT",
        "content": "Hi, I'm interested in your services...",
        "createdAt": "2026-03-15T14:00:00Z"
      }
    ],
    "extractedPatterns": { /* ... */ }
  }
}
```

---

## 4. Business Profile

### GET /api/v1/profile
**Description**: Get current business profile
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isComplete": true,
    "completionScore": 85,
    "communicationStyle": {
      "tone": "professional",
      "formality": 4,
      "responseLength": "detailed",
      "keyPhrases": ["I understand", "Let me explain"]
    },
    "pricingLogic": {
      "minBudget": 5000,
      "maxBudget": 50000,
      "flexibility": 3,
      "dealBreakers": ["Unrealistic timeline", "No budget defined"]
    },
    "qualificationCriteria": {
      "mustHaves": ["Clear project scope", "Decision maker present"],
      "idealClient": ["B2B", "Series A+", "Tech industry"]
    },
    "embeddingsCount": 156
  }
}
```

---

### PUT /api/v1/profile
**Description**: Update business profile manually
**Auth**: Owner

**Request Body**:
```json
{
  "pricingLogic": {
    "minBudget": 10000,
    "dealBreakers": ["No budget", "Unrealistic timeline", "Poor fit"]
  }
}
```

---

### POST /api/v1/profile/refresh
**Description**: Re-analyze simulations and rebuild profile
**Auth**: Owner

**Response**:
```json
{
  "success": true,
  "data": {
    "profileId": "uuid",
    "simulationsAnalyzed": 5,
    "embeddingsCreated": 178,
    "completionScore": 92
  }
}
```

---

## 5. Lead Conversations (Live Chat)

### POST /api/v1/widget/conversation/start
**Description**: Start new widget conversation (public endpoint)
**Auth**: Widget API Key (header: `X-Widget-Api-Key`)
**Rate Limit**: 100 requests/hour per IP

**Request Body**:
```json
{
  "sessionId": "client-generated-uuid",
  "metadata": {
    "page": "https://example.com/services",
    "referrer": "https://google.com",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "greeting": "Hi! How can I help you today?",
    "aiName": "John's AI Assistant",
    "showAiBadge": true
  }
}
```

---

### POST /api/v1/widget/conversation/{conversationId}/message
**Description**: Send message in widget conversation
**Auth**: Widget API Key
**Rate Limit**: 60 requests/minute per conversation

**Request Body**:
```json
{
  "content": "I'm looking for consulting services for my startup"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "messageId": "uuid",
    "role": "LEAD",
    "content": "I'm looking for consulting services...",
    "aiResponse": {
      "messageId": "uuid",
      "role": "AI",
      "content": "Great! I'd love to help. What specific area are you looking for consulting in?",
      "confidenceScore": 0.95,
      "detectedIntent": "qualification"
    },
    "qualificationStatus": "MAYBE",
    "leadScore": 45
  }
}
```

---

### POST /api/v1/widget/conversation/{conversationId}/end
**Description**: End widget conversation
**Auth**: Widget API Key

**Response**:
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "duration": 420,
    "messageCount": 12,
    "finalScore": 78,
    "qualificationStatus": "QUALIFIED",
    "summary": "Lead is startup founder looking for growth consulting..."
  }
}
```

---

### GET /api/v1/conversations
**Description**: List all conversations for tenant (dashboard)
**Auth**: Authenticated

**Query Parameters**:
- `status`: ACTIVE | ENDED | ABANDONED
- `qualificationStatus`: QUALIFIED | UNQUALIFIED | MAYBE
- `minScore`: Minimum lead score (0-100)
- `startDate`: ISO date
- `endDate`: ISO date
- `page`: Page number
- `pageSize`: Items per page

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "createdAt": "2026-03-17T09:15:00Z",
      "status": "ENDED",
      "qualificationStatus": "QUALIFIED",
      "leadScore": 85,
      "messageCount": 15,
      "duration": 480,
      "leadName": "Sarah Johnson",
      "leadEmail": "sarah@startup.com",
      "summary": "Interested in 3-month consulting package..."
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /api/v1/conversations/{conversationId}
**Description**: Get full conversation details
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "createdAt": "2026-03-17T09:15:00Z",
    "endedAt": "2026-03-17T09:23:00Z",
    "status": "ENDED",
    "qualificationStatus": "QUALIFIED",
    "leadScore": 85,
    "lead": {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@startup.com",
      "company": "TechStart Inc"
    },
    "messages": [
      {
        "id": "uuid",
        "role": "LEAD",
        "content": "Hi, I need help with...",
        "createdAt": "2026-03-17T09:15:30Z"
      }
    ],
    "summary": "Qualified lead looking for consulting...",
    "nextSteps": "Schedule discovery call to discuss project scope"
  }
}
```

---

### PUT /api/v1/conversations/{conversationId}/review
**Description**: Owner reviews and updates conversation
**Auth**: Authenticated

**Request Body**:
```json
{
  "ownerViewed": true,
  "ownerNotes": "Promising lead, follow up tomorrow",
  "leadStatus": "CONTACTED"
}
```

---

## 6. Lead Management

### GET /api/v1/leads
**Description**: List all leads
**Auth**: Authenticated

**Query Parameters**:
- `status`: NEW | CONTACTED | QUALIFIED | etc.
- `minScore`: Minimum qualification score
- `search`: Search in name/email/company
- `sortBy`: createdAt | qualificationScore | lastContactAt
- `order`: asc | desc

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Sarah Johnson",
      "email": "sarah@startup.com",
      "company": "TechStart Inc",
      "status": "NEW",
      "qualificationScore": 85,
      "firstContactAt": "2026-03-17T09:15:00Z",
      "conversationsCount": 1,
      "ownerViewed": false
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### GET /api/v1/leads/{leadId}
**Description**: Get lead details with full conversation history
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Sarah Johnson",
    "email": "sarah@startup.com",
    "phone": "+1-555-0123",
    "company": "TechStart Inc",
    "status": "NEW",
    "qualificationScore": 85,
    "budget": "$10k-25k",
    "timeline": "3-6 months",
    "painPoints": ["Need to scale sales", "Limited internal resources"],
    "conversations": [
      {
        "id": "uuid",
        "createdAt": "2026-03-17T09:15:00Z",
        "messageCount": 15,
        "summary": "Discussed consulting needs..."
      }
    ],
    "ownerNotes": "Follow up tomorrow"
  }
}
```

---

### PUT /api/v1/leads/{leadId}
**Description**: Update lead information
**Auth**: Authenticated

**Request Body**:
```json
{
  "status": "CONTACTED",
  "ownerNotes": "Had discovery call, sending proposal",
  "ownerContacted": true
}
```

---

## 7. Analytics & Metrics

### GET /api/v1/analytics/overview
**Description**: Get dashboard overview metrics
**Auth**: Authenticated

**Query Parameters**:
- `period`: today | week | month | custom
- `startDate`: ISO date (if custom)
- `endDate`: ISO date (if custom)

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "month",
    "totalConversations": 87,
    "qualifiedLeads": 23,
    "unqualifiedLeads": 48,
    "maybeLeads": 16,
    "averageScore": 62.5,
    "conversionRate": 0.26,
    "uniqueVisitors": 340,
    "avgMessagesPerConvo": 11.2,
    "avgDuration": 385,
    "topQuestions": [
      { "question": "What's your pricing?", "count": 34 },
      { "question": "How long does it take?", "count": 28 }
    ]
  }
}
```

---

### GET /api/v1/analytics/trends
**Description**: Get time-series data for charts
**Auth**: Authenticated

**Query Parameters**:
- `metric`: conversations | leads | score | duration
- `period`: 7d | 30d | 90d
- `granularity`: hour | day | week

**Response**:
```json
{
  "success": true,
  "data": {
    "metric": "conversations",
    "period": "7d",
    "dataPoints": [
      { "date": "2026-03-11", "value": 12 },
      { "date": "2026-03-12", "value": 15 },
      { "date": "2026-03-13", "value": 8 }
    ]
  }
}
```

---

### GET /api/v1/analytics/ai-performance
**Description**: Get AI performance metrics
**Auth**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "avgConfidence": 0.87,
    "escalationRate": 0.08,
    "avgResponseTime": 1250,
    "uncertainInteractions": 7,
    "topUncertainTopics": [
      { "topic": "Custom pricing for enterprise", "count": 3 },
      { "topic": "International availability", "count": 2 }
    ]
  }
}
```

---

## 8. Notifications

### GET /api/v1/notifications
**Description**: Get user notifications
**Auth**: Authenticated

**Query Parameters**:
- `read`: true | false
- `type`: Filter by notification type

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "WARM_LEAD_DETECTED",
      "title": "New qualified lead",
      "message": "Sarah Johnson (TechStart Inc) - Score: 85",
      "read": false,
      "createdAt": "2026-03-17T09:25:00Z",
      "conversationId": "uuid"
    }
  ],
  "unreadCount": 3
}
```

---

### PUT /api/v1/notifications/{notificationId}/read
**Description**: Mark notification as read
**Auth**: Authenticated

---

### PUT /api/v1/notifications/read-all
**Description**: Mark all notifications as read
**Auth**: Authenticated

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `TENANT_LIMIT_EXCEEDED` | 403 | Subscription limit reached |
| `AI_ERROR` | 500 | AI provider error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

### Strategy: Token Bucket Algorithm

**Limits by Tier**:
- **Trial**: 60 requests/minute
- **Basic**: 120 requests/minute
- **Pro**: 300 requests/minute
- **Premium**: 600 requests/minute

**Special Endpoints**:
- Widget endpoints: Separate limit (100/hour per IP)
- Auth endpoints: Stricter limits (see individual endpoints)

**Headers**:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1678901234
```

---

## WebSocket/Real-Time Events

### Connection
**Endpoint**: `wss://api.yourapp.com/v1/realtime`
**Auth**: JWT token in query parameter or header

### Events from Server

#### conversation.started
```json
{
  "event": "conversation.started",
  "data": {
    "conversationId": "uuid",
    "createdAt": "2026-03-17T10:00:00Z"
  }
}
```

#### conversation.message
```json
{
  "event": "conversation.message",
  "data": {
    "conversationId": "uuid",
    "messageId": "uuid",
    "role": "LEAD",
    "content": "Message content..."
  }
}
```

#### lead.qualified
```json
{
  "event": "lead.qualified",
  "data": {
    "conversationId": "uuid",
    "leadId": "uuid",
    "score": 85,
    "status": "QUALIFIED"
  }
}
```

---

## API Documentation

### Auto-Generated Docs
- **Swagger/OpenAPI**: `/api/docs`
- **Redoc**: `/api/redoc`
- **Postman Collection**: Available for download

### Example Usage (JavaScript)
```javascript
// Initialize API client
const api = new ApiClient({
  baseUrl: 'https://api.yourapp.com',
  token: 'jwt-token'
});

// Start simulation
const simulation = await api.simulations.start({
  scenarioType: 'PRICE_SENSITIVE'
});

// Send message
const response = await api.simulations.message(simulation.id, {
  content: 'Here\'s my pricing approach...'
});
```

---

**Next Steps:**
1. Implement base API infrastructure in Next.js
2. Set up authentication middleware
3. Build tenant isolation layer
4. Implement individual endpoints
5. Add comprehensive error handling
6. Write API tests
7. Generate OpenAPI documentation

---

**Document Status**: Complete - Ready for Implementation
**Last Updated**: March 2026
