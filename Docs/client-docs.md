# Client Documentation

This document describes the frontend in `client/`, with focus on the client-side data models/entities, what they are used for, and how they are implemented across pages/components.

## Overview

The client is a React + Vite SPA.

Core setup:

- Router: `react-router-dom` with tenant-scoped routes (`/:tenantId/*`).
- API layer: direct `axios` calls in pages/components (no central API client).
- Global state: React Context (`UserContext`, `ConfigContext`).
- Real-time: `socket.io-client` for notification updates.
- UI libs: Flowbite, Tailwind, react-beautiful-dnd, react-big-calendar, Draft.js.

Primary bootstrap files:

- `client/src/main.jsx`: wraps app in `ConfigProvider` and `UserProvider`.
- `client/src/Routes.jsx`: defines public and protected routes.
- `client/src/ProtectedRoute.jsx`: checks auth token + activation.
- `client/src/AdminRoute.jsx`: checks admin role (`user_role === "1"`).

---

## 1) Global Client Models

### 1.1 `ConfigModel` (`ConfigContext`)

**Purpose**
- Holds environment-specific API base URL.

**Shape**
- `baseURL: string`

**How it is implemented**
- In development: `http://localhost:5000`.
- In production: Heroku backend URL.
- Exposed through `ConfigContext` and consumed to build `tenantBaseURL` in most pages/components.

### 1.2 `SessionModel` (LocalStorage + `UserContext`)

**Purpose**
- Stores authenticated user/session data and notification state.

**Shape**
- Context values:
  - `user: UserModel | null`
  - `setUser`
  - `hasUnreadNotifications: boolean`
  - `setHasUnreadNotifications`
- LocalStorage keys used:
  - `token`, `user`, `tenant_id`, `username`, `email`, `is_activated`, `user_role`, `user_title`, `profile_image`.

**How it is implemented**
- `UserProvider` hydrates `user` from `localStorage` once on mount.
- Login writes token + user payload + metadata to localStorage.
- Protected routes and admin routes are gated by localStorage state.

---

## 2) Core Domain Models Used by Client

### 2.1 `UserModel`

**Purpose**
- Represents logged-in user and assignees across tasks, comments, notes, holidays, and admin pages.

**Typical fields used in client**
- `id` / `_id`
- `tenant_id`
- `username`
- `email`
- `profileImage` / `profile_image`
- `userRole` / `user_role`
- `userTitle` / `user_title`
- `isActivated` / `is_activated`
- `active_year`
- `slackId`

**How it is implemented**
- Used from context (`user`) for API routing and UI personalization.
- Loaded as related sub-document on task persons, comments, holidays, and customer notes.
- Admin pages support editing user fields and activation status.

### 2.2 `SprintModel`

**Purpose**
- Defines planning/reporting period and drives filtering in most features.

**Typical fields**
- `_id`
- `sprintName`
- `sprintMonth`
- `sprintYear`

**How it is implemented**
- `getCurrentSprint()` custom hook fetches active sprint by current month + `user.active_year`.
- Used in Dashboard, Workflow, Sprint Overview, Time Registration overviews, and Customer Notes.

### 2.3 `TaskModel`

**Purpose**
- Main work item entity for planning, assignment, workflow, deadlines, time registration, chat, and notifications.

**Typical fields used**
- `_id`, `taskHandle`, `taskName`, `taskDescription`
- `taskType` (`timedTask` / `quickTask`)
- `taskTimeLow`, `taskTimeHigh`, `estimatedTime`
- `taskDeadline`
- `workflowStatus` (0-3 workflow columns)
- `isArchived`
- Relations:
  - `taskCustomer: CustomerModel`
  - `taskSprints: SprintModel[]`
  - `taskPersons: TaskPersonModel[]`
  - `createdBy: UserModel`
  - `timeRegistrations: TimeRegistrationModel[]`

**How it is implemented**
- Created in `CreateTask.jsx` with typed payload and relation IDs.
- Displayed in cards, kanban, sprint/customer accordions, and notifications.
- Updated through modal (`TaskModal`, `TaskModalSettings`) for content, sprint/customer/vertical, user assignment, percentage allocation, and archiving.
- Workflow updates via drag-and-drop call `update-taskworkflow` endpoint.

### 2.4 `TaskPersonModel` (embedded in task)

**Purpose**
- Represents assignment and workload split per task.

**Typical fields**
- `user: UserModel`
- `percentage: number`

