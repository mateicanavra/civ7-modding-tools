# Studio Run In Game UX Recovery Surface

## Scope

This artifact covers the developer-facing Studio surface for `Run in Game`.
It recommends the smallest clear UI/data contract that makes the Civ7 launch
workflow phase-aware, recoverable, and distinguishable from browser preview
generation. It does not propose marketing UI, tutorial text, hidden mutation
replay, or broad Civ setup UI cloning.

## Findings Ordered By Severity

### P0: Run in Game has no durable, phase-aware operation state in the browser

Current `Run in Game` UI state is a single local boolean:
`runInGameRunning` in `apps/mapgen-studio/src/App.tsx` lines 528 and
1215-1249. The footer receives it as `isRunInGameRunning` at lines 1924-1928
and renders only `Launching...` versus `Run in Game` in
`apps/mapgen-studio/src/ui/components/AppFooter.tsx` lines 231-240.

That means the browser cannot explain whether the operation is materializing
config, deploying the mod, forcing setup row visibility, starting Civ, waiting
for proof, or cleaning up. If Vite reloads the Studio tab during source/artifact
writes, the local boolean and transient toast are also lost. The workstream
brief records exactly this failure mode: a browser click from shell triggered
Vite reloads while artifacts changed, leaving status stuck on a prior shell
health error.

Product impact: the user sees one long "Launching..." affordance for a
multi-phase, mutating workflow. After reload or uncertainty, Studio cannot tell
whether the safe action is retry, inspect, wait, or manually recover in Civ.

### P0: Failure details exist server-side only in narrow cases and are discarded by App state

The frontend helper currently normalizes `/api/civ7/run-in-game` to either
`{ ok: true, requestId?, materialization?, start? }` or `{ ok: false, error }`
in `apps/mapgen-studio/src/App.tsx` lines 143-190. It parses the response body
as `{ ok?: boolean; error?: string }` at line 186, so any `details` payload is
not preserved in UI state.

The Vite endpoint can return structured details for `RunInGameHttpError`,
including `code`, `reloadRequired`, `reloadBoundary`, `reloadAttempted`,
`mapScript`, and `materialization` in `apps/mapgen-studio/vite.config.ts`
lines 543-553, then emits `{ ok: false, error, details }` at lines 605-609.
Other failures collapse to a message and status code.

Product impact: users get `Run in Game failed: <message>` in a 3-second toast
from `apps/mapgen-studio/src/App.tsx` lines 1245-1249. They do not get phase,
failure class, completed phases, reload state, direct-control error code,
request id, or copyable diagnostics. This fails the phase acceptance criterion
for structured failures and makes support/debugging dependent on terminal logs.

### P1: Success proof is available from the endpoint but not presented as proof

The endpoint returns success with `requestId`, `materialization`,
`deploy`, `rowProof`, `rowVisibility`, `start`, and `logProof` in
`apps/mapgen-studio/vite.config.ts` lines 582-597. The browser only toasts
`Run in Game requested: <mapScript|requestId|Civ7>` in
`apps/mapgen-studio/src/App.tsx` line 1249.

Separately, the footer has a read-only live Civ7 panel sourced from
`/api/civ7/live/status`: `turn`, `seed`, `readiness`, `autoplayActive`,
`updatedAt`, and `error` are stored in `liveRuntime` in
`apps/mapgen-studio/src/App.tsx` lines 529-537 and updated at lines 588-625.
The footer renders this as `Turn ? · Seed ?`, an error string, or `Live idle`
in `apps/mapgen-studio/src/ui/components/AppFooter.tsx` lines 93-100 and
169-183.

Product impact: successful request, setup row proof, log marker proof, and live
runtime observation are not connected in the UI. A success toast says the
request was sent, not that Civ loaded the intended map, seed, or config hash.

### P1: Browser preview Run and Civ Run in Game share footer space without enough status separation

The footer's primary status dot is driven by browser/dump generation status:
`browserRunning ? "running" : error ? "error" : "ready"` in
`apps/mapgen-studio/src/App.tsx` line 1204. Its label becomes `Running`,
`Error`, `Modified`, or `Ready` in
`apps/mapgen-studio/src/ui/components/AppFooter.tsx` lines 74-89.

