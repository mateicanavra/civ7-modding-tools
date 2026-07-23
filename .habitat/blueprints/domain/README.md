# Domain Blueprint

A domain is one public composition boundary over direct semantic subdomains.
Its source root has one closed spine:

```text
mods/<mod>/src/domain/<domain>/
  index.ts
  contract.ts
  router.ts
  atoms/                    # optional shared domain vocabulary
  policy/                   # optional shared domain policy
  <semantic-subdomain>/
```

The domain structure law owns only this root spine. `required` defines the
public aggregate, `allowed` admits optional capabilities and child
directories, and the closed scope excludes every other direct member. Every
non-capability child is a semantic subdomain whose own blueprint requires its
internal spine.

MapGen Core and TypeScript own non-empty branch identity, duplicate operation
refusal, and exact router alignment. Operation, atom, policy, and artifact
blueprints own their respective child kinds rather than duplicating those laws
here.
