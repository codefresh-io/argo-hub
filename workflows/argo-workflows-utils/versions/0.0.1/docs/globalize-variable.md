# globalize-variable

## Summary
Easily expose a new variable globally.

## Inputs/Outputs

### Inputs
NAME (required) - the name of the new variable to be created
VALUE (required) - the value of the new variable

### Outputs
exposes a `globalName` variable

## Examples

### expose a variable globally for future use in exit handler
```
      - name: terminate
        templateRef:
          name: codefresh-marketplace.argo-workflows.0.0.3
          template: main
        arguments:
          parameters:
            - name: NAME
              value: workflow-xyz
```
