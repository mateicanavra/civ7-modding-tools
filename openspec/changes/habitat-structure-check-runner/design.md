# Design: Habitat Structure Check Runner

## Frame

`structure-check` owns current-tree file topology. It is not a domain-specific
stage topology checker, not a Grit substitute, and not a command-check alias.
The runner consumes the existing platform filesystem resource through a small
read-port interface declared in `resources/platform`.

## Interface

Registry records use:

```json
{
  "ownerTool": "structure-check",
  "structureFile": ".habitat/.../<rule-id>.structure.toml",
  "detect": ["habitat", "check", "--tool", "structure-check"]
}
```

`structureFile` is repo-relative in v1. That avoids adding loader-source-path
metadata while rule packets are still physically rooted in `.habitat`.

## TOML V1

```toml
schemaVersion = 1

[[scopes]]
name = "stage-root"
root = "mods/mod-swooper-maps/src/recipes/standard/stages"
kind = "directory"
mode = "closed"
required = ["foundation-mantle"]
allowed = ["foundation"]
forbidden = ["_legacy-*"]
```

- Root globs match repo-relative paths.
- Child globs match direct child names only.
- `kind = "directory"` supports direct-child topology checks.
- `kind = "file"` supports root file-presence checks only.
- `mode = "open"` ignores extra direct children.
- `mode = "closed"` rejects direct children that match neither `required` nor
  `allowed`.
- `forbidden` wins over `required` and `allowed`.

If child kind matters, use another scope with `kind = "file"` or
`kind = "directory"` over a root glob. Do not add hidden kind semantics to
`required`.

## Resource Boundary

The resource interface lives in `resources/platform`:

```ts
HabitatFileSystemReadPort
```

The provider remains the platform provider. `structure-check` does not own or
provide filesystem access; it only adapts the resource into topology
evaluation.

## Canary Split

`preserve_standard_stage_topology_and_path_invariants` now owns only:

- standard stage root topology;
- active stage directories;
- aggregate/helper roots;
- retired direct-child names;
- required `index.ts` files for active stage directories.

`verify_standard_recipe_declared_stage_keys` owns the literal
`orderStandardStages({ ... })` key order. Legacy stage alias source-token bans
remain with `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`.

## Testing Shape

- Registry contract tests admit `structure-check` only with `structureFile`.
- Facts tests prove structure records do not appear in command execution facts.
- TOML/evaluator tests cover adversarial topology cases with a fake read port.
- Execution tests prove selected structure rules do not call command, Grit, or
  Nx ports.
- Canary CLI checks prove normal Habitat report/baseline consumption.
