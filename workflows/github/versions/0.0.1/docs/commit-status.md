# commit-status

## Summary
Reports a commit status check.

## Inputs/Outputs

### Inputs
GITHUB_TOKEN_SECRET (required) - K8s secret name that contains a key named `token` with github access token
BUILD_BASE_URL (required) - Your argo workflow exposed instance url
REPO_OWNER (required) - Repository Owner
REPO_NAME (required) - Repository Name
REVISION (required) - commit sha
STATE (required) - one of the possible states
CONTEXT (required) - context to report
DESCRIPTION (required) - general description

### Outputs
no outputs

## Examples

### Report commit status at the beginning and end of a workflow
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: github-commit-status-
spec:
  entrypoint: main
  onExit: exit-handler
  templates:
    - name: main
      dag:
        tasks:
        - name: report-commit-status-start
          templateRef:
            name: codefresh-marketplace.github.0.0.1
            template: commit-status
          arguments:
            parameters:
            - name: BUILD_BASE_URL
              value: 'http://your.argo-workflow'
            - name: REPO_OWNER
              value: 'codefresh-io'
            - name: REPO_NAME
              value: 'argo-hub'
            - name: REVISION
              value: 'sha'
            - name: STATE
              value: 'pending'
            - name: CONTEXT
              value: 'name'
            - name: DESCRIPTION
              value: 'Workflow is running'
            - name: GITHUB_TOKEN_SECRET
              value: 'github-token'

    - name: exit-handler
        steps:
          - - name: report-commits-status-failure
              when: '{{workflow.status}} =~ "Failed|Error"'
              templateRef:
                name: codefresh-marketplace.github.0.0.1
                template: commit-status
              arguments:
                parameters:
                  - name: BUILD_BASE_URL
                    value: 'http://your.argo-workflow'
                  - name: REPO_OWNER
                    value: 'codefresh-io'
                  - name: REPO_NAME
                    value: 'argo-hub'
                  - name: REVISION
                    value: 'sha'
                  - name: STATE
                    value: 'failure'
                  - name: CONTEXT
                    value: 'name'
                  - name: DESCRIPTION
                    value: 'Workflow failed'
                  - name: GITHUB_TOKEN_SECRET
                    value: 'github-token'
    
          - - name: report-commits-status-success
              when: '{{workflow.status}} == Succeeded'
              templateRef:
                name: codefresh-marketplace.github.0.0.1
                template: commit-status
              arguments:
                parameters:
                  - name: BUILD_BASE_URL
                    value: 'http://your.argo-workflow'
                  - name: REPO_OWNER
                    value: 'codefresh-io'
                  - name: REPO_NAME
                    value: 'argo-hub'
                  - name: REVISION
                    value: 'sha'
                  - name: STATE
                    value: 'success'
                  - name: CONTEXT
                    value: 'name'
                  - name: DESCRIPTION
                    value: 'Workflow succeeded'
                  - name: GITHUB_TOKEN_SECRET
                    value: 'github-token'
```
