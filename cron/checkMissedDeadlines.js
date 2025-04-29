const { Task } = require("../models/Task");
const { User } = require("../models/User");
const { NotificationChatTask } = require("../models/NotificationChatTask");
const sendSlackMessage = require("../functions/slackMessageUser");

module.exports = async function checkMissedDeadlines(app) {
  const io = app.get("io");

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
      for (const person of task.taskPersons) {
        const user = await User.findById(person.user);
        if (!user) continue;

        const newNotification = new NotificationChatTask({
          userId: user._id,
          notificationType: "deadline_missed",
          notificationLink: `/task?taskId=${task._id}`,
          notificationMessage: `⚠️ The deadline for task "${task.taskName}" has been missed.`,
          taskId: task._id,
          taskCustomer: task.taskCustomer,
          mentionedBy: task.createdBy,
          tenantId: task.tenantId,
        });

        await newNotification.save();

        io?.to(user._id.toString()).emit("new-notification", {
          message: "You have a new notification",
        });

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

    console.log(
      `✅ [MissedDeadline] ${notified} users notified about ${tasks.length} tasks`
    );
  } catch (err) {
    console.error("❌ Cron error in checkMissedDeadlines:", err);
  }
};
