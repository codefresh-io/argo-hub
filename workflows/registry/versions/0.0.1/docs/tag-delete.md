# tag-delete

## Summary
TagDelete deletes a tag from the registry

## Inputs/Outputs

### Inputs
* IMAGE (required) - image of the tag to be deleted
* TAG (required) - tag to be deleted

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: tag-delete-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: tag-delete
                templateRef:
                    name: argo-hub.registry.0.0.1
                    template: tag-delete
                arguments:
                    parameters:
                    -   name: IMAGE
                        value: example-image
                    -   name: TAG
                        value: 'lastest'
```
