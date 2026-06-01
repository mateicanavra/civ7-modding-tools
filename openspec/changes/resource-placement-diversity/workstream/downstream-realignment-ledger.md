# Downstream Realignment Ledger

| Affected assumption | Scope | Disposition |
| --- | --- | --- |
| Transitional placement now balances numeric candidate resource ids. | Runtime-facing resource placement before symbolic id proof | Downstream stats/runtime proof should expect broader candidate id usage, but must not treat numeric ids as verified symbolic `RESOURCE_*` coverage yet. |
| Rollup closure metadata is repaired in this follow-up slice. | Closure audits for `resource-group-plan-rollup` | Patched here because the rollup branch was already locally committed clean at `d4150abe8106` before this branch was opened. |
| FireTuner restart path remains a final-proof dependency. | Runtime-proof slices, game restart evidence, DRA handoff | Boundary is owned by the `resource-runtime-proof` phase record; final runtime proof must keep using that socket/API restart path. |
