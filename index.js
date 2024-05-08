require('dotenv').config()
const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});


(async () => {
    app.action('confirm_channel_kicks', async ({ body, ack, respond }) => {
        await ack()
        const ids = JSON.parse(body.actions[0].value)
        ids.forEach(async id => {
            try {
                await app.client.conversations.kick({
                    token: process.env.SLACK_USER_TOKEN,
                    channel: id,
                    user: body.user.id
                })
            }
            catch (e) { 
            }
        })
        await respond(`Removed from ${ids.length} channel${ids.length != 1 ? "s" : ""}.`)
    });

    app.shortcut('remove_from_message_channels', async ({ ack, body, say, client, respond }) => {
        const channelIds = body.message.text.match(/<#(.*?)\|/g).map(match => match.replace(/<#|(?:\|)/g, ''));

        var str = "Will remove you from the following channels. Confirm?\n"
        channelIds.forEach(function (id) {
            str += `- <#${id}>\n`
        })

        await ack()
        await respond({
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": str,
                    }
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Confirm",
                                "emoji": false
                            },
                            "value": JSON.stringify(channelIds),
                            "action_id": "confirm_channel_kicks",
                        }
                    ]
                }
            ]
        })
    })

    await app.start();
})();

process.on("unhandledRejection", (error) => {
    console.error(error);
});