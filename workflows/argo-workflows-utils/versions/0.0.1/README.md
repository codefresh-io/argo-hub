# Starting Template

## Summary

A set of workflow template examples that specifies two executions:
- echo: a dag template that includes an entry point for the initial template that should be invoked when the workflow spec is executed.  
- globalize-variable: once the entry point template is completed, the status of the workflow is returned in the global variable. 

Other possible utilities include parameter substitution, artifacts, fixtures, loops, and recursive workflows.

## Templates

1. [echo](https://github.com/codefresh-io/argo-hub/blob/main/workflows/argo-workflows-utils/versions/0.0.1/docs/echo.md)
2. [globalize-variable](https://github.com/codefresh-io/argo-hub/blob/main/workflows/argo-workflows-utils/versions/0.0.1/docs/globalize-variable.md)

## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/argo-workflows-utils/versions/0.0.1/rbac.yaml)
