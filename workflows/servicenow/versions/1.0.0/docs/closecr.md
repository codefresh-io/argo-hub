# closecr

## Summary
Close a Change Request on the ServiceNow instance

## Inputs/Outputs

### Inputs
#### Parameters
* SN_INSTANCE (required) - URL of the ServiceNow instance aka https://instance.service-now.com
* SN_AUTH (required) - Secret name containing the user and password to log into the instance
* CR_DATA (optional) - a string containing a JSON body to allow the modification of the Change Request in addition to closing it. The exact content is dependent on your implementation of Change Management and what fields you want to update.
* CR_CLOSE_CODE (required) - Closing code. Value can be "successful", "successful_issues" or "unsuccessful". Default is "successful"
* CR_CLOSE_NOTES (required) - a string to add to the closure information
* CR_SYSID (required) - the sysid of the Change Request record created previously.
* LOG (optional) - A flag to indicate log-level. Values are info, debug, warning, error, critical. Default value is info.

### Outputs

None


### closecr Example
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
          - name: LOG
            value: info
          - name: CR_SYSID
            value: '{{ tasks.create-sn-cr.outputs.parameters.CR_SYSID}}'
          - name: CR_CLOSE_CODE
              value: "successful"
            - name: CR_CLOSE_NOTES
              value: "Closed automatically by Argo-Hub ServiceNow workflow template"

```
