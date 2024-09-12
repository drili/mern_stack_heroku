const express = require("express")
const sanitizeHtml = require("sanitize-html")

const {Comment} = require("../models/Comments")
const {User} = require("../models/User")

const router = express.Router()

router.route("/edit-comment/:commentId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    const { commentId } = req.params
    const { htmlContent } = req.body

    if (commentId && htmlContent && tenantId) {
        try {
            const comment = await Comment.findByIdAndUpdate(
                { _id: commentId, tenantId: tenantId }, 
                { $set: { htmlContent: htmlContent } }, 
                {
                    new: true,
                    runValidators: true 
                }
            )

            if (!comment) {
                return res.status(404).send({ error: "Comment not found" })
            }

            res.status(200).send(comment)
        } catch (error) {
            res.status(500).send({ error: "Internal sever error `/edit-comment/:commentId`" })
        }
    }
})

router.route("/delete-comment-by-id/:commentId").delete(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    const { commentId } = req.params
    
    if (!tenantId || !commentId) {
        return res.status(400).json({ error: "tenantId & commentId is required" })
    }

    try {
        const comment = await Comment.findByIdAndDelete({ _id: commentId, tenantId: tenantId })
        
        if (!comment) {
            return res.status(404).send({ error: "Comment not found" })
        }

        res.status(200).send({ message: "Comment deleted" })
    } catch (error) {
        res.status(500).send({ error: 'Internal server error `/delete-comment-by-id/:commentId`' });
    }
})

router.route("/fetch-comments-by-task").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId } = req.body

    if (!taskId || !tenantId) {
        return res.status(400).send({ error: "Task ID & tenantId is required" })
    }

    try {
        const comments = await Comment.find({ taskId: taskId, tenantId: tenantId })
            .sort({ createdAt: 0 })
            .populate({
                path: "createdBy",
                model: User,
                select: "username email profileImage"
            })
        res.status(200).send(comments)
    } catch (error) {
        res.status(500).send({ error: "Error fetchings comments by task ID" })
    }
})

router.route("/create-comment").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskId, htmlContent, createdBy } = req.body

    if (!taskId || !tenantId) {
        return res.status(400).send({ error: "Task ID & tenantId is required" })
    }

    try {
        const sanitizedHtml = sanitizeHtml(htmlContent, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'span': ['className'],
                'span': ['class']
            }
        });

        const comment = new Comment({
            taskId: taskId,
            htmlContent: sanitizedHtml,
            createdBy: createdBy,
            tenantId: tenantId,
        })

        const savedComment = await comment.save()
        res.json(savedComment)
    } catch (error) {
        res.status(400).send(error);
    }
})

module.exports = router