# ci simple

## Summary
This CI pipeline builds a docker image using Kaniko, uploads image metadata to CSDP, and tests the image


## Inputs/Outputs

#### Parameters
* GIT_REPO_URL (required) - the repository you want to clone (for example: https://github.com/codefresh-io/cli-v2)
* IMAGE_NAME (required) - The image name to give to the built image
* IMAGE_TAG (optional) - The tag that will be given to the image. defaults to `latest`
* GIT_REVISION (optional) - the revision to checkout. defaults to `main`
* GIT_BRANCH (optional) - the git branch for reporting the image. defaults to `main`
* GIT_COMMIT_URL (optional) - git commit url. defaults to `''`
* GIT_COMMIT_MESSAGE (optional) - git commit message. defaults to `''`
* DOCKERFILE (optional) - The path to your dockerfile. defaults to `Dockerfile`
* GIT_TOKEN_SECRET (required) - The k8s secret name that contains a key named `token` with the git secret inside it. defaults secret name `github-token` . https://codefresh.io/csdp-docs/docs/getting-started/quick-start/create-ci-pipeline/#create-a-personal-access-token-pat
* CONTEXT (optional) - the context of file system that will be passed. defaults to `.`
* REGISTRY_CREDS (required) - The Kubernetes secret with the standard registry username, password and domain. defaults secret name `registry-creds` . https://codefresh.io/csdp-docs/docs/getting-started/quick-start/create-ci-pipeline/#create-registry-creds-secret
* DOCKER_CONFIG (required) - The k8s secret name from type docker-registry with all registries credentials you need to pull from or push to. defaults secret name `docker-config` . https://codefresh.io/csdp-docs/docs/getting-started/quick-start/create-ci-pipeline/#create-docker-registry-secret

#### Volumes 
* docker-config - in order for this template to work a volume named `docker-config` must exist with DOCKER_CONFIG secret name.
```
  volumes:
    - name: docker-config
      secret:
        items:
          - key: .dockerconfigjson
            path: config.json
        secretName: '{{ inputs.parameters.DOCKER_REGISTRY }}'
```
  
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
          template: ci-tasks
        arguments:
          parameters:
          - name: GIT_REPO_URL
            value: 'https://github.com/codefresh-io/cli-v2'
          - name: IMAGE_URI
            value: 'quay.io/codefresh/cli-v2'
          - name: IMAGE_TAG
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