`Run`, `Auto-run`, `Reroll`, and `Run in Game` sit in one controls panel in
`AppFooter.tsx` lines 186-254. The Civ live status panel is adjacent but
separate from the operation button. `Run in Game` is disabled while browser
generation or another Civ launch is running at lines 231-240, but the footer
does not explain the reason or preserve the active Civ operation phase.

Product impact: during browser-based use, the footer can imply the app is
"Ready" or "Modified" while a prior Civ launch is uncertain, or it can show a
Civ live error that is not the failure of the current `Run in Game` request.
This risks confusing browser preview `Run` with Civ `Run in Game`.

### P2: Current data types have no UI-owned launch contract

The shared UI types define `GenerationStatus = "ready" | "running" | "error"`
in `apps/mapgen-studio/src/ui/types/index.ts` line 219. `AppFooterProps`
adds `isRunInGameRunning` and a small `liveRuntime` object in
`AppFooter.tsx` lines 7-47, but there is no typed launch operation object,
phase enum, recovery action set, diagnostic payload, terminal state, or
request correlation key.

Product impact: any richer UI would currently need to infer state from
booleans, toasts, and live polling. That is too weak for recovery because the
safe action depends on what mutation has already occurred.

## Proposed UI And Data Contract

### Minimal surface

Add a compact `Run in Game` status popover anchored to the existing
`Run in Game` footer button, plus a one-line footer status summary. Keep the
existing footer structure; do not add a new page, tutorial panel, or landing
view.

Footer summary:

- Idle: `Run in Game`
- Active: `Civ: <phase label>` with a spinner and request id tooltip
- Succeeded: `Civ loaded: <mapScript> · Seed <seed>` when proof exists
- Failed/blocked: `Civ blocked: <failure class>` with a red status dot
- Uncertain after reload/abort: `Civ status unknown: <requestId>`

Popover contents:

- Current phase and terminal state.
- Request id, map script, seed, map size, materialization mode, config hash.
- Completed phases as compact check rows.
- Latest proof: setup row visible, start requested, tuner ready, log markers,
  live seed/turn observation.
- Failure detail: phase, class/code, message, reload attempted/required,
  direct-control code when available.
- Actions: phase-appropriate buttons only.
- `Copy diagnostics` button.

The popover should be dense and developer-facing. It should not explain what
Run in Game is; labels should name actual state.

### Operation state shape

Studio should own a typed operation state separate from browser generation:

```ts
type RunInGamePhase =
  | "idle"
  | "validating-request"
  | "materializing-config"
  | "deploying-mod"
  | "checking-setup-row"
  | "reloading-setup"
  | "starting-game"
  | "waiting-for-proof"
  | "cleaning-up"
  | "succeeded"
  | "failed"
  | "blocked"
  | "unknown";

type RunInGameFailureClass =
  | "request-invalid"
  | "civ-unavailable"
  | "setup-row-missing"
  | "reload-required"
  | "direct-control-timeout"
  | "start-rejected"
  | "proof-timeout"
  | "vite-reload-or-abort"
  | "cleanup-failed"
  | "unexpected";

type RunInGameOperation = {
  requestId: string;
  phase: RunInGamePhase;
  terminal: "none" | "succeeded" | "failed" | "blocked" | "unknown";
  startedAt: string;
  updatedAt: string;
  input: {
    recipeId: string;
    seed: string;
    mapSize: string;
    playerCount?: number;
    resources?: string;
    materializationMode: "durable" | "disposable";
    selectedConfigId?: string;
  };
  materialization?: {
    mode: "durable" | "disposable";
    path?: string;
    mapScript?: string;
    configHash?: string;
    envelopeHash?: string;
  };
  completedPhases: RunInGamePhase[];
  proof?: {
    setupRowVisible?: boolean;
    reloadAttempted?: boolean;
    startRequested?: boolean;
    tunerReady?: boolean;
    logMarkersMatched?: boolean;
    liveSeed?: number;
    liveTurn?: number;
    observedAt?: string;
  };
  failure?: {
    phase: RunInGamePhase;
    class: RunInGameFailureClass;
    code?: string;
    message: string;
    reloadRequired?: boolean;
    reloadBoundary?: string;
    destructiveAction?: "none" | "exit-to-shell" | "restart-game";
    details?: unknown;
  };
};
```

The exact wire format can be smaller, but it must preserve phase, request id,
terminal state, materialization, proof, and failure details. This operation
state should survive Vite reloads via a request-id-addressable status endpoint
or browser storage backed by server operation status. Browser storage alone is
not sufficient for phase truth, but it can preserve the last request id and
diagnostic snapshot for recovery.

