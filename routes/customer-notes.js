const express = require('express')
const router = express.Router()

const { CustomerNotes } = require("../models/CustomerNotes")

router.route("/fetch-customer-notes").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const {
        customerId,
        sprintId,
    } = req.query

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        const customerNotes = await CustomerNotes.find({ customerRef: customerId, sprintId })

        if (!customerNotes.length) {
            return res.json([])
        }

        res.json(customerNotes)
    } catch (error) {
        console.error("Failed to fetch customer notes by id", error)
        res.status(500).json({ error: "Failed to fetch customer notes by id" })
    }
})

router.route("/create-note").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const {
        customerId,
        userId,
        sprintId,
        noteTitle, 
        noteContent,
    } = req.body

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        const customerNote = new CustomerNotes({
            tenantId,
            customerRef: customerId,
            sprintId,
            createdBy: userId,
            noteTitle,
            noteContent,
        })

        const savedCustomerNote = await customerNote.save()
        res.json(savedCustomerNote)
    } catch (error) {
        console.error("Failed to create customer note" ,error)
        res.status(500).json({ error: "Failed to create customer note" })
    }
})

module.exports = router