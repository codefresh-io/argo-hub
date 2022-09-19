# task

## Summary
Create and upload a signature for image.

## Inputs/Outputs

### Inputs
IMAGE_NAME (required) - Specify the name of the image to be signed, example `example/image`
TAG (required) - Specify the tag to be signed, example `latest`
COSIGN ( optional ) - The password to be used when signing or verifying images. Defaults to `password`

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
        - name: COSIGN_PASSWORD
          value: "password"
```
