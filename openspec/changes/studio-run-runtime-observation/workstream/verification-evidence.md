# Verification Evidence

Packet 12 is closed-passed. This ledger records the behavior, authority,
review, and live runtime gates for the private runtime-observation boundary and
production public `/rpc` readback path.

| Gate | Evidence | Result | Evidence Type | Notes |
| --- | --- | --- | --- | --- |
| Studio contract typecheck | `bun nx run studio-contract:check` | Passed | Typecheck | Added typed `civ7.live.status` and `civ7.live.snapshot` output aliases. |
| Server typecheck | `bun nx run control-studio-server:check` | Passed | Typecheck | Runtime observation port, workflow transition, private operation model, and identity-builder changes compile. |
| App typecheck | `bun nx run mapgen-studio:check` | Passed | Typecheck | Production observer compiles with typed oRPC endpoint outputs, abortable calls, readiness polling, and compact marker parsing. |
| Civ7 SDK typecheck | `bun nx run civ7-sdk:check` | Passed | Typecheck | `MapDefinition` identity union and compact runtime marker emission compile. |
| Swooper Maps typecheck | `bun nx run mod-swooper-maps:check` | Passed | Typecheck | Studio-run generated mod file plan compiles without generated run module text. |
| Server behavior tests | `bun nx run control-studio-server:test` | Passed, 8 files / 122 tests | Behavior test | Workflow fakes updated for the private observation record. One uncached run exposed an existing operation-runtime lease-release timing flake; the operation runtime file and then full server suite passed on rerun, and a read-only investigation found the red gate unrelated to the Packet 12 app observer diff. |
| Direct-control log marker tests | `bun nx run control-direct:test -- --run test/session.test.ts` | Passed, 1 file / 17 tests | Unit/integration tests | Covers `waitForFreshLogMarkers` ordered fresh-marker behavior used by Studio's scripting-log observation window. |
| Direct-control log offset tests | `bun nx run control-direct:test -- --run test/runtime-and-catalog.test.ts` | Passed, 1 file / 11 tests | Unit/integration tests | Covers fresh-marker reads after previous log snapshots, including Civ rewriting the log at the same byte length and beyond the old offset. |
| Targeted observer behavior tests | `bun nx run mapgen-studio:test -- --run test/runInGame/runtimeObservation.test.ts test/runInGame/proofIdentity.test.ts` | Passed, 2 files / 39 tests | Behavior test | Production observer reaches `civ7.live.status` and `civ7.live.snapshot` through HTTP `/rpc`; waits for playable in-game status before snapshot; parses compact runtime markers; rejects stale-marker-only and shape-only marker data; checks exact correlation, deployment, setup row, marker dimensions, loaded-game dimensions, empty grids, embedded live status/App UI/map-summary errors, HTTP transport failures, and abort behavior. |
| App behavior tests | `bun nx run mapgen-studio:test` | Passed, 69 files / 411 tests | Behavior test | One-mount/server tests updated for the observation port; production runtime-observation helper has expanded targeted behavior coverage. |
| Civ7 SDK marker tests | `bun nx run civ7-sdk:test -- --run test/mapgen-create-map.test.ts` | Passed, 1 file / 1 test | Behavior test | Runtime marker logs emit compact request/run/config/envelope/manifest/seed/dimension fields, keep the two marker lines below Civ log truncation risk, and do not embed nested `runCorrelation`. |
| Swooper generated-run tests | `bun nx run mod-swooper-maps:test -- --run test/config/run-manifest-generator.test.ts test/config/map-artifact-file-plan.test.ts` | Passed, 2 files / 14 tests | Behavior test | Studio-run mod plan emits the requested run source/config/modinfo/text files, depends on durable `swooper-maps`, omits biome hazard data and generated module text, and passes the owner Habitat gate bundled in the test run. |
| SA-12 Pattern Authority targeted check | `bun habitat check --rule grit-studio-run-direct-control-observation-boundary --json` | Passed, 0 diagnostics | Habitat/Grit structural authority | Registered the path-scoped source-boundary rule with an empty baseline. The rule guards the observation port, private observation record tokens, workflow call/retention, app-side Studio RPC delegation, live-client status/snapshot calls, and forbidden workflow/observer direct-control imports without converting the invariant into a Habitat structure/topology rule or brittle implementation line shapes. The concrete `/rpc` route prefix is covered by targeted observer behavior tests. |
| SA-12 rule classification | `bun habitat classify .habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-direct-control-observation-boundary` | Passed | Habitat routing | Classified as `habitat-authority`; runnable workspace `lint` plus workspace gates reported. No project-local habitat-authority check target exists. |
| MapGen Studio owner Habitat check | `bun habitat check --owner mapgen-studio --json` | Passed, 15 rules / 0 failing | Habitat authority | Includes SA-12 in the shared Grit batch with 0 diagnostics. |
| MapGen Studio Nx Habitat check | `bun nx run mapgen-studio:habitat:check --skip-nx-cache --outputStyle=static` | Passed, 15 rules / 0 failing | Nx/Habitat authority | Built dependencies and ran owner Habitat gate. Nx reported existing flaky cached tasks for `control-direct:build-bundle` and `mapgen-core:build`; the gate itself passed. |
| Habitat classify-reported source checks | `bun habitat classify <path>` for `apps/mapgen-studio/src/server/runInGame/runtimeObservation.ts`, `mods/mod-swooper-maps/scripts/map-artifacts/file-plan.ts`, `packages/sdk/src/mapgen/createMap.ts`, and this ledger | Passed | Habitat routing | Source paths route to their owner checks/tests plus workspace lint. A first multi-path classify attempt failed because `classify` accepts one path at a time; rerunning the relevant paths individually succeeded. |
| OpenSpec strict validation | `bun run openspec -- validate studio-run-runtime-observation --strict` | Passed | OpenSpec validation | Change `studio-run-runtime-observation` is valid. |
| Workspace lint | `bun run lint` | Passed, 9 projects | Static guard | Classify-reported workspace lint gate passed after a formatting-only cleanup in `mods/mod-swooper-maps/project.json`; this is hygiene only, not runtime topology authority. |
| Whitespace/diff sanity | `git diff --check` | Passed | Static guard | No whitespace errors in the slice. |
| TypeScript refactoring review | Reviewer lanes Hypatia, Kuhn, Sagan, Gibbs, Nietzsche | Cleared P1/P2 | Peer review | Findings repaired across setup-row identity, exhaustive correlation mismatch coverage, legacy `mapScript` acceptance, live status readiness classification, typed compact runtime marker identity, and render-mode split. Follow-up review found no remaining P1/P2 regressions. |
| Code quality/structure review | Reviewer lanes Tesla, Confucius, Copernicus, Kant | Cleared P1/P2 | Peer review | Reviewers cleared public/private separation, bounded diagnostics, non-brittle Habitat usage, generated-run mod shape, readiness polling, and comment quality. The live gate remained open until the endpoint/Civ checks below completed. |
| oRPC/Effect/library correctness review | Reviewer lanes Anscombe, Chandrasekhar, Arendt, Turing, Epicurus | Cleared P1/P2/P3 | Peer review | Production readback uses public `/rpc` via `RPCLink`, not direct-control or an in-process router shortcut. Findings around declared procedure failure, abort mapping, mod dependency metadata, and readiness polling were repaired and re-reviewed. |
| Live Studio daemon health | `GET /healthz` against the running Studio daemon | Passed | Live endpoint | Daemon responded with server instance `studio-server-mrbrwmbj-2037-1-e75e6f48-e36b-4ff7-a34d-e79c59e99afb`, repo root for this worktree, and runtime mode `studio-daemon-effect-orpc`. |
| Live Run in Game start/status | Public `runInGame.start` followed by public status polling | Passed | Live endpoint + Civ7 runtime | Request `studio-run-in-game-mrbrwz30-2037-2` completed at revision 11. Public diagnostics id `run-diagnostics-2f5d7d2d-57b2-4829-acc6-d720913c1c93` exposed only safe public status while private diagnostics retained the detailed observation. Completed phases were `resolving-source`, `generating-artifacts`, `deploying`, `preparing-civ7`, `starting-game`, and `observing-runtime`. |
| Live deployment correlation | Private diagnostics lookup for the completed run | Passed | Private diagnostics | Run artifact `run-af9b0a99ad437f038e8c` launched map script `{mod-swooper-studio-run}/maps/run-af9b0a99ad437f038e8c.js`; deployed snapshot digest `b85c43ab9271473151793c399f4bccbeed7dcca3ef8215c507c009ebf9b84608`; generated/deployed snapshot copied 4 files. |
| Live runtime observation | Private diagnostics runtime observation | Passed | Civ7 runtime | Scripting log matched `[mapgen-proof]`, request id, config hash, envelope hash, and `[mapgen-complete]`; setup row state matched both setup-domain and config-db rows for the generated map script; loaded game snapshot `status:1:a24fa62c` had snapshot hash `a24fa62c`, dimensions 84x54, and deployed snapshot digest matching the generated run. |
| Live public `/rpc` status | `civ7.live.status` through `/rpc` after run completion | Passed | Live endpoint | Returned `ok: true`, `playable: true`, readiness `tuner-ready`, App UI `inGame: true`, `inShell: false`, `inLoading: false`, `loadingStateName: "GameStarted"`, active input context `World`, map width 84, map height 54, plot count 4536, random seed 123, and Tuner ready true. |
| Live public `/rpc` snapshot | `civ7.live.snapshot({ width: 84, height: 54, maxPlots: 512 })` through `/rpc` | Passed | Live endpoint | Returned `ok: true`, observed at `2026-07-08T07:48:50.976Z`, grid plot count 4536, grid dimensions 84x54, and a bounded 512-plot payload. |
| CLI runtime support checks | `node packages/cli/bin/run.js game status --json` and `node packages/cli/bin/run.js game inspect --app-ui-snapshot --json` | Passed | Runtime support | Status reported playable/Tuner-ready in-game state. Inspect reported `GameStarted`, turn 1, map width 84, height 54, and random seed 123. No center-screen intro click was needed for this run. |
| Live scripting log markers | Parsed `~/Library/Application Support/Civilization VII/Logs/Scripting.log` | Passed | Runtime log evidence | The `[mapgen-proof]` marker at line 6 was 537 characters and `[mapgen-complete]` at line 384 was 540 characters. Both carried request `studio-run-in-game-mrbrwz30-2037-2`, run artifact `run-af9b0a99ad437f038e8c`, config hash `ed5ecc7a8f53e04e754dc4811b70850f4b18e60b04a8fac707a7d183dbcb21e0`, envelope hash `b0029c0803e5f867c5fe51a3ea7a9308572ddaa366e4b19e67684143f96e1d0e`, generation manifest digest `51d4f32db9ac2d1a451c6d3ef67e1a19879b637e3d2f4bb9e3c31d07478a6e4e`, seed 123, dimensions 84x54, and no nested `runCorrelation`. |

