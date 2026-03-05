# Models Documentation

This document describes all backend Mongoose models in `models/`, what each model is used for, and how each is implemented.

## Overview

The backend uses MongoDB with Mongoose schemas and models. Common patterns across models:

- Most domain records include `tenantId` for multi-tenant scoping.
- Relations are implemented with `ObjectId` references (`ref`) between collections.
- Some schemas use `{ timestamps: true }` for automatic `createdAt` and `updatedAt`.
- `Account`, `Tenants`, and `User` hash passwords in `pre('save')` middleware.

---

## 1) `Account` (`models/Account.js`)

### Purpose
Stores account-level credentials and confirmation state.

### Key fields
- `accountUsername` (`String`, required, unique, min 3, max 50)
- `email` (`String`, required, unique)
- `password` (`String`, required)
- `accountConfirmed` (`Boolean`, default `false`)
- `accountConfirmationCode` (`String`, default `"0"`)

### How it is implemented
- Uses `timestamps: true` and custom collection name `Account`.
- `pre('save')` hook hashes `password` with `bcryptjs` (salt rounds 10) when modified.

---

## 2) `Comment` (`models/Comments.js`)

### Purpose
Stores task comments (chat/messages) with HTML content.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `taskId` (`ObjectId`, required, ref `Task`)
- `htmlContent` (`String`, required)
- `createdBy` (`ObjectId`, required, ref `User`)
- `createdAt` (`Date`, default `Date.now`)

### How it is implemented
- Uses `timestamps: true`.
- Exports both `Comment` model and `CommentSchema` for reuse if needed.

---

## 3) `Customer` (`models/Customer.js`)

### Purpose
Represents customers/clients linked to tasks and customer notes.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `customerName` (`String`, required)
- `customerColor` (`String`, required)
- `isArchived` (`Boolean`, default `false`)

### How it is implemented
- Basic schema without timestamps.
- Uses MongoDB default `_id` as record identity.

---

## 4) `CustomerNotes` (`models/CustomerNotes.js`)

### Purpose
Stores notes tied to a customer in a specific sprint.

### Key fields
- `tenantId` (`ObjectId`, required, ref `Tenants`)
- `customerRef` (`ObjectId`, required, ref `Customer`)
- `sprintId` (`ObjectId`, required, ref `Sprints`)
- `createdBy` (`ObjectId`, required, ref `User`)
- `isArchived` (`Boolean`, default `false`)
- `noteTitle` (`String`, required)
- `noteContent` (`String`, required)

### How it is implemented
- Uses `timestamps: true`.
- Exports model and schema.

---

## 5) `CustomerTargets` (`models/CustomerTargets.js`)

### Purpose
Stores customer-level marketing spend/target metrics.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `customerRef` (`ObjectId`, required, ref `Customer`)
- `spendGoogleAds` (`String`)
- `spendMeta` (`String`)
- `spendLinkedIn` (`String`)
- `customerTarget` (`String`)
- `percentageIncrease` (`String`)

### How it is implemented
- All metric/value fields are optional strings.
- Exports model and schema.

---

## 6) `Groups` (`models/Groups.js`)

### Purpose
Defines user groups/teams.

### Key fields
- `groupName` (`String`, required, unique)
- `groupPersons` (array of objects)
  - `user` (`ObjectId`, ref `User`)

### How it is implemented
- Group membership is modeled as an embedded array of `{ user }` objects.
- File includes TODO note: add `tenantId` for tenant isolation.

---

## 7) `Holidays` (`models/Holidays.js`)

### Purpose
Stores holiday/off-time requests for users.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `userId` (`ObjectId`, required, ref `User`)
- `startTime` (`String`)
- `endTime` (`String`)
- `status` (`String`, default `"pending"`)
- `totalDays` (`String`)

### How it is implemented
- Uses `timestamps: true`.
- Date-like fields are stored as strings, not `Date` type.

---

## 8) `Label` (`models/Label.js`)

### Purpose
Stores task labels/tags with a color.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `labelName` (`String`, required)
- `labelColor` (`String`, required)

### How it is implemented
- Simple lookup/reference model used by tasks.
- Exports model and schema.

---

## 9) `NotificationChatTask` (`models/NotificationChatTask.js`)

### Purpose
Stores in-app notifications for task chat events (for example user tagging).

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `userId` (`ObjectId`, required, ref `User`) - receiver
- `notificationType` (`String`, required, default `"user_tagging"`)
- `notificationIsRead` (`Boolean`, default `false`)
- `notificationLink` (`String`)
- `notificationMessage` (`String`, required)
- `taskId` (`ObjectId`, required, ref `Task`)
- `taskCustomer` (`ObjectId`, required, ref `Customer`)
- `mentionedBy` (`ObjectId`, required, ref `User`) - sender/actor

### How it is implemented
- Uses `timestamps: true`.
- Built specifically around task-chat notification workflow.

---

## 10) `SprintYear` (`models/SprintYear.js`)

### Purpose
Stores available sprint years.

### Key fields
- `sprintYear` (`Number`, required, unique)

### How it is implemented
- Minimal schema used as a yearly container/reference.

---

## 11) `Sprints` (`models/Sprints.js`)

### Purpose
Stores sprint definitions.

