# Design - Shim Cutover Terms Proof

## Frame

### Objective

Make the shim/cutover candidate executable in Habitat by proving the existing
wrapped-test owner layer and retiring the ambiguous pending manual/Grit status
for this row.

### Product Movement

Future agents should see that Swooper runtime source is already guarded against
cutover debt vocabulary and related structural drift by a Habitat rule, while
also seeing that this invariant is intentionally test-owned rather than
Grit-owned.

### Selection

- Candidate id: `habitat-grit-shim-cutover-terms`
- Active Habitat rule: `arch-test-cutover`
- Owner layer: `wrapped-test`
- Package target: `mod-swooper-maps:test:architecture-cutover`
- Test owners:
  - `mods/mod-swooper-maps/test/pipeline/no-shim-surfaces.test.ts`
  - `mods/mod-swooper-maps/test/pipeline/no-dual-contract-paths.test.ts`
  - `mods/mod-swooper-maps/test/pipeline/foundation-topology-lock.test.ts`
  - `mods/mod-swooper-maps/test/foundation/no-op-calls-op-tectonics.test.ts`

### Hard Core

1. The invariant corpus classifies the four cutover checks as `keep-as-test`;
   Habitat invokes them but does not own them as Grit.
2. `rules.json` already registers `arch-test-cutover` as an enforced
   wrapped-test rule.
3. The package-owned Nx target runs the four cutover tests through the Swooper
   Maps package.
4. `no-shim-surfaces.test.ts` scans `src/domain`, `src/recipes/standard`, and
   `src/maps` `.ts`/`.json` runtime source for shim, shadow, dual-path,
   compare, compatibility, and transitional surface terms.
5. The same target also checks no op-calls-op tectonics, no dual contract paths,
   and locked foundation topology.
6. Aggregate `wrapped-test` closure is still blocked by the independent Swooper
   generated map bundle freshness issue, not by cutover.

### Exterior

- New Grit pattern registration for cutover/shim terms.
- Grit baselines or injected Grit probes.
- Source remediation for cutover vocabulary or topology findings.
- Natural-language documentation keyword enforcement.
- Swooper generated map bundle freshness repair.
- Live Civ7 runtime proof or product acceptance.
- Classify/generator behavior.

### Falsifier

This checkpoint fails if Habitat cannot select `arch-test-cutover`, if the
package-owned Nx target fails, if the deterministic no-shim source inventory
finds a runtime hit not captured by the current target, or if records imply
active Grit closure or aggregate wrapped-test closure from this row.

## Source Synthesis

`docs/projects/habitat-harness/invariant-corpus.md` lists
`cutover-tests (x4)` as package tests with disposition `keep-as-test`.
`tools/habitat-harness/src/rules/rules.json` registers `arch-test-cutover` with
`ownerTool: "wrapped-test"` and detect command
`nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static`.
`mods/mod-swooper-maps/package.json` exposes that target and script.

`no-shim-surfaces.test.ts` recursively scans `src/domain`,
`src/recipes/standard`, and `src/maps` for `.ts` and `.json` files, excluding
build/generated dependency folders. Its pattern set reports `dualRead`,
dual-engine/path variants, shadow path/layer/mode/toggle/bridge terms, compare
and comparison layer/mode/toggle/path terms, shim variants, compatibility
shim/bridge terms, and transitional shim/bridge terms.

`no-dual-contract-paths.test.ts` checks runtime source for legacy stage names
and dual legacy/target path pairs. `foundation-topology-lock.test.ts` checks the
standard stage topology and legacy aliases. `no-op-calls-op-tectonics.test.ts`
checks foundation op entrypoints for sibling-op runtime imports, domain op
barrel imports, `ops.bind`, and `runValidated`.

## Fixture And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Shim/shadow/dual/compare/compat/transitional runtime term in Swooper runtime roots | `arch-test-cutover` fails through the package-owned Nx target |
| Current runtime roots contain no matching shim term | `arch-test-cutover` passes; deterministic inventory records 0 hits |
| Legacy stage alias, dual contract path, or foundation topology drift | `arch-test-cutover` fails through the owning package test |
| Candidate is considered for Grit keyword registration | rejected for this row because precise executable authority is the package cutover target |
| Aggregate wrapped-test run includes cutover | Cutover rule passes; aggregate still may fail on unrelated generated map bundle freshness |

## Proof Contract

This row checkpoint may record:

- `SCT-NX-TARGET-2026-06-15`: package-owned Nx target proof for
  `mod-swooper-maps:test:architecture-cutover`.
- `SCT-HABITAT-WRAPPED-TEST-2026-06-15`: Habitat per-rule selector/wrapper
  proof for `arch-test-cutover`.
- `SCT-WRAPPED-TEST-AGGREGATE-2026-06-15`: aggregate wrapped-test evidence
  showing cutover passes while a separate generated-map freshness blocker
  remains current-red.
- `SCT-SHIM-INVENTORY-2026-06-15`: deterministic zero-hit inventory for the
  no-shim runtime source roots and term set.
- `SCT-BASELINE-FILES-2026-06-15`: explicit empty Habitat baseline for
  `arch-test-cutover`.

This row checkpoint must not record:

- active Grit rule closure;
- native Grit fixture proof;
- Grit baseline or injected Grit probe proof;
- source remediation;
- natural-language documentation keyword enforcement;
- Swooper map bundle freshness repair;
- classify/generator behavior;
- apply/codemod safety;
- retired full-profile parity closure;
- product/runtime proof.
