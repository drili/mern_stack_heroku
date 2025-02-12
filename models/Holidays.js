const mongoose = require("mongoose")

const holidaysSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenants",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    status: {
        type: String,
        default: "pending"
    },
    totalDays: {
        type: String
    }
}, {
    timestamps: true
})

const Holidays = mongoose.model("Holidays", holidaysSchema)

module.exports = {
    Holidays: Holidays,
    holidaysSchema: holidaysSchema
}