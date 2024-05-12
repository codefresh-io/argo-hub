# Post Promotion Starter

## Summary
This Workflow Template is an example of a post-promotion workflow that uses a script template to display application details, commit information, and the Argo CD host, taking these parameters from the promotion flow process.


## Inputs/Outputs

#### Parameters
* APP_NAME
* COMMIT_SHA
* COMMIT_AUTHOR
* COMMIT_MESSAGE 
* COMMIT_DATE
* ARGOCD_HOST

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: post-promotion-starter
spec:
  entrypoint: main
  volumes:
  templates:
  - name: main
    dag:
      tasks:
      - name: post-promotion-starter
        templateRef:
          name: argo-hub.post-promotion-starter.0.0.1
          template: post-promotion-starter
        arguments:
          parameters:
          - name: APP_NAME
            value: 'my-app'
          - name: APP_NAMESPACE
            value: 'staging'
          - name: ARGOCD_HOST
            value: 'argo-cd-server.staging.svc.cluster.local'
          - name: COMMIT_SHA
              value: '123456'
          - name: COMMIT_AUTHOR
              value: 'John Doe'
          - name: COMMIT_MESSAGE
              value: 'Initial commit'
          - name: COMMIT_DATE
               value: '2021-01-01'               
```
