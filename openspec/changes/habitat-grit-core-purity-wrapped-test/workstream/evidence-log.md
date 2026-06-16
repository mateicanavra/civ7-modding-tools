# Evidence Log - Core Purity Wrapped-Test

## `CORE-PURITY-NX-TARGET-2026-06-16`

- Proof class: package-owned Nx target / wrapped-test owner proof.
- Command:
  `nx run @swooper/mapgen-core:test:architecture-core-purity --outputStyle=static`
- Exit status: 0.
- Result: Nx ran the architecture core-purity target and its dependency chain;
  Bun reported 1 passing test, 0 failures, and 1 assertion for
  `test/architecture/core-purity.test.ts`.
- Boundary: proves current package-owned core-purity boundary execution, not a
  Grit rule, source remediation, adapter type-import policy, or product/runtime
  proof.

## `CORE-PURITY-SOURCE-INVENTORY-2026-06-16`

- Proof class: deterministic source inventory / record truth.
- Command: inline TypeScript parser inventory over `packages/mapgen-core/src`,
  excluding `src/dev` and parsing production `.ts` files.
- Exit status: 0.
- Result: 92 production `.ts` files scanned, 153 import declarations, 4
  type-only `@civ7/adapter` imports, 0 value `@civ7/adapter` imports, 0
  `@civ7/adapter/civ7` imports, 0 core-purity runtime-pattern hits, and 0 parse
  diagnostics.
- Boundary: records current source state for the wrapped-test predicate. It
  does not prove Grit import semantics or broader adapter type-import policy.

## `CORE-PURITY-HABITAT-WRAPPED-TEST-2026-06-16`

- Proof class: Habitat wrapped-test per-rule selector/current-tree proof.
- Command:
  `bun run habitat:check -- --json --rule arch-test-core-purity`
- Exit status: 0.
- Result: CheckReport `ok:true`; selected exactly `arch-test-core-purity`
  plus `baseline-integrity`; both passed with zero diagnostics.
- Boundary: proves per-rule Habitat wrapper selection for the core-purity rule,
  not aggregate wrapped-test closure or Grit behavior.

## `CORE-PURITY-WRAPPED-TEST-AGGREGATE-2026-06-16`

- Proof class: historical aggregate wrapped-test blocker separation.
- Command:
  `bun run habitat:check -- --json --tool wrapped-test`
- Exit status: 1.
- Historical result: CheckReport `ok:false`; `arch-test-core-purity` passed
  with zero diagnostics and `baseline-integrity` passed, while
  `arch-test-map-bundle-runtime-imports` failed on missing generated map
  output.
- Current disposition: this historical red state is superseded by the accepted
  map-bundle/downstack freshness repair. The core-purity row still owns only
  its package target and Habitat per-rule proof.
- Boundary: records that core purity is clean inside the historical aggregate
  report and that generated-output freshness is owned outside this row.

## `CORE-PURITY-BASELINE-FILES-2026-06-16`

- Proof class: baseline / record truth.
- Command: deterministic Node inventory over wrapped-test `ownerTool` rule ids
  in `tools/habitat-harness/src/rules/rules.json` and baseline files under
  `tools/habitat-harness/baselines`.
- Exit status: 0.
- Result: 7 wrapped-test rule ids, 7 explicit empty baseline files, no missing
  baselines, no extra `arch-test-*` baselines, no non-empty baselines, and
  `arch-test-core-purity` included.

## Non-Claims

- No active Grit rule, native Grit fixture, Grit baseline, or injected Grit
  probe.
- No source remediation.
- No MapGen core Grit import-predicate repair or adapter type-import policy
  closure.
- No Swooper map bundle freshness repair ownership.
- No classify/generator behavior, apply safety, retired parity, or
  product/runtime proof.
