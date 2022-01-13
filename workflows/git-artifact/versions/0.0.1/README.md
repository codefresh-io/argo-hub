# git

## Summary

A set of generics git operations

## Templates

1. [clone](https://github.com/codefresh-io/argo-hub/blob/main/workflows/git-artifact/versions/0.0.1/docs/clone.md)
2. [commit](https://github.com/codefresh-io/argo-hub/blob/main/workflows/git-artifact/versions/0.0.1/docs/commit.md)

## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/git-artifact/versions/0.0.1/rbac.yaml)


## Examples
### Clone change commit scenario
* clone a repository with a argo-hub template and output it as artifact 
* call a your-changes/change-artifact and modify and output an artifact
* commit and push that repo (artifact) with user details and message provided
* Test permissions:- serviceAccountName: codefresh-sa, 
* The test use artifacts in default bucket using: [key-only-artifacts](https://argoproj.github.io/argo-workflows/key-only-artifacts) and cluster setup with [default-artifacts-repository](https://argoproj.github.io/argo-workflows/artifact-repository-ref)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: your-changes
spec:
  templates:
    - name: change-artifact
      inputs:
        artifacts:
          - name: repo
            path: /tmp/repo
      outputs:
        artifacts:
          - name: repo
            path: /tmp/repo
      script:
        image: quay.io/bitnami/git
        command: [ bash ]
        source: |
          DIRPATH='{{inputs.artifacts.repo.path}}'
          cd $DIRPATH
          CHANGE="echo '$(date)' > changed"
          eval $CHANGE
          echo $CHANGE

---

apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generate: hello-artifact-clone-change-commit
spec:
  entrypoint: run-clone-change-commit
  serviceAccountName: codefresh-sa
  arguments:
    parameters:
      - name: REPO_URL
        value: https://github.com/codefresh-io/argo-hub
      - name: REVISION
        value: main
      - name: GIT_TOKEN_SECRET
        value: git-token-name
      - name: MESSAGE
        value: 'the message!'
  templates:
    - name: run-clone-change-commit
      inputs:
        parameters:
          - name: REPO_URL
            value: '{{arguments.parameters.REPO_URL}}'
          - name: REVISION
            value: '{{arguments.parameters.REVISION}}'
          - name: GIT_TOKEN_SECRET
            value: '{{arguments.parameters.GIT_TOKEN_SECRET}}'
          - name: MESSAGE
            value: '{{arguments.parameters.MESSAGE}}'
      dag:
        tasks:
          - name: clone-step
            templateRef:
              name: argo-hub.git-artifact.0.0.1
              template: clone
            arguments:
              parameters:
                - name: REPO_URL
                  value: '{{inputs.parameters.REPO_URL}}'
                - name: REVISION
                  value: '{{inputs.parameters.REVISION}}'
                - name: GIT_TOKEN_SECRET
                  value: '{{inputs.parameters.GIT_TOKEN_SECRET}}'
            outputs:
              - artifacts:
                  - name: repo
                    path:/{{ workflow.name }}/cloned
          - name: change-step
            depends: "clone-step"
            templateRef:
              name: your-changes
              template: change-artifact
            arguments:
              artifacts:
                - name: repo
                  from: "{{tasks.clone-step.outputs.artifacts.repo}}"
            outputs:
              artifacts:
                - name: repo
                  path: /{{ workflow.name }}/changed
                  s3:
                    key: repo
          - name: commit-push-step
            depends: "change-step"
            templateRef:
              name: argo-hub.git-artifact.0.0.1
              template: commit
            arguments:
              parameters:
                - name: MESSAGE
                  value: '{{inputs.parameters.MESSAGE}}'
                - name: GIT_USER_NAME
                  value: 'username'
                - name: GIT_USER_EMAIL
                  value: 'username@codefresh.io'
              artifacts:
                - name: repo
                  from: "{{tasks.change-step.outputs.artifacts.repo}}"
```
