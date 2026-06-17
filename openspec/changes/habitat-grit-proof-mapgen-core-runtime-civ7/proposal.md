## Why

`grit-mapgen-core-runtime-civ7` is an enforced Grit check for MapGen core
purity: `@swooper/mapgen-core` core and engine source must stay independent
from Civ7 runtime values and engine globals. Runtime coupling belongs in the
adapter/control layers, not in the pure TypeScript engine.

This checkpoint closes the prior row-owned blocker by repairing the native
predicate to match value-bearing static imports from Civ7 adapter and
`/base-standard/` sources while keeping pure type-only adapter imports as
non-runtime controls. The row then proves the active check through native
fixtures, parser inventory, Habitat wrapper selection, explicit empty baseline
ownership, and row-specific injected violation/path-control evidence.

## Target Authority Refs

- `packages/mapgen-core/AGENTS.md`
- `packages/mapgen-core/src/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/invariant-corpus.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/mapgen_core_runtime_civ7.md`

## What Changes

- Repair `mapgen_core_runtime_civ7` to use `import_statement(source=$source)`
  for exact value-bearing static imports from `@civ7/adapter`,
  `@civ7/adapter/civ7`, and `/base-standard/...` under the registered
  MapGen core/engine scope.
- Keep pure `import type` and single-line pure inline `import { type ... }`
  adapter imports as native controls because the registry forbids adapter
  value imports and runtime values, not erased type-only references.
- Expand fixtures for value import shapes, side-effect imports, mixed
  value/type imports, runtime-global member expressions, path controls,
  `.tsx` controls, source lookalikes, and local name lookalikes.
- Record parser inventory over current MapGen core/engine roots with exact
  value-candidate and type-only-control buckets.
- Prove the active Habitat rule through per-rule wrapper selection, aggregate
  `grit-check` health, explicit empty baseline ownership, and row-specific
  injected violation/path-control evidence.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current proof boundary.

## What Does Not Change

- No MapGen source is changed; current source already has zero value-bearing
  candidates in the repaired predicate.
- No raw direct Grit acquisition proof is claimed.
- No generated-output edit, Effect adapter proof, apply/codemod safety,
  retired parity, neighboring adapter/sdk/runtime row closure, or product
  runtime proof is claimed.
- No broad type-reference ban is claimed. Existing type-only adapter imports
  remain parser inventory controls for this row.

## Owner Boundary

This workstream owns the `grit-mapgen-core-runtime-civ7` predicate, fixture
proof, parser inventory, Habitat wrapper/baseline/injected proof records, and
aggregate row truth.

This workstream does not own MapGen product behavior, adapter architecture,
raw Grit adapter acquisition, or cross-file import migration.

## Requires

- Native fixture proof for the repaired predicate.
- Deterministic parser inventory over `packages/mapgen-core/src/core` and
  `packages/mapgen-core/src/engine`.
- Habitat per-rule and aggregate `grit-check` wrapper proof.
- Explicit empty baseline and `baseline-integrity` proof.
- Row-specific injected violation/path-control proof.
- Supervisor acceptance before stacking another row above this checkpoint.

## Stop Conditions

- Native fixtures show value-bearing import branches cannot be matched without
  false positives against pure type-only imports.
- Parser inventory finds live value-bearing runtime coupling candidates and no
  source owner accepts remediation or baseline disposition.
- Habitat wrapper or injected proof reports current-tree diagnostics outside
  the intended injected probe.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim raw acquisition, generated-output freshness, Effect
  adapter behavior, apply safety, neighboring row closure, or product/runtime
  proof from this Grit check.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter mapgen_core_runtime_civ7 --json`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`
- deterministic TypeScript parser inventory over MapGen core/engine roots
- `bun run habitat:check -- --json --rule grit-mapgen-core-runtime-civ7`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-mapgen-core-runtime-civ7 --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
