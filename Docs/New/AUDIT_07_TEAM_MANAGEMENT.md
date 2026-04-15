# Audit Prompt 7: Team Management

**Purpose**: Understand if multiple team members can be added and if access control works.

**Run this with**: `claude --file [your-codebase] --file AI_Lead_Warmup_System_Baseline.md < AUDIT_07_TEAM_MANAGEMENT.md`

---

# Analysis Request: Team Management & Multi-User Access

You are a technical architect reviewing an existing SaaS system against a baseline product specification.

**Your task**: Analyze whether team members can be added and whether role-based access control is implemented.

---

## Baseline Requirements

### Team Management
- System supports **multiple team members per business**
- Access depends on **selected pricing plan**
- Team members can be added (invite flow implied)

### Access Control
- OWNER: full access
- ADMIN: access conversations, leads, profile, settings (no billing)
- VIEWER: read-only access

### Team Use Cases
- Multiple team members per tenant
- Sales team training using simulations
- Lead assignment to specific team members
- Different permission levels

---

## Analysis Questions

### Part 1: User & Role Model

#### 1.1 User Model

1. **What's the User model/schema?**
   - Show all fields
   - Is there a role field?
   - Is there a relationship to Tenant?
   - Show the exact schema

2. **What roles exist in code?**
   - List all roles (enum, constants, or database values)
   - OWNER, ADMIN, VIEWER?
   - Any other roles?

3. **Can a user belong to multiple tenants?**
   - One user → one tenant?
   - One user → multiple tenants?
   - Show the relationship

#### 1.2 Role Definitions

1. **For each role, what's the definition?**
   - OWNER: [permissions list]
   - ADMIN: [permissions list]
   - VIEWER: [permissions list]
   - Show where these are defined (code/comments)

2. **Are permissions explicit or implicit?**
   - Database table of permissions?
   - Hard-coded in middleware?
   - Role-permission mapping?

---

### Part 2: Team Member Invitation

#### 2.1 Invitation Flow

1. **Can owner invite team members?**
   - Yes / No / Partially
   - Show the code/UI for invitation

2. **What's the invitation flow?**
   ```
   Owner enters email → 
   Invitation sent → 
   Invitee receives email? → 
   Invitee clicks link → 
   Creates account? Or accepts invitation? → 
   Added to team
   ```
   Show the code for each step

3. **Is there an invitation API?**
   - Endpoint: POST /api/v1/users/invite?
   - Show the code

4. **How long is invitation valid?**
   - Expires after X days?
   - Or never expires?
   - Can owner revoke?

#### 2.2 Invitation UI

1. **Is there a "Invite Team Member" button on dashboard?**
   - Where? (Settings page?)
   - Show the component code

2. **Does owner see list of pending invitations?**
   - Yes/No
   - Can they resend or cancel?

---

### Part 3: Team Member List & Management

#### 3.1 Team Members Page

1. **Is there a team management page?**
   - URL: [/dashboard/settings/team or similar]?
   - Show the component code

2. **What's displayed for each team member?**
   - Name, email?
   - Role?
   - Status (Active, Pending invite)?
   - Join date?
   - Last login?

3. **Can owner manage team members?**
   - Change role? [yes/no]
   - Remove member? [yes/no]
   - Promote/demote? [yes/no]
   - Suspend? [yes/no]

#### 3.2 User List API

1. **Are there APIs for team management?**
   - GET /api/v1/users (list team members)?
   - PUT /api/v1/users/[id] (update role)?
   - DELETE /api/v1/users/[id] (remove)?
   - Show the endpoints

---

### Part 4: Access Control Enforcement

#### 4.1 Middleware/Authorization

1. **How is access controlled?**
   - Middleware checks role for each endpoint?
   - API gates certain features?
   - Frontend hides features?
   - Show the authorization code

2. **Where is authorization checked?**
   - File location(s)?
   - Pattern used (decorator, middleware, function)?

