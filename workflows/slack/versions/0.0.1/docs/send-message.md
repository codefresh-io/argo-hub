# send-message

## Summary
Send a message to a Slack channel using a hook url

## Inputs/Outputs

### Inputs
* SLACK_HOOK_URL (required) - the slack hook url
* SLACK_TEXT (required) - the text to send

### Outputs
no outputs

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
          name: argo-hub.slack.0.0.1
          template: send-message
        arguments:
          parameters:
          - name: SLACK_HOOK_URL
            value: 'http://hook.url.slack.com'
          - name: SLACK_TEXT
            value: 'my cool message'
```
