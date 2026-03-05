# TaskAlloc8or API Endpoints (as of 2026-02-02)

## Conventions
- Most services are tenant-scoped and mounted at `/:tenantId/<feature>/...`. Replace `:tenantId` with the tenant ObjectId in every tenant-scoped path below.
- Global services without tenant prefix: `/api/account/*` and `/sprints/*`.
- IDs are MongoDB ObjectIds (strings). Times are UTC unless noted; dates that come from the UI are usually `DD-MM-YYYY` strings.
- Every route returns JSON; success codes are `200` (or `201` for creates) unless stated. Errors generally return `{ error: string }` with `4xx/5xx`.

## Core Object Shapes
- **User**: `{ _id, tenantId, username, email, profileImage, userRole, userTitle, activeYear, isActivated, slackId, createdAt, updatedAt }`
- **Customer**: `{ _id, tenantId, customerName, customerColor, isArchived }`
- **Label**: `{ _id, tenantId, labelName, labelColor }`
- **Vertical**: `{ _id, tenantId, verticalName }`
- **Sprint**: `{ _id, sprintName, sprintMonth, sprintYear }` ; **SprintYear**: `{ _id, sprintYear }`
- **Task**: `{ _id, tenantId, taskName, taskHandle, taskTimeLow, taskTimeHigh, taskDescription, taskCustomer, taskLabel, taskVertical, taskPersons:[{ user, percentage }], taskSprints:[ObjectId], createdBy, isArchived, archivedBy, archivedTimestamp, workflowStatus, taskDeadline, estimatedTime, taskType, upcomingDeadlineNotificationSent, deadlineNotificationSent, createdAt, updatedAt }`
- **TimeRegistration**: `{ _id, tenantId, userId, taskId, sprintId, verticalId, timeRegistered, description, currentTime, registrationType, createdAt, updatedAt }`
- **Comment**: `{ _id, tenantId, taskId, htmlContent, createdBy, createdAt, updatedAt }`
- **Notification**: `{ _id, tenantId, userId, notificationType, notificationIsRead, notificationLink, notificationMessage, taskId, taskCustomer, mentionedBy, createdAt, updatedAt }`
- **CustomerNote**: `{ _id, tenantId, customerRef, sprintId, createdBy, noteTitle, noteContent, isArchived, createdAt, updatedAt }`
- **CustomerTarget**: `{ _id, tenantId, customerRef, spendGoogleAds, spendMeta, spendLinkedIn, customerTarget, percentageIncrease }`
- **Holiday**: `{ _id, tenantId, userId, startTime, endTime, status, totalDays, createdAt, updatedAt }`

---

## Accounts & Tenants (global base: `/api/account`)
- **POST `/api/account/login`**
  - Body: `{ email: string, password: string }`
  - Response: `{ token: string, user: { id, username, email, is_activated, profile_image, user_role, user_title, active_year, tenant_id } }`
- **POST `/api/account/verify-account`**
  - Body: `{ email: string, confirmationCode: string }`
  - Response: `{ message: string }` (200 on success); 404 if tenant missing, 400 on bad code.
- **POST `/api/account/register`**
  - Body: `{ accountUsername: string, email: string, password: string, confirmationCode: string }`
  - Response: `{ message: string, tenant: Tenants }` with `201 Created` on success.

## Users (tenant base: `/:tenantId/users`)
- **PUT `/update-sprint-year`**
  - Body: `{ activeYear: number, userId: ObjectId }`
  - Response: updated **User** document.
- **POST `/register`**
  - Body: `{ username: string, password: string, email?: string, is_activated?: boolean, profile_image?: string, user_role?: number, user_title?: string }`
  - Response: `{ token, user: { id, username, email, is_activated, profile_image, user_role, user_title, tenant_id } }`
- **POST `/login`**
  - Body: `{ email: string, password: string }`
  - Response: `{ token, user: { id, username, email, is_activated, profile_image, user_role, user_title, active_year, tenant_id } }`
- **PUT `/profile/update`**
  - Body: `{ username?: string, email?: string, userTitle?: string, userId: ObjectId }`
  - Response: `{ user: { id, username, email, is_activated, profile_image, user_role, user_title, tenant_id } }`