## Recovery Action Model

Recovery actions must be explicit and phase-aware:

- `Retry status check`: read-only, valid for `civ-unavailable`,
  `direct-control-timeout`, `proof-timeout`, and `unknown`.
- `Copy diagnostics`: read-only, always available for active or terminal
  operations.
- `Open live status`: read-only, shows the existing live Civ panel details or
  refreshes `/api/civ7/live/status`.
- `Retry Run in Game`: starts a new operation with a new request id. Only show
  after `failed`, `blocked`, or `unknown`; never silently replay it.
- `Exit to shell and continue`: mutating/destructive. Only show when the
  failure says `reloadRequired` and `reloadBoundary` permits an explicit
  `exit-to-shell` action. Label it as leaving the current Civ session.
- `Restart game and begin`: mutating/destructive. Do not include in the minimal
  surface unless the operation contract can prove user approval, request id,
  and recovery boundary. If added later, it needs a confirmation dialog.

Do not auto-run recovery after a Vite reload or fetch abort. The UI may restore
the last known operation and offer `Retry status check`; it must not replay
`runCiv7SinglePlayerFromSetup`, `ensureCiv7SetupMapRowVisible`, or restart
operations without a fresh click.

## Copyable Diagnostics

`Copy diagnostics` should serialize a compact JSON block:

```json
{
  "surface": "mapgen-studio/run-in-game",
  "requestId": "studio-run-in-game-...",
  "phase": "waiting-for-proof",
  "terminal": "failed",
  "failureClass": "proof-timeout",
  "message": "Timed out waiting for scripting log markers",
  "materialization": {
    "mode": "disposable",
    "path": "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
    "mapScript": "swooper-maps-studio-current.lua",
    "configHash": "..."
  },
  "input": {
    "seed": "12345",
    "mapSize": "MAPSIZE_STANDARD",
    "playerCount": 8,
    "resources": "balanced"
  },
  "proof": {
    "setupRowVisible": true,
    "reloadAttempted": true,
    "startRequested": true,
    "tunerReady": false,
    "logMarkersMatched": false,
    "liveSeed": null,
    "observedAt": "..."
  }
}
```

This should avoid dumping full config JSON by default. Include hashes and paths
first; provide a separate developer-only way to inspect full request details if
needed.

## Tests And Proof

Required unit/component coverage:

- `AppFooter` or the new status component renders browser generation status
  and Civ operation status separately.
- Active phases map to stable labels and disabled states.
- Failure states preserve `details` and expose phase-appropriate recovery
  actions.
- `Copy diagnostics` omits full config by default and includes request id,
  phase, failure class, materialization, proof, and input summary.
- Browser preview `Run` and Civ `Run in Game` cannot share the same status enum
  or terminal error display.

Required integration/browser proof:

- Start from shell/main menu and show `checking-setup-row` or equivalent setup
  phase, not a generic live-health error.
- Disposable run that requires setup row reload records reload attempted,
  survives any Studio reload, and returns to a resumable/terminal state.
- Running-game launch explicitly labels any `exit-to-shell` disruption before
  it occurs.
- Successful run shows request id plus proof from setup row/start/log/live
  observation when available.
- Simulated Vite reload or aborted fetch restores `unknown` or latest server
  phase by request id and does not replay mutations.

Proof boundaries:

- Component tests prove UI mapping only.
- Browser tests prove local state preservation and action availability.
- Vite/API tests prove structured operation state and details.
- Live Civ proof is required before claiming that the launched game loaded the
  intended map/seed/config.

## Risks And Non-Goals

- Do not let the footer's main `Ready/Running/Error` status represent Civ
  launch state; that status currently belongs to browser/dump generation.
- Do not use a success toast as success proof. It is only request feedback.
- Do not hide destructive recovery behind "continue", "fix", or automatic
  retry. Leaving a Civ session, restarting, or replaying setup/start requires
  explicit user action and copy that names the disruption.
- Do not conflate live Civ status errors with the current operation's failure.
  Live status can support proof, but it is not the operation record.
- Do not show tutorial prose in-app. The UI should expose state, proof, and
  actions; project docs can explain workflow details.
- Do not add broad Civ setup controls. The smallest useful surface is a
  request-correlated status popover plus copyable diagnostics and constrained
  recovery actions.
