# Multi-tenancy Security Audit (TaskAlloc8or)

Date: 2026-02-02  
Scope: Reviewed every model in `models/` (no inline DB queries) and all route files as the effective controller layer (no `controllers/` or `services/` directories present). Focus: ensure each Mongo/Mongoose read/write is scoped by `tenantId` or `organizationId`.

## Summary
- Flagged 20 queries that read or mutate data without tenant scoping.
- Models lacking a tenant field (`models/Sprints.js`, `models/SprintYear.js`, `models/Groups.js`) make tenant-level isolation impossible for those collections.
- No usage of `organizationId` found; tenant isolation relies solely on `tenantId`.

## Findings (add tenantId/organizationId filtering)
- `routes/account.js:32` – `User.findOne({ email })` during login is global; users with identical emails across tenants can authenticate into the wrong tenant. Add `tenantId` to the filter (and to unique index strategy).
- `routes/customer-notes.js:38` – `CustomerNotes.find({ customerRef, sprintId })` lacks tenant filter; any tenant can read another tenant’s notes for the same customer/sprint IDs.
- `routes/customer-targets.js:16` – `CustomerTargets.find({ customerRef })` is unscoped; exposes target data across tenants.  
  `routes/customer-targets.js:46` – `findOneAndUpdate({ customerRef })` updates across tenants.
- `routes/customers.js:15` – `Customer.findOneAndUpdate({ _id: customerId })` updates without tenant check; crafted ID could modify another tenant’s customer.
- `routes/notifications.js:141` and `routes/notifications.js:142` – `User.findById(...)` calls in notification creation ignore tenant; user IDs from another tenant could receive Slack/email notifications.
- `routes/sprints.js:8`, `:24`, `:36`, `:53` – All sprint queries are global; with no tenant field on the schema, sprint data is shared across tenants.
- `routes/tasks.js:236` – `Sprints.findOne({ sprintMonth, sprintYear })` used to scope tasks has no tenant filter.  
  `routes/tasks.js:257` – `TimeRegistration.find({ taskId: { $in: tasks } })` missing tenant filter.  
  `routes/tasks.js:292` – another unscoped `Sprints.findOne`.  
  `routes/tasks.js:313` – unscoped `TimeRegistration.find(...)`.  
  `routes/tasks.js:528` – `Task.findByIdAndUpdate(taskId, { $pull: ... })` omits tenant, allowing cross-tenant mutation via ID.  
  `routes/tasks.js:639` – `Task.find(query)` in export endpoint lacks tenant filter; exports all tenants’ tasks matching customer/sprint IDs.
- `routes/time-registrations.js:267` – `Sprints.findOne({ sprintName })` (no tenant) before creating a time registration; can associate registrations with another tenant’s sprint.
- `routes/updates.js:9` – `Customer.updateMany({},{...})` mass-updates all tenants; use a tenant-scoped filter or remove after one-time migration.
- `routes/users.js:48` – `User.findOne({ username })` on register ignores tenant; prevents per-tenant duplicate usernames and risks collisions.  
  `routes/users.js:105` – `User.findOne({ email })` on login unscoped; users can authenticate across tenants.

## Structural gaps
- `models/Sprints.js`, `models/SprintYear.js`, `models/Groups.js` lack `tenantId` (or `organizationId`), so even if queries add filters, isolation cannot be enforced at the data model level. Add a tenant field and update unique indexes accordingly.

## Recommended remediations
- Require `tenantId` (or `organizationId`) in every route handler and apply it in all query filters, including helper lookups (e.g., `findById`).
- Add tenant-scoped compound indexes to frequently queried collections (`{ tenantId: 1, email: 1 }`, `{ tenantId: 1, username: 1 }`, `{ tenantId: 1, taskHandle: 1 }`).
- Backfill `tenantId` for `Sprints`, `SprintYear`, and `Groups`, then update all related queries to include the new field. Until then, avoid sharing these collections between tenants.
