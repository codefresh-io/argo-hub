import SlackApi from '../slack-api.js';

class SimpleMode {
  static send() {
    console.log('Choose simple mode');

    const attachments = process.env.SLACK_ATTACHMENTS
      ? JSON.parse(process.env.SLACK_ATTACHMENTS)
      : undefined;

    if (!process.env.SLACK_TEXT && !attachments) {
      console.error('SLACK_TEXT or SLACK_ATTACHMENTS env variable should be present');
      process.exit(1);
    }

    SlackApi.send(
      process.env.SLACK_TEXT,
      attachments,
      process.env.SLACK_USER_NAME,
      process.env.SLACK_ICON_EMOJI,
      process.env.SLACK_THREAD_TS,
    );
  }
}

export default SimpleMode;
