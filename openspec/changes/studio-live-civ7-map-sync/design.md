## Design

Live sync is a read-only observation layer over direct-control reads. It is
bound to a Studio Run in Game only when request id/config hash proof exists;
otherwise it is displayed as unbound runtime state.

## Endpoints

- `GET /api/civ7/live/status`: readiness, App UI state, Tuner health/map
  summary, autoplay status, and timestamp.
- `GET /api/civ7/live/snapshot`: bounded plot/grid overlay window with max plot
  caps and field selection.
- `GET /api/civ7/live/entities`: player/unit/city summaries with item caps.
- `GET /api/civ7/live/gameinfo`: bounded label dictionaries and map/resource
  catalogs.

## Client Store

Keep a separate `liveRuntime` model with connection, run binding, snapshots by
turn/hash, overlay requests, and explicit suggestion records. Runtime facts are
never stored inside `pipelineConfig` or preset state.

## Polling

Poll live status at 1s while visible and healthy, 3s while shell/loading, and
5-10s after repeated failures. Heavy grid/entity reads run only on selected
bounds/filters and turn/hash changes.

## UI

Add a compact Live panel close to Run controls. Add runtime overlay toggles in
the existing explore workflow, with evidence labels for proven binding,
unbound runtime, stale poll, partial grid, and read failure.

## Safety

Suggestion records are reviewable artifacts. Applying a suggestion must route
through the normal visible config edit path and dirty-state behavior.
