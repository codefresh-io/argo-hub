# jira-sonar-template

## Summary
This Workflow Template is used to create a CICD pipeline that clones both a source repository and deployment repository, builds an image, runs tests, scans and upgrades the image, and conduct a canary rollout all while creating and updating a jira during each step. 

## Inputs/Outputs

### Inputs
* DOCKER_CONFIG_SECRET (required) - The k8s secret name from type docker-registry with all registries credentials you need to pull from or push to. defaults secret name `docker-config` . https://codefresh.io/csdp-docs/docs/getting-started/quick-start/create-ci-pipeline/#create-docker-registry-secret
* REPO_URL (required) - The repository you want to clone that holds the source code (for example: https://github.com/codefresh-io/cli-v2)
* GIT_TOKEN_SECRET (required) - The k8s secret name that holds the secret to your git token
* GITHUB_TOKEN_SECRET_KEY (optional) - The k8s secret key that holds the secret to your git token. Default is 'token'
* DEPLOYMENT_URL (required) - The repository you want to clone that holds deployment files (for example: https://github.com/codefresh-io/cli-v2)
* JIRA_API_KEY (required) - The Kubernetes secret with the jira access key
* JIRA_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon access key. Default is 'api-key'
* JIRA_BASE_URL (required) - Jira base url
* JIRA_USERNAME (required) - The Kubernetes secret with the jira username
* JIRA_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret with the jira username. Default is 'username'
* JIRA_ISSUE_SOURCE_FIELD (optional) - Jira issue ID or key source field
* ISSUE_COMPONENTS (optional) - List of components using comma separated values: backend,database
* ISSUE_CUSTOMFIELDS (optional) - Custom fields to pass to JIRA Issue Creation. Key=Value format.
* ISSUE_DESCRIPTION (optional)- Jira issue description
* ISSUE_PROJECT (optional) - Jira project key: necessary for issue creation
* ISSUE_SUMMARY (optional) - Jira issue summary (main title)
* ISSUE_TYPE (optional) - Jira issue type: Task, Bug, etc
* COMMENT_BODY (optional) - Text to add to the comment
* VERBOSE (optional) - Enable verbose logging by setting to true
* REVISION (optional) - the revision to checkout. defaults to main
* IMAGE_NAME (required) - The image name to give to the built image
* DOCKERFILE (optional) - The path to your dockerfile. defaults to Dockerfile
* CONTEXT (optional) - the context of file system that will be passed. defaults to .
* TAG (optional) - The tag that will be given to the image. defaults to latest
* CF_API_KEY (required) - The Kubernetes secret containing the Codefresh API key created by runtime
* CF_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret that has the Codefresh API key created by runtime. Default is 'token'
* IMAGE_SHA (required) - The image sha that was imported into Codefresh to enrich
* GIT_PROVIDER (required) - One of the supported git providers: github, gitlab, bitbucket, bitbucket-server
* SONAR_HOST_URL (required) - the server URL
* SONAR_LOGIN (required) - The Kubernetes secret with the Sonar login token
* SONAR_LOGIN_SECRET_KEY (optional) - The key in the Kubernetes secret with the Sonar login token. Default is 'token'
* value-to-promote (required) - New value to apply to the target environment.
* env (required) - Replaces [[ENV]] in destination paths.
* svc-name-list (required) - Space-separated list of microservices to promote. Each one replaces [[SVC_NAME]] in paths.
* file-path-pattern (required) - Path to the source/destination YAML file.
* promotion-type (required) - Must be one of: kustomize-image, helm-value, helm-dependency, yaml-key
* kust-image-pattern (optional) - For kustomize-image - name of the image transformer to copy from source to dest. Default is [[SVC_NAME]]

### Volumes 
* docker-config - in order for this template to work a volume named `docker-config` must exist with DOCKER_CONFIG_SECRET name.
```
  volumes:
    - name: docker-config
      secret:
        items:
          - key: .dockerconfigjson
            path: config.json
        secretName: '{{ inputs.parameters.DOCKER_CONFIG_SECRET }}'
```

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: workflow-template-jira-scan-
spec:
  entrypoint: main
  volumes:
  - name: docker-config
    secret:
      items:
      - key: .dockerconfigjson
        path: config.json
      secretName: '{{ inputs.parameters.DOCKER_CONFIG_SECRET}}'
  templates:
  - name: main
    dag:
      tasks:
      - name: workflow-template
        templateRef:
          name: argo-hub.jira-sonar-template.0.0.1
          template: main
        arguments:
          parameters:
          - name: DOCKER_CONFIG_SECRET
            value: 'docker-config'
          - name: REPO_URL
            value: 'https://github.com/codefresh-io/cli-v2'
          - name: GIT_TOKEN_SECRET
            value: 'git-secret'
          - name: GITHUB_TOKEN_SECRET_KEY
            value: 'token'
          - name: DEPLOYMENT_URL
            value: 'https://github.com/codefresh-io/cli-v2'
          - name: JIRA_BASE_URL
            value: 'https://company-name.atlassian.net/'
          - name: JIRA_USERNAME
            value: 'jira-creds'
          - name: JIRA_USERNAME_SECRET_KEY
            value: 'username'
          - name: JIRA_API_KEY
            value: 'jira-creds'
          - name: JIRA_API_KEY_SECRET_KEY
            value: 'api-key'
          - name: ISSUE_PROJECT
            value: SA
          - name: ISSUE_SUMMARY
            value: Brandons test 4
          - name: ISSUE_DESCRIPTION
            value: Description inserted from codefresh pipeline
          - name: ISSUE_TYPE
            value: Task
          - name: IMAGE_NAME
            value: 'codefresh/argo-hub'
          - name: CF_API_KEY
            value: 'codefresh-token'
          - name: CF_API_KEY_SECRET_KEY
            value: 'token'
          - name: IMAGE_SHA
            value: 'sha256:cbe433136120cea1f146cf1b7f72e77fa763ff0c18b10ef605c1fc5c3d5fbec'
          - name: GIT_PROVIDER
            value: 'github'
          - name: SONAR_HOST_URL
            value: 'https://sonarcloud.io'
          - name: SONAR_LOGIN
            value: 'sonar-creds'
          - name: SONAR_LOGIN_SECRET_KEY
            value: 'sonarkey'
          - name: COMMENT_BODY
            value: 'workflow working'
          - name: value-to-promote
            value: aaaa1111
          - name: env
            value: dev
          - name: svc-name-list
            value: "example-image"
          - name: file-path-pattern
            value: "kustomize/example-app/overlays/[[ENV]]/kustomization.yaml"
          - name: promotion-type
            value: kustomize-image
          - name: kust-image-pattern
            value: "[[SVC_NAME]]"
```