3. **Is there a permission matrix?**
   - Explicit mapping of role → allowed endpoints?
   - Or implicit (VIEWER can't POST)?

#### 4.2 Feature-Level Access

1. **Which features require which roles?**
   - View conversations: [OWNER/ADMIN/VIEWER]?
   - Edit profile: [OWNER/ADMIN]?
   - View analytics: [OWNER/ADMIN/VIEWER]?
   - Access billing: [OWNER only]?
   - Add team member: [OWNER only]?
   - Show the matrix

2. **Is access control working correctly?**
   - Test example: Can VIEWER edit profile? [yes/no]
   - Test example: Can ADMIN access billing? [yes/no]

#### 4.3 Data-Level Access

1. **Does access control extend to data?**
   - Can VIEWER see all leads? [yes/no]
   - Can VIEWER see all conversations? [yes/no]
   - Can VIEWER only see assigned leads? [configurable/no]

2. **Is there data filtering?**
   - Conversations filtered by assigned user?
   - Leads filtered by assigned user?
   - Or everyone sees everything?

---

### Part 5: Lead Assignment

#### 5.1 Assignment Data Model

1. **Is there a lead assignment field?**
   - Lead.assignedToUserId?
   - Or separate AssignmentTable?
   - Show the schema

2. **Can one lead be assigned to multiple users?**
   - One lead → one user only?
   - One lead → multiple users?

#### 5.2 Assignment Workflow

1. **Can owner/admin assign leads to team members?**
   - Yes/No
   - UI location?
   - API: PUT /api/v1/leads/[id]/assign?

2. **Does assignment affect notifications?**
   - Only assigned user gets notified?
   - Or all team members see it?

3. **Does assignment affect permissions?**
   - Unassigned team member can't view lead?
   - Or just a workflow aid?

---

### Part 6: Activity Tracking Per User

#### 6.1 User Activity

1. **Is user activity tracked?**
   - Last login?
   - Last action timestamp?
   - List of actions taken?

2. **Can owner see activity per team member?**
   - Who accessed what?
   - When?
   - Show the UI/code

3. **Is there an audit log?**
   - Every action logged?
   - Per-user audit trail?

---

### Part 7: Permission Plan Limits

#### 7.1 Plan-Based Limits

1. **Does plan tier affect team size?**
   - Basic plan: 1 user (owner only)?
   - Pro plan: 5 users?
   - Enterprise: unlimited?
   - Show where this is enforced

2. **Is there validation on team member add?**
   - Check: plan allows N more team members?
   - Error if limit exceeded?
   - Show the code

3. **What happens at plan limit?**
   - Invite button disabled?
   - Error on invite?
   - Warning?

---

### Part 8: Session Management for Multiple Users

#### 8.1 Multi-Session Handling

1. **Can multiple team members be logged in simultaneously?**
   - Yes/No
   - From different devices?
   - Different browsers?

2. **Is there session isolation?**
   - Each user has own session?
   - Shared session state?

3. **If one user logs out, do others stay logged in?**
   - Yes/No

---

### Part 9: Gaps vs. Baseline

Analyze:

1. **Can team members be added?**
   - [yes/no/partial]

2. **Is role-based access working?**
   - [yes/no/partial]

3. **Is lead assignment implemented?**
   - [yes/no]

4. **Is access control enforced?**
   - [yes/no/partial]

5. **Are plan limits enforced?**
   - [yes/no]

---

## Output Format

Create a document with these sections:

### 1. Current Implementation Summary
- Team management: [working / partial / missing]
- Role-based access: [working / partial / missing]
- Lead assignment: [working / missing]

### 2. User & Role Model
```
User:
  id: String
  tenantId: String (FK to Tenant)
  email: String
  role: Enum (OWNER, ADMIN, VIEWER, other?)
  status: Enum (ACTIVE, PENDING_INVITE, etc.)
  lastLoginAt: DateTime
  createdAt: DateTime
  [other fields]
```

### 3. Roles Defined
- OWNER: [list permissions]
- ADMIN: [list permissions]
- VIEWER: [list permissions]
- [Any other roles]

### 4. Invitation System
- Implemented: [yes/no]
- Flow: [description]
- API endpoint: [POST /api/v1/users/invite]
- Code location: [file]
- Status: [working / missing / partial]

### 5. Team Members Page
- URL: [/dashboard/settings/team or N/A]
- Implemented: [yes/no]
- Features: [list manage options]
- Code location: [file]

### 6. Access Control
- Authorization check location: [file + pattern]
- Method: [middleware / API gate / frontend]
- Feature matrix:
  ```
  View conversations: OWNER/ADMIN/VIEWER
  Edit profile: OWNER/ADMIN
  Access billing: OWNER only
  [etc]
  ```
- Status: [working / partial / missing]

### 7. Lead Assignment
- Data model: [assignedToUserId / separate table]
- Implemented: [yes/no]
- Affects permissions: [yes/no]
- Affects notifications: [yes/no]
- Code location: [file]

### 8. Plan Limits
- Plan tiers define team size: [yes/no]
- Validation on invite: [yes/no]
- Limits enforced: [yes/no]
- Code location: [file / missing]

### 9. Multi-Session Support
- Multiple users logged in simultaneously: [yes/no]
- Session isolation: [yes/no]

### 10. Critical Gaps & Recommendations

**Missing**:
- [ ] Team member invitation system
- [ ] Role-based access control
- [ ] Lead assignment
- [ ] Permission enforcement

**Incomplete**:
- [ ] [Feature] partially implemented

**Needed for MVP**:
- At minimum: Basic team member addition + OWNER/VIEWER roles

**Deferred to Phase 2**:
- [ ] Advanced permissions
- [ ] Activity audit log
- [ ] Plan-based team size limits

**Effort to Fix**:
- Team invitation: X days
- RBAC: Y days
- Lead assignment: Z days

---

## Success Criteria

This audit is complete when you can:
1. State if team members can be added (yes/no)
2. State if roles are enforced (yes/no)
3. Confirm access control works correctly
4. Identify all gaps preventing multi-user support
