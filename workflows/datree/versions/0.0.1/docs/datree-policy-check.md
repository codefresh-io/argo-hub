# datree-policy-check

## Summary
Run a policy check on a cloned repository with Datree

## Inputs/Outputs

### Inputs
* CLI_ARGUMENTS (optional) - Datree CLI arguments as specified here: https://hub.datree.io/setup/cli-arguments#flags
* DATREE_TOKEN (required) - the k8s secret name that contains a key named token with the datree secret inside it
* HELM_ARGUMENTS (optional) - The Helm arguments to be used, if the path is a Helm chart
* INPUT_PATH (required) - File/s to be tested
* IS_HELM_CHART (optional) - Is the desired path a Helm chart?
* IS_KUSTOMIZATION (optional) - Is the desired path a Kustomization?
* KUSTOMIZE_ARGUMENTS (optional) - The Kustomize arguments to be used, if the path is a Kustomization
* WORKING_DIRECTORY (optional) - The working directory inside the cloned git repo that holds the files to be run against datree's policy check.
* REPO_URL (required) - Git repo to be run containing sonar-project.properties. Key defaults to token.
* GIT_TOKEN (optional) - the k8s secret name that contains a key named token with the git secret inside it
* REPO (required) - Use this property when you need analysis to take place in a directory other than the one from which it was launched. E.G. analysis begins from jenkins/jobs/myjob/workspace but the files to be analyzed are in ftpdrop/cobol/project1. The path may be relative or absolute. Specify not the the source directory, but some parent of the source directory.

### Secrets
* DATREE Secret - in order for this template to work a secret named `datree-secret` must exist with datree token.
```
    apiVersion: v1
    kind: Secret
    metadata:
        name: datree-secret
    type: Opaque
    data:
        token: echo -n 'datree token' | base64
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
  generateName: datree-policy-check-
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
            -   name: datree-policy-check
                dependencies: [clone-step]
                templateref:
                    name: argo-hub.datree.0.0.1
                    template: datree-policy-check
                arguments:
                    artifacts:
                    -   name: REPO
                        from: "{{tasks.clone-step.outputs.artifacts.repo}}"
                    parameters:
                    -   name: DATREE_TOKEN
                        value: datree-secret
                    -   name: INPUT_PATH
                        value: fileName.yaml
```
