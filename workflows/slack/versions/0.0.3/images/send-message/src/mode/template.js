import SlackApi from '../slack-api.js';

class TemplateMode {
  static send() {
    console.log('Choose template mode');

    if (!process.env.SLACK_TEMPLATE_BODY) {
      console.error('SLACK_TEMPLATE_BODY env variable should be present');
      process.exit(1);
    }

    const template = JSON.parse(process.env.SLACK_TEMPLATE_BODY);

    if (process.env.SLACK_TEMPLATE_ACTIONS) {
      template.actions = JSON.parse(process.env.SLACK_TEMPLATE_ACTIONS);
    }

    if (process.env.SLACK_TEMPLATE_FIELDS) {
      template.fields = JSON.parse(process.env.SLACK_TEMPLATE_FIELDS);
    }

    SlackApi.send(
      process.env.SLACK_TEXT,
      [template],
      process.env.SLACK_USER_NAME,
      process.env.SLACK_ICON_EMOJI,
      process.env.SLACK_THREAD_TS,
    );
  }
}

export default TemplateMode;
