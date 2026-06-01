# Review Disposition Ledger

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Wrong initial worktree was the Studio branch, not the morphology handoff branch. | P1 | cleared | Switched to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-morphology-direct-control-objective`, branch `codex/agent-dra-morphology-direct-control-objective`; closed prior agents. |
| Hills are structurally under-authored, not just under-tuned. | P1 | accepted | `design.md` records the root cause; downstream rough-land op slice is required before config tuning. |
| Existing tests can pass with nearly no hills. | P1 | accepted | `design.md` and `tasks.md` require terrain stats/readback gates before closure. |
| Final terrain counts are misleading because volcanoes stamp mountains separately. | P1 | accepted | Corpus and expectation ledgers require non-volcano mountain separation and volcano-kind stats. |
| Elevation/cliff proof is incomplete. | P1 | accepted | Repaired by live surface proof and controlled target-map seed `1018` readback through bounded `GameplayMap.getElevation` and `GameplayMap.isCliffCrossing` aggregate probes after `buildElevation()`. |
| Studio setup/run-in-game is not proof-ready. | P1 | accepted | Direct-control boundary excludes selected Studio setup proof and uses package CLI/App UI/Tuner surfaces. |
| Direct-control `game map` lacks first-class cliff/crossing field. | P1 | accepted | Runtime proof uses the package-routed read-only Tuner aggregate probe for cliff proof; first-class aggregate map fields remain downstream package polish, not a blocker for current product proof. |
| Diagnostics helpers are stale: canonical envelope passed as recipe config, dump analyzer path mismatch. | P2 | accepted | Downstream stats/readback slice must repair diagnostics before using those paths as proof. |
| Studio endpoints are narrow and `/api/civ7/live/*` is design-only. | P2 | accepted | Corpus ledger records only implemented endpoints: `/status`, `/map-summary`, `/gameinfo`. |
| CLI `game inspect` should use narrow roots. | P2 | accepted | Runtime proof path restricts inspection to targeted roots such as `GameplayMap`. |
| Expectation ledger was stale after rough-land and live-readback slices. | P2 | accepted | Updated expectation rows to mark rough-land ownership implemented and target-map seed `1018` elevation/cliff/runtime proof captured. |
| Runtime proof used a placeholder command and lacked request/log boundary. | P2 | accepted | `verification-and-runtime-proof.md` now records the exact read-only `game exec` probe, parsed payload summary, request-id absence, and log-boundary waiver. |
| Stats/readback and rough-land validation tasks lacked adjacent proof records. | P2 | accepted | Added `morphology-terrain-stats-readback/proof.md`; expanded `morphology-rough-land-owner/proof.md` with OpenSpec and diff-check evidence. |
| World-balance component/local-relief stats use local no-wrap topology rather than canonical odd-q wrapping. | P2 | accepted | Repaired by routing stats component/local-relief neighbors through `getHexNeighborIndicesOddQ`. |
| Resource regression proof is not covered by current terrain/feature stats. | P2 | accepted | Repaired for basic proof by adding resource target/plan/outcome/final readback counters to `WorldBalanceStats`; richer resource quality gates remain downstream. |
| `plan-rough-lands` lacks owner-local core invariant tests. | P2 | accepted | Repaired with owner-local tests for protected-tile exclusion, remaining hill budget, and causal-support gating. |
| `fractalRoughLand` contract understates its role. | P2 | accepted | Repaired by describing fractal roughness as a minor scoring plus clustering/tie-break signal. |

## Agent Closure

- `019e800d-0b7a-7773-bd48-a62e4fd605e3` closed after read-only root-cause review.
- `019e800d-21a0-7ec3-bf22-7da2d9f4e61a` closed after read-only direct-control surface review.
- `019e8042-f00e-7d03-9683-1e91991da980` closed after read-only proof-ledger closure review.
- `019e8043-07af-7162-86ab-2d9767b47fe7` closed after read-only implementation/stats review.
