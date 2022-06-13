# gitops-promotion

## Summary

Templates for doing GitOps-style promotions of microservices from one K8s environment to another. Assumes that you have a GitOps monorepo containing subdirectories that represent environments, each of which contains the manifests for deploying that environment to a K8s cluster. Supported manifest types include Kustomize, Helm Charts, and raw YAML files.

## Templates

1. [promote-from-src-to-dest-env](https://github.com/codefresh-io/argo-hub/blob/main/workflows/gitops-promotion/versions/0.0.1/docs/promote-from-src-to-dest-env.md)
1. [promote-from-src-to-dest-env-s3](https://github.com/codefresh-io/argo-hub/blob/main/workflows/gitops-promotion/versions/0.0.1/docs/promote-from-src-to-dest-env-s3.md)
1. [promote-to-env](https://github.com/codefresh-io/argo-hub/blob/main/workflows/gitops-promotion/versions/0.0.1/docs/promote-to-env.md)
1. [promote-to-env-s3](https://github.com/codefresh-io/argo-hub/blob/main/workflows/gitops-promotion/versions/0.0.1/docs/promote-to-env-s3.md)

## Security

Minimal required permissions

[Full rbac permissions list](./rbac.yaml)
