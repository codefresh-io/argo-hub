# create-pr

## Summary
Creates a commnet on a pull request.

## Inputs/Outputs

### Inputs
#### Parameters
* GITHUB_TOKEN_SECRET (required) - K8s secret name that contains a key with github access token
* GITHUB_TOKEN_SECRET_KEY - The key in the K8s secret that contains the github access token (default is `token`)
* REPO_OWNER (required) - The owner or org that contains the repo
* REPO_NAME (required) - The repo with the pull request
* PR_COMMENT (required) - The comment to post to the pull request.
* PULL_REQUEST_NUMBER (required) - The pull request number at on the repo to comment on
* GH_HOST - hostname to reach github on (default is `github.com`).

### Outputs
no outputs

## Examples

### Create a comment on a pull request
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: create-pr-comment
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: create-pr-comment
        templateRef:
          name: argo-hub.github.0.0.3
          template: create-pr-comment
        arguments:
          parameters:
            - name: REPO_OWNER
              value: 'codefresh-io'
            - name: REPO_NAME
              value: 'argo-hub'
            - name: PR_COMMENT
              value: 'hello from argo workflows!'
            - name: PULL_REQUEST_NUMBER
              value: '4'
            - name: GITHUB_TOKEN_SECRET
              value: 'github-token'
```
