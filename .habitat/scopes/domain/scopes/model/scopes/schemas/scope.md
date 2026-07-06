# Domain Model Schemas Scope

Status: active working reference

Subject:
`<domain>/model/schemas/`

Ownership boundary:
domain-owned reusable schema primitives only. This scope owns TypeBox schema
fragments, exported primitive types, enums, and small semantic schema packets
that operation contracts and stage authoring surfaces compose.

This scope does not own full operation input/output/strategy envelopes, stage
public schemas, knobs composition, public-to-internal `compile` mappings, or
reusable semantic policy. Operation envelopes stay with
`ops/<operation-id>/contract.ts`; stage authoring stays with the owning stage;
policy routes to `model/policy/`.

Controlling rationale:
`model/schemas/` replaces the ambiguous `model/config/` destination. The goal
is to make reusable domain primitives available without recreating a domain
config bag under a nicer name.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-model-schemas-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/model/schemas"
kind = "directory"
mode = "closed"
allowed = [
  "index.ts",
  "*.schema.ts",
]
```

Nested scopes:
none

Files:
- `files/schema-primitive-ts.md`

Patterns:
covered by `.habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/`.
