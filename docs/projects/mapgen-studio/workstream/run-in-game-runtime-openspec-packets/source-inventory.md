# Source Inventory: Run In Game Runtime Restructuring

Status: working evidence inventory

This file records current implementation evidence for packet decomposition. It
does not define target authority. The target model is the proposal plus the
advisor-wave synthesis.

## Authority Inputs

- Direct user direction: produce executable OpenSpec workstream packets from a
  clean `main`-based planning worktree.
- Root `AGENTS.md`: use repo conventions, update docs/tests with behavior or
  public contract changes, avoid generated-output hand edits.
- `civ7-open-spec-workstream`: OpenSpec artifacts live under
  `openspec/changes/<change-id>/`; no shortcut language.
- `civ7-architecture-authority`: current code is evidence, generated output is
  read-only, current containers are not architecture.
- `civ7-product-authority`: public contracts need explicit gates; generated
  outputs and runtime checks prove only bounded observations.
- Proposal:
  `docs/projects/mapgen-studio/resources/run-in-game-deploy-manifest-proposal.md`.

## Existing Related OpenSpec Changes

- `studio-run-in-game-robustness`: established phase-aware Run in Game operation
  status, direct-control readiness, recovery actions, and dev-server
  robustness.
- `studio-transient-config-isolation`: classified `studio-current.config.json`
  as transient and rejected shipping/preserving stale live-run contents.
- `studio-operation-lifecycle-failure-classification`: relevant to operation
  status/failure taxonomy.
- `mapgen-studio-error-spine`: relevant to public-safe failure projection and
  developer diagnostics boundaries.

## Current Runtime Contract Evidence

Observed files:

- `packages/studio-contract/src/runInGame.ts`
- `packages/studio-server/src/operationRuntime/model.ts`
- `packages/studio-server/src/operationRuntime/registry.ts`
- `packages/studio-server/src/operationRuntime/projection.ts`
- `packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts`
- `packages/studio-server/src/workflows/RunInGameWorkflow.ts`

Current shape:

- public phases include `materializing`, `deploying`, `restarting-civ`,
  `checking-civ7`, `preparing-setup`, `starting-game`, `waiting-for-proof`,
  `complete`, `blocked`, `failed`, and `uncertain`;
- internal operation state stores `fingerprint`, request projection,
  `materialization`, `processRestart`, and `exactAuthorshipProof`;
- `sourceSnapshotProof` and `exactAuthorshipProof` are current wire names;
- status projection includes `details` built from runtime failure diagnostics;
- tombstones store request id, kind, last updated time, and for Run in Game the
  fingerprint;
- observed operation-runtime evidence rejects a fresh same-fingerprint Run in
  Game start when a matching tombstone exists.

Target pressure:

- split operation identity, source digests, correlation, deployment snapshot,
  attribution report, public status, and developer diagnostics;
- treat expired old request ids as lookup facts, not fresh-admission blockers;
- replace generic proof/materialization vocabulary with narrower operational
  names in the new packets.

## Current Generation And Deployment Evidence

Observed files:

- `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts`
- `mods/mod-swooper-maps/project.json`
- `apps/mapgen-studio/src/server/mapConfigs/deploy.ts`
- `packages/studio-server/src/ports/DeployRunner.ts`
- `packages/studio-server/src/ports/workflowTypes.ts`

Current shape:

- `generate-map-artifacts.ts` scans `src/maps/configs` for
  `*.config.json`;
- `studio-current.config.json` is skipped unless
  `SWOOPER_INCLUDE_STUDIO_CURRENT=1`;
- generated map entries embed `SWOOPER_STUDIO_RUN_ID` when present;
- Nx target `mod-swooper-maps:build:studio-deploy` depends on `gen:maps`;
- Run in Game deployment passes `SWOOPER_STUDIO_RUN_ID` and
  `SWOOPER_INCLUDE_STUDIO_CURRENT=1`;
- the deploy port returns `RunInGameDeployment` with `materialization` and
  optional opaque `deploy`.

Target pressure:

- catalog generation must read an explicit `CatalogSourceIndex`, not directory
  scan authority;
- request-scoped Run in Game generation must read exactly one
  `StudioRunGenerationManifest`;
- request state must not be selected through environment-variable backchannels;
- deployment must copy from `StudioRunGeneratedMod` and record a
  `DeployedModSnapshot`.

## Current UI And Public Status Evidence

Observed files:

- `apps/mapgen-studio/src/features/runInGame/api.ts`
- `apps/mapgen-studio/src/features/runInGame/clientState.ts`
- `apps/mapgen-studio/src/features/runInGame/status.ts`
- `apps/mapgen-studio/src/app/hooks/useRunInGame.ts`
- `apps/mapgen-studio/src/app/hooks/useRunInGameTerminalToast.ts`
- `apps/mapgen-studio/src/features/studioErrors/definedErrorProjection.ts`

Current shape:

- UI builds `sourceSnapshot` from recipe/world/pipeline/setup and selected
  config;
- UI stores a session-local fingerprint and last Run in Game source snapshot;
- failure toast can display `result.error`;
- copy diagnostics serializes the full operation object;
- public operation status can carry materialization and details with diagnostic
  fields.

Target pressure:

- public status should be compact and safe by construction;
- developer diagnostics should be accessed through a diagnostics id or local
  record;
- UI should not need to parse raw command output, absolute paths, or full launch
  envelopes from public status payloads.

## Current Test Evidence

Relevant tests:

- `packages/studio-server/test/operationRuntime.test.ts`
- `apps/mapgen-studio/test/runInGame/*.test.ts`
- `apps/mapgen-studio/test/mapConfigSave/deployCommand.test.ts`
- `apps/mapgen-studio/test/devServer/daemonDeployIsolation.test.ts`
- `mods/mod-swooper-maps/test/config/*.test.ts`
- `mods/mod-swooper-maps/test/build/map-bundle-runtime-imports.test.ts`
- `mods/mod-swooper-maps/test/diagnostics/verify-studio-run-in-game-live.test.ts`

Current useful oracles:

- request admission and status projection behavior;
- source snapshot preservation;
- deploy command env wiring;
- shipped map config identity;
- schema-valid generated map artifacts;
- Run in Game client fingerprint/relation logic;
- live verification script structure.

Target pressure:

- add falsification tests for manifest-only request generation;
- add public-payload leak tests;
- add deployment-snapshot tests;
- add expired lookup versus fresh same-input admission tests;
- add structural assertions that block directory-scan and env-selector
  reintroduction in request-scoped mode.

## Candidate Initial Packet Boundaries

These are local preliminary candidates to compare against advisor findings:

1. Contract vocabulary and operation identity surface.
2. Catalog source index.
3. Studio run workspace and generation manifest.
4. Request-scoped generator target.
5. Deployment snapshot and deploy-from-generated-mod boundary.
6. Operation lifecycle/lease/tombstone cleanup.
7. Runtime observation and attribution report.
8. Public status and diagnostics split.
9. End-to-end validation and old-path deletion sweep.
