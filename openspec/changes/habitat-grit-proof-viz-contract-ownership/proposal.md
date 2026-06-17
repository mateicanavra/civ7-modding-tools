## Why

`grit-viz-contract-ownership` is an enforced Grit check for keeping standard
recipe visualization contracts at their owning surfaces. Shared visualization
contracts belong at `stages/<stage>/viz.ts`; step-private helpers may remain in
their owning step only. Private step visualization hubs and cross-step private
imports should not become shared contracts.

The prior bounded VCO checkpoint found a predicate gap for import declarations
and one live same-stage cross-step private-viz import. This checkpoint repairs
the predicate and remediates the live source finding by moving the shared
map-ecology helper to the stage-level owner surface.

## Target Authority Refs

- `tools/habitat-harness/src/rules/rules.json`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`
- `docs/projects/habitat-harness/discrepancy-log.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md`
- `.grit/patterns/habitat/checks/viz_contract_ownership.md`

## What Changes

- Repair the VCO Grit predicate to use `import_statement(source=$source)` and
  row-owned source-shape guards for shared `steps/viz.ts` imports and
  cross-step private `viz.ts` imports.
- Expand native fixtures for static named/default import declarations and
  side-effect import declarations, with stage-level and same-step private
  controls.
- Move the shared map-ecology biome-id visualization helper to
  `stages/map-ecology/viz.ts`, update `plotBiomes.ts`, and update the focused
  plot-biomes visualization metadata test import.
- Update the row-specific injected probe to exercise the repaired cross-step
  private-viz import class.
- Record current parser inventory, source proof, wrapper proof, baseline proof,
  injected proof, OpenSpec proof, and downstream aggregate alignment.

## What Does Not Change

- No generated output is edited.
- No raw direct Grit acquisition is claimed.
- No Grit apply/codemod behavior or apply safety is claimed.
- No broad visualization architecture closure or evergreen DL-7 documentation
  closure is claimed.
- No Effect adapter, generator/migration, retired parity, neighboring row,
  aggregate injected-corpus closure while DDIT remains blocked, or
  product/runtime proof is claimed.

## Owner Boundary

This workstream owns predicate repair, source remediation for the one live
VCO-owned private-viz import, and proof-record truth for
`grit-viz-contract-ownership`.

This workstream does not own generated-output freshness, broader visualization
migration, Habitat adapter implementation, or product/runtime proof.

## Requires

- Native focused and full-corpus Grit proof.
- Parser inventory proving zero current VCO candidates after remediation.
- Swooper source proof for the moved helper and updated import path.
- Habitat per-rule and aggregate `grit-check` wrapper proof.
- Explicit empty baseline and `baseline-integrity` proof.
- Row-specific injected proof for the repaired import class.
- OpenSpec validation and diff/deleted/status hygiene.

## Stop Conditions

- The source remediation changes runtime semantics beyond moving the shared
  visualization helper to the stage owner surface.
- Native proof cannot distinguish row-owned cross-step private-viz imports from
  same-step private controls.
- Habitat wrapper/current-tree proof reports current VCO diagnostics after
  remediation.
- Closure would claim generated-output freshness, apply safety, raw acquisition,
  aggregate injected-corpus closure, or product/runtime proof.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter viz_contract_ownership --json`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`
- Parser inventory over `mods/mod-swooper-maps/src/recipes/standard/stages`
- Focused Swooper test for plot-biomes viz metadata
- `bun run --cwd packages/mapgen-core build`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run habitat:check -- --json --rule grit-viz-contract-ownership`
- `bun run habitat:check -- --json --tool grit-check`
- `bun openspec/changes/habitat-grit-proof-repair/workstream/run-injected-probes.ts --require-clean-start`
- `bun run openspec -- validate habitat-grit-proof-viz-contract-ownership --strict`
- `bun run openspec -- validate habitat-grit-proof-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