**How it is implemented**
- On create: default equal percentage split among selected users.
- In task settings: editable percentage map must total 100 before submit.
- Used in dashboard and overview calculations for per-user low/high allocations.

### 2.5 `CustomerModel`

**Purpose**
- Customer/client metadata attached to tasks and customer views.

**Typical fields**
- `_id`, `customerName`, `customerColor`, `isArchived`

**How it is implemented**
- Managed in `CreateCustomer.jsx` (create/archive/unarchive/search).
- Used as task relation, badge styling, and grouping/filtering key.
- Customer detail page allows updates and reporting export.

### 2.6 `CustomerTargetsModel`

**Purpose**
- Stores performance/marketing target metrics for a customer.

**Typical fields**
- `spendGoogleAds`, `spendMeta`, `spendLinkedIn`, `customerTarget`, `percentageIncrease`

**How it is implemented**
- Loaded in `ViewCustomer.jsx`; if missing, client creates default zeroed view model.
- Updated through form submission to `customer-targets/update-customer-targets-by-id`.

### 2.7 `CustomerNoteModel`

**Purpose**
- Rich-text notes for customer and sprint combination.

**Typical fields**
- `_id`, `noteTitle`, `noteContent`, `createdAt`
- `createdBy: UserModel`
- `customerId`, `sprintId`

**How it is implemented**
- Created in `CreateCustomerNotesComponent` using rich text HTML content.
- Viewed/deleted in `ViewCustomerNotesComponent` scoped by customer + selected sprint.

### 2.8 `LabelModel`

**Purpose**
- Task labeling/tagging.

**Typical fields**
- `_id`, `labelName`, `labelColor`

**How it is implemented**
- Fetched in task create flow.
- Default label auto-selects `Ingen label` when present.

### 2.9 `VerticalModel`

**Purpose**
- Task vertical/category for reporting.

**Typical fields**
- `_id`, `verticalName`

**How it is implemented**
- Fetched in task create/settings.
- First vertical is auto-selected during create.
- Used in vertical time aggregation overview.

### 2.10 `TimeRegistrationModel`

**Purpose**
- Logged hours (task work and off/sick registration paths).

**Typical fields used**
- `_id`
- `userId` / `createdBy` (UserModel)
- `taskId` (nullable in off/sick cases)
- `timeRegistered` (number)
- `description`
- `currentTime`
- `createdAt`
- optional grouping fields from API aggregates (`totalRegisteredTime`, etc.)

**How it is implemented**
- Created from task modal (`TaskTimeRegistration`) and register-off-time page.
- Listed/edited/deleted in `TimeRegistrations` + `TimeRegistrationTable`.
- Merged with comments into task timeline UI.
- Aggregated for dashboard/admin reporting endpoints.

### 2.11 `CommentModel`

**Purpose**
- Task discussion messages with mention-aware rich text.

**Typical fields**
- `_id`, `taskId`, `htmlContent`, `createdAt`
- `createdBy: UserModel`

**How it is implemented**
- Draft.js editor content converted to HTML and posted.
- Mention entities are extracted client-side and used to trigger notification creation.
- Editing/deleting allowed for comments created by logged-in user.
- Rendered with processed HTML (`processHtmlContent`) to style mentions.

### 2.12 `NotificationModel`

**Purpose**
- In-app notification records for mentions/task/deadline events.

**Typical fields used**
- `_id`, `notificationType`, `notificationMessage`, `notificationIsRead`, `createdAt`
- `taskId: TaskModel`
- `taskCustomer: CustomerModel`
- `mentionedBy: UserModel`

**How it is implemented**
- Fetched in dropdown and full notifications page.
- Mark-as-read through update endpoint.
- Live updates via Socket.IO `new-notification` event.
- `hasUnreadNotifications` in context drives badge/dot state globally.

### 2.13 `HolidayModel`

**Purpose**
- Holiday request records and team holiday overview.

**Typical fields**
- `_id`
- `userId: UserModel`
- `startTime`, `endTime`
- `totalDays`
- `status` (`pending`, `approved`, `declined`, `completed`)

**How it is implemented**
- Created from `RegisterHolidays.jsx` with total-day client calculation.
- Individual user history and org-wide holiday board are separate pages.
- Calendar events are generated from approved/completed ranges.
- Admin-style actions (approve/decline/delete) are in `HolidayCard`.

---

## 3) UI/View Models (Client-only Structures)

### 3.1 `WorkflowColumnsViewModel`
- Static kanban column config:
  - `col0` tasks this month
  - `col1` doing today
  - `col2` doing this week
  - `col3` done
