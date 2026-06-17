# Phase Record - Adapter Base Standard Import

## Current Gate

Active-check closure checkpoint implemented and committed locally for supervisor
review. The row records native fixture/parser-edge proof, current package parser
inventory, Habitat per-rule and aggregate wrapper proof, explicit empty baseline
integrity, row-specific injected violation/path-control proof, and record truth.
Raw acquisition, retired/wrapped-script parity, broader adapter policy closure,
Effect adapter proof, aggregate injected-corpus closure, and product/runtime
proof remain non-claims.

## Branch / Stack

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain`
- Branch: `agent-HG-habitat-grit-adapter-base-standard-import-closure`
- Parent: `agent-HG-habitat-grit-placement-outcome-boundary-closure`
- This row consumes current wrapper, baseline, and row-specific injected proof
  directly through ABSI proof ids rather than relying on inherited shared
  historical proof. Neighboring row proof and product/runtime proof remain
  separate downstream inputs and are not consumed by this row.

## Scope

This checkpoint owns:

- packet and record truth for
  `habitat-grit-proof-adapter-base-standard-import`;
- native fixture/parser-edge expansion for
  `.grit/patterns/habitat/checks/adapter_base_standard_import.md`;
- parser inventory over current package source;
- aggregate proof matrix, command proof log, and corpus ledger realignment.

This checkpoint does not own:

- package source refactors;
- adapter API migration;
- predicate repair outside the current direct import/path predicate;
- Grit apply/codemod behavior;
- baseline mutation beyond the explicit empty row baseline;
- legacy wrapped-script allowlist migration;
- raw adapter/acquisition repair;
- Effect adapter or injected cleanup behavior;
- aggregate injected-corpus closure while DDIT is blocked;
- neighboring adapter/runtime rows;
- product/runtime proof.

## Evidence

- `ABSI-NATIVE-FIXTURES-2026-06-16`: native Grit fixture/parser-edge proof.
  `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter adapter_base_standard_import --json`
  exited 0 with one testable pattern, 5 current-predicate positive matches,
  and 0 ignore-sample matches.
- `ABSI-NATIVE-CORPUS-REFRESH-2026-06-16`: full native Grit corpus proof.
  `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --json`
  exited 0 with 32 testable patterns and 0 failures, including ABSI.
- `ABSI-PACKAGE-INVENTORY-2026-06-16`: parser inventory/live corpus evidence.
  Inline Node/TypeScript compiler API inventory over `packages`, excluding
  `node_modules` and `dist`, used the actual current predicate path regex
  `.*packages/.*\.ts$` and adapter exclusion `packages/civ7-adapter/`. The
  inventory counted 944 scanned TS/TSX/JSON files; 910 `.ts` suffix files; 2
  `.d.ts`; 908 non-`.d.ts` `.ts`; 0 `.tsx`; 34 `.json`; 910
  current-predicate files; 895 current-predicate files outside adapter; 15
  current-predicate adapter files; 3,111 import declarations outside adapter;
  588 type-only imports outside adapter; 2,521 value imports outside adapter; 2
  side-effect imports outside adapter; 541 export-from declarations outside
  adapter; 2 dynamic imports outside adapter; 0 direct `/base-standard/` import
  declarations outside adapter; 0 direct `/base-standard/` export-from
  declarations outside adapter; 0 direct `/base-standard/` dynamic imports
  outside adapter; 8 outside-adapter string-lookalike files; 81
  outside-adapter string-lookalike literals; 10 adapter-owned
  `/base-standard/` import declarations; 1 adapter-owned side-effect import;
	  and 0 parse diagnostics.
- `ABSI-PER-RULE-SELECTOR-2026-06-16`: `bun run habitat:check -- --json --rule grit-adapter-base-standard-import`
  selected exactly ABSI plus `baseline-integrity`, both passing with zero
  diagnostics.
- `ABSI-HABITAT-GRIT-TOOL-2026-06-16`: `bun run habitat:check -- --json --tool grit-check`
  selected 30 Grit rules plus `baseline-integrity`, all passing with ABSI
  included.
- `ABSI-BASELINE-FILES-2026-06-16`: the row baseline is the committed explicit
  empty file `tools/habitat-harness/baselines/grit-adapter-base-standard-import.json`;
  `baseline-integrity` passed in per-rule and aggregate wrapper proof.
- `ABSI-INJECTED-PROBE-2026-06-16`: clean-start injected proof reports one ABSI
  diagnostic at `packages/config/src/demo.ts`, a clean
  `packages/civ7-adapter/src/demo.ts` control, clean initial/final git state,
  and clean probe cleanup. The aggregate injected runner still exits nonzero only
  because of accepted unrelated DDIT.
- Verification commands run for this checkpoint:
  `bun run openspec -- validate habitat-grit-proof-adapter-base-standard-import --strict`,
  `bun run openspec -- validate habitat-grit-proof-repair --strict`,
  focused/full native Grit proof, inline Node/TypeScript parser inventory,
  per-rule and aggregate Habitat wrapper proof, clean-start injected proof,
  `bun run openspec:validate`, and `git diff --check`.
- Active-packet language guardrail scan:
  `rg -n "fallback|shim|compat|workaround|temporary|scratch"
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/openspec/changes/habitat-grit-proof-adapter-base-standard-import
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/docs/projects/habitat-harness/grit-pattern-corpus-ledger.md
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md
  /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain/openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md`
  found only this packet's explicit "scratch is not durable proof" guardrail
  language plus unrelated existing aggregate rows.

## Review / Findings

No accepted P1/P2 findings are open for this row checkpoint before supervisor
review. Parser inventory found 0 live current-row direct `/base-standard/`
import matches outside the adapter. Broad string lookalikes remain
wrapped-script/baseline context, not current-row candidates.

## Next Actions

1. Request supervisor review for this active-check closure checkpoint.
2. Continue treating raw acquisition, Effect adapter closure, apply safety,
   retired parity, wrapped-script parity closure, broader adapter policy closure,
   neighboring-row proof, aggregate injected-corpus closure, and product/runtime
   proof as non-claims unless separately recorded.
