const mongoose = require("mongoose")

const customerTargetsSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenants",
    },
    customerRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer"
    },
    spendGoogleAds: {
        type: String,
        required: false
    },
    spendMeta: {
        type: String,
        required: false
    },
    spendLinkedIn: {
        type: String,
        required: false
    },
    customerTarget: {
        type: String,
        required: false
    },
    percentageIncrease: {
        type: String,
        required: false
    }
})

const CustomerTargets = mongoose.model("CustomerTargets", customerTargetsSchema)

module.exports = {
    CustomerTargets: CustomerTargets,
    CustomerTargetsSchema: customerTargetsSchema
}