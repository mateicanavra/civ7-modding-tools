# Packet 01 Evidence - Public Status / Private Diagnostics

Packet: `studio-run-public-status-diagnostics`

Status: Packet 1 declared gates complete. Later packet-train live Civ7/generated-content gates remain.

## What Moved

- `runInGame.start`, `runInGame.status`, operation events, current operations, and UI consumers now use a closed public Run in Game status union: running states cannot carry terminal-only fields, completed states carry `terminalAt`, and abnormal terminal states carry a safe failure category.
- Run in Game oRPC defined errors now project safe public error data instead of the shared private failure diagnostics shape.
- Private runtime evidence is persisted under `.mapgen-studio/run-in-game/<requestId>/diagnostics/diagnostics.json` and exposed only by explicit `runInGame.diagnostics({ diagnosticsId })` lookup. Lookup scans request workspaces by public diagnostics id and verifies the record belongs to the owning request directory.
- The diagnostics workspace root is configured from the daemon repo root instead of the app process cwd; live proof showed the repo-root diagnostics file exists and the app-cwd duplicate does not.
- Public `diagnosticsId` is now snapshot-gated: the runtime records an internal operation revision and only projects the id when private diagnostics were persisted for that exact revision. Later unpersisted snapshots hide the id even when they share the same timestamp.
- Diagnostics persistence failure is handled as controlled runtime behavior: the server logs the failed private write, publishes the safe public operation without `diagnosticsId`, and does not turn the write failure into an undeclared oRPC defect.
- UI status surfaces now render safe failure category and diagnostics id instead of raw errors, setup/deploy internals, source snapshots, materialization details, command output, or exact authorship proof.
- Runtime tests that previously depended on public private-data leakage now observe private workflow state through ports or explicit diagnostics lookup.
- `.mapgen-studio/` private runtime diagnostics are ignored as local scratch evidence; test-generated private diagnostics were removed from the worktree.

## Verification Run

