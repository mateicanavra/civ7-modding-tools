# Verification Evidence

Packet 12 remains open. This ledger records the local verification sub-slices
that introduce the private runtime-observation boundary and production public
`/rpc` readback path.

| Gate | Evidence | Result | Proof Class | Notes |
| --- | --- | --- | --- | --- |
| Studio contract typecheck | `bun nx run studio-contract:check` | Passed | Typecheck | Added typed `civ7.live.status` and `civ7.live.snapshot` output aliases. |
| Server typecheck | `bun nx run control-studio-server:check` | Passed | Typecheck | Runtime observation port, workflow transition, private operation model, and proof-builder changes compile. |
| App typecheck | `bun nx run mapgen-studio:check` | Passed | Typecheck | Production observer compiles with typed oRPC endpoint outputs and abortable calls. |
| Server behavior tests | `bun nx run control-studio-server:test` | Passed, 8 files / 122 tests | Behavior test | Workflow fakes updated for the private observation record. One uncached run exposed an existing operation-runtime lease-release timing flake; the operation runtime file and then full server suite passed on rerun, and a read-only investigation found the red gate unrelated to the Packet 12 app observer diff. |
| Direct-control log marker tests | `bun nx run control-direct:test -- --run test/session.test.ts` | Passed, 1 file / 17 tests | Unit/integration tests | Covers `waitForFreshLogMarkers` ordered fresh-marker behavior used by Studio's scripting-log observation window. |
| Direct-control log offset tests | `bun nx run control-direct:test -- --run test/runtime-and-catalog.test.ts` | Passed, 1 file / 11 tests | Unit/integration tests | Covers fresh-marker reads after previous log snapshots, including Civ rewriting the log at the same byte length and beyond the old offset. |
| Targeted observer behavior tests | `bun nx run mapgen-studio:test -- --run test/runInGame/runtimeObservation.test.ts` | Passed, 1 file / 25 tests | Behavior test | Production observer proves HTTP `/rpc` requests reach `civ7.live.status` and `civ7.live.snapshot`, plus matched correlation/deployment/setup/log evidence, compiler-exhaustive `RunCorrelation` field mismatch coverage, stale-marker-only/shape-only proof rejection, marker dimension mismatch, missing setup readback, missing setup visibility readback, setup row mismatch, setup row `value` and legacy `mapScript` identity acceptance, endpoint unavailable, live status HTTP transport failure, embedded status/App UI/map-summary errors, App UI not-in-game, snapshot procedure failure, snapshot HTTP transport failure, live snapshot dimension mismatch, empty-grid rejection, and missing-dimension rejection. |
| App behavior tests | `bun nx run mapgen-studio:test` | Passed, 69 files / 409 tests | Behavior test | One-mount/server tests updated for the observation port; production runtime-observation helper now has expanded targeted behavior coverage. |
| SA-12 Pattern Authority targeted check | `bun habitat check --rule grit-studio-run-direct-control-observation-boundary --json` | Passed, 0 diagnostics | Habitat/Grit structural authority | Registered the path-scoped source-boundary rule with an empty baseline. The rule guards the observation port, private observation record tokens, workflow call/retention, app-side Studio RPC delegation, live-client status/snapshot calls, and forbidden workflow/observer direct-control imports without converting the invariant into a Habitat structure/topology rule or brittle implementation line shapes. The concrete `/rpc` route prefix is proven by the targeted observer behavior tests. |
| SA-12 rule classification | `bun habitat classify .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-direct-control-observation-boundary` | Passed | Habitat routing | Classified as `habitat-authority`; runnable workspace `lint` plus workspace gates reported. No project-local habitat-authority check target exists. |
| MapGen Studio owner Habitat check | `bun habitat check --owner mapgen-studio --json` | Passed, 15 rules / 0 failing | Habitat authority | Includes SA-12 in the shared Grit batch with 0 diagnostics. |
| MapGen Studio Nx Habitat check | `bun nx run mapgen-studio:habitat:check --skip-nx-cache --outputStyle=static` | Passed, 15 rules / 0 failing | Nx/Habitat authority | Built dependencies and ran owner Habitat gate. Nx reported existing flaky cached tasks for `control-direct:build-bundle` and `mapgen-core:build`; the gate itself passed. |
| OpenSpec strict validation | `bun run openspec -- validate studio-run-runtime-observation --strict` | Passed | OpenSpec validation | Change `studio-run-runtime-observation` is valid. |
| Workspace lint | `bun run lint` | Passed, 9 projects | Static guard | Classify-reported workspace lint gate passed after a formatting-only cleanup in `mods/mod-swooper-maps/project.json`; this is hygiene only, not runtime topology authority. |
| Whitespace/diff sanity | `git diff --check` | Passed | Static guard | No whitespace errors in the slice. |
| TypeScript refactoring review | Reviewer lanes Hypatia, Kuhn, Sagan | Cleared P1/P2 | Peer review | Hypatia's setup-row identity P2 was repaired by matching direct-control's `file`/`value`/legacy `mapScript` identity model and adding targeted behavior coverage. Kuhn's exhaustive-correlation and legacy `mapScript` proof P2s were repaired with a compiler-exhaustive keyed `RunCorrelation` mismatch matrix and a legacy `mapScript` success test. Sagan re-reviewed the repairs and found no remaining P1/P2 regressions. |
| Code quality/structure review | Reviewer lanes Tesla, Confucius, Copernicus | Cleared P1/P2 | Peer review | Tesla's setup-row overclaim and live-status transport coverage findings were repaired with production enforcement plus HTTP transport tests. Confucius and Copernicus cleared the repaired behavior/evidence shape, confirmed the live gate remains honestly open, and found no Habitat topology misuse or public/private leakage. |
| oRPC/Effect/library correctness review | Reviewer lanes Anscombe, Chandrasekhar, Arendt | Cleared P1/P2/P3 | Peer review | Production readback uses public `/rpc` via `RPCLink`, not direct-control or an in-process router shortcut. Chandrasekhar's P3 proof-strength finding was repaired by separating snapshot declared procedure failure from snapshot HTTP transport failure. Arendt re-reviewed against official oRPC/Effect documentation and found no remaining P1/P2/P3 issues. |

