# D2 Review Disposition Ledger

Status: accepted
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D2-R1 | app/control inventory | D2 classified mutation-helper control-oRPC procedures but omitted behavior-based retained state machines: display explore, display queue close/current, camera focus, and appshot capture. | P1 | accepted | Added retained-package-authority rows, design/spec coverage, and a behavior-state positive scan. |
| D2-R2 | app runtime inventory | App-hosted helpers were grouped too coarsely: deploy command planning, path/request guards, scripting log reads, Run in Game failure classification, generated artifact regeneration, and repo-envelope checks needed explicit rows. | P1 | accepted | Split corpus rows so D3/D5 cannot miss failure, command, file-safety, log, or rollback ownership. |
| D2-R3 | event/live/deploy inventory | Event hub primitive, operation publisher callbacks, live watcher timer state, and Turbo-era deploy planning needed sharper boundaries. | P2 | accepted | Separated package hub from app callbacks, recorded watcher mutable state, and tied deploy planner to D1's exact Nx command invariant. |
| D2-R4 | control-oRPC authority review | Behavior-state coverage query missed retained direct-control atoms used by display queue current, display explore, and appshot capture. | P2 | accepted | Added `readCiv7DisplayQueue`, `applyCiv7ExploreGrant`, `enterCiv7CleanFrame`, and `exitCiv7CleanFrame` to the behavior-state coverage query. |
| D2-R5 | control-oRPC authority review | Control-oRPC ledger lacked explicit risk and oracle columns even though D2 requires every corpus row to expose them without chat context. | P2 | accepted | Expanded the control-oRPC ledger schema with `Risk if omitted` and `Oracle` columns for every retained procedure/state-machine row. |
| D2-R6 | app engine corpus review | D2 omitted the active `StudioEngineError` status-code/details bridge and pointed D3 at stale `RunInGameHttpError` deletion language. | P1 | accepted | Added an active error bridge corpus row, changed D3 references to `StudioEngineError`/status-code bridge deletion, and kept stale `RunInGameHttpError` as residue only if present on a target baseline. |
| D2-R7 | app engine corpus review | Live-game read model was described narratively but lacked a corpus row with owner, risk, D10 oracle, and trigger. | P2 | accepted | Added a `readLiveGameStatusBody` live-game read model row tied to D10 with per-field projection and live status oracles. |
| D2-R8 | app/adversarial review | Runtime deferred rows lacked explicit re-entry trigger values. | P2 | accepted | Added a `Re-entry trigger` column to the runtime corpus ledger and populated every row, including future-domino rows. |
| D2-R9 | adversarial testing review | Operation state-machine artifacts were too implicit; phase enums, terminal/running classification, recovery actions, completed phases, and status projection could be flattened by later migrations. | P2 | accepted | Added Run in Game and Save/Deploy phase/projection corpus rows with D2.5/D4/D6 owners and exhaustiveness/parity/recovery-action oracles. |

## Required Fresh Reviews

- App-hosted engine corpus review: accepted after D2-R6 through D2-R9 repairs.
- `@civ7/control-orpc` / `@civ7/direct-control` authority review: accepted after D2-R4 and D2-R5 repairs.
- Adversarial omission/complexity review: accepted after D2-R5 and D2-R9 repairs.
