# promote-from-src-to-dest-env-s3

## Summary
Take a cloned GitOps repo from an S3 artifact and copy an image/chart value from a YAML file in one environment/directory to a corresponding file in another. Optionally create a PR to gate the change.

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
###### Strings to replace within the source/dest patterns
* **env-src** (required) - Replaces `[[ENV]]` in source paths.
* **env-dest** (required) -  Replaces `[[ENV]]` in destination paths.
* **svc-name-list** (required) - Space-separated list of microservices to promote. Each one replaces `[[SVC_NAME]]` in paths.
* **other** (optional) - Replaces `[[OTHER]]` in all paths.
###### Source/dest patterns, where `[[ENV]]` differentiates btw source and dest
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

### Kustomize Example - promote 2 images from dev to stage
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
              template: promote-from-src-to-dest-env-s3
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
                - name: env-src
                  value: dev
                - name: env-dest
                  value: stage
                - name: svc-name-list
                  value: "example-image1 example-image2" 
                # Pattern Strings
                - name: file-path-pattern
                  value: "kustomize/example-app/overlays/[[ENV]]/kustomization.yaml"
                - name: promotion-type
                  value: kustomize-image
                - name: kust-image-pattern
                  value: "[[SVC_NAME]]"
```

### Helm Dependency Example - promote 2 subcharts from dev to stage
```
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: simple-helm-dependency-example
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
          - name: promote-helm-dependency
            templateRef:
              name: argo-hub.gitops-promotion.0.0.1
              template: promote-from-src-to-dest-env-s3
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
                - name: create-github-pr
                  value: true
                # Replacement Substrings
                - name: env-src
                  value: dev
                - name: env-dest
                  value: stage
                - name: svc-name-list
                  value: "example-subchart1 example-subchart1"
                # Pattern Strings
                - name: file-path-pattern
                  value: helm/example-app/[[ENV]]/Chart.yaml
                - name: promotion-type
                  value: helm-dependency
                - name: helm-dep-pattern
                  value: "[[SVC_NAME]]"
```

### Helm values.yaml Example - full promotion pipeline (dev, staging, prod) with PR to gate prod
```
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: promotion-pipeline-example
spec:
  serviceAccountName: argo-hub.gitops-promotion.0.0.1
  entrypoint: promotion-tasks
  arguments:
    parameters:
      - name: source-environment
        value: "choose one: dev staging"
      - name: destination-environment
        value: "choose one: staging prod-east"
      - name: service-grouping
        value: "trio-app"
      - name: services-to-promote
        value: "flask-ui buslog ctrlr"
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
          - name: set-commit-details
            template: set-commit-details
          - name: promote-from-src-to-dest-env-s3
            depends: "set-commit-details.Succeeded && git-clone.Succeeded"
            templateRef:
              name: argo-hub.gitops-promotion.0.0.1
              template: promote-from-src-to-dest-env-s3
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
                - name: git-checkout-branch
                  value: "{{tasks.set-commit-details.outputs.parameters.branch}}"
                - name: git-commit-msg
                  value: "{{tasks.set-commit-details.outputs.parameters.commit-msg}}"
                # Substrings to replace in patterns, below
                - name: env-src
                  value: dev
                - name: env-dest
                  value: stage
                - name: svc-name-list
                  value: "{{workflow.parameters.services-to-promote}}"
                # Pattern Strings
                - name: file-path-pattern
                  value: "helm/{{workflow.parameters.service-grouping}}/[[ENV]]/values.yaml"
                - name: promotion-type
                  value: helm-value
                - name: yaml-key-pattern
                  value: ".[[SVC_NAME]].image.tag"
          - name: create-pr
            templateRef:
              name: argo-hub.github.0.0.4
              template: create-pr
            depends: "promote-from-src-to-dest-env-s3.Succeeded"
            when: "{{tasks.set-commit-details.outputs.parameters.create-pr}} == true"
            arguments:
              artifacts:
                - name: repo
                  from:  "{{tasks.promote-from-src-to-dest-env-s3.outputs.artifacts.repo}}"
              parameters:
                - name: BRANCH
                  value: "{{tasks.set-commit-details.outputs.parameters.branch}}"
                - name: MESSAGE
                  value: "{{tasks.set-commit-details.outputs.parameters.commit-msg}}"
                - name: PR_TEMPLATE
                  value: 'https://raw.githubusercontent.com/codefresh-contrib/express-microservice2/develop/.github/pull_request_template.md'
                - name: GITHUB_TOKEN_SECRET
                  value: 'git-auth'

    # Non-prod promotion goes straight to main branch
    # Prod-east promotion goes to a branch where a PR is created
    - name: set-commit-details
      script:
        image: alpine:latest
        command: ["/bin/sh"]
        source: |
          set -e  # exit when any command fails
          ENV_SRC="{{workflow.parameters.source-environment}}"
          ENV_DEST="{{workflow.parameters.destination-environment}}"
          SVC_LIST="{{workflow.parameters.services-to-promote}}"
          INITIATOR="{{workflow.annotations.codefresh.io/initiator}}"
          TODAY=$(date +%F-%SS)
          if [ "${ENV_DEST}" = "prod-east" ]; then
            BRANCH="promote/prod-east/${TODAY}"
            CREATE_PR=true
          else
            BRANCH="main"
            CREATE_PR=false
          fi
          COMMIT_MSG="Promotion from ${ENV_SRC} to ${ENV_DEST} by ${INITIATOR}: ${SVC_LIST}"
          echo "${COMMIT_MSG}" > /tmp/commit-msg.txt
          echo "${BRANCH}" > /tmp/branch.txt
          echo "${CREATE_PR}" > /tmp/create-pr.txt
      outputs:
        parameters:
          - name: commit-msg
            valueFrom:
              path: /tmp/commit-msg.txt
          - name: branch
            valueFrom:
              path: /tmp/branch.txt
          - name: create-pr
            valueFrom:
              path: /tmp/create-pr.txt
```

### Simple deployment.yaml Example - promote an image from dev to stage
```
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: simple-deployment-yaml-example
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
          - name: promote-image
            templateRef:
              name: argo-hub.gitops-promotion.0.0.1
              template: promote-from-src-to-dest-env-s3
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
                - name: env-src
                  value: dev
                - name: env-dest
                  value: stage
                - name: svc-name-list
                  value: "example-image"
                # Pattern Strings
                - name: file-path-pattern
                  value: "example-app/[[ENV]]/deployment.yaml"
                - name: promotion-type
                  value: yaml-key
                - name: yaml-key-pattern
                  value: ".spec.template.spec.containers.0.image"
```