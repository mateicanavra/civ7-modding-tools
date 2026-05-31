# Review Disposition Ledger

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Wrong initial worktree was the Studio branch, not the morphology handoff branch. | P1 | cleared | Switched to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-morphology-direct-control-objective`, branch `codex/agent-dra-morphology-direct-control-objective`; closed prior agents. |
| Hills are structurally under-authored, not just under-tuned. | P1 | accepted | `design.md` records the root cause; downstream rough-land op slice is required before config tuning. |
| Existing tests can pass with nearly no hills. | P1 | accepted | `design.md` and `tasks.md` require terrain stats/readback gates before closure. |
| Final terrain counts are misleading because volcanoes stamp mountains separately. | P1 | accepted | Corpus and expectation ledgers require non-volcano mountain separation and volcano-kind stats. |
| Elevation/cliff proof is incomplete. | P1 | accepted | Runtime proof ledger marks cliff/elevation proof unresolved; design requires direct-control cliff field or bounded approved read-only probe. |
| Studio setup/run-in-game is not proof-ready. | P1 | accepted | Direct-control boundary excludes selected Studio setup proof and uses package CLI/App UI/Tuner surfaces. |
| Direct-control `game map` lacks first-class cliff/crossing field. | P1 | accepted | Runtime proof ledger marks this as a closure boundary. |
| Diagnostics helpers are stale: canonical envelope passed as recipe config, dump analyzer path mismatch. | P2 | accepted | Downstream stats/readback slice must repair diagnostics before using those paths as proof. |
| Studio endpoints are narrow and `/api/civ7/live/*` is design-only. | P2 | accepted | Corpus ledger records only implemented endpoints: `/status`, `/map-summary`, `/gameinfo`. |
| CLI `game inspect` should use narrow roots. | P2 | accepted | Runtime proof path restricts inspection to targeted roots such as `GameplayMap`. |

## Agent Closure

- `019e800d-0b7a-7773-bd48-a62e4fd605e3` closed after read-only root-cause review.
- `019e800d-21a0-7ec3-bf22-7da2d9f4e61a` closed after read-only direct-control surface review.
