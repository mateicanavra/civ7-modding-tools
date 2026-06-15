# D12 Status Endpoint Corpus

Status: accepted packet corpus
Date: 2026-06-14

## Rule

Retained public/manual status endpoints must be classified by authority. The
closeout does not flatten operation state reads into generic diagnostics:
operation status/current projections may read daemon-owned mutation state, but
they cannot own background freshness, browser polling, watchdog recovery, or
daemon identity recovery.

## Studio Runtime Status Surfaces

| Procedure | Source | Contract | Classification | Consumer / meaning | D12 oracle |
| --- | --- | --- | --- | --- | --- |
| `civ7.live.status` | `packages/studio-server/src/router/index.ts` | `packages/studio-server/src/contract/live.ts` | `diagnostic-read` | Manual/requested live-game snapshot. D10 `StudioLiveGameWatcher` owns background live-game freshness and publishes `live-game` events. | Retain only if browser cadence/polling is deleted and live-game state freshness flows through D10 events. |
| `runInGame.status` | `packages/studio-server/src/router/index.ts` | `packages/studio-server/src/contract/runInGame.ts` | `mutation-state read` | Request/response lookup for a named Run in Game request id and restart/identity diagnostics. D4/D5 operation runtime owns the mutation state being read. | Retain only if it is a keyed state read and no browser polling, watchdog, or recovery loop depends on it for freshness. |
| `mapConfigs.status` | `packages/studio-server/src/router/index.ts` | `packages/studio-server/src/contract/mapConfigs.ts` | `mutation-state read` | Request/response lookup for a named Save&Deploy request id and restart/identity diagnostics. D4/D5 operation runtime owns the mutation state being read. | Retain only if it is a keyed state read and hidden Save&Deploy sleep/status loops are deleted. |
| `studio.operations.current` | `packages/studio-server/src/router/index.ts` | `packages/studio-server/src/contract/studio.ts` | `mutation-state projection` | One-shot daemon-owned current/recent projection for page load, boot adoption after `studio.events.watch` hello, and manual inspection. D6 owns the projection; D9 events own ongoing freshness. | Retain only if client uses it as one-shot adoption/manual read and does not reintroduce polling/watchdog recovery. |
| `studio.serverInfo` | `packages/studio-server/src/router/index.ts` | `packages/studio-server/src/contract/studio.ts` | `identity-read` | Daemon identity/version read. Not an operation status endpoint. | Retain; D9 forbids identity polling as a daemon watchdog. |
| `civ7.status` | `packages/studio-server/src/router/index.ts` | `packages/studio-server/src/contract/civ7.ts` | `diagnostic-read` | Manual playable-status request through direct-control. | Retain only as requested diagnostic/readiness surface, not as browser watch loop. |

## Manual Civ7 Read Surfaces

These are public request/response read surfaces, but they are not operation
status endpoints. D12 names them so a future implementation does not treat the
status corpus as incomplete when scanning router contracts.

| Procedure family | Examples | Classification | D12 oracle |
| --- | --- | --- | --- |
| Civ7 setup/data reads | `civ7.mapSummary`, `civ7.gameInfo`, `civ7.setupConfig`, `civ7.savedConfigs`, `civ7.setupCatalog` | diagnostic/data read | Retain as requested reads; do not use as background daemon freshness or recovery authority. |
| Civ7 live detail reads | `civ7.live.snapshot`, `civ7.live.entities`, `civ7.live.gameInfo` | diagnostic/detail read | Retain as manual/request-key guarded reads; D10 pushed `live-game` state owns ongoing freshness. |

## Mutating Operation Surfaces That Are Not Status Endpoints

| Procedure | Source | Classification | D12 relation |
| --- | --- | --- | --- |
| `runInGame.start` | `packages/studio-server/src/router/index.ts` | mutation workflow entry | Must be backed by D5 `RunInGameWorkflow`, D4 operation runtime, and D12 game-door guard. |
| `mapConfigs.saveDeploy` | `packages/studio-server/src/router/index.ts` | mutation workflow entry | Must be backed by D5 `SaveDeployWorkflow`, D4 operation runtime, and D1/D11 dev-watch isolation. |
| `civ7.autoplay` | `packages/studio-server/src/contract/civ7.ts` | mutation workflow entry | Must be backed by D5 `AutoplayWorkflow`, D4 operation runtime, and D12 game-door guard. |

## Black-Ice Resolved

- A retained `*.status` procedure is not a fallback freshness path by name, and
  it is not automatically only diagnostic. It becomes a blocker only if a
  browser loop, daemon watchdog, or recovery mechanism depends on it for
  background state.
- `studio.operations.current` is allowed for D6 boot adoption and manual
  diagnostics; repeated freshness belongs to D9 pushed operation events.
- `civ7.live.status` is allowed for manual/requested diagnostics; repeated
  freshness belongs to D10 `StudioLiveGameWatcher` and D8 `StudioEventHub`.
