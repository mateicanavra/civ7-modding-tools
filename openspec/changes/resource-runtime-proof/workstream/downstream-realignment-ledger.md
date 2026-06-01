# Downstream Realignment Ledger

| Affected assumption | Scope | Disposition |
| --- | --- | --- |
| Runtime logs did not expose per-resource placement diversity. | Final resource proof and DRA handoff | Patched with `RESOURCE_PLACEMENT_V1` telemetry emitted from `place-resources`. |
| Stats-gate slice closure record was stale after local commit. | Closure audits for `resource-diversity-stats-gate` | Repaired in this follow-up slice at local committed-clean boundary `3cecdf6b49a1`. |
| FireTuner restart path remains a final-proof dependency. | Runtime proof and submission handoff | Historical source proof from `codex/resource-runtime-proof@a674a2ee62f08cf1e1fce5d958eb52e2aab07dd7` used Studio API `POST http://127.0.0.1:5175/api/map-configs`, deployed the source resource worktree, and called the downstack FireTuner socket restart path at `bb39b3cf7`; recorded request id `studio-socket-mpttxk5i-x53`, command `Network.restartGame()`, response `["true"]`, the Civ7 `Begin Game` confirmation step, and bounded logs. The integration branch replays that behavior without claiming a fresh runtime run. |
