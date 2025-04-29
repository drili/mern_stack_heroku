const express = require("express")
const router = express.Router()
const {Task} = require("../models/Task")
const {Sprints} = require("../models/Sprints")
const {TimeRegistration} = require("../models/TimeRegistration")
const mongoose = require("mongoose")
const { User } = require("../models/User");
const { NotificationChatTask } = require("../models/NotificationChatTask");
const sendSlackMessage = require("../functions/slackMessageUser");

router.route("/recent-tasks/:userId").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId } = req.params
    
    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    try {
        const objectIdUserId = new mongoose.Types.ObjectId(userId)
        const fetchedTasksByUser = await Task.find(
            {
                'taskPersons.user': objectIdUserId,
                tenantId: tenantId,
            }
        )
        .sort({ createdAt: -1 })
        .limit(10)

        res.json(fetchedTasksByUser)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.route("/fetch-deadlines").get(async (req, res) => {
    console.log("🔵 Route /fetch-deadlines rammes");
    
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId } = req.query

    console.log("tenantId:", tenantId)
    console.log("userId:", userId)

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    // const objectIdSprintId = new mongoose.Types.ObjectId(sprintId)
    const objectIdUserId = new mongoose.Types.ObjectId(userId)

    const todayDate = new Date();
    const sevenDaysFromNow = new Date();

    todayDate.setHours(0, 0, 0, 0);
    sevenDaysFromNow.setDate(todayDate.getDate() + 7);

    try {
        const deadlineTasks = await Task.find({
            // taskSprints: objectIdSprintId,
            'taskPersons.user': objectIdUserId,
            isArchived: false,
            tenantId: tenantId,
        })

        const overdueTasks = []
        const upcomingTasks = []

        for (const task of deadlineTasks) {
            try {
                if (task.taskType === "quickTask" && task.workflowStatus !== 3 && task.taskDeadline) {
                    const taskDeadline = new Date(task.taskDeadline)
    
                    taskDeadline.setHours(0, 0, 0, 0)
    
                    if (taskDeadline < todayDate) {
                        overdueTasks.push(task)
                        
                    } else if (taskDeadline >= todayDate && taskDeadline <= sevenDaysFromNow) {
                        upcomingTasks.push(task)
                    }
                }
            } catch (innerErr) {
                console.error("Fejl i deadline-parsing:", task._id, innerErr)
            }
        }

        res.json({ overdueTasks, upcomingTasks })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.route("/update-percentage").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId, percentageValues } = req.body

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const task = await Task.findOne({ _id: taskId, tenantId: tenantId })

        if (!task) {
            return res.status(404).json({ error: "Task not found" })
        }

        task.taskPersons.forEach((person, index) => {
            const userId = person.user._id.toString();

            if (percentageValues[userId]) {
                person.percentage = parseInt(percentageValues[userId], 10);
            }
        })

        await task.save()
        return res.status(200).json({ message: 'Task percentage updated successfully' });
    } catch (error) {
        console.error('Error updating task percentage:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.route("/create").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    const {
        taskName,
        taskTimeLow,
        taskTimeHigh,
        taskDescription,
        taskCustomer,
        taskLabel,
        taskVertical,
        taskPersons,
        taskSprints,
        createdBy,
        taskDeadline,
        estimatedTime,
        taskType,
    } = req.body

    if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" })
    }

    try {
        const tasksSaved = await Promise.all(
            taskSprints.map(async (sprintId) => {
                const task = new Task({
                    taskName,
                taskTimeLow,
                taskTimeHigh,
                taskDescription,
                taskCustomer,
                taskLabel,
                taskVertical,
                taskPersons,
                taskSprints: [sprintId],
                createdBy,
                taskDeadline,
                estimatedTime,
                taskType,
                tenantId,
                })

                return await task.save()
            })
        )

        res.json(tasksSaved);
    } catch (error) {
        console.error("Failed to create tasks", error);
        res.status(500).json({ error: "Failed to create tasks" });
    }
})

