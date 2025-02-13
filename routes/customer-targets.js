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

router.route("/update-customer-targets-by-id").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { 
        customerId,
        spendGoogleAds,
        spendMeta,
        spendLinkedIn,
        customerTarget,
        percentageIncrease 
    } = req.body

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        const updatedTarget = await CustomerTargets.findOneAndUpdate(
            { customerRef: customerId },
            {
                $set: {
                    spendGoogleAds,
                    spendMeta,
                    spendLinkedIn,
                    customerTarget,
                    percentageIncrease,
                },
            },
            { new: true, upsert: true } // Create new if not exists
        )

        return res.status(200).json({ message: "Customer targets updated successfully", data: updatedTarget })
    } catch (error) {
        console.error("Failed to update customer targets by id", error)
        res.status(500).json({ error: "Failed to update customer targets by id" })
    }
})

module.exports = router