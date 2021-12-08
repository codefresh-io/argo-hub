# task

## Summary
Summary

## Inputs/Outputs

### Inputs
#### Parameters
* REPO (required) - the repository you want to clone (for example: https://github.com/codefresh-io/argo-hub)
* REVISION (optional) - the revision to checkout. defaults to `main`
* GIT_TOKEN_SECRET (required) - the k8s secret name that contains a key named `token` with the git secret inside it
* DOCKERFILE (optional) - The path to your dockerfile. defaults to `Dockerfile`
* IMAGE_NAME (required) - The image name to give to the built image
* TAG (optional) - The tag that will be given to the image. defaults to `latest`
* CONTEXT (optional) - the context of file system that will be passed. defaults to `.`

#### Artifacts
* repo - the file system that will be used for building the docker image.

#### Volumes
* docker-config - in order for this tempalte to work a volume named `docker-config` must exists with all registries credentials you need to pull from or push to

### Outputs
no outputs

## Examples

### basic clone repo and build docker image
This example assumes you have a secret in your cluster called `docker-config` that contains credentials to the required registry you need to pull or push images to

```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: kaniko-build-
spec:
  entrypoint: main
  volumes:
  - name: docker-config
    secret:
      items:
      - key: .dockerconfigjson
        path: config.json
      secretName: docker-config
  templates:
  - name: main
    dag:
      tasks:
      - name: build-image
        templateRef:
          name: argo-hub.kaniko.0.0.1
          template: build
        arguments:
          parameters:
          - name: REPO
            value: 'https://github.com/codefresh-io/argo-hub'
          - name: IMAGE_NAME
            value: 'codefresh/argo-hub'
          - name: GIT_TOKEN_SECRET
            value: 'git-token'
```
