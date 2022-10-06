# Codefresh-run

## Summary
This template is used to trigger Codefresh Classic pipelines, it prints build logs, build ID, build result and build link.

## Inputs/Outputs

### Inputs
* CF_API_SECRET (required) - Kubernetes secret name that contains a key named `token` with the codefresh [api key](https://codefresh.io/docs/docs/integrations/codefresh-api/#authentication-instructions).
* PIPELINE_ID (required) - Pipeline name or ID
* TRIGGER_ID (optional) - Trigger name
* BRANCH (optional) - Branch name
* SHA (optional) - Commit sha
* NO_CACHE (optional) - Ignore cached images
* NO_CF_CACHE (optional) - Ignore Codefresh cache optimizations
* ENABLE_NOTIFICATIONS (optional) - Report notifications about pipeline execution
* RESET_VOLUME (optional) - Reset pipeline cached volume
* RUNTIME_NAME (optional) - Runtime environment to run the pipeline
* CONTEXT (optional) - Run pipeline with context
* VARIABLE_FILE (optional) - Set build variables from a file
* VARIABLES (optional) - Variables to pass to the build (no spaces, separated by commas)

### Outputs
no outputs

## Examples


```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: codefresh-run-
spec:
    entrypoint: main
    templates:
    -   name: main
        dag:
            tasks:
            -   name: cf-run
                templateref:
                    name: argo-hub.codefresh-run.0.0.1
                    template: codefresh-run
                arguments:
                    parameters:
                      - name: CF_API_SECRET
                        value: CF-API-key-k8s-secret
                      - name: PIPELINE_ID
                        value: pipeline-id
                      - name: TRIGGER_ID     
                        value: trigger-name
                      - name: BRANCH        
                        value: master
                      - name: VARIABLES      
                        value: "foo=bar,alice=bob"
```
