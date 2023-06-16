# image-enricher-git-info

## Summary
Enrich images with metadata and annotation such as PR, commits, committers.

## Inputs/Outputs

### Inputs
* IMAGE_NAME (required) - The image name that was imported into Codefresh to enrich
* GIT_PROVIDER (required) - One of the supported git providers: github, gitlab, bitbucket, bitbucket-server, gerrit
* BRANCH (required with github, gitlab, bitbucket, bitbucket-server) - The git branch to use to enrich
* REPO (required) - The repo to use to enrich
* REVISION - The commit sha to use to enrich
* GERRIT_CHANGE_ID (required with gerrit) - The change-id or a commit message that contain the change-id
* CF_API_KEY (required) - The Kubernetes secret containing the Codefresh API key created by **runtime**
* CF_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret that has the Codefresh API key created by **runtime**. Default is 'token'
* CF_HOST_URL (optional) - The URL to reach Codefresh (support on-premises Codefresh). Default is 'https://g.codefresh.io'
* GITHUB_API_HOST_URL (optional) - The URL to reach the GitHub API (support on-premises GitHub api). Default is 'https://api.github.com'
* GITHUB_API_PATH_PREFIX (optional) - The API prefix path for GitHub (support on-premises GitHub path prefix).
* GITHUB_TOKEN_SECRET_NAME (optional) - The Kubernetes secret containing the GitHub token
* GITHUB_TOKEN_SECRET_KEY (optional) - The key in the Kubernetes secret containing the GitHub token. Default is 'token'
* GITHUB_CONTEXT (optional) - The name of the github context from classic codefresh platform
* GITLAB_HOST_URL (optional) - The URL to reach the GitLab API (support on-premises GitLab api). Default is 'https://gitlab.com'
* GITLAB_TOKEN_SECRET_NAME (optional) - The Kubernetes secret containing the GitLab token
* GITLAB_TOKEN_SECRET_KEY (optional) - The key in the Kubernetes secret containing the GitLab token. Default is 'token'
* BITBUCKET_HOST_URL (optional) - The URL to reach the BitBucket API (support on-premises BitBucket api). Default is 'https://api.bitbucket.org/2.0'
* BITBUCKET_SECRET_NAME (optional) - The Kubernetes secret containing the BitBucket credentials
* BITBUCKET_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret containing the BitBucket username. Default is 'username'
* BITBUCKET_PASSWORD_SECRET_KEY (optional) - The key in the Kubernetes secret containing the BitBucket password. Default is 'password'
* GERRIT_HOST_URL (optional) - The URL to reach the Gerrit API
* GERRIT_SECRET_NAME (optional) - The Kubernetes secret containing the Gerrit credentials
* GERRIT_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret containing the Gerrit username. Default is 'username'
* GERRIT_PASSWORD_SECRET_KEY (optional) - The key in the Kubernetes secret containing the Gerrit password. Default is 'password'

### Outputs
* `exit-error` – message of the error that caused template failure

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
          name: argo-hub.codefresh-csdp.1.1.10
          template: image-enricher-git-info
        arguments:
          parameters:
          - name: CF_API_KEY
            value: 'codefresh-token'
          - name: CF_API_KEY_SECRET_KEY
            value: 'token'
          - name: IMAGE_NAME
            value: 'gcr.io/codefresh/cfstep-helm:lastest'
          - name: GIT_PROVIDER
            value: 'github'
          - name: REPO
            value: 'codefresh/cfstep-helm'
          - name: BRANCH
            value: 'main'
          - name: REVISION
            value: 'ec8cdced58869a9cbd315a1297a702bbd744a9ed'
          - name: GITHUB_TOKEN_SECRET_NAME
            value: 'github-creds'
          - name: GITHUB_TOKEN_SECRET_KEY
            value: 'token'
```
