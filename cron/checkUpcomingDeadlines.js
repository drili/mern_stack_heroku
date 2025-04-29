const cron = require("node-cron");
const { Task } = require("../models/Task");
const { User } = require("../models/User");
const { NotificationChatTask } = require("../models/NotificationChatTask");
const sendSlackMessage = require("../functions/slackMessageUser");

const checkUpcomingDeadlines = () => {
  cron.schedule("0 7 * * *", async () => {
    console.log("🕖 Running cron: checkUpcomingDeadlines");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isoDate = tomorrow.toISOString().split("T")[0];

    try {
      const tasks = await Task.find({
        taskType: "quickTask",
        isArchived: false,
        taskDeadline: isoDate,
        workflowStatus: { $ne: 3 },
        upcomingDeadlineNotificationSent: { $ne: true },
      });

      let reminded = 0;

      for (const task of tasks) {
        for (const person of task.taskPersons) {
          const user = await User.findById(person.user);
          if (!user) continue;

          const newNotification = new NotificationChatTask({
            userId: user._id,
            notificationType: "deadline_upcoming",
            notificationLink: `/task?taskId=${task._id}`,
            notificationMessage: `📆 Reminder: The deadline for task "${task.taskName}" is tomorrow.`,
            taskId: task._id,
            taskCustomer: task.taskCustomer,
            mentionedBy: task.createdBy,
            tenantId: task.tenantId,
          });

          await newNotification.save();
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

      console.log(`✅ [UpcomingDeadline] ${reminded} users reminded about ${tasks.length} tasks`);
    } catch (err) {
      console.error("❌ Cron error in checkUpcomingDeadlines:", err);
    }
  });
};

module.exports = checkUpcomingDeadlines;
