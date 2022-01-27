# report-image-info

## Summary
Report image info to argo platform.

## Inputs/Outputs

### Inputs
* IMAGE_URI (required) - your image to which you want to report
* CF_API_KEY (required) - Codefresh API key          
* GIT_BRANCH (optional) - git branch
* GIT_REVISION (optional) - git revision
* GIT_COMMIT_MESSAGE (optional) - git commit message
* GIT_COMMIT_URL (optional) - git commit url
* GCR_KEY_FILE_PATH (required) - JSON key for authenticating to a Google GCR
* AWS_ACCESS_KEY (required) - Amazon access key
* AWS_SECRET_KEY (required) - Amazon secret key
* AWS_REGION (required) - Amazon region
* DOCKER_USERNAME (required) - docker username
* DOCKER_PASSWORD (required) - docker password
* USERNAME (required) - standard registry username
* PASSWORD (required) - standard registry password
* DOMAIN (required) - standard registry domain
* CF_HOST (optional) - support on-premises Codefresh URL
* INSECURE (optional) - security flag for standard registry protocol, when set to true it enables http protocol.

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: report-image-info-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: report-image-info
        templateRef:
          name: argo-hub.codefresh-csdp.0.0.5
          template: report-image-info
        arguments:
          parameters:
          - name: IMAGE_URI
            value: 'docker.io/codefresh/cfstep-helm:lastest'
          - name: CF_API_KEY
            value: 'CODEFRESH_API_KEY'
          - name: GIT_REVISION
            value: 'a1bc234d56e78f9a0b12c34d5ef67fba89d01ea2
          - name: GIT_BRANCH
            value: 'main' 
          - name: GIT_COMMIT_URL
            value: 'https://github.com/test/project/commit/a1bc234d56e78f9a0b12c34d5ef67fba89d01ea2' 
          - name: GIT_COMMIT_MESSAGE
            value: "Merge branch 'test'"                           
          - name: DOCKER_USERNAME
            value: 'docker-username' 
          - name: DOCKER_PASSWORD
            value: 'docker-password'     
```
