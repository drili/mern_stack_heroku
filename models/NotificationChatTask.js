const mongoose = require("mongoose")

const notificationChatTask = mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenants",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notificationType: {
        type: String,
        required: true,
        default: "user_tagging",
    },
    notificationIsRead: {
        type: Boolean,
        required: false,
        default: false,
    },
    notificationLink: {
        type: String,
        required: false,
    },
    notificationMessage: {
        type: String,
        required: true,
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    taskCustomer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    mentionedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
})

const NotificationChatTask = mongoose.model("NotificationChatTask", notificationChatTask)

module.exports = {
    NotificationChatTask: NotificationChatTask,
    NotificationChatTaskSchema: notificationChatTask
};