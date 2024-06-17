const mongoose = require("mongoose")

// TODO: Update to include "tenantId" with ref.
const labelSchema = new mongoose.Schema({
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