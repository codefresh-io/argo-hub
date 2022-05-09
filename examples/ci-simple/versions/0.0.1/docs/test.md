# test

## Summary
                 
Test image pulling correctly and printing it content files 


## Inputs/Outputs

#### Parameters
* IMAGE (required) - The image name that you want to pull
* DOCKER_CONFIG_SECRET (required) - The k8s secret name from type docker-registry with all registries credentials you need to pull from or push to. defaults secret name `docker-config` . https://codefresh.io/csdp-docs/docs/getting-started/quick-start/create-ci-pipeline/#create-docker-registry-secret

#### Volumes 
* docker-config - in order for this template to work a volume named `docker-config` must exist with DOCKER_CONFIG_SECRET name.
```
  volumes:
    - name: docker-config
      secret:
        items:
          - key: .dockerconfigjson
            path: config.json
        secretName: '{{ inputs.parameters.DOCKER_CONFIG_SECRET }}'
```

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: test-image-
spec:
  entrypoint: main
  volumes:
  - name: docker-config
    secret:
      items:
      - key: .dockerconfigjson
        path: config.json
      secretName: '{{ inputs.parameters.DOCKER_CONFIG_SECRET}}'
  templates:
  - name: main
    dag:
      tasks:
      - name: test-image
        templateRef:
          name: argo-hub.ci-simple.0.0.1
          template: test
        arguments:
          parameters:
          - name: IMAGE
            value: 'quay.io/codefresh/cli-v2'
```
