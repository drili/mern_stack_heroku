const { Task } = require("../models/Task");
const { User } = require("../models/User");
const { NotificationChatTask } = require("../models/NotificationChatTask");
const sendSlackMessage = require("../functions/slackMessageUser");

module.exports = async function checkUpcomingDeadlines(app) {
  const io = app.get("io");

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 1);
  targetDate.setHours(0, 0, 0, 0);
  const isoString = targetDate.toISOString().split("T")[0];

  try {
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

        io?.to(userId.toString()).emit("new-notification", {
          message: "You have a new reminder",
        });

        if (user.slackId) {
          await sendSlackMessage(
            `📆 Reminder: The deadline for *${task.taskName}* is tomorrow. Check it here: <https://taskalloc8or-heroku-frontend.vercel.app/${task.tenantId}/task-view?taskID=${task._id}|Open Task>`,
            user.slackId
          );
        }

        reminded++;
      }

      task.upcomingDeadlineNotificationSent = true;
      await task.save();
    }

    console.log(
      `✅ Upcoming check done: ${tasks.length} tasks checked, ${reminded} reminders sent.`
    );
  } catch (err) {
    console.error("Error in upcoming deadline check", err);
  }
};
