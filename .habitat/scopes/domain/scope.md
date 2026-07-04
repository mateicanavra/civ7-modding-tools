# Domain Scope

Status: active working reference

Subject:
`mods/mod-swooper-maps/src/domain/<domain>/`

Ownership boundary:
one cohesive domain owner. A domain owns recipe-independent map-generation truth
and public domain surfaces. Recipe ordering, stage projection, adapter/runtime
behavior, official Civ7 catalogs, generic mechanics, and Gameplay/playability
ownership route to their own authority surfaces.

Architectural evidence:
- current domain roots all define a domain through root `index.ts`;
- current domain roots all expose a runtime/compile binding through root
  `ops.ts`;
- recipe and step code consume named domain surfaces rather than arbitrary root
  helper paths;
- root `index.ts` is the contract surface;
- architecture authority routes `shared`, `common`, `utils`, `internal`,
  `support`, broad barrels, and broad helper folders into exact owner
  classifications.

Controlling rationale:
the domain root is closed because a domain is a cohesive owner. Defined slots
carry named owner roles. Root helper symbols classify to model config, model
policy, model data, artifact contract, operation-local slots, external owners,
Gameplay/playability ownership, or deletion.

Superseding decision:
an earlier working grammar treated root `config.ts`, root `policy/`, and
data-only root `lib/` as transitional direct slots. The current scope supersedes
that grammar with `model/`: config, policy, and data must decompose under the
domain model before they can become green. This is a stronger selected law.

Applicability boundary:
this scope defines the target law for every domain root selected by the
blueprint-kind glob. Current folder names are source evidence and inventory
corpus; durable ontology comes from the blueprint role and owner decisions.
Slice 001 names the exact current rows selected for implementation.

Evidence command:

```bash
for d in mods/mod-swooper-maps/src/domain/*; do
  [ -d "$d" ] || continue
  printf "%s\t" "${d##*/}"
  find "$d" -mindepth 1 -maxdepth 1 -exec basename {} \; | sort | paste -sd, -
done
```

Planned `structure.toml` fragment:

```toml
[[scopes]]
name = "mapgen-domain-roots"
root = "mods/mod-swooper-maps/src/domain/!(*.*)"
kind = "directory"
mode = "closed"
required = [
  "index.ts",
  "ops.ts",
  "ops",
  "model",
]
allowed = [
  "artifacts",
]
```

Nested scopes:
- `scopes/ops/scope.md`
- `scopes/model/scope.md`
- `scopes/artifacts/scope.md`

Files:
- `files/index-ts.md`
- `files/ops-ts.md`

Patterns:
none
