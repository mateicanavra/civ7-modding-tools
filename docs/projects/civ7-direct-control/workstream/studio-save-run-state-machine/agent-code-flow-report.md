# Code Flow Peer Report

Frame: review the Studio save/run state-machine slice as the code-flow peer.
Focus: save endpoint behavior, Run in Game lifecycle ownership, shared deploy
command, queueing, and handler-level conflict guards.

## Findings

### Save endpoint behavior

- `/api/map-configs` now rejects lifecycle requests instead of restarting Civ:
  `apps/mapgen-studio/vite.config.ts:695-750` parses `restart` and
  `verifyRestart`, then throws `"Map config save/deploy does not restart Civ;
  use Run in Game for Civ lifecycle control."` at
  `apps/mapgen-studio/vite.config.ts:707-708`.
- The browser save helper sends only `id`, `sourcePath`, and `envelope`:
  `apps/mapgen-studio/src/App.tsx:114-160`. It no longer sends `restart` or
  `verifyRestart`.
- Save still writes the repo config and deploys immediately:
  `apps/mapgen-studio/vite.config.ts:725-741`. On deploy failure it restores the
  prior config file before returning `saved: false`:
  `apps/mapgen-studio/vite.config.ts:725-739`.

### Run in Game lifecycle ownership

- Civ process restart is exclusively modeled under Run in Game recovery.
  `parseRunInGameSetupRequest` accepts `recovery.restartCivProcess` at
  `apps/mapgen-studio/src/server/runInGame/requestValidation.ts:19-67`.
- Run in Game owns the lifecycle chain: materialize config, deploy, optional
  process restart, setup row proof, setup/start, and log proof:
  `apps/mapgen-studio/vite.config.ts:550-681`.
- Process restart is a Run in Game phase and UI action, not a save action:
  phases include `restarting-civ` in
  `apps/mapgen-studio/src/features/runInGame/status.ts:1-15`, and the primary
  action becomes `"Restart Civ & Run"` when `reloadBoundary` is
  `process-restart-required` at
  `apps/mapgen-studio/src/features/runInGame/status.ts:135-149`.

### Shared deploy command

- Save/Deploy and Run in Game both call `buildSwooperMapsStudioDeployCommand`.
  Save uses `deploySwooperMaps` at `apps/mapgen-studio/vite.config.ts:154-170`.
  Run in Game uses `deploySwooperMapsForRun` with a request marker at
  `apps/mapgen-studio/vite.config.ts:173-189`.
- The command builder centralizes the command and only injects
  `SWOOPER_STUDIO_RUN_ID` for proof-correlated launches:
  `apps/mapgen-studio/src/server/mapConfigs/deploy.ts:7-20`.
- The mod package exposes `deploy:studio`, currently equivalent to `deploy`:
  `mods/mod-swooper-maps/package.json:46-47`.

### Queueing

- Save/Deploy and Run in Game share one server queue:
  `studioOperationQueue` is declared at `apps/mapgen-studio/vite.config.ts:49`.
- Run in Game appends its async operation and returns the request immediately:
  `apps/mapgen-studio/vite.config.ts:682-687`.
- Save/Deploy appends to the same queue and waits for completion before
  responding: `apps/mapgen-studio/vite.config.ts:743-748`.
- Client UI blocks conflicting browser run, save, and Run in Game actions while
  local operation state is running:
  `apps/mapgen-studio/src/App.tsx:974-1004`,
  `apps/mapgen-studio/src/App.tsx:1419-1491`,
  `apps/mapgen-studio/src/ui/components/AppFooter.tsx:342-350`, and
  `apps/mapgen-studio/src/ui/components/RecipePanel.tsx:168-175`.

### Handler-level conflict guards

- Run in Game rejects duplicate active Run in Game clicks by returning the
  active operation instead of queueing another mutation:
  `apps/mapgen-studio/vite.config.ts:526-537`.
- There is no equivalent server-side active Save/Deploy store, and `/api/map-configs`
  does not check `runInGameOperations.findActive()` before queueing. The shared
  queue prevents simultaneous file writes, but it does not reject or classify
  cross-kind conflicts at the handler boundary.

## Risks

### P1: Disposable Run in Game rows can still be invalidated by later deploys