## Sub-Slice Coverage

Implemented and locally verified:

- private `RunInGameRuntimeObservation` records for scripting log, setup row,
  loaded-game readback, deployment evidence, and correlation;
- `observeRunInGameRuntime` workflow port between fresh log marker collection
  and final workflow result;
- production observer using the running daemon's public `/rpc` mount for
  `civ7.live.status` and `civ7.live.snapshot`;
- readiness polling that waits for playable App UI in-game state before taking
  the loaded-game snapshot;
- requested map-size dimensions resolved from Civ7 map-size presets, matched
  against the generated runtime marker and live snapshot dimensions;
- loaded-game oracle implementation rejects embedded `status`, `appUi`, and
  `mapSummary` errors and requires App UI `inGame` evidence;
- compact runtime marker emission and parsing so Civ log lines carry the run
  identity without embedding nested private correlation objects;
- generated Studio-run mod file plan that launches the exact run source, depends
  on durable Swooper Maps content, and does not duplicate generated module text
  or biome hazard artifacts inside the run mod;
- targeted production observer behavior tests covering public `/rpc` readback,
  exact marker correlation, setup-row requirement, setup-row visibility
  requirement, setup-row `file`/`value`/`mapScript` identity handling,
  setup-row mismatch rejection, marker-dimension requirement,
  compiler-exhaustive `RunCorrelation` field mismatch coverage,
  stale-marker-only/shape-only marker rejection, endpoint-unavailable failure,
  readiness waiting, live status HTTP transport failure, abort mapping,
  embedded live status/App UI/map-summary field errors, App UI not-in-game
  rejection, snapshot procedure failure, snapshot HTTP transport failure,
  loaded-game snapshot dimension mismatch, empty-grid rejection, and
  missing-dimension diagnostics;
- direct-control fresh-log marker tests covering the scripting-log observation
  cursor and stale-log exclusion behavior that the Studio engine delegates to
  `waitForFreshLogMarkers`;
- successful private observation retained on the internal operation for explicit
  diagnostics lookup while public status projection remains safe.

## Packet 12 Closure Status

No declared Packet 12 gate was skipped. The packet closes with behavior tests,
typechecks, OpenSpec strict validation, Habitat authority checks,
classify-reported routing checks, reviewer lanes, and live Studio/Civ7 endpoint
gates completed.
