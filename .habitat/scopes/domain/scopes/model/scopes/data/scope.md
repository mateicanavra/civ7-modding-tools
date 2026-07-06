# Domain Model Data Scope

Status: active working reference

Subject:
`<domain>/model/data/`

Ownership boundary:
approved domain-authored data and expectation collections only. Generated
official Civ7 catalogs, policy-table proofs, runtime ids, and adapter catalogs
belong to their external owners.

Architectural evidence:
- domain-authored data and expectation collections belong with the domain model
  they describe;
- official Base Standard resource corpus and runtime-id material route to
  Civ7 map-policy ownership instead.

Controlling rationale:
this scope replaces broad root `lib/` only for data that truly belongs to the
domain. It is closed at approved collection boundaries so data does not become
another algorithm storage folder.

Superseding decision:
root `lib/` is no longer a domain slot, even when some current content is real
domain data. Domain-owned data moves under explicitly admitted
`model/data/<collection>/` destinations; official/generated Civ7 corpus material
moves to its external owner.

Executable topology:

```toml
[[scopes]]
name = "mapgen-resources-model-data-root"
root = "mods/mod-swooper-maps/src/domain/resources/model/data"
kind = "directory"
mode = "closed"
allowed = [
  "earthlike-expectations",
]
```

Nested scopes:
- `scopes/collection/scope.md`

Files:
none

Patterns:
none