### Key fields
- `sprintName` (`String`, required, unique)
- `sprintMonth` (`String`, required)
- `sprintYear` (`Number`, required)

### How it is implemented
- Minimal schema for planning/reporting periods.

---

## 12) `Task` (`models/Task.js`)

### Purpose
Core work item model. Tracks ownership, estimation, status, sprint assignment, and deadline notification flags.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `taskName` (`String`, required)
- `taskHandle` (`String`, required, unique)
- `taskTimeLow` (`Number`, required)
- `taskTimeHigh` (`Number`, required)
- `taskDescription` (`String`, optional)
- `taskCustomer` (`ObjectId`, required, ref `Customer`)
- `taskLabel` (`ObjectId`, required, ref `Label`)
- `taskVertical` (`ObjectId`, required, ref `Vertical`)
- `taskPersons` (array of objects)
  - `user` (`ObjectId`, ref `User`)
  - `percentage` (`Number`, default `100`)
- `taskSprints` (array of `ObjectId`, ref `Sprints`)
- `createdBy` (`ObjectId`, required, ref `User`)
- `isArchived` (`Boolean`, default `false`)
- `archivedBy` (`ObjectId`, ref `User`, default `null`)
- `archivedTimestamp` (`Date`, default `null`)
- `workflowStatus` (`Number`, default `0`)
- `taskDeadline` (`String`)
- `estimatedTime` (`Number`, default `0`)
- `taskType` (`String`, default `null`)
- `upcomingDeadlineNotificationSent` (`Boolean`, default `false`)
- `deadlineNotificationSent` (`Boolean`, default `false`)

### How it is implemented
- Uses `timestamps: true`.
- Supports many-to-many assignment to users via `taskPersons` array with percentage split.
- Includes soft-archive metadata and deadline notification state.

---

## 13) `Tenants` (`models/Tenants.js`)

### Purpose
Stores tenant-level auth/account for multi-tenant setup.

### Key fields
- `tenantUsername` (`String`, required, unique, min 3, max 50)
- `email` (`String`, required, unique)
- `password` (`String`, required)
- `tenantConfirmed` (`Boolean`, default `false`)
- `tenantConfirmationCode` (`String`, default `"0"`)

### How it is implemented
- Uses `timestamps: true` and explicit collection name `tenants`.
- `pre('save')` hashes `password` with `bcryptjs` when modified.

---

## 14) `TimeRegistration` (`models/TimeRegistration.js`)

### Purpose
Stores logged work time entries for users.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `userId` (`ObjectId`, required, ref `User`)
- `taskId` (`ObjectId`, ref `Task`) - currently not required
- `sprintId` (`ObjectId`, required, ref `Sprints`)
- `verticalId` (`ObjectId`, ref `Vertical`)
- `timeRegistered` (`Number`, required)
- `description` (`String`, optional)
- `currentTime` (`String`)
- `registrationType` (`String`, default `null`)

### How it is implemented
- Uses `timestamps: true`.
- Supports task-linked and non-task-linked registrations (because `taskId` is optional).

---

## 15) `User` (`models/User.js`)

### Purpose
Stores user identity, auth, profile info, role/title, and tenant affiliation.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `username` (`String`, required, unique)
- `email` (`String`, required, unique)
- `password` (`String`, required)
- `createdAt` (`Date`, default `Date.now`)
- `isActivated` (`Boolean`, default `false`)
- `profileImage` (`String`, default image filename)
- `userRole` (`Number`, default `0`)
- `userTitle` (`String`, default `"employee"`)
- `activeYear` (`Number`, default `2025`)
- `slackId` (`String`, default `"0"`)
- `isPasswordHashed` (`Boolean`, default `false`)

### How it is implemented
- Also uses `timestamps: true`.
- `pre('save')` hashes password only when:
  - `password` is modified, and
  - `isPasswordHashed` is `false`.
- After hashing, it sets `isPasswordHashed = true`.

---

## 16) `Vertical` (`models/Vertical.js`)

### Purpose
Stores work categories/verticals used by tasks and time registration.

### Key fields
- `tenantId` (`ObjectId`, ref `Tenants`)
- `verticalName` (`String`, required)

### How it is implemented
- Simple lookup/reference model.
- Exports model and schema.

---

## Relationship Map

Main references between models:

- `Tenants` <- `tenantId` in most business models (`User`, `Task`, `Customer`, etc.).
- `Task` -> `Customer`, `Label`, `Vertical`, `User` (`createdBy`, `taskPersons.user`), `Sprints`.
- `Comment` -> `Task`, `User`.
- `CustomerNotes` -> `Customer`, `Sprints`, `User`.
- `TimeRegistration` -> `User`, `Task`, `Sprints`, `Vertical`.
- `NotificationChatTask` -> `User` (receiver + actor), `Task`, `Customer`.

---

## Implementation Notes and Current Patterns

- Password hashing is implemented in schema middleware (`pre('save')`) and uses `bcryptjs`.
- Some date/time values are stored as strings (`taskDeadline`, `Holidays.startTime`, etc.), while audit timestamps use `Date` via `timestamps`.
- Several schemas export both model and schema, enabling embedded reuse if needed.
- Tenant isolation is schema-driven via `tenantId`, but not every model enforces it as required (and `Groups` currently has no `tenantId`).
