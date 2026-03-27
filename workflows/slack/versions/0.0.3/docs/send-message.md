# send-message

## Summary
Send a message to a Slack channel using a hook url

## Inputs/Outputs

### Inputs

### Modes
This template supports three modes, selected via the `MODE` environment variable:
- **simple** (default): Send plain text or custom attachments.
- **template**: Send a custom Slack message using a JSON template body, with optional actions and fields.
- **default-template**: Send a pre-defined Codefresh-style notification with repository and branch info (requires SCM environment variables).

### Inputs
- `SLACK_HOOK_URL` (required): Slack webhook URL
- `SLACK_TEXT` (required for simple/default-template, optional for template): Message text
- `SLACK_THREAD_TS` (optional): Thread timestamp to reply in a thread
- `SLACK_ATTACHMENTS` (optional, available only for simple mode): JSON string for Slack attachments
- `SLACK_USER_NAME` (optional): Username to display
- `SLACK_ICON_EMOJI` (optional): Emoji icon for the message
- `MODE` (optional): Selects the mode (`simple`, `template`, `default-template`). Defaults to `simple`
- `SLACK_TEMPLATE_BODY` (required, available only for template mode): JSON string for the main template
- `SLACK_TEMPLATE_ACTIONS` (optional, available only for template mode): JSON string for Slack actions
- `SLACK_TEMPLATE_FIELDS` (optional, available only for template mode): JSON string for additional fields

> SCM-related variables (required for default-template mode) are automatically provided by Codefresh: `CF_COMMIT_AUTHOR`, `CF_REPO_NAME`, `CF_BRANCH_VERSION_NORMALIZED`, `CF_BRANCH`

> Although the `SLACK_THREAD_TS` is available to send messages in a thread, this workflow does not output the thread timestamp for further use. If you need to capture the thread timestamp when sending a message, consider using the `post-to-channel` template instead, which provides the thread timestamp as an output.


### Outputs

No outputs. This template only sends a message and does not return any values.

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: slack-send-message-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: send-message
        templateRef:
          name: argo-hub.slack.0.0.3
          template: send-message
        arguments:
          parameters:
          - name: SLACK_HOOK_URL
            value: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
          - name: SLACK_TEXT
            value: 'Hello from Codefresh!'
          # Optional: send as a reply in a thread
          - name: SLACK_THREAD_TS
            value: '1234567890.123456'
```

### Advanced Usage Examples

#### Send with custom attachments (simple mode)
```
parameters:
  - name: SLACK_HOOK_URL
    value: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
  - name: SLACK_TEXT
    value: 'Deployment finished.'
  - name: SLACK_ATTACHMENTS
    value: '[{"color": "good", "text": "All systems go!"}]'
```

#### Send with custom template (template mode)
```
parameters:
  - name: SLACK_HOOK_URL
    value: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
  - name: MODE
    value: 'template'
  - name: SLACK_TEMPLATE_BODY
    value: '{"text": "Custom message", "color": "warning"}'
  - name: SLACK_TEMPLATE_ACTIONS
    value: '[{"type": "button", "text": "View"}]'
  - name: SLACK_TEMPLATE_FIELDS
    value: '[{"title": "Status", "value": "Success"}]'
```