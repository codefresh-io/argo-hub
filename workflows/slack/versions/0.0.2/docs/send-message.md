# send-message

## Summary
Send a message to a Slack channel using a hook url

## Inputs/Outputs

### Inputs
* SLACK_HOOK_URL (required) - Name or ID of the channel to send the message to. Use <@ID> or email to send to a user as display names are not unique (https://api.slack.com/changelog/2017-09-the-one-about-usernames)
* SLACK_MESSAGE (required) - the message to send. Use <@ID> to tag a user. Check https://api.slack.com/reference/surfaces/formatting for details.
* SLACK_TOKEN (required) - The secret cotaining the token to connect to Slack API
* LOG_LEVEL (optional) - the level of info to display (info, debug, warn, error). Default is "info"

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: post-to-channel-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: send-message
        templateRef:
          name: argo-hub.slack.0.0.2
          template: post-to-channel
        arguments:
          parameters:
          - name: SLACK_CHANNEL
            value: 'team-channel
          - name: SLACK_MESSAGE
            value: 'my cool message'
          - name: SLACK_TOKEN
            value: slack-token
          - name: LOG_LEVEL
            value: "debug"
```
