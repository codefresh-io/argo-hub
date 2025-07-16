# update-comment

## Summary
Update comment on Jira

## Inputs/Outputs

### Inputs
* COMMENT_BODY (optional) - Text to add to the comment
* JIRA_API_KEY (required) - The Kubernetes secret with the jira access key
* JIRA_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon access key. Default is 'api-key'
* JIRA_BASE_URL (required) - Jira base url
* JIRA_ISSUE_SOURCE_FIELD (optional) - Jira issue ID or key source field
* JIRA_USERNAME (required) - The Kubernetes secret with the jira username
* JIRA_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret with the jira username. Default is 'username'
* JIRA_COMMENT_ID (required) - Jira comment ID to update a comment


### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: jira-update-comment-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: update-comment
                templateref:
                    name: argo-hub.jira.0.0.2
                    template: update-comment
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
                    -   name: COMMENT_BODY
                        value: New Updating from codefresh pipeline
                    -   name: JIRA_COMMENT_ID
                        value: '33455'
```
