# post-to-channel

## Summary

Send a message to a Slack channel using its name (or an email address for DM) with a Slack Token. This template supports simple messages, custom templates with attachments, and interactive elements like buttons. It also outputs the thread timestamp for use in subsequent workflow steps.

## Inputs/Outputs

### Inputs

- `SLACK_CHANNEL` (required): Slack channel name (e.g., '#team-channel'). It also accepts user email address or user ID for direct messages
- `SLACK_TOKEN` (required): The secret name containing the Slack bot token. Default is 'slack-token'
- `SLACK_MESSAGE` (optional): The message text to send. Use `<@ID>` to tag users. See [Slack formatting guide](https://api.slack.com/reference/surfaces/formatting) for details
- `SLACK_THREAD_TS` (optional): Thread timestamp to reply in an existing thread
- `SLACK_TEMPLATE_BODY` (optional): JSON string for custom Slack message template/attachment
- `SLACK_TEMPLATE_ACTIONS` (optional): JSON string for interactive elements (buttons, etc.)
  - This replaces the actions in the template body
- `SLACK_TEMPLATE_FIELDS` (optional): JSON string for additional fields in the template
  - This replaces the fields in the template body
- `LOG_LEVEL` (optional): Logging level (info, debug, warn, error). Default is 'info'

### Outputs

- `thread_ts`: The timestamp of the posted message, which can be used as a thread identifier for replies.

## Examples

### Simple Message

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: post-to-channel-simple-
spec:
  entrypoint: main
  templates:
    - name: main
      dag:
        tasks:
          - name: send-message
            templateRef:
              name: argo-hub.slack.0.0.3
              template: post-to-channel
            arguments:
              parameters:
                - name: SLACK_CHANNEL
                  value: 'team-channel'
                - name: SLACK_MESSAGE
                  value: 'Hello from Argo Workflows!'
                - name: SLACK_TOKEN
                  value: slack-token
```

### Direct Message to User

```yaml
parameters:
  - name: SLACK_CHANNEL
    value: 'user@company.com'
  - name: SLACK_MESSAGE
    value: 'Hi there! This is a direct message.'
  - name: SLACK_TOKEN
    value: slack-token
```

### Reply in Thread

```yaml
parameters:
  - name: SLACK_CHANNEL
    value: 'team-channel'
  - name: SLACK_MESSAGE
    value: 'This is a reply in the thread'
  - name: SLACK_THREAD_TS
    value: '1234567890.123456'
  - name: SLACK_TOKEN
    value: slack-token
```

### Default Codefresh-style Template

```yaml
parameters:
  - name: SLACK_CHANNEL
    value: 'team-channel'
  - name: SLACK_MESSAGE
    value: 'Build completed successfully'
  - name: SLACK_TEMPLATE_BODY
    value: |
      {
        "fallback": "Image push",
        "color": "good",
        "pretext": "Image pushed to repository",
        "author_name": "Test Author",
        "author_icon": "https://g.codefresh.io/modules/cf.resources/images/codefresh.png",
        "thumb_url": "https://codefresh.io/docs/assets/brand/codefresh-social-logo.png"
      }
  - name: SLACK_TEMPLATE_FIELDS
    value: |
      [
        {
          "title": "Repository",
          "value": "test-repo",
          "short": true
        },
        {
          "title": "Branch",
          "value": "main",
          "short": true
        }
      ]
  - name: SLACK_TOKEN
    value: slack-token
```

### Custom Template with Fields

```yaml
parameters:
  - name: SLACK_CHANNEL
    value: 'team-channel'
  - name: SLACK_MESSAGE
    value: 'Deployment status update'
  - name: SLACK_TEMPLATE_BODY
    value: |
      {
        "text": "Custom message",
        "color": "warning"
      }
  - name: SLACK_TEMPLATE_FIELDS
    value: |
      [
        {"title": "Status", "value": "Success", "short": true},
        {"title": "Environment", "value": "Production", "short": true}
      ]
  - name: SLACK_TOKEN
    value: slack-token
```

### Advanced Template with Interactive Actions

```yaml
parameters:
  - name: SLACK_CHANNEL
    value: 'team-channel'
  - name: SLACK_MESSAGE
    value: 'Deployment completed'
  - name: SLACK_TEMPLATE_BODY
    value: |
      {
        "text": "Deployment finished",
        "color": "good"
      }
  - name: SLACK_TEMPLATE_ACTIONS
    value: |
      [
        {
          "type": "button",
          "text": "View Logs",
          "url": "https://example.com/logs"
        }
      ]
  - name: SLACK_TEMPLATE_FIELDS
    value: |
      [
        {"title": "Environment", "value": "Production", "short": true},
        {"title": "Version", "value": "1.2.3", "short": true}
      ]
  - name: SLACK_TOKEN
    value: slack-token
```

### Using Thread Timestamp Output

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: post-to-channel-with-reply-
spec:
  entrypoint: main
  templates:
    - name: main
      dag:
        tasks:
          - name: initial-message
            templateRef:
              name: argo-hub.slack.0.0.3
              template: post-to-channel
            arguments:
              parameters:
                - name: SLACK_CHANNEL
                  value: 'team-channel'
                - name: SLACK_MESSAGE
                  value: 'Starting deployment...'
                - name: SLACK_TOKEN
                  value: slack-token
          - name: reply-message
            templateRef:
              name: argo-hub.slack.0.0.3
              template: post-to-channel
            arguments:
              parameters:
                - name: SLACK_CHANNEL
                  value: 'team-channel'
                - name: SLACK_MESSAGE
                  value: 'Deployment completed successfully!'
                - name: SLACK_THREAD_TS
                  value: '{{tasks.initial-message.outputs.parameters.thread_ts}}'
                - name: SLACK_TOKEN
                  value: slack-token
            depends: initial-message
```
