# extract-webhook-variables

## Summary
Parse the GitHub Event Payload (JSON). Output the most useful payload fields as artifact files, which can be mapped into global workflow outputs, and then consumed by any subsequent templates. The list of fields closely matches the pipeline variables that were previously  established in Codefresh's [Classic platform](https://codefresh.io/docs/docs/codefresh-yaml/variables).

## Inputs/Outputs

### Inputs
* GITHUB_JSON (required) - GitHub event payload (JSON) string from a GitHub EventSource + Sensor.

### Outputs
* CF_REPO_OWNER - Repository owner.
* CF_REPO_NAME - Repository name.
* CF_BRANCH - Branch name (or Tag depending on the payload json) of the Git repository of the main pipeline, at the time of execution.
* CF_BASE_BRANCH - The base branch used during creation of Tag.
* CF_PULL_REQUEST_ACTION - The pull request action.
* CF_PULL_REQUEST_TARGET - The pull request target branch.
* CF_PULL_REQUEST_NUMBER - The pull request number.
* CF_PULL_REQUEST_ID - The pull request id.
* CF_PULL_REQUEST_LABELS - The labels of pull request.
* CF_COMMIT_AUTHOR - Commit author.
* CF_COMMIT_USERNAME - Commit username.
* CF_COMMIT_EMAIL - Commit email.
* CF_COMMIT_URL - Commit url.
* CF_COMMIT_MESSAGE - Commit message of the Git repository revision, at the time of execution.
* CF_REVISION - Revision of the Git repository of the main pipeline, at the time of execution.
* CF_SHORT_REVISION - The abbreviated 7-character revision hash, as used in Git.
* CF_RELEASE_NAME - GitHub release title.
* CF_RELEASE_TAG - Git tag version.
* CF_RELEASE_ID - Internal ID for this release.
* CF_PRERELEASE_FLAG - "true" if the release is marked as non-production ready, "false" if it is ready for production.
* CF_PULL_REQUEST_MERGED - "true" if the pull request was merged to base branch.
* CF_PULL_REQUEST_HEAD_BRANCH - The head branch of the PR (the branch that we want to merge to master).
* CF_PULL_REQUEST_MERGED_COMMIT_SHA - The commit SHA on the base branch after the pull request was merged (in most cases it will be master).
* CF_PULL_REQUEST_HEAD_COMMIT_SHA - The commit SHA on the head branch (the branch that we want to push).

## Examples

### Store key fields from a GitHub event payload as global workflow outputs, and consume them from a subsequent template.
```
---
apiVersion: argoproj.io/v1alpha1
kind: Sensor
metadata:
  name: example-github-sensor
spec:
  eventBusName: codefresh-eventbus
  template:
    serviceAccountName: argo
  dependencies:
    - name: github-dep
      eventSourceName: github
      eventName: push
  triggers:
    - template:
        name: example-github
        argoWorkflow:
          version: v1alpha1
          group: argoproj.io
          resource: workflows
          operation: submit
          source:
            resource:
              apiVersion: argoproj.io/v1alpha1
              kind: Workflow
              metadata:
                generateName: example-github-
              spec:
                workflowTemplateRef:
                  name: example-steps
                serviceAccountName: argo-hub.github.0.0.2
                arguments:
                  parameters:
                    - name: GITHUB_JSON
          parameters:
            - dest: spec.arguments.parameters.0.value
              src:
                dependencyName: github-dep
                dataKey: body
---
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: example-steps
spec:
  arguments:
    parameters:
      - name: GITHUB_JSON
  entrypoint: example-steps
  templates:
    - name: example-steps
      steps:
      # 1. Store GitHub info as global workflow outputs
      - - name: extract-webhook-variables
          templateRef:
            name: argo-hub.github.0.0.2
            template: extract-webhook-variables
          arguments:
            parameters:
            - name: GITHUB_JSON
              value: "{{workflow.parameters.GITHUB_JSON}}"
      # 2. Consume some global workflow outputs in a subsequent step
      - - name: log-info
          template: log-info
          arguments:
            parameters:
            - name: INFO
              value: "{{workflow.outputs.parameters.CF_REPO_OWNER}}/{{workflow.outputs.parameters.CF_REPO_NAME}}"
    - name: log-info
      inputs:
        parameters:
          - name: INFO
      script:
        image: alpine:latest
        command: ["/bin/sh"]
        env:
          - name: INFO
            value: "{{ inputs.parameters.INFO }}"
        source: |
          set -e
          echo ${INFO}
```
