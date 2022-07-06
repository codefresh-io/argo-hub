# sonar-scanner

## Summary
Clones project and invokes scan using Sonarqube, step is not compatible with C/C++/Objective-C projects. Requires sonar-project.properties file with Project Name, Key and Organization defined. Documentation - https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

## Inputs/Outputs

### Inputs
* SONAR_HOST_URL (required) - the server URL
* SONAR_LOGIN (required) - The Kubernetes secret with the Sonar login token
* SONAR_LOGIN_SECRET_KEY (optional) - The key in the Kubernetes secret with the Sonar login token. Default is 'token'
* REPO_URL (required) - Git repo to be run containing sonar-project.properties. Key defaults to token.
* GIT_TOKEN (optional) - the k8s secret name that contains a key named token with the git secret inside it
* REPO - Use this property when you need analysis to take place in a directory other than the one from which it was launched. E.G. analysis begins from jenkins/jobs/myjob/workspace but the files to be analyzed are in ftpdrop/cobol/project1. The path may be relative or absolute. Specify not the the source directory, but some parent of the source directory. The value specified here becomes the new 'analysis directory', and other paths are then specified as though the analysis were starting from the specified value of sonar.projectBaseDir. Note that the analysis process will need write permissions in this directory; it is where the sonar.working.directory will be created.

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
                    -   name: REPO
                        path: '/tmp/repo'
            -   name: sonar-scanner
                dependencies: [clone-step]
                templateref:
                    name: argo-hub.sonar.0.0.1
                    template: sonar-scanner
                arguments:
                    artifacts:
                    -   name: REPO
                        from: "{{tasks.clone-step.outputs.artifacts.repo}}"
                    parameters:
                    -   name: SONAR_HOST_URL
                        value: 'https://sonarcloud.io'
                    -   name: SONAR_LOGIN
                        value: 'sonar-creds'
                    -   name: REPO
                        value: "{{tasks.clone-step.outputs.artifacts.repo}}"

```