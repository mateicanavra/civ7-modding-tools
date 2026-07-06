# Domain Model Scope

Status: active working reference

Subject:
`<domain>/model/`

Ownership boundary:
the domain model owns domain-authored config objects, semantic policy, and
domain-authored data or expectation tables. Official Civ7 facts,
adapter/runtime behavior, stage projection, generic helpers, and
operation-local implementation logic route to their owning scopes.

Architectural evidence:
- root config facades and helper folders currently mix config, policy, data, and
  implementation concerns;
- stages consume domain config-like authoring objects, but root `config.ts`
  facades became too broad;
- resource policy review separated domain-authored expectations from official
  Civ7 policy catalogs.

Controlling rationale:
`model/` replaces broad root helper slots with explicit model subscopes. It
forces displaced config, policy, and data to become named objects or concerns
before implementation can make the tree green.

Superseding decision:
the model scope intentionally replaces the older direct root `config.ts`,
`policy/`, and narrow data-only `lib/` slots. Existing consumers and source
facades are evidence for the need to preserve semantics, not evidence that the
old root locations are destination authority.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-model-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/model"
kind = "directory"
mode = "closed"
required = []
allowed = [
  "config",
  "policy",
  "data",
]
```

Nested scopes:
- `scopes/config/scope.md`
- `scopes/policy/scope.md`
- `scopes/data/scope.md`

Files:
none

Patterns:
none
