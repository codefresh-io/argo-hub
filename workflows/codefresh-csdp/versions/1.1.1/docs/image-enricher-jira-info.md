# image-enricher-jira-info

## Summary
Enrich images with metadata and annotation such as ticket number, title, assignee, status.

## Inputs/Outputs

### Inputs
* IMAGE_NAME (required) - The image URI that was imported into Codefresh to enrich
* JIRA_HOST_URL (required) - jira host, should be without protocol and / in the end.
* JIRA_API_TOKEN_SECRET (required) - Name of Kubernetes secret that contains a jira email and token that you generate in jira
* JIRA_API_TOKEN_SECRET_KEY (required) - The key in the Kubernetes secret with the Jira API token. Default is 'token'
* JIRA_EMAIL_SECRET_KEY (required) - The key in the Kubernetes secret with the Jira Email associated with the API token. Default is 'email'
* JIRA_MESSAGE (required) - message from which you want retrieve issue name, can be a branch, commit message, whatever
* JIRA_PROJECT_PREFIX (required) - jira project prefix like: SAAS, CF, etc
* CF_API_KEY (required) - The Kubernetes secret containing the Codefresh API key created by **runtime**
* CF_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret that has the Codefresh API key created by **runtime**. Default is 'token'
* CF_HOST_URL (optional) - The URL to reach Codefresh (support on-premises Codefresh). Default is 'https://g.codefresh.io'
* JIRA_CONTEXT (optional) - The Jira context to use
* FAIL_ON_NOT_FOUND (optional) - fail in case of ticket not found. Default is 'false'

### Outputs
* `exit-error` – message of the error that caused template failure

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
          name: argo-hub.codefresh-csdp.1.1.1
          template: image-enricher-jira-info
        arguments:
          parameters:
          - name: CF_API_KEY
            value: 'codefresh-token'
          - name: CF_API_KEY_SECRET_KEY
            value: 'token'
          - name: IMAGE_NAME
            value: 'gcr.io/codefresh/cfstep-helm:lastest'
          - name: IMAGE_SHA
            value: 'sha256:b5fd0f2fe40fa240975abc4b1b7bf101d4cadcf296f51af799917bcaa76aeb4f'
          - name: JIRA_PROJECT_PREFIX
            value: 'CR'
          - name: JIRA_MESSAGE
            value: 'working on CR-11027'
          - name: JIRA_HOST_URL
            value: 'https://jira.atlassian.net'
          - name: JIRA_API_TOKEN_SECRET
            value: 'jira-creds'
          - name: JIRA_API_TOKEN_SECRET_KEY
            value: 'token'
          - name: JIRA_EMAIL_SECRET_KEY
            value: 'email'
```
