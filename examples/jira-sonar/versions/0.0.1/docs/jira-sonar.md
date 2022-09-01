# jira-sonar

## Summary
This Workflow Template is used to create a CICD pipeline that clones both a source repository and deployment repository, builds an image, runs tests, scans and upgrades the image, and conduct a canary rollout all while creating and updating a jira during each step.

## Inputs/Outputs

### Inputs
* REPO_URL (required) - The github repository you want to clone that holds the source code (for example: https://github.com/codefresh-io/cli-v2)
* DEPLOYMENT_URL (required) - The github repository you want to clone that holds deployment files (for example: https://github.com/codefresh-io/cli-v2)
* JIRA_BASE_URL (required) - Jira base url
* ISSUE_PROJECT (required)- Jira project key: necessary for issue creation
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
* Jira Secret - in order for this template to work a secret named `jira-secret` must exist with jira login information.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: jira-token
    type: Opaque
    data:
        token: echo -n 'jira api key' | base64
        email: echo -n 'jira email' | base64
```

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

* Sonar Secret - in order for this template to work a secret named `sonar-secret` must exist with login information to sonarcloud.io.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: sonar-secret
    type: Opaque
    data:
        token: echo -n 'sonar token' | base64
```

* Codefresh Secret - in order for this template to work a secret named `cf-secret` must exist.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: cf-secret
    type: Opaque
    data:
        token: echo -n 'cf api key' | base64
```

* Docker Secret - in order for this template to work a secret named `cf-secret` must exist with login information about docker.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: dockerhub-creds
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
  generateName: jira-sonar-
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
          name: argo-hub.jira-sonar.0.0.1
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
