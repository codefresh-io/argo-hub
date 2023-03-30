# Starting-Template

## Summary

A set of templates to perform operations against [Port](https://getport.io) such as getting an existing Entity or creating/updating an Entity as part of your CI/CD.

## Templates

1. [entity-get](https://github.com/codefresh-io/argo-hub/blob/main/workflows/port/versions/1.1.0/docs/entity-get.md)
2. [entity-upsert](https://github.com/codefresh-io/argo-hub/blob/main/workflows/port/versions/1.1.0/docs/entity-upsert.md)

## Secrets

In order to use the workflow templates, you will need to store the `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET` as secrets in your cluster, you can follow the example shown in the [portCredentials.yml](https://github.com/codefresh-io/argo-hub/blob/main/workflows/port/versions/1.1.0/portCredentials.yaml) file for reference.

Note: if you use the exact same format specified in the portCredentials.yml file, you don't need to provide the secret name and id and secret key names when using the workflow template, as the format in the file matches the defaults picked up by the template inputs.

## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/port/versions/1.1.0/rbac.yaml)

## Complete docs

For more information and examples, take a look at our [documentation](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/ci-cd/codefresh-workflow-template/)
