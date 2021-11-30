# submit-workflow

## Summary
A wrapper on top of argo cli submit operation.

The template provides the easy ability to submit new workflows

## Inputs/Outputs

### Inputs
TEMPLATE_NAME (required) - The template name
ENTRYPOINT (required) - The specific template to use as an entrypoint

### Outputs
no outputs

## Examples

### Submit a workflow 
```
      - name: submit
        templateRef:
          name: codefresh-marketplace.argo-workflows.0.0.2
          template: submit-workflow
        arguments:
          parameters:
            - name: TEMPLATE_NAME
              value: my-template
            - name: ENTRYPOINT
              value: main
```
