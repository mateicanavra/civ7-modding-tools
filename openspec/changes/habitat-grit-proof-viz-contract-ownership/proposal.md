## Why

`grit-viz-contract-ownership` is an enforced Grit check for keeping standard
recipe visualization contracts at their owning surfaces. Shared visualization
contracts belong at `stages/<stage>/viz.ts`; step-private helpers may remain in
their owning step only. Private step visualization hubs and cross-step private
imports should not become shared contracts.

This checkpoint opens the row packet before proof claims and limits the row to
the independent checkpoint class available in this stack: current-predicate
native fixture proof, parser inventory over standard recipe stage source, and
record truth only.

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

- Add a per-pattern OpenSpec packet for
  `habitat-grit-proof-viz-contract-ownership`.
- Expand the native fixture for current-predicate behavior:
  - `stages/<stage>/steps/viz.ts` hub file positives;
  - import probes for shared `steps/viz.ts` and private step-viz paths,
    recorded as native predicate-gap blockers when the current pattern does not
    report them;
  - controls for stage-level `viz.ts`, same-step private `viz.ts`,
    live-style `./<step>/viz.js` imports, other recipe kinds, `.tsx`, strings,
    dynamic import, and package paths.
- Record a parser inventory over current standard recipe stage source with
  exact scan roots, exclusions, counts, row id, proof-class labels, stage-level
  controls, private-viz counts, live intended-candidate counts, and native
  predicate-gap blockers in durable records.
- Update the aggregate Grit proof matrix, command proof log, and corpus ledger
  for this row's current checkpoint after evidence is gathered.

## What Does Not Change

- No Swooper source is changed.
- No pattern predicate repair is claimed.
- No source remediation, baseline, or apply behavior is claimed.
- No clean viz ownership closure is claimed while import predicate gaps and the
  live private-viz import finding remain open.
- No Habitat wrapper/current-tree proof is claimed.
- No raw Grit acquisition, injected cleanup, Effect adapter, generator/migration,
  retired parity, broader visualization architecture closure, neighboring row,
  or product proof is claimed.

## Owner Boundary

This workstream owns fixture and proof-record truth for
`grit-viz-contract-ownership`.

This workstream does not own Swooper source remediation, visualization contract
migration, predicate semantics repair, baseline mutation, Habitat
wrapper/adapter implementation, or product/runtime proof.

## Requires

- Supervisor acceptance before stacking another row above this checkpoint.
- A landed/restacked command-trust layer before Habitat wrapper selector proof.
- An accepted typed adapter/probe cleanup surface before injected proof.
- The scaffold/baseline contract surface before explicit baseline proof.
- Supervisor/source-owner disposition for the live private step-viz import
  finding and for native import predicate gaps.

## Stop Conditions

- Native fixture behavior requires predicate semantics repair rather than
  current-predicate proof expansion.
- Current inventory finds live visualization ownership candidates and no owner
  accepts remediation, migration, or baseline disposition.
- Closure would rely on stdout artifacts or scratch files.
- Closure would claim wrapper, raw acquisition, baseline, injected, Effect
  adapter, apply, generator/migration, neighboring row, retired parity, broader
  visualization architecture closure, or product proof from native
  fixture/parser inventory evidence.

## Verification Gates

- `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter viz_contract_ownership --json`
- Parser inventory over `mods/mod-swooper-maps/src/recipes/standard/stages`
- `bun run openspec -- validate habitat-grit-proof-viz-contract-ownership --strict`
- `bun run openspec:validate`
- `git diff --check`
