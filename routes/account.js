// routes/account.js

const express = require("express");
const mongoose = require("mongoose");

const Account = require("../models/Account");
const { UserSchema } = require("../models/User");
const { CommentSchema } = require("../models/Comments");
const { CustomerSchema } = require("../models/Customer");
const { GroupsSchema } = require("../models/Groups");
const { LabelSchema } = require("../models/Label");
const { NotificationChatTaskSchema } = require("../models/NotificationChatTask");
const { SprintsSchema } = require("../models/Sprints");
const { SprintYearSchema } = require("../models/SprintYear");
const { TaskSchema } = require("../models/Task");
const { TimeRegistrationSchema } = require("../models/TimeRegistration");
const { VerticalSchema } = require("../models/Vertical");

const router = express.Router();

router.post("/verify-account", async (req, res) => {
    const { email, confirmationCode } = req.body

    console.log({ email, confirmationCode });

    try {
        const account = await Account.findOne({ email })

        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }

        if (account.accountConfirmationCode !== confirmationCode) {
            return res.status(400).json({ message: "Invalid confirmation code" })
        }

        account.accountConfirmed = true
        await account.save()

        const accountUsername = account.accountUsername

        const dbName = `Account-${accountUsername}`;
        const newDbUri = `mongodb+srv://db:nPa7vcJRCeCXaHRd@cluster0.2dtcjow.mongodb.net/${dbName}`;
        const newDbConnection = mongoose.createConnection(newDbUri, {})

        newDbConnection.on('connected', async () => {
            console.log(`Connected to database: ${dbName}`);

            const SampleSchema = new mongoose.Schema({ name: String });
            const SampleModel = newDbConnection.model("initialCollection", SampleSchema);

            await SampleModel.create({ name: "Initial Document" });

            const UserModel = newDbConnection.model("User", UserSchema);

            const newUser = new UserModel({
                username: accountUsername,
                email: account.email,
                password: account.password,
                isActivated: true,
                userRole: 1,
                userTitle: "admin",
                isPasswordHashed: true
            });

            await newUser.save();

            // *** Create collections
            newDbConnection.model("Comment", CommentSchema)
            newDbConnection.model("Customer", CustomerSchema)
            newDbConnection.model("Groups", GroupsSchema)
            newDbConnection.model("Label", LabelSchema)
            newDbConnection.model("NotificationChatTask", NotificationChatTaskSchema)
            newDbConnection.model("Sprints", SprintsSchema)
            newDbConnection.model("SprintYear", SprintYearSchema)
            newDbConnection.model("Task", TaskSchema)
            newDbConnection.model("TimeRegistration", TimeRegistrationSchema)
            newDbConnection.model("Vertical", VerticalSchema)

            res.status(200).json({ message: "Your account has been verified successfully" });
        });

        newDbConnection.on('error', (err) => {
            console.error(`Error connecting to database: ${dbName}`, err);
            res.status(500).json({ message: "Error verifying account", error: err });
        });
    } catch (error) {
        res.status(500).json({ message: "Error verifying account", error })
    }
})

router.post("/register", async (req, res) => {
    const { accountUsername, email, password, confirmationCode } = req.body;

    console.log({ accountUsername, email, password, confirmationCode });

    try {
        const account = new Account({
            accountUsername,
            email,
            password,
            accountConfirmationCode: confirmationCode,
        });
        await account.save();

        console.log({ account });
        if (!account) {
            res.status(400).json({ message: "Error creating account" });
            return;
        }

        res.status(201).json({ message: "Account created successfully", account });
    } catch (error) {
        res.status(400).json({ message: "Error creating account", error });
    }
});

module.exports = router;
