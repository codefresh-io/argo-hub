# send-message

## Summary
Enrich codefresh image with PRs and Issues info

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
* GIT_PROVIDER_NAME (optional) - name of git provider to use from Codefresh integrations screen

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: image-enricher-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: image-enricher
        templateRef:
          name: argo-hub.image-enricher.0.0.1
          template: image-enricher
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
