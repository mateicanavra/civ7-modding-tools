# Downstream Realignment Ledger

| Affected assumption | Scope | Disposition |
| --- | --- | --- |
| Group plan outputs now have a symbolic rollup artifact. | Future resource intent merge, stats, and runtime-proof slices | Patch-needed downstream: consume `artifact:resources.groupPlans` instead of individual group strategy internals. |
| Runtime ids remain unverified. | Placement materialization, stats closure, game log proof | No patch in this slice: later runtime proof must verify `GameInfo.Resources` ids before symbolic rows are materialized. |
| FireTuner restart path remains a final-proof dependency. | Runtime-proof slices, game restart evidence, DRA handoff | Boundary already acknowledged in the downstream resource-runtime-proof boundary; final runtime proof must keep using that socket/API restart path. |
