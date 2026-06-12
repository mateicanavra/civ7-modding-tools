# Adversarial Synthesis - 2026-06-10

This synthesis records the current adversarial pass for the river/lake recovery
frame. It is not closure evidence. It is a control artifact for the next code
slices.

## High-Confidence Findings

- Rivers are still not product-complete. Terrain readback and native river
  metadata now have positive same-run evidence on the current branch, but
  rendered in-game visible rivers and exact authored-topology parity remain
  separate product rows.
- The native Civ river writer question changed shape. A disposable runtime probe
  proved `TerrainBuilder.modelRivers(...)` can author live river metadata in
  bulk. The open question is whether it can be constrained to Hydrology-authored
  truth without delegating truth to the engine.
- Hydrology now owns canonical drainage routing in the current code. Morphology
  still has a flow-routing proxy for terrain-shaping consumers; that proxy is
  not the Hydrology truth graph.
- `map-rivers` currently stamps selected navigable terrain directly, then calls
  Civ's bulk river modeler through the adapter before validation/naming/store
  routines. That produces river metadata/model objects, but the remaining
  question is parity to Hydrology-authored truth rather than writer existence.
- The `selectNavigableRiverTerrain` contract reports an
  `endpointDischargePercentileMin` floor but the current strategy does not
  enforce the floor when choosing endpoints. This is a contract bug unless the
  field is renamed or removed.
- Studio has many raw river/lake/floodplain layers, but not a clean operational
  proof ladder from planned truth through projection/readback/rendered verdict.
- Some OpenSpec records still contain stale selector language such as
  `minLength/maxLength`. That language should not survive as an accepted product
  model.
- Floodplain proof still risks depending on projected navigable adjacency rather
  than Hydrology/final-surface truth plus Civ legality/readback.

## Required Corrections

1. Make the frame durable and route the session through it.
2. Replace stale `minLength/maxLength` and legacy alias language in active
   OpenSpec records.
3. Add explicit Earth benchmark contract fields: tile scale, feature-size
   floor, regime matrix, channel class ratios, lake area, terminal shares, and
   stylization ledger.
4. Treat native bulk river modeling as the current materialization path, but
   require same-run parity/reclassification evidence before claiming authored
   minor-river success.
5. Fix or remove `endpointDischargePercentileMin` semantics before relying on
   navigable projection metrics.
6. Build Studio's inspector around proof classes, not around raw layer sprawl.
7. Keep lake/floodplain closure blocked on exact same-run counters and active
   proof rows.

## Next Slice Sequence

1. Land this frame/spec correction slice.
2. Fix `selectNavigableRiverTerrain` endpoint-floor semantics with focused
   tests.
3. Patch Hydrology metric outputs to emit the benchmark contract fields.
4. Run a bounded native-writer parity/proof slice.
5. Implement Studio inspector summary/status model.
6. Run same-run rendered proof and product acceptance rows.

The active goal remains open until the closure matrix in `FRAME.md` is proven or
explicitly dispositioned.
