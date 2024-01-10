# ServiceNow

## Summary

A set of templates to perform operations against a ServiceNow instance

## Requirements
1. create a secret containing 2 pieces of informations to connect to your
ServiceNow instance. See [example](../../assets/sn_auth.yml)
  - username
  - password
2. create a secret containing the Codefresh API Key (in the token field). See [example](../../assets/cf_token.yml)
3. install the [local update](../../assets/xml/ServiceNow-Codefresh_Integration_1.3.0.xml) set in your instance

## Templates
1. [createcr](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/docs/createcr.md)
1. [updatecr](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/docs/updatecr.md)
1. [closecr](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/docs/closecr.md)


## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/servicenow/versions/1.3.0/rbac.yaml)
