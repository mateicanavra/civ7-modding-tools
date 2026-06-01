# Downstream Realignment Ledger

| Affected assumption | Scope | Disposition |
| --- | --- | --- |
| Terrestrial resources now have a symbolic group-planning op surface. | Future resource group ops and `plan-resource-groups` stage work | Patch-needed downstream: later slices should preserve per-resource rows, strategy-owned group coverage, row lanes, and explicit proxy gaps. |
| Cultivated closure metadata is repaired in this follow-up slice. | Closure audits for `resource-cultivated-operation-contract` | Patched here because the cultivated branch was already locally committed clean at `3494d91de` before the watcher found stale records. |
| Runtime ids remain unverified. | Placement materialization, stats closure, game log proof | No patch in this slice: later runtime proof must verify `GameInfo.Resources` ids before symbolic rows are materialized. |
| FireTuner restart path remains a final-proof dependency. | Runtime-proof slices, game restart evidence, DRA handoff | Boundary acknowledged; final runtime proof must restack/integrate downstack restart work and record exact branch/commit plus restart command/path. |
