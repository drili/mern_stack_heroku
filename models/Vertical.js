const mongoose = require("mongoose")

const verticalSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenants",
    },
    verticalName: {
        type: String,
        required: true
    },
})

const Vertical = mongoose.model("Vertical", verticalSchema)

module.exports = {
    Vertical: Vertical,
    VerticalSchema: verticalSchema
};
