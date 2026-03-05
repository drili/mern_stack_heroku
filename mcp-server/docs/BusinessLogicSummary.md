# Business Logic Summary

## account.js
- `POST /login`: Authenticates a user by email and password and returns a JWT plus their profile details so they can access the workspace.
- `POST /verify-account`: Confirms a tenant using a confirmation code, marks the tenant as verified, and creates the initial admin user for that tenant.
- `POST /register`: Creates a new tenant account with the chosen username, email, password, and confirmation code.

## users.js
- `PUT /update-sprint-year`: Updates a user's active sprint year for the current tenant.
- `POST /register`: Creates a new user under the tenant and immediately returns a login token and profile data.
- `POST /login`: Logs a tenant user in with email and password and returns a token plus their profile.
- `PUT /profile/update`: Lets a user update their username, email, and title.
- `PUT /profile/update-password`: Changes a user's password after hashing the new value.
- `PUT /profile/upload-image`: Uploads a profile image file and saves its filename on the user.
- `GET /fetch-active-users`: Lists all activated users in the tenant.
- `POST /users-not-in-task`: Returns activated users who are not part of a given task's assignees.
- `GET /fetch-all-users`: Lists every user for the tenant, ordered by name.
- `PUT /update-users/:userId`: Updates a user's fields with the provided payload.
- `PUT /update-user-activation/:userId`: Enables or disables a user account within the tenant.

## comments.js
- `PUT /edit-comment/:commentId`: Edits the HTML content of an existing task comment.
- `DELETE /delete-comment-by-id/:commentId`: Deletes a specific comment for the tenant.
- `POST /fetch-comments-by-task`: Retrieves all comments for a task with author details, ordered by creation time.
- `POST /create-comment`: Adds a new sanitized HTML comment to a task.

## customer-notes.js
- `DELETE /delete-customer-notes/:noteId`: Deletes a saved note for a customer.
- `GET /fetch-customer-notes`: Fetches notes for a customer (optionally filtered by sprint) with creator info populated.
- `POST /create-note`: Creates a new note for a customer and sprint authored by the given user.

## customer-targets.js
- `GET /fetch-customer-targets-by-id`: Returns the spending targets and KPIs stored for a specific customer.
- `POST /update-customer-targets-by-id`: Creates or updates a customer's target figures (spend by channel, target totals, percentage increase).

## customers.js
- `POST /update-customer`: Updates a customer's name and color.
- `GET /fetch-customer`: Fetches a single customer record by ID for the tenant.
- `POST /create`: Creates a new customer with name and color.
- `GET /fetch`: Lists all customers for the tenant (most recent first).
- `DELETE /delete/:customerId`: Deletes the specified customer record.
- `PUT /archive/:customerId`: Marks a customer as archived.
- `PUT /unarchive/:customerId`: Reverses archiving and reactivates the customer.

## holidays.js
- `DELETE /delete-holiday/:holidayId`: Removes a holiday request for the tenant.
- `PUT /approve-holiday/:holidayId`: Approves a holiday request.
- `PUT /decline-holiday/:holidayId`: Declines a holiday request.
- `GET /fetch-all-holidays/:userId`: Lists holidays for the tenant (optionally filtered by user) and marks past-due ones as completed.
- `GET /fetch-holidays-by-user/:userId`: Shows all holiday requests for a user and flags those whose end date has passed.
- `POST /register-holidays`: Submits a new holiday request with formatted start/end dates and total days.

## labels.js
- `POST /create-label`: Creates a new label with a default color for the tenant.
- `GET /fetch-labels`: Lists all labels for the tenant.

## notifications.js
- `POST /fetch-unread-notifications`: Retrieves unread notifications for a user with task, customer, and author details.
- `PUT /update-user-notification-read`: Marks a notification as read.
- `POST /fetch-user-notifications`: Lists all notifications for a user with related task and customer info.
- `POST /create-notification-task`: When quick tasks are created, notifies each assignee (WebSocket + optional Slack) that they were added.
- `POST /create-notification`: Creates mention notifications for selected users on a task, emitting WebSocket alerts and Slack messages when available.

## sprints.js
- `GET /fetch-sprint-years`: Returns all available sprint years.
- `GET /fetch`: Lists sprints for the requested year (or the current year by default) in chronological order.
- `GET /fetch-sprint-by-id/:sprintId`: Fetches a sprint by its ID.
- `GET /fetch-sprint-by-month-year/:sprintMonth/:sprintYear`: Retrieves sprints matching a specific month and year.

## tasks.js
- `GET /recent-tasks/:userId`: Returns the 10 most recent tasks assigned to the user.
- `GET /fetch-deadlines`: For a user, returns quick tasks due in the past week or next 7 days, split into overdue and upcoming.
- `POST /update-percentage`: Updates task effort percentages per assignee based on provided values.
- `POST /create`: Creates one task per selected sprint with the provided details and generates a slug-style handle.
- `GET /fetch-by-user/:userId`: Lists non-archived tasks created by the user with related people, customer, and sprint data.
- `GET /fetch-by-customer-sprint/:customerId`: Returns a customer's tasks in a specific sprint (with optional time registrations attached).
- `GET /fetch-by-user-sprint/:userId`: Lists tasks assigned to the user for a given sprint, optionally including time registrations.
- `GET /fetch-by-id/:taskId`: Fetches a task by ID with all related people, sprint, customer, and creator info.
- `PUT /update/:taskId`: Updates core task fields like name, estimates, description, deadline, and estimated time.
- `PUT /update-vertical/:taskId`: Changes the task's vertical/category.
- `PUT /update-customers/:taskId`: Switches the customer linked to the task.
- `PUT /update-sprint/:taskId`: Reassigns the task to a different sprint.
- `PUT /assign-user/:taskId`: Adds a user to the task and rebalances assignee percentages evenly.
- `PUT /remove-user/:taskId/:taskPersonId`: Removes an assignee from the task and rebalances remaining percentages.
- `PUT /archive-task/:taskId`: Toggles a task's archived status and logs an automatic comment noting the action.
- `PUT /update-taskworkflow/:taskId`: Updates the task's workflow status/stage.
- `GET /export-customer-sprints-to-excel`: Exports a customer's sprint tasks grouped by vertical with total registered time for each.
- `GET /fetch-task`: Retrieves all tasks for the tenant with optional filters for assignee and archived status, including related entities.

## time-registrations.js
- `GET /time-registrations-verticals-aggregated/:sprintId`: Aggregates total registered hours per vertical for a sprint.
- `GET /fetch-users-time-regs-by-sprint/:sprintId`: For the sprint, returns each active user's total, client, intern, and other hours.
- `DELETE /time-registration-delete/:eventId`: Deletes a specific time registration entry.
- `POST /time-registration-update`: Updates the hours on a time registration record.
- `GET /time-registrations-by-date/:date/:userId`: Retrieves a user's time registrations for a given date with task/customer context.
- `POST /time-registered-by-user`: Summarizes a user's total registered time per day.
- `POST /register-time`: Records a new time entry, auto-determines the sprint from the date, and sets registration type based on customer.
- `GET /time-registered/:taskId`: Lists all time registrations for a task with the registering users.
- `GET /time-registered-user/:sprintId/:userId/:tenantId`: Fetches all time registrations for a user within a sprint.

## updates.js
- `PUT /update-customer-schema`: One-off maintenance endpoint that sets `isArchived` to false for all customers.

## verticals.js
- `POST /create-vertical`: Creates a new vertical/category for the tenant.
- `GET /fetch-Verticals`: Lists all verticals for the tenant.