- `nx run mapgen-studio:test` - pass, 67 files, 378 tests. This was the previously red classify-reported app test gate.
- `nx run-many -t check --projects=studio-contract,control-studio-server,mapgen-studio-ui,mapgen-studio` - pass.
- `nx run-many -t test --projects=control-studio-server,mapgen-studio-ui` - pass: `control-studio-server` 87 tests, `mapgen-studio-ui` 168 tests.
- `nx run control-studio-server:test -- operationRuntime.test.ts errorSpine.test.ts contractTypeboxSpine.test.ts handler.test.ts` - pass, 66 tests.
- `nx run control-studio-server:test -- operationRuntime.test.ts` - pass, 37 tests.
- `nx run mapgen-studio:test -- runInGame/clientState.test.ts runInGame/status.test.ts studioEvents/operationAdoption.test.ts` - pass, 25 tests.
- `nx run mapgen-studio:test -- controllers/useStudioOperations.test.tsx` - pass, 3 tests.
- `nx run mapgen-studio-ui:test` - pass, 168 tests.
- `bun run openspec -- validate studio-run-public-status-diagnostics --strict` - pass.
- `nx run mapgen-studio:habitat:check` - pass, 8 Studio-owned Habitat rules including SA-01. This is the graph-owned proof boundary for generated `apps/mapgen-studio/dist` bundle checks because it depends on `mapgen-studio:build`.
- `bun tools/habitat/bin/dev.ts check --owner mapgen-studio --json` - pass, 8 Studio-owned rules, after the graph-owned build produced `apps/mapgen-studio/dist`; direct Habitat owner checks are read-only and do not build generated app assets.
- `bun tools/habitat/bin/dev.ts check --rule grit-studio-run-public-contract-closed --json` - pass.
- `bun tools/habitat/bin/dev.ts check --owner mapgen-studio --runner grit --json` - pass, 4 Studio-owned Grit rules.
- `bun tools/habitat/bin/dev.ts check --rule require_recipe_dag_contract_metadata --json` - pass.
- `bun tools/habitat/bin/dev.ts check --rule prohibit_recipe_dag_runtime_source_dependencies --json` - pass.
- `nx run mod-swooper-maps:check` - pass.
- `nx run mod-swooper-maps:test` - pass, 493 pass, 2 skipped, 0 failed across 140 files. The owner Habitat check inside this target passed 81 rules.
- `bun tools/habitat/bin/dev.ts check --owner mod-swooper-maps --json` - pass, 81 rules.
- `nx run habitat:test -- test/lib/grit-provider.test.ts` - pass, 33 tests.
- `nx run habitat:build:tsc` - pass.
- `bun tools/habitat/bin/dev.ts check --owner mod-swooper-maps --runner grit --json` - pass, 61 rules.
- `bun tools/habitat/bin/dev.ts check --owner mod-swooper-maps --runner habitat --json` - pass.
- `bun tools/habitat/bin/dev.ts check --rule require_recipe_stage_authoring_file_shape --json` - pass.
- `bun run lint` - pass, 9 lint targets.
- `git diff --check` - pass.
- `bun habitat classify apps/mapgen-studio` - routed `mapgen-studio:check`, `mapgen-studio:test`, workspace lint, and the Studio topology/recipe-DAG Habitat and Grit rules.
- `bun habitat classify packages/studio-server` - routed `control-studio-server:check`, `control-studio-server:test`, workspace lint, and Habitat import/format/owner gates.
- `bun habitat classify packages/studio-contract` - routed `studio-contract:check`, workspace lint, and Habitat import/format/owner gates; `studio-contract:test` is unavailable because the project has no Nx test target.
- `bun habitat classify packages/mapgen-studio-ui` - routed `mapgen-studio-ui:check`, `mapgen-studio-ui:test`, workspace lint, and Habitat import/format/owner gates.
- `bun habitat classify mods/mod-swooper-maps` - routed `mod-swooper-maps:check`, `mod-swooper-maps:test`, workspace lint, and the relevant MapGen recipe/domain/stage Habitat and Grit rules.
- `bun habitat classify tools/habitat/src/providers/grit` - routed workspace lint and Habitat workspace gates; provider check/test targets are unavailable because `habitat-providers` has no Nx targets.
- `bun habitat classify .habitat/civ7/mapgen/pipeline/runtime/_remainder` - routed workspace lint and Habitat workspace gates; authority-project check/test targets are unavailable because `habitat-authority` has no Nx targets.
- `bun habitat classify .habitat/blueprints/recipe-stage` - routed workspace lint and Habitat workspace gates; authority-project check/test targets are unavailable because `habitat-authority` has no Nx targets.

## Harness Stabilization Notes

- The previous `nx run mapgen-studio:test` red was caused by stale test expectations around raw operation-envelope public config keys and browser layer visibility fallout. Tests now assert semantic public config rails and the generated configs/artifacts are regenerated from that shape.
- The Grit provider no longer materializes a symlinked temporary source tree. It runs from the repo root with a temporary `--grit-dir` and cleans up the generated `.grit/grit.yaml`, preserving Grit as the source-pattern authority while removing the pathological symlink/hang failure mode.
- The large legacy Grit rule for ecology fudge terms and legacy generator surfaces was split into smaller Grit rules by semantic token family. This was not a conversion to scripts; the intent stays in Grit and the rules remain positive source-pattern authority for their narrower concerns.
- `require_recipe_stage_authoring_file_shape` now permits the new root-level `*-public-config.ts` standard recipe rails while still rejecting stage-local helper bags and raw operation envelope mirroring.
- `require_recipe_dag_contract_metadata` is a valid guardrail. Public config rails used by the Studio recipe-DAG graph import TypeBox schema syntax directly from `typebox` instead of the broad `@swooper/mapgen-core/authoring` barrel, keeping the graph on contract-safe surfaces.
- `ensure_studio_worker_bundle_is_browser_safe` is also valid, but it checks generated `apps/mapgen-studio/dist` output. Its authoritative proof path is the Nx-owned `mapgen-studio:habitat:check` target, which depends on `mapgen-studio:build`. Direct Habitat remains read-only and only passes after the build materializes the bundle.
- SA-01 is registered as Habitat authority at `.habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-public-contract-closed/`. Its Habitat rule id remains hyphenated per the structural matrix; its runner pattern name is underscore-shaped because Grit pattern names cannot contain hyphens. Hook scope is intentionally omitted and scan roots match the structural matrix: `packages/studio-contract/src` and `packages/studio-server/src/operationRuntime`.

