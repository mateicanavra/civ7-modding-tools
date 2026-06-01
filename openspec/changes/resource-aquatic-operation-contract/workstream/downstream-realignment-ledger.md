# Downstream Realignment Ledger

| Affected assumption | Scope | Disposition |
| --- | --- | --- |
| Aquatic resources now have a symbolic group-planning op surface. | Future resource group ops and `plan-resource-groups` stage work | Patch-needed downstream: later slices should reuse the same symbolic/proxy/proof row shape instead of extending placement numeric candidates. |
| Runtime ids remain unverified. | Placement materialization, stats closure, game log proof | No patch in this slice: later runtime proof must verify `GameInfo.Resources` ids before symbolic rows are materialized. |
| Final resource runtime proof depends on downstack FireTuner socket restart integration. | Runtime-proof slices, game restart evidence, DRA handoff | Boundary recorded here from the downstream resource-runtime-proof boundary: verify `codex/firetuner-socket-studio-restart` at `bb39b3cf7` or successor, restack resource branches on top if it advances, and use the FireTuner socket/API restart path before claiming runtime proof. |
