# add-tag

## Summary
This will retag an image in the same repository, only pushing and pulling the top level manifest 

## Inputs/Outputs

### Inputs
* IMAGE (required) - image to be retagged
* SRC_TAG (required) - tag of the original image
* DST_TAG (required) - tag to be placed on image

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: add-tag-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: add-tag
                templateRef:
                    name: argo-hub.registry.0.0.1
                    template: add-tag
                arguments:
                    parameters:
                    -   name: IMAGE
                        value: 
                    -   name: SRC_TAG
                        value: 
                    -   name: DST_TAG
                        value: 
```
