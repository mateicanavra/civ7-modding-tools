# Downstream Realignment Ledger

| Affected assumption | Scope | Disposition |
| --- | --- | --- |
| Geological resources now have a symbolic group-planning op surface. | Future resource group rollup, score, and placement slices | Patch-needed downstream: later slices should preserve per-resource rows, strategy-owned group coverage, row lanes, strict proxy gaps, and blocked active-zero rows. |
| Terrestrial closure metadata is repaired in this follow-up slice. | Closure audits for `resource-terrestrial-operation-contract` | Patched here because the terrestrial branch was already locally committed clean at `e4f99d9ef` before this geological branch was opened. |
| Runtime ids remain unverified. | Placement materialization, stats closure, game log proof | No patch in this slice: later runtime proof must verify `GameInfo.Resources` ids before symbolic rows are materialized. |
| FireTuner restart path remains a final-proof dependency. | Runtime-proof slices, game restart evidence, DRA handoff | Boundary is owned by the `resource-runtime-proof` phase record; final runtime proof must keep using that socket/API restart path. |
