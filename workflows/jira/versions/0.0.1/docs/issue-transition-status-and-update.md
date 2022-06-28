# issue-transition-status-and-update

## Summary
Transition the Issue status and update a single item

## Inputs/Outputs

### Inputs
* JIRA_API_KEY (required) - The Kubernetes secret with the jira access key
* JIRA_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon access key. Default is 'api-key'
* JIRA_BASE_URL (required) - Jira base url
* JIRA_USERNAME (required) - The Kubernetes secret with the jira username
* JIRA_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret with the jira username. Default is 'username'
* JIRA_ISSUE_SOURCE_FIELD (optional) - Jira issue ID or key source field
* DESIRED_ISSUE_STATUS - Desired state of jira issue: Approved, Backlog
* VERBOSE - Enable verbose logging by setting to true
* ISSUE_DESCRIPTION - Jira issue description

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: jira-issue-transition-status-and-update-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: issue-transition-status-and-update
                templateref:
                    name: argo-hub.jira.0.0.1
                    template: issue-transition-status-and-update
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
                    -   name: DESIRED_ISSUE_STATUS
                        value: Blocked
                    -   name: VERBOSE
                        value: true
                    -   name: ISSUE_DESCRIPTION
                        value: Updated while transitioning status
```
