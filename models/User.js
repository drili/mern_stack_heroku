const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenants",
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        isActivated: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String,
            default: "profileImage-1689352117005-532153319.jpg",
        },
        userRole: {
            type: Number,
            default: 0,
        },
        userTitle: {
            type: String,
            default: "employee",
        },
        activeYear: {
            type: Number,
            default: 2025
        },
        slackId: {
            type: String,
            default: "0",
        },
        isPasswordHashed: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password") && !this.isPasswordHashed) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        this.isPasswordHashed = true
    }

    next()
})

module.exports = {
    User: mongoose.model("User", userSchema),
    UserSchema: userSchema
};