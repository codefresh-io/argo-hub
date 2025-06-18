# ServiceNow

## Summary

A set of templates to perform operations against a ServiceNow instance.

### Compatibility

The workflowTemplate have been tested on the following instance releases:

* Washington DC

## Requirements
1. Create a secret containing 2 pieces of information to connect to your
   ServiceNow instance. See [example](../../assets/sn_auth.yml)
  - username
  - password
   See the [example](../../assets/sn_auth.yml) for more details.

The user needs change_management permissions.

2. Create a secret containing the Codefresh API Key (in the token field). See
   the [example](../../assets/cf_token.yaml) for more details.
3. install the [local update](../../assets/xml/ServiceNow-Codefresh_Integration_1.3.1.xml)
   set in your instance using the Retrieve Update Sets table. Check with your
   ServiceNow admin if you're not sure or don't have enough permissions. The
   architecture is detailed in this
   [old blog article](https://codefresh.io/blog/servicenow-integration/).

## Templates
1. [createcr](../docs/createcr.md) - Create a new Change Request
1. [createcr](../docs/createcr.md) - Query an existing Change Request
1. [updatecr](../docs/updatecr.md) - Modify an existing Change Request
1. [closecr](../docs/closecr.md) - Close an open Change Request


## Security

Minimal required permissions

[Full rbac permissions list](./rbac.yaml)
