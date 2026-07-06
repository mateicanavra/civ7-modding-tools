# Domain Model Data Collection Scope

Status: active working reference

Subject:
`<domain>/model/data/<collection>/`

Ownership boundary:
one named domain model data collection. The collection owns data records,
expectation tables, and narrow types for that collection only.

Architectural evidence:
domain-authored data collections need stable domain-owned homes, while reusable
official Civ7 catalogs route to map-policy ownership.

Controlling rationale:
the collection scope makes domain data explicit and named. A data file belongs
inside a collection that describes what the data is for. A collection becomes an
executable destination only when its concrete name and file set are admitted by
the domain topology rule.

Executable topology:

```toml
[[scopes]]
name = "mapgen-resources-earthlike-expectations-data-root"
root = "mods/mod-swooper-maps/src/domain/resources/model/data/earthlike-expectations"
kind = "directory"
mode = "closed"
allowed = [
  "index.ts",
  "official-earthlike.ts",
  "types.ts",
]
```

Nested scopes:
none

Files:
- `files/data-file-ts.md`

Patterns:
none
