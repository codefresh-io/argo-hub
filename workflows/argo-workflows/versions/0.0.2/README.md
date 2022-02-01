# Argo Workflow

## Summary

Templates that allow you to interact with your Argo Workflow instance and provide useful utilities to your pipeline.

## Templates

1. [submit-workflow](https://github.com/codefresh-io/argo-hub/blob/main/workflows/argo-workflows/versions/0.0.2/docs/submit-workflow.md) 
2. [terminate-workflow](https://github.com/codefresh-io/argo-hub/blob/main/workflows/argo-workflows/versions/0.0.2/docs/terminate-workflow.md)

## Security

The workflowTemplate requires permissions on all the argo workflow related CRDs including:

1. workflows
2. workflowtemplates

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/argo-workflows/versions/0.0.2/rbac.yaml)
