# Domain Blueprint

A domain is one public composition boundary over direct semantic subdomains.
Its source root has one closed spine:

```text
mods/<mod>/src/domain/<domain>/
  index.ts
  contract.ts
  router.ts
  <semantic-subdomain>/
```

The domain structure law owns only this root spine and excludes other direct
files. Each direct child directory is a semantic subdomain whose internal shape
belongs to its own blueprint once real members exist.

MapGen Core and TypeScript own non-empty branch identity, duplicate operation
refusal, and exact router alignment. Operation, artifact, schema, policy, and
data blueprints own their respective child kinds rather than duplicating those
laws here.
