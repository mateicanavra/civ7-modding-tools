# Source Synthesis - Core Purity Wrapped-Test

## Authority

`packages/mapgen-core/AGENTS.md` describes MapGen core as pure TypeScript
domain logic and says direct Civ7 engine imports belong outside this package.
`packages/mapgen-core/src/AGENTS.md` says core source must not introduce
mod-specific entrypoints or Civ7 runtime imports.

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-core-purity` as an enforced `wrapped-test` rule with detect command
`nx run @swooper/mapgen-core:test:architecture-core-purity --outputStyle=static`.
`packages/mapgen-core/package.json` exposes the package script and Nx target.

## Test Surface

`packages/mapgen-core/test/architecture/core-purity.test.ts` scans production
source under `packages/mapgen-core/src`, excluding `src/dev`. It reports
non-type `@civ7/adapter` imports, `@civ7/adapter/civ7`,
`createCiv7Adapter`, `GameplayMap`, and `engine as unknown`.

Type-only `@civ7/adapter` imports are intentionally not runtime value coupling
for this wrapped-test row. The adjacent `grit-mapgen-core-runtime-civ7` packet
continues to own Grit syntax-layer evidence and its import-predicate/type-import
non-claims.

## Disposition

The candidate is resolved as a wrapped-test proof checkpoint. Adding an active
Grit check would duplicate the wrong owner layer and would not repair the
separate Grit import-predicate gap.

## Current Evidence

- The package-owned Nx target passes.
- Habitat per-rule wrapper selection for `arch-test-core-purity` passes.
- Aggregate `wrapped-test` includes the core-purity rule as passing, while
  remaining current-red for separate Swooper map bundle freshness.
- Parser inventory found 92 production MapGen core `.ts` files, 153 import
  declarations, 4 type-only adapter imports, and 0 runtime value candidates.
- The explicit empty Habitat baseline for `arch-test-core-purity` exists.

## Non-Claims

No active Grit rule, Grit baseline, injected Grit probe, source remediation,
MapGen core Grit import-predicate repair, adapter type-import policy closure,
Swooper generated map freshness repair, aggregate wrapped-test closure,
classify/generator behavior, apply safety, retired parity, or product/runtime
proof is claimed.
