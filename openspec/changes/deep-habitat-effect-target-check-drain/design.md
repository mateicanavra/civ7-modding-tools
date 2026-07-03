# Design: Target Check Drain

## Ownership Model

The drain separates the old wrapper rows into their actual kinds:

| Former rule | Replacement owner |
| --- | --- |
| `arch-test-core-purity` | Expanded `mapgen-core-runtime-civ7` source-check rule over `packages/mapgen-core/src` production source. |
| `arch-test-rng-authority` | New `rng-authority-static` source-check rule over Swooper domain and standard recipe source. |
| `arch-test-ecology-step-imports` | New `ecology-step-imports` source-check rule for active ecology stage imports plus retired ecology source paths. |
| `arch-test-cutover` | Existing `op-calls-op` and `ops-bind-runvalidated` plus new `cutover-source-guardrails`; package topology-lock test stays package-owned. |
| `arch-test-map-bundle-runtime-imports` | Package generated-bundle test target only. |
| `arch-test-intelligence-bridge-bundle-runtime-imports` | Package generated-bundle test target only. |
| `arch-test-m11-projection-band` | Package domain correctness test target only. |

## Rule Execution

`habitat check` runs structural providers:

- `pattern-check` for source-shape constraints;
- `file-layer` for generated-zone and forbidden-file constraints;
- `format-check`, `import-boundaries`, `command-check`, and native Habitat
  rules where those provider kinds own the behavior.

It does not run package Vitest/Bun architecture tests as active Habitat rules.
Those package tests remain runnable through their Nx package targets and can
still be composed by broader package verification workflows.

## Replacement Scope

`mapgen-core-runtime-civ7` now scans production `packages/mapgen-core/src/**/*.ts`
except `src/dev`, matching the former core-purity target instead of only
`src/core` and `src/engine`.

`rng-authority-static` mirrors the prior source scan for engine RNG, ambient
random, official generator calls, and internal mapgen-core RNG imports. It
retains the current discovery materialization exception as explicit rule
metadata.

`ecology-step-imports` catches import/export use of
`@mapgen/domain/ecology/(ops|rules)` from active ecology stages and flags files
under retired ecology stage source directories. Empty retired directories remain
package-test territory until file-layer grows a native empty-directory topology
model.

`cutover-source-guardrails` catches shim/shadow/dual/compare terminology and
legacy stage tokens in runtime source. Exact `STANDARD_STAGES` topology remains
a package correctness test.

## Boundary

This slice deletes the wrong Habitat ownership, not the underlying safety net.
The invariant remains owned either by source-check or by the package where it
belongs.
