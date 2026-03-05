# Zod Schemas for API Inputs

```ts
import { z } from "zod"

// --- Reusable primitives ----------------------------------------------------
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "Expected MongoDB ObjectId string")
const looseId = z.string().min(1, "ID is required")
const tenantParam = z.object({ tenantId: objectId })
const idOrZero = z.union([objectId, z.literal("0")])
const boolish = z.union([z.boolean(), z.enum(["true", "false"])])
const percentageMap = z.record(looseId, z.coerce.number().finite())
const fileUpload = z.any() // Multer file placeholder
const dateString = z.string().min(1)

type RouteShape = {
  params?: z.ZodTypeAny
  query?: z.ZodTypeAny
  body?: z.ZodTypeAny
}

// --- /:tenantId/users -------------------------------------------------------
export const usersSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /api/account -----------------------------------------------------------
export const accountSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/comments ----------------------------------------------------
export const commentSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/customer-notes ---------------------------------------------
export const customerNoteSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/customer-targets -------------------------------------------
export const customerTargetSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/customers ---------------------------------------------------
export const customerSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/holidays ----------------------------------------------------
export const holidaySchemas = {
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/labels ------------------------------------------------------
export const labelSchemas = {
  create: {
    params: tenantParam,
    body: z.object({
      labelName: z.string().min(1),
      labelColor: z.string().optional(),
    }),
  },
  fetch: { params: tenantParam },
} satisfies Record<string, RouteShape>

// --- /:tenantId/notifications ----------------------------------------------
const mentionUser = z.object({ id: objectId })
const notificationTaskInput = z.object({
  _id: objectId,
  taskType: z.string().min(1),
  taskPersons: z.array(z.object({ user: objectId })),
  taskCustomer: objectId,
  createdBy: objectId,
  taskName: z.string().min(1),
  taskDeadline: z.string().optional(),
  tenantId: objectId,
})

export const notificationSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /sprints (no tenant param) --------------------------------------------
export const sprintSchemas = {
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/tasks -------------------------------------------------------
const taskPersonInput = z.object({
  user: objectId,
  percentage: z.coerce.number().optional(),
})

export const taskSchemas = {
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
    params: tenantParam.merge(z.object({ taskId: objectId, taskPersonId: objectId })),
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
} satisfies Record<string, RouteShape>

// --- /:tenantId/time-registrations -----------------------------------------
export const timeRegistrationSchemas = {
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
    params: tenantParam.merge(z.object({ date: dateString, userId: objectId })),
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
    // route path includes an extra tenantId segment; passthrough keeps it flexible
    params: tenantParam
      .merge(z.object({ sprintId: objectId, userId: objectId }))
      .passthrough(),
  },
} satisfies Record<string, RouteShape>

// --- /:tenantId/updates -----------------------------------------------------
export const updateSchemas = {
  updateCustomerSchema: {
    params: tenantParam,
  },
} satisfies Record<string, RouteShape>

// --- /:tenantId/verticals ---------------------------------------------------
export const verticalSchemas = {
  create: {
    params: tenantParam,
    body: z.object({ verticalName: z.string().min(1) }),
  },
  fetch: { params: tenantParam },
} satisfies Record<string, RouteShape>
```