- **PUT `/profile/update-password`**
  - Body: `{ newPassword: string, userId: ObjectId }`
  - Response: `{ msg: "Password updated successfully" }`
- **PUT `/profile/upload-image`** (multipart `profileImage` file + `userId` field)
  - Response: `{ user: { id, username, email, is_activated, profile_image, user_role, user_title, active_year } }`
- **GET `/fetch-active-users`**
  - Response: `User[]` filtered to `isActivated=true` (fields: `_id, username, email, profileImage, userRole, userTitle, createdAt`).
- **POST `/users-not-in-task`**
  - Body: `{ taskPersons: [{ user: ObjectId, percentage: number }...] }`
  - Response: `User[]` (activated users not already in the task).
- **GET `/fetch-all-users`**
  - Response: all `User[]` for tenant (sorted by username).
- **PUT `/update-users/:userId`**
  - Body: any editable user fields.
  - Response: updated **User**.
- **PUT `/update-user-activation/:userId`**
  - Body: `{ isActivated: boolean }`
  - Response: updated **User**.

## Customers (tenant base: `/:tenantId/customers`)
- **POST `/update-customer`**
  - Body: `{ customerId: ObjectId, customerName?: string, customerColor?: string }`
  - Response: `{ message: string, data: Customer }`
- **GET `/fetch-customer`**
  - Query: `customerId=ObjectId`
  - Response: `Customer[]` (single-element array).
- **POST `/create`**
  - Body: `{ customerName: string, customerColor: string }`
  - Response: created **Customer**.
- **GET `/fetch`**
  - Response: `Customer[]` (sorted newest first).
- **DELETE `/delete/:customerId`**
  - Response: `{ message: "Customer deleted successfully" }`
- **PUT `/archive/:customerId`**
  - Response: `{ message: "Customer archived & updated successfully" }`
- **PUT `/unarchive/:customerId`**
  - Response: `{ message: "Customer archived & updated successfully" }`

## Customer Targets (tenant base: `/:tenantId/customer-targets`)
- **GET `/fetch-customer-targets-by-id`**
  - Query: `customerId=ObjectId`
  - Response: `CustomerTarget[]` (empty array if none).
- **POST `/update-customer-targets-by-id`**
  - Body: `{ customerId: ObjectId, spendGoogleAds?: string, spendMeta?: string, spendLinkedIn?: string, customerTarget?: string, percentageIncrease?: string }`
  - Response: `{ message: string, data: CustomerTarget }` (creates if missing).

## Customer Notes (tenant base: `/:tenantId/customer-notes`)
- **DELETE `/delete-customer-notes/:noteId`** → `{ message: "Note deleted" }`
- **GET `/fetch-customer-notes`**
  - Query: `customerId=ObjectId`, `sprintId=ObjectId`
  - Response: `CustomerNote[]` with `createdBy` populated (`_id, username, email, profileImage`).
- **POST `/create-note`**
  - Body: `{ customerId: ObjectId, userId: ObjectId, sprintId: ObjectId, noteTitle: string, noteContent: string }`
  - Response: created **CustomerNote**.

## Tasks (tenant base: `/:tenantId/tasks`)
- **GET `/recent-tasks/:userId`** → latest 10 **Task** docs where `taskPersons.user` = userId.
- **GET `/fetch-deadlines`**
  - Query: `userId=ObjectId`
  - Response: `{ overdueTasks: Task[], upcomingTasks: Task[] }` (only quick tasks with deadlines, not archived).
- **POST `/update-percentage`**
  - Body: `{ taskId: ObjectId, percentageValues: { [userId:string]: number } }`
  - Response: `{ message: "Task percentage updated successfully" }`
- **POST `/create`**
  - Body: `{ taskName: string, taskTimeLow: number, taskTimeHigh: number, taskDescription?: string, taskCustomer: ObjectId, taskLabel: ObjectId, taskVertical: ObjectId, taskPersons:[{user,percentage}], taskSprints: ObjectId[], createdBy: ObjectId, taskDeadline?: string, estimatedTime?: number, taskType?: string }`
  - Response: `Task[]` (one per sprintId supplied).
