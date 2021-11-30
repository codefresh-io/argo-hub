# echo

## Summary
Print some text

## Inputs/Outputs

### Inputs
TEXT (required) - a freestyle text to print

### Outputs
no outputs

## Examples

### expose a variable globally for future use in exit handler
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: argo-workflows-utils-echo-
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: hello-world
        templateRef:
          name: codefresh-marketplace.argo-workflows-utils.0.0.1
          template: echo
        arguments:
          parameters:
          - name: TEXT
            value: 'hello world'
```
