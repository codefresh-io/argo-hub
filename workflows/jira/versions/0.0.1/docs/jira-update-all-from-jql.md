# jira-update-all-from-jql

## Summary
Update all issues on Jira from JQL

## Inputs/Outputs

### Inputs
* ACTION (optional) - Specifies the type of action to perform against your Jira instance - please see the examples and readme
* JIRA_API_KEY (required) - The Kubernetes secret with the jira access key
* JIRA_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon access key. Default is 'api-key'
* JIRA_BASE_URL (required) - Jira base url
* JIRA_USERNAME (required) - The Kubernetes secret with the jira username
* JIRA_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret with the jira username. Default is 'username'
* ISSUE_COMPONENTS (optional) - List of components using comma separated values: backend,database
* ISSUE_DESCRIPTION (optional)- Jira issue description
* ISSUE_TYPE (optional) - Jira issue type: Task, Bug, etc
* JQL_QUERY - Free form query - please see Jira advanced search details
* JQL_QUERY_MAX_RESULTS - Allows you to specify the number of results that can return from a jql query

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: jira-update-all-from-jql-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: update-all-from-jql
                templateref:
                    name: argo-hub.jira.0.0.1
                    template: update-all-from-jql
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
                    -   name: ACTION
                        value: update_all_from_jql_query
                    -   name: ISSUE_DESCRIPTION
                        value: Description inserted from codefresh pipeline
                    -   name: ISSUE_COMPONENTS
                        value: 'step,pov'
                    -   name: ISSUE_TYPE
                        value: Task
                    -   name: JQL_QUERY
                        value: project=SA and summary~"Brandons testing*" and assignee = currentUser()
                    -   name: JQL_QUERY_MAX_RESULTS
                        value: '50'
```
