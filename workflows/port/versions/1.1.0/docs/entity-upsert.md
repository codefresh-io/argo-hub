# entity-upsert

## Summary

The `upsert-entity` template creates or updates an entity with the identifier matching the one provided.

## Inputs/Outputs

### Inputs

- `PORT_CREDENTIALS_SECRET` - name of the secret to get the `CLIENT_ID` and `CLIENT_SECRET` from (default: `port-credentials`)
- `PORT_CLIENT_ID_KEY` - key in the secret where the base64 encoded `PORT_CLIENT_ID` is stored (default: `PORT_CLIENT_ID`);
- `PORT_CLIENT_SECRET_KEY` - key in the secret where the base64 encoded `PORT_CLIENT_SECRET` is stored (default `PORT_CLIENT_SECRET`);
- `BLUEPRINT_IDENTIFIER` - identifier of the blueprint to create an entity of (this is a **required** parameter);
- `ENTITY_IDENTIFIER` - identifier of the new (or existing) entity. Leave empty to get an auto-generated identifier (default: `null`, Port will auto generate an identifier for this entity);
- `ENTITY_TITLE` - Title of the new (or existing) entity (default: `null`, Port will create an entity without a title);
- `ENTITY_TEAM` - Teams array of the new (or existing) entity (default: `null`, Port will create an entity without a team);
- `ENTITY_ICON` - Icon of the new (or existing) entity (default: `null`, Port will create an entity with the default blueprint icon);
- `ENTITY_PROPERTIES` - Properties of the new (or existing) entity (default: `null`, Port will create an entity with empty properties);
- `ENTITY_RELATIONS` - Relations of the new (or existing) entity (default: `null`, Port will create an entity without relations).

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
