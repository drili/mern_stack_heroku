const mongoose = require("mongoose")

// TODO: Update to include "tenantId" with ref.
const verticalSchema = new mongoose.Schema({
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
