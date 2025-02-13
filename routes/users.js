const router = require("express").Router()
let {User} = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const jwtMiddleware = require("../jwtMiddleware")
const multer = require("multer")

router.route("/update-sprint-year").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { activeYear, userId } = req.body

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & commentId is required" })
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, tenantId: tenantId },
            { activeYear },
            { new: true }
        )

        res.status(200).json(updatedUser)
    } catch (error) {
        console.error('Failed to update sprint year:', error);
        res.status(500).json({ error: 'Failed to update sprint year' });
    }
})

router.route("/register").post((req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { 
        username, 
        password,
        email,
        is_activated,
        profile_image,
        user_role,
        user_title
    } = req.body

    if (!username || !password || !tenantId) {
        return res.status(400).json({ msg: "username, password & tenantId is required" })
    }

    User.findOne({ username })
        .then(user => {
            if (user) {
                return res.status(400).json({ msg: "User already exists" })
            }

            const newUser = new User({
                username, 
                password,
                email,
                isActivated: is_activated,
                profileImage: profile_image,
                userRole: user_role,
                tenantId: tenantId
            })

            newUser.save()
                .then(user => {
                    jwt.sign(
                        { id: user.id },
                        "my_jwt_secret",
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) {
                                throw err
                            }

                            res.cookie('token', token, { httpOnly: true });

                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    is_activated: user.isActivated,
                                    profile_image: user.profileImage,
                                    user_role: user.userRole,
                                    user_title: user.userTitle,
                                    tenant_id: user.tenantId,
                                }
                            })
                        }
                    )
                })
        })
})

router.route("/login").post((req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { email, password } = req.body

    if (!tenantId || !email || !password) {
        return res.status(400).json({ error: "tenantId, email & password is required" })
    }

    User.findOne({ email })
        .then(user => {
            if (!user) return res.status(400).json({ msg: 'User does not exist' });

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

                    jwt.sign(
                        { id: user.id },
                        'my_jwt_secret',
                        { expiresIn: 3600 },
                        (err, token) => {
                            if (err) throw err;

                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    is_activated: user.isActivated,
                                    profile_image: user.profileImage,
                                    user_role: user.userRole,
                                    user_title: user.userTitle,
                                    active_year: user.activeYear,
                                    tenant_id: user.tenantId,
                                }
                            });
                        }
                    )
                });
        })
})

router.route("/profile/update").put((req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { username, email, userTitle, userId } = req.body;

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    User.findOneAndUpdate(
        { _id: userId, tenantId: tenantId },
        {
            $set: {
                username,
                email,
                userTitle
            }
        },
        { new: true }
    )
    .then((updatedUser) => {
        res.json({
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                is_activated: updatedUser.isActivated,
                profile_image: updatedUser.profileImage,
                user_role: updatedUser.userRole,
                user_title: updatedUser.userTitle,
                tenant_id: tenantId,
            }
        })
})
    .catch((err) => {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user information' });
    });
})

router.put("/profile/update-password", async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { newPassword, userId } = req.body;

    if (!tenantId || !userId || !newPassword) {
        return res.status(400).json({ error: "tenantId, newPassword & userId is required" })
    }

    try {
        const user = await User.findOne({ _id: userId, tenantId: tenantId })
        if(!user) {
            return res.status(400).json({ msg: "::: User not found" })
        }

        // const isMatch = await bcrypt.compare(newPassword, user.password)
        // if (!isMatch) {
        //     return res.status(400).json({ msg: "::: Current password is incorrect" });
        // }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        console.log({hashedPassword})
        
        user.password = hashedPassword
        await user.save()

        res.json({ msg: "Password updated successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Failed to update password" })
    }
    
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
    },
})

const upload = multer({ storage });

router.put("/profile/upload-image", upload.single("profileImage"), async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    const userId = req.body.userId

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' })
    }

    const filename = req.file.filename
    const filePath = req.file.path

    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, tenantId: tenantId },
            { profileImage: req.file.filename },
            { new: true }
        )

        res.json({ 
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                is_activated: updatedUser.isActivated,
                profile_image: updatedUser.profileImage,
                user_role: updatedUser.userRole,
                user_title: updatedUser.userTitle,
                active_year: updatedUser.activeYear,
            }
         })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile image' });
    }
})

router.route("/fetch-active-users").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" })
    }

    try {
        const users = await User.find(
            { isActivated: true, tenantId },
            '_id username email profileImage userRole userTitle createdAt'
            ).sort({ _id: -1 })
        res.json(users)
    } catch (error) {
        console.error('Failed to fetch users', error)
        res.status(500).json({ error: "Failed to fetch users" })
    }
})

router.route("/users-not-in-task").post(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { taskPersons } = req.body

    if (!tenantId || !taskPersons) {
        return res.status(400).json({ error: "tenantId & taskPersons is required" })
    }

    try {
        const userIds = taskPersons.map(person => person.user)

        const users = await User.find({
            $and: [
                { _id: { $nin: userIds } },
                { isActivated: true },
                { tenantId: tenantId },
            ]
        })

        res.json(users)
    } catch (error) {
        console.error('Failed to fetch users', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
})

router.route("/fetch-all-users").get(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    if (!tenantId) {
        return res.status(400).json({ error: "tenantId is required" })
    }

    try {
        const users = await User.find({ tenantId: tenantId }).sort({ username: 1 })

        return res.status(200).json(users)
    } catch (error) {
        console.error('Failed to fetch all users', error);
        return res.status(500).json({ error: 'Failed to fetch all users' });
    }
})

router.route("/update-users/:userId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]

    const { userId } = req.params
    const updatedUserData = req.body

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    try {
        const user = await User.findOneAndUpdate(
            { _id: userId, tenantId: tenantId },
            updatedUserData,
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Failed to update user', error);
        return res.status(500).json({ message: 'Failed to update user' });
    }
})

router.route("/update-user-activation/:userId").put(async (req, res) => {
    const baseUrl = req.baseUrl
    const tenantId = baseUrl.split("/")[1]
    const { userId } = req.params
    const { isActivated } = req.body

    if (!tenantId || !userId) {
        return res.status(400).json({ error: "tenantId & userId is required" })
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, tenantId: tenantId },
            { isActivated },
            { new: true }
        )

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Failed to update user', error);
        return res.status(500).json({ message: 'Failed to update user' });
    }
})

module.exports = router