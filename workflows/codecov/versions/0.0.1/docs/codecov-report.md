# codecov-report

## Summary
Sends a code scan report to codecov

## Inputs/Outputs

### Inputs
* CODECOV_API_KEY (required) - The Kubernetes secret with the Codecov login token
* CODECOV_API_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Codecov login token. Default is 'token'
* CODECOV_URL (required) - URL to codecov
* WORKING_DIRECTORY (optional) - Path to working directory within cloned repository. Default is '.'.
* OS (optional) - OS being used ( alpine | linux | macos | windows ). Default is linux.
* REPO_URL (required) - Git repo to be run containing sonar-project.properties. Key defaults to token.
* GIT_TOKEN (optional) - the k8s secret name that contains a key named token with the git secret inside it
* REPO (required) - Path to artifact where repository is to be cloned.

### Secrets
* Codecov Secret - in order for this template to work a secret named `codecov-secret` must exist with codecov token.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: codecov-secret
    type: Opaque
    data:
        token: echo -n 'codecov api key' | base64
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

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: codecov-report-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: clone-step
                templateRef:
                    name: argo-hub.git.0.0.2
                    template: clone
                arguments:
                    parameters:
                    -   name: REPO_URL
                        value: 'https://github.com/codefresh-io/argo-hub'
                    -   name: GIT_TOKEN_SECRET
                        value: 'git-token-name'
                outputs:
                    artifacts:
                    -   name: REPO
                        path: '/tmp/repo'
            -   name: codecov-report
                depends: clone-step
                templateRef:
                    name: argo-hub.codecov.0.0.1
                    template: codecov-report
                arguments:
                    artifacts:
                    -   name: REPO
                        from: "{{tasks.clone-step.outputs.artifacts.repo}}"
                    parameters:
                    -   name: CODECOV_API_KEY
                        value: codecov-secret
                    -   name: CODECOV_API_KEY_SECRET_KEY
                        value: token
                    -   name: CODECOV_URL
                        value: https://my-hosted-codecov.com
```
