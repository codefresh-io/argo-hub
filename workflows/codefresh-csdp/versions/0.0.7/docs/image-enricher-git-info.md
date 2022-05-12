# image-enricher-git-info

## Summary
Enrich images with metadata and annotation such as PR, commits, committers.

## Inputs/Outputs

### Inputs
* IMAGE_NAME (required) - The image name that was imported into Codefresh to enrich
* IMAGE_SHA (required) - The image sha that was imported into Codefresh to enrich
* GIT_PROVIDER (required) - One of the supported git providers: github
* BRANCH (required) - The git branch to use to enrich
* REPO (required) - The repo to use to enrich
* CF_API_KEY (required) - The Kubernetes secret containing the Codefresh API key
* CF_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret that has the Codefresh API Key. Default is 'token'
* CF_HOST_URL (optional) - The URL to reach Codefresh (support on-premises Codefresh). Default is 'https://g.codefresh.io'
* GITHUB_API_HOST_URL (optional) - The URL to reach the GitHub API (support on-premises GitHub api). Default is 'https://api.github.com'
* GITHUB_API_PATH_PREFIX (optional) - The API prefix path for GitHub (support on-premises GitHub path prefix).
* GITHUB_TOKEN (optional) - The Kubernetes secret containing the GitHub token
* GITHUB_TOKEN_SECRET_KEY (optional) - The key in the Kubernetes secret containing the GitHub token. Default is 'token'
* GITHUB_CONTEXT (optional) - The name of the github context from classic codefresh platform


### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: image-enricher-git-info-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: image-enricher-git-info
        templateRef:
          name: argo-hub.codefresh-csdp.0.0.7
          template: image-enricher-git-info
        arguments:
          parameters:
          - name: GIT_PROVIDER
            value: 'github'
          - name: IMAGE_NAME
            value: 'gcr.io/codefresh/cfstep-helm:lastest'
          - name: IMAGE_SHA
            value: 'sha256:cbe433136120cea1f146cf1b7f72e77fa763ff0c18b10ef605c1fc5c3d5fbec'
          - name: BRANCH
            value: 'main'
          - name: REPO
            value: 'codefresh/cfstep-helm'
          - name: CF_API_KEY
            value: 'CODEFRESH_API_KEY'
          - name: GITHUB_TOKEN
            value: 'GITHUB_TOKEN'
```
