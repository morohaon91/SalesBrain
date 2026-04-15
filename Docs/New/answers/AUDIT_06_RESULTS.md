# AUDIT 6 Results: Notifications

**Audit Date**: April 13, 2026  
**System**: SalesBrain  
**Baseline**: AI Lead Warm-Up System Baseline  
**Auditor**: Claude AI Architect

---

## Executive Summary

SalesBrain has a **notification infrastructure with schema** but **limited implementation**. The system can theoretically send Hot lead alerts, conversation summaries, and subscription warnings. However, Hot lead notifications are **NOT wired to the scoring system**, so they never actually trigger. In-app notification display infrastructure exists but is **incomplete**.

**Overall Status**: ~40% aligned with baseline. Schema complete, triggering logic mostly missing.

---

## Notification Infrastructure

### Model & Fields

**Code Location**: `prisma/schema.prisma:447-470`

```prisma
model Notification {
  id            String   @id @default(uuid())
  createdAt     DateTime @default(now())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  type          NotificationType
  title         String
  message       String   @db.Text
  conversationId String?
  leadId        String?
  read          Boolean  @default(false)
  emailSent     Boolean  @default(false)
  emailSentAt   DateTime?
}

enum NotificationType {
  WARM_LEAD_DETECTED
  CONVERSATION_ENDED
  AI_UNCERTAIN
  DAILY_SUMMARY
  SUBSCRIPTION_ENDING
  LIMIT_REACHED
}
```

**Status**: ✅ **SCHEMA COMPREHENSIVE**

---

## Notification Types

| Type | MVP? | Working? | Status |
|------|------|----------|--------|
| WARM_LEAD_DETECTED | ✅ | ❌ | Not triggered |
| CONVERSATION_ENDED | ⚠️ | ❌ | Not triggered |
| AI_UNCERTAIN | ⚠️ | ❌ | Not triggered |
| DAILY_SUMMARY | ❌ | ❌ | Not implemented |
| SUBSCRIPTION_ENDING | ❌ | ❌ | Not implemented |
| LIMIT_REACHED | ❌ | ❌ | Not implemented |

**Status**: ⚠️ **SCHEMA EXISTS, TRIGGERING MISSING**

---

## Hot Lead Notifications

### When Sent

**Current**: ❌ **NEVER SENT**

**Should Be**: When lead score ≥ 80 (Hot)

**Current Gap**: No code triggers `WARM_LEAD_DETECTED` after scoring

**Code Location That's Missing**: Should be in conversation end flow after `scoreConversation()` call

**Status**: ❌ **NOT IMPLEMENTED**

### Content

**What Would Be Shown** (if implemented):
```
🔥 Hot Lead Alert!

Lead: Alice Johnson (alice@company.com)
Score: 85 | Budget: $50k | Timeline: 3 months
Status: Hot

Action: VIEW LEAD or CALL NOW
```

**Status**: ❌ **TEMPLATE NOT IMPLEMENTED**

---

## In-App Notification Display

### Bell Icon / Notifications Page

**Status**: ⚠️ **INFRASTRUCTURE READY, UI MISSING**

**What Could Exist**:
- Bell icon in dashboard header
- Notifications page at `/dashboard/notifications`
- Mark as read functionality
- Delete notification

**Current**: Likely missing from main dashboard

**Status**: ⚠️ **NOT FOUND IN CODE REVIEW**

### Display Location

**Where Notifications Show**:
- ⚠️ In-app UI (not implemented)
- ⚠️ Email notifications (infrastructure ready)

**Current Gap**: No notification bell/dropdown in dashboard UI

**Status**: ⚠️ **UI NOT IMPLEMENTED**

---

## Real-Time Delivery

### Mechanism

**Status**: ⚠️ **INFRASTRUCTURE READY, NO REAL-TIME MECHANISM**

**What Should Happen**:
- WebSocket push to browser
- OR SSE (Server-Sent Events) stream
- OR polling for new notifications

**Current**: Only polling if UI were implemented

**Status**: ⚠️ **POLLING ONLY (if UI existed)**

### Latency

**If Polling**: ~5 seconds (typical React Query interval)

**Baseline Expectation**: Instant as lead becomes Hot

**Gap**: 5+ second delay from Hot scoring to notification display

**Status**: ⚠️ **ACCEPTABLE BUT NOT INSTANT**

---

## Notification Persistence

### Storage

**Status**: ✅ **YES, PERSISTED IN DB**

```prisma
model Notification {
  id        String   @id
  createdAt DateTime
  read      Boolean
  // ... fields
}
```

**Where**: `Notification` table in PostgreSQL

**History**: ✅ Full history available

**Status**: ✅ **PERSISTENT STORAGE**

---

## Multi-User Notifications

### Who Gets Notified

**Baseline**: All team members with "notify" permission

**Current**: Schema supports tenantId, so team members share notifications

**Limitation**: No per-user notification preferences

**Status**: ⚠️ **TEAM-LEVEL ONLY, NO GRANULARITY**

### Team Member Notifications

**Status**: ⚠️ **SCHEMA SUPPORTS, UI NOT IMPLEMENTED**

**How It Works**: Notifications created at tenant level, all users see them

**What's Missing**: User-level notification settings (which types to receive)

**Status**: ⚠️ **BASIC IMPLEMENTATION**

---

## Critical Gaps

### Gap 1: Hot Lead Notifications Not Triggered

**Impact**: CRITICAL — Hot leads are never alerted to owner

**Fix**: Wire scoring system to create notifications

**Effort**: 1 day

### Gap 2: In-App UI Not Implemented

**Impact**: No notification bell, no notifications page

**Fix**: Add UI components to dashboard

**Effort**: 1-2 days

### Gap 3: No Real-Time Push

**Impact**: Notifications delivered via polling, not push

**Fix**: Implement WebSocket or SSE for push

**Effort**: 2-3 days

### Gap 4: No User Preferences

**Impact**: All team members get same notifications

**Fix**: Add notification settings per user

**Effort**: 1-2 days

---

## Recommendations

### Priority 1 (Critical for MVP)

1. **Wire Hot Lead Notifications** — Call notification create on scoring
2. **Implement In-App UI** — Add bell icon + notifications page
3. **Test Email Delivery** — Verify `emailSent` workflow

**Effort**: 2-3 days

### Priority 2 (Improve UX)

4. **Add Real-Time Push** — WebSocket for instant updates
5. **Add User Preferences** — Per-user notification settings

**Effort**: 3-4 days

---

## Summary

**Status**: ⚠️ **INFRASTRUCTURE COMPLETE, IMPLEMENTATION INCOMPLETE**

**Works**:
- ✅ Notification schema comprehensive
- ✅ Database persistence
- ✅ Email field ready for integration

**Missing**:
- ❌ Hot lead notifications (not triggered)
- ❌ In-app UI (bell icon, page)
- ❌ Real-time push (would use polling)
- ❌ User notification preferences

**Verdict**: Notification system is ~40% done. Schema is solid, but triggering logic and UI are missing. 2-3 days to MVP, 3-4 days to full feature parity.

---