router.route("/fetch-by-user/:userId").get(async (req, res) => {
    const { userId } = req.params
    // const tenantId = req.query.tenantId
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId and userId is required" })
    }

    try {
        const tasks = await Task.find({
            createdBy: userId,
            isArchived: { $ne: true },
            tenantId,
        })
            .populate("createdBy", ["username", "email", "profileImage", "userRole", "userTitle"])
            // .populate("taskPersons", ["username", "email", "profileImage", "userRole", "userTitle"])
            .populate({
                path: 'taskPersons.user',
                select: ['_id', 'username', 'email', 'profileImage', 'userRole', 'userTitle']
            })
            .populate("taskCustomer", ["customerName", "customerColor"])
            .populate("taskSprints", ["_id", "sprintName", "sprintMonth", "sprintYear"])
            .sort({ _id: -1 })

        res.json(tasks)
    } catch (error) {
        console.error("Failed to fetch tasks by user", error)
        res.status(500).json({ error: "Failed to fetch tasks by user" })
    }
})

router.route("/fetch-by-customer-sprint/:customerId").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerId } = req.params
    const { month, year, time_reg } = req.query

    if (!tenantId || !customerId || !month || !year) {
        return res.status(400).json({ error: "tenantId, month, year & customerId is required" })
    }

    try {
        const targetTaskSprint = await Sprints.findOne({
            sprintMonth: month,
            sprintYear: year
        })

        const tasks = await Task.find({
            taskCustomer: customerId,
            isArchived: { $ne: true },
            taskSprints: targetTaskSprint._id,
            tenantId: tenantId,
        })
            .populate("createdBy", ["username", "email", "profileImage", "userRole", "userTitle"])
            .populate({
                path: "taskPersons.user",
                select: ["_id", "username", "email", "profileImage", "userRole", "userTitle"]
            })
            .populate("taskCustomer", ["customerName", "customerColor"])
            .populate("taskSprints", ["_id", "sprintName", "sprintMonth", "sprintYear"])
            .sort({ _id: -1 })

        if (time_reg) {
            const timeRegistrations = await TimeRegistration.find({
                taskId: { $in: tasks.map(task => task._id) }
            })
                .select("_id userId taskId timeRegistered description createdAt updatedAt")

            const tasksWithTimeRegistrations = tasks.map(task => {
                const taskTimeRegistrations = timeRegistrations.filter(reg => reg.taskId.equals(task._id));
                return {
                    ...task.toObject(),  // *** Convert the Mongoose document to a plain object
                    timeRegistrations: taskTimeRegistrations,
                }
            })

            res.json(tasksWithTimeRegistrations)
        } else {
            res.json(tasks)
        }
    } catch (error) {
        console.error("Failed to fetch tasks by user & sprint", error)
        res.status(500).json({ error: "Failed to fetch tasks by user & sprint" })
    }
})

router.route("/fetch-by-user-sprint/:userId").get(async (req, res) => {
    const { userId } = req.params
    const { month, year, time_reg } = req.query
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    if (!month || !year || !tenantId) {
        return res.status(400).json({ error: "Month, year and tenantId are required." });
    }

    try {

        const targetTaskSprint = await Sprints.findOne({
            sprintMonth: month,
            sprintYear: year
        })

        const tasks = await Task.find({
            "taskPersons.user": userId,
            isArchived: { $ne: true },
            taskSprints: targetTaskSprint._id,
            tenantId
        })
            .populate("createdBy", ["username", "email", "profileImage", "userRole", "userTitle"])
            .populate({
                path: "taskPersons.user",
                select: ["_id", "username", "email", "profileImage", "userRole", "userTitle"]
            })
            .populate("taskCustomer", ["customerName", "customerColor"])
            .populate("taskSprints", ["_id", "sprintName", "sprintMonth", "sprintYear"])
            .sort({ _id: -1 })

        if (time_reg) {
            const timeRegistrations = await TimeRegistration.find({
                taskId: { $in: tasks.map(task => task._id) }
            })
                .select("_id userId taskId timeRegistered description createdAt updatedAt")

            const tasksWithTimeRegistrations = tasks.map(task => {
                const taskTimeRegistrations = timeRegistrations.filter(reg => reg.taskId.equals(task._id));
                return {
                    ...task.toObject(),  // *** Convert the Mongoose document to a plain object
                    timeRegistrations: taskTimeRegistrations,
                }
            })

            res.json(tasksWithTimeRegistrations)
        } else {
            res.json(tasks)
        }
    } catch (error) {
        console.error("Failed to fetch tasks by user & sprint", error)
        res.status(500).json({ error: "Failed to fetch tasks by user & sprint" })
    }
})

