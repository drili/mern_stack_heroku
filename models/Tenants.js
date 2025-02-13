const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const Schema = mongoose.Schema

const TenantSchema = new Schema({
    tenantUsername: {
        type: String,
        unique: true,
        required: [true, "Tenant username is required"],
        minlength: [3, "Tenant username must be at least 3 characters"],
        maxlength: [50, "Tenant Username cannot be more than 40 characters"],
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
    tenantConfirmed: {
        type: Boolean,
        default: false,
    },
    tenantConfirmationCode: {
        type: String,
        default: "0",
        required: false
    }
}, {
    timestamps: true,
    collection: 'tenants'
})

TenantSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }

    next()
})


const Tenants = mongoose.model("Tenants", TenantSchema)

module.exports = Tenants