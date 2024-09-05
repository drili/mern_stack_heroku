const express = require("express")
const router = express.Router()
const { Label } = require("../models/Label")

router.route("/fetch-labels").get(async (req, res) => {
    const tenantId = req.query.tenantId
    
    if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" })
    }
    
    try {
        const labels = await Label.find({ tenantId }).sort({ _id: -1 })
        res.json(labels)
    } catch (error) {
        console.error('Failed to fetch labels', error)
        res.status(500).json({ error: "Failed to fetch labels" })
    }
})

module.exports = router