- Used with `react-beautiful-dnd`; destination column id becomes `workflowStatus` on update.

### 3.2 `DeadlineTasksViewModel`
- Shape: `{ overdue: TaskModel[], upcoming: TaskModel[] }`
- Populated by `/tasks/fetch-deadlines` and rendered in workflow sidebar.

### 3.3 `CalendarEventViewModel` (time registrations)
- Shape: `{ id, title, start, end }`
- Derived from aggregated registration payload and rendered in `react-big-calendar`.

### 3.4 `CalendarHolidayEventViewModel`
- Shape: `{ id, title, start, end, allDay }`
- Derived from holidays for the holiday calendar.

### 3.5 `TaskCreateFormModel`
- Form payload in `CreateTask.jsx`:
  - `taskName`, `taskTimeLow`, `taskTimeHigh`, `taskDescription`
  - `taskCustomer`, `taskLabel`, `taskVertical`
  - `taskPersons`, `taskSprints`, `createdBy`
  - `taskDeadline`, `estimatedTime`, `taskType`
  - `tenantId`, `upcomingDeadlineNotificationSent`, `deadlineNotificationSent`

### 3.6 `TaskUpdateFormModel`
- Modal update payload:
  - `taskName`, `taskTimeLow`, `taskTimeHigh`, `taskDescription`, `taskDeadline`, `estimatedTime`

### 3.7 `TaskTimeRegistrationFormModel`
- Payload in `TaskTimeRegistration.jsx`:
  - `userId`, `taskId`, `timeRegistered`, `description`, `sprintId`, `currentTime`, `customerId`, `verticalId`

### 3.8 `RegisterHolidayFormModel`
- Payload in `RegisterHolidays.jsx`:
  - `userId`, `startTime`, `endTime`, `totalDays`

### 3.9 `UnreadNotificationStateModel`
- Boolean-only shared state: `hasUnreadNotifications`
- Set from:
  - login unread fetch
  - navbar socket events
  - dropdown/page read operations

---

## 4) Data Flow Patterns

### 4.1 Tenant-scoped API routing
- Most calls use `tenantBaseURL = `${baseURL}/${user.tenant_id}``.
- Non-tenant endpoints include sprint catalog and auth (`/api/account/*`).

### 4.2 Read-update-refresh loop
- Common pattern:
  1. Fetch model list/detail.
  2. Mutate model via POST/PUT/DELETE.
  3. Refetch collection/detail to sync UI.

### 4.3 Real-time notification flow
- Client opens socket connection in navbar.
- Registers room with `socket.emit('register', user.id)`.
- On `new-notification`, unread state is toggled and sound played.

### 4.4 Modal-driven task management
- Task cards open `TaskModal` (manual state or `useTaskModal` hook).
- Modal contains edit form, settings, time registration, and comment timeline.
- Parent pages refetch task collections after updates.

---

## 5) Important Implementation Notes

- Mixed casing exists between API responses and client usage (`profileImage` vs `profile_image`, `userRole` vs `user_role`).
- Some IDs are used as `id`, others as `_id`; code handles both depending on endpoint.
- Several view models are computed in-component (calendar events, deadline grouping, filtered tasks by column).
- API access is decentralized; model usage is distributed across many feature components instead of a centralized store.

---

## 6) Main Client Feature-to-Model Map

- **Auth/Profile**: `SessionModel`, `UserModel`, `UnreadNotificationStateModel`
- **Dashboard**: `TaskModel`, `TaskPersonModel`, `TimeRegistrationModel`, `SprintModel`
- **Create Task**: `TaskCreateFormModel`, `CustomerModel`, `LabelModel`, `VerticalModel`, `UserModel`, `SprintModel`
- **Workflow**: `TaskModel`, `WorkflowColumnsViewModel`, `DeadlineTasksViewModel`
- **Task Modal/Chat**: `TaskUpdateFormModel`, `CommentModel`, `TimeRegistrationModel`, `NotificationModel`
- **Customers**: `CustomerModel`, `CustomerTargetsModel`, `CustomerNoteModel`
- **Notifications**: `NotificationModel`, `TaskModel`, `CustomerModel`, `UserModel`
- **Holidays**: `HolidayModel`, `RegisterHolidayFormModel`, `CalendarHolidayEventViewModel`
- **Admin Overviews**: `UserModel`, aggregated `TimeRegistrationModel` projections, vertical aggregation rows

