
# Sigstore Cosign

## Summary

Sigstore Cosign is a tool for signing, and verifying images and Helm Charts and uploading signatures to an OCI registry. This workflow template uses Bitnami's cosign image to support adding a signature to builds. 

## Prep Instructions
1. [Install the cosign cli](https://docs.sigstore.dev/cosign/installation).
2. Generate a keypair in the Kubernetes cluster and namespace where Argo Workflows is installed. `cosign generate-key-pair k8s://namespace/cosignkey`
3. Mount the secret in your workflow. 
```yaml
spec:
  volumes:
    - name: cosign-key
      secret:
        items:
          - key: cosign.key
            path: cosign.key
          - key: cosign.password
            path: cosign.password
          - key: cosign.pub
            path: cosign.pub
        secretName: cosignkey
```
Make sure `secretName` matches the name of the secret you generated in step 2.

## Templates

1. [Sign](https://github.com/codefresh-io/argo-hub/blob/main/workflows/cosign/versions/0.0.1/docs/sign.md) 

## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/cosign/versions/0.0.1/rbac.yaml)
