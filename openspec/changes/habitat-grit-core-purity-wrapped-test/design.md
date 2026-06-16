# Design - Core Purity Wrapped-Test Proof

## Frame

### Objective

Make MapGen core runtime purity enforcement truthful in Habitat by proving the
existing wrapped-test owner layer and separating it from the adjacent
`grit-mapgen-core-runtime-civ7` predicate-gap row.

### Product Movement

Future agents should see that MapGen core production source is already checked
for Civ7 runtime value coupling through Habitat, while type-only adapter imports
and Grit import-predicate semantics remain separate proof classes.

### Selection

- Candidate id: `habitat-grit-core-purity-wrapped-test`
- Active Habitat rule: `arch-test-core-purity`
- Owner layer: `wrapped-test`
- Package target: `@swooper/mapgen-core:test:architecture-core-purity`
- Test owner: `packages/mapgen-core/test/architecture/core-purity.test.ts`

### Hard Core

1. MapGen core is pure TypeScript domain logic; direct Civ7 runtime imports
   belong in adapter surfaces.
2. `rules.json` already registers `arch-test-core-purity` as an enforced
   wrapped-test rule.
3. The package-owned Nx target runs the core-purity test through
   `@swooper/mapgen-core`.
4. The test scans `packages/mapgen-core/src` production `.ts` files, excludes
   `src/dev`, and reports runtime adapter/value references.
5. The separate Grit row `grit-mapgen-core-runtime-civ7` remains a syntax-layer
   check with its own native fixture/parser-edge and type-import non-claims.
6. Aggregate `wrapped-test` closure is still blocked by the independent Swooper
   generated map bundle freshness issue, not by core purity.

### Exterior

- New Grit pattern registration for core purity.
- Grit baselines or injected Grit probes.
- Source remediation for MapGen core.
- Swooper generated map bundle freshness repair.
- Adapter type-import policy closure.
- Live Civ7 runtime proof or product acceptance.
- Classify/generator behavior.

### Falsifier

This checkpoint fails if Habitat cannot select `arch-test-core-purity`, if the
target does not run through the package-owned Nx target, if the core-purity test
fails, or if records imply active Grit closure, source remediation, or aggregate
wrapped-test closure from this row.

## Source Synthesis

`packages/mapgen-core/AGENTS.md` defines MapGen core as a shared pure
TypeScript engine/library and says direct Civ7 engine imports do not belong in
this package. `packages/mapgen-core/src/AGENTS.md` repeats that source must not
introduce mod-specific entrypoints or Civ7 runtime imports.

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-core-purity` with `ownerTool: "wrapped-test"` and detect command
`nx run @swooper/mapgen-core:test:architecture-core-purity --outputStyle=static`.
`packages/mapgen-core/package.json` exposes that target.

`packages/mapgen-core/test/architecture/core-purity.test.ts` scans production
source files under `packages/mapgen-core/src`, excluding `src/dev`, and reports
runtime-value patterns: non-type `@civ7/adapter` imports,
`@civ7/adapter/civ7`, `createCiv7Adapter`, `GameplayMap`, and
`engine as unknown`.

## Fixture And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Civ7 runtime value reference in MapGen core production source | `arch-test-core-purity` fails through the package-owned Nx target |
| Current MapGen core production source has no forbidden runtime references | `arch-test-core-purity` passes |
| Type-only `@civ7/adapter` import in core contracts | Allowed by this wrapped-test row; exact type-import policy remains outside this row |
| `src/dev` adapter/reference code | Excluded by the package test and not claimed as production purity proof |
| Active Grit registration for core purity | Rejected for this row; the active owner is the wrapped-test rule |

## Proof Contract

This row checkpoint may record:

- `CORE-PURITY-NX-TARGET-2026-06-16`: package-owned Nx target proof for
  `@swooper/mapgen-core:test:architecture-core-purity`.
- `CORE-PURITY-HABITAT-WRAPPED-TEST-2026-06-16`: Habitat per-rule selector proof
  for `arch-test-core-purity`.
- `CORE-PURITY-WRAPPED-TEST-AGGREGATE-2026-06-16`: aggregate wrapped-test evidence
  showing core purity passes while a separate generated-map freshness blocker
  remains current-red.
- `CORE-PURITY-SOURCE-INVENTORY-2026-06-16`: deterministic current source
  inventory for the package test boundary.
- `CORE-PURITY-BASELINE-FILES-2026-06-16`: explicit empty Habitat baseline for
  `arch-test-core-purity`.

This row checkpoint must not record:

- active Grit rule closure;
- native Grit fixture proof;
- Grit baseline or injected Grit probe proof;
- source remediation;
- MapGen core Grit import-predicate repair;
- adapter type-import policy closure;
- Swooper map bundle freshness repair;
- classify/generator behavior;
- apply/codemod safety;
- retired full-profile parity closure;
- product/runtime proof.
