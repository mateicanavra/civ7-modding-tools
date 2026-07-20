<toc>
  <item id="purpose" title="Purpose"/>
  <item id="what-youll-learn" title="What you’ll learn"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="walkthrough" title="Walkthrough"/>
  <item id="verification" title="Verification"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Tutorial: inspect artifacts and projections

## Purpose

Learn how to inspect “what the pipeline produced” using:
- **artifacts** (pipeline-internal data products), and
- **projections** (views of domain truth into tile space),
with **trace + viz dumps** that you can render via the canonical deck.gl viewer.

This tutorial uses the Standard recipe visualization harness, which emits the current projection layers used by Studio.

## What you’ll learn

- How to produce a deterministic run dump (`trace.jsonl` + `manifest.json` + binary layer payloads).
- How to connect a viz dump to deck.gl for interactive inspection.
- How to reason about truth vs projection in practice (without guessing).

## Prereqs

- Node/Bun available (repo setup complete).
- You can run TypeScript entrypoints in the repo (via bun or package scripts).

## Walkthrough

### 1) Run the existing trace+viz dump harness

This harness runs a minimal recipe and writes a dump under `dist/visualization/<runId>/`.

Preferred (package script):

```bash
nx run mod-swooper-maps:viz:standard
```

Optional args:
- `nx run mod-swooper-maps:viz:standard -- <width> <height> <seed>`

The script prints the final dump directory.

### 2) Inspect the outputs on disk

Inside the run directory:
- `trace.jsonl`: step start/finish plus any verbose structured step events
- `manifest.json`: indexed list of steps and layers emitted, with stable `layerKey`s
- `data/`: binary payload files referenced by the manifest

### 3) Replay the dump in Studio (Dump mode)

Follow the concrete replay workflow:
- [`docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md`](/system/libs/mapgen/how-to/debug-with-trace-and-viz.md)

This uses MapGen Studio’s dump viewer (deck.gl) to load `manifest.json` and the referenced `data/*` payloads.

### 4) Open the deck.gl visualization workflow (system reference)

Follow the canonical viz doc (do not invent alternate viewers):
- [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

### 5) Correlate projections back to their source step

Use `manifest.json` to identify:
- which step emitted the layer (`stepId` + `phase`),
- what data type key it used,
- and what scalar format it wrote (e.g. `u8`, `i16`, `f32`).

Then jump to the step code and confirm:
- the data being emitted matches your expectations,
- the emitted meta (label/group) is consistent with the domain model.

### 6) Concrete example: a step projecting visualization evidence

The Foundation projection step returns its completed domain result from `run`, then its optional
`viz` facet maps that result into multiple portable tile-space projections.

Example (one projection):

```ts
export const ProjectionStep = createStep(ProjectionStepContract, {
  run: (context, config, ops, deps) => {
    const result = ops.computePlates(/* admitted inputs */, config.computePlates);
    deps.artifacts.foundationPlates.publish(context, result.plates);
    return result;
  },
  viz: ({ result, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "foundation.plates.tilePlateId",
      spaceId: "tile.hexOddQ",
      dims: dimensions,
      field: { format: "i16", values: result.plates.id },
      meta: defineStandardVizMeta(
        "foundation.plates.tilePlateId",
        "category.distinct",
        { label: "Plate Id", group: "Foundation / Plates" }
      ),
    },
  ],
});
```

The projector receives only `{ result, config, dimensions }`. Studio and the Node dump harness each
supply their own facet sink; trace verbosity is unrelated to whether the projection is materialized.

## Verification

- A new directory is created under `dist/visualization/`.
- The directory contains `trace.jsonl` and `manifest.json`.
- `manifest.json` contains at least one `layers[]` entry.
- You can load the dump in the deck.gl viewer and see layers rendered.

## Ground truth anchors

- Standard recipe wiring: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Foundation projection step (source of many viz layer dumps): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation-projection/steps/projection/step.ts`
- Trace+viz dump harness (writes `trace.jsonl`, `manifest.json`, and `data/*`): `mods/mod-swooper-maps/src/dev/viz/dump.ts`
- Example runner that produces dumps: `mods/mod-swooper-maps/src/dev/viz/standard-run.ts`
- Trace core contract: `packages/mapgen-core/src/trace/index.ts`
