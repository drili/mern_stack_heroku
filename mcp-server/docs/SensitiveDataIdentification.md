# Sensitive Data Identification (MCP / LLM Redaction List)
Updated: 2026-02-02

Purpose: enumerate fields that must be removed or anonymized before any API JSON is passed to an LLM via an MCP server. Apply the rules to both top-level documents and nested objects returned via `populate()`.

## Must strip – credentials, tokens, and verification secrets
- `token` (JWT) returned by login/register responses.
- `User.password`, `Account.password`, `Tenants.password` (hashed but still credential material).
- `accountConfirmationCode`, `tenantConfirmationCode` (one-time verification secrets).
- `accountConfirmed`, `tenantConfirmed`, `User.isPasswordHashed` (internal security state).

## User identity & cross-system IDs
- `User.email`, `User.username`, `User.profileImage`, `User.slackId`, `User.tenantId` (PII and external identifiers).
- The same fields when users are populated as `createdBy`, `taskPersons.user`, `userId`, `mentionedBy`, `archivedBy`.

## Tenant / account identifiers
- `accountUsername`, `tenantUsername`, `Tenants.email` (identifies the customer tenant).

## Free-text and narrative content (can contain PII or secrets)
- `Comments.htmlContent`.
- `CustomerNotes.noteTitle`, `CustomerNotes.noteContent`.
- `NotificationChatTask.notificationMessage`.
- `Task.taskDescription` (often author-entered text).
- `TimeRegistration.description`.

## Personal schedule and HR data
- From `Holidays`: `startTime`, `endTime`, `totalDays`, `status`, `userId`.
- From `TimeRegistration`: `timeRegistered`, `currentTime`, `registrationType` (work pattern), plus the `userId` link.

## Client / customer confidential data
- `Customer.customerName` (client identity).
- `CustomerTargets`: `spendGoogleAds`, `spendMeta`, `spendLinkedIn`, `customerTarget`, `percentageIncrease` (financial targets).
- `taskCustomer` when populated (reveals client) and `taskHandle`/`notificationLink` when they embed tenant and task identifiers.

## Endpoints currently returning unredacted data
- `/api/account/register` – returns the created tenant document (contains hashed password and confirmation code).
- `/api/account/login` and `/:tenantId/users/login`/`register` – return JWT `token` plus user profile fields.
- `/:tenantId/users/fetch-all-users`, `users-not-in-task`, `update-users/:userId`, `update-user-activation/:userId` – return full `User` docs (includes `password`, `slackId`, `email`).
- `/:tenantId/comments/fetch-comments-by-task` – returns `htmlContent` and populated `createdBy` (email, profileImage).
- `/:tenantId/customer-notes/fetch-customer-notes` – returns `noteTitle`, `noteContent`, and creator email.
- `/:tenantId/customer-targets/*` – returns all spend/target fields.
- `/:tenantId/holidays/fetch-all-holidays` and `/fetch-holidays-by-user/:userId` – return personal leave dates plus user emails.
- `/:tenantId/notifications/fetch-unread-notifications` and `/fetch-user-notifications` – return `notificationMessage` and populated user emails.
- `/:tenantId/tasks/*` fetch endpoints – populate users (email/profileImage) and include `taskDescription`, `taskDeadline`, `taskCustomer`.
- `/:tenantId/time-registrations/*` fetch endpoints – include `timeRegistered`, `description`, and populated user emails.

## Redaction checklist to apply before sending to an LLM
- Remove the fields above from every document and from nested populated paths.
- Pseudonymize user and tenant references if relational structure is needed (e.g., replace with stable opaque IDs not reused across tenants).
- Strip or hash JWTs/confirmation codes; do not replace with placeholders that look usable.
- For free-text fields needed for prompts, consider summarizing them server-side and sending only the summary.
