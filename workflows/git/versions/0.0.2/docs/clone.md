# clone

## Summary
Clone a repository into a provided (output) artifact. git/clone template is for use with git/commit template. Equivalent to : git clone url (with embeeded token)
If the artifact repository is not used for git/commit, them use git/clone-s3 instead.
Beware: When the template is done the (output) artifact has remote origin url and token stored in .git/config remote "origin". 
## Inputs/Outputs

### Inputs
#### Parameters
* REPO_URL (required) - the repository you want to clone (for example: https://github.com/codefresh-io/argo-hub)
* REVISION (optional) - the revision to checkout. defaults to `main`
* GIT_TOKEN_SECRET (required) - the k8s secret name that contains a key named `token` with the git secret inside it

### Outputs
#### Artifacts
* repo - will contain the cloned repository and pushed

## Examples

### task Example
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: git-clone
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: clone-step
        templateRef:
          name: argo-hub.git.0.0.2
          template: clone
        arguments:
          parameters:
          - name: REPO_URL
            value: 'https://github.com/codefresh-io/argo-hub'
          - name: GIT_TOKEN_SECRET
            value: 'git-token-name'
        outputs:
          - artifacts:
            - name: repo
              path: /{{ workflow.name }}/cloned
      # change & commit steps
```
