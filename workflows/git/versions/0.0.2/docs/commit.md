# commit

## Summary
Commit a repository and push the provided (input) artifact repository, equivalent to : git add && git commit && git push 
Requires: Input repository was obtained by git/clone template,  The push depends on the remote origin url & token stored in that repository
Note: After commit done, the repository still has the url & token stored.
## Inputs/Outputs
### Inputs
#### Parameters
* MESSAGE (required) - the commit message
* GIT_USER_NAME (required) - git commit username
* GIT_USER_EMAIL (required) - git commit email
* GIT_FILES (optional) - added files, default: `.`
#### Artifacts
* repo (required) - artifact having git repository and configured remote origin url.
## Examples

### task Example
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: git-commit
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: commit-step
        templateRef:
          name: argo-hub.git.0.0.2
          template: commit
        arguments:
          depends: "change-step"
          parameters:
          - name: MESSAGE
            value: 'Commit message'
          - name: GIT_USER_NAME
            value: 'username'
          - name: GIT_USER_EMAIL
            value: 'username@codefresh.io'
          artifacts:
            - name: repo
              from: "{{tasks.change-step.outputs.artifacts.repo}}"
    # change step ...  
```



### Scenario - clone change commit 
* Clone a repository with a argo-hub template and output it as artifact repository
* Call a step your-changes/change-artifact and modify and output an artifact
* Commit and push that repo (artifact) with user details and message provided
* Note: "- serviceAccountName: codefresh-sa," provides permission
* Using default bucket see: [key-only-artifacts](https://argoproj.github.io/argo-workflows/key-only-artifacts), cluster setup: [default-artifacts-repository](https://argoproj.github.io/argo-workflows/artifact-repository-ref)

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
        image: bitnami/git
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
              name: argo-hub.git.0.0.2
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
              name: argo-hub.git.0.0.2
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
