# Domain Artifacts Scope

Status: active working reference

Subject:
`<domain>/artifacts/`

Ownership boundary:
artifact namespace only. The domain owns artifact contract placement here, not
runtime artifact helpers, markdown notes, or broad artifact implementation code.

Architectural evidence:
pipeline truth products need explicit contracts consumed by stages, steps, or
artifact assemblers. Broad `artifacts/` contents outside contracts previously
hid non-contract material.

Controlling rationale:
`artifacts/` exists as the route to `artifacts/contract/`. The domain artifact
surface stays tied to explicit artifact contracts.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-artifacts-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/artifacts"
kind = "directory"
mode = "closed"
required = [
  "contract",
]
```

Nested scopes:
- `scopes/contract/scope.md`

Files:
none

Patterns:
none
