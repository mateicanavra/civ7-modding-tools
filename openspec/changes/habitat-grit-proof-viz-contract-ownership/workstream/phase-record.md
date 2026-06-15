# Phase Record - Viz Contract Ownership

## Current Gate

Gate 6 / native fixture and parser inventory blocker checkpoint implemented,
verified, record-aligned, committed, and supervisor-accepted as a bounded
checkpoint. The row is limited to native fixture/parser-edge proof, parser
inventory over standard recipe stage source, and record truth. Clean row closure
remains a non-claim because import predicate gaps and one live intended
private-viz finding remain open, and because proof classes not separately
recorded remain non-claims. Successor HG rows are committed through
`agent-HG-habitat-grit-domain-ops-boundary-imports` at `f268f3bf5`, so this
packet is not the active next-row gate.

## Branch / Stack

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`
- Branch: `agent-HG-habitat-grit-viz-contract-ownership`
- Parent: `agent-HG-habitat-grit-control-orpc-contract-ownership`
- Historical row-local proof did not consume HR repair layers. Current
  restacked aggregate state inherits shared wrapper/selector, explicit baseline,
  and injected Grit-row proof through `HGPR-HABITAT-GRIT-TOOL-2026-06-15`,
  `HGPR-PER-RULE-SELECTORS-2026-06-15`,
  `HGPR-BASELINE-FILES-2026-06-15`,
  `HGPR-BASELINE-INTEGRITY-2026-06-15`, and
  `HGPR-INJECTED-GRIT-ROWS-2026-06-15`.
- Downstack blockers and non-claims remain separate downstream inputs and are
  not consumed by this row.

## Scope

This checkpoint owns:

- packet and record truth for `habitat-grit-proof-viz-contract-ownership`;
- native fixture/parser-edge expansion for
  `.grit/patterns/habitat/checks/viz_contract_ownership.md`;
- parser inventory over current standard recipe stage source;
- aggregate proof matrix, command proof log, and corpus ledger realignment.

This checkpoint does not own:

- Swooper source refactors;
- predicate repair outside the current fixture-proven file-hub branch;
- Grit apply/codemod behavior;
- baseline mutation;
- Habitat command wrapper repair;
- raw adapter/acquisition repair;
- Effect adapter or injected cleanup behavior;
- neighboring visualization/runtime rows;
- product/runtime proof.

## Evidence

- `VCO-NATIVE-FIXTURES-2026-06-15`: native Grit fixture/parser-edge proof.
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter viz_contract_ownership --json 2>&1`
  exited 0 with one testable pattern, 1 `steps/viz.ts` file-hub positive
  match, and 0 ignore-sample matches. Import probes in the match fixture did
  not produce native matches and are recorded as
  `VCO-IMPORT-PREDICATE-GAP-2026-06-15`.
- `VCO-STAGE-VIZ-INVENTORY-2026-06-15`: parser inventory/live corpus evidence.
  Inline Node/TypeScript compiler API inventory over
  `mods/mod-swooper-maps/src/recipes/standard/stages`, excluding
  `node_modules`, `dist`, and `mod`, used the actual current predicate path
  regex `mods/mod-swooper-maps/src/recipes/standard/stages/[^/]+/.*\.ts$`.
  The inventory counted 216 scanned TS/TSX/JSON files; 216 `.ts`; 0 `.tsx`; 0
  `.json`; 212 actual current-predicate `.ts` files; 19 immediate stage
  directories; 23 immediate stage-root entries; 4 immediate stage-root files;
  25 nested step directories; 0 `stages/<stage>/steps/viz.ts` hub files; 3
  stage-level `viz.ts` files; 3 private step `viz.ts` files; 785 all-stage-root
  import declarations; 39 all-stage-root export-from declarations; 776
  current-predicate import declarations; 39 current-predicate export-from
  declarations; 0 dynamic imports; 20 stage-level viz imports; 0 step-hub viz
  imports; 1 private step-viz cross-step import; 2 same-step private viz
  imports; 0 different-stage private viz imports; 0 source lookalikes; and 0
  parse diagnostics.
- Live intended finding:
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts:7`
  imports `./plot-biomes/viz.js`, resolving to
  `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-biomes/viz.js`.
- Verification commands run so far for this checkpoint:
  `bun run openspec -- validate habitat-grit-proof-viz-contract-ownership --strict`,
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter viz_contract_ownership --json 2>&1`,
  inline Node/TypeScript parser inventory, `bun run openspec:validate`, and
  `git diff --check`.

## Review / Findings

No accepted P1/P2 supervisor findings are open for this row checkpoint. The row
records `VCO-IMPORT-PREDICATE-GAP-2026-06-15` and the live private-viz import
finding as blockers, so this is not clean rule closure. Supervisor accepted the
bounded checkpoint at `fd02191ed`.

## Next Actions

1. Preserve this packet as a bounded, accepted blocker checkpoint.
2. Keep import-form predicate closure, private-viz source remediation or
   baseline disposition, broader visualization architecture closure, raw
   acquisition, Effect adapter closure, apply safety, generator/migration proof,
   product proof, and row-specific proof beyond inherited shared
   wrapper/baseline/injected IDs as non-claims unless separately recorded.
