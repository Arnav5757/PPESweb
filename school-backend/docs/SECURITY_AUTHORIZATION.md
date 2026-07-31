# Enterprise Authorization & Security Architecture Policy

This document serves as the canonical reference for the authentication, authorization, and ownership architecture of the School ERP backend.

---

## 1. System Architecture

The security model separates concerns by delegating operations through distinct components:

```
Incoming Request
      ↓
verifyToken (JWT Signature Verification)
      ↓
userRepository (Retrieve fresh account record via Repository Layer)
      ↓
accountService (Validate user status: Active / Suspended)
      ↓
permissionService (Validate user roles and permissions)
      ↓
authorizationService (Framework-agnostic evaluator assessing resource scope)
      ↓
Pluggable Strategy (Delegates checks to studentOwnership, teacherOwnership, etc.)
      ↓
Controller (Main action execution)
      ↓
auditService (Records structured event details to security activity logs)
```

### Responsibility Boundaries

* **verifyToken Middleware**: Signature verification, user payload decode, fresh state lookup, and context injection.
* **userRepository**: Pure data-access methods for the User collection (no authorization/business logic).
* **accountService**: Evaluates account lifecycle state (Active, Suspended, Inactive).
* **permissionService**: Validates role capabilities and fine-grained permissions mapping.
* **authorizationService**: Central evaluator deciding scope permissions and invoking pluggable ownership strategies. Returns standard result schemas.
* **Pluggable Strategy**: Specific ownership matcher checks (e.g. Student matches student profile).
* **auditService**: Records events to security activity logs.

---

## 2. Centralized Authorization Matrix

| HTTP Method | Route Endpoint | Authentication | Allowed Roles | Ownership Strategy | Middleware Applied |
| ----------- | -------------- | -------------- | ------------- | ------------------ | ------------------ |
| `GET`       | `/api/students/:id` | Yes | `admin`, `teacher`, `student` | `studentOwnership` | `verifyToken`, `authorizeOwnership(Student)` |
| `PUT`       | `/api/students/:id` | Yes | `admin`, `student` | `studentOwnership` | `verifyToken`, `authorizeOwnership(Student)` |
| `DELETE`    | `/api/students/:id` | Yes | `admin` | None | `verifyToken`, `verifyAdmin` |
| `GET`       | `/api/teachers/:id` | Yes | `admin`, `teacher` | `teacherOwnership` | `verifyToken`, `authorizeOwnership(Teacher)` |
| `PUT`       | `/api/teachers/:id` | Yes | `admin`, `teacher` | `teacherOwnership` | `verifyToken`, `authorizeOwnership(Teacher)` |
| `DELETE`    | `/api/teachers/:id` | Yes | `admin` | None | `verifyToken`, `verifyAdmin` |

---

## 3. Future Performance: Redis Authorization Cache

To optimize database reads inside the verification middleware, we can introduce a caching layer for active user profiles.

### Planned Cache Architecture:
```
JWT -> Redis Cache Lookup -> Found? -> Use User Profile
                       -> Not Found? -> DB query -> Cache result -> Use User Profile
```

* **Invalidation Trigger**: Whenever the User status is updated (e.g. suspended) or their linked profile changes, invalidate the cache key `user:profile:<userId>`.
* Caching will be integrated cleanly within the `userRepository` layer, preserving all middleware contracts.

---

## 4. Security Regression Checklist

Before merging any pull request that registers a new API route, developers must ensure the following checklist is satisfied:

- [ ] Route is explicitly protected by `verifyToken` middleware (unless deliberately public).
- [ ] Route requires explicit roles/permissions check using `authorizeOwnership` or `verifyAdmin`.
- [ ] Direct Object References (e.g., query params, params, request body IDs) are ownership-validated using an ownership strategy.
- [ ] Security failures (401, 403, role mismatch) trigger structured logs via `auditService`.
- [ ] Integration tests are added covering access success, access denial, and invalid token inputs.
- [ ] The Authorization Matrix in this file is updated.

---

## 5. Extension Guide for Future ERP Modules

To add authorization support for a new ERP module (e.g., parent portal):

1. **Register Constants**: Add any new roles to `config/roles.js` and permissions to `config/permissions.js`.
2. **Define Ownership Strategy**: Create a new strategy file under `services/ownershipStrategies/` (e.g. `parentOwnership.js`).
3. **Bind Strategy**: Register the new strategy inside `services/authorizationService.js`:
   ```javascript
   const strategies = {
     student: require("./ownershipStrategies/studentOwnership"),
     teacher: require("./ownershipStrategies/teacherOwnership"),
     parent: require("./ownershipStrategies/parentOwnership"),
     ...
   };
   ```
4. **Apply Middleware**: Configure the new route using `authorizeOwnership({ allowedRoles: [ROLE.ADMIN, ROLE.PARENT], strategy: "parent" })`.
