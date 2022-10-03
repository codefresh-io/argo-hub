# failure-notification

## Summary

This Workflow template is an example of how to parse and send a slack notification upon failure of a workflow.  

## Template Breakdown

### Workflow Spec

To utilize failure notification you will need to set the `spec.onExit` field to a template.  This will run at the end of a workflow no matter the status.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: argo-hub.failure-notification-example.0.0.1
spec:
  onExit: failure-notification # invoke pipeline-hook template at end of the workflow
```

### Workflow Templates

#### Parsing Template

We need to parse the information from the variable `workflow.failures` and output them to smaller items to make it more manageable instead of a raw json.  We are extracting the failure message, the template name that failed, and the timestamp.

```yaml
# This steps parses the information to be utlized in the slack notifcation.
- name: parse-info
  serviceAccountName: codefresh-sa
  script:
    image: alpine
    command: [sh]
    source: |
      apk add jq
      echo {{workflow.failures}} | jq -r '.[].message' > /tmp/message.txt
      echo {{workflow.failures}} | jq -r '.[].templateName' > /tmp/templateName.txt
      echo {{workflow.failures}} | jq -r '.[].finishedAt' > /tmp/finishedAt.txt
  outputs:
    parameters:
      - name: message
        valueFrom:
          path: /tmp/message.txt
      - name: templateName
        valueFrom:
          path: /tmp/templateName.txt
      - name: finishedAt
        valueFrom:
          path: /tmp/finishedAt.txt
```

#### Notification Template

This template will run upon exit of the workflow. To make sure this is a failure notification we utilize the `when` parameter as `when: "{{workflow.status}} != Succeeded"`. This will make sure that only Errors / Failures will send the notification.

This template first uses the parsing template of the failure. Then utilize the `send-message` template from `argo-hub.slack.0.0.2`.

```yaml
# After the completion of the entrypoint template, the status of the
# workflow is made available in the global variable {{workflow.status}}.
# {{workflow.status}} will be one of: Succeeded, Failed, Error
# useing slack from https://codefresh.io/argohub/workflow-template/slack
- name: failure-notification
  steps:
    - - name: parse-failure-info
        template: parse-info
        when: "{{workflow.status}} != Succeeded"
    - - name: slack-notification
        templateRef:
          name: argo-hub.slack.0.0.2
          template: send-message
        arguments:
          parameters:
            - name: SLACK_HOOK_URL
              value: <INSERT SLACK URL>
            - name: SLACK_TEXT
              value: "Workflow {{workflow.name}} has {{workflow.status}}. The template {{steps.parse-failure-info.outputs.parameters.templateName}} had the error of {{steps.parse-failure-info.outputs.parameters.message}} at {{steps.parse-failure-info.outputs.parameters.finishedAt}}"
        when: "{{workflow.status}} != Succeeded"
```

## Example

Workflow Failed with Exit Code 1.

![workflow failure](https://raw.githubusercontent.com/codefresh-io/argo-hub//main/examples/failure-notification/assets/workflow.png)

Slack notification that gets sent.

![workflow failure](https://raw.githubusercontent.com/codefresh-io/argo-hub//main/examples/failure-notification/assets/slack.png)
