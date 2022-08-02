# aqua-secuirty-scan

## Summary
Execute an Aqua container security scan.

## Inputs/Outputs

### Inputs
* AQUA_HOST (required) - Aqua Host URI including protocol ex. https://aqua.mydomain.com
* AQUA_SECRET (required) - The Kubernetes secret with Aqua log in credentials
* AQUA_PASSWORD (optional) - The key in the Kubernetes secret with the Aqua password. Default is 'password'
* AQUA_USERNAME (optional) - The key in the Kubernetes secret with the Aqua username. Default is 'username'
* IMAGE (required) - Docker Image Name
* REGISTRY (required) - Name of Registry setup in Aqua
* TAG (optional) - Docker Image Tag. Default is 'latest'

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: aqua-security-scan-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: aqua-seciurity-scan
                templateref:
                    name: argo-hub.aqua.0.0.1
                    template: aqua-seciurity-scan
                arguments:
                    parameters:
                    -   name: AQUA_HOST
                        value: 'https://aqua.mydomain.com'
                    -   name: AQUA_SECRET
                        value: 'aqua-secret'
                    -   name: IMAGE
                        value: 'image'
                    -   name: REGISTRY
                        value: 'dockerhub'
```
