# promote-to-env-s3

## Summary
Take a cloned GitOps repo from an S3 artifact and apply a new image/chart value to a YAML file in one of its environment directories. This is useful to do at the end of a CI pipeline - after an image has been fully tested and pushed to an image registry, it can then be promoted to the first environment in your promotion process. Optionally create a PR to gate the change.

## Requirements
#### Kubernetes secret with Git authentication details
```
# Create this within the namespace of your Argo Workflows instance (i.e. the Codefresh Runtime)
kubectl create secret generic git-auth --namespace my-runtime \
  --from-literal=token=ghp_3djq123456... \
  --from-literal=username=ExampleSvcAccount \
  --from-literal=email=svc.account@example.com
```

## Inputs/Outputs

### Inputs
#### Artifacts
* repo - S3 artfact with a clone of the GitOps repo. See [clone-s3](https://codefresh.io/argohub/workflow-template/git).
#### Parameters
###### GitOps repo
* **git-repo-url** (required) - HTTP URL of your GitOps repo, for example: `https://github.com/example-account/example-gitops-repo.git`.
* **git-auth-secret** (required) - Name of a secret with the following keys: `token`, `username`, `email`.
* **git-checkout-branch** (optional) - Branch for changes. Default is main. Specify a different branch if you'll be creating a PR.
* **git-clone-branch** (optional) - Branch to clone. Default is main. Match to **git-checkout-branch** when adding to an existing branch/PR.
* **git-commit-msg** (optional) - Custom commit message. If not provided, one will be generated.
* **create-github-pr** (optional) - Set to `true` (and **git-checkout-branch** to non-main) to create a PR. Default is `false`
* **pr-title** (optional) - Title for the PR. Default is to use the commit message.
* **output-artifact-key** (optional) - Key to which the updated Git repo S3 artifact will be pushed. Default is `{{ workflow.name }}/git-repo`
###### Strings to replace within the target patterns
* **value-to-promote** (required) - New value to apply to the target environment.
* **env** (required) - Replaces `[[ENV]]` in destination paths.
* **svc-name-list** (required) - Space-separated list of microservices to promote. Each one replaces `[[SVC_NAME]]` in paths.
* **other** (optional) - Replaces `[[OTHER]]` in all paths.
###### Target patterns
* **file-path-pattern** (required) - Path to the source/destination YAML file.
  * kustomization.yaml example: `k8s-resources/[[SVC_NAME]]/overlays/[[ENV]]/kustomization.yaml`
  * Helm values.yaml example: `k8s-resources/[[ENV]]/[[SVC_NAME]]/values.yaml`
* **promotion-type** (required) - Must be one of: `kustomize-image`, `helm-value`, `helm-dependency`, `yaml-key`
* **kust-image-pattern** (optional) - For `kustomize-image` - name of the image transformer to copy from source to dest. Default is `[[SVC_NAME]]`
* **yaml-key-pattern** (optional) - For `helm-value` and `yaml-key` - YAML key pattern within values.yaml to copy from source to dest. Default is `.[[SVC_NAME]].image.tag`
* **helm-dep-pattern** (required) - For `helm-dependency` - name of the subchart/dependency to copy from source to dest. Default is `[[SVC_NAME]]`

### Outputs
#### Artifacts
* **repo** - S3 artifact containing the updated git clone repository, with the new commit and optional branch.
#### Parameters
* **codefresh-io-pr-url** - URL of the PR, if one was created.

## Examples

### Kustomize Example - apply a new images to dev
```
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: simple-kustomize-example
spec:
  serviceAccountName: argo-hub.gitops-promotion.0.0.1
  entrypoint: promotion-tasks
  templates:
    - name: promotion-tasks
      dag:
        tasks:
          - name: git-clone
            # Output S3 artifact repo is called "repo"
            templateRef:
              name: argo-hub.git.0.0.2
              template: clone-s3
            arguments:
              parameters:
              - name: REPO
                value: "https://github.com/example-org/example-gitops-repo.git"
              - name: GIT_TOKEN_SECRET
                value: git-auth
          - name: promote-kustomize-image
            templateRef:
              name: argo-hub.gitops-promotion.0.0.1
              template: promote-to-env
            arguments:
              artifacts:
                - name: repo
                  from:  "{{tasks.git-clone.outputs.artifacts.repo}}"
              parameters:
                # Git
                - name: git-repo-url
                  value: "https://github.com/example-org/example-gitops-repo.git"
                - name: git-auth-secret
                  value: git-auth
                # Replacement Substrings
                - name: value-to-promote
                  value: aaaa1111
                - name: env
                  value: dev
                - name: svc-name-list
                  value: "example-image"
                # Pattern Strings
                - name: file-path-pattern
                  value: "kustomize/example-app/overlays/[[ENV]]/kustomization.yaml"
                - name: promotion-type
                  value: kustomize-image
                - name: kust-image-pattern
                  value: "[[SVC_NAME]]"
```
