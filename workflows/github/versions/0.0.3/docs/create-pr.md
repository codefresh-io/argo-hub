# create-pr

## Summary
Creates a pull request.

## Inputs/Outputs

### Inputs
#### Artifacts
* repo (required) - an artifact that contains the required repository

#### Parameters
* GITHUB_TOKEN_SECRET (required) - K8s secret name that contains a key named `token` with github access token
* BRANCH (required) - branch name
* MESSAGE (required) - pr message
* PR_TEMPLATE (required) - pull request template

### Outputs
no outputs

## Examples

### Create a pull request from a specific branch back to main
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: create-pr
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: create-pr
        templateRef:
          name: argo-hub.github.0.0.3
          template: create-pr
        arguments:
          artifacts:
            - name:
          parameters:
            - name: BRANCH
              value: 'feature/my-branch'
            - name: MESSAGE
              value: 'My new PR'
            - name: PR_TEMPLATE
              value: 'https://raw.githubusercontent.com/codefresh-contrib/express-microservice2/develop/.github/pull_request_template.md'
            - name: GITHUB_TOKEN_SECRET
              value: 'github-token'
```
