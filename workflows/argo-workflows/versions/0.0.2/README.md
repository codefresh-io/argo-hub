# Argo Workflow

## Summary

A set of templates to allow you to interact with your argo workflow instance and provide usefull utils.

## Templates

1. [submit-workflow](./docs/submit-workflow-README.md) 
2. [terminate-workflow](./docs/terminate-workflow-README.md)

## Security

The workflowTemplate requires permissions on all the argo workflow related CRDs including:

1. workflows
2. workflowtemplates

[Full rbac permissions list](./rbac.yaml)
