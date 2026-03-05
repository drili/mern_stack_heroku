/* MCP SSE bridge for TaskAlloc8or
 * - Uses SSEServerTransport from @modelcontextprotocol/sdk
 * - Validates tool inputs with the Zod schemas from docs/ZodSchemaGeneration.md
 * - Redacts sensitive fields before any data is returned to an LLM client
 */

(async () => {
  const express = require("express");
  const jwt = require("jsonwebtoken");
  const axios = require("axios");
  const crypto = require("crypto");
  const { z } = require("zod");
  const { zodToJsonSchema } = require("zod-to-json-schema");

  const cors = require("cors");

  const { McpServer } = await import("@modelcontextprotocol/sdk/server/mcp.js");
  const { SSEServerTransport } =
    await import("@modelcontextprotocol/sdk/server/sse.js");
  const { createMcpExpressApp } =
    await import("@modelcontextprotocol/sdk/server/express.js");

  const PORT = process.env.MCP_PORT || process.env.PORT || 3000;
  const API_BASE_URL =
    process.env.TASKALLOC8OR_API_BASE || "http://localhost:4000";
  const DEFAULT_TENANT_ID = "667d57ddbe55c4fd9363c3ff";
  const JWT_SECRET =
    process.env.JWT_SECRET ||
    process.env.JWT_PUBLIC_KEY ||
    process.env.TASKALLOC8OR_JWT_SECRET ||
    null;
  const REDACTION_SALT =
    process.env.REDACTION_SALT || "taskalloc8or-redaction-salt";

  const app = createMcpExpressApp();
  app.use(express.json());

  // Tillad alt i udviklingsfasen, så vi er sikre på det virker
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  const transports = new Map();
  const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
  });
  const server = new McpServer(
    { name: "taskalloc8or-sse", version: "0.1.0" },
    { capabilities: { logging: {} } },
  );

  // --------------------------- Redaction helpers ---------------------------
  const SENSITIVE_KEYS = new Set(
    [
      "token",
      "accountconfirmationcode",
      "tenantconfirmationcode",
      "accountconfirmed",
      "tenantconfirmed",
      "ispasswordhashed",
      "email",
      "username",
      "profileimage",
      "profile_image",
      "slackid",
      "tenantid",
      "tenant_id",
      "accountusername",
      "tenantusername",
      "htmlcontent",
      "notetitle",
      "notecontent",
      "notificationmessage",
      "taskdescription",
      "description",
      "starttime",
      "endtime",
      "totaldays",
      "status",
      "userid",
      "user_id",
      "timeregistered",
      "currenttime",
      "registrationtype",
      "customername",
      "spendgoogleads",
      "spendmeta",
      "spendlinkedin",
      "customertarget",
      "percentageincrease",
      "taskcustomer",
      "taskhandle",
      "notificationlink",
      "confirmationcode",
    ].map((k) => k.toLowerCase()),
  );

  const SUBSTRING_BLOCKLIST = ["password", "token", "confirmationcode"];
  const PSEUDONYMIZE_KEYS = new Set([
    "userid",
    "user_id",
    "createdby",
    "mentionedby",
    "archivedby",
    "user",
    "tenantid",
    "tenant_id",
  ]);

  const looksLikeJwt = (value) =>
    typeof value === "string" &&
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value);

  const pseudonymize = (value, namespace = "id") =>
    `anon-${namespace}-${crypto
      .createHash("sha256")
      .update(`${REDACTION_SALT}:${namespace}:${value}`)
      .digest("hex")
      .slice(0, 12)}`;

  const isSensitiveKey = (key) => {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lower)) return true;
    return SUBSTRING_BLOCKLIST.some((part) => lower.includes(part));
  };

  const redactForLLM = (input) => {
    if (input === null || input === undefined) return input;
    if (Array.isArray(input))
      return input
        .map((item) => redactForLLM(item))
        .filter((item) => item !== undefined);

    if (typeof input === "object") {
      const output = {};
      for (const [key, value] of Object.entries(input)) {
        if (value === undefined) continue;
        const lower = key.toLowerCase();

        if (isSensitiveKey(lower)) continue;

        if (PSEUDONYMIZE_KEYS.has(lower) && typeof value === "string") {
          output[key] = pseudonymize(
            value,
            lower.startsWith("tenant") ? "tenant" : "user",
          );
          continue;
        }

        const redactedValue = redactForLLM(value);
        if (redactedValue !== undefined) output[key] = redactedValue;
      }
      return output;
    }

    if (looksLikeJwt(input)) return "[redacted-token]";
    return input;
  };

  // ------------------------------ Zod schemas ------------------------------
  const objectId = z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Expected MongoDB ObjectId string");
  const looseId = z.string().min(1, "ID is required");
  const tenantParam = z.object({ tenantId: objectId });
  const idOrZero = z.union([objectId, z.literal("0")]);
  const boolish = z.union([z.boolean(), z.enum(["true", "false"])]);
  const percentageMap = z.record(looseId, z.coerce.number().finite());
  const fileUpload = z.any();
  const dateString = z.string().min(1);

  const usersSchemas = {
    updateSprintYear: {
      params: tenantParam,
      body: z.object({
        userId: objectId,
        activeYear: z.coerce.number().int().optional(),
      }),
    },
    register: {
      params: tenantParam,
      body: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        email: z.string().email(),
        is_activated: z.boolean().optional(),
        profile_image: z.string().optional(),
        user_role: z.number().int().optional(),
        user_title: z.string().optional(),
      }),
    },
    login: {
      params: tenantParam,
      body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    },
    updateProfile: {
      params: tenantParam,
      body: z.object({
        userId: objectId,
        username: z.string().optional(),
        email: z.string().email().optional(),
        userTitle: z.string().optional(),
      }),
    },
    updatePassword: {
      params: tenantParam,
      body: z.object({
        userId: objectId,
        newPassword: z.string().min(1),
      }),
    },
    uploadProfileImage: {
      params: tenantParam,
      body: z.object({
        userId: objectId,
        profileImage: fileUpload,
      }),
    },
    fetchActiveUsers: { params: tenantParam },
    usersNotInTask: {
      params: tenantParam,
      body: z.object({
        taskPersons: z.array(z.object({ user: objectId })),
      }),
    },
    fetchAllUsers: { params: tenantParam },
    updateUserById: {
      params: tenantParam.merge(z.object({ userId: objectId })),
      body: z
        .object({
          username: z.string().optional(),
          email: z.string().email().optional(),
          isActivated: z.boolean().optional(),
          profileImage: z.string().optional(),
          userRole: z.number().int().optional(),
          userTitle: z.string().optional(),
          activeYear: z.coerce.number().int().optional(),
          slackId: z.string().optional(),
          password: z.string().optional(),
        })
        .passthrough(),
    },
    updateUserActivation: {
      params: tenantParam.merge(z.object({ userId: objectId })),
      body: z.object({
        isActivated: z.boolean(),
      }),
    },
  };

  const accountSchemas = {
    login: {
      body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    },
    verifyAccount: {
      body: z.object({
        email: z.string().email(),
        confirmationCode: z.string().min(1),
      }),
    },
    register: {
      body: z.object({
        accountUsername: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(1),
        confirmationCode: z.string().min(1),
      }),
    },
  };

  const commentSchemas = {
    editComment: {
      params: tenantParam.merge(z.object({ commentId: objectId })),
      body: z.object({ htmlContent: z.string().min(1) }),
    },
    deleteCommentById: {
      params: tenantParam.merge(z.object({ commentId: objectId })),
    },
    fetchCommentsByTask: {
      params: tenantParam,
      body: z.object({ taskId: objectId }),
    },
    createComment: {
      params: tenantParam,
      body: z.object({
        taskId: objectId,
        htmlContent: z.string().min(1),
        createdBy: objectId,
      }),
    },
  };

  const customerNoteSchemas = {
    deleteNote: {
      params: tenantParam.merge(z.object({ noteId: objectId })),
    },
    fetchNotes: {
      params: tenantParam,
      query: z.object({
        customerId: objectId,
        sprintId: objectId.optional(),
      }),
    },
    createNote: {
      params: tenantParam,
      body: z.object({
        customerId: objectId,
        userId: objectId,
        sprintId: objectId,
        noteTitle: z.string().min(1),
        noteContent: z.string().min(1),
      }),
    },
  };

  const customerTargetSchemas = {
    fetchById: {
      params: tenantParam,
      query: z.object({ customerId: objectId }),
    },
    updateById: {
      params: tenantParam,
      body: z.object({
        customerId: objectId,
        spendGoogleAds: z.string().optional(),
        spendMeta: z.string().optional(),
        spendLinkedIn: z.string().optional(),
        customerTarget: z.string().optional(),
        percentageIncrease: z.string().optional(),
      }),
    },
  };

  const customerSchemas = {
    update: {
      params: tenantParam,
      body: z.object({
        customerId: objectId,
        customerName: z.string().optional(),
        customerColor: z.string().optional(),
      }),
    },
    fetchById: {
      params: tenantParam,
      query: z.object({ customerId: objectId }),
    },
    create: {
      params: tenantParam,
      body: z.object({
        customerName: z.string().min(1),
        customerColor: z.string().min(1),
      }),
    },
    fetchAll: { params: tenantParam },
    delete: {
      params: tenantParam.merge(z.object({ customerId: objectId })),
    },
    archive: {
      params: tenantParam.merge(z.object({ customerId: objectId })),
    },
    unarchive: {
      params: tenantParam.merge(z.object({ customerId: objectId })),
    },
  };

  const holidaySchemas = {
    delete: {
      params: tenantParam.merge(z.object({ holidayId: objectId })),
    },
    approve: {
      params: tenantParam.merge(z.object({ holidayId: objectId })),
    },
    decline: {
      params: tenantParam.merge(z.object({ holidayId: objectId })),
    },
    fetchAll: {
      params: tenantParam.merge(z.object({ userId: idOrZero })),
    },
    fetchByUser: {
      params: tenantParam.merge(z.object({ userId: objectId })),
    },
    register: {
      params: tenantParam,
      body: z.object({
        userId: objectId,
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        totalDays: z.union([z.string(), z.coerce.number()]),
      }),
    },
  };

  const labelSchemas = {
    create: {
      params: tenantParam,
      body: z.object({
        labelName: z.string().min(1),
        labelColor: z.string().optional(),
      }),
    },
    fetch: { params: tenantParam },
  };

  const mentionUser = z.object({ id: objectId });
  const notificationTaskInput = z.object({
    _id: objectId,
    taskType: z.string().min(1),
    taskPersons: z.array(z.object({ user: objectId })),
    taskCustomer: objectId,
    createdBy: objectId,
    taskName: z.string().min(1),
    taskDeadline: z.string().optional(),
    tenantId: objectId,
  });

  const notificationSchemas = {
    fetchUnread: {
      params: tenantParam,
      body: z.object({ userId: objectId }),
    },
    markRead: {
      params: tenantParam,
      body: z.object({ notificationId: objectId }),
    },
    fetchUser: {
      params: tenantParam,
      body: z.object({ userId: objectId }),
    },
    createForTasks: {
      params: tenantParam,
      body: z.object({ data: z.array(notificationTaskInput) }),
    },
    create: {
      params: tenantParam,
      body: z.object({
        mentionedUsers: z.array(mentionUser),
        taskId: objectId,
        taskCustomer: objectId,
        mentionedBy: objectId,
        htmlContent: z.string().min(1),
      }),
    },
  };

  const sprintSchemas = {
    fetchYears: {},
    fetch: {
      query: z.object({
        activeYear: z.coerce.number().int().optional(),
      }),
    },
    fetchById: {
      params: z.object({ sprintId: objectId }),
    },
    fetchByMonthYear: {
      params: z.object({
        sprintMonth: z.string().min(1),
        sprintYear: z.coerce.number().int(),
      }),
    },
  };

  const taskPersonInput = z.object({
    user: objectId,
    percentage: z.coerce.number().optional(),
  });

  const taskSchemas = {
    recentTasks: {
      params: tenantParam.merge(z.object({ userId: objectId })),
    },
    fetchDeadlines: {
      params: tenantParam,
      query: z.object({ userId: objectId }),
    },
    updatePercentage: {
      params: tenantParam,
      body: z.object({
        taskId: objectId,
        percentageValues: percentageMap.optional(),
      }),
    },
    create: {
      params: tenantParam,
      body: z.object({
        taskName: z.string().min(1),
        taskTimeLow: z.coerce.number(),
        taskTimeHigh: z.coerce.number(),
        taskDescription: z.string().optional(),
        taskCustomer: objectId,
        taskLabel: objectId,
        taskVertical: objectId,
        taskPersons: z.array(taskPersonInput).min(1),
        taskSprints: z.array(objectId).min(1),
        createdBy: objectId,
        taskDeadline: z.string().optional(),
        estimatedTime: z.coerce.number().optional(),
        taskType: z.string().optional(),
      }),
    },
    fetchByUser: {
      params: tenantParam.merge(z.object({ userId: objectId })),
    },
    fetchByCustomerSprint: {
      params: tenantParam.merge(z.object({ customerId: objectId })),
      query: z.object({
        month: z.string().min(1),
        year: z.union([z.string().min(1), z.coerce.number()]),
        time_reg: boolish.optional(),
      }),
    },
    fetchByUserSprint: {
      params: tenantParam.merge(z.object({ userId: objectId })),
      query: z.object({
        month: z.string().min(1),
        year: z.union([z.string().min(1), z.coerce.number()]),
        time_reg: boolish.optional(),
      }),
    },
    fetchById: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
    },
    update: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
      body: z.object({
        taskName: z.string().optional(),
        taskTimeLow: z.coerce.number().optional(),
        taskTimeHigh: z.coerce.number().optional(),
        taskDescription: z.string().optional(),
        taskDeadline: z.string().optional(),
        estimatedTime: z.coerce.number().optional(),
      }),
    },
    updateVertical: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
      body: z.object({ taskVertical: objectId }),
    },
    updateCustomer: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
      body: z.object({ customerId: objectId }),
    },
    updateSprint: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
      body: z.object({
        taskSprintId: z.union([objectId, z.array(objectId).min(1)]),
      }),
    },
    assignUser: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
      body: z.object({ assignedUserId: objectId }),
    },
    removeUser: {
      params: tenantParam.merge(
        z.object({ taskId: objectId, taskPersonId: objectId }),
      ),
    },
    archiveTask: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
      body: z.object({ userId: objectId }),
    },
    updateTaskWorkflow: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
      body: z.object({ workflowStatus: z.coerce.number().int() }),
    },
    exportCustomerSprint: {
      params: tenantParam,
      query: z.object({
        customerId: objectId,
        sprintId: objectId,
      }),
    },
    fetchTasks: {
      params: tenantParam,
      query: z.object({
        userId: objectId.optional(),
        archived: boolish.optional(),
      }),
    },
  };

  const timeRegistrationSchemas = {
    verticalsAggregated: {
      params: tenantParam.merge(z.object({ sprintId: objectId })),
    },
    fetchUsersBySprint: {
      params: tenantParam.merge(z.object({ sprintId: objectId })),
    },
    deleteRegistration: {
      params: tenantParam.merge(z.object({ eventId: objectId })),
    },
    updateRegistration: {
      params: tenantParam,
      body: z.object({
        eventId: objectId,
        editedTime: z.coerce.number(),
      }),
    },
    fetchByDate: {
      params: tenantParam.merge(
        z.object({ date: dateString, userId: objectId }),
      ),
    },
    timeRegisteredByUser: {
      params: tenantParam,
      body: z.object({ userId: objectId }),
    },
    registerTime: {
      params: tenantParam,
      body: z.object({
        userId: objectId,
        taskId: objectId.optional(),
        timeRegistered: z.coerce.number(),
        description: z.string().optional(),
        currentTime: dateString,
        registrationType: z.string().optional(),
        customerId: objectId.optional(),
        verticalId: objectId.optional(),
      }),
    },
    timeRegisteredByTask: {
      params: tenantParam.merge(z.object({ taskId: objectId })),
    },
    timeRegisteredByUserAndSprint: {
      params: tenantParam
        .merge(z.object({ sprintId: objectId, userId: objectId }))
        .passthrough(),
    },
  };

  const updateSchemas = {
    updateCustomerSchema: {
      params: tenantParam,
    },
  };

  const verticalSchemas = {
    create: {
      params: tenantParam,
      body: z.object({ verticalName: z.string().min(1) }),
    },
    fetch: { params: tenantParam },
  };

  // --------------------------- Endpoint registry --------------------------
  const ROUTES = {
    account: {
      login: {
        method: "post",
        path: "/api/account/login",
        schema: accountSchemas.login,
        description:
          "Authenticate an account and fetch user profile (token redacted).",
      },
      verifyAccount: {
        method: "post",
        path: "/api/account/verify-account",
        schema: accountSchemas.verifyAccount,
        description: "Verify a tenant using confirmation code.",
      },
      register: {
        method: "post",
        path: "/api/account/register",
        schema: accountSchemas.register,
        description: "Create a new tenant account (secrets redacted).",
      },
    },
    users: {
      updateSprintYear: {
        method: "put",
        path: "/:tenantId/users/update-sprint-year",
        schema: usersSchemas.updateSprintYear,
        description: "Set active sprint year for a user.",
      },
      register: {
        method: "post",
        path: "/:tenantId/users/register",
        schema: usersSchemas.register,
        description: "Register a user within the tenant.",
      },
      login: {
        method: "post",
        path: "/:tenantId/users/login",
        schema: usersSchemas.login,
        description: "Tenant-scoped user login (token redacted).",
      },
      updateProfile: {
        method: "put",
        path: "/:tenantId/users/profile/update",
        schema: usersSchemas.updateProfile,
        description: "Update username/email/title.",
      },
      updatePassword: {
        method: "put",
        path: "/:tenantId/users/profile/update-password",
        schema: usersSchemas.updatePassword,
        description: "Change user password.",
      },
      uploadProfileImage: {
        method: "put",
        path: "/:tenantId/users/profile/upload-image",
        schema: usersSchemas.uploadProfileImage,
        description: "Upload profile image (multipart; pass base64 string).",
      },
      fetchActiveUsers: {
        method: "get",
        path: "/:tenantId/users/fetch-active-users",
        schema: usersSchemas.fetchActiveUsers,
        description: "List activated users.",
      },
      usersNotInTask: {
        method: "post",
        path: "/:tenantId/users/users-not-in-task",
        schema: usersSchemas.usersNotInTask,
        description: "List activated users not already on a task.",
      },
      fetchAllUsers: {
        method: "get",
        path: "/:tenantId/users/fetch-all-users",
        schema: usersSchemas.fetchAllUsers,
        description: "List all users for tenant.",
      },
      updateUserById: {
        method: "put",
        path: "/:tenantId/users/update-users/:userId",
        schema: usersSchemas.updateUserById,
        description: "Update user fields.",
      },
      updateUserActivation: {
        method: "put",
        path: "/:tenantId/users/update-user-activation/:userId",
        schema: usersSchemas.updateUserActivation,
        description: "Enable/disable a user.",
      },
    },
    comments: {
      editComment: {
        method: "put",
        path: "/:tenantId/comments/edit-comment/:commentId",
        schema: commentSchemas.editComment,
        description: "Edit a comment body.",
      },
      deleteCommentById: {
        method: "delete",
        path: "/:tenantId/comments/delete-comment-by-id/:commentId",
        schema: commentSchemas.deleteCommentById,
        description: "Delete a comment.",
      },
      fetchCommentsByTask: {
        method: "post",
        path: "/:tenantId/comments/fetch-comments-by-task",
        schema: commentSchemas.fetchCommentsByTask,
        description: "Fetch comments for a task.",
      },
      createComment: {
        method: "post",
        path: "/:tenantId/comments/create-comment",
        schema: commentSchemas.createComment,
        description: "Create a new comment.",
      },
    },
    customerNotes: {
      deleteNote: {
        method: "delete",
        path: "/:tenantId/customer-notes/delete-customer-notes/:noteId",
        schema: customerNoteSchemas.deleteNote,
        description: "Delete a customer note.",
      },
      fetchNotes: {
        method: "get",
        path: "/:tenantId/customer-notes/fetch-customer-notes",
        schema: customerNoteSchemas.fetchNotes,
        description: "Fetch notes by customer/sprint.",
      },
      createNote: {
        method: "post",
        path: "/:tenantId/customer-notes/create-note",
        schema: customerNoteSchemas.createNote,
        description: "Create a customer note.",
      },
    },
    customerTargets: {
      fetchById: {
        method: "get",
        path: "/:tenantId/customer-targets/fetch-customer-targets-by-id",
        schema: customerTargetSchemas.fetchById,
        description: "Fetch targets for a customer.",
      },
      updateById: {
        method: "post",
        path: "/:tenantId/customer-targets/update-customer-targets-by-id",
        schema: customerTargetSchemas.updateById,
        description: "Create/update customer targets.",
      },
    },
    customers: {
      update: {
        method: "post",
        path: "/:tenantId/customers/update-customer",
        schema: customerSchemas.update,
        description: "Update customer info.",
      },
      fetchById: {
        method: "get",
        path: "/:tenantId/customers/fetch-customer",
        schema: customerSchemas.fetchById,
        description: "Fetch a customer by id.",
      },
      create: {
        method: "post",
        path: "/:tenantId/customers/create",
        schema: customerSchemas.create,
        description: "Create a customer.",
      },
      fetchAll: {
        method: "get",
        path: "/:tenantId/customers/fetch",
        schema: customerSchemas.fetchAll,
        description: "List customers.",
      },
      delete: {
        method: "delete",
        path: "/:tenantId/customers/delete/:customerId",
        schema: customerSchemas.delete,
        description: "Delete a customer.",
      },
      archive: {
        method: "put",
        path: "/:tenantId/customers/archive/:customerId",
        schema: customerSchemas.archive,
        description: "Archive a customer.",
      },
      unarchive: {
        method: "put",
        path: "/:tenantId/customers/unarchive/:customerId",
        schema: customerSchemas.unarchive,
        description: "Unarchive a customer.",
      },
    },
    holidays: {
      delete: {
        method: "delete",
        path: "/:tenantId/holidays/delete-holiday/:holidayId",
        schema: holidaySchemas.delete,
        description: "Delete a holiday request.",
      },
      approve: {
        method: "put",
        path: "/:tenantId/holidays/approve-holiday/:holidayId",
        schema: holidaySchemas.approve,
        description: "Approve a holiday.",
      },
      decline: {
        method: "put",
        path: "/:tenantId/holidays/decline-holiday/:holidayId",
        schema: holidaySchemas.decline,
        description: "Decline a holiday.",
      },
      fetchAll: {
        method: "get",
        path: "/:tenantId/holidays/fetch-all-holidays/:userId",
        schema: holidaySchemas.fetchAll,
        description: "Fetch holidays (all or for a user).",
      },
      fetchByUser: {
        method: "get",
        path: "/:tenantId/holidays/fetch-holidays-by-user/:userId",
        schema: holidaySchemas.fetchByUser,
        description: "Fetch holidays by user.",
      },
      register: {
        method: "post",
        path: "/:tenantId/holidays/register-holidays",
        schema: holidaySchemas.register,
        description: "Create a holiday request.",
      },
    },
    labels: {
      create: {
        method: "post",
        path: "/:tenantId/labels/create-label",
        schema: labelSchemas.create,
        description: "Create a label.",
      },
      fetch: {
        method: "get",
        path: "/:tenantId/labels/fetch-labels",
        schema: labelSchemas.fetch,
        description: "Fetch labels.",
      },
    },
    notifications: {
      fetchUnread: {
        method: "post",
        path: "/:tenantId/notifications/fetch-unread-notifications",
        schema: notificationSchemas.fetchUnread,
        description: "Fetch unread notifications.",
      },
      markRead: {
        method: "put",
        path: "/:tenantId/notifications/update-user-notification-read",
        schema: notificationSchemas.markRead,
        description: "Mark notification as read.",
      },
      fetchUser: {
        method: "post",
        path: "/:tenantId/notifications/fetch-user-notifications",
        schema: notificationSchemas.fetchUser,
        description: "Fetch all notifications for user.",
      },
      createForTasks: {
        method: "post",
        path: "/:tenantId/notifications/create-notification-task",
        schema: notificationSchemas.createForTasks,
        description: "Create notifications for quick tasks.",
      },
      create: {
        method: "post",
        path: "/:tenantId/notifications/create-notification",
        schema: notificationSchemas.create,
        description: "Create mention notifications.",
      },
    },
    sprints: {
      fetchYears: {
        method: "get",
        path: "/sprints/fetch-sprint-years",
        schema: sprintSchemas.fetchYears,
        description: "Fetch sprint years.",
      },
      fetch: {
        method: "get",
        path: "/sprints/fetch",
        schema: sprintSchemas.fetch,
        description: "Fetch sprints by year.",
      },
      fetchById: {
        method: "get",
        path: "/sprints/fetch-sprint-by-id/:sprintId",
        schema: sprintSchemas.fetchById,
        description: "Fetch sprint by id.",
      },
      fetchByMonthYear: {
        method: "get",
        path: "/sprints/fetch-sprint-by-month-year/:sprintMonth/:sprintYear",
        schema: sprintSchemas.fetchByMonthYear,
        description: "Fetch sprints by month/year.",
      },
    },
    tasks: {
      recentTasks: {
        method: "get",
        path: "/:tenantId/tasks/recent-tasks/:userId",
        schema: taskSchemas.recentTasks,
        description: "Fetch the 10 most recent tasks for a user.",
      },
      fetchDeadlines: {
        method: "get",
        path: "/:tenantId/tasks/fetch-deadlines",
        schema: taskSchemas.fetchDeadlines,
        description: "Fetch overdue/upcoming quick tasks by user.",
      },
      updatePercentage: {
        method: "post",
        path: "/:tenantId/tasks/update-percentage",
        schema: taskSchemas.updatePercentage,
        description: "Update percentage allocations.",
      },
      create: {
        method: "post",
        path: "/:tenantId/tasks/create",
        schema: taskSchemas.create,
        description: "Create task(s) for sprints.",
      },
      fetchByUser: {
        method: "get",
        path: "/:tenantId/tasks/fetch-by-user/:userId",
        schema: taskSchemas.fetchByUser,
        description: "Fetch tasks created by a user.",
      },
      fetchByCustomerSprint: {
        method: "get",
        path: "/:tenantId/tasks/fetch-by-customer-sprint/:customerId",
        schema: taskSchemas.fetchByCustomerSprint,
        description: "Fetch tasks by customer and sprint.",
      },
      fetchByUserSprint: {
        method: "get",
        path: "/:tenantId/tasks/fetch-by-user-sprint/:userId",
        schema: taskSchemas.fetchByUserSprint,
        description: "Fetch tasks by user and sprint.",
      },
      fetchById: {
        method: "get",
        path: "/:tenantId/tasks/fetch-by-id/:taskId",
        schema: taskSchemas.fetchById,
        description: "Fetch a task by id.",
      },
      update: {
        method: "put",
        path: "/:tenantId/tasks/update/:taskId",
        schema: taskSchemas.update,
        description: "Update core task fields.",
      },
      updateVertical: {
        method: "put",
        path: "/:tenantId/tasks/update-vertical/:taskId",
        schema: taskSchemas.updateVertical,
        description: "Update task vertical.",
      },
      updateCustomer: {
        method: "put",
        path: "/:tenantId/tasks/update-customers/:taskId",
        schema: taskSchemas.updateCustomer,
        description: "Update task customer.",
      },
      updateSprint: {
        method: "put",
        path: "/:tenantId/tasks/update-sprint/:taskId",
        schema: taskSchemas.updateSprint,
        description: "Update sprint assignment.",
      },
      assignUser: {
        method: "put",
        path: "/:tenantId/tasks/assign-user/:taskId",
        schema: taskSchemas.assignUser,
        description: "Assign user to task and rebalance percentages.",
      },
      removeUser: {
        method: "put",
        path: "/:tenantId/tasks/remove-user/:taskId/:taskPersonId",
        schema: taskSchemas.removeUser,
        description: "Remove user from task and rebalance.",
      },
      archiveTask: {
        method: "put",
        path: "/:tenantId/tasks/archive-task/:taskId",
        schema: taskSchemas.archiveTask,
        description: "Toggle archive for task.",
      },
      updateTaskWorkflow: {
        method: "put",
        path: "/:tenantId/tasks/update-taskworkflow/:taskId",
        schema: taskSchemas.updateTaskWorkflow,
        description: "Update workflow status.",
      },
      exportCustomerSprint: {
        method: "get",
        path: "/:tenantId/tasks/export-customer-sprints-to-excel",
        schema: taskSchemas.exportCustomerSprint,
        description: "Export tasks grouped by vertical.",
      },
      fetchTasks: {
        method: "get",
        path: "/:tenantId/tasks/fetch-task",
        schema: taskSchemas.fetchTasks,
        description: "Fetch all tasks with filters.",
      },
    },
    timeRegistrations: {
      verticalsAggregated: {
        method: "get",
        path: "/:tenantId/time-registrations/time-registrations-verticals-aggregated/:sprintId",
        schema: timeRegistrationSchemas.verticalsAggregated,
        description: "Aggregate registered hours by vertical.",
      },
      fetchUsersBySprint: {
        method: "get",
        path: "/:tenantId/time-registrations/fetch-users-time-regs-by-sprint/:sprintId",
        schema: timeRegistrationSchemas.fetchUsersBySprint,
        description: "Fetch user totals for a sprint.",
      },
      deleteRegistration: {
        method: "delete",
        path: "/:tenantId/time-registrations/time-registration-delete/:eventId",
        schema: timeRegistrationSchemas.deleteRegistration,
        description: "Delete a time registration event.",
      },
      updateRegistration: {
        method: "post",
        path: "/:tenantId/time-registrations/time-registration-update",
        schema: timeRegistrationSchemas.updateRegistration,
        description: "Update hours on a registration.",
      },
      fetchByDate: {
        method: "get",
        path: "/:tenantId/time-registrations/time-registrations-by-date/:date/:userId",
        schema: timeRegistrationSchemas.fetchByDate,
        description: "Fetch time registrations by date and user.",
      },
      timeRegisteredByUser: {
        method: "post",
        path: "/:tenantId/time-registrations/time-registered-by-user",
        schema: timeRegistrationSchemas.timeRegisteredByUser,
        description: "Summaries of user time per day.",
      },
      registerTime: {
        method: "post",
        path: "/:tenantId/time-registrations/register-time",
        schema: timeRegistrationSchemas.registerTime,
        description: "Register new time entry.",
      },
      timeRegisteredByTask: {
        method: "get",
        path: "/:tenantId/time-registrations/time-registered/:taskId",
        schema: timeRegistrationSchemas.timeRegisteredByTask,
        description: "Fetch time registrations for a task.",
      },
      timeRegisteredByUserAndSprint: {
        method: "get",
        path: "/:tenantId/time-registrations/time-registered-user/:sprintId/:userId/:tenantId",
        schema: timeRegistrationSchemas.timeRegisteredByUserAndSprint,
        description:
          "Fetch time registrations for a user in a sprint (path carries tenant twice).",
      },
    },
    updates: {
      updateCustomerSchema: {
        method: "put",
        path: "/:tenantId/updates/update-customer-schema",
        schema: updateSchemas.updateCustomerSchema,
        description: "One-off maintenance to reset customer archive flag.",
      },
    },
    verticals: {
      create: {
        method: "post",
        path: "/:tenantId/verticals/create-vertical",
        schema: verticalSchemas.create,
        description: "Create a vertical.",
      },
      fetch: {
        method: "get",
        path: "/:tenantId/verticals/fetch-Verticals",
        schema: verticalSchemas.fetch,
        description: "Fetch verticals (note capital V).",
      },
    },
  };

  // ----------------------------- Middleware --------------------------------
  const attachTenantFromJwt = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return next();

    const token = header.slice("Bearer ".length);
    let payload = null;
    if (!JWT_SECRET) {
      payload = jwt.decode(token) || {};
    } else {
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ error: "invalid or expired token" });
      }
    }

    req.auth = {
      token,
      clientId: payload.sub || "anonymous",
      scopes: payload.scp || payload.scopes || [],
      extra: { tenantId: payload.tenantId || payload.tid },
    };
    return next();
  };

  // ----------------------------- Utilities ---------------------------------
  const pickFromRaw = (raw, schema) => {
    if (!schema || typeof raw !== "object" || raw === null) return {};
    const shape =
      typeof schema.shape === "function" ? schema.shape() : schema.shape;
    if (!shape) return {};
    return Object.keys(shape).reduce((acc, key) => {
      if (raw[key] !== undefined) acc[key] = raw[key];
      return acc;
    }, {});
  };

  const validateArgs = (routeSchema, rawArgs = {}, pathTemplate = "") => {
    if (!routeSchema)
      return {
        params: rawArgs.params || {},
        query: rawArgs.query || {},
        body: rawArgs.body || rawArgs || {},
      };

    const normalized = {};
    if (routeSchema.params)
      normalized.params =
        rawArgs.params ?? pickFromRaw(rawArgs, routeSchema.params);
    // allow tenantId passed at top-level (common in some MCP clients)
    if (!normalized.params && rawArgs.tenantId) {
      normalized.params = { tenantId: rawArgs.tenantId };
    }
    if (routeSchema.query)
      normalized.query =
        rawArgs.query ?? pickFromRaw(rawArgs, routeSchema.query);
    if (routeSchema.body)
      normalized.body = rawArgs.body ?? pickFromRaw(rawArgs, routeSchema.body);

    const shape = {};
    if (routeSchema.params) shape.params = routeSchema.params;
    if (routeSchema.query) shape.query = routeSchema.query;
    if (routeSchema.body) shape.body = routeSchema.body;

    const container = z.object(shape).partial();
    const expectsTenant =
      pathTemplate.includes(":tenantId") ||
      (!!routeSchema.params &&
        ((typeof routeSchema.params.shape === "function"
          ? routeSchema.params.shape()
          : routeSchema.params.shape
        )?.tenantId !== undefined));
    if (expectsTenant) {
      normalized.params = normalized.params || {};
      if (!normalized.params.tenantId)
        normalized.params.tenantId = DEFAULT_TENANT_ID;
    }

    const parsed = container.parse(normalized);

    return {
      params: parsed.params || {},
      query: parsed.query || {},
      body: parsed.body || {},
    };
  };

  const resolveTenantId = (paramsTenantId, authTenantId) => {
    const chosen = paramsTenantId || authTenantId || DEFAULT_TENANT_ID;
    if (paramsTenantId && authTenantId && paramsTenantId !== authTenantId) {
      throw new Error(
        "tenantId mismatch between request params and auth token",
      );
    }
    return chosen;
  };

  const fillPath = (pathTemplate, params = {}) =>
    pathTemplate.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
      if (params[key] === undefined) {
        throw new Error(`Missing path parameter: ${key}`);
      }
      return encodeURIComponent(params[key]);
    });

  const callApi = async (definition, args, extra) => {
    const { method, path } = definition;
    const { params = {}, query = {}, body = {} } = args;

    const tenantFromAuth = extra?.authInfo?.extra?.tenantId;
    const needsTenant = path.includes(":tenantId");
    if (needsTenant) {
      const resolved = resolveTenantId(params.tenantId, tenantFromAuth);
      if (!resolved) throw new Error("tenantId is required for this endpoint");
      params.tenantId = resolved;
    }

    const url = fillPath(path, params);
    const headers = {};
    const bearer = extra?.authInfo?.token;
    if (bearer) headers.Authorization = `Bearer ${bearer}`;

    const requestConfig = {
      method,
      url,
      headers,
      params: query,
    };

    if (method.toLowerCase() !== "get" && method.toLowerCase() !== "delete") {
      requestConfig.data = body;
    } else if (
      method.toLowerCase() === "delete" &&
      Object.keys(body || {}).length
    ) {
      requestConfig.data = body;
    }

    const response = await axiosClient.request(requestConfig);
    return response;
  };

  const registerRouteTools = () => {
    Object.entries(ROUTES).forEach(([group, routes]) => {
      Object.entries(routes).forEach(([name, definition]) => {
        const toolName = `${group}.${name}`;
        const description =
          definition.description ||
          `${definition.method.toUpperCase()} ${definition.path}`;

        server.registerTool(
          toolName,
          { description },
          async (rawArgs, extra) => {
            const parsedArgs = validateArgs(
              definition.schema,
              rawArgs,
              definition.path,
            );
            try {
              const apiResponse = await callApi(definition, parsedArgs, extra);
              const payload = redactForLLM(apiResponse.data);
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(payload, null, 2),
                  },
                ],
              };
            } catch (err) {
              if (err.response) {
                const redactedError = redactForLLM(err.response.data);
                throw new Error(
                  `[${err.response.status}] ${definition.method.toUpperCase()} ${definition.path}: ${JSON.stringify(
                    redactedError,
                  )}`,
                );
              }
              throw err;
            }
          },
        );
      });
    });
  };

  // ----------------------------- SSE wiring --------------------------------
  app.get("/mcp", async (req, res) => {
    try {
      const transport = new SSEServerTransport("/messages", res);
      transports.set(transport.sessionId, transport);

      transport.onclose = () => transports.delete(transport.sessionId);
      await server.connect(transport);
    } catch (err) {
      console.error("Failed to establish SSE connection", err);
      // Avoid hanging the EventSource; surface a 500
      if (!res.headersSent) {
        res.status(500).json({ error: "failed to start SSE session" });
      } else {
        res.end();
      }
    }
  });

  app.get("/health", (_req, res) =>
    res.json({ ok: true, upstream: API_BASE_URL, tenant: DEFAULT_TENANT_ID }),
  );

  app.post("/messages", attachTenantFromJwt, async (req, res) => {
    const sessionId = req.query.sessionId;
    if (!sessionId) return res.status(400).json({ error: "missing sessionId" });

    const transport = transports.get(sessionId);
    if (!transport) return res.status(404).json({ error: "session not found" });

    await transport.handlePostMessage(req, res, req.body);
  });

  // ------------------------------- Boot ------------------------------------
  registerRouteTools();

  app.listen(PORT, () => {
    console.log(
      `TaskAlloc8or MCP SSE server listening on :${PORT} (proxying ${API_BASE_URL})`,
    );
  });
})().catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