## Sub-Slice Coverage

Implemented and locally verified:

- private `RunInGameRuntimeObservation` records for scripting log, setup row,
  loaded-game readback, deployment evidence, and correlation;
- `observeRunInGameRuntime` workflow port between fresh log proof and final proof;
- production observer using the running daemon's public `/rpc` mount for
  `civ7.live.status` and `civ7.live.snapshot`;
- requested map-size dimensions resolved from Civ7 map-size presets, matched
  against the generated runtime marker and live snapshot dimensions;
- loaded-game oracle implementation rejects embedded `status`, `appUi`, and
  `mapSummary` errors and requires App UI `inGame` proof;
- targeted production observer behavior tests proving public `/rpc` readback,
  exact marker correlation, setup-row requirement, setup-row visibility
  requirement, setup-row `file`/`value`/`mapScript` identity handling,
  setup-row mismatch rejection, marker-dimension requirement,
  compiler-exhaustive `RunCorrelation` field mismatch coverage,
  stale-marker-only/shape-only marker
  rejection, endpoint-unavailable failure, live status HTTP transport failure,
  embedded live status/App UI/map-summary field errors, App UI not-in-game
  rejection, snapshot procedure failure, snapshot HTTP transport failure,
  loaded-game snapshot dimension mismatch, empty-grid rejection, and
  missing-dimension diagnostics;
- direct-control fresh-log marker tests cover the scripting-log observation
  cursor and stale-log exclusion behavior that the Studio engine delegates to
  `waitForFreshLogMarkers`;
- setup-row mismatch maps to `runtime-observation`; the post-start observer
  accepts the direct-control setup row identity fields (`file`, `value`, or
  legacy `mapScript`), rejects setup row readback that does not name the
  generated map script, and records bounded private diagnostics for lookup;
- successful private observation is retained on the internal operation for
  diagnostics lookup while public status projection remains safe.

Still open for Packet 12 closure:

- OpenSpec strict validation after the full packet slice;
- Habitat classify-reported packet checks;
- live Studio endpoint plus Civ7-controlled runtime observation gate.
