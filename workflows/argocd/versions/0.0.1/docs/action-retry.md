# action-retry

## Summary
Run the retry action for an application in ArgoCD. See `argocd app action run --help` with the ArgoCD CLI for flags

## Inputs/Outputs

### Inputs
* app (required) - The app to retry
* appKind - The kind of the application to run this action on (Default is `Rollback`)
* flags - Any retry flags to set for the ArgoCD CLI
* serverUrl (required) - The address to reach ArgoCD (if in cluster, something like `argocd-server.<namespace>.svc.cluster.local`)
* opts - Global options for ArgoCd (ex. `--grpc-web`)
* tokenSecret - The Kubernetes secret holding the token for communicating with ArgoCD. Default is `argocd-token`
* tokenSecretKey - The key in the Kubernetes secret with the ArgoCD token. Default is `token`
* xtraceOption - Whether to enabled xtrace (echoing the command before running it) or not (`-o` and `+o` respectively). Default is "on" (`-o`)


### Outputs
No outputs

## Examples

### task Example
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: argocd-action-retry-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: action-retry
        templateRef:
          name: argo-hub.argocd.0.0.1
          template: action-retry
        arguments:
          parameters:
          - name: app
            value: 'demo-app'
          - name: appKind
            value: 'Rollback'
          - name: flags
            value: '--all'
          - name: serverUrl
            value: 'argocd-server.argocd.svc.cluster.local'
          - name: opts
            value: '--grpc-web'
          - name: tokenSecret
            value: 'my-k8s-secret'
          - name: tokenSecretKey
            value: 'argocd-token'
```