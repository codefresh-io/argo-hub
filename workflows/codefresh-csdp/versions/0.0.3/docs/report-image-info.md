# report-image-info

## Summary
Report image info to argo platform.

## Inputs/Outputs

### Inputs
* IMAGE_URI (required) - your image to which you want to report
* CF_API_KEY (required) - Codefresh API key          
* GIT_BRANCH (required) - git branch
* GIT_REVISION (required) - git revision
* GIT_COMMIT_MESSAGE (required) - git commit message
* GIT_COMMIT_URL (required) - git commit url
* CF_HOST (optional) - support on-premises Codefresh URL
* GCR_KEY_FILE_PATH (optional) - JSON key for authenticating to a Google GCR
* AWS_ACCESS_KEY (optional) - Amazon access key
* AWS_SECRET_KEY (optional) - Amazon secret key
* AWS_REGION (optional) - Amazon region
* DOCKER_USERNAME (optional) - docker username
* DOCKER_PASSWORD (optional) - docker password
* USERNAME (optional) - standard registry username
* PASSWORD (optional) - standard registry password
* DOMAIN (optional) - standard registry domain
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
          name: argo-hub.codefresh-csdp.0.0.3
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
