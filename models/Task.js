const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenants",
    },
    taskName: {
        type: String,
        required: true
    },
    taskHandle: { 
        type: String, 
        required: true, 
        unique: true 
    },
    taskTimeLow: {
        type: Number,
        required: true
    },
    taskTimeHigh: {
        type: Number,
        required: true
    },
    taskDescription: {
        type: String,
        required: false
    },
    taskCustomer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Customer"
    },
    taskLabel: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Label"
    },
    taskVertical: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Vertical"
    },
    // taskPersons: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User"
    // }],
    taskPersons:[
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            percentage: {
                type: Number,
                default: 100
            },
        },
    ],
    taskSprints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprints',
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    archivedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', default: null 
    },
    archivedTimestamp: { 
        type: Date, 
        default: null 
    },
    workflowStatus: {
        type: Number,
        default: 0
    },
    taskDeadline: {
        type: String,
    },
    estimatedTime: {
        type: Number,
        default: 0,
    },
    taskType: {
        type: String,
        default: null,
    },
    upcomingDeadlineNotificationSent: {
        type: Boolean,
        default: false
    },
    deadlineNotificationSent: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,
}
)

const Task = mongoose.model("Task", taskSchema)

module.exports = {
    Task: Task,
    TaskSchema: taskSchema
};
