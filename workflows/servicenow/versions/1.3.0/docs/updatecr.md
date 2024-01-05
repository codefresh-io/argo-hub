# updatecr

## Summary
Modify a  Change Request on the ServiceNow instance

## Inputs/Outputs

### Inputs
#### Parameters
* SN_INSTANCE (required) - URL of the ServiceNow instance aka https://instance.service-now.com
* SN_AUTH (required) - Secret name containing the user and password to log into the instance
* CR_DATA (required) - a string containing a JSON body to allow the modification of the Change Request. The exact content is dependent on your implementation of Change Management and what fields you want to update.
* CR_SYSID: the sysid of the Change Request record created previously.
* LOG_LEVEL (optional) - A flag to indicate log-level. Values are info, debug, warning, error, critical. Default value is info.

### Outputs

None


### updatecr Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: update-cr
spec:
  entrypoint: main
  templates:
  - name: main
    dag:
      tasks:
      - name: update-sn-cr
        templateRef:
          name: argo-hub.servicenow.1.0.0
          template: updatecr
        arguments:
          parameters:
          - name: SN_INSTANCE
            value: "https://XXXX.service-now.com"
          - name: SN_AUTH
            value: "sn-auth"
          - name: LOG_LEVEL
            value: warning
          - name: CR_SYSID
            value: '{{ tasks.create-sn-cr.outputs.parameters.CR_SYSID}}'
          - name: CR_DATA
            value: '{"work_notes":"Image build with tag latest"}'
```
