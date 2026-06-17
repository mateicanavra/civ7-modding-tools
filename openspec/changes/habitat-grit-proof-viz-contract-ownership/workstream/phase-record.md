# Phase Record - Viz Contract Ownership

## Current Gate

Gate 7 / VCO closure checkpoint is implemented, locally committed, and pending
supervisor review. This row now owns predicate repair plus source remediation
for the one live same-stage cross-step private-viz import. It also owns
row-specific wrapper, baseline, and injected proof. Product/runtime proof, raw
direct Grit acquisition, generated output, apply safety, broader visualization
architecture closure, and aggregate injected-corpus closure while DDIT remains
blocked are non-claims.

## Branch / Stack

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`
- Branch: `agent-HG-habitat-grit-viz-contract-ownership-closure`
- Parent: `agent-HG-habitat-grit-control-orpc-contract-ownership-closure`
- This is a local-only Graphite row above the accepted COCO checkpoint.

## Scope

This checkpoint owns:

- predicate repair in `.grit/patterns/habitat/checks/viz_contract_ownership.md`;
- source remediation for the live `map-ecology` cross-step private-viz import;
- focused source tests/checks for the moved helper and updated import path;
- parser inventory over current standard recipe stage source;
- per-rule and aggregate Habitat wrapper proof;
- explicit empty baseline and `baseline-integrity` proof;
- row-specific injected violation/path-control proof;
- aggregate proof matrix, command proof log, and corpus ledger realignment.

This checkpoint does not own:

- generated-output edits or freshness;
- raw direct Grit acquisition;
- Grit apply/codemod behavior;
- Effect adapter behavior;
- generator/migration behavior;
- retired parity;
- neighboring visualization/runtime rows;
- broader visualization architecture or evergreen DL-7 documentation closure;
- aggregate injected-corpus closure while DDIT remains blocked;
- product/runtime proof.

## Evidence

- `VCO-PREDICATE-REPAIR-2026-06-16`: predicate repair uses
  `import_statement(source=$source)` and row-owned source-shape guards for
  shared `steps/viz.ts` imports and cross-step private `viz.ts` imports.
- `VCO-SOURCE-REMEDIATION-2026-06-16`: the shared map-ecology biome-id
  visualization helper moved from `steps/plot-biomes/viz.ts` to
  `stages/map-ecology/viz.ts`; `plotBiomes.ts` and the focused
  `plot-biomes-viz-meta` test now consume the stage surface.
- `VCO-NATIVE-FIXTURES-2026-06-16`: focused native proof currently passes with
  6 positive current-predicate matches and 0 ignore-sample matches.
- `VCO-STAGE-VIZ-INVENTORY-2026-06-16`: parser inventory currently records 0
  `steps/viz.ts` hub files, 4 stage-level `viz.ts` files, 2 private step
  `viz.ts` files, 21 stage-level viz imports, 0 step-hub viz imports, 0
  private step-viz cross-step imports, 2 same-step private viz imports, 0
  current VCO matches, and 0 parse diagnostics.
- `VCO-INJECTED-PROBE-2026-06-16`: clean-start injected proof exits 1 only for
  accepted unrelated DDIT; VCO passes with one diagnostic at the injected
  cross-step private-viz import path, a clean same-step private control, clean
  initial/final git state, and clean probe cleanup.

## Review / Findings

The previous bounded blocker checkpoint remains historical evidence only. Its
import predicate-gap and live private-viz finding are superseded by this closure
checkpoint. Supervisor guardrail required this packet realignment because source
remediation is now in scope.

## Next Actions

Stop for supervisor review. Do not open the next HG row until this VCO
checkpoint receives supervisor disposition.
