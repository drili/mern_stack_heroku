const axios = require("axios")

const sendSlackMessage = async () => {
    try {
        const response = await axios.post("https://slack.com/api/chat.postMessage", {
            channel: "U0115LV93GF",
            text: "Hello this is a test message from T8.",
        }, {
            headers: {
                "Authorization": `Bearer ...`,
                'Content-type': 'application/json',
            }
        })

        console.log("Message sent: ", response.data)
    } catch (error) {
        console.error("Error sending message", error.response.data);
    }
}

sendSlackMessage()