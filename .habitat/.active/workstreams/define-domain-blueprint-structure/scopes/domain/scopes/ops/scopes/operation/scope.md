# Domain Operation Scope

Status: active working reference

Subject:
`<domain>/ops/<operation-id>/`

Ownership boundary:
one operation root owns one step-callable pure operation: its contract, runtime
entrypoint, local types, rules, policy, and strategies. Cross-operation policy,
domain model data, stage projection, adapter behavior, and reusable core
mechanics route to their owning scopes.

Architectural evidence:
- operation contracts are canonical in operation-local `contract.ts`;
- the domain `ops/contracts.ts` registry names operation ids;
- operation implementations are assembled through the domain operation registry;
- current operation helper folders show that shared operation-family support
  becomes ambiguous when it is not decomposed to this level or to a true external
  owner.

Controlling rationale:
the operation root repeats the domain law at a smaller scale. A folder under
`ops/` is not a workspace for arbitrary helper files; it is an operation owner
with a contract, runtime entrypoint, and narrow internal implementation slots.

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-operation-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/ops/!(*.*)"
kind = "directory"
mode = "closed"
required = [
  "contract.ts",
  "index.ts",
]
allowed = [
  "types.ts",
  "rules",
  # Blueprint integration seam: the domain-operation blueprint owns the
  # operation root and names `strategies` as the strategy container route. The
  # strategy topology packet closes strategy internals.
  "strategies",
  "policy",
]
```

Nested scopes:
- `scopes/policy/scope.md`
- `scopes/rules/scope.md`
- `scopes/strategies/scope.md`

Files:
- `files/contract-ts.md`
- `files/index-ts.md`
- `files/types-ts.md`

Patterns:
none