router.route("/fetch-by-id/:taskId").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const task = await Task.find({ _id: taskId, tenantId: tenantId })
            // .populate("taskPersons", ["_id", "username", "email", "profileImage", "userRole", "userTitle"])
            .populate({
                path: 'taskPersons.user',
                select: ['_id', 'username', 'email', 'profileImage', 'userRole', 'userTitle']
            })
            .populate("taskSprints", ["_id", "sprintName", "sprintMonth", "sprintYear"])
            .populate("taskCustomer", ["_id", "customerName", "customerColor"])
            .populate("createdBy", ['_id', 'username', 'email', 'profileImage', 'userRole', 'userTitle'])

        res.json(task)
    } catch (error) {
        console.error("Failed to fetch task by id", error)
        res.status(500).json({ error: "Failed to fetch task by id" })
    }
})

router.route("/update/:taskId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params
    const { taskName, taskTimeLow, taskTimeHigh, taskDescription, taskDeadline, estimatedTime } = req.body;

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, tenantId: tenantId },
            {
                taskName,
                taskTimeLow,
                taskTimeHigh,
                taskDescription,
                taskDeadline,
                estimatedTime,
            },
            { new: true }
        )

        res.json(updatedTask)
    } catch (error) {
        console.error("Failed to update task", error);
        res.status(500).json({ error: "Failed to update task" });
    }
})

router.route("/update-vertical/:taskId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params
    const { taskVertical } = req.body

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, tenantId: tenantId },
            { taskVertical: taskVertical },
            { new: true }
        )
        
        res.json(updatedTask)
    } catch (error) {
        console.error("Failed to update task customer", error);
        res.status(500).json({ error: "Failed to update task vertical" });
    }
})

router.route("/update-customers/:taskId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params
    const { customerId } = req.body

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, tenantId: tenantId },
            { taskCustomer: customerId },
            { new: true }
        )
        
        res.json(updatedTask)
    } catch (error) {
        console.error("Failed to update task customer", error);
        res.status(500).json({ error: "Failed to update task customer" });
    }
})

router.route("/update-sprint/:taskId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params
    const { taskSprintId } = req.body

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, tenantId: tenantId },
            { taskSprints: taskSprintId },
            { new: true }
        )

        res.json(updatedTask)
    } catch (error) {
        console.error("Failed to update task sprint", error);
        res.status(500).json({ error: "Failed to update task sprint" });
    }
})

router.route("/assign-user/:taskId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params
    const { assignedUserId } = req.body

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const task = await Task.findOne({ _id: taskId, tenantId: tenantId })

        if (!task) {
            return res.status(404).json({ error: 'Task not found' })
        }

        const numbersOfUsers = task.taskPersons.length + 1

        const newTaskPerson = {
            user: assignedUserId,
            percentage: 100 / numbersOfUsers
        }

        task.taskPersons.forEach((person) => {
            person.percentage = 100 / numbersOfUsers;
        })

        task.taskPersons.push(newTaskPerson)
        const updatedTask = await task.save()

        res.json(updatedTask)
    } catch (error) {
        console.error('Failed to assign user to task', error);
        res.status(500).json({ error: 'Failed to assign user to task' })
    }
})

router.route("/remove-user/:taskId/:taskPersonId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId, taskPersonId } = req.params

    if (!tenantId || !taskId || !taskPersonId) {
        return res.status(400).json({ error: "tenantId, taskPersonId & taskId is required" })
    }

    try {
        const task = await Task.findOne({ _id: taskId, tenantId: tenantId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const numberOfUsers = task.taskPersons.length - 1
        task.taskPersons = task.taskPersons.filter(person => person.user !== taskPersonId)
        task.taskPersons.forEach(person => {
            person.percentage = 100 / numberOfUsers;
        })

        const savedTask = await task.save();

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                $pull: {
                    taskPersons: {
                        user: taskPersonId,
                    }
                }
            },
            { new: true }
        )

        res.json(updatedTask)
    } catch (error) {
        console.error("Failed to remove user from task", error)
        res.status(500).json({ error: "Failed to remove user from task" })
    }
})

router.route("/archive-task/:taskId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const task = await Task.findOneAndUpdate(
            { _id: taskId, tenantId: tenantId }, 
            { isArchived: true },
            { new: true }
        )

        res.json(task)
    } catch (error) {
        console.error("Failed to archive task", error);
        res.status(500).json({ error: "Failed to archive task" });
    }
})

