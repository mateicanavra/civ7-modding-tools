## Why

`grit-mapgen-core-runtime-civ7` is an enforced Grit check for MapGen core
purity: `@swooper/mapgen-core` core and engine source must stay independent
from Civ7 runtime values and engine globals. Runtime coupling belongs in the
adapter/control layers, not in the pure TypeScript engine.

This checkpoint opens the row packet and limits the row to the independent
checkpoint class available in this stack: native fixture proof for the proven
current runtime-global member behavior, parser inventory over MapGen
core/engine roots, and record truth only. Import enforcement remains a
predicate/proof blocker in this checkpoint.

## Target Authority Refs

- `packages/mapgen-core/AGENTS.md`
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

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-mapgen-core-runtime-civ7`.
- Expand the native fixture for current behavior:
  - Civ7 runtime globals/member expressions such as `GameplayMap`,
    `TerrainBuilder`, `ResourceBuilder`, `FeatureBuilder`, `AreaBuilder`,
    `MapConstructibles`, and `GameInfo`;
  - current predicate-gap controls for Civ7 adapter imports,
    `/base-standard/` imports, side-effect imports, and type-only adapter
    imports that the textual predicate intends to cover but native Grit did
    not report in this checkpoint;
  - path controls for authoring/adapter-style MapGen paths, packages outside
    `mapgen-core`, tests, `.tsx`, and source lookalikes;
  - parser-edge classification for type-only adapter imports in live source.
- Record a parser inventory over current MapGen core/engine roots with exact
  scan roots, exclusions, counts, row id, and proof-class labels in durable
  records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint.

## What Does Not Change

- No MapGen source is changed.
- No pattern predicate repair is claimed; import-class enforcement remains
  blocked by the current native predicate behavior.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, retired parity, neighboring row, or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-mapgen-core-runtime-civ7`.

This workstream does not own MapGen source remediation, baseline mutation,
Habitat wrapper/adapter implementation, or cross-file import migration.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live
  current-predicate runtime coupling.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current native fixture behavior exposes an import-class predicate gap and the
  row records it as a blocker rather than repairing it locally.
- Current inventory finds live current-predicate runtime coupling and no owner
  accepts remediation or baseline disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, neighboring row, or product proof from native fixture/parser
  inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter mapgen_core_runtime_civ7 --json`
- `bun run openspec -- validate habitat-grit-proof-mapgen-core-runtime-civ7 --strict`
- `bun run openspec:validate`
- `git diff --check`
