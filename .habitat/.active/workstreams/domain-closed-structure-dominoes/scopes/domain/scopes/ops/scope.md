# Domain Ops Scope

Status: active working reference

Subject:
`<domain>/ops/`

Ownership boundary:
the domain owns the `ops/` container as the bridge from domain contract to
operation contracts and operation implementations. Shared operation-family
helper content routes to exact operation, model, artifact, core,
stage/projection, external owner, Gameplay, or deletion dispositions.

Architectural evidence:
- `ops/contracts.ts` is the registered operation contract surface;
- root `ops.ts` binds the domain contract to implementations through
  `createDomain(...)`;
- registered operation counts total `109`;
- current immediate `ops/` folders exceed registered operation counts by the
  three non-operation folders `score-shared`, `shared`, and `mountains-shared`.

Controlling rationale:
immediate `ops/` children are closed to registries and operation roots because
every child folder at this level should be a domain operation. Shared support is
classified to operation-local, model, artifact, core, stage/projection,
external owner, Gameplay, or deletion.

Evidence command:

```bash
for f in mods/mod-swooper-maps/src/domain/*/ops/contracts.ts; do
  domain="${f#mods/mod-swooper-maps/src/domain/}"
  domain="${domain%%/*}"
  ops_dir="${f%/contracts.ts}"
  registered="$(rg -c '^  [a-zA-Z0-9]+:' "$f" || true)"
  children="$(find "$ops_dir" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
  printf "%s\tregistered=%s\tchildren=%s\n" "$domain" "$registered" "$children"
done
```

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-ops-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)/ops"
kind = "directory"
mode = "closed"
required = [
  "contracts.ts",
  "index.ts",
]
allowed = [
  # Blueprint integration seam: selected child role is a registry-backed
  # domain-operation root. The no-dot glob is the structure expression paired
  # with the registry coverage pattern; the domain-operation topology packet
  # closes each operation root.
  "!(*.*)",
]
```

Nested scopes:
- `scopes/operation/scope.md`

Files:
- `files/contracts-ts.md`
- `files/index-ts.md`

Patterns:
- `patterns/registry-covers-operation-children.md`
