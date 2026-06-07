## Why

`studio-live-civ7-map-sync` already added read-only live runtime endpoints and
the basic Studio live panel. Its remaining open work is the runtime snapshot
model: turn/hash keying, backoff, cancellation, and suggestion records where
runtime observations are translated toward authoring actions.

This completion slice keeps live runtime state observational and makes snapshot
freshness explicit before exact Studio-to-Civ authorship proof relies on it.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/studio-live-civ7-map-sync/proposal.md`
- `openspec/changes/studio-live-civ7-map-sync/design.md`
- `openspec/changes/studio-live-civ7-map-sync/tasks.md`
- `@civ7/direct-control` read surfaces for bounded status/map facts

## What Changes

- Complete live runtime snapshot keying by turn and stable runtime hash.
- Add bounded polling backoff and cancellation for stale or superseded snapshot
  requests.
- Record a disposition for runtime-to-config translation. Any exposed
  translation must emit explicit suggestion records and route through the normal
  visible config edit path.
- Update proof/workstream records so Studio live observations cannot be mistaken
  for authored config mutation.

## Requires

- `studio-live-civ7-map-sync`
- Current direct-control read wrappers for live status, map grid, entities, and
  GameInfo dictionaries

## Enables Parallel Work

- `studio-civ7-exact-authorship-proof`
- Bounded live map readback during final-surface parity proof

## Affected Owners

- `apps/mapgen-studio/**`
- `packages/civ7-direct-control/**` only if existing read wrappers cannot supply
  bounded turn/hash evidence
- `openspec/changes/studio-live-civ7-map-sync/workstream/**`

## Forbidden Owners

- No writes from live runtime state into `pipelineConfig`, presets, repo-backed
  configs, generated outputs, or deployed mods.
- No raw socket command surface in Studio.
- No unbounded full-map polling as a default UI behavior.

## Stop Conditions

- Direct-control cannot provide stable bounded turn/hash facts for snapshot
  identity.
- Studio store state cannot distinguish proven run binding from unbound runtime
  observation.
- Runtime-to-config translation would mutate authored config without an explicit
  visible suggestion and user edit path.

## Consumer Impact

Developers get clearer live runtime evidence while preserving Studio as the
authoring surface. Runtime overlays and proof packets can name snapshot
freshness and binding status precisely.

## Verification Gates

- Studio type/check/test gates for live runtime store behavior.
- Endpoint or integration coverage that proves stale/superseded snapshots do not
  overwrite newer snapshot state.
- OpenSpec validation for this change and the repaired downstream live-sync
  task state.
