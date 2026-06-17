# Design - Map Bundle Runtime Imports Wrapped-Test

## Frame

### Objective

Record the active Habitat owner for Swooper generated map bundle runtime-import
safety: `arch-test-map-bundle-runtime-imports` runs the Swooper Maps package
architecture test after the package build target has produced the generated map
scripts that the test inspects.

### Product Movement

Future agents should be able to rely on Habitat for this generated-bundle
guard without mistaking it for a Grit syntax rule or for a raw package-local
test command that can read stale generated output. The row moves the rule to a
graph-owned Nx target and records the proof boundary.

### Selection

- Candidate id: `habitat-grit-map-bundle-runtime-imports`
- Active Habitat rule: `arch-test-map-bundle-runtime-imports`
- Owner layer: `wrapped-test`
- Package target:
  `mod-swooper-maps:test:architecture-map-bundle-runtime-imports`
- Test owner:
  `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`

### Hard Core

1. The map bundle runtime-import invariant is a package-owned generated-output
   architecture test.
2. Habitat selects the invariant through the wrapped-test rule
   `arch-test-map-bundle-runtime-imports`.
3. The package target depends on `mod-swooper-maps:build`, which depends on
   `gen:maps`, before running the bundle test.
4. The bundle test proves every manifest-listed map script is built, has no
   monorepo package import/export specifiers, installs the TextEncoder
   bootstrap before use, and includes authored river materialization markers.
5. Aggregate `wrapped-test` is green in the corrected stack; generated-output
   freshness repair is inherited downstack and not owned by this row.

### Exterior

- Active Grit rule registration, native Grit fixture proof, Grit baseline, or
  injected Grit probe.
- Generated-output hand edits.
- Source remediation.
- Broad generated-output freshness ownership outside this rule's graph-owned
  proof path.
- Apply safety, classify/generator behavior, hook/CI proof, or product/runtime
  proof.

### Falsifier

This checkpoint fails if the rule remains a raw package-local test command, if
the package target does not depend on the package build, if Habitat cannot
select the wrapped-test rule, if the explicit empty baseline is absent, if the
target leaves generated-output residue in tracked files, or if records imply
active Grit or row-owned generated-output freshness closure.

## Source Synthesis

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-map-bundle-runtime-imports` as an enforced wrapped-test rule. This
checkpoint routes its detect command through
`nx run mod-swooper-maps:test:architecture-map-bundle-runtime-imports --outputStyle=static`
and records the `nxTarget` metadata.

`mods/mod-swooper-maps/package.json` exposes the package target as
`bun test test/build/map-bundle-runtime-imports.test.ts` and wires it to
`build`. The package `build` target depends on `gen:maps`, so the test reads
the current generated map bundle output rather than stale files.

The package test reads `mod/swooper-maps.modinfo` and `mod/maps/*.js`, verifies
that manifest-listed scripts exist, rejects bare workspace package imports or
exports in the generated scripts, checks the Civ7 TextEncoder bootstrap order,
and requires authored river materialization markers in each manifest-listed
bundle.

## Test And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Package target `mod-swooper-maps:test:architecture-map-bundle-runtime-imports` | Runs the build-dependent map-bundle architecture test and passes |
| Habitat per-rule `arch-test-map-bundle-runtime-imports` | Selects the package target plus `baseline-integrity` and passes |
| Aggregate `wrapped-test` | All seven wrapped-test rules plus `baseline-integrity` pass in the corrected stack |
| Map-bundle test source and generated output inventory | Records one test file, four test cases, six present manifest-listed map bundles, no missing/extra manifest map bundles, and no parse diagnostics |
| Active Grit proof classes | Not claimed for this row |

## Proof Contract

This row checkpoint may record:

- `MAPBUNDLE-NX-TARGET-2026-06-16`: package-owned Nx target proof for
  `mod-swooper-maps:test:architecture-map-bundle-runtime-imports`.
- `MAPBUNDLE-TEST-INVENTORY-2026-06-16`: deterministic inventory for the
  package test and generated map bundle envelope.
- `MAPBUNDLE-HABITAT-BUILD-2026-06-16`: Habitat harness build proof so the
  ignored built command surface reflects the source rule catalog edit.
- `MAPBUNDLE-HABITAT-WRAPPED-TEST-2026-06-16`: Habitat per-rule selector proof
  for `arch-test-map-bundle-runtime-imports`.
- `MAPBUNDLE-WRAPPED-TEST-AGGREGATE-2026-06-16`: aggregate wrapped-test
  evidence showing all wrapped-test rules and `baseline-integrity` pass.
- `MAPBUNDLE-BASELINE-FILES-2026-06-16`: explicit empty Habitat baseline for
  `arch-test-map-bundle-runtime-imports`.

This row checkpoint must not record active Grit behavior, native Grit fixture
proof, Grit baselines, injected Grit probes, generated-output hand edits,
source remediation, classify/generator behavior, apply/codemod safety, hook/CI
proof, or product/runtime proof.
