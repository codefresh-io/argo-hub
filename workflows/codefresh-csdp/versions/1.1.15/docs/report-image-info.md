# report-image-info

## Summary
Report image info to argo platform.

## Inputs/Outputs

### Inputs
* IMAGE_NAME (required) - your image to which you want to report
* CF_API_KEY (required) - Codefresh API key created by **runtime**
* CF_HOST_URL (optional) - support on-premises Codefresh URL
* WORKFLOW_NAME (optional) - name of the workflow
* WORKFLOW_URL (optional) - external url of the workflow
* LOGS_URL (optional) - external url of the workflow logs
* REGISTRY_INSECURE (optional) - security flag for standard registry protocol, when set to true it enables http protocol.
* RETRIEVE_CREDENTIALS_BY_DOMAIN (optional) - decide about the authentication method based on the image domain
* DOCKERFILE_CONTENT (optional) - base64 encoded content of the Dockerfile used for building image
* DOCKERFILE_PATH (optional) - path to the Dockerfile used for building image (used if DOCKERFILE_CONTENT is empty)
#### Specify one from following required registry parameters:
* GCR_KEY_FILE_PATH (required) - JSON key for authenticating to a Google GCR
* GCR_KEY_SECRET (required) - The Kubernetes secret containing the GCR key information. Default is 'gcr-key-file'
* GCR_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret containing the GCR key information. Default is '.keyjson'
* GOOGLE_REGISTRY_HOST (optional)  - The host to Google GCR or Google ACR. Default is 'gcr.io'
* GOOGLE_JSON_KEY (required) - The Kubernetes secret with the JSON key for authenticating to a Google GCR or Google ACR
* GOOGLE_KEY_SECRET_KEY (optional) The key in the Kubernetes secret with Google JSON key. Default is 'keyjson'
* AWS_ACCESS_KEY (required) - The Kubernetes secret with the Amazon access key
* AWS_ACCESS_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon access key. Default is 'aws-access-key'
* AWS_SECRET_KEY (required) - The Kubernetes secret with the Amazon secret key
* AWS_SECRET_KEY_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon secret key. Default is 'aws-secret-key'
* AWS_REGION (required) - The Kubernetes secret with the Amazon region
* AWS_REGION_SECRET_KEY (optional) - The key in the Kubernetes secret with the Amazon region. Default is 'aws-region'
* DOCKER_CONFIG_FILE_PATH (required) - docker config json for authenticating to a registry (GCR, ECR, ACR not supported)
* DOCKER_CONFIG_SECRET (required) - The Kubernetes secret containing the docker config json information. Default is 'docker-registry'
* DOCKER_CONFIG_SECRET_KEY  (optional) - The key in the Kubernetes secret containing the docker config json information. Default is '.dockerconfigjson'
* DOCKERHUB_USERNAME (required) - The Kubernetes secret with the docker username
* DOCKERHUB_USERNAME_SECRET_KEY (optional) The key in the Kubernetes secret with the docker username. Default is 'username'
* DOCKERHUB_PASSWORD (required) - The Kubernetes secret with the docker password
* DOCKERHUB_PASSWORD_SECRET_KEY (optional) The key in the Kubernetes secret with the docker password. Default is 'password'
* REGISTRY_USERNAME (required) - The Kubernetes secret with the standard registry username
* USERNAME_SECRET_KEY (optional) The key in the Kubernetes secret with the standard registry username. Default is 'username'
* REGISTRY_PASSWORD (required) - The Kubernetes secret with the standard registry password
* PASSWORD_SECRET_KEY (optional) The key in the Kubernetes secret with the standard registry password. Default is 'password'
* REGISTRY_DOMAIN (required) - The Kubernetes secret with the standard registry domain
* REGISTRY_DOMAIN_SECRET_KEY (optional) - The key in the Kubernetes secret with the standard registry domain. Default is 'domain'
* AWS_ROLE_SECRET (required) - The Kubernetes secret with the Amazon role
* AWS_ROLE_SECRET_KEY (optional) -The key in the Kubernetes secret with the standard Amazon role. Default is 'role'

### Outputs
* `image-name` – name of the reported image
* `image-sha` – SHA of the reported image
* `image-link` – link to the image in codefresh
* `exit-error` – message of the error that caused template failure

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
          name: argo-hub.codefresh-csdp.1.1.15
          template: report-image-info
        arguments:
          parameters:
          - name: CF_API_KEY
            value: 'codefresh-token'
          - name: CF_API_KEY_SECRET_KEY
            value: 'token'
          - name: IMAGE_NAME
            value: 'deniscodefresh/ppid-inspector:latest'
          - name: DOCKERHUB_USERNAME
            value: 'dockerhub-creds'
          - name: USERNAME_SECRET_KEY
            value: 'username'
          - name: DOCKERHUB_PASSWORD
            value: 'dockerhub-creds'
          - name: PASSWORD_SECRET_KEY
            value: 'password'
```
