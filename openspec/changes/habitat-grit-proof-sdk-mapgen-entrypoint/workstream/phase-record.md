# Phase Record - SDK MapGen Entrypoint

## Current Gate

Gate 6 / native fixture and parser inventory checkpoint implemented, verified,
record-aligned, and committed for supervisor review. The row is limited to
native fixture/parser-edge proof, parser inventory over SDK and mapgen-core
source, and record truth. Clean row closure remains a non-claim until supervisor
acceptance and dependency-bound proof classes are available.

## Branch / Stack

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`
- Branch: `agent-HG-habitat-grit-sdk-mapgen-entrypoint`
- Parent: `agent-HG-habitat-grit-viz-contract-ownership`
- Base stack still does not include the HR repair layers, so Habitat wrapper
  selector/current-tree proof and typed adapter/injected cleanup proof remain
  unavailable in this row's stack/base.

## Scope

This checkpoint owns:

- packet and record truth for `habitat-grit-proof-sdk-mapgen-entrypoint`;
- native fixture/parser-edge expansion for
  `.grit/patterns/habitat/checks/sdk_mapgen_entrypoint.md`;
- parser inventory over current SDK and mapgen-core source;
- aggregate proof matrix, command proof log, and corpus ledger realignment.

This checkpoint does not own package source remediation, SDK public contract
changes, predicate repair beyond the SDK-root named value re-export branch
repaired by `SME-P2-NAMED-REEXPORT-PREDICATE-GAP-2026-06-15` and the inline
type-only control branch repaired by
`SME-P2-INLINE-TYPE-REEXPORT-CONTROL-GAP-2026-06-15`, Grit apply/codemod
behavior, baseline mutation, Habitat command wrapper repair, raw
adapter/acquisition repair, Effect adapter or injected cleanup behavior,
multiline or alternate-whitespace inline type-only parser-edge closure,
neighboring SDK/mapgen rows, or product/runtime proof.

## Evidence

- `SME-NATIVE-FIXTURES-2026-06-15`: native Grit fixture/parser-edge proof.
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter sdk_mapgen_entrypoint --json 2>&1`
  exited 0 with one testable pattern, 10 current-predicate positive matches,
  and 0 ignore-sample matches.
- `SME-SDK-MAPGEN-INVENTORY-2026-06-15`: parser inventory/live corpus evidence.
  Inline Node/TypeScript compiler API inventory over `packages/sdk/src` and
  `packages/mapgen-core/src`, excluding `node_modules`, `dist`, and `mod`,
  counted 274 scanned TS/TSX/JSON files; 274 `.ts`; 0 `.tsx`; 0 `.json`; 170
  SDK source files; 104 mapgen-core source files; 2 SDK mapgen `.ts` files; 168
  SDK non-mapgen `.ts` files; 1 SDK root index file; 604 import declarations;
  285 export declarations; 283 export-from declarations; 52 export-star
  declarations; 233 named export declaration nodes; 526 named export specifier
  elements; 0 dynamic imports; 0 SDK root `./mapgen` import candidates; 0 SDK
  root `./mapgen` value export-star candidates; 0 SDK root `./mapgen` named
  value re-export candidates; 0 SDK root `./mapgen` value-first mixed value+type named
  re-export candidates; 0 SDK root `./mapgen` `export type` named re-export
  controls; 0 SDK root `./mapgen` single-line inline type-only re-export
  controls in current source; 0 SDK non-mapgen `@civ7/adapter/civ7` imports; 1
  allowed SDK mapgen subpath
  `@civ7/adapter/civ7` import; 0 mapgen-core `@civ7/adapter/civ7` imports; and
  0 parse diagnostics. Current-row match list is empty.
- Verification commands run so far for this checkpoint:
  `GRIT_TELEMETRY_DISABLED=true bunx grit patterns test --filter sdk_mapgen_entrypoint --json 2>&1`
  and inline Node/TypeScript parser inventory. OpenSpec and hygiene checks run
  after record realignment.

## Review / Findings

`SME-P2-NAMED-REEXPORT-PREDICATE-GAP-2026-06-15` and
`SME-P2-INLINE-TYPE-REEXPORT-CONTROL-GAP-2026-06-15` are accepted and repaired
in this checkpoint: SDK root named value re-exports and value-first mixed value+type named
re-exports from `./mapgen` and `./mapgen/index.js` are native positives, while
`export type { ... }` and fixture-proven single-line `export { type ... }`
named re-exports remain non-runtime controls. Multiline or alternate-whitespace
inline type-only formatting remains an unproven parser-edge non-claim. Parser
inventory found 0 live current-row candidates in SDK root, SDK non-mapgen
source, and mapgen-core source. Supervisor re-review remains pending after
final verification and amend.

## Next Actions

1. Supervisor re-review of this amended checkpoint.
2. Do not open the next row until supervisor acceptance.
