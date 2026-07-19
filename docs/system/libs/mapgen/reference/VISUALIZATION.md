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
- Runs may emit streaming layer events and/or replayable dumps (manifest + binary payloads), keyed by a unique execution `runId`, a stable `planFingerprint`, and layer keys.
- MapGen Studio renders visualization via deck.gl:
  - live runs consume streamed layer upserts (`viz.layer.upsert`),
  - mod-owned diagnostic commands consume path-backed dump folders when produced.
- Studio’s primary UI terminology is:
  - **Data type**: `dataTypeKey` (semantic identity; what a visualization *means*),
  - **Space**: `spaceId` (coordinate space),
  - **Render mode**: derived from `kind[:role]` (grid / points / segments / gridFields + optional role),
  - **Variant**: `variantKey` (optional; disambiguates multiple variants of the same data type).
    - Temporal scrubbing is expressed via `variantKey`, not `dataTypeKey` (e.g. `era:1`, `era:2`, ... for per-era history; `snapshot:latest` for “current” mesh snapshots).

Hard rule:
- There must be **exactly one** canonical deck.gl visualization doc. Do not fork competing viz architecture pages.

## Projection and materialization kernel

`@swooper/mapgen-viz` owns the environment-neutral path from spatial evidence to a v2 layer:

```text
typed VizProjection
  -> materializeVizProjection(projection, execution identity, binary materializer)
  -> VizLayerEmissionV2<inline ref | path ref>
```

- A projection carries semantic data identity, coordinate space, metadata, and typed array sources.
  It does not carry run/trace identity, output paths, browser state, Node state, recipes, or domain
  policy.
- Scalar format and typed-array representation are one closed union. Dimensions, cardinality,
  geometry, vector references, bounds, counts, and scalar statistics are validated centrally.
- Binary materialization is the only environment boundary. The Studio worker copies each exact
  typed-array view into an inline transferable buffer; Swooper diagnostic tooling persists that
  view and returns a relative path.
- `admitPathVizManifest` is the single runtime admission boundary for untrusted path-backed v2
  manifests. Viz owns the closed TypeBox schema and exact stage/step execution relation; the
  diagnostic host owns filesystem reads and supplies the parsed JSON value.
- Materialization does not render, persist, emit trace events, or synthesize evidence; it serializes
  the projection it receives. Explicitly selected projection helpers may derive visualization-only
  evidence such as vector magnitude from borrowed semantic sources before materialization.
- Steps author optional `viz` and `metrics` projectors inline on the same
  `createStep(contract, { run, viz, metrics })` implementation that owns their result. After `run`
  completes and declared artifact providers are admitted, the executor invokes each matching
  projector/sink pair at most once. Without both halves, no projection or execution identity is
  computed. These facets observe completed evidence; they never change generation behavior.
- Recipe algorithms cannot access a visualization sink. Imperative `context.viz` calls and trace
  event envelopes are not visualization authoring surfaces.

## Stage and step ownership

Visualization helpers have three reusable ownership shapes:

```text
recipes/<recipe>/viz.ts
  Recipe-wide semantic style and palette vocabulary. Style identities resolve to portable
  colors before projection; exact category identities remain with their stage or step owner.

stages/<stage>/viz.ts
  Projection geometry or metadata helpers shared by multiple owner-stage steps
  or consumed outside the owner stage.

stages/<stage>/steps/<step>/viz.ts
  Projection helpers private to one step.
```

The `createStep({ viz })` facet remains the projection authoring surface for the
stage and step shapes; a
`viz.ts` module is only reusable implementation placement. This keeps debug
surfaces predictable without turning `steps/` into a public namespace. If a
second step or another stage needs a helper, promote it to the owner stage's
`viz.ts` and delete any wrapper at the old private path. Portable projection
geometry belongs in `@swooper/mapgen-viz`, not in a recipe stage helper.

Forbidden shapes:

- `stages/<stage>/steps/viz.ts` shared hubs.
- importing `stages/<stage>/steps/<step>/viz.ts` outside that step directory.
- broad shared visualization buckets without a named invariant and concrete
  consumers.
- renderer-owned recipe palette registries. Studio receives resolved portable colors and does not
  interpret recipe style names.

## Canonical implementation doc

- [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

## Ground truth anchors

- Canonical deck.gl viz doc: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Viz manifest contract types: `packages/mapgen-viz/src/model.ts`
- Path-backed manifest admission: `packages/mapgen-viz/src/path-manifest.ts`
- Step facet contract and dispatch: `packages/mapgen-core/src/engine/step-projectors.ts` and
  `packages/mapgen-core/src/engine/step-facets.ts`
- Viz dump sink (mod-owned): `mods/mod-swooper-maps/scripts/diagnostics/dump.ts`
- Studio worker facet sink: `apps/mapgen-studio/src/browser-runner/worker-viz-facet-sink.ts`
- Standard recipe style vocabulary: `mods/mod-swooper-maps/src/recipes/standard/viz.ts`
- Standard-recipe stage/step ownership guard:
  Habitat `require_shared_visualization_contracts_at_stage_surfaces` in
  `.habitat/blueprints/recipe-stage/require_shared_visualization_contracts_at_stage_surfaces/rule.json`
- Recipe-step runtime sink prohibition:
  `.habitat/blueprints/recipe-step/prohibit_recipe_step_runtime_viz_sink_access/rule.json`
