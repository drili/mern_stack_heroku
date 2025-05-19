const cron = require("node-cron");
const checkUpcomingDeadlines = require("./checkUpcomingDeadlines");
const checkMissedDeadlines = require("./checkMissedDeadlines");

const startCrons = (app) => {
    cron.schedule("0 0 * * *", () => {
      console.log("🔔 Running upcoming deadline check");
      checkUpcomingDeadlines(app);
    });
  
    cron.schedule("1 0 * * *", () => {
      console.log("⚠️ Running missed deadline check");
      checkMissedDeadlines(app);
    });
  };

module.exports = startCrons;