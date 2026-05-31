## Why

Studio should observe a running Civ7 game as runtime evidence for mapgen
debugging, autoplay observation, player workflows, and future LLM-agent
analysis. Runtime state must not silently mutate authored config.

## Target Authority Refs

- User goal: live Civ runtime state is observational and turn-keyed.
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game/agent-live-sync.md`
- Existing `@civ7/direct-control` map/player/unit/city/resource/visibility
  reads.

## What Changes

- Add read-only Studio live status/snapshot/entity/GameInfo endpoints.
- Add a bounded Studio live runtime store/hook separate from `pipelineConfig`.
- Add compact Live panel and runtime overlay affordances.
- Add explicit suggestion records for runtime-to-config translation; no
  automatic config writes.

## Requires

- `direct-control-read-surface`
- `studio-run-current-map-config` for proven runtime binding when available.

## Enables Parallel Work

- Mapgen debugging during autoplay.
- Developer/player/LLM-agent runtime observation without raw command authority.

## Affected Owners

- `apps/mapgen-studio`
- `@civ7/direct-control` only if new read wrappers are needed

## Forbidden Owners

- Live endpoints that write repo configs, generated outputs, deployed mods, or
  `pipelineConfig`.
- Raw socket/JS command endpoints.
- Unbounded full-map polling by default.

## Stop Conditions

- Direct-control reads cannot provide stable turn/hash or bounded map facts
  while autoplay is running.
- Store/UI design cannot distinguish proven launch binding from unbound runtime
  observation.

## Consumer Impact

Developers can attach Studio to a running game, see readiness/turn/seed/status,
and inspect bounded live map/entity facts without corrupting authored config.

## Verification Gates

- Endpoint tests or build-time checks for read-only behavior and bounded caps.
- UI/store checks that runtime snapshots do not call config mutation paths.
- Live proof when Civ socket is healthy.
