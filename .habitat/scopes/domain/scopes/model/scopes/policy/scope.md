# Domain Model Policy Scope

Status: active working reference

Subject:
`<domain>/model/policy/`

Ownership boundary:
domain semantic policy only: classification encodings, domain-owned legality
interpretation, scoring policy, selection policy, and interpretation over domain
artifacts. Official Civ7 facts, adapter behavior, stage projection, TypeBox
schema primitives, stage public authoring composition, and operation-local
policy are exterior.

Architectural evidence:
- root helper files currently hold stable domain concepts such as biome
  classification, river classes, boundary types, and terrain-score encodings;
- official Civ7 resource/feature facts route to map-policy rather than domain
  model policy;
- operation-local policies stay under the owning operation.

Controlling rationale:
this scope exists to prevent two bad outcomes: dumping domain semantic law into
generic helper files, and misclassifying official Civ7 facts as domain policy.

Superseding decision:
root `policy/` was previously treated as a narrow direct slot. The selected
target shape moves domain-wide policy under `model/policy/` so the model owns
semantic law explicitly and root policy content routes through named model
policy concerns.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-model-policy-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/model/policy"
kind = "directory"
mode = "closed"
allowed = [
  # Domain-level model policy concerns only. Operation-local policy remains
  # under ops/<op-id>/policy/. Official Civ7 facts must route to map-policy,
  # civ7-types, or adapter owners instead of becoming domain policy.
  "*.ts",
]
```

Nested scopes:
none

Files:
- `files/policy-concern-ts.md`

Patterns:
covered by `.habitat/blueprints/domain/require_domain_model_schema_policy_owner_shape/`.
