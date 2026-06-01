# Downstream Realignment Ledger

| Surface | Disposition | Notes |
|---|---|---|
| `resource-earthlike-expectations` slice | patch-needed downstream | Consume `OFFICIAL_RESOURCE_CORPUS` and preserve blocked caveats until source-backed dispositions exist. |
| `resource-artifact-boundary` slice | patch-needed downstream | Use `artifact:resources.corpus` as a resource-owned artifact input; do not move placement resource plan in this slice. |
| Runtime proof slice | patch-needed downstream | Verify `GameInfo.Resources` mapping using bounded in-game telemetry before setting runtime ids to `verified` or `mismatch`. |
| Adapter `PLACEABLE_RESOURCE_TYPE_IDS` | no patch in this slice | Remains numeric candidate catalog only; symbolic mapping deferred to runtime proof. |
| SDK resource constants | no patch in this slice | Stale constants observed, but corpus contract does not edit SDK constants. |
| Official `.civ7` resources | no patch | Read-only authority source. |
