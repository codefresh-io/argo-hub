# resume-workflow

## Summary
A wrapper on top of argo cli resume operation.

The template provides the easy ability to resume a specific workflow by its name or by label/field selectors

## Inputs/Outputs

### Inputs
* NAME - a string specifying an explicit name of a workflow to resume
* NODE_FIELD_SELECTOR (optional) - a comma separated list of fields to filter workflow nodes

### Outputs
no outputs

## Examples

### resume by a specific name
```
      - name: resume
        templateRef:
          name: argo-hub.argo-workflows.0.0.4
          template: resume-workflow
        arguments:
          parameters:
            - name: NAME
              value: workflow-xyz
```

### resume by both a name and a node field selector
```
      - name: resume
        templateRef:
          name: argo-hub.argo-workflows.0.0.4
          template: resume-workflow
        arguments:
          parameters:
            - name: NAME
              value: workflow-xyz
            - name: NODE_FIELD_SELECTOR
              value: inputs.paramaters.myparam.value=abc
```
