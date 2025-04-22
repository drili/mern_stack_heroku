const express = require("express")
const router = express.Router()

const { NotificationChatTask, NotificationChatTaskSchema } = require("../models/NotificationChatTask")
const { User } = require("../models/User")
const { Customer } = require("../models/Customer")
const { Task } = require("../models/Task")

const notificationType = "user_tagging_task"
const sendSlackMessage = require("../functions/slackMessageUser")

router.route("/fetch-unread-notifications").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId } = req.body

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    try {
        const notifications = await NotificationChatTask.find({ userId: userId, notificationIsRead: false, tenantId: tenantId })
            .populate({
                path: "mentionedBy",
                model: User,
                select: "username email profileImage",
            })
            .populate({
                path: "taskCustomer",
                model: Customer,
                select: "customerName customerColor"
            })
            .populate({
                path: "taskId",
                model: Task,
                select: "taskName",
            })
            .sort({ _id: -1 })

        res.status(200).json(notifications)
    } catch (error) {
        console.error("Error fetching user notifications", error);
        res.status(500).send("Error fetching notifications")
    }
})

router.route("/update-user-notification-read").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { notificationId } = req.body

    if (!tenantId || !notificationId) {
        return res.status(400).json({ error: "tenantId & notificationId is required" })
    }
    
    try {
        const notification = await NotificationChatTask.findOneAndUpdate(
            { _id: notificationId, tenantId: tenantId }, 
            { $set: { notificationIsRead: true } }
        )
        
        res.json({ message: "Customer archived & updated successfully" })
    } catch (error) {
        console.error("There was an error updating notifcation", error)
        res.status(500).send("There was an error updating notifcation")
    }
})

router.route("/fetch-user-notifications").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId } = req.body

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    try {
        const notifications = await NotificationChatTask.find({ userId: userId, tenantId: tenantId })
            .populate({
                path: "mentionedBy",
                model: User,
                select: "username email profileImage",
            })
            .populate({
                path: "taskCustomer",
                model: Customer,
                select: "customerName customerColor"
            })
            .populate({
                path: "taskId",
                model: Task,
                select: "taskName",
            })
            .sort({ _id: -1 })

        res.status(200).json(notifications)
    } catch (error) {
        console.error("Error fetching user notifications", error);
        res.status(500).send("Error fetching notifications")
    }
})

router.route("/create-notification-task").post(async (req, res) => {
    const { data } = req.body

    try {
        data.forEach(async (task) => {
            if (task.taskType == "quickTask") {
                const taskPersons = task.taskPersons
                taskPersons.forEach(async (taskPerson) => {
                    const userId = taskPerson.user
                    const notificationType = "task_create_tagging"
                    const notificationLink = `/task?taskId=${task._id}`
                    const notificationMessage = "You have been added to a new task."
                    const taskId = task._id
                    const customerId = task.taskCustomer
                    const mentionedBy = task.createdBy
                    const taskName = task.taskName
                    const taskDeadline = task.taskDeadline
                    const tenantId = task.tenantId

                    const newNotification = new NotificationChatTask({
                        userId: userId,
                        notificationType: notificationType,
                        notificationLink: notificationLink,
                        notificationMessage: notificationMessage,
                        taskId: taskId,
                        taskCustomer: customerId,
                        mentionedBy: mentionedBy,
                        tenantId: tenantId,
                    })

                    await newNotification.save()

                    // *** Emit a WebSocket event to the user
                    req.app.get("io").to(userId).emit("new-notification", {
                        message: "You have a new notification"
                    })

                    const notifiedUser = await User.findById(userId)
                    const notifiedBy = await User.findById(mentionedBy)
                    if (notifiedUser.slackId) {
                        sendSlackMessage(`${notifiedBy.username} added you to a new quick task: <https://taskalloc8or-heroku-frontend.vercel.app/${tenantId}/task-view?taskID=${taskId}|${taskName}> \nDeadline: ${taskDeadline}`, notifiedUser.slackId)
                    }
                })
            }
        })
    } catch (error) {
        console.error(error)
    }
})

router.route("/create-notification").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const {
        mentionedUsers,
        taskId,
        taskCustomer,
        mentionedBy,
        htmlContent } = req.body

    const notificationLinkModified = `${tentantId}/task?taskId=${taskId}`

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        for (const user of mentionedUsers) {
            const newNotification = new NotificationChatTask({
                userId: user.id,
                notificationType: notificationType,
                notificationLink: notificationLinkModified,
                notificationMessage: htmlContent,
                taskId: taskId,
                taskCustomer: taskCustomer,
                mentionedBy: mentionedBy,
                tenantId: tenantId,
            });

            await newNotification.save();

            req.app.get("io").to(user.id).emit("new-notification", {
                message: "You have a new notification"
            });

            const notifiedUser = await User.findOne({ _id: user.id, tenantId: tenantId });
            const notifiedBy = await User.findOne({ _id: mentionedBy, tenantId: tenantId });

            if (notifiedUser && notifiedUser.slackId) {
                sendSlackMessage(
                    `${notifiedBy.username} mentioned you in task: https://taskalloc8or-heroku-frontend.vercel.app/${tenantId}/task-view?taskID=${taskId}`,
                    notifiedUser.slackId
                );

            }
        }

        res.status(200).send("Notifications created successfully")
    } catch (error) {
        console.error("Error creating notifications", error)
        res.status(500).send("Error creating notifcations")
    }
})

module.exports = router