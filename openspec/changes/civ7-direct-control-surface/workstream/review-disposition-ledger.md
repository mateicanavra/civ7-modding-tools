# Review Disposition Ledger

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| A1 | P2 | implementation architecture | Studio still owned host/default selection and bypassed multi-host package discovery | boundary | accepted | Remove Studio-local host/default selection and call package restart/log helpers directly. | `apps/mapgen-studio/vite.config.ts` now imports `restartCiv7GameAndBegin`, `snapshotFile`, and `waitForFreshLogMarkers` from `@civ7/direct-control`; no `CIV7_FIRETUNER_*` host parsing remains. | no |
| A2 | P2 | implementation architecture | Readiness polling could replay arbitrary commands | verification | invalidated | Confirm wait helper uses health/state discovery only. | `waitForCiv7DirectControl` calls `checkCiv7DirectControlHealth`; no command replay path exists. | no |
| A3 | P2 | implementation architecture | CLI `--wait` could use stale restart state id | verification | accepted | Keep default wait role-based for `App UI`; explicit state id remains caller-selected behavior. | `game restart` uses `{ role: "app-ui" }` unless a caller supplies `--state`; state-id reuse is not hidden fallback behavior. | no |
| A4 | P3 | implementation architecture | Workstream tasks and next packet were stale | downstream | accepted | Update tasks, downstream ledger, next packet, and bridge removal ledger. | `tasks.md`, `downstream-realignment-ledger.md`, `next-packet.md`, and `remove-firetuner-bridge-legacy/tasks.md` updated. | no |
| V1 | P2 | verification audit | Studio coverage and final live proof were partial | verification | accepted | Run Studio build and record live direct-control boundaries. | `bun run --cwd apps/mapgen-studio build` passed; fresh live restart/begin loop reached `GameStarted`, passed Tuner health, and produced fresh `Scripting.log` markers. | no |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.

No material finding may remain undispositioned at phase closure.
