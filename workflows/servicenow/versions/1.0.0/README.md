# ServiceNow

## Summary

A set of templates to perform operations against a ServiceNow instance

## Requirements
1. create a secret containing 2 pieces of informations to connect to your
ServiceNow instance. See [example](../../assets/sn_auth.yaml)
  - username
  - password

## Templates
1. [createcr](./docs/createcr.md)
1. [updatecr](./docs/updatecr.md)
1. [closecr](./docs/closecr.md)


## Security

Minimal required permissions

[Full rbac permissions list](./rbac.yaml)
