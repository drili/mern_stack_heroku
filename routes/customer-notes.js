const express = require('express')
const router = express.Router()

const { CustomerNotes } = require("../models/CustomerNotes")
const { User } = require("../models/User")

router.route("/delete-customer-notes/:noteId").delete(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { noteId } = req.params

    if (!tenantId || !noteId) {
        return res.status(400).json({ error: "tenantId & noteId is required" })
    }

    try {
        const deleteNote = await CustomerNotes.findOneAndDelete({ _id: noteId, tenantId })
        res.status(200).send({ message: "Note deleted" })
    } catch (error) {
        console.error("Failed to deleting customer notes by id", error)
        res.status(500).json({ error: "Failed to deleting customer notes by id" })
    }
})

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
        const customerNotes = await CustomerNotes.find(
            { customerRef: customerId, sprintId }
        ).populate({
            path: "createdBy",
            model: User,
            select: "_id username email profileImage"
        })

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