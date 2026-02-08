# PHASE 3 SKELETON: Ecology Architecture Alignment (Implementation-Plan Precursor)

Scope of this document:
- Capture the *shape* of execution for the next stage.
- This is **not** the final hardened implementation plan, but it should be “close enough” that Phase 3 hardening mainly adds detail, sequencing, and explicit verification gates per slice.

## Workstreams

### 0) Preflight + Baselines (Parity Setup)

- Confirm the canonical test invocation and build-order:
  - `bun run --cwd packages/civ7-adapter build`
  - `bun run --cwd packages/mapgen-viz build`
  - `bun run --cwd packages/mapgen-core build`
  - `bun --cwd mods/mod-swooper-maps test test/ecology`
- Record baseline outputs in the parity harness (later hardening will decide what to diff).

Edge cases:
- If baseline is red on the base branch: record as pre-existing; do not “fix” as part of refactor unless explicitly scoped.

### 1) Lock Public Contract Surfaces (No-Behavior-Change Guarantees)

Lock (document + enforce with tests/guards later):
- Artifact ids and schemas for `artifact:ecology.*` used downstream.
- Step ids and stage ids (unless explicitly deciding to split steps now).
- Viz keys (`dataTypeKey`, `spaceId`, kind).
- Determinism labels (seed derivation strings).
- Effect tags for adapter-write boundaries.

### 2) Ops Catalog Reshape (Atomic Per-Feature + Compute Substrate)

Main work:
- Split any mega-ops that plan multiple feature keys into **atomic per-feature ops**.
- Extract shared compute into **compute substrate ops** where reuse is intended.

Constraints:
- Orchestration stays in steps (ops remain pure).
- Policies live in `rules/**` imported by ops.
- Generic helpers belong in core shared libs (use existing core helpers first).

Edge cases:
- Config surface preservation: existing presets/configs reference `vegetatedFeaturePlacements`/`wetFeaturePlacements`; plan and implement an explicit compatibility mapping (stage.compile transform) or migrate configs in-slice.

### 3) Step/Stage Wiring (Compiler-Owned Op Binding + Normalization)

Main work:
- Eliminate direct imports of `@mapgen/domain/ecology/ops` from steps.
- Ensure all runtime op envelopes used by steps are declared through `contract.ops`, so the compiler owns:
  - prefill (`defaultConfig`)
  - op.normalize execution

Hard seam:
- Optional/advanced planner toggles vs compiler prefill semantics:
  - implement the locked feasibility decision (see decision packets) so “optional” does not become “always on”.

### 4) Artifacts/Buffers Mutability Policy (Truth Stage)

Main work:
- Make the mutability posture explicit and intentional for any publish-once mutable handles.
  - Example: `artifact:ecology.biomeClassification` is refined in-place by `biome-edge-refine`.
- Decide whether Phase 3 keeps this posture or migrates to immutable republish (behavior-preserving).

Edge cases:
- In-place mutation can interact with ordering and downstream reads; parity checks must include this.

### 5) Gameplay Projection/Materialization (Downstream Consumers)

Main work:
- Ensure downstream steps (`plot-biomes`, `features-apply`, `plot-effects`) remain compatible:
  - tags/effects should remain correct
  - engine writes occur at the same boundaries
  - viz keys remain stable

Hard seam:
- `plot-effects` should gain an explicit effect guarantee (recommended) with a clear verification posture (verified vs unverified).

### 6) Documentation + Guardrails

Main work:
- Update the workflow plan docs to point at this spike directory (navigation, not duplication).
- Add/extend guardrails:
  - lint rules / checks preventing step-level deep imports of `@mapgen/domain/*/ops`
  - parity harness hooks
  - docs lint updates if new canonical docs are introduced

## Candidate Slice Boundaries (Prepare → Cutover → Cleanup)

These are the “shape” of slices; Phase 3 hardening will turn them into explicit slice-by-slice plans.

1. **Prepare**
   - Add new op contracts + rules + compute substrate contracts (no behavior change; old path still used).
   - Add compatibility mapping hooks in stage.compile if needed.
   - Add effect tag ids (if required) and wire tag ownership.

2. **Cutover**
   - Switch steps to injected ops only (remove direct imports).
   - Switch feature planning orchestration to the new atomic ops + compute substrate.
   - Preserve all ids/keys and verify parity gates.

3. **Cleanup**
   - Delete legacy/mega-op implementations and any transitional shims that violate the target model.
   - Remove unused config paths and update docs/specs accordingly.

## Verification Gates Per Slice (High-Level)

- `bun run test:ci` (preferred) or the explicit build+test sequence from the preflight.
- Determinism spot-checks:
  - confirm step seed labels unchanged
  - confirm ordering-sensitive outputs unchanged (placement ordering, counts)
- Viz key assertions:
  - ensure the same `dataTypeKey` emissions exist for the same steps/stages

## Major Branches / Edge Cases To Plan For

- Config migration:
  - if the public schema changes, decide whether to migrate presets/configs in the same slice or provide a temporary compatibility compile transform (with deletion target).
- Effect verification:
  - if we introduce a new `effect:engine.*` id, decide if it must be adapter-owned (verified) or mod-owned (unverified).
- Artifact mutability:
  - if we switch from in-place mutation to republish, parity harness must validate downstream reads and viz diffs.
- Performance:
  - maximal modularity is allowed; if performance regresses, use compute substrate caching or combine compute steps (but keep ops atomic).

