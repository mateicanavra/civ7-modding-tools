# Standard integrity benchmark

**Target authority:** [`targets/integrity.ts`](../../targets/integrity.ts)
**Target ID:** `standard/integrity`

## Question and structure

Does each completed Standard scenario close the structural evidence required to
interpret its product metrics? This is a sample target reused by every study that
depends on complete placement, resource, lake, ecology, volcano, and river
evidence. It is not a separate scenario or cohort.

## Expected outcomes

| Evidence group | Expectation IDs and outcome |
| --- | --- |
| Discoveries | `discovery-generation-counts = true`: placed plus rejected discovery outcomes close the official generator's attempt population. |
| Resources exist and close | `resource-plan-present >= 1`; `marine-resource-presence = true` when coast exists; `resource-spacing = 0`; outcome, type, reason, plan-type, demand-disposition, phase, and observation reconciliation expectations all `true`. |
| Resource identity and legality | `resource-intent-outcome-alignment`, `resource-placed-readback-alignment`, `resource-headless-policy-legality`, and `resource-hard-phase-habitat` all `true`. |
| Regional resource minimums | `resource-region-minimum-evidence`, `resource-final-region-minimums` both `true`; final shortfalls may exist only when already recorded by planning. |
| Starts | Exact alive-major seating; zero illegal surfaces; every pair at least six tiles apart; zero unsurfaced degradation; every start classified to a landmass and homeland. |
| Surface and lakes | `final-water-surface-drift = 0`; `final-lake-water-drift = 0`; `lake-projection-rejections <= 2`; `lake-projection-plan-closure = true` and `lake-projection-outcome-closure = true`: every physical lake tile is offered without footprint suppression, and every candidate is stamped or explicitly rejected. No lake-share, singleton-share, component-count, or mountain-withholding quota is declared by this target. |
| Ecology | Feature-surface violations `= 0`; broad vegetation habitat fidelity `= true`; unclassified modeled land `= 0`; cold-reef coast share `<= 0.15`. |
| Volcanoes | Planned features missing from final Civ7 readback `= 0`; extra final volcano features `= 0`; planned volcanoes on non-mountain terrain `= 0`. |
| Rivers | `minor-river-model`, `major-river-model`, `river-outlets`, `ocean-river-terminals`, and `navigable-river-selection` are each `>= 1`; `river-network-closure`, `major-river-selection-source`, `navigable-river-readback`, and `navigable-river-mismatches` are all `true`. Routing resolves every modeled land tile and preserves ordinary dry-channel discharge downstream; native terrain and river metadata reconcile the selected source population exactly. |
| Certified physical hydrology | `certified-basin-conservation`, `certified-basin-ledgers`, `certified-basin-footprints`, `certified-basin-exposure`, `certified-lake-projection`, and `certified-river-source-classes` are all `true`. Physical water sources and marine exits conserve flux within the reported arithmetic bound; partitions and ledgers close; wet cells retain their complete footprint, avoid blocking landforms, and project without rejection; each dry channel source is authored once with its physical class and matching native readback. |

The target evaluates only evidence present in each study's declared Civ7 preset
and seed. Headless legality and readback do not claim live-engine agreement.

The default report and definition study gate select core Earthlike studies.
Explicit `all` report scope also exercises this same integrity target on biased
configuration-stress cases; structural and domain unit tests keep their full
configuration coverage.

## Proof

```bash
civ7 mapgen metrics report
civ7 mapgen metrics report --scope all
nx run swooper-physics:test
```
