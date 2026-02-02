<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract (trace + reproducibility)"/>
  <item id="viz" title="Visualization hooks"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Observability (trace + reproducibility)

## Purpose

Define how MapGen runs can be inspected and debugged deterministically:

- trace sessions (per-step verbosity),
- reproducible run settings (seed, dimensions),
- and optional viz dump hooks (deck.gl pipeline visualization).

## Contract (trace + reproducibility)

- Run reproducibility is rooted in the run boundary (`Env`): seed + dimensions, etc.
- Trace configuration is carried inside the run boundary (`Env.trace`).
- Trace plumbing should not change pipeline semantics (only observability).

## Visualization hooks

Visualization is current canon and must reflect the deck.gl posture.

See:
- Contract routing: `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Canonical implementation: `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Ground truth anchors

- Env schema (includes trace config): `packages/mapgen-core/src/core/env.ts`
- Trace/viz types exist in core types: `packages/mapgen-core/src/core/types.ts`
- Canonical viz doc (current): `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
