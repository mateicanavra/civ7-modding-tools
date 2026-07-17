# Standard integrity benchmark

**Target authority:** [`targets/integrity.ts`](../../targets/integrity.ts)
**Target ID:** `standard/integrity`

## Question and structure

Does each completed Standard scenario close the structural evidence required to
interpret its product metrics? This is a sample target reused by every study that
depends on complete placement, resource, lake, ecology, and river evidence. It is
not a separate scenario or cohort.

## Expected outcomes

| Evidence group | Expectation IDs and outcome |
| --- | --- |
| Resources exist and close | `resource-plan-present >= 1`; `marine-resource-presence = true` when coast exists; `resource-spacing = 0`; outcome, type, reason, plan-type, demand-disposition, phase, and observation reconciliation expectations all `true`. |
| Resource identity and legality | `resource-intent-outcome-alignment`, `resource-placed-readback-alignment`, `resource-headless-policy-legality`, and `resource-hard-phase-habitat` all `true`. |
| Regional resource minimums | `resource-region-minimum-evidence`, `resource-final-region-minimums` both `true`; final shortfalls may exist only when already recorded by planning. |
| Starts | Exact alive-major seating; zero illegal surfaces; every pair at least six tiles apart; zero unsurfaced degradation; every start classified to a landmass and homeland. |
| Lakes | Lake share `<= 0.08`; water and classification drift `= 0`; projection mismatches `<= 2`; one-tile lake share `<= 0.20`; components `<= 24`. |
| Ecology | Feature-surface violations `= 0`; broad vegetation habitat fidelity `= true`; unclassified modeled land `= 0`; cold-reef coast share `<= 0.15`. |
| Rivers | Minor and major model populations, outlets, ocean terminals, navigable selection, eligibility, chains, and durable support each exist; source, bounds, readback, mismatch, and terminal evidence close exactly. |

The target evaluates only evidence present in each study's declared Civ7 preset
and seed. Headless legality and readback do not claim live-engine agreement.

## Proof

```bash
nx run mod-swooper-maps:metrics:report
nx run mod-swooper-maps:test
```
