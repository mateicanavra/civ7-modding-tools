# Phase Record - MapGen Core Runtime Civ7

## Current Gate

Active closure checkpoint ready for supervisor review. The row repairs the
native predicate for value-bearing static runtime imports, proves current
source has zero value-bearing candidates, and records wrapper/baseline and
clean-start injected proof.

## Branch / Stack

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`
- Branch: `agent-HG-habitat-grit-mapgen-core-runtime-civ7-closure`
- Parent: `agent-HG-habitat-grit-empty-schema-default-closure`

## Scope

This checkpoint owns:

- predicate repair for `mapgen_core_runtime_civ7`;
- native fixture/parser-edge proof for value imports, side-effect imports,
  mixed value/type imports, runtime globals, path controls, and type-only
  controls;
- parser inventory over current MapGen core/engine roots;
- Habitat wrapper/per-rule selector proof, aggregate `grit-check` proof,
  explicit empty baseline proof, and row-specific injected proof;
- aggregate proof matrix, command proof log, and corpus ledger realignment.

This checkpoint does not own:

- MapGen product behavior or generated output;
- broad type-reference policy;
- Grit apply/codemod behavior;
- raw direct Grit acquisition;
- Effect adapter behavior;
- neighboring adapter/sdk/runtime rows;
- retired parity;
- product/runtime proof.

## Evidence

- `MCR-PREDICATE-REPAIR-2026-06-16`: repaired native import predicate.
- `MCR-NATIVE-FIXTURES-2026-06-16`: 13 positive native matches and 0 ignore
  matches.
- `MCR-NATIVE-CORPUS-REFRESH-2026-06-16`: 32 testable patterns, 0 failures.
- `MCR-CORE-INVENTORY-2026-06-16`: zero value-bearing current-source
  candidates; four pure type-only adapter import controls.
- `MCR-PER-RULE-SELECTOR-2026-06-16`: per-rule wrapper pass with
  `baseline-integrity`.
- `MCR-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` wrapper pass
  with 30 Grit rules plus `baseline-integrity`.
- `MCR-BASELINE-FILES-2026-06-16`: explicit empty baseline plus
  `baseline-integrity`.
- `MCR-INJECTED-PROBE-2026-06-16`: clean-start injected run reports MCR
  passing with one injected value-import diagnostic and a clean out-of-scope
  control; the aggregate run remains exit 1 only for the accepted unrelated
  DDIT adapter activation gap.

## Review / Findings

`MCR-PREDICATE-GAP-2026-06-15` is repaired by the
`import_statement(source=$source)` predicate branch for exact value-bearing
runtime import sources.

`MCR-TYPE-IMPORTS-2026-06-15` is dispositioned inside this row boundary:
current live adapter imports in core/engine are pure type-only controls and do
not violate the registered value-import/runtime-value check.

## Next Actions

1. Run final OpenSpec/diff/deleted/status hygiene.
2. Stop for supervisor review; do not open another HG row until accepted.
