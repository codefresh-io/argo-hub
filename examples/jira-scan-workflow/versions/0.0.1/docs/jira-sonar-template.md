# jira-sonar-template

## Summary
This Workflow Template is used to create a CICD pipeline that clones both a source repository and deployment repository, builds an image, runs tests, scans and upgrades the image, and conduct a canary rollout all while creating and updating a jira during each step. 

## Inputs/Outputs

### Inputs
* REPO_URL (required) - The repository you want to clone that holds the source code (for example: https://github.com/codefresh-io/cli-v2)
* DEPLOYMENT_URL (required) - The repository you want to clone that holds deployment files (for example: https://github.com/codefresh-io/cli-v2)
* JIRA_BASE_URL (required) - Jira base url
* ISSUE_PROJECT (optional) - Jira project key: necessary for issue creation
* ISSUE_SUMMARY (optional) - Jira issue summary (main title)
* IMAGE_NAME (required) - The image name to give to the built image
* value-to-promote (required) - New value to apply to the target environment.
* env (required) - Replaces [[ENV]] in destination paths.
* svc-name-list (required) - Space-separated list of microservices to promote. Each one replaces [[SVC_NAME]] in paths.
* file-path-pattern (required) - Path to the source/destination YAML file.

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

### Secrets
* Github Secret - in order for this template to work a secret named `github-token` must exist with a github token.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: github-token
    type: Opaque
    data:
        token: echo -n 'github token' | base64
```

* Jira Secret - in order for this template to work a secret named `jira-secret` must exist with a jira login credentials.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: jira-secret
    type: Opaque
    data:
        jira-username: echo -n 'jira username' | base64
        jira-api: echo -n 'jira api ' | base64
```

* CF Secret - in order for this template to work a secret named `cf-secret` must exist with a codefresh login credentials.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: cf-secret
    type: Opaque
    data:
        token: echo -n 'cf token' | base64
```

* Sonar Secret - in order for this template to work a secret named `sonar-secret` must exist with a codefresh login credentials.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: sonar-secret
    type: Opaque
    data:
        token: echo -n 'sonar token' | base64
```

* Docker Secret - in order for this template to work a secret named `docker-secret` must exist with a docker login credentials.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: docker-secret
    type: Opaque
    data:
        username: echo -n 'docker username' | base64
        password: echo -n 'docker password' | base64
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
      secretName: 'docker-config'
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
          - name: REPO_URL
            value: 'https://github.com/codefresh-io/cli-v2'
          - name: DEPLOYMENT_URL
            value: 'https://github.com/codefresh-io/cli-v2'
          - name: JIRA_BASE_URL
            value: 'https://company-name.atlassian.net/'
          - name: ISSUE_PROJECT
            value: SA
          - name: ISSUE_SUMMARY
            value: Brandons test 4
          - name: IMAGE_NAME
            value: 'codefresh/argo-hub'
          - name: value-to-promote
            value: aaaa1111
          - name: env
            value: dev
          - name: svc-name-list
            value: "example-image"
          - name: file-path-pattern
            value: "kustomize/example-app/overlays/[[ENV]]/kustomization.yaml"
```