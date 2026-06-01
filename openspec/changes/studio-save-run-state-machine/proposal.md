# Studio Save/Run State Machine

## Why

The previous Run in Game hardening made Civ launch status visible, but Studio
still had overlapping operation lanes: browser generation, repo config
Save/Deploy, disposable materialization, deploy, and Civ launch could all touch
map artifacts while the UI treated them as mostly independent buttons. A recent
fatal map-generation load error showed the practical failure mode: Civ can try
to load a setup-visible row while the deployed mod does not yet contain the
matching map artifact from the current worktree.

## What Changes

- Save/Deploy, Browser Run, and Run in Game become distinct Studio operations
  with explicit mutual exclusion at the UI and handler level.
- Save/Deploy writes and deploys map config artifacts only; it does not restart
  or start Civ.
- Run in Game owns Civ lifecycle, including explicit process-restart recovery
  when a disposable setup row requires a process boundary.
- Studio deploy uses the dependency-aware Swooper deploy lane while Vite ignores
  workspace build outputs that would otherwise refresh the active tab.
- The footer and recipe panel surface save/deploy status separately from browser
  generation and Run in Game status.

## Non-Goals

- Persist Save/Deploy operation records across Vite server restarts.
- Add a modal operation inspector.
- Add FireTuner or Windows bridge fallbacks.
- Allow automatic replay of mutating Run in Game operations after uncertain
  socket failures.

## Verification Gates

- Focused map-config save/deploy helper tests.
- Existing and expanded Run in Game operation/status/UI tests.
- Mapgen Studio type-check.
- Strict OpenSpec validation.
- Browser proof that Studio still loads after the state-machine change.
