# Instances Documentation

This document describes all scripts in `instances/`, what each script does, and how it is implemented.

## Overview

The `instances/` folder contains one-off operational scripts used for seeding data, bulk updates, and integration testing.

Common characteristics:

- Scripts connect directly to MongoDB with Mongoose.
- Most scripts perform a single action and then exit.
- Scripts are not route handlers; they are standalone execution files.

---

## 1) `CreateNewGroup.js`

### Purpose
Creates a new `Groups` record with a fixed group name and predefined users.

### What it does
- Connects to MongoDB.
- Builds a new `Groups` document:
  - `groupName: 'Developer'`
  - `groupPersons`: two hardcoded user ObjectIds.
- Saves the group and logs success/error.

### How it is implemented
- Imports Mongoose and `Groups` model.
- Uses direct `mongoose.connect(...)` with connection options.
- Instantiates `new Groups({...})` and calls `.save()` with promise handling.

### Notes
- User IDs are hardcoded.
- Script does not disconnect explicitly after completion.

---

## 2) `CreateNewSprintYear.js`

### Purpose
Creates a single `SprintYear` document.

### What it does
- Connects to MongoDB.
- Creates `SprintYear` with `sprintYear: 2023`.
- Saves and logs result or error.

### How it is implemented
- Imports Mongoose and `SprintYear` model.
- Uses simple `new SprintYear({...}).save()` pattern.

### Notes
- `sprintYear` is unique in schema, so rerunning with the same value can fail due to duplicate key.

---

## 3) `CreateNewSprintsThisYear.js`

### Purpose
Creates all monthly sprint documents for the current year.

### What it does
- Connects to MongoDB.
- Builds a month list from January to December.
- Reads `currentYear` from `new Date().getFullYear()`.
- For each month, creates a `Sprints` record with:
  - `sprintName: "<Month> <Year>"`
  - `sprintMonth: <Month>`
  - `sprintYear: <Year>`
- Saves all records with `Promise.all(...)`.

### How it is implemented
- Maps months to `new Sprints(...)` instances.
- Executes all saves in parallel and logs created documents.

### Notes
- `sprintName` is unique in schema; reruns in the same year may fail on duplicates.
- Script currently assumes all monthly sprints should be created in one run.

---

## 4) `SlackMessage.js`

### Purpose
Sends a test message to Slack using Slack Web API.

### What it does
- Calls `chat.postMessage` endpoint via Axios.
- Sends a fixed message to a fixed channel/user ID.
- Uses bearer token in request headers.
- Logs API response or error.

### How it is implemented
- Defines async function `sendSlackMessage()`.
- Performs `axios.post("https://slack.com/api/chat.postMessage", ...)`.
- Invokes function immediately at file end.

### Notes
- The script is designed as an integration smoke test.
- Token/channel/message are hardcoded.

---

## 5) `UpdateUsers_activeYear.js`

### Purpose
Bulk-updates all users to set `activeYear`.

### What it does
- Connects to MongoDB.
- Runs `User.updateMany({}, { $set: { activeYear: 2024 } })`.
- Logs update result.

### How it is implemented
- Async `updateUsers()` function.
- Empty filter `{}` targets every user document.
- Function is called immediately.

### Notes
- This is a global migration-style update and affects all users.
- No guard/confirm step before running.

---

## 6) `UpdateUsers_slackId.js`

### Purpose
Bulk-updates all users to set `slackId`.

### What it does
- Connects to MongoDB.
- Runs `User.updateMany({}, { $set: { slackId: "000" } })`.
- Logs update result.

### How it is implemented
- Same structure as `UpdateUsers_activeYear.js`.
- Targets all user documents due to `{}` filter.

### Notes
- This script overwrites Slack IDs for all users.
- Intended for reset/initialization scenarios, not routine execution.

---

## Cross-Script Implementation Pattern

Across these scripts, the pattern is:

1. Import required model(s) and libraries.
2. Connect with `mongoose.connect(...)`.
3. Perform one create/update/integration action.
4. Log result or error.

This makes scripts easy to run manually, but they are currently lightweight and not hardened as production migrations.

---

## Operational and Safety Considerations

Current scripts are useful for manual ops, but have important constraints:

- Hardcoded secrets/credentials: MongoDB URI and Slack auth data are embedded in script files.
- Hardcoded payload/data: IDs, year values, and reset values are fixed in code.
- No idempotency checks: reruns can fail (unique constraints) or overwrite data.
- No explicit `mongoose.disconnect()`: process usually exits naturally, but controlled teardown is better.
- No dry-run mode: bulk updates execute immediately.

For safer long-term usage, move credentials to environment variables, parameterize inputs, and add guard checks.
