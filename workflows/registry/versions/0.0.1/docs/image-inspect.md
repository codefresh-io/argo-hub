# image-inspect

## Summary
This will inspect an image in the same repository

## Inputs/Outputs

### Inputs
* IMAGE (required) - image to be inspected
* TAG (required) - tag of the original image

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: image-inspect-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: image-inspect
                templateRef:
                    name: argo-hub.registry.0.0.1
                    template: image-inspect
                arguments:
                    parameters:
                    -   name: IMAGE
                        value: example-image
                    -   name: TAG
                        value: 'lastest'
```
