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
with live Studio visualization and path-backed diagnostic dumps.

This tutorial uses the Standard recipe visualization harness, which emits the current projection layers used by Studio.

## What you’ll learn

- How to produce a deterministic run dump (`trace.jsonl` + `manifest.json` + binary layer payloads).
- How to inspect a dump through Swooper commands backed by reusable diagnostic readers.
- How to reason about truth vs projection in practice (without guessing).

## Prereqs

- Node/Bun available (repo setup complete).
- You can run TypeScript entrypoints in the repo (via bun or package scripts).

## Walkthrough

### 1) Run the existing trace+viz dump harness

This harness runs the complete Standard recipe and writes a dump under
`dist/visualization/<label>/<runId>/`.

Preferred (package script):

```bash
nx run mod-swooper-maps:diag:dump -- --map-size MAPSIZE_STANDARD --map-seed 1337 --game-seed 7331 --players 0,1,2,3,4,5,6,7
```

Inputs:
- `--map-size` optionally selects an official Civ7 map-size id and defaults to
  `MAPSIZE_STANDARD`.
- `--map-seed` and `--game-seed` are required independent Civ7 signed seeds.
- `--players` is the required ordered list of alive major-player ids.

For a negative seed, use the unambiguous native-parser form such as
`--game-seed=-7331`.

The script prints `{"runId":"...","outputDir":"..."}` with the final dump directory.

### 2) Inspect the outputs on disk

Inside the run directory:
- `trace.jsonl`: step start/finish plus any verbose structured step events
- `manifest.json`: indexed list of steps and layers emitted, with stable `layerKey`s
- `data/`: binary payload files referenced by the manifest

### 3) Inspect the dump

Follow the concrete diagnostic workflow:
- [`docs/system/libs/mapgen/how-to/debug-with-trace-and-viz.md`](/system/libs/mapgen/how-to/debug-with-trace-and-viz.md)

The diagnostic commands admit `manifest.json` and read its referenced `data/*` payloads. Studio's
deck.gl viewer consumes live worker emissions rather than path-backed dump folders.

### 4) Open the deck.gl visualization workflow (system reference)

Follow the canonical viz doc (do not invent alternate viewers):
- [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

### 5) Correlate projections back to their source step

Use `manifest.json` to identify:
- which exact recipe location emitted the layer (`stageId` + `stepId`),
- what data type key it used,
- and what scalar format it wrote (e.g. `u8`, `i16`, `f32`).

Then jump to the step code and confirm:
- the data being emitted matches your expectations,
- the emitted meta (label/group) is consistent with the domain model.

### 6) Concrete example: a step projecting visualization evidence

The Foundation projection step returns completed invocation-local evidence from `run`, then its
optional `viz` facet maps that observation into multiple portable tile-space projections.

Example (one projection):

```ts
import { config } from "./config.js";

export const ProjectionStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const result = ops.computePlates(/* admitted inputs */, stepConfig.computePlates);
    deps.artifacts.plates.publish(result.plates);
    return result;
  },
  viz: ({ observation, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "foundation.plates.tilePlateId",
      spaceId: "tile.hexOddQ",
      dims: dimensions,
      field: { format: "i16", values: observation.plates.id },
      meta: defineStandardVizMeta(
        "foundation.plates.tilePlateId",
        "category.distinct",
        { label: "Plate Id", group: "Foundation / Plates" }
      ),
    },
  ],
});
```

The projector receives only `{ observation, config, dimensions }`. Studio and the Node dump harness each
supply their own facet sink; trace verbosity is unrelated to whether the projection is materialized.

## Verification

- A new directory is created under `dist/visualization/`.
- The directory contains `trace.jsonl` and `manifest.json`.
- `manifest.json` contains at least one `layers[]` entry.
- You can load the dump in the deck.gl viewer and see layers rendered.

## Ground truth anchors

- Standard recipe wiring: `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Foundation projection step (source of many viz layer dumps): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/projection/steps/projection/step.ts`
- Trace+viz dump capability (writes `trace.jsonl`, `manifest.json`, and `data/*`): `packages/mapgen-diagnostics/src/dump.ts`
- Standard capture runner: `mods/mod-swooper-maps/scripts/diagnostics/run-standard-dump.ts`
- Trace core contract: `packages/mapgen-core/src/trace/index.ts`