Run in Game materializes `studio-current`, deploys it, and then cleans up source
state in `finally`:
`apps/mapgen-studio/vite.config.ts:561-579` and
`apps/mapgen-studio/vite.config.ts:672-679`. A later Save/Deploy runs
`deploy:studio` from current repo source at
`apps/mapgen-studio/vite.config.ts:725-741`; because disposable source was
restored or removed, that deploy can remove the deployed `studio-current` map
row/file that a prior Civ setup or runtime still references. This is a plausible
code-path explanation for fatal `studio-current.js` load failures after save,
run, or separate worktree deploys.

Recommended design: record a server-owned deployed-artifact lease/manifest for
the last Run in Game request, including materialization mode, map script,
config hash, envelope hash, deploy command, and whether the deployed mod still
contains that row. Save/Deploy should either preserve an active disposable row,
explicitly invalidate the prior Run in Game status, or block with a structured
conflict until the user chooses the intended operation.

### P1: The shared queue serializes work but does not express operation intent

`studioOperationQueue` protects file/deploy mutation ordering, but the HTTP
contract still lets direct API callers enqueue Save during Run in Game or Run in
Game behind Save. The UI blocks common overlaps, but handler-level semantics are
not yet symmetric: Run in Game has `findActive()`, Save/Deploy does not, and
there is no common operation registry for cross-kind conflicts.

Recommended design: introduce one Studio operation coordinator with typed
operations (`save-deploy`, `run-in-game`, and possibly `browser-run` client
ownership), queue position, active owner, conflict policy, and status snapshots.
Handlers should return `409` for conflicting operations or `202` with a queued
operation only when queuing is an explicit product behavior.

### P1: Run materialization mode is derived from browser preview dirtiness

`runInGameMaterializationMode` uses `isDirty`, and `isDirty` compares current
Studio state to `lastRunSnapshot`, which is the browser-generation snapshot:
`apps/mapgen-studio/src/App.tsx:1309-1322`. That means Run in Game durable vs
disposable selection is coupled to browser preview history, not to whether the
config has been saved/deployed as the current repo-backed config. This can make
Save and Run behave inconsistently: a saved config that has not been browser-run
can still be treated as disposable, while a browser-run config may be treated as
durable for reasons unrelated to repo persistence.

Recommended design: separate authored, previewed, saved, deployed, and
run-in-game snapshots. Run in Game materialization should be based on
save/deploy provenance and current authored fingerprint, not browser preview
dirtiness.

### P2: Save/Deploy status is client-only and non-resumable

Run in Game status is server-owned via
`createRunInGameOperationStore` in
`apps/mapgen-studio/src/server/runInGame/operationState.ts:33-151`, while
Save/Deploy status is only browser state from
`apps/mapgen-studio/src/features/mapConfigSave/status.ts:1-98` and
`apps/mapgen-studio/src/App.tsx:962-1004`. A tab refresh during Save/Deploy
loses operation state even though the server queue may still be running.

Recommended design: put Save/Deploy in the same server operation coordinator so
status survives tab reloads and handler-level conflict guards have one source
of truth.

### P2: `deploy:studio` is currently an alias, not a distinct deploy policy

`mods/mod-swooper-maps/package.json:46-47` defines both `deploy` and
`deploy:studio` with the same command. Centralizing through
`buildSwooperMapsStudioDeployCommand` is good, but this does not yet encode a
Studio-specific deploy policy such as preserving active disposable map rows or
recording a deployed manifest.

Recommended design: keep the shared command builder, but make the command or
the pre/post wrapper responsible for Studio deploy semantics: row preservation,
manifest capture, and stale-row invalidation.

## Verdict

The slice correctly removes save-triggered Civ restarts, moves lifecycle
recovery into Run in Game, centralizes deploy command construction, and adds a
shared mutation queue. It is a meaningful improvement over the previous
overlap.

It is not yet a complete state-machine fix. The remaining structural problem is
that deploy state is still treated as an incidental side effect of Save or Run,
not as a first-class state owned by Studio. The likely next iteration should
replace the queue-plus-local-status pattern with a single server operation
coordinator and deployed-artifact manifest. That coordinator should distinguish
authored config, browser preview, saved repo config, deployed mod contents, and
Civ runtime proof, then make Save and Run in Game operate on that same backbone
with explicit conflict and invalidation semantics.
