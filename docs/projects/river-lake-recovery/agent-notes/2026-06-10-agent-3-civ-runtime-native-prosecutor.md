# Agent 3 - Civ Runtime Native Prosecutor

Goal: attack assumptions about what Civ can natively write or read for rivers.

Inquiry design:

- Primary question: what native Civ sequence actually authors visible/runtime
  river state?
- Evidence policy: installed app/resources and live probes outrank local mocks.
- Falsifier: a categorical writer claim survives without same-run runtime
  evidence.

Findings:

- Official scripts use `TerrainBuilder.modelRivers(...)`, then terrain
  validation, named rivers, and water-data storage.
- A disposable probe showed the bulk sequence can produce river metadata,
  including minor-river rows.
- Current `map-rivers` does not call that bulk sequence; it stamps
  `TERRAIN_NAVIGABLE_RIVER` terrain directly.
- Terrain readback and metadata readback are distinct proof classes.

Risks:

- Reintroducing `modelRivers(...)` naively would delegate truth to Civ.
- Avoiding it categorically may leave minor/metadata materialization impossible.
  The correct next question is bounded parity, not blanket ban or blanket use.
