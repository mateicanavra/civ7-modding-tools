# Design - Ecology Step Imports Wrapped-Test

## Frame

### Objective

Make `arch-test-ecology-step-imports` enforce its registered Habitat contract:
active ecology step source avoids direct ecology ops/rules imports, and retired
ecology topology directories stay absent.

### Product Movement

Future agents should be able to rely on Habitat for the ecology step import
boundary instead of treating the rule as topology-only. The row remains
wrapped-test-owned because the existing owner surface is a package architecture
test, not a Grit predicate.

### Selection

- Candidate id: `habitat-grit-ecology-step-imports`
- Active Habitat rule: `arch-test-ecology-step-imports`
- Owner layer: `wrapped-test`
- Package target: `mod-swooper-maps:test:architecture-ecology-step-imports`
- Test owner:
  `mods/mod-swooper-maps/test/ecology/ecology-step-import-guardrails.test.ts`

### Hard Core

1. Ecology steps compose through public domain surfaces and declared contracts.
2. Direct static imports or re-exports from `@mapgen/domain/ecology/ops` and
   `@mapgen/domain/ecology/rules` are forbidden in active ecology step source.
3. Retired ecology wrapper/generic step directories remain absent.
4. Habitat selects this boundary through the package-owned Nx target.
5. Aggregate `wrapped-test` is green in the corrected stack; that generated
   output freshness proof is inherited downstack, not owned by ecology step
   imports.

### Exterior

- Dynamic import and source-string closure.
- Active Grit rule registration, Grit baseline, or injected Grit probe.
- Source remediation.
- Swooper generated-output freshness ownership.
- Broad domain import normalization or product/runtime proof.

### Falsifier

This checkpoint fails if the test does not report static import/re-export forms
from ecology ops/rules, if Habitat cannot select the rule, if current source has
live findings, or if records imply active Grit or ecology-owned generated-output
freshness closure.

## Source Synthesis

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-ecology-step-imports` as an enforced wrapped-test rule. The rule
forbids ecology steps deep-importing ops/rules and the presence of retired stage
directories, and its detect command is
`nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static`.

`mods/mod-swooper-maps/package.json` exposes the package target as
`bun test test/ecology/ecology-step-import-guardrails.test.ts` and makes the Nx
target depend on upstream builds. `mods/mod-swooper-maps/AGENTS.md` keeps
ecology ops under `src/domain/ecology/ops` and recipe step schemas as the owner
layer for composition.

The M2 ecology architecture alignment milestone records that step runtime code
must not import `@mapgen/domain/ecology/ops` implementations. This row makes
that registered rule executable for static imports and re-exports.

## Test And Inventory Matrix

| Class | Expected behavior |
| --- | --- |
| Static value/type/namespace/side-effect import from `@mapgen/domain/ecology/ops` or `/rules` | Package test reports a finding |
| Named re-export or export-star from `@mapgen/domain/ecology/ops` or `/rules` | Package test reports a finding |
| Public root import from `@mapgen/domain/ecology` | Allowed by this row |
| Dynamic import or source string mentioning ecology ops/rules | Non-claim/control for this row |
| Retired ecology topology directory | Package test reports a finding |
| Active current ecology stage source | Zero findings in current inventory |

## Proof Contract

This row checkpoint may record:

- `ECOSTEP-NX-TARGET-2026-06-16`: package-owned Nx target proof for
  `mod-swooper-maps:test:architecture-ecology-step-imports`.
- `ECOSTEP-SOURCE-INVENTORY-2026-06-16`: deterministic source inventory for the
  active ecology stage roots.
- `ECOSTEP-HABITAT-WRAPPED-TEST-2026-06-16`: Habitat per-rule selector proof
  for `arch-test-ecology-step-imports`.
- `ECOSTEP-WRAPPED-TEST-AGGREGATE-2026-06-16`: aggregate wrapped-test evidence
  showing ecology step imports, map-bundle runtime imports, all other
  wrapped-test rules, and `baseline-integrity` pass from the corrected current
  HG head.
- `ECOSTEP-BASELINE-FILES-2026-06-16`: explicit empty Habitat baseline for
  `arch-test-ecology-step-imports`.

This row checkpoint must not record active Grit behavior, native Grit fixture
proof, Grit baselines, injected Grit probes, source remediation, dynamic import
closure, source-string closure, Swooper generated map freshness repair,
classify/generator behavior, apply/codemod safety, or product/runtime proof.
