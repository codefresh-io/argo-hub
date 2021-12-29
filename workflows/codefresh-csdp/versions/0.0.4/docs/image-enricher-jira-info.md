# image-enricher-jira-info

## Summary
Enrich images with metadata and annotation such as ticket number, title, assignee, status.

## Inputs/Outputs

### Inputs
* IMAGE (required) - your image to which you want assign issues
* JIRA_HOST (required) - jira host, should be without protocol and / in the end
* JIRA_API_TOKEN_SECRET (required) - name of secret that contains a jira email and token that you generate in jira
* JIRA_PROJECT_PREFIX (required) - jira project prefix like: SAAS, CF, etc
* CF_API_KEY (required) - Codefresh API key
* MESSAGE (required) - message from which you want retrieve issue name, can be a branch, commit message, whatever
* CF_URL (optional) - support on-premises Codefresh URL
* FAIL_ON_NOT_FOUND (optional) - fail in case of ticket not found

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: image-enricher-jira-info-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: image-enricher-jira-info
        templateRef:
          name: argo-hub.codefresh-csdp.0.0.4
          template: image-enricher-jira-info
        arguments:
          parameters:
          - name: IMAGE
            value: 'gcr.io/codefresh/cfstep-helm:lastest'
          - name: JIRA_PROJECT_PREFIX
            value: 'JR'
          - name: MESSAGE
            value: 'JR-1234'
          - name: JIRA_HOST
            value: 'jira.atlassian.net'
          - name: JIRA_API_TOKEN_SECRET
            value: 'jira-credentials' 
          - name: CF_API_KEY
            value: 'CODEFRESH_API_KEY'                            
```
