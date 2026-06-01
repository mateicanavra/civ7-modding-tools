# Project: Standard Recipe Authoring Surface Cleanup
**Status:** Active
**Timeline:** 2026-05-31 -> stacked cleanup train
**Teams:** MapGen / Swooper Maps

## Scope & Objectives

Create and run a systematic cleanup workstream for the Swooper standard recipe
authoring surface. The target state is that every authored stage schema exposes
only intentional author-facing controls: semantic public fields, documented
defaults and bounds, deterministic compilation into internal stage/step/op
config, and no accidental exposure of private strategy parameters, stale legacy
options, projection plumbing, generated-only internals, or runtime artifacts.

This project is downstream of existing authority. It does not replace the
architecture normalization packet, the flat stage config invariant, or the
public config boundary OpenSpec work.

## Authority

- Current user objective for standard recipe authoring-surface cleanup.
- `docs/projects/pipeline-realism/resources/runbooks/HANDOFF-STANDARD-RECIPE-AUTHORING-SURFACE.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-032-recipe-config-authoring-surface.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- `docs/system/libs/mapgen/policies/SCHEMAS-AND-VALIDATION.md`
- `openspec/changes/mapgen-public-config-boundary/`
- `openspec/changes/morphology-public-config-surface/`
- `openspec/changes/studio-public-config-contract/`

## Non-Negotiables

- Preserve the default flat stage shape: `{ knobs?, [stepId]?: stepConfig }`.
- Use flat public keys `{ knobs?, [publicKey]?: publicConfig }` only when a
  stage has an explicit public+compile transform decision and records the
  public key, internal step key, and reason.
- Do not add persisted `advanced`, `internal`, dual-shape, or compatibility
  wrappers.
- Do not hand edit generated artifacts under generated map/schema outputs.
- Do not export all step/op config as public just to make Studio render it.
- Public schema cleanup must be proved by schema, compile, shipped-config, and
  Studio consumer checks.
- Runtime or direct-control proof is required only for slices that intentionally
  change generated map behavior or require live authoring inspection.

## Deliverables

- [x] Corpus ledger generator that mechanically enumerates standard recipe
  stages, steps, knobs schemas, public/internal schemas, op envelopes,
  strategy reachability, generated artifacts, shipped configs, Studio focus
  paths, and runtime read sites.
- [x] Taxonomy for defects, valid low-level surfaces, solution types, and
  per-domain slice order.
- [x] OpenSpec foundation slice:
  `openspec/changes/authoring-surface-corpus-and-taxonomy/`.
- [x] Foundation cleanup slice removing raw public step/op leakage while keeping
  deterministic compile behavior and migrating/proving all touched consumers.
- [x] Morphology alignment slice for documentation, bounds, naming, and any
  coupled semantic profile cleanup.
- [x] Hydrology cleanup slice separating true public knobs from internal
  climate/hydrography strategy controls.
- [x] Ecology and feature cleanup slice separating raw Ecology envelopes,
  stale selectors, empty execution ops, and plot-effect ids from semantic
  pedology/biome/feature controls.
- [x] Projection `map-*` audit for map materialization controls and misplaced
  truth-stage settings.
- [x] Placement cleanup slice for product-facing placement controls and internal
  planner parameters.
- [x] Shared SDK/Studio guard-hardening slice for cross-cutting raw-envelope
  leakage checks that remain after each behavior slice has completed its own
  generated artifact, shipped config, preset, and Studio proof.

## Slice Order

1. `authoring-surface-corpus-and-taxonomy`
   - No behavior change.
   - Establishes repeatable ledger, buckets, proof gates, and review lanes.
2. `foundation-authoring-surface-alignment`
   - Convert Foundation public raw step keys into semantic public controls plus
     compile output.
   - Migrate any touched shipped configs/presets, regenerate owned artifacts,
     prove Studio/default/schema consumers, prove projection stays internal, and
     prove compiled config remains deterministic in the same slice.
3. `morphology-authoring-surface-alignment`
   - Keep semantic public keys; repair weak docs, ranges, naming, and any
     coupled low-level fields.
   - Include any needed config/preset migration, generated artifact updates,
     Studio/default/schema proof, and unknown-key tests in this same slice.
4. `hydrology-authoring-surface-alignment`
   - Decide which climate/hydrography knobs are public and which op strategy
     details stay internal.
   - Include config/preset migration, generated artifact updates, Studio proof,
     and compile/runtime evidence for behavior-changing fields.
5. `ecology-authoring-surface-alignment`
   - Replace raw pedology, biome, feature-scoring, feature-planning, and
     plot-effect envelopes with semantic Ecology truth-stage groups.
   - Collapse strategy selection into profiles, keep behavior-equivalent expert
     scoring/planning controls where shipped maps depend on exact values, and
     hide empty ops and selector ids.
   - Include generated artifact, shipped config, preset, Studio, and behavior
     proof for the changed ecology surface.
6. `projection-authoring-surface-audit`
   - Ensure `map-*` stages expose only projection/materialization controls.
   - Include shipped config, generated artifact, Studio, compile-equivalence,
     unknown-key, and runtime/projection proof when generated map behavior
     intentionally changes.
7. `placement-authoring-surface-alignment`
   - Separate placement product controls from planner/runtime internals.
   - Include shipped config/preset migration, generated artifact updates,
     Studio/default/schema proof, compile determinism, and focused placement
     output proof.
8. `studio-sdk-authoring-surface-guards`
   - Add cross-cutting generated schema/default/uiMeta guard tests and SDK/Studio
     assertions after behavior slices have already migrated their own consumers.

## Links

- Corpus ledger: `docs/projects/standard-recipe-authoring-surface/corpus-ledger.md`
- Taxonomy and slice plan:
  `docs/projects/standard-recipe-authoring-surface/taxonomy-and-slices.md`
- Proof ledger: `docs/projects/standard-recipe-authoring-surface/proof-ledger.md`
- Review disposition:
  `docs/projects/standard-recipe-authoring-surface/review-disposition-ledger.md`
