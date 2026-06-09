## Why

Studio Run in Game reached direct-control parity for durable and disposable
Swooper rows, but the browser click path still exposed reliability gaps:
main-menu App UI health failed when gameplay globals were undefined, Vite
artifact regeneration could refresh the active Studio tab mid-flight, and
operation status was not durable enough to survive a page reload or aborted
fetch.

## Target Authority Refs

- User goal for a reliable, recoverable, phase-aware Studio Run in Game flow.
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game/phase-record.md`
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game/live-proof-ledger.md`
- Existing OpenSpec changes:
  - `direct-control-new-game-setup`
  - `studio-run-current-map-config`
  - `studio-live-civ7-map-sync`
  - `studio-disposable-setup-reload`
  - `workspace-build-pipeline`
- Current `@civ7/direct-control` App UI/Tuner state-role contracts.
- Current Mapgen Studio Vite middleware and browser Run in Game UI.

## What Changes

- Replace gameplay-dependent App UI health with shell-safe runtime
  classification so main menu/shell is a valid setup-control state.
- Add a Run in Game phase model and request-id operation status store that can
  be resumed after tab reload, fetch abort, or status polling gaps.
- Prevent Run in Game from refreshing the Studio tab before terminal operation
  status is recorded.
- Surface structured failure and recovery details in Studio instead of reducing
  direct-control failures to a single toast or footer string.
- Tighten direct-control readiness gates for shell, loading, begin-ready,
  running-game, Tuner-listed-but-not-ready, and stale listener cases.
- Reconcile prior OpenSpec task state so closure claims match proof.

## Requires

- `direct-control-new-game-setup`
- `studio-run-current-map-config`
- `studio-live-civ7-map-sync`
- `studio-disposable-setup-reload`
- `workspace-build-pipeline`

## Enables Parallel Work

- Studio can later build richer Civ runtime overlays and turn-synced workflows
  on a stable launch/status substrate.
- Direct-control live proof can distinguish connection, setup, start, load,
  proof, and recovery failures without re-running mutating commands.

## Affected Owners

- `packages/civ7-direct-control`
- `apps/mapgen-studio`
- `scripts/civ7-direct-control/verify-studio-run-in-game-live.ts`
- `package.json` / `turbo.json` only if verification scripts or task graph need
  updates
- OpenSpec/workstream artifacts for Civ7 direct control

## Forbidden Owners

- FireTuner/Windows bridge fallbacks.
- Raw setup JavaScript in Studio endpoints.
- Silent replay of mutating commands after timeout/socket uncertainty.
- Hand edits to generated `dist/`, `mod/`, deployed Mods, official resources,
  or Civ7 logs.

## Stop Conditions

- Direct-control cannot classify shell/main-menu without gameplay globals.
- The active Studio tab still reloads before operation status is durable.
- A mutating setup/start operation is replayed automatically after an uncertain
  timeout.
- Live proof contradicts the direct-control-only architecture boundary.

## Consumer Impact

Run in Game becomes a phase-aware launch workflow instead of a single blocking
POST. Developers can see whether Studio is materializing, deploying, checking
Civ7, preparing setup, starting, waiting for proof, complete, blocked, failed,
or uncertain, with explicit recovery choices where mutation would be
disruptive.

## Verification Gates

- Direct-control fake-socket tests for shell with `Game` undefined, loading,
  begin-ready, running-game without explicit exit-to-shell recovery, row-refresh failure,
  connection loss during refresh/start/log proof, Tuner-listed-but-not-ready,
  and no mutation replay.
- Studio middleware/UI tests for malformed/raw payload rejection, durable and
  disposable requests, row-missing `409`, deploy/start/log-proof failure
  cleanup, request status resume, and no browser Run coupling.
- Vite/dev proof that Run in Game does not trigger tab reload/lost status from
  artifact regeneration.
- `bun run verify:studio-run-in-game`, strict OpenSpec validation, focused
  package checks/tests, and live proof matrix when Civ is available.
