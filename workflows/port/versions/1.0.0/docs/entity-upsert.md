# entity-upsert

## Summary

The `upsert-entity` template creates or updates an entity with the identifier matching the one provided.

## Inputs/Outputs

### Inputs

- `PORT_CREDENTIALS_SECRET` - name of the secret to get the `CLIENT_ID` and `CLIENT_SECRET` from (default: `port-credentials`)
- `PORT_CLIENT_ID_KEY` - key in the secret where the base64 encoded `PORT_CLIENT_ID` is stored (default: `PORT_CLIENT_ID`);
- `PORT_CLIENT_SECRET_KEY` - key in the secret where the base64 encoded `PORT_CLIENT_SECRET` is stored (default `PORT_CLIENT_SECRET`);
- `BLUEPRINT_IDENTIFIER` - identifier of the blueprint to create an entity of;
- `ENTITY_IDENTIFIER` - identifier of the new (or existing) entity. Leave empty to get an auto-generated identifier;
- `ENTITY_TITLE` - Title of the new (or existing) entity;
- `ENTITY_TEAM` - Team of the new (or existing) entity;
- `ENTITY_ICON` - Icon of the new (or existing) entity;
- `ENTITY_PROPERTIES` - Properties of the new (or existing) entity;
- `ENTITY_RELATIONS` - Relations of the new (or existing) entity.

### Outputs

- `ENTITY_IDENTIFIER` - identifier of the new (or existing) entity.

## Examples

### entity-upsert Example

```yaml
- name: entity-upsert
  templateRef:
    name: port
    template: entity-upsert
  arguments:
    parameters:
    # If you save the CLIENT_ID and CLIENT_SECRET in the same format shown in the portCredentials.yml file, there is no need to provide PORT_CREDENTIALS_SECRET, PORT_CLIENT_ID_KEY, PORT_CLIENT_SECRET_KEY
    - name: BLUEPRINT_IDENTIFIER
      value: "microservice"
    - name: ENTITY_IDENTIFIER
      value: "morp"
    - name: ENTITY_TITLE
      value: "Morp-Argo"
    - name: ENTITY_PROPERTIES
      value: |
      {
          "region": "eu-west-4"
      }
```
