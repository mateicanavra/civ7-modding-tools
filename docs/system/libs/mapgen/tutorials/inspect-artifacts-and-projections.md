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

This tutorial uses the existing “browser-test” recipe as a minimal, Foundation-focused pipeline that emits rich projection layers.

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

- `bun mods/mod-swooper-maps/src/dev/viz/foundation-run.ts`

Optional args:
- `bun mods/mod-swooper-maps/src/dev/viz/foundation-run.ts <width> <height> <seed>`

The script prints the final dump directory.

### 2) Inspect the outputs on disk

Inside the run directory:
- `trace.jsonl`: step start/finish + step events (verbose) including viz emission payloads
- `manifest.json`: indexed list of steps and layers emitted, with stable `layerKey`s
- `data/`: binary payload files referenced by the manifest

### 3) Open the deck.gl visualization workflow

Follow the canonical viz doc (do not invent alternate viewers):
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

### 4) Correlate projections back to their source step

Use `manifest.json` to identify:
- which step emitted the layer (`stepId` + `phase`),
- what data type key it used,
- and what scalar format it wrote (e.g. `u8`, `i16`, `f32`).

Then jump to the step code and confirm:
- the data being emitted matches your expectations,
- the emitted meta (label/group) is consistent with the domain model.

## Verification

- A new directory is created under `dist/visualization/`.
- The directory contains `trace.jsonl` and `manifest.json`.
- `manifest.json` contains at least one `layers[]` entry.
- You can load the dump in the deck.gl viewer and see layers rendered.

## Ground truth anchors

- Browser-test recipe wiring (Foundation-only standard tag registry): `mods/mod-swooper-maps/src/recipes/browser-test/recipe.ts`
- Foundation projection step (source of many viz layer dumps): `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- Trace+viz dump harness (writes `trace.jsonl`, `manifest.json`, and `data/*`): `mods/mod-swooper-maps/src/dev/viz/dump.ts`
- Example runner that produces dumps: `mods/mod-swooper-maps/src/dev/viz/foundation-run.ts`
- Trace core contract: `packages/mapgen-core/src/trace/index.ts`