- **GET `/fetch-by-user/:userId`** → `Task[]` created by user (not archived) with `createdBy`, `taskPersons.user`, `taskCustomer`, `taskSprints` populated.
- **GET `/fetch-by-customer-sprint/:customerId`**
  - Query: `month=string`, `year=number`, `time_reg` optional flag.
  - Response: `Task[]`; if `time_reg` truthy, each task includes `timeRegistrations: TimeRegistration[]`.
- **GET `/fetch-by-user-sprint/:userId`**
  - Query: `month=string`, `year=number`, `time_reg` optional.
  - Response: `Task[]` (assigned to user), optionally enriched with `timeRegistrations` like above.
- **GET `/fetch-by-id/:taskId`** → `Task[]` (single element) with `taskPersons.user`, `taskSprints`, `taskCustomer`, `createdBy` populated.
- **PUT `/update/:taskId`**
  - Body: `{ taskName?, taskTimeLow?, taskTimeHigh?, taskDescription?, taskDeadline?, estimatedTime? }`
  - Response: updated **Task**.
- **PUT `/update-vertical/:taskId`**
  - Body: `{ taskVertical: ObjectId }`
  - Response: updated **Task**.
- **PUT `/update-customers/:taskId`**
  - Body: `{ customerId: ObjectId }`
  - Response: updated **Task**.
- **PUT `/update-sprint/:taskId`**
  - Body: `{ taskSprintId: ObjectId }`
  - Response: updated **Task**.
- **PUT `/assign-user/:taskId`**
  - Body: `{ assignedUserId: ObjectId }`
  - Response: **Task** with recalculated `taskPersons` percentages (all evenly split).
- **PUT `/remove-user/:taskId/:taskPersonId`**
  - Response: **Task** with user removed and remaining percentages evened.
- **PUT `/archive-task/:taskId`**
  - Body: `{ userId: ObjectId }`
  - Response: **Task** toggled `isArchived`; also creates a Comment audit entry.
- **PUT `/update-taskworkflow/:taskId`**
  - Body: `{ workflowStatus: number }`
  - Response: updated **Task**.
- **GET `/export-customer-sprints-to-excel`**
  - Query: `customerId=ObjectId`, `sprintId=ObjectId`
  - Response: `{ groupedTasks: { [verticalName:string]: [{ "Task Name", "Task Type", "Description", "Deadline", "Created At", "Created By", "Time Registered" }] } }`
- **GET `/fetch-task`**
  - Query: `userId=ObjectId` (optional), `archived=true|false` (optional)
  - Response: `Task[]` with `createdBy`, `taskPersons.user`, `taskCustomer`, `taskSprints`, `taskVertical`, `archivedBy` populated.

## Time Registrations (tenant base: `/:tenantId/time-registrations`)
- **GET `/time-registrations-verticals-aggregated/:sprintId`** → `{ vertical: string, hoursRegistered: number, sprint: ObjectId }[]` aggregated by vertical.
- **GET `/fetch-users-time-regs-by-sprint/:sprintId`** → `[ { _id, username, email, profileImage, totalTime, clientTime, internTime, restTime } ]` for activated users.
- **DELETE `/time-registration-delete/:eventId`** → deleted **TimeRegistration** document.
- **POST `/time-registration-update`**
  - Body: `{ eventId: ObjectId, editedTime: number }`
  - Response: updated **TimeRegistration** (pre-save copy).
- **GET `/time-registrations-by-date/:date/:userId`** → `TimeRegistration[]` for that date/user with `taskId.taskCustomer` populated.
- **POST `/time-registered-by-user`**
  - Body: `{ userId: ObjectId }`
  - Response: `[ { currentTime: string, totalRegisteredTime: number } ]` aggregated per day.
- **POST `/register-time`**
  - Body: `{ userId: ObjectId, taskId?: ObjectId, timeRegistered: number, description?: string, currentTime: "DD-MM-YYYY" | "YYYY-MM-DD", registrationType?: "client"|"intern"|"rest", customerId?: ObjectId, verticalId?: ObjectId }` (sprint auto-resolved from date)
  - Response: created **TimeRegistration**.
