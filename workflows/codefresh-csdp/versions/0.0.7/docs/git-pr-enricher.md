# git-pr-enricher

## Summary
Create git pull request and add a reference to the workflow.

## Inputs/Outputs

### Inputs
* OWNER (required) - The name of repo owner
* REPO (required) - The name of repo you want to create the pull request
* HEAD (required) - The name of the branch where your changes are implemented
* BASE (required) - The name of the branch you want the changes pulled into
* TITLE (optional) - The title of the new pull request

#### Specify one from following required git parameters:
* GITHUB_HOST (optional) - The URL to reach GitHub (support on-premises GitHub host). Default is 'github.com'
* GITHUB_API (optional) - The URL to reach the GitHub API (support on-premises GitHub api).
* GITHUB_API_PATH_PREFIX (optional) - The API prefix path for GitHub (support on-premises GitHub path prefix).
* GITHUB_TOKEN (required) - The Kubernetes secret containing the GitHub token
* GITHUB_TOKEN_SECRET_KEY (optional) - The key in the Kubernetes secret containing the GitHub token. Default is 'token'


### Outputs
Newly create PR url

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: git-pr-enricher-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: git-pr-enricher
        templateRef:
          name: argo-hub.codefresh-csdp.0.0.7
          template: git-pr-enricher
        arguments:
          parameters:
          - name: OWNER
            value: 'codefresh-io'
          - name: REPO
            value: 'api'
          - name: HEAD
            value: 'test'
          - name: BASE
            value: 'main'
          - name: TITLE
            value: 'add new feature'
          - name: GITHUB_TOKEN
            value: 'GITHUB_TOKEN'
```
