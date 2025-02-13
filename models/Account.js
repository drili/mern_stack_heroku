const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const Schema = mongoose.Schema

const AccountSchema = new Schema({
    accountUsername: {
        type: String,
        unique: true,
        required: [true, "Account username is required"],
        minlength: [3, "Account username must be at least 3 characters"],
        maxlength: [50, "Account Username cannot be more than 40 characters"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    accountConfirmed: {
        type: Boolean,
        default: false,
    },
    accountConfirmationCode: {
        type: String,
        default: "0",
        required: false
    }
}, {
    timestamps: true,
    collection: 'Account'
})

AccountSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }

    next()
})


const Account = mongoose.model("Account", AccountSchema)

module.exports = Account