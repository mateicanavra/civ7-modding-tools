# Phase Record: Studio Live Mapgen Log Completion Proof

## Status

Repaired on `codex/swooper-sdk-mapgen-completion-marker-drain`; current
Studio/Civ rerun is still pending.

## Evidence

- The recovered record said `@mateicanavra/civ7-sdk` emitted
  `[mapgen-complete]`, but current runtime request
  `studio-run-in-game-mq3nyiss-8oj` disproved that: Scripting.log contained
  `[mapgen-proof]`, all `50/50` recipe step `ok` lines, and
  `Destroying Context -  MapGeneration`, but no `[mapgen-complete]`.
- The current slice emits `[mapgen-complete]` from the SDK `createMap` wrapper
  only after `recipe.run` returns successfully, with the same
  request/config/envelope/seed/dimensions payload as `[mapgen-proof]`.
- `@civ7/direct-control` already owns `snapshotFile` and
  `waitForFreshLogMarkers`.
- The verifier previously launched and collected setup/map reads without
  proving fresh mapgen completion after the launch request.
- Focused local proof: `bun run --cwd packages/sdk test -- mapgen-create-map`
  and `bun run --cwd packages/sdk check`.