router.route("/update-taskworkflow/:taskId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.params
    const { workflowStatus } = req.body

    if (!tenantId || !taskId) {
        return res.status(400).json({ error: "tenantId & taskId is required" })
    }

    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, tenantId: tenantId },
            { workflowStatus: workflowStatus },
            { new: true }
        )

        res.json(updatedTask)
    } catch (error) {
        console.error("Failed to update task workflowStatus", error)
        res.status(500).json({ error: "Failed to updated task workflowStatus" })
    }
})

router.route("/check-upcoming-deadlines").get(async (req, res) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    try {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1); // tomorrow
        targetDate.setHours(0, 0, 0, 0);
        const isoString = targetDate.toISOString().split("T")[0]; // e.g., "2025-04-30"

        const tasks = await Task.find({
            taskType: "quickTask",
            isArchived: false,
            taskDeadline: isoString,
            workflowStatus: { $ne: 3 },
            upcomingDeadlineNotificationSent: { $ne: true },
        });

        let reminded = 0;

        for (const task of tasks) {
            for (const taskPerson of task.taskPersons) {
                const userId = taskPerson.user;
                const user = await User.findById(userId);
                if (!user) continue;

                // Save internal reminder
                const newNotification = new NotificationChatTask({
                    userId: userId,
                    notificationType: "deadline_upcoming",
                    notificationLink: `/task?taskId=${task._id}`,
                    notificationMessage: `📆 Reminder: The deadline for task "${task.taskName}" is tomorrow.`,
                    taskId: task._id,
                    taskCustomer: task.taskCustomer,
                    mentionedBy: task.createdBy,
                    tenantId: task.tenantId,
                });

                await newNotification.save();

                req.app.get("io")?.to(userId.toString()).emit("new-notification", {
                    message: "You have a new reminder",
                });

                if (user.slackId) {
                    await sendSlackMessage(
                        `🗓️ Reminder: The deadline for *${task.taskName}* is tomorrow. Check it here: <https://taskalloc8or-heroku-frontend.vercel.app/${task.tenantId}/task-view?taskID=${task._id}|Open Task>`,
                        user.slackId
                    );
                }

                reminded++;
            }

            task.upcomingDeadlineNotificationSent = true;
            await task.save();
        }

        res.status(200).json({ message: `Checked ${tasks.length} tasks. Reminders sent to ${reminded} users.` });
    } catch (error) {
        console.error("Error while checking upcoming deadlines", error);
        res.status(500).json({ error: "Error while checking upcoming deadlines" });
    }
});

router.route("/check-missed-deadlines").get(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const tasks = await Task.find({
            taskType: "quickTask",
            isArchived: false,
            taskDeadline: { $lt: today },
            workflowStatus: { $ne: 3 },
            deadlineNotificationSent: { $ne: true },
        });

        let notified = 0;

        for (const task of tasks) {
            for (const taskPerson of task.taskPersons) {
                const userId = taskPerson.user;
                const user = await User.findById(userId);
                if (!user) continue;

                // Save internal notification
                const newNotification = new NotificationChatTask({
                    userId: userId,
                    notificationType: "deadline_missed",
                    notificationLink: `/task?taskId=${task._id}`,
                    notificationMessage: `⚠️ The deadline for task "${task.taskName}" has been missed.`,
                    taskId: task._id,
                    taskCustomer: task.taskCustomer,
                    mentionedBy: task.createdBy,
                    tenantId: task.tenantId,
                });

                await newNotification.save();

                // WebSocket event
                req.app.get("io")?.to(userId.toString()).emit("new-notification", {
                    message: "You have a new notification",
                });

                // Slack message
                if (user.slackId) {
                    await sendSlackMessage(
                        `⚠️ You missed the deadline for *${task.taskName}*. Check it here: <https://taskalloc8or-heroku-frontend.vercel.app/${task.tenantId}/task-view?taskID=${task._id}|Open Task>`,
                        user.slackId
                    );
                }

                notified++;
            }

            task.deadlineNotificationSent = true;
            await task.save();
        }

        res.status(200).json({ message: `Checked ${tasks.length} tasks. Notifications sent to ${notified} users.` });
    } catch (error) {
        console.error("Error while checking missed deadlines", error);
        res.status(500).json({ error: "Error while checking missed deadlines" });
    }
});

module.exports = router