# create-pr

## Summary
Creates a pull request.

## Inputs/Outputs

### Inputs
#### Artifacts
* repo (required) - an artifact that contains the required repository

#### Parameters
* GITHUB_TOKEN_SECRET (required) - K8s secret name that contains a key named `token` with github access token
* BRANCH (required) - branch name
* MESSAGE (required) - pr message
* PR_TEMPLATE (required) - pull request template

### Outputs
no outputs

## Examples

### Create a pull request from a specific branch back to main
```

```
