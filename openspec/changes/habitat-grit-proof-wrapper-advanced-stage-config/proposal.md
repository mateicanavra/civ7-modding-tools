## Why

`grit-wrapper-advanced-stage-config` is an enforced Grit check for keeping the
retired wrapper-only `advanced` stage config surface out of standard recipe and
map config source. Current config ownership belongs to supported step/domain
config paths instead of SDK-native nested `advanced` wrappers.

This checkpoint opens the row packet before proof claims and limits the row to
the independent checkpoint class available in this stack: current-predicate
native fixture proof, parser inventory over current Swooper recipe/map config
source, and record truth only.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `openspec/changes/archive/2026-05-30-normalize-config-surface/implementation.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/wrapper_advanced_stage_config.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-wrapper-advanced-stage-config`.
- Expand the native fixture for current-predicate behavior:
  - object-literal `advanced` property positives;
  - string-literal `"advanced"` property positives;
  - in-scope `.test.ts` positives as current-predicate facts;
  - standard recipe and map config source positives;
  - controls for supported step-id config, ordinary advanced words, packages,
    domain source, non-standard recipes, `.tsx` / `.test.tsx` extension
    exclusions, other mods, and generated-output-shaped paths.
- Record a parser inventory over current Swooper standard recipe and map roots
  with exact scan roots, exclusions, counts, row id, and proof-class labels in
  durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint after evidence is gathered.

## What Does Not Change

- No Swooper recipe or map source is changed.
- No pattern predicate repair is claimed.
- No broader config-surface or retired parity closure is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, baseline, injected cleanup, Effect adapter, apply
  safety, generator/migration, neighboring row, or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-wrapper-advanced-stage-config`.

This workstream does not own Swooper recipe/map source remediation, config
normalization migration, baseline mutation, Habitat wrapper/adapter
implementation, or broader config-surface policy.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live
  current-predicate wrapper `advanced` config candidates.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate wrapper `advanced` config
  candidates and no owner accepts remediation, migration, or baseline
  disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, generator/migration, neighboring row, retired parity, broader
  config-surface, or product proof from native fixture/parser inventory
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter wrapper_advanced_stage_config --json`
- Parser inventory over `mods/mod-swooper-maps/src/recipes/standard` and
  `mods/mod-swooper-maps/src/maps`
- `bun run openspec -- validate habitat-grit-proof-wrapper-advanced-stage-config --strict`
- `bun run openspec:validate`
- `git diff --check`
