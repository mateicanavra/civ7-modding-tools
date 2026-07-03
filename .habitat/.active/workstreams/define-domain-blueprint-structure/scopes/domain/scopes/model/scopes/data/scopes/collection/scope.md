# Domain Model Data Collection Scope

Status: active working reference

Subject:
`<domain>/model/data/<collection>/`

Ownership boundary:
one named domain model data collection. The collection owns data records,
expectation tables, and narrow types for that collection only.

Architectural evidence:
resource planning expectations need a stable domain-owned home, but reusable
official Civ7 catalogs route to map-policy ownership.

Controlling rationale:
the collection scope makes domain data explicit and named. A data file belongs
inside a collection that describes what the data is for.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-model-data-entry-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/model/data/!(*.*)"
kind = "directory"
mode = "closed"
allowed = [
  "*.ts",
]
```

Nested scopes:
none

Files:
- `files/data-file-ts.md`

Patterns:
none
