const express = require("express")
const router = express.Router()
const { Vertical } = require("../models/Vertical")

router.route("/create-vertical").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { verticalName } = req.body

    if (!tenantId || !verticalName) {
        return res.status(400).json({ error: "There was an error creating vertical" })
    }

    try {
        const vertical = new Vertical({
            tenantId,
            verticalName,
        })

        const savedVertical = await vertical.save()
        res.json(savedVertical)
    } catch (error) {
        console.error("Failed to create vertical" ,error)
        res.status(500).json({ error: "Failed to create vertical" })
    }
})

router.route("/fetch-Verticals").get(async (req, res) => {
    // const tenantId = req.query.tenantId
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" })
    }

    try {
        const verticals = await Vertical.find({ tenantId }).sort({ _id: -1 })
        res.json(verticals)
    } catch (error) {
        console.error('Failed to fetch verticals', error)
        res.status(500).json({ error: "Failed to fetch verticals" })
    }
})

module.exports = router