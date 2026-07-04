# Domain Model Config Scope

Status: active working reference

Subject:
`<domain>/model/config/`

Ownership boundary:
domain-owned authoring config objects only. This scope owns one exported config
object per file: schema, type, defaults, and deterministic compile or
normalization transforms local to that object.

Architectural evidence:
- current root `config.ts` and `shared/knobs` files mix multiple config objects
  and make implementation agents guess where displaced config should land;
- stages need config-facing authoring surfaces, but not a broad root facade.

Controlling rationale:
the scope is closed to `*.config.ts` so config decomposition happens before
movement. It anchors each config object under a named config-file law.

Superseding decision:
per-domain root `config.ts` facades are active source evidence, but the selected
target shape is one config object per `*.config.ts` file under `model/config/`.
Root facade shims are outside this scope; any transitional shim requires a
named public import-surface owner-law domino with shape, lifetime, and deletion
trigger.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-model-config-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/model/config"
kind = "directory"
mode = "closed"
allowed = [
  # One exported domain authoring config object per file. This replaces the
  # former root config.ts facade and forces config-object decomposition before
  # moved code can become green.
  "*.config.ts",
]
```

Nested scopes:
none

Files:
- `files/config-part-ts.md`

Patterns:
none
