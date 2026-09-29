import { IncomingWebhook } from '@slack/webhook';

const slack = new IncomingWebhook(process.env.SLACK_HOOK_URL);

class SlackApi {
  static send(text, attachments, username, icon, threadTs) {
    const payload = {
      text,
      attachments,
      username,
      icon_emoji: icon,
    };

    if (threadTs) {
      payload.thread_ts = threadTs;
    }

    slack.send(payload)
      .catch((err) => {
        console.error(`Cant send notification to slack , error : ${err}, check your SLACK_HOOK_URL`);
        process.exitCode = 0;
      });
  }
}

export default SlackApi;
