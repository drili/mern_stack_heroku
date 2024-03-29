const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

require('dotenv').config()

// Routes
const userRouter = require("./routes/users")
const customerRouter = require("./routes/customers")
const updateRouter = require("./routes/updates")
const taskRouter = require("./routes/tasks")
const sprintRouter = require("./routes/sprints")
const TimeRegistrationRouter = require("./routes/time-registrations")
const labelRouter = require("./routes/labels")
const verticalRouter = require("./routes/verticals")
const commentsRouter = require("./routes/comments")
const notificationsRouter = require("./routes/notifications")

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

const corsOptions = {
    origin: process.env.SOCKET_IO_BASE_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.set('io', io);

app.use('/uploads', express.static('uploads'));
app.use(express.json())
app.use("/users", userRouter)
app.use("/customers", customerRouter)
app.use("/updates", updateRouter)
app.use("/tasks", taskRouter)
app.use("/sprints", sprintRouter)
app.use("/time-registrations", TimeRegistrationRouter)
app.use("/labels", labelRouter)
app.use("/verticals", verticalRouter)
app.use("/comments", commentsRouter)
app.use("/notifications", notificationsRouter)

io.on("connection", (socket) => {
    // console.log("A user connected");
    socket.on("register", userId => {
        socket.join(userId);
    });

});

const uri = process.env.MONGO_DB_URI
mongoose.connect(uri, { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
})

const connection = mongoose.connection
connection.once('open', () => {
    console.log("::: MongoDB database connection established successfully")
})

server.listen(process.env.PORT, () => {
    console.log("::: Server is running on port 5000");
});