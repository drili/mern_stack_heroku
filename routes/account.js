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
const Tenants = require("../models/Tenants");
const { User } = require("../models/User");

const router = express.Router();

router.post("/verify-account", async (req, res) => {
    const { email, confirmationCode } = req.body

    console.log({ email, confirmationCode });

    try {
        // *** NEW SETUP
        const tenant = await Tenants.findOne({ email })

        if (!tenant) {
            return res.status(404).json({ message: "Tenant not found" })
        }

        if (tenant.tenantConfirmationCode !== confirmationCode) {
            return res.status(400).json({ message: "Invalid confirmation code" })
        }

        tenant.tenantConfirmed = true
        await tenant.save()
        
        const tenantUsername = tenant.tenantUsername

        // *** Create user
        const newUser = new User({
            tenantId: tenant._id,
            username: tenantUsername, 
            email: tenant.email,
            password: tenant.password,
            isActivated: true,
            userRole: 1,
            userTitle: "admin",
            isPasswordHashed: true,
        })
        await newUser.save()

        if (newUser) {
            res.status(200).json({ message: "Your account has been verified successfully" });
        } else {
            res.status(500).json({ message: "Error creating user" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error verifying account", error })
    }
})

router.post("/register", async (req, res) => {
    const { accountUsername, email, password, confirmationCode } = req.body;

    console.log({ accountUsername, email, password, confirmationCode });

    try {
        const tenant = new Tenants({
            tenantUsername: accountUsername,
            email,
            password,
            tenantConfirmationCode: confirmationCode,
        });
        await tenant.save();

        console.log({ tenant });
        if (!tenant) {
            res.status(400).json({ message: "Error creating account" });
            return;
        }

        res.status(201).json({ message: "Tentant created successfully", tenant });
    } catch (error) {
        res.status(400).json({ message: "Error creating tenant", error });
    }
});

module.exports = router;
