# Packet 14 Verification Evidence

Packet: `studio-run-diagnostics-retention-guards`

Status: implementation, structural, OpenSpec, review, and live endpoint gates
are green for Packet 14.

## Implementation Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Retention behavior | PASS | `bun nx run control-studio-server:test -- operationRuntime.test.ts` passed with `72` tests. Coverage includes startup cleanup, terminalization cleanup, active operation preservation, latest-100 retention by `terminalAt` plus request id, young terminal retention, diagnostics lookup after retained/deleted workspaces, and attribution sidecar disk retention/deletion. |
| Handler diagnostics lookup | PASS | `bun nx run control-studio-server:test -- handler.test.ts operationRuntime.test.ts` passed with `96` tests after the handler-level oRPC diagnostics test was tightened to wait for the private attribution report's top-level terminal state. |
| Studio server suite | PASS | `bun nx run control-studio-server:test` passed with `128` tests after retention and handler repairs. |
| Studio app suite | PASS | `bun nx run mapgen-studio:test` passed with `411` tests. |
| TypeScript check | PASS | `bun nx run control-studio-server:check` passed. |
| Workspace lint | PASS | `bun run lint` passed for the linted workspace projects. |
| Reviewer repair regression | PASS | After review found a dropped retention-cleanup rerun state, `bun nx run control-studio-server:test -- operationRuntime.test.ts` passed with `72` tests and `bun nx run control-studio-server:check` passed. The repair keeps terminal cleanup non-blocking while recording a pending rerun when another cleanup request arrives mid-flight. |

## Structural Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| SA-14 targeted check | PASS | `bun habitat check --json --rule habitat-studio-run-runtime-authority-closure` passed. |
| MapGen Studio Habitat owner check | PASS | `bun habitat check --owner mapgen-studio --json` passed, including SA-01 through SA-14. |
| Classification | PASS | `bun habitat classify` was run for the changed runtime source, server tests, SA-14 manifest, and structural matrix. Classification routed the runtime files to `control-studio-server` check/test and the authority files to Habitat/workspace lint surfaces. |
| Temporary pattern disposition | PASS | SA-14 rejects unresolved sibling rule directories, manifest/id mismatches, duplicate ids, advisory Grit rules, and rule manifests not listed in SA-01 through SA-14. No active packet-local temporary Grit pattern remains in the Run in Game authority set. |

## OpenSpec Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Packet strict validation | PASS | `bun run openspec -- validate studio-run-diagnostics-retention-guards --strict` passed. |
| All strict validation | PASS | `bun run openspec:validate` passed: `363` items valid. |

## Review Evidence

| Lane | Result | Disposition |
| --- | --- | --- |
| TypeScript refactoring | PASS after repair | Initial no-findings review noted useful test gaps. Accepted and added young-record retention plus attribution sidecar disk checks. Re-review found SA-14 duplicate-id and handler poll brittleness; both repaired. |
| Code quality / structure | PASS after repair | Accepted findings that SA-14 needed to reject unmatrixed sibling rule manifests and assert its own matrix row. Repaired by expected-only sibling validation and SA-14 row validation while keeping child Habitat execution scoped to SA-01 through SA-13. |
| oRPC / Effect / Habitat library correctness | PASS after repair | Accepted findings that terminal retention cleanup should not block the uninterruptible publish path and that SA-14 failure output needed compact child-check summaries. Repaired by FiberSet-scheduled coalesced cleanup and child JSON parsing. |
| Final delta re-review | PASS after repair | TypeScript refactoring re-review found no blocker after the retention scheduler gained a pending-rerun latch. Code quality / structure re-review found a missing test-only type import, untracked evidence logs, and stale live-evidence wording; the import and wording were repaired, and the evidence logs are included in this packet. oRPC / Effect / Habitat library re-review found no blocker after the scheduler and diagnostics fixes. The final evidence-ledger audit found stale event/phase/leak wording; the bounded logs and this record now distinguish poll-sampled phase capture, include an actual `studio.events.watch` sample, and record public-surface leak scans. |

## Final Review Dispositions

| Finding | Disposition | Repair evidence |
| --- | --- | --- |
| Retention cleanup rerun could be dropped while cleanup was active | Accepted | `StudioOperationRuntime` now records a pending cleanup rerun and drains it after the active cleanup finishes; `bun nx run control-studio-server:test -- operationRuntime.test.ts` covers the repaired behavior. |
| Test helper admitted impossible non-terminal retention fixtures | Accepted | `seedRunOperationWorkspace` now seeds terminal records only, matching retention authority. |
| Test-only `RunInGameRequestStatus` type was missing from imports | Accepted | `operationRuntime.test.ts` imports the public status type from `@civ7/studio-contract`; package check passes. |
| Live/control evidence used stale daemon ids after repaired-code rerun | Accepted | This record and both bounded logs now reference daemon `studio-server-mrcbtibw-22ib-1-17a4b8b0-d791-492d-9f22-22e9374a9ed1`. |
| `studio.events.watch` claim lacked a retained bounded sample | Accepted | `final-control-matrix-2026-07-08.json` now stores a bounded sample with `hello` and `live-game` event types. |
| Public/private separation was stated more broadly than the retained scan showed | Accepted | Both bounded logs now include public-surface private-path scan summaries. Private diagnostics lookup remains intentionally private and is not treated as a public surface. |
| Phase samples omitted fast public transitions | Rejected as a closure blocker; accepted as evidence wording issue | `target-vocabulary.md` requires endpoint evidence records, request ids, redacted status/event/current payloads, terminal status when applicable, and the four successful launch variants. It does not require every fast public phase to be individually observed. The live log now records phase capture as poll-sampled public `runInGame.status`; terminal status and post-start Civ7 readback remain the closure criteria for each launch variant. |
| JSDoc and anchor-comment review was not named in durable review evidence | Accepted | Final review lanes inspected comments as part of TypeScript, code quality, and library-correctness review. No narration-comment blocker was found; the retained anchor comments on public/private status, diagnostics lookup, and scheduler behavior explain boundary purpose rather than line mechanics. |

