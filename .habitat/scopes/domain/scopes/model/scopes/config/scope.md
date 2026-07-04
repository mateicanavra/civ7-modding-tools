# Domain Model Config Scope

Status: active working reference

Subject:
`<domain>/model/config/`

Ownership boundary:
domain-owned reusable primitives and config contracts only. This scope owns one
exported domain schema fragment, enum, type, invariant, defaults object, or
config contract per file when that object is composed by stage authoring
surfaces or operation contracts.

This scope does not own stage authoring surfaces. Public stage schemas,
`knobsSchema`, public-to-internal `compile` mappings, and local stage
composition belong with the owning stage. Operation and strategy config belongs
with operation contracts. Reusable semantic policy belongs under
`model/policy/` unless the mapping is object-local to one primitive or config
contract.

Architectural evidence:
- current root `config.ts` and `shared/knobs` files mix multiple config objects
  and make implementation agents guess where displaced config should land;
- stages need reusable domain primitives for authoring surfaces, but not a
  broad root domain config facade;
- the MapGen stage authoring model already makes stage public schemas, knobs,
  and compile mappings stage-owned.

Controlling rationale:
the scope is closed to `*.config.ts` so primitive/config-contract
decomposition happens before movement. It anchors each domain-owned primitive or
contract under a named file law without creating a parallel domain-owned stage
authoring surface.

Presence is conditional until the Domain Model Config Law decision resolves it:
this scope governs accepted domain-owned `model/config/` files, but it does not
itself require every domain root to contain `model/config/`.

Superseding decision:
per-domain root `config.ts` facades are active source evidence, but the selected
target shape is one reusable domain primitive or config contract per
`*.config.ts` file under `model/config/`.
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
  # One exported domain primitive or config contract per file. This replaces the
  # former root config.ts facade and forces primitive/contract decomposition
  # before moved code can become green.
  "*.config.ts",
]
```

Nested scopes:
none

Files:
- `files/config-part-ts.md`

Patterns:
none
