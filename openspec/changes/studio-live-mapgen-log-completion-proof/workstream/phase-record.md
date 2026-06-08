# Phase Record: Studio Live Mapgen Log Completion Proof

## Status

Repaired locally through `codex/swooper-sdk-mapgen-completion-marker-drain` and
the follow-on direct-control log-rewrite reader slice; a committed Studio/Civ
rerun is still pending.

## Evidence

- The recovered record said `@mateicanavra/civ7-sdk` emitted
  `[mapgen-complete]`, but current runtime request
  `studio-run-in-game-mq3nyiss-8oj` disproved that: Scripting.log contained
  `[mapgen-proof]`, all `50/50` recipe step `ok` lines, and
  `Destroying Context -  MapGeneration`, but no `[mapgen-complete]`.
- The current slice emits `[mapgen-complete]` from the SDK `createMap` wrapper
  only after `recipe.run` returns successfully, with the same
  request/config/envelope/seed/dimensions payload as `[mapgen-proof]`.
- Post-SDK-marker request `studio-run-in-game-mq3omoo3-8oj` proved the marker
  is emitted in the deployed Civ map script: Scripting.log records
  `[mapgen-proof]`, all `50/50` recipe steps, bounded
  `WATER_DRIFT_POLICY_V1`, `NATURAL_WONDER_PLACEMENT_V1`,
  `RESOURCE_PLACEMENT_V1`, and `[mapgen-complete]` for the same request,
  config hash, envelope hash, seed, and dimensions. Studio still returned
  `log-timeout` because the status waiter used pre-restart byte offset
  `31578` against a Civ-rewritten `Scripting.log`, slicing past the proof
  markers in the fresh file.
- `@civ7/direct-control` already owns `snapshotFile` and
  `waitForFreshLogMarkers`.
- The follow-on direct-control repair stores a small log prefix in
  `snapshotFile` and starts from byte `0` when the current log no longer begins
  with the pre-run prefix. Studio's fresh-log reader now uses the same helper
  as `waitForFreshLogMarkers`, so marker waiting and exact proof parsing agree
  on rewritten-log boundaries.
- The verifier previously launched and collected setup/map reads without
  proving fresh mapgen completion after the launch request.
- Focused local proof: `bun run --cwd packages/sdk test -- mapgen-create-map`
  and `bun run --cwd packages/sdk check`.
- Focused local proof for the rewritten-log repair:
  `bun run --cwd packages/civ7-direct-control test`,
  `bun run --cwd packages/civ7-direct-control check`,
  `bun run --cwd packages/civ7-direct-control build`,
  `bun run --cwd apps/mapgen-studio test -- runInGame`, and
  `bun run --cwd apps/mapgen-studio check`.
- Studio production build note: the worker-bundle guard now matches actual
  virtual `/base-standard/...` import forms instead of official
  `Base/modules/base-standard/...` source-path metadata embedded from
  `@civ7/map-policy`; this keeps the guard aligned to runtime import leakage
  without rejecting source-evidence strings.
