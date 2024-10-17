const express = require('express')
const router = express.Router()
const {Customer} = require('../models/Customer')

router.route("/fetch-customer").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerId } = req.query

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        const customer = await Customer.find({ _id: customerId, tenantId })

        res.json(customer)
    } catch (error) {
        console.error("Failed to fetch customer by id", error)
        res.status(500).json({ error: "Failed to fetch customer by id" })
    }
})

router.route("/create").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerName, customerColor } = req.body

    if (!tenantId || !customerName) {
        return res.status(400).json({ error: "tenantId & customerName is required" })
    }

    try {
        const customer = new Customer({
            customerName,
            customerColor,
            tenantId,
        })

        const savedCustomer = await customer.save()

        res.json(savedCustomer)
    } catch (error) {
        console.error('Failed to create customer', error);
        res.status(500).json({ error: 'Failed to create customer' })
    }
})

router.route("/fetch").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    // const tenantId = req.query.tenantId

    if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" })
    }

    try {
        const customers = await Customer.find({ tenantId }).sort({ _id: -1 })
        res.json(customers)
    } catch (error) {
        console.error('Failed to fetch customers', error)
        res.status(500).json({ error: "Failed to fetch customers" })
    }
})

router.route("/delete/:customerId").delete(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerId } = req.params

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        await Customer.findOneAndDelete({ _id: customerId, tenantId: tenantId })
        res.json({ message: "Customer deleted successfully" })
    } catch (error) {
        console.error("Failed to delete customer", error)
        res.status(500).json({ error: "Failed to delete customer" })
    }
})

router.route("/archive/:customerId").put(async (req,res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerId } = req.params

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        await Customer.findOneAndUpdate(
            { _id: customerId, tenantId: tenantId }, 
            { $set : { isArchived: true } }
        )
        
        res.json({ message: "Customer archived & updated successfully" })
    } catch (error) {
        console.error("Failed to archive customer", error);
        res.status(500).json({ error: "Failed to archive customer" });
    }
})

router.route("/unarchive/:customerId").put(async (req,res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { customerId } = req.params

    if (!tenantId || !customerId) {
        return res.status(400).json({ error: "tenantId & customerId is required" })
    }

    try {
        await Customer.findOneAndUpdate({
            _id: customerId, tenantId: tenantId},
            { $set : { isArchived: false } }
        )

        res.json({ message: "Customer archived & updated successfully" })
    } catch (error) {
        console.error("Failed to archive customer", error);
        res.status(500).json({ error: "Failed to archive customer" });
    }
})

module.exports = router