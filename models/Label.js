const mongoose = require("mongoose")

const labelSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenants",
    },
    labelName: {
        type: String,
        required: true
    },
    labelColor: {
        type: String,
        required: true
    }
})

const Label = mongoose.model("Label", labelSchema)

module.exports = {
    Label: Label,
    LabelSchema: labelSchema
};