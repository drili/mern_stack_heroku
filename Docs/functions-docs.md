# Functions Documentation

This document describes all utility modules in `functions/`, what they do, and how they are implemented.

## Overview

The `functions/` folder contains reusable helper functions used by backend features.

Current modules:

- `formatDateToMonthYear.js`
- `slackMessageUser.js`

---

## 1) `formatDateToMonthYear` (`functions/formatDateToMonthYear.js`)

### Purpose
Converts a date string into a `"Month Year"` label.

### Signature
- Input: `dateStr` (`String`), expected format `DD-MM-YYYY`
- Output: `String`, format `"<MonthName> <Year>"`

### How it works
1. Splits incoming string by `-` into day/month/year parts.
2. Parses each part into integers.
3. Creates a JavaScript `Date` with `new Date(year, monthIndex, day)`.
4. Maps month index to month name using a local month-name array.
5. Returns final formatted string, e.g. `"March 2026"`.

### Implementation details
- Uses manual month-name lookup instead of locale APIs.
- Converts month to zero-based index with `month - 1`.
- Exported as default CommonJS function (`module.exports = formatDateToMonthYear`).

### Notes
- Function assumes valid input format and does not include validation/error handling.
- If malformed dates are passed, output may be incorrect or invalid.

---

## 2) `sendSlackMessage` (`functions/slackMessageUser.js`)

### Purpose
Sends a direct Slack message (or message to a Slack channel ID) using Slack Web API.

### Signature
- Input:
  - `message` (`String`): message content
  - `userID` (`String`): Slack conversation/channel/user ID used as `channel`
- Output: no explicit return value (async side effect)

### How it works
1. Loads environment variables with `dotenv` from `../.env`.
2. Reads `SLACK_OAUTH_TOKEN` from `process.env`.
3. Sends POST request to `https://slack.com/api/chat.postMessage` via Axios.
4. Request body:
   - `channel: userID`
   - `text: message`
5. Sends `Authorization: Bearer <token>` header.
6. Logs errors from Slack API response if request fails.

### Implementation details
- Uses async function with `try/catch`.
- Uses JSON content type header.
- Exports the function as CommonJS module (`module.exports = sendSlackMessage`).

### Notes
- No success value is returned to caller.
- Error logging assumes `error.response.data` exists.
- Correct `.env` loading depends on runtime working directory and path resolution.

---

## Design Pattern in `functions/`

Both files follow lightweight utility-module style:

- one focused function per file
- CommonJS export/import conventions
- no class-based wrappers
- designed for direct use from routes/services/cron logic

This keeps helpers simple and easy to reuse across backend modules.
