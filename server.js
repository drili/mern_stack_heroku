const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const startCrons = require("./cron");

startCrons(); 

require('dotenv').config()

// *** Routes
const userRouter = require("./routes/users")
const customerRouter = require("./routes/customers")
const customerTargetsRouter = require("./routes/customer-targets")
const customerNotesRouter = require("./routes/customer-notes")
const updateRouter = require("./routes/updates")
const taskRouter = require("./routes/tasks")
const sprintRouter = require("./routes/sprints")
const TimeRegistrationRouter = require("./routes/time-registrations")
const labelRouter = require("./routes/labels")
const verticalRouter = require("./routes/verticals")
const commentsRouter = require("./routes/comments")
const notificationsRouter = require("./routes/notifications")
const holidaysRouter = require("./routes/holidays")

const accountRouter = require("./routes/account")

const app = express()

const http = require("http")
const socketIo = require("socket.io")
const server = http.createServer(app)
const io = socketIo(server, {
    cors: {
        origin: process.env.SOCKET_IO_BASE_URL,
        methods: ["GET", "POST"]
    }
});

app.set("io", io)

const corsOptions = {
    origin: process.env.SOCKET_IO_BASE_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.set('io', io);

// TODO: Update routes to use tenantId
app.use('/uploads', express.static('uploads'));
app.use(express.json())
app.use("/:tenantId/users", userRouter)
app.use("/:tenantId/customers", customerRouter)
app.use("/:tenantId/updates", updateRouter)
app.use("/:tenantId/tasks", taskRouter)
app.use("/:tenantId/time-registrations", TimeRegistrationRouter)
app.use("/:tenantId/labels", labelRouter)
app.use("/:tenantId/verticals", verticalRouter)
app.use("/:tenantId/comments", commentsRouter)
app.use("/:tenantId/notifications", notificationsRouter)
app.use("/:tenantId/holidays", holidaysRouter)
app.use("/:tenantId/customer-targets", customerTargetsRouter)
app.use("/:tenantId/customer-notes", customerNotesRouter)

app.use("/sprints", sprintRouter)
app.use("/api/account", accountRouter)

io.on("connection", (socket) => {
    // console.log("A user connected");
    socket.on("register", userId => {
        socket.join(userId);
    });

});

const staticDbUrl = process.env.MONGO_DB_URI
mongoose.connect(staticDbUrl, {}).then(() => {
    console.log("::: Connected to static MongoDB for accounts successfully");
}).catch((err) => {
    console.error('::: Failed to connect to static MongoDB', err);
});

// mongoose.connect(uri, { 
//     useNewUrlParser: true,
//     useUnifiedTopology: true 
// })

// const connection = mongoose.connection
// connection.once('open', () => {
//     console.log("::: MongoDB database connection established successfully")
// })

/* This is for testing cron jobs on server start
const checkUpcomingDeadlines = require("./cron/checkUpcomingDeadlines");
const checkMissedDeadlines = require("./cron/checkMissedDeadlines");

// 🔁 RUN THESE ON SERVER START FOR TESTING
checkUpcomingDeadlines(app);
checkMissedDeadlines(app); */

server.listen(process.env.PORT, () => {
    console.log("::: Server is running on port 5000");
});
