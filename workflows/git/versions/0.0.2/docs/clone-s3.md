# clone-s3

## Summary
Clone a repository and push it as artifact to s3 for future use

## Inputs/Outputs

### Inputs
#### Parameters
* REPO (required) - the repository you want to clone (for example: https://github.com/codefresh-io/argo-hub)
* REVISION (optional) - the revision to checkout. defaults to `main`
* GIT_TOKEN_SECRET (required) - the k8s secret name that contains a key named `token` with the git secret inside it
* KEY (optional) - the key to which the artifact will be pushed. defaults to `{{ workflow.name }}/git-repo`

### Outputs
#### Artifacts
* repo - will contain the cloned repository and pushed to s3

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: git-clone-s3
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: clone
        templateRef:
          name: argo-hub.git.0.0.2
          template: clone-s3
        arguments:
          parameters:
          - name: REPO
            value: 'https://github.com/codefresh-io/argo-hub'
          - name: GIT_TOKEN_SECRET
            value: 'git-token'
```
