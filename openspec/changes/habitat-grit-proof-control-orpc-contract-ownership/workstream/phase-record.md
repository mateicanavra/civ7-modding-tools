# Phase Record - Control oRPC Contract Ownership

## Current Gate

Gate 6 / native fixture and parser inventory checkpoint implemented, verified,
record-aligned, committed, and supervisor-accepted as a bounded checkpoint. The
row is limited to native fixture/parser-edge proof, parser inventory over
control-oRPC source, and record truth. Clean row closure remains a non-claim for
proof classes not separately recorded. Successor HG rows are committed through
`agent-HG-habitat-grit-domain-ops-boundary-imports` at `f268f3bf5`, so this
packet is not the active next-row gate.

## Branch / Stack

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`
- Branch: `agent-HG-habitat-grit-control-orpc-contract-ownership`
- Parent: `agent-HG-habitat-grit-adapter-base-standard-import`
- Historical row-local proof did not consume HR repair layers. Current
  restacked aggregate state inherits shared wrapper/selector, explicit baseline,
  and injected Grit-row proof through `HGPR-HABITAT-GRIT-TOOL-2026-06-15`,
  `HGPR-PER-RULE-SELECTORS-2026-06-15`,
  `HGPR-BASELINE-FILES-2026-06-15`,
  `HGPR-BASELINE-INTEGRITY-2026-06-15`, and
  `HGPR-INJECTED-GRIT-ROWS-2026-06-15`.
- Downstack helper redeclaration blocker, empty-schema ordinary-contract
  predicate gap, MapGen core runtime import/type-import blockers, sibling-stage
  proof boundary, domain-root facade non-claims, wrapper advanced config
  non-claims, placement outcome non-claims, and adapter base-standard non-claims
  remain separate downstream inputs and are not consumed by this row.

## Scope

This checkpoint owns:

- packet and record truth for
  `habitat-grit-proof-control-orpc-contract-ownership`;
- native fixture/parser-edge expansion for
  `.grit/patterns/habitat/checks/control_orpc_contract_ownership.md`;
- parser inventory over current control-oRPC source;
- aggregate proof matrix, command proof log, and corpus ledger realignment.

This checkpoint does not own:

- control-oRPC source refactors;
- predicate repair outside the current direct import/schema export/path
  predicate;
- Grit apply/codemod behavior;
- baseline mutation;
- Habitat command wrapper repair;
- raw adapter/acquisition repair;
- Effect adapter or injected cleanup behavior;
- neighboring oRPC/runtime rows;
- product/runtime proof.

## Evidence

- `COCO-NATIVE-FIXTURES-2026-06-15`: native Grit fixture/parser-edge proof.
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter control_orpc_contract_ownership --json 2>&1`
  exited 0 with one testable pattern, 5 current-predicate positive matches,
  and 0 ignore-sample matches. The root `index.ts` module-contract schema
  re-export probe in the match sample produced no native match and is recorded
  as `COCO-ROOT-INDEX-PREDICATE-GAP-2026-06-15`.
- `COCO-CONTROL-ORPC-INVENTORY-2026-06-15`: parser inventory/live corpus
  evidence. Inline Node/TypeScript compiler API inventory over
  `packages/civ7-control-orpc/src`, excluding `node_modules` and `dist`, used
  the actual current predicate path classes for module `contract.ts` files and
  root `index.ts`. The inventory counted 97 scanned TS/TSX/JSON files; 97
  `.ts`; 0 `.tsx`; 0 `.json`; 14 module contract files; 1 root index file; 15
  current-predicate files; 94 import declarations in module contracts; 42
  type-only imports; 52 value imports; 0 side-effect imports; 0
  module-contract `@civ7/direct-control` imports; 9 direct-control imports
  outside module contracts; 142 exported const declarations in module
  contracts; 0 exported private-schema name matches; 171 unexported
  private-schema name matches; 100 exported schema lookalikes outside the
  private input/result/output/standard name class; 15 root index export
  declarations; 15 root index export-from declarations; 0 root index
  export-from declarations from `./modules/<module>/contract`; 0 root index
  module-contract schema specifier elements; 101 root index schema specifier
  elements from non-module-contract files; 0 dynamic imports in
  current-predicate files; and 0 parse diagnostics.
- Verification commands run so far for this checkpoint:
  `bun run openspec -- validate habitat-grit-proof-control-orpc-contract-ownership --strict`,
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter control_orpc_contract_ownership --json 2>&1`,
  inline Node/TypeScript parser inventory, `bun run openspec:validate`, and
  `git diff --check`.
- Active-packet language guardrail scan:
  `rg -n "fallback|shim|compat|workaround|temporary|scratch"
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/openspec/changes/habitat-grit-proof-control-orpc-contract-ownership
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/docs/projects/habitat-harness/grit-pattern-corpus-ledger.md
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`
  found only this packet's explicit "scratch is not durable proof" guardrail
  language plus unrelated existing aggregate rows.

## Review / Findings

No accepted P1/P2 review findings are open for this row checkpoint. Parser
inventory found 0 live current-row contract ownership candidates. The
root-index module-contract schema re-export class remains a predicate-gap
blocker, so this is not clean rule closure. Outside-contract direct-control
imports and root index non-module-contract schema exports remain path/control
context, not current-row candidates. Supervisor accepted the bounded checkpoint
at `e32a55741`.

## Next Actions

1. Preserve this packet as a bounded, accepted historical checkpoint.
2. Keep the root-index module-contract schema re-export predicate gap, broader
   control-oRPC architecture closure, raw acquisition, Effect adapter closure,
   apply safety, generator/migration proof, product proof, and row-specific proof
   beyond inherited shared wrapper/baseline/injected IDs as non-claims unless
   separately recorded.
