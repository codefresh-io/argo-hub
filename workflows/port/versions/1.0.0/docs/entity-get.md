# entity-get

## Summary

The `get-entity` template gets an existing Port Entity as part of the workflow, and exposes its values as outputs for later workflow steps.

## Inputs/Outputs

### Inputs

- `PORT_CREDENTIALS_SECRET` - name of the secret to get the `CLIENT_ID` and `CLIENT_SECRET` from (default: `port-credentials`)
- `PORT_CLIENT_ID_KEY` - key in the secret where the base64 encoded `PORT_CLIENT_ID` is stored (default: `PORT_CLIENT_ID`);
- `PORT_CLIENT_SECRET_KEY` - key in the secret where the base64 encoded `PORT_CLIENT_SECRET` is stored (default `PORT_CLIENT_SECRET`);
- `BLUEPRINT_IDENTIFIER` - identifier of the blueprint the target entity is from;
- `ENTITY_IDENTIFIER` - identifier of the target entity.

### Outputs

- `PORT_COMPLETE_ENTITY` - complete entity JSON;
- `PORT_BLUEPRINT_IDENTIFIER` - identifier of the blueprint the target entity is from;
- `PORT_ENTITY_IDENTIFIER` - identifier of the target entity;
- `PORT_ENTITY_TITLE` - title of the entity;
- `PORT_ENTITY_PROPERTIES` - all properties of the entity in JSON format;
- `PORT_ENTITY_RELATIONS` - all relations of the entity in JSON format;

## Examples

### entity-get Example

```yaml
- name: entity-get
  templateRef:
    name: port
    template: entity-get
  arguments:
    parameters:
    - name: PORT_CREDENTIALS_SECRET
       value: "port-credentials"
    - name: PORT_CLIENT_ID_KEY
      value: "PORT_CLIENT_ID"
    - name: PORT_CLIENT_SECRET_KEY
      value: "PORT_CLIENT_SECRET"
    - name: BLUEPRINT_IDENTIFIER
      value: "microservice" # Replace with your target blueprint identifier
    - name: ENTITY_IDENTIFIER
      value: "morp" # Replace with your target entity identifier
```

To access the workflow outputs, use `{{workflow.outputs.parameters.[OUTPUT_PARAM]}}`
