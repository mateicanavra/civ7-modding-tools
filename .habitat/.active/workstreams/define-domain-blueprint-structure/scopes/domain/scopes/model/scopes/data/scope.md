# Domain Model Data Scope

Status: active working reference

Subject:
`<domain>/model/data/`

Ownership boundary:
domain-authored data and expectation collections only. Generated official Civ7
catalogs, policy-table proofs, runtime ids, and adapter catalogs belong to their
external owners.

Architectural evidence:
- domain-authored data and expectation collections belong with the domain model
  they describe;
- official Base Standard resource corpus and runtime-id material route to
  Civ7 map-policy ownership instead.

Controlling rationale:
this scope replaces broad root `lib/` only for data that truly belongs to the
domain. It is closed at collection boundaries so data does not become another
algorithm storage folder.

Superseding decision:
root `lib/` is no longer a domain slot, even when some current content is real
domain data. Domain-owned data moves under `model/data/`; official/generated
Civ7 corpus material moves to its external owner.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-model-data-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/model/data"
kind = "directory"
mode = "closed"
allowed = [
  # Domain-owned data and expectation-table collections only. This replaces
  # root lib/ for data that truly belongs to the domain. Reusable/generated
  # Civ7 policy tables and legality helpers belong to @civ7/map-policy instead.
  "!(*.*)",
]
```

Nested scopes:
- `scopes/collection/scope.md`

Files:
none

Patterns:
none
