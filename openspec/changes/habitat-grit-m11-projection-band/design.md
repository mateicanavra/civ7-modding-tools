# Design - M11 Projection Band Wrapped-Test

## Frame

### Objective

Record the active Habitat owner for the M11 projection-band regression
boundary: `arch-test-m11-projection-band` runs the Swooper Maps package
architecture test that proves boundary regime and signals project beyond the
exact plate-boundary line.

### Product Movement

Future agents should be able to rely on Habitat for this projection regression
guard without mistaking it for a Grit syntax rule. The boundary is
wrapped-test-owned because the package test executes domain logic and asserts a
model behavior that Grit cannot prove from syntax alone.

### Selection

- Candidate id: `habitat-grit-m11-projection-band`
- Active Habitat rule: `arch-test-m11-projection-band`
- Owner layer: `wrapped-test`
- Package target: `mod-swooper-maps:test:architecture-m11-projection-band`
- Test owner:
  `mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts`

### Hard Core

1. The M11 projection-band invariant is a package-owned domain-logic regression
   test.
2. Habitat selects the invariant through the wrapped-test rule
   `arch-test-m11-projection-band`.
3. The package target proves that boundary regime and signals appear beyond the
   exact plate-boundary line in the representative projection case.
4. Aggregate `wrapped-test` is green in the corrected stack; generated-output
   freshness proof is inherited downstack and not owned by M11.

### Exterior

- Active Grit rule registration, native Grit fixture proof, Grit baseline, or
  injected Grit probe.
- Source remediation.
- Model-wide tectonic correctness, full Foundation topology closure, or
  generated-output freshness ownership.
- Apply safety, classify/generator behavior, hook/CI proof, or product/runtime
  proof.

### Falsifier

This checkpoint fails if the package target cannot execute, if Habitat cannot
select the wrapped-test rule, if the explicit empty baseline is absent, or if
records imply active Grit or M11-owned generated-output freshness closure.

## Source Synthesis

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-m11-projection-band` as an enforced wrapped-test rule. Its detect
command is
`nx run mod-swooper-maps:test:architecture-m11-projection-band --outputStyle=static`,
and the rule text identifies projection-band algorithm regressions as a
domain-logic test that stays test-owned permanently.

`mods/mod-swooper-maps/package.json` exposes the package target as
`bun test test/foundation/m11-projection-boundary-band.test.ts` and wires it
through Nx dependency ordering. `mods/mod-swooper-maps/AGENTS.md` keeps package
scripts and Nx targets as the appropriate proof surface for Swooper package
behavior.

The test constructs a small M11 representative plate mesh, runs the tectonic
history chain and `computePlatesTensors`, and asserts that boundary regime or
signal output exists in a multi-tile band beyond the exact boundary line.

## Test And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Package target `mod-swooper-maps:test:architecture-m11-projection-band` | Runs the M11 projection-band architecture test and passes |
| Habitat per-rule `arch-test-m11-projection-band` | Selects the package target plus `baseline-integrity` and passes |
| Aggregate `wrapped-test` | All seven wrapped-test rules plus `baseline-integrity` pass in the corrected stack |
| M11 package-test source | Contains one `describe`, one executable `it`, one projection-chain call, one plate-tensor call, and no parse diagnostics |
| Active Grit proof classes | Not claimed for this row |

## Proof Contract

This row checkpoint may record:

- `M11-NX-TARGET-2026-06-16`: package-owned Nx target proof for
  `mod-swooper-maps:test:architecture-m11-projection-band`.
- `M11-TEST-INVENTORY-2026-06-16`: deterministic inventory for the M11 package
  test source.
- `M11-HABITAT-WRAPPED-TEST-2026-06-16`: Habitat per-rule selector proof for
  `arch-test-m11-projection-band`.
- `M11-WRAPPED-TEST-AGGREGATE-2026-06-16`: aggregate wrapped-test evidence
  showing all wrapped-test rules and `baseline-integrity` pass from the
  corrected current HG head.
- `M11-BASELINE-FILES-2026-06-16`: explicit empty Habitat baseline for
  `arch-test-m11-projection-band`.

This row checkpoint must not record active Grit behavior, native Grit fixture
proof, Grit baselines, injected Grit probes, source remediation, generated map
freshness repair, classify/generator behavior, apply/codemod safety, hook/CI
proof, model-wide tectonic correctness, or product/runtime proof.