## Live Endpoint Evidence

- Started the actual daemon with `STUDIO_DAEMON_PORT=5199 nx run mapgen-studio:serve-daemon --outputStyle=static`; health and `studio.serverInfo({})` confirmed the public `/rpc` daemon, `runInGameApiVersion: 2`, and command mode `daemon`.
- `runInGame.start` with an empty seed returned declared public error `RUN_IN_GAME_INVALID`, status `400`, safe failure category `request-validation`, and public recovery actions only.
- Unknown diagnostics lookup returned `{ ok: false, reason: "not-found" }`.
- A real admitted `runInGame.start` for `latest-juicy`, seed `1538316415`, map size `MAPSIZE_STANDARD`, player count `6`, resources `balanced`, disposable materialization returned public running status and a diagnostics id.
- Polling `runInGame.status` for `studio-run-in-game-mr9xl41i-sng-3` showed public phases `deploying` and `preparing-civ7`, then terminal `failed` with safe category `artifact-generation`, `terminalAt`, and no private sections in public status.
- `runInGame.diagnostics({ diagnosticsId: "run-diagnostics-54ccfe0e-66b9-4689-883e-d9fdcd000634" })` returned the private record by explicit lookup with matching request id and section key `operation`.
- After daemon restart, server id changed to `studio-server-mr9xvomm-1rsp-1`; the same diagnostics id still resolved from the request diagnostics workspace.

## Review Lanes

Required review lanes were rerun after the harness and public-config authority
changes, then rerun again after the public-status/diagnostics blocker fixes:

- TypeScript refactoring review: found the flat public status schema allowed
  impossible state combinations and stale tests still used the retired internal
  DTO shape. The fix is the status-discriminated public status union, a
  target-vocabulary `cancelled` internal model/projection path, and test helpers
  that construct the public DTO directly.
- Code quality / structure review: found three blocking mismatches: the UI copy
  action still had a public-status serialization fallback, diagnostics were
  stored outside the request workspace, and this ledger overclaimed review
  closure. The copy path now requires explicit diagnostics lookup, diagnostics
  persist under the request workspace, lookup verifies request ownership, and
  this section records the actual proof state.
- oRPC + Effect library correctness review: found that diagnostics lookup needed
  to await the second read inside its declared result recovery. The lookup now
  returns the public `RunDiagnosticsLookupResult` union for read/parse failures.
  Current official oRPC docs still describe contract-first procedure contracts
  and `RPCHandler` as RPCLink-only; the packet keeps the `runInGame.*` contract
  procedures on the existing `/rpc` surface. Current official Effect docs still
  model scoped/finalizer cleanup through `Effect.scoped` / finalizers; the
  runtime keeps scoped acquisition/release and handles diagnostics persistence as
  an expected effect failure rather than an untyped defect.

Residual non-blocking notes carried forward: internal `diagnosticsId` could
become required on Run in Game operations, `markRunInGameDiagnosticsAvailable`
could be renamed to emphasize persisted revision semantics, and the existing
router helper `statefulFailure(...): any` is still an effect-oRPC constructor
typing compromise outside this packet's diff.

## Remaining Train Gates

Packet 1's declared gates are complete. The packet train still remains open
until later packets satisfy the full target-vocabulary live matrix and
post-start Civilization 7 evidence that the launched game uses generated
Studio-run content.