- **GET `/time-registered/:taskId`** → `TimeRegistration[]` for task with `userId` populated (`_id, username, email, profileImage, userRole, userTitle`).
- **GET `/time-registered-user/:sprintId/:userId/:tenantId`** → `TimeRegistration[]` for given sprint/user.

## Labels (tenant base: `/:tenantId/labels`)
- **POST `/create-label`**
  - Body: `{ labelName: string }` (color defaults to `#fff`).
  - Response: created **Label**.
- **GET `/fetch-labels`** → `Label[]` sorted newest first.

## Verticals (tenant base: `/:tenantId/verticals`)
- **POST `/create-vertical`**
  - Body: `{ verticalName: string }`
  - Response: created **Vertical**.
- **GET `/fetch-Verticals`** (case-sensitive capital “V”)
  - Response: `Vertical[]` sorted newest first.

## Comments (tenant base: `/:tenantId/comments`)
- **PUT `/edit-comment/:commentId`**
  - Body: `{ htmlContent: string }`
  - Response: updated **Comment**.
- **DELETE `/delete-comment-by-id/:commentId`** → `{ message: "Comment deleted" }`
- **POST `/fetch-comments-by-task`**
  - Body: `{ taskId: ObjectId }`
  - Response: `Comment[]` sorted oldest-first with `createdBy` populated (`username, email, profileImage`).
- **POST `/create-comment`**
  - Body: `{ taskId: ObjectId, htmlContent: string, createdBy: ObjectId }` (HTML sanitized)
  - Response: created **Comment**.

## Notifications (tenant base: `/:tenantId/notifications`)
- **POST `/fetch-unread-notifications`**
  - Body: `{ userId: ObjectId }`
  - Response: unread `Notification[]` with `mentionedBy`, `taskCustomer`, `taskId` populated.
- **PUT `/update-user-notification-read`**
  - Body: `{ notificationId: ObjectId }`
  - Response: `{ message: "Customer archived & updated successfully" }` (marks as read).
- **POST `/fetch-user-notifications`**
  - Body: `{ userId: ObjectId }`
  - Response: all `Notification[]` (populated, sorted newest first).
- **POST `/create-notification-task`**
  - Body: `{ data: Task[] }` (expects tasks with `taskPersons`)
  - Response: *No explicit response body is sent* (route currently omits `res.send`). Creates notifications for quick tasks and emits socket/Slack alerts.
- **POST `/create-notification`**
  - Body: `{ mentionedUsers: [{ id: ObjectId, email?: string, username?: string }], taskId: ObjectId, taskCustomer: ObjectId, mentionedBy: ObjectId, htmlContent: string }`
  - Response: `"Notifications created successfully"` on success.

## Holidays (tenant base: `/:tenantId/holidays`)
- **DELETE `/delete-holiday/:holidayId`** → `{ message: "Holiday deleted" }`
- **PUT `/approve-holiday/:holidayId`** → `{ message: "Holiday approved" }`
- **PUT `/decline-holiday/:holidayId`** → `{ message: "Holiday declined" }`
- **GET `/fetch-all-holidays/:userId`** (`userId=0` fetches all)
  - Response: `Holiday[]` with `userId` populated; status is auto-set to `completed` for past-end dates.
- **GET `/fetch-holidays-by-user/:userId`** → `Holiday[]` for that user (with population and auto-completed status logic).
- **POST `/register-holidays`**
  - Body: `{ userId: ObjectId, startTime: string, endTime: string, totalDays: string }`
  - Response: created **Holiday**.

## Sprints (global base: `/sprints`)
- **GET `/fetch-sprint-years`** → `SprintYear[]` sorted newest first.
- **GET `/fetch`**
  - Query: `activeYear` (defaults to current year)
  - Response: `Sprint[]` for that year.
- **GET `/fetch-sprint-by-id/:sprintId`** → `Sprint` (note: implementation uses `findById({ sprintId })`).
- **GET `/fetch-sprint-by-month-year/:sprintMonth/:sprintYear`** → `Sprint[]` matching month/year.

## Maintenance / Updates (tenant base: `/:tenantId/updates`)
- **PUT `/update-customer-schema`** → `{ message: "Customer schema updated successfully" }` (sets all customers `isArchived=false`).

