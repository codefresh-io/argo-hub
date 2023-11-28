# ServiceNow

## Summary

A set of templates to perform operations against a ServiceNow instance

## Requirements
1. create a secret containing 2 pieces of informations to connect to your
ServiceNow instance. See [example](../../assets/sn_auth.yaml)
  - username
  - password

## Templates
1. [createcr](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/docs/createcr.md)
1. [updatecr](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/docs/updatecr.md)
1. [closecr](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/docs/closecr.md)


## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/rbac.yaml)
