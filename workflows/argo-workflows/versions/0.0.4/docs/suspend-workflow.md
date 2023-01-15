# suspend-workflow

## Summary
A wrapper on top of argo cli suspend operation.

The template provides the easy ability to suspend a specific workflow by its name

## Inputs/Outputs

### Inputs
* NAME - a string specifying an explicit name of a workflow to suspend

### Outputs
no outputs

## Examples

### suspend by a specific name
```
      - name: suspend
        templateRef:
          name: argo-hub.argo-workflows.0.0.4
          template: suspend-workflow
        arguments:
          parameters:
            - name: NAME
              value: workflow-xyz
```

