# Packet 01 Evidence - Public Status / Private Diagnostics

Packet: `studio-run-public-status-diagnostics`

Status: implemented locally, verification harness stabilized, latest reviewer lanes pending, live gates not yet run.

## What Moved

- `runInGame.start`, `runInGame.status`, operation events, current operations, and UI consumers now use a closed public Run in Game status shape:
  `requestId`, `status`, `phase`, optional `safeFailureCategory`, optional `diagnosticsId`, `recoveryActions`, and timestamps.
- Run in Game oRPC defined errors now project safe public error data instead of the shared private failure diagnostics shape.
- Private runtime evidence is persisted per Run in Game operation and exposed only by explicit `runInGame.diagnostics({ diagnosticsId })` lookup.
- Public `diagnosticsId` is now snapshot-gated: the runtime records an internal operation revision and only projects the id when private diagnostics were persisted for that exact revision. Later unpersisted snapshots hide the id even when they share the same timestamp.
- Diagnostics persistence failure is handled as controlled runtime behavior: the server logs the failed private write, publishes the safe public operation without `diagnosticsId`, and does not turn the write failure into an undeclared oRPC defect.
- UI status surfaces now render safe failure category and diagnostics id instead of raw errors, setup/deploy internals, source snapshots, materialization details, command output, or exact authorship proof.
- Runtime tests that previously depended on public private-data leakage now observe private workflow state through ports or explicit diagnostics lookup.
- `.mapgen-studio/` private runtime diagnostics are ignored as local scratch evidence; test-generated private diagnostics were removed from the worktree.

## Verification Run

- `nx run mapgen-studio:test` - pass, 67 files, 379 tests. This was the previously red classify-reported app test gate.
- `nx run-many -t check --projects=studio-contract,control-studio-server,mapgen-studio-ui,mapgen-studio` - pass.
- `nx run-many -t test --projects=control-studio-server,mapgen-studio-ui` - pass: `control-studio-server` 85 tests, `mapgen-studio-ui` 168 tests.
- `nx run control-studio-server:test -- operationRuntime.test.ts errorSpine.test.ts contractTypeboxSpine.test.ts handler.test.ts` - pass, 65 tests.
- `nx run mapgen-studio:test -- runInGame/status.test.ts studioEvents/operationAdoption.test.ts` - pass, 22 tests.
- `bun run openspec -- validate studio-run-public-status-diagnostics --strict` - pass.
- `nx run mapgen-studio:habitat:check` - pass, 7 Studio-owned Habitat rules. This is the graph-owned proof boundary for generated `apps/mapgen-studio/dist` bundle checks because it depends on `mapgen-studio:build`.
- `bun tools/habitat/bin/dev.ts check --owner mapgen-studio --json` - pass after the graph-owned build produced `apps/mapgen-studio/dist`; direct Habitat owner checks are read-only and do not build generated app assets.
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
- `require_recipe_dag_contract_metadata` is a valid guardrail. Public config rails used by the Studio recipe-DAG graph import TypeBox schema syntax from `@swooper/mapgen-core/authoring/contracts` instead of the broad `@swooper/mapgen-core/authoring` barrel, keeping the graph on contract-safe surfaces.
- `ensure_studio_worker_bundle_is_browser_safe` is also valid, but it checks generated `apps/mapgen-studio/dist` output. Its authoritative proof path is the Nx-owned `mapgen-studio:habitat:check` target, which depends on `mapgen-studio:build`. Direct Habitat remains read-only and only passes after the build materializes the bundle.

## Review Lanes

Required review lanes were rerun after the harness and public-config authority
changes:

- TypeScript refactoring review: no blocking findings. Follow-up cleanup removed
  a needless non-null assertion in diagnostics persistence, deleted a no-op
  running-phase branch, and replaced stale compatibility wording on the public
  status export alias.
- Code quality / structure review: no blocking findings. The public/private
  split keeps one public status DTO, one private diagnostics lookup path, and no
  fallback/dual public error shape. The Grit provider fix preserves Grit as the
  pattern authority instead of moving rules into scripts.
- oRPC + Effect library correctness review: no blocking findings. Current
  official oRPC docs still describe contract-first procedure contracts and
  `RPCHandler` as RPCLink-only; the packet keeps the `runInGame.*` contract
  procedures on the existing `/rpc` surface. Current official Effect docs still
  model scoped/finalizer cleanup through `Effect.scoped` / finalizers; the
  runtime keeps scoped acquisition/release and handles diagnostics persistence as
  an expected effect failure rather than an untyped defect.

Residual non-blocking notes carried forward: internal `diagnosticsId` could
become required on Run in Game operations, `markRunInGameDiagnosticsAvailable`
could be renamed to emphasize persisted revision semantics, and the existing
router helper `statefulFailure(...): any` is still an effect-oRPC constructor
typing compromise outside this packet's diff.

## Open Gates

The packet is not closed-passed until these gates run:

- Studio live endpoint calls against a running Studio server for the Packet 1 public/private response contract.
- Packet-specific live endpoint diagnostics lookup using a real `diagnosticsId`.
- Ultimate packet-train live gate: full target-vocabulary variant matrix and post-start Civilization 7 evidence that the launched game uses generated Studio-run content.
