require("dotenv").config();
require("./config/db"); // hvis du har en separat db connection
const startCrons = require("./cron");

startCrons();