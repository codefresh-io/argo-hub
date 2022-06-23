# jira-create-issue

## Summary
Create issue on Jira

## Inputs/Outputs

### Inputs
* JIRA_API_KEY (required) - The Kubernetes secret with the jira access key
* JIRA_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the jira api access key. Default is 'api-key'
* JIRA_BASE_URL (required) - Jira base url
* JIRA_USERNAME (required) - The Kubernetes secret with the jira username
* JIRA_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret with the jira username. Default is 'username'
* ISSUE_COMPONENTS (optional) - List of components using comma separated values: backend,database
* ISSUE_CUSTOMFIELDS (optional) - Custom fields to pass to JIRA Issue Creation. Key=Value format.
* ISSUE_DESCRIPTION (optional)- Jira issue description
* ISSUE_PROJECT (optional) - Jira project key: necessary for issue creation
* ISSUE_SUMMARY (optional) - Jira issue summary (main title)
* ISSUE_TYPE (optional) - Jira issue type: Task, Bug, etc

### Outputs
* JIRA_ISSUE_SOURCE_FIELD - Jira issue ID or key source field

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: jira-create-issue-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: create-issue
                templateref:
                    name: argo-hub.jira.0.0.1
                    template: create-issue
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
                    -   name: ISSUE_PROJECT
                        value: SA
                    -   name: ISSUE_SUMMARY
                        value: Brandons test 4
                    -   name: ISSUE_DESCRIPTION
                        value: Description inserted from codefresh pipeline
                    -   name: ISSUE_COMPONENTS
                        value: 'step,pov'
                    -   name: ISSUE_CUSTOMFIELDS
                        values:
                        -   MY FIELD1=MYVALUE1
                        -   customfield_10067=MYVALUE2
                    -   name: ISSUE_TYPE
                        value: Task
```
