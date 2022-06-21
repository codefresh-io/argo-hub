# tag-list

## Summary
TagList returns a tag list from a repository

## Inputs/Outputs

### Inputs
* IMAGE (required) - image of the tags to be listed
* TAG (required) - tag to be deleted

### Outputs
no outputs

## Examples

### task Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: tag-list-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: tag-list
                templateRef:
                    name: argo-hub.registry.0.0.1
                    template: tag-list
                arguments:
                    parameters:
                    -   name: IMAGE
                        value: example-image
                    -   name: TAG
                        value: 'lastest'
```
