# git

## Summary

A set of generics git operations

## Templates

1. [clone](https://github.com/codefresh-io/argo-hub/blob/main/workflows/git/versions/0.0.1/docs/clone-s3.md) 

## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/git/versions/0.0.1/rbac.yaml)


## Examples
### Clone change commit 
* clone a repository with a argo-hub template and output it as artifact 
* call a your-changes change-artifact and modify and output an artifact
* commit and push that repo (artifact) with user details and message provided
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: hello-artifact-clone-change-push
spec:
  entrypoint: run-test
  serviceAccountName: codefresh-sa
  arguments:
    parameters:
      - name: REPOURL
        value: https://github.com/organization/hello
      - name: REVISION
        value: main
      - name: GIT_TOKEN_SECRET
        value: ghp_YOURROKEN
      - name: MESSAGE
        value: 'the commit message!'
  templates:
    - name: run-clone-change-commit
      inputs:
        parameters:
        - name: REPOURL
          value: '{{arguments.parameters.REPOURL}}'
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
              name: argo-hub.git.0.0.1
              template: clone
            arguments:
              parameters:
              - name: REPOURL
                value: '{{inputs.parameters.REPOURL}}'
              - name: REVISION
                value: '{{inputs.parameters.REVISION}}'
              - name: GIT_TOKEN_SECRET
                value: '{{inputs.parameters.GIT_TOKEN_SECRET}}'
            outputs:
              - artifacts:
                  - name: REPO
                    path: /cloned
          - name: change-step
            depends: "clone-step "
            templateRef:
              name: your-changes
              template: change-artifact
            arguments:
              artifacts:
                - name: REPO
                  from: "{{tasks.clone-step.outputs.artifacts.REPO}}"
            outputs:
              artifacts:
                - name: REPO
                  path: /changed
                  s3:
                    key: repo
          - name: commit-push-step
            depends: "change-step "
            templateRef:
              name: argo-hub.git.0.0.1
              template: commit
            arguments:
              parameters:
              - name: MESSAGE
                value: '{{inputs.parameters.MESSAGE}}'
              - name: GIT_USER_NAME
                value: 'saffi'
              - name: GIT_USER_EMAIL
                value: 'saffi.hartal@codefresh.io'
              artifacts:
                - name: REPO
                  from: "{{tasks.change-step.outputs.artifacts.REPO}}"

---
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: your-changes
spec:
  templates:
    - name: change-artifact
      inputs:
        artifacts:
          - name: REPO
            path: /tmp/repo
      outputs:
        artifacts:
          - name: REPO
            path: /tmp/repo
      script:
        image: quay.io/bitnami/git
        command: [ bash ]
        source: |
          DIRPATH='{{inputs.artifacts.REPO.path}}'
          cd $DIRPATH
          CHANGE="echo '$(date)' > changed"
          eval $CHANGE
          echo $CHANGE
```
