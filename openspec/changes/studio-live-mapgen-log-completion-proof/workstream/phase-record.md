# Phase Record: Studio Live Mapgen Log Completion Proof

## Status

Proven through `codex/swooper-studio-log-rewrite-reader-drain`.
The committed Studio/Civ rerun completed exact authorship and fresh
mapgen-completion proof after the SDK completion-marker and direct-control
log-rewrite reader repairs.

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
- Current committed rerun `studio-run-in-game-mq3pfgbe-1doj` ran from
  `codex/swooper-studio-log-rewrite-reader-drain` at
  `5537f2a829f8dd1452fec81d002c4afc1f0826a6`. It completed
  `materializing`, `deploying`, `restarting-civ`, `checking-civ7`,
  `preparing-setup`, `starting-game`, and `waiting-for-proof` with
  `status:"complete"` and `exactAuthorshipProof.status:"complete"`.
  The request body was
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-restart-request.json`
  (`sha256:0e23b919efba651b49d36bd967218414ace31620dee1c375a13a2c245decf914`);
  the post response was
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-post.json`
  (`sha256:e2640bf851b30bfe54f95a96a24867c65068c0cb30d8dbdf89528a2f4e9e1f8d`);
  the terminal status was
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-status.json`
  (`sha256:381e25d77639fcf3fe1660524ba7ead72cabb7c60f7dadb53062ca684bbd9ed6`).
  The exact log proof matched `[mapgen-proof]` and `[mapgen-complete]` for
  request `studio-run-in-game-mq3pfgbe-1doj`, config hash
  `ceae9601ee0b856483d0874ee3dfdff4a189eb226d01f8ab9dc8b7484475765f`,
  envelope hash
  `f8d81ad1446301c516b4c894ef0142ed4fa5c8c666dd37c49022d2830d4b375f`,
  seed `138503614`, and dimensions `106x66`.
- Runtime telemetry in that exact log proof records
  `RESOURCE_PLACEMENT_V1` with `plannedCount:251`, `placedCount:250`,
  `rejectedCount:1`, `mismatchCount:0`, placed coordinate hash `9c5eaad8`,
  rejected coordinate hash `af57eb7b`, and reason
  `cannot-have-resource:1`. It records `NATURAL_WONDER_PLACEMENT_V1` with
  `plannedCount:7`, `placedCount:4`, `rejectedCount:3`, placed coordinate
  hash `b623433b`, and rejected coordinate hash `d6bab8b6`.
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
