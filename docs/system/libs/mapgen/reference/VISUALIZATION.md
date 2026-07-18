<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract (what must stay stable)"/>
  <item id="kernel" title="Projection and materialization kernel"/>
  <item id="ownership" title="Stage and step ownership"/>
  <item id="canon" title="Canonical implementation doc"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Visualization (contract + routing)

## Purpose

Define the canonical visualization contract and route readers to the single canonical deck.gl visualization doc.

## Contract (what must stay stable)

- Visualization is **external** to the pipeline runtime (pipeline does not depend on deck.gl).
- Runs may emit streaming layer events and/or replayable dumps (manifest + binary payloads), keyed by stable ids (`runId` (currently == `planFingerprint`), and layer keys).
- MapGen Studio renders visualization via deck.gl:
  - live runs consume streamed layer upserts (`viz.layer.upsert`),
  - dump viewer workflows consume dump folders (when produced).
- Studio’s primary UI terminology is:
  - **Data type**: `dataTypeKey` (semantic identity; what a visualization *means*),
  - **Space**: `spaceId` (coordinate space),
  - **Render mode**: derived from `kind[:role]` (grid / points / segments / gridFields + optional role),
  - **Variant**: `variantKey` (optional; disambiguates multiple variants of the same data type).
    - Temporal scrubbing is expressed via `variantKey`, not `dataTypeKey` (e.g. `era:1`, `era:2`, ... for per-era history; `snapshot:latest` for “current” mesh snapshots).

Hard rule:
- There must be **exactly one** canonical deck.gl visualization doc. Do not fork competing viz architecture pages.

## Projection and materialization kernel

`@swooper/mapgen-viz` owns the environment-neutral path from spatial evidence to a v1 layer:

```text
typed VizProjection
  -> materializeVizProjection(projection, execution identity, binary materializer)
  -> VizLayerEmissionV1<inline ref | path ref>
```

- A projection carries semantic data identity, coordinate space, metadata, and typed array sources.
  It does not carry run/trace identity, output paths, browser state, Node state, recipes, or domain
  policy.
- Scalar format and typed-array representation are one closed union. Dimensions, cardinality,
  geometry, vector references, bounds, counts, and scalar statistics are validated centrally.
- Binary materialization is the only environment boundary. The Studio worker copies each exact
  typed-array view into an inline transferable buffer; Swooper diagnostic tooling persists that
  view and returns a relative path.
- The kernel does not render, persist, emit trace events, or synthesize vector magnitude. Current
  `VizDumper` implementations remain compatibility adapters around this kernel until step-authored
  projections replace direct runtime emission.

## Stage and step ownership

Visualization code has two different ownership shapes:

```text
stages/<stage>/viz.ts
  Stage/phase visualization contracts that are stable, shared by multiple
  steps, or consumed outside the owner stage.

stages/<stage>/steps/<step>/viz.ts
  Step-private visualization helpers used only by that step.
```

This keeps debug surfaces predictable without turning `steps/` into a public
namespace. If a second step or another stage needs a helper, promote it to the
owner stage's `viz.ts` and delete any wrapper at the old private path.

Forbidden shapes:

- `stages/<stage>/steps/viz.ts` shared hubs.
- importing `stages/<stage>/steps/<step>/viz.ts` outside that step directory.
- broad shared visualization buckets without a named invariant and concrete
  consumers.

## Canonical implementation doc

- [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

## Ground truth anchors

- Canonical deck.gl viz doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Viz manifest contract types: `packages/mapgen-viz/src/index.ts`
- Viz dump sink (mod-owned): `mods/mod-swooper-maps/src/dev/viz/dump.ts`
- Standard-recipe stage/step ownership guard:
  Habitat `grit-viz-contract-ownership` in
  `.habitat/blueprints/recipe-stage/require_shared_visualization_contracts_at_stage_surfaces/rule.json`
