# createcr

## Summary
Create a new Change Request on the ServiceNow instance

## Inputs/Outputs

### Inputs
#### Parameters
* SN_INSTANCE (required) - URL of the ServiceNow instance aka https://instance.service-now.com
* SN_AUTH (required) - Secret name containing the user and password to log into the instance
* CR_DATA (required) - a string containing a JSON body to allow the creation of the Change Request. The exact content is dependent on your implementation of Change Management
* DEBUG (optional) - A flag to show additional debug information. Default value is false.

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
          name: argo-hub.servicenow.1.0.0
          template: createcr
        arguments:
          parameters:
          - name: SN_INSTANCE
            value: "https://XXXX.service-now.com"
          - name: SN_AUTH
            value: "sn-auth"
          - name: DEBUG
            value: true
          - name: CR_DATA
            value: >-
              {"short_description": "Application deployment to QA environment",
              "description": "Change for build {{workflow.id}}.\nThis change was created by the ServiceNow Workflow template",
              "justification": "I do not need a justification\nMy app is awesome",
              "cmdb_ci":"tomcat"
              }
```
