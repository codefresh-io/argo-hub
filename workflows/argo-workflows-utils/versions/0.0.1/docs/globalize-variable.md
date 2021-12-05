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
In order to use dynamic calculated variable inside an exit handler, a global variable must be declared.
Using the globalize-variable makes this eaiser.

```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: argo-workflows-utils-globalize-variable-
spec:
  entrypoint: main
  onExit: exit-handler
  templates:
    - name: main
      dag:
        tasks:
          - name: globalize-varible
            templateRef:
              name: codefresh-marketplace.argo-workflows-utils.0.0.1
              template: globalize-variable
            arguments:
              parameters:
              - name: NAME
                value: GLOBAL_VARIABLE
              - name: VALUE
                value: 'value'

    - name: exit-handler
      dag:
        tasks:
        - name: exit
          templateRef:
            name: codefresh-marketplace.argo-workflows-utils.0.0.1
            template: echo
          arguments:
            parameters:
              - name: TEXT
                value: '{{ workflow.outputs.parameters.GLOBAL_VARIABLE }}'

```
