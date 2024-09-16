# Post Promotion Starter

## Summary
This Workflow Template is an example of a post-promotion workflow that uses a script template to display application details, and commit information, taking these parameters from the promotion flow process.


## Inputs/Outputs

#### Parameters
* APP_NAMESPACE
* APP_NAME
* REPO_URL
* BRANCH
* PATH
* COMMIT_SHA
* COMMIT_MESSAGE
* COMMIT_AUTHOR
* COMMIT_DATE

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
          name: argo-hub.post-promotion-starter.0.0.2
          template: post-promotion-starter
        arguments:
          parameters:
          - name: APP_NAMESPACE
            value: 'staging
          - name: APP_NAME  
            value: 'my-app'     
          - name: REPO_URL
            value: 'my-repo-url'
          - name: BRANCH
            value: 'main'
          - name: PATH
            value: 'path/to/app'
          - name: COMMIT_SHA
            value: '123456'
          - name: COMMIT_MESSAGE
            value: 'Initial commit'
          - name: COMMIT_AUTHOR
            value: 'John Doe'
          - name: COMMIT_DATE
            value: '2023-12-27T03:00:00Z'
                                  
```
