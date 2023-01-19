# stop-workflow

## Summary
A wrapper on top of argo cli stop operation.

The template provides the easy ability to stop a specific workflow by its name or by label/field selectors

## Inputs/Outputs

### Inputs
* NAME (optional) - a string specifying an explicit name of a workflow to stop
* LABEL_SELECTOR (optional) - a comma separated list of labels to filter on
* FIELD_SELECTOR (optional) - a comma separated list of fields to filter on
* NODE_FIELD_SELECTOR (optional) - a comma separated list of fields to filter workflow nodes
* MESSAGE (optional) - a message to add to previously running nodes

### Outputs
no outputs

## Examples

### stop by a specific name
```
      - name: stop
        templateRef:
          name: argo-hub.argo-workflows.0.0.4
          template: stop-workflow
        arguments:
          parameters:
            - name: NAME
              value: workflow-xyz
```

### stop by a label selector
```
      - name: stop
        templateRef:
          name: argo-hub.argo-workflows.0.0.4
          template: stop-workflow
        arguments:
          parameters:
            - name: LABEL_SELECTOR
              value: git-branch={{ workflow.labels.git-branch }},workflow-template-name=argo-platform-ci
```

### stop by a field selector
```
      - name: stop
        templateRef:
          name: argo-hub.argo-workflows.0.0.4
          template: stop-workflow
        arguments:
          parameters:
            - name: FIELD_SELECTOR
              value: metadata.name!={{ workflow.name }}
```

### stop by both a label and field selectors
```
      - name: stop
        templateRef:
          name: argo-hub.argo-workflows.0.0.4
          template: stop-workflow
        arguments:
          parameters:
            - name: LABEL_SELECTOR
              value: git-branch={{ workflow.labels.git-branch }},workflow-template-name=argo-platform-ci
            - name: FIELD_SELECTOR
              value: metadata.name!={{ workflow.name }}
```

### stop by both a name and a node field selector
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
