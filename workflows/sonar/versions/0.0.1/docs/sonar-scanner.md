# sonar-scanner

## Summary
Clones project and invokes scan using Sonarqube, step is not compatible with C/C++/Objective-C projects. Requires sonar-project.properties file with Project Name and Key defined. Documentation - https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

## Inputs/Outputs

### Inputs
* SONAR_HOST_URL - the server URL
* SONAR_LOGIN (required) - The Kubernetes secret with the Sonar login token
* SONAR_LOGIN_SECRET_KEY (optional) - The key in the Kubernetes secret with the Sonar login token. Default is 'token'
* REPO_URL (required) - Git repo to be run containing sonar-project.properties. Key defaults to token.
* GIT_TOKEN (optional) - the k8s secret name that contains a key named token with the git secret inside it

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: sonar-scanner-
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
                    -   name: repo
                        path: /tmp/sonar
            -   name: sonar-scanner
                dependencies: [clone-step]
                templateref:
                    name: argo-hub.sonar.0.0.1
                    template: sonar-scanner
                arguments:
                    parameters:
                    -   name: SONAR_HOST_URL
                        value: 'https://company-name.atlassian.net/'
                    -   name: SONAR_LOGIN
                        value: 'sonar-creds'
                    -   name: SONAR_LOGIN_SECRET_KEY
                        value: 'token'
                    -   name: YOUR_REPO
                        value: '/tmp/sonar/'
```
