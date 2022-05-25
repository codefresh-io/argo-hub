# submit-workflow

## Summary
A wrapper on top of argo cli submit operation.

The template provides the easy ability to submit new workflows without waiting for their result.

This is useful in case you want to trigger a new workflowTemplate without having to wait for its execution or have it affect on your own final satus

## Inputs/Outputs

### Inputs
* TEMPLATE_NAME (required) - The template name
* ENTRYPOINT (required) - The specific template to use as an entrypoint

### Outputs
The child workflow definition in a json format

## Examples

### Submit a workflow 
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: argo-workflows-submit-workflow-
spec:
  entrypoint: main
  templates:
    - name: main
      dag:
        tasks:
          - name: submit
            templateRef:
              name: argo-hub.argo-workflows.0.0.3
              template: submit-workflow
            arguments:
              parameters:
                - name: TEMPLATE_NAME
                  value: 'argo-hub.argo-workflows-utils.0.0.1'
                - name: ENTRYPOINT
                  value: 'echo'
```
