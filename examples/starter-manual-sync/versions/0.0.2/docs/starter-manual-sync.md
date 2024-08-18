# Starter manual sync

## Summary

This Workflow Template is an example for post promotion workflow that:
- Sync an application in ArgoCD. See `argocd app sync --help` with the ArgoCD CLI for flags
- Wait for an application in ArgoCD. See `argocd app wait --help` with the ArgoCD CLI for flags
- send messages to a Slack channel using a webhook URL.


## Inputs/Outputs

#### Parameters
* APP_NAME (required)- The app to sync (if syncing by label, use flags).
* APP_NAMESPACE - The app namespace.
* SERVER_URL (required) - The address to reach ArgoCD 
(if in cluster, something like `argocd-server.<namespace>.svc.cluster.local` for cli based; `argo-cd-server.<namespace>.svc.cluster.local` for helm based.
  It's important to note that users have the flexibility to customize and modify these designations based on their specific preferences or requirements.)

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: starter-manual-sync-
spec:
  entrypoint: main
  volumes:
  templates:
  - name: main
    dag:
      tasks:
      - name: starter-manual-sync
        templateRef:
          name: argo-hub.starter-manual-sync.0.0.2
          template: starter-manual-sync
        arguments:
          parameters:
          - name: APP_NAME
            value: 'my-app'
          - name: APP_NAMESPACE
            value: 'staging'
          - name: SERVER_URL
            value: 'argo-cd-server.staging.svc.cluster.local'
```
