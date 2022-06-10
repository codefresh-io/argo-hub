# jira-issue-verify-status

## Summary
Verify Issue Status on Single Issue

## Inputs/Outputs

### Inputs
* ACTION (optional) - Specifies the type of action to perform against your Jira instance - please see the examples and readme
* JIRA_API_KEY (required) - The Kubernetes secret with the jira access key
* JIRA_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon access key. Default is 'api-key'
* JIRA_BASE_URL (required) - Jira base url
* JIRA_USERNAME (required) - The Kubernetes secret with the jira username
* JIRA_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret with the jira username. Default is 'username'
* JIRA_ISSUE_SOURCE_FIELD (optional) - Jira issue ID or key source field
* DESIRED_ISSUE_STATUS - Desired state of jira issue: Approved, Backlog

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: jira-issue-verify-status-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: issue-verify-status
                templateref:
                    name: argo-hub.jira.0.0.1
                    template: issue-verify-status
                arguments:
                    parameters:
                    -   name: JIRA_BASE_URL
                        value: 'https://company-name.atlassian.net/'
                    -   name: JIRA_USERNAME
                        value: 'jira-creds'
                    -   name: JIRA_USERNAME_SECRET_KEY
                        value: 'username'
                    -   name: JIRA_API_KEY
                        value: 'jira-creds'
                    -   name: JIRA_API_KEY_SECRET_KEY
                        value: 'api-key'
                    -   name: JIRA_ISSUE_SOURCE_FIELD
                        value: Jira issue ID or key source field
                    -   name: ACTION
                        value: verify_status
                    -   name: DESIRED_ISSUE_STATUS
                        value: Blocked
```
