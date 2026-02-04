# Evidence Memo: Visualization + Tuning (Pipeline-Realism)

This memo anchors the Pipeline-Realism visualization spec to the repo’s canonical deck.gl visualization posture and highlights the constraints that keep visualization useful without turning it into a parallel system.

## Canonical contracts (must not drift)

- Visualization is external to the runtime; the pipeline must not depend on deck.gl:
  - `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Canonical architecture and key identity model (`layerKey`, `dataTypeKey`, `spaceId`, etc.):
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
- Trace posture: trace/viz emission must not change semantics:
  - `docs/system/libs/mapgen/reference/OBSERVABILITY.md`

## Pipeline-Realism alignment

- The maximal Foundation engine’s truth/projection split and downstream dependency chain:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (High-Level Architecture graph)
- The visualization section defining required `dataTypeKey`s and conventions:
  - `docs/projects/pipeline-realism/resources/spec/sections/visualization-and-tuning.md`

## Why `dataTypeKey` stability matters

The viz system is designed around stable semantic identities:

- `dataTypeKey` is the “API surface” for layer meaning.
- `spaceId` expresses coordinate system (mesh vs tile) and prevents “rotated/skewed” misplots.
- `variantKey` is the safe knob for timeline/era and raw/smoothed/derived variants.

Changing `dataTypeKey` breaks:

- Studio layering muscle memory,
- cross-run comparisons,
- and dump replay tooling.

## How this avoids a second viz architecture doc

Pipeline-Realism docs should:

- reference the canonical architecture docs for plumbing and identity rules, and
- only define the required domain-specific layer taxonomy and keys for this project.

This keeps durable “how viz works” knowledge in one place, and keeps volatile “which layers matter for Foundation maximal” scoped to this project.

