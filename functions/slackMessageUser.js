require('dotenv').config({ path: "../.env" })

const axios = require("axios")

const sendSlackMessage = async (message, userID) => {
    try {
        const slack_oath_token = process.env.SLACK_OAUTH_TOKEN
        
        const response = await axios.post("https://slack.com/api/chat.postMessage", {
            channel: userID,
            text: `${message}`,
        }, {
            headers: {
                "Authorization": `Bearer ${slack_oath_token}`,
                'Content-type': 'application/json',
            }
        })
    } catch (error) {
        console.error("Error sending message", error.response.data);
    }
}

module.exports = sendSlackMessage;