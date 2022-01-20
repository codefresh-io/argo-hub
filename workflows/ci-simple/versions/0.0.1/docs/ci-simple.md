# ci simple

## Summary
This CI pipeline builds a docker image using Kaniko, uploads image metadata to CSDP, and tests the image


## Inputs/Outputs

#### Parameters
* REPO (required) - the repository you want to clone (for example: https://github.com/codefresh-io/cli-v2)
* IMAGE_NAME (required) - The image name to give to the built image
* TAG (optional) - The tag that will be given to the image. defaults to `latest`
* GIT_REVISION (optional) - the revision to checkout. defaults to `main`
* GIT_BRANCH (optional) - the git branch for reporting the image. defaults to `main`
* GIT_COMMIT_URL (optional) - git commit url. defaults to ``
* GIT_COMMIT_MESSAGE (optional) - git commit message. defaults to ``
* DOCKERFILE (optional) - The path to your dockerfile. defaults to `Dockerfile`
* GIT_TOKEN_SECRET (required) - the k8s secret name that contains a key named `token` with the git secret inside it. defaults secret name `github-token` . https://github.com/eti-codefresh/quickstart_resources/blob/add491550d4a652fc62780173ce4fc9bfba24e58/github-token.secret.example.yaml
* CONTEXT (optional) - the context of file system that will be passed. defaults to `.`
* REGISTRY_CREDS (required) - The Kubernetes secret with the standard registry username, password and domain. defaults secret name `registry-creds` https://github.com/eti-codefresh/quickstart_resources/blob/add491550d4a652fc62780173ce4fc9bfba24e58/registry-creds.secret.example.yaml

#### Volumes
* docker-config - in order for this template to work a volume named `docker-config` must exist with all registries credentials you need to pull from or push to
  https://jamesdefabia.github.io/docs/user-guide/kubectl/kubectl_create_secret_docker-registry/
  
### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: ci-simple-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: ci-simple
        templateRef:
          name: argo-hub.ci-simple.0.0.1
          template: ci-steps
        arguments:
          parameters:
          - name: REPO
            value: 'https://github.com/codefresh-io/cli-v2'
          - name: IMAGE_URI
            value: 'quay.io/codefresh/cli-v2'
          - name: TAG
            value: '1.8.0'
          - name: GIT_REVISION
            value: 'main'
          - name: GIT_BRANCH
            value: 'main'
          - name: GIT_COMMIT_URL
            value: 'https://github.com/test/project/commit/a1bc234d56e78f9a0b12c34d5ef67fba89d01ea2'
          - name: GIT_COMMIT_MESSAGE
            value: "Merge branch 'test'"
          - name: GIT_TOKEN_SECRET
            value: 'git-token'
          - name: REGISTRY_CREDS
            value: 'registry-creds'
```
