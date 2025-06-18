# watchcr

## Summary
Close a Change Request on the ServiceNow instance

## Inputs/Outputs

### Inputs
#### Parameters
* SN_INSTANCE (required) - URL of the ServiceNow instance aka https://instance.service-now.com
* SN_AUTH (required) - Secret name containing the user and password to log into the instance
* CR_SYSID (required) - the sysid of the Change Request record created previously.
* LOG_LEVEL (optional) - A flag to indicate log-level. Values are info, debug, warning, error, critical. Default value is info.
* CR_TASK_NAME (optional) - Check for status of task of change request
* CR_WATCH_TIMEOUT (required) - Duration timeout in seconds of watch.
* CR_WATCH_SLEEP_INTERVAL (required) - How long in seconds between Servicenow queries.
* CR_WATCH_RESUME_STATE (required) - Servicenow state used to resume release.
* CR_WATCH_CANCEL_STATE (required) - Servicenow state used to cancel release.

### Outputs
None


### createcr + watchcr Example
```
# DO NOT REMOVE the following attributes:
# annotations.codefresh.io/workflow-origin (identifies type of Workflow Template as Promotion Workflow)
# annotations.version (identifies version of Promotion Workflow used)
# annotations.description (identifies intended use of the Promotion Workflow)
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: snow-create-cr-poll-for-state
  annotations:
    version: 0.0.1
    codefresh.io/workflow-origin: promotion
    description: Create Change Request and Poll State
spec:
  serviceAccountName: cf-default-promotion-workflows-sa
  arguments:
    parameters:
    - name: APP_NAME
  entrypoint: sn-open-cr-pre
  templates:
  - name: sn-open-cr-pre
    outputs:
      parameters:
      - name: CR_SYSID
        valueFrom:
          expression: "tasks['create-sn-cr'].outputs.parameters['CR_SYSID']"
    dag:
      tasks:
        - name: create-sn-cr
          templateRef:
            name: argo-hub.servicenow.1.5.0
            template: createcr
          arguments:
            parameters:
            - name: TOKEN
              value: cf-api-token
            - name: SN_INSTANCE
              value: 'https://dev310957.service-now.com'
            - name: SN_AUTH
              value: "sn-auth"
            - name: POLLING
              value: True
            - name: CR_DATA
              value: >-
                {"short_description": "{{ workflow.parameters.APP_NAME }} deployment",
                "description": "Change for build {{workflow.uid}}.\nThis change was created by the Codefresh GitOps promotion flow",
                "justification": "My app is awesome! Please deploy ASAP",
                "cmdb_ci":"tomcat", "assignment_group":"a715cd759f2002002920bde8132e7018"
                }
          
        - name: watch-sn-cr
          dependencies: [ create-sn-cr ]
          templateRef:
            name: argo-hub.servicenow.1.5.0
            template: watchcr
          arguments:
            parameters:
            - name: SN_INSTANCE
              value: 'https://dev310957.service-now.com'
            - name: SN_AUTH
              value: "sn-auth"
            - name: CR_SYSID
              value: "{{ tasks.create-sn-cr.outputs.parameters.CR_SYSID }}"
            - name: CR_WATCH_TIMEOUT
              value: "259200"
            - name: CR_WATCH_SLEEP_INTERVAL
              value: "300"
            - name: CR_WATCH_RESUME_STATE
              value: In Progress
            - name: CR_WATCH_CANCEL_STATE
              value: Canceled
```
