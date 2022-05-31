# create-pr

## Summary
Creates a commnet on a pull request.

## Inputs/Outputs

### Inputs
#### Parameters
* GITLAB_TOKEN_SECRET_NAME (required) - K8s secret name that contains a key with gitlab access token
* GITLAB_TOKEN_SECRET_KEY - The key in the K8s secret that contains the gitlab access token (default is `token`)
* REPO_OWNER (required) - The owner or org that contains the repo
* REPO_NAME (required) - The repo with the pull request
* PR_COMMENT (required) - The comment to post to the pull request.
* PULL_REQUEST_NUMBER (required) - The pull request number at on the repo to comment on
* GITLAB_HOST - hostname to reach gitlab on (default is `https://gitlab.com`).

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
          name: argo-hub.gitlab.0.0.1
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
            - name: GITLAB_TOKEN_SECRET_NAME
              value: 'gitlab-token'
```
