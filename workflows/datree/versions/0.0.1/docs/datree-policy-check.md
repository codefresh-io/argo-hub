# datree-policy-check

## Summary
This action runs the Datree CLI against given k8s configuration file/s in your repository, featuring full Helm and Kustomize support.

## Inputs/Outputs

### Inputs
* CLI_ARGUMENTS (optional) - Datree CLI arguments as specified here: https://hub.datree.io/setup/cli-arguments#flags
* DATREE_TOKEN (required) - Kubernetes secret with Datree account token
* DATREE_TOKEN_SECRET_KEY (required) - The key in the Kubernetes secret with the Datree account token. Default is 'token'
* HELM_ARGUMENTS (optional) - The Helm arguments to be used, if the path is a Helm chart
* INPUT_PATH (required) - File/s to be tested
* IS_HELM_CHART (optional) - Is the desired path a Helm chart?
* IS_KUSTOMIZATION (optional) - Is the desired path a Kustomization?
* KUSTOMIZE_ARGUMENTS (optional) - The Kustomize arguments to be used, if the path is a Kustomization
* WORKING_DIRECTORY (optional) - The directory to which the repository is cloned. It can be an explicit path in the container’s file system, or a variable that references another step. The default value is '/codefresh/volume/${{CF_REPO_NAME}}'

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
            -   name: datree-policy-check
                templateref:
                    name: argo-hub.datree.0.0.1
                    template: datree-policy-check
                arguments:
                    parameters:
                    -   name: CLI_ARGUMENTS
                        value: '--schema-version'
                    -   name: DATREE_TOKEN
                        value: 'datree-token'
                    -   name: DATREE_TOKEN_SECRET_KEY
                        value: 'token'
                    -   name: HELM_ARGUMENTS
                        value: '--values values.yaml'
                    -   name: INPUT_PATH
                        value: my/chart/directory
                    -   name: IS_HELM_CHART
                        value: true
                    -   name: IS_KUSTOMIZATION
                        value: true
                    -   name: KUSTOMIZE_ARGUMENTS
                        value: "HOSTNAME"
                    -   name: WORKING_DIRECTORY
                        value: '/codefresh/volume/${{CF_REPO_NAME}}'
```
