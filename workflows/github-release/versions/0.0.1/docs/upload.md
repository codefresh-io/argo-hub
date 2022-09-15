# Upload

## Summary
Create github release

## Inputs/Outputs

### Inputs
#### Parameters
* BASE_URL              API endpoint (default: "https://api.github.com") 
* DRAFT                 `true` makes the release a draft, and `false` publish the release (default: "false")
* PRERELEASE            if `true` create pre-release (default: "false")
* REPO_OWNER            repository owner (Git username) (required)
* REPO_NAME             repository name (required) 
* RELEASE_NAME          release name (required)
* RELEASE_TAG           release tag  (required)
* RELEASE_DESCRIPTION   release message (required)
* GIT_TOKEN_SECRET      Kubernetes secret name with git token (default: github-token)

### Outputs
#### Artifacts

## Examples

### task Example
```yaml
 apiVersion: argoproj.io/v1alpha1
 kind: Workflow
 metadata:
   name: git-release
 spec:
   templates:
     container:
         image: cfsupport/github-release
         env:
           - name: GITHUB_TOKEN
             valueFrom:
               secretKeyRef:
                 name: '{{inputs.parameters.GIT_TOKEN_SECRET}}'
                 key: token
           - name: REPO_NAME
             value: '{{ inputs.parameters.REPO_NAME }}'
           - name: REPO_OWNER
             value: '{{ inputs.parameters.REPO_OWNER }}'
           - name: RELEASE_NAME
             value: '{{ inputs.parameters.RELEASE_NAME }}'
           - name: RELEASE_TAG
             value: '{{ inputs.parameters.RELEASE_TAG }}'
           - name: RELEASE_DESCRIPTION
             value: '{{ inputs.parameters.RELEASE_DESCRIPTION }}'
         command: [ "/bin/bash" ]
         args: [ "/plugin/run.sh" ]
```
