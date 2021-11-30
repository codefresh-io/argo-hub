# terminate-workflow

## Summary
A wrapper on top of argo cli terminate operation.

The template provides the easy ability to terminate a specific workflow by its name or by label/field selectors

## Inputs/Outputs

### Inputs
NAME (optional) - a string specifiying an explicit name of a workflow to terminate
LABEL_SELECTOR (optional) - a comma separated list of labels to filter on
FIELD_SELECTOR (optional) - a comma separated list of fields to filter on

### Outputs
no outputs

## Examples

### terminate by a specific name
```
      - name: terminate
        templateRef:
          name: codefresh-marketplace.argo-workflows.0.0.2
          template: main
        arguments:
          parameters:
            - name: NAME
              value: workflow-xyz
```

### terminate by a label selector
```
      - name: terminate
        templateRef:
          name: codefresh-marketplace.argo-workflows.0.0.2
          template: main
        arguments:
          parameters:
            - name: LABEL_SELECTOR
              value: git-branch={{ workflow.labels.git-branch }},workflow-template-name=argo-platform-ci
```

### terminate by a field selector
```
      - name: terminate
        templateRef:
          name: codefresh-marketplace.argo-workflows.0.0.2
          template: main
        arguments:
          parameters:
            - name: FIELD_SELECTOR
              value: metadata.name!={{ workflow.name }}
```

### terminate by both a label and field selectors
```
      - name: terminate
        templateRef:
          name: codefresh-marketplace.argo-workflows.0.0.2
          template: main
        arguments:
          parameters:
            - name: LABEL_SELECTOR
              value: git-branch={{ workflow.labels.git-branch }},workflow-template-name=argo-platform-ci
            - name: FIELD_SELECTOR
              value: metadata.name!={{ workflow.name }}
```
