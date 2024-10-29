# createcr

## Summary
Create a new Change Request on the ServiceNow instance

## Inputs/Outputs

### Inputs
#### Parameters
* TOKEN (required) - Secret name containing the Codefresh API Key
* SN_INSTANCE (required) - URL of the ServiceNow instance aka https://instance.service-now.com
* SN_AUTH (required) - Secret name containing the user and password to log into the instance
* CR_DATA (required) - a string containing a JSON body to allow the creation of the Change Request. The exact content is dependent on your implementation of Change Management
* CF_RUNTIME (required) - name of the GtiOps Runtime
* CF_URL (required for onprem) - URL of your Codefresh instance. Default is 'https://g.codefresh.io'
* CR_CONFLICT_POLICY (optional) - Policy to execute in case of schedule conflict. Accepted values are `ignore` (no check is done), `wait` (workflow will wait until the conflict is resolved) or `reject` (ServiceNow flow returns a deny answer). Default value is `ignore`
* LOG_LEVEL (optional) - A flag to indicate log-level. Values are `info`, `debug`, `warning`, `error`, `critical`. Default value is `info`.

### Outputs
#### Parameters
* CR_SYSID: the sysid of the record created that can be use to update or close the Change Request later on
* CR_NUMBER: a more human readable Change Request Number

## Examples

### createcr Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: create-cr
spec:
  entrypoint: create-sn-cr
  templates:
  - name: main
    dag:
      tasks:
      - name: create-sn-cr
        templateRef:
          name: argo-hub.servicenow.1.3.1
          template: createcr
        arguments:
          parameters:
          - name: TOKEN
            value: cf-token
          - name: SN_INSTANCE
            value: "https://XXXX.service-now.com"
          - name: SN_AUTH
            value: "sn-auth"
          - name: CF_RUNTIME
            value: csdp
          - name: LOG_LEVEL
            value: debug
          - name: CR_DATA
            value: >-
              {"short_description": "Application deployment to QA environment",
              "description": "Change for build {{workflow.id}}.\nThis change was created by the ServiceNow Workflow template",
              "justification": "I do not need a justification\nMy app is awesome",
              "cmdb_ci":"tomcat"
              }
```
