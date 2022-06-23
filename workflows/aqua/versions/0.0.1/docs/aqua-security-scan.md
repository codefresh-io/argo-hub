# aqua-security-scan

## Summary
Execute an Aqua container security scan.

### Inputs
* AQUA_HOST (required) - Aqua Host URL including protocol ex. https://aqua.mydomain.com
* AQUA_PASSWORD (required) - The Kubernetes secret with the aqua password
* AQUA_PASSWORD_SECRET_KEY (optional) - The key in the Kubernetes secret with the aqua password. Default is 'password'
* AQUA_USERNAME (required) - The Kubernetes secret with the aqua username
* AQUA_USERNAME_SECRET_KEY (optional) - The key in the Kubernetes secret with the aqua username. Default is 'username'
* IMAGE (required) - Docker Image Name
* TAG (required) - Docker Image Tag
* CF_ACCOUNT (optional) - Auto pulled from pipeline also replaces REGISTRY if not provided
* REGISTRY (optional) - Name of Codefresh Registry setup in Aqua


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
  - name: main
    dag:
      tasks:
      - name: aqua-security-scan
        templateRef:
          name: argo-hub.aqua.0.0.1
          template: aqua-security-scan
        arguments:
          parameters:
          - name: AQUA_HOST
            value: 'https://aqua.mydomain.com'
          - name: AQUA_PASSWORD
            value: 'aqua-secret'
          - name: AQUA_PASSWORD_SECRET_KEY
            value: 'password'
          - name: AQUA_USERNAME
            value: 'aqua-secret'
          - name: AQUA_USERNAME_SECRET_KEY
            value: 'username'
          - name: IMAGE
            value: 'image-name'
          - name: CF_ACCOUNT
            value: 'cf-username'
          - name: REGISTRY
            value: 'cf-registry'
```
