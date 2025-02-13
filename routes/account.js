// routes/account.js

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

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

router.route("/login").post((req, res) => {
    const { email, password } = req.body
    
    if(!email || !password) {
        return res.status(400).json({ msg: '::: Please enter all fields' });
    }

    User.findOne({ email })
        .then(user => {
            if (!user) return res.status(400).json({ msg: '::: User does not exist' });

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) return res.status(400).json({ msg: '::: Invalid credentials' });

                    jwt.sign(
                        { id: user.id },
                        'my_jwt_secret',
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) throw err;

                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    is_activated: user.isActivated,
                                    profile_image: user.profileImage,
                                    user_role: user.userRole,
                                    user_title: user.userTitle,
                                    active_year: user.activeYear,
                                    tenant_id: user.tenantId,
                                }
                            });
                        }
                    )
                });
        })
})

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
