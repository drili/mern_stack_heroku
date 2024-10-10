const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

const { Holidays, holidaysSchema } = require("../models/Holidays")
const { User } = require("../models/User")

router.route("/delete-holiday/:holidayId").delete(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { holidayId } = req.params

    if (!holidayId || !tenantId) {
        return res.status(400).json({ error: "holidayId & tenantId is required" })
    }

    try {
        const holiday = await Holidays.findOneAndDelete(
            { _id: holidayId, tenantId }
        )

        res.status(200).send({ message: "Holiday deleted" })
    } catch (error) {
        console.error("Error deleting holiday", error)
        return res.status(500).json({ error: "Error deleting holiday" })
    }
})

router.route("/approve-holiday/:holidayId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { holidayId } = req.params

    if (!holidayId || !tenantId) {
        return res.status(400).json({ error: "holidayId & tenantId is required" })
    }

    try {
        const holiday = await Holidays.findOneAndUpdate(
            { _id: holidayId, tenantId },
            { $set: { status: "approved" } },
            {
                new: true,            
            }
        )

        res.status(200).send({ message: "Holiday approved" })
    } catch (error) {
        console.error("Error approve holiday", error)
        return res.status(500).json({ error: "Error approve holiday" })
    }
})

router.route("/decline-holiday/:holidayId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { holidayId } = req.params

    if (!holidayId || !tenantId) {
        return res.status(400).json({ error: "holidayId & tenantId is required" })
    }

    try {
        const holiday = await Holidays.findOneAndUpdate(
            { _id: holidayId, tenantId },
            { $set: { status: "declined" } },
            {
                new: true,            
            }
        )

        res.status(200).send({ message: "Holiday declined" })
    } catch (error) {
        console.error("Error declining holiday", error)
        return res.status(500).json({ error: "Error declining holiday" })
    }
})

router.route("/fetch-all-holidays/:userId").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId } = req.params

    try {
        let holidays = {}
        if (userId && userId != 0) {
            holidays = await Holidays.find({ tenantId, userId })
                .populate({
                    path: "userId",
                    model: User,
                    select: "username email profileImage",
                })
        } else {
            holidays = await Holidays.find({ tenantId })
                .populate({
                    path: "userId",
                    model: User,
                    select: "username email profileImage",
                })
        }
        
        return res.status(200).json(holidays)
    } catch (error) {
        console.error("Error fetching all holidays", error)
        return res.status(500).json({ error: "Error fetching all holidays" })
    }
})

router.route("/fetch-holidays-by-user/:userId").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId } = req.params

    if (!userId) {
        return res.status(400).json({ error: "userId is required" })
    }

    try {
        const holidaysByUser = await Holidays.find({ userId, tenantId })
            .populate({
                path: "userId",
                model: User,
                select: "username email profileImage",
            })

        return res.status(200).json(holidaysByUser)
    } catch (error) {
        console.error('Failed to fetch holiday time by user', error)
        return res.status(500).json({ error: "Failed to fetch holiday time by user" })
    }
})

router.route("/register-holidays").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId, startTime, endTime, totalDays } = req.body
    
    if (!tenantId || !userId || !totalDays) {
        return res.status(400).json({ error: "tenantId, totalDays & userId is required" })
    }

    function formatDateForDisplay(inputDate) {
        const dateParts = inputDate.split('-')
        if (dateParts.length === 3) {
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
        } else {
            return inputDate
        }
    }

    const startTimeFormatted = formatDateForDisplay(startTime)
    const endTimeFormatted = formatDateForDisplay(endTime)

    try {
        const holidays = await Holidays.create({
            tenantId,
            userId,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            totalDays,
        })

        return res.status(201).json(holidays)
    } catch (error) {
        console.error('Failed to register holiday time', error)
        return res.status(500).json({ error: 'Failed to register holiday time' })
    }
})

module.exports = router