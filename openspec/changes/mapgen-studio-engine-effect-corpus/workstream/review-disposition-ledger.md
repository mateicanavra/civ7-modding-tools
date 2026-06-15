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

## Implementation Refresh Review - 2026-06-15

Reviewer: Rawls (`019ec9c5-f720-7622-9dfe-96630944faf5`).

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D2-IR1 | control-oRPC retained behavior coverage | `display.explore.request` uses `getCiv7VisibilitySummary`, but the D2 coverage query and guard omitted that retained direct-control/facade seam. | P2 | accepted | Added `getCiv7VisibilitySummary` to the control-oRPC coverage query, behavior-state ledger row, and durable corpus guard. |
| D2-IR2 | Studio host context corpus | `StudioServerContext.civ7Control` was not represented as its own host-injected composition seam even though it supplies `liveCiv7ControlOrpcDirectControlFacade` and feeds `Civ7ControlOrpcRouter` through the one `/rpc` handler. | P2 | accepted | Added a retained-package-authority row for `StudioServerContext.civ7Control`, `liveCiv7ControlOrpcDirectControlFacade`, `context.civ7Control.directControl`, `context.civ7Control.timeoutMs`, and `Civ7ControlOrpcRouter`; the guard now checks those exact ledger tokens. |
| D2-IR3 | Studio host context classification | `StudioServerContext.loadSetupCatalog` was grouped with stateful operation-engine functions even though it is a setup catalog/resource seam, not an operation runtime mutation engine. | P2 | accepted | Split `StudioServerContext.loadSetupCatalog` into its own future-domino/D12 retained-surface row and left the operation host-function row scoped to Autoplay, Run in Game, Save/Deploy, and operations-current functions. |
| D2-IR4 | Run in Game proof/live projection corpus | `buildLiveRuntimeStatusState` and `liveRuntimeSnapshot` feed exact-authorship proof assembly, but D2 only named the package live-game read model. | P3 | accepted | Added a `Run in Game live-runtime snapshot projection` row for `buildLiveRuntimeStatusState`, `liveRuntimeSnapshot`, `snapshotId`, `snapshotHash`, `turn`, and `gameHash`, with D5/D10 ownership and proof oracles. |
| D2-IR5 | corpus guard strength | The new guard could pass if a token appeared in prose/query text rather than a real ledger row with classification/risk/oracle/re-entry fields. | P3 | accepted | Strengthened `engineEffectCorpus.test.ts` to parse markdown rows and require each discovered token to appear in a row with nonempty classification, risk, oracle, and re-entry trigger columns. |

All implementation-refresh findings above are repaired as of the green focused
guard run on 2026-06-15.
