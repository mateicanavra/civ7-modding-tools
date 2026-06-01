# Design

## Frame

Studio has three user-facing operation roles:

1. **Browser Run**: generate the current authored map in the browser for
   preview and debugging. It is local to Studio and does not deploy or mutate
   Civ.
2. **Save/Deploy**: persist a repo-backed map config and deploy the Swooper mod
   output to Civ's Mods folder. It prepares files; it does not control Civ.
3. **Run in Game**: materialize the current authored config, deploy the mod,
   drive Civ setup/start through direct control, and prove the loaded runtime.

The roles share a serial server queue for file/deploy operations that cannot
overlap safely. The browser UI also disables conflicting controls so the user
does not start a second operation while the first operation owns the filesystem
or Civ setup state.

## Fatal Error Boundary

The observed Civ log failure was:

```text
Failed to open file - fs://game/swooper-maps/maps/studio-current.js
Failed to load file into script system - fs://game/swooper-maps/maps/studio-current.js
```

This is a deploy/load boundary failure, not a map-generation algorithm proof by
itself. The durable fix is to keep deploys dependency-aware and stop Studio from
letting Save/Deploy and Run in Game race each other.

## Save/Deploy

Save/Deploy writes the selected repo config, runs the Studio deploy command, and
reports a local operation status: `saving`, `deploying`, `complete`, or
`failed`. Requests that ask the save endpoint to restart Civ are rejected; Run in
Game is the lifecycle surface.

## Run in Game Recovery

If Run in Game blocks because Civ setup cannot see a disposable row after an
exit-to-shell refresh, Studio records `reloadBoundary:
process-restart-required`. The primary action becomes `Restart Civ & Run`, which
reissues a fresh Run in Game request with explicit process-restart recovery.

## Vite/Turbo

The Swooper Studio deploy lane uses Turbo to rebuild dependent workspace
packages before building and deploying the mod. Vite ignores `packages/*/dist`
and `packages/*/types` writes so dependency freshness does not reload the active
Studio tab mid-operation.
