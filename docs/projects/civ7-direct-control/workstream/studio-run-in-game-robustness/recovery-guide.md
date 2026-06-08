# Recovery Guide

## Recovery Model

Run in Game recovery is request-id and phase based. The Studio tab is no longer
the source of truth; it is a viewer for the server-side operation record while
the dev server remains alive.

## User-Visible States

- `materializing`, `deploying`, `checking-civ7`, `reload-needed`,
  `preparing-setup`, `starting-game`, and `waiting-for-proof`: operation is
  active. The UI polls status and disables duplicate Run in Game clicks.
- `complete`: the request finished with setup row proof, start proof, Tuner
  readiness, and fresh Swooper log markers.
- `blocked`: the operation reached a known non-transient boundary, such as a
  setup map row that Civ cannot see.
- `failed`: the operation failed before an ambiguous start/proof mutation.
  Fresh Civ map-script load failures and authored map-generation script
  exceptions are failed operations with Civ notification dismissal recovery, not
  process restart recovery.
- `uncertain`: socket or timeout uncertainty happened after a mutating
  start/proof phase, so Studio does not replay the mutation automatically.

## Actions

- `Refresh Run in Game status`: read-only. Safe during running, failed,
  blocked, and uncertain states.
- `Copy diagnostics`: read-only. Captures request id, phase, completed phases,
  materialization mode/path/map script, reload details, direct-control code,
  and cause details where available.
- `Retry Run`: starts a new request id after a failed, blocked, or uncertain
  operation. It is not an automatic replay of a timed-out mutation.
- `Dismiss Civ notification and retry`: close the fatal Civ notification left
  by an unloadable/generated map script or generation exception, fix or
  regenerate the map script as needed, then run again. This does not require a
  Civ process restart.
- Browser reload: safe for same dev-server lifetime. Studio reloads the last
  request id from local storage and asks the server status endpoint for the
  authoritative operation state.

## Boundaries

- If the Vite dev server restarts, old in-memory operation state is gone.
  Studio can still run live status and copy the last client-side diagnostic
  snapshot if one exists, but it cannot truthfully reconstruct the old operation
  record.
- The current minimal UI does not provide a dedicated "reload Civ7 UI" or "exit
  to main menu and continue" recovery button. Run in Game itself may perform
  exit-to-shell when that action is implied by the submitted request and
  recorded in phase state.
- `Restart Civ & Run` owns the macOS process boundary before it launches
  through Steam. The restart primitive must observe Civ's process exiting for
  consecutive polls, escalate from AppleScript quit to `pkill` only when needed,
  and fail the operation instead of calling Steam while the old process is still
  alive. This boundary is for Civ setup catalog visibility, not for fatal
  map-script load/generation notifications.
- Ambiguous start/proof failures are intentionally not replayed. The user must
  inspect status/diagnostics and start a new operation explicitly.
