## Why

`grit-placement-outcome-boundary` is an enforced Grit check for keeping the
terminal Swooper placement apply step from returning to direct official
resource/discovery generator calls. Placement apply consumes typed outcome
artifacts; official generator output is not accepted truth at that boundary.

This checkpoint opens the row packet before proof claims and limits the row to
the independent checkpoint class available in this stack: current-predicate
native fixture proof, parser inventory over current Swooper placement apply
source, and record truth only.

## Target Authority Refs

- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `tools/habitat-harness/src/rules/rules.json`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/placement_outcome_boundary.md`

## What Changes

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-placement-outcome-boundary`.
- Expand the native fixture for current-predicate behavior:
  - direct `generateOfficialResources(...)` positives;
  - direct `generateOfficialDiscoveries(...)` positives;
  - controls for typed placement outcome consumption, same-name property/member
    lookalikes, non-placement apply paths, generated-output-shaped paths,
    package paths, `.tsx`, and other mods.
- Record a parser inventory over current Swooper terminal placement apply source
  with exact scan roots, exclusions, counts, row id, and proof-class labels in
  durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint after evidence is gathered.

## What Does Not Change

- No Swooper placement source is changed.
- No pattern predicate repair is claimed.
- No source remediation, baseline, or apply behavior is claimed.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, injected cleanup, Effect adapter, generator/migration,
  retired parity, broader placement product closure, neighboring row, or
  product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-placement-outcome-boundary`.

This workstream does not own Swooper placement source remediation, placement
contract migration, baseline mutation, Habitat wrapper/adapter implementation,
or product/runtime placement proof.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition if parser inventory finds live direct
  official-generator call candidates.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live current-predicate official-generator call
  candidates and no owner accepts remediation, migration, or baseline
  disposition.
- Closure would rely on temporary stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, generator/migration, neighboring row, retired parity, broader
  placement product, or product proof from native fixture/parser inventory
  evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter placement_outcome_boundary --json`
- Parser inventory over
  `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/placement`
- `bun run openspec -- validate habitat-grit-proof-placement-outcome-boundary --strict`
- `bun run openspec:validate`
- `git diff --check`
