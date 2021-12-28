# image-enricher-git-info

## Summary
Enrich images with metadata and annotation such as PR, commits, committers.

## Inputs/Outputs

### Inputs
* IMAGE (required) - image sha
* BRANCH (required) - git branch
* REPO (required) - git repo
* CF_API_KEY (required) - Codefresh API key
* CF_URL (optional) - support on-premises Codefresh URL
* GITHUB_HOST (optional) - support on-premises github host, by default github.com
* GITHUB_API (optional) - support on-premises github host api
* API_PATH_PREFIX (optional) - support on-premises github path prefix
* GITHUB_TOKEN (optional) - github token

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
          name: argo-hub.codefresh-csdp.0.0.3
          template: image-enricher-git-info
        arguments:
          parameters:
          - name: IMAGE
            value: 'gcr.io/codefresh/cfstep-helm:lastest'
          - name: BRANCH
            value: 'main'
          - name: REPO
            value: 'codefresh/cfstep-helm'
          - name: CF_API_KEY
            value: 'CODEFRESH_API_KEY'
          - name: GITHUB_TOKEN
            value: 'GITHUB_TOKEN'                             
```
