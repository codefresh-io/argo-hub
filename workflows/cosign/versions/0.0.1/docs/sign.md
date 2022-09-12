# task

## Summary
Create and upload a signature for image.

## Inputs/Outputs

### Inputs
IMAGE_NAME (required) - Specify the name of the image to be signed, example `example/image`
TAG (required) - Specify the tag to be signed, example `latest`

### Outputs
no outputs

## Examples

### sign Example
```
  - name: cosign-image
    templateRef:
      name: argo-hub.cosign.0.0.1
      template: cosign
    arguments:
      parameters:
        - name: IMAGE_NAME
          value: '{{ inputs.parameters.IMAGE_NAME }}'
        - name: TAG
          value: '{{ inputs.parameters.IMAGE_TAG }}'
```
