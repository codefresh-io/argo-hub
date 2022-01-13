# commit

## Summary
Commit a repository and push it as an artifact

## Inputs/Outputs

### Inputs
#### Parameters
* MESSAGE (required) - the commit message
* GIT_USER_NAME (required) - git commit username
* GIT_USER_EMAIL (required) - git commit email

#### Artifacts
* repo (required) - artifact having git repository which has a configured remote origin to push to.
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
          name: argo-hub.git-artifact.0.0.1
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