## Live Matrix

PASS. The final repaired-code live/control Studio `/rpc` endpoint calls were
run against daemon
`studio-server-mrcbtibw-22ib-1-17a4b8b0-d791-492d-9f22-22e9374a9ed1`
(`serverStartedAt` `2026-07-08T17:02:59.852Z`). The bounded live summary was
generated through the same public `/rpc` endpoint surface and retrieves private
operation evidence only through explicit `runInGame.diagnostics` lookup.

Bounded evidence files:

- `workstream/logs/final-live-matrix-2026-07-08.summary.json`
- `workstream/logs/final-control-matrix-2026-07-08.json`

The live matrix records poll-sampled public phase observations. Fast transitions
may be absent from a variant's sample; the acceptance claim is terminal public
status plus private diagnostics lookup plus post-start Civ7 live readback for
each requested launch.

Successful in-game launch variants:

| Variant | Request | Source | Expected seed/settings | In-game evidence |
| --- | --- | --- | --- | --- |
| Catalog Huge initial | `studio-run-in-game-mrcbx2gx-22ib-2` | `catalog:latest-juicy` | seed `1538316415`, `MAPSIZE_HUGE`, `10` players, balanced | diagnostics attribution `complete`; loaded-game readback seed `1538316415`, dimensions `106x66`, run artifact `run-b20d09d7ba34b17f77c3` |
| Catalog Huge repeat | `studio-run-in-game-mrcbzrh9-22ib-3` | `catalog:latest-juicy` | seed `1538316415`, `MAPSIZE_HUGE`, `10` players, balanced | diagnostics attribution `complete`; loaded-game readback seed `1538316415`, dimensions `106x66`, run artifact `run-0c1c1b550c7de00019d1` |
| Catalog Standard distinct | `studio-run-in-game-mrcc2huk-22ib-4` | `catalog:latest-juicy` | seed `2026070601`, `MAPSIZE_STANDARD`, `6` players, balanced | diagnostics attribution `complete`; loaded-game readback seed `2026070601`, dimensions `84x54`, run artifact `run-76fb0d9e820ed936105e` |
| Editor fixture Standard | `studio-run-in-game-mrcc514o-22ib-5` | `editor:openspec-editor-standard` | seed `2026070602`, `MAPSIZE_STANDARD`, `6` players, balanced | diagnostics attribution `complete`; loaded-game readback seed `2026070602`, dimensions `84x54`, run artifact `run-d02d71960e8fedb333a4` |

Endpoint/control variants:

- `studio.events.watch` returned `hello` and `live-game` events over `/rpc`.
- `studio.operations.current` returned no active run before control cases and no
  active run after cancellation.
- `runInGame.start` with raw-control bait returned declared
  `RUN_IN_GAME_INVALID` status `400`, safe category `request-validation`, and no
  private path in the public payload.
- A second `runInGame.start` while a run held runtime ownership returned
  `RUN_IN_GAME_BLOCKED` status `409`, safe category `ownership`, and no private
  path in the public payload.
- `mapConfigs.saveDeploy` while Run in Game held ownership returned
  `SAVE_DEPLOY_BLOCKED` status `409`; `mapConfigs.status` was also exercised.
- `runInGame.cancel` terminalized request `studio-run-in-game-mrcc7k4p-22ib-7`
  as `cancelled` with safe category `operation-cancelled`; explicit diagnostics
  lookup returned private cancellation diagnostics, and operations current showed
  no active run afterward.
- Final `civ7.live.status` returned status `200`, `playable: true`,
  readiness `tuner-ready`, seed `2026070602`, dimensions `84x54`, and
  `4536` plots.
- Final `civ7.live.snapshot` returned status `200`, `ok: true`, bounds
  `84x54`, `4536` plots, and a bounded `512` plot payload.
- Public-surface private-path scans in both bounded logs returned
  `containsPrivatePath: false`; private diagnostics lookup retains internal
  paths by design and is not part of the public status surface.

Direct `runInGame.status` lookups for the completed success variants returned
their safe public terminal status during the final live run. Their launch
correlation, generated artifact id, deployment snapshot, and loaded-game
readback remain available only through explicit diagnostics lookup, which is
the intended private diagnostics path for retained runtime evidence.

## Workspace Note

The packet-owned bounded evidence logs are intended artifacts for this change.
The untracked file
`mods/mod-swooper-maps/src/maps/configs/earthlike-wowza.config.json` is not part
of Packet 14 and is excluded from the packet commit.
