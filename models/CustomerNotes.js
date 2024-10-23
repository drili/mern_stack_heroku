const mongoose = require("mongoose")

const customerNotesSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenants",
        required: true,
    },
    customerRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    taskSprints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprints',
        required: true,
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    noteContent: {
        type: String,
        required: true,
    },
})

const CustomerNotes = mongoose.model("CustomerNotes", customerNotesSchema)

module.exports = {
    CustomerNotes: CustomerNotes,
    customerNotesSchema: customerNotesSchema
}