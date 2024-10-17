const express = require('express')
const router = express.Router()

const { CustomerTargets } = require("../models/CustomerTargets")

router.route("/fetch-customer-targets-by-id").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerId } = req.query

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        const customerTargets = await CustomerTargets.find({ customerRef: customerId })

        if (!customerTargets.length) {
            return res.json([])
        }

        res.json(customerTargets)
    } catch (error) {
        console.error("Failed to fetch customer targets by id", error)
        res.status(500).json({ error: "Failed to fetch customer targets by id" })
    }
})

router.route("/update-customer-targets-by-id").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerId } = req.query

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        
    } catch (error) {
        console.error("Failed to update customer targets by id", error)
        res.status(500).json({ error: "Failed to update customer targets by id" })
    }
})

module.exports = router