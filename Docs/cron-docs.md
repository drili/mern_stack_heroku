# Cron Documentation

This document describes all scheduled jobs in `cron/`, what they do, and how they are implemented.

## Overview

The cron subsystem sends task-deadline reminders and missed-deadline alerts.

Files:

- `cron/index.js` (scheduler setup)
- `cron/checkUpcomingDeadlines.js` (tomorrow reminders)
- `cron/checkMissedDeadlines.js` (missed deadline alerts)

Main dependencies used by cron jobs:

- `Task` model (`models/Task`)
- `User` model (`models/User`)
- `NotificationChatTask` model (`models/NotificationChatTask`)
- `sendSlackMessage` helper (`functions/slackMessageUser`)
- Socket.IO instance from `app.get("io")`

---

## 1) Scheduler Entry Point (`cron/index.js`)

### Purpose
Registers and starts all periodic cron jobs.

### What it does
- Exports `startCrons(app)`.
- Schedules two daily jobs using `node-cron`:
  - `"0 0 * * *"` -> runs upcoming deadline check at 00:00.
  - `"1 0 * * *"` -> runs missed deadline check at 00:01.

### How it is implemented
- Imports both check functions.
- Uses `cron.schedule(...)` to register callbacks.
- Passes Express app instance into each job so jobs can access Socket.IO.

---

## 2) Upcoming Deadline Job (`cron/checkUpcomingDeadlines.js`)

### Purpose
Notifies assigned users one day before quick-task deadlines.

### What it does
1. Reads Socket.IO instance from `app.get("io")`.
2. Calculates tomorrow date and formats it as `YYYY-MM-DD`.
3. Finds tasks matching:
   - `taskType: "quickTask"`
   - `isArchived: false`
   - `taskDeadline: <tomorrow ISO date string>`
   - `workflowStatus != 3`
   - `upcomingDeadlineNotificationSent != true`
4. For each matching task, loops through `task.taskPersons`.
5. For each assigned user:
   - Loads user document.
   - Creates `NotificationChatTask` entry with `notificationType: "deadline_upcoming"`.
   - Emits Socket.IO event `new-notification` to that user room.
   - Sends Slack reminder if `user.slackId` is present.
6. Marks task as notified by setting `upcomingDeadlineNotificationSent = true` and saves task.
7. Logs summary counts.

### Models used
- `Task`: source records and flag update.
- `User`: resolving assignees and Slack IDs.
- `NotificationChatTask`: persistent in-app notification records.

### How it is implemented
- Asynchronous function exported as module.
- Sequential async loops (`for...of`) with awaited DB and Slack operations.
- Try/catch wraps full process.

---

## 3) Missed Deadline Job (`cron/checkMissedDeadlines.js`)

### Purpose
Notifies assigned users when quick-task deadlines have passed.

### What it does
1. Reads Socket.IO instance from `app.get("io")`.
2. Creates `today` date and normalizes to midnight (`00:00:00`).
3. Finds tasks matching:
   - `taskType: "quickTask"`
   - `isArchived: false`
   - `taskDeadline < today`
   - `workflowStatus != 3`
   - `deadlineNotificationSent != true`
4. For each matching task, loops through assigned users (`task.taskPersons`).
5. For each user:
   - Loads user document.
   - Creates `NotificationChatTask` entry with `notificationType: "deadline_missed"`.
   - Emits Socket.IO `new-notification` event.
   - Sends Slack alert if `user.slackId` exists.
6. Marks task as notified by setting `deadlineNotificationSent = true` and saves task.
7. Logs notified user count and task count.

### Models used
- `Task`: deadline filter and sent-flag update.
- `User`: assignee lookup and Slack destination.
- `NotificationChatTask`: durable alert record.

### How it is implemented
- Exported async function.
- Uses nested async loops and per-user notification creation.
- Error handling is done in top-level try/catch.

---

## Notification Flow

Both jobs follow the same notification pipeline:

1. Find eligible tasks.
2. Iterate task assignees (`taskPersons`).
3. Create in-app notification document.
4. Push real-time event over Socket.IO.
5. Optionally send Slack message.
6. Set task-level "already notified" flag to avoid duplicates.

---

## Key Query/Flag Logic

Duplicate-notification protection is done with task flags:

- Upcoming reminders use `upcomingDeadlineNotificationSent`.
- Missed alerts use `deadlineNotificationSent`.

Task completion/archive filters:

- Archived tasks are excluded (`isArchived: false`).
- Completed workflow tasks are excluded (`workflowStatus: { $ne: 3 }`).

Task type filter:

- Both jobs currently target only `taskType: "quickTask"`.

---

## Operational Notes

- Jobs run once daily shortly after midnight according to server timezone.
- Slack and Socket.IO delivery are best-effort per user inside loops.
- Notification entries include tenant and task references for multi-tenant routing and UI linking.
- Frontend deep-links are built in Slack message text using tenant/task IDs.
