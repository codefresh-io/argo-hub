const SlackWebhook = require('slack-webhook');

const slack = new SlackWebhook(process.env.SLACK_HOOK_URL);

class SlackApi {

    static send(text, attachments, username, icon){
        slack.send({
            text: text,
            attachments: attachments,
            username: username,
            icon_emoji: icon,
        }).catch(function (err) {
           console.error(`Cant send notification to slack , error : ${err}, check your SLACK_HOOK_URL`);
           process.exitCode = 0;
        });
    }

}

module.exports = SlackApi;
