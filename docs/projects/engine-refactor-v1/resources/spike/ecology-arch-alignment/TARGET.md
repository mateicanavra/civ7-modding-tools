# TARGET: Ecology (Architecture-Aligned)

This doc interprets the target architecture through an Ecology-specific lens.
It does not redefine global architecture; it points to canonical sources.

## Canonical Architecture Anchors

- System model and layering:
  - `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- Domain modeling and ownership:
  - `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- Domain contract index + ecology contract:
  - `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
  - `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`
- Ops module contract:
  - `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- Domain modeling SPECs:
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`

## Target Posture Summary (Ecology)

### 1) Two-lane ecology: truth vs projection

Ecology is split into:

- **Truth lane** (`phase: ecology`):
  - produces deterministic, engine-agnostic truth artifacts (biomes, soils, basin candidates, feature intents).
  - does not touch the adapter/engine.

- **Projection lane** (`phase: gameplay` / `map-ecology` stage):
  - binds truth artifacts to engine-facing fields and effects.
  - owns all adapter calls.
  - provides explicit dependency tags (`field:*`) and effect tags (`effect:*`).

This is codified in:
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md` (truth vs projection posture)
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md` (ecology + map-ecology stage split)

### 2) Ops vs steps: explicit boundary

- **Ops** are algorithm units: pure input/config -> output, schema-backed, strategy-selected.
- **Steps** orchestrate: read artifacts/buffers, call ops, apply/publish outputs, emit viz.
- Orchestration must never live in ops.

See:
- `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`

### 3) Compiler-owned config + normalization

- Stage compile surfaces map public config to per-step configs.
- Step and op normalization happens in compilation.
- Unknown keys are rejected (strict posture).

See:
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`

### 4) Observability as contract

- Steps emit visualization via `context.viz?.dump*` with stable `dataTypeKey`/`spaceId`.
- Studio groups by `dataTypeKey` and renders by `kind` and `spaceId`.

See:
- `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`

## Ecology-Specific Target Implications

- Every op a step uses should be declared in the step contract `ops` so compilation owns:
  - defaulting (prefill)
  - strict validation
  - op.normalize routing

- Model ecology around a shared compute substrate:
  - compute ops produce reusable compute layers,
  - plan ops consume those layers to produce discrete intents/placements,
  following the in-repo reference pattern used in Morphology (`compute-*` ops + `plan-*` ops).

- For features specifically: each feature family should be modeled as atomic per-feature op(s).

- If a step mutates a published artifact in-place, that mutability must be treated as part of the artifact’s contract (or replaced with explicit republish).

- Any adapter write in map-ecology should ideally correspond to an effect tag if downstream needs to gate on it.
