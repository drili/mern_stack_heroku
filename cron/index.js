const checkUpcomingDeadlines = require("./checkUpcomingDeadlines");
const checkMissedDeadlines = require("./checkMissedDeadlines");

const startCrons = () => {
  checkUpcomingDeadlines();
  checkMissedDeadlines();
};

module.exports = startCrons;