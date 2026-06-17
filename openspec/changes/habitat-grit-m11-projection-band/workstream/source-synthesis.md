# Source Synthesis - M11 Projection Band Wrapped-Test

## Authority

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-m11-projection-band` as an enforced `wrapped-test` rule with detect
command
`nx run mod-swooper-maps:test:architecture-m11-projection-band --outputStyle=static`.
The rule describes projection-band algorithm regressions as a domain-logic test
that stays a test permanently.

`mods/mod-swooper-maps/package.json` exposes that target as
`bun test test/foundation/m11-projection-boundary-band.test.ts` with upstream
build dependencies through Nx. `mods/mod-swooper-maps/AGENTS.md` routes package
behavior proof through package scripts and Nx targets rather than generated
output edits or duplicate syntax checks.

## Test Surface

`mods/mod-swooper-maps/test/foundation/m11-projection-boundary-band.test.ts`
constructs a representative M11 plate mesh, runs the tectonic history chain,
invokes `computePlatesTensors.run`, and asserts that boundary regime or signal
output appears in a multi-tile band beyond the exact boundary line.

## Disposition

The candidate is resolved as a wrapped-test proof checkpoint. Adding an active
Grit check would duplicate the wrong owner layer because this invariant depends
on executing domain logic and inspecting computed model output.

## Current Evidence

- The package-owned Nx target passes with the M11 projection-band package test.
- Habitat per-rule wrapper selection for `arch-test-m11-projection-band`
  passes.
- Aggregate `wrapped-test` passes from the corrected current HG head: all seven
  wrapped-test rules and `baseline-integrity` are green.
- Parser inventory found one M11 test file, 196 lines, 9 import declarations, 1
  `describe`, 1 `it`, 1 `runTectonicHistoryChain` call, 1
  `computePlatesTensors.run` call, and 0 parse diagnostics.
- The explicit empty Habitat baseline for `arch-test-m11-projection-band`
  exists.

## Non-Claims

No active Grit rule, Grit baseline, injected Grit probe, source remediation,
generated-output freshness ownership, full Foundation topology closure,
model-wide tectonic correctness proof, classify/generator behavior, apply
safety, hook/CI proof, retired parity, or product/runtime proof is claimed.
