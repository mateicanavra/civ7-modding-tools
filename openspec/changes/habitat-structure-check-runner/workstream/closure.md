# Closure: Habitat Structure Check Runner

## What Landed

- Added native `structure-check` rule ownership, registry facts, selector support,
  and execution wiring.
- Added a closed TOML v1 parser/evaluator for current-tree topology:
  `schemaVersion`, `scopes`, root globs, direct-child `required`/`allowed`/
  `forbidden`, and `open`/`closed` directory modes.
- Kept the filesystem read contract in `resources/platform`, with the platform
  provider supplying the implementation.
- Split `preserve_standard_stage_topology_and_path_invariants`:
  - pure stage file-tree topology now belongs to `structure-check`;
  - literal recipe stage-key order now belongs to
    `verify_standard_recipe_declared_stage_keys`;
  - legacy alias/source-token checks remain with their existing owner.

## Proofs

- `bun install`
- `bun run --cwd tools/habitat test`
- `bun run --cwd tools/habitat check`
- `nx run habitat:build`
- `bun tools/habitat/bin/dev.ts check --tool structure-check --json`
- `bun tools/habitat/bin/dev.ts check --rule preserve_standard_stage_topology_and_path_invariants --json`
- `bun tools/habitat/bin/dev.ts check --rule verify_standard_recipe_declared_stage_keys --json`
- `bun tools/habitat/bin/dev.ts check --rule prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases --json`
- `bun tools/habitat/bin/dev.ts check --rule verify_runtime_stage_order_matches_contract_manifest --json`
- `bun run openspec -- validate habitat-structure-check-runner --strict`
- `git diff --check`

## Ready Next

The next conversion wave can target remaining pure file-tree topology assertions
without inventing bespoke command scripts. Grit remains the owner for source
syntax and import/export authority; command-check only retains residual bespoke
assertions until they receive a narrower owner.
