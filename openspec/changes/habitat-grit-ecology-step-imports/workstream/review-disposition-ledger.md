# Review Disposition Ledger - Ecology Step Imports Wrapped-Test

## Current Review State

No supervisor review has accepted this row checkpoint yet. Local implementation
repairs the active ecology wrapped-test so its executable behavior matches the
registered Habitat rule text.

## Findings

| Finding id | Priority | Status | Disposition |
| --- | --- | --- | --- |
| `ECOSTEP-IMPORT-SURFACE-GAP-2026-06-16` | P2 | Accepted/local repaired | `rules.json` said the rule forbids ecology steps deep-importing ops/rules, while the previous test only checked retired directories. The test now reports static import/re-export forms from ecology ops/rules. |
| `ECOSTEP-WRAPPED-TEST-AGGREGATE-2026-06-16` | P2 | Accepted/local repaired | After restacking onto the accepted downstack generated-output freshness/enforcement repair, aggregate `wrapped-test` exits 0; ecology step imports, map-bundle runtime imports, all other wrapped-test rules, and `baseline-integrity` pass. Ecology does not own that generated-output freshness repair. |

## Non-Claims Preserved

- No active Grit rule, native Grit fixture, Grit baseline, or injected Grit
  probe.
- No source remediation.
- No dynamic import, source-string, broad domain import normalization, or
  product/runtime proof.
- No ecology-owned generated-output freshness repair.
- No apply safety, classify/generator behavior, or retired parity proof.
