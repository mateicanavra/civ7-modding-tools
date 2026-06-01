# Downstream Realignment Ledger

| Affected assumption | Scope | Disposition |
| --- | --- | --- |
| Cultivated resources now have a symbolic group-planning op surface. | Future resource group ops and `plan-resource-groups` stage work | Patch-needed downstream: later slices should keep per-resource rows, strategy-owned group coverage, and explicit proxy gaps. |
| Aquatic closure metadata is repaired in this follow-up slice. | Closure audits for `resource-aquatic-operation-contract` | Patched here because the aquatic branch was already locally committed clean at `ad23eb663` before the watcher found stale records. |
| Runtime ids remain unverified. | Placement materialization, stats closure, game log proof | No patch in this slice: later runtime proof must verify `GameInfo.Resources` ids before symbolic rows are materialized. |
