# Validation and Observability (D09r)

This section defines the **normative validation and observability posture** for the maximal Foundation evolutionary physics engine.

It explicitly separates:

- **Validation / observability** (correctness, determinism, regression safety), from
- **Visualization / tuning** (human understanding and iteration).

Visualization uses the same trace/viz plumbing, but it is an **external observer** and MUST NOT become a correctness dependency.

## Definitions

- **Validation**: pre-render assertions over artifacts (shape, bounds, cross-artifact agreement, fixed budgets). Validation MAY fail a run.
- **Observability**: trace + metrics + optional dumps that do not change pipeline semantics.
- **Visualization**: deck.gl/Studio consumption of streamed layer events and/or dumps (external to pipeline runtime).

## Contract Alignment (Repo-Wide)

These repo contracts are normative:

- Observability must not change semantics: `docs/system/libs/mapgen/reference/OBSERVABILITY.md`
- Visualization is external and routed via a single canonical doc: `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Artifacts are write-once, read-only (buffer exception is narrow): `docs/system/libs/mapgen/reference/ARTIFACTS.md`

## Two-Tier Validation Posture (Normative)

### Tier 1: Runtime hard gates (always-on)

Runtime hard gates MUST:

- prevent invalid artifacts from being published,
- prevent cross-artifact contract disagreement,
- enforce fixed budgets (bounded compute),
- and fail fast with actionable errors.

### Tier 2: Strict validation (CI and/or explicit “strict mode”)

Strict validation MUST:

- compute additional distribution/correlation diagnostics, and
- promote a small subset to hard failures once thresholds are stable.

Strict validation is required in CI for a small canonical suite of seeds/configs/dimensions.

## Where Validation Lives (Pipeline Boundaries)

Validation SHOULD live at the smallest boundary that makes failures actionable:

1. **Producer boundary**: each step validates the artifact(s) it publishes immediately before publish.
2. **Stage boundary**: a terminal `foundation.validate`-style step validates cross-artifact agreement and projection correctness.
3. **Consumer boundary**: downstream stages perform cheap “input contract” checks (required artifacts + dims), but do not re-run full upstream validation.

This ensures that validation remains independent of visualization and avoids duplicative cost.

## Determinism Posture (Normative)

Determinism is rooted in the run boundary:

- `Env.seed`, `Env.dimensions`, and the compiled config.

Rules:

- Trace verbosity and viz dumping MUST NOT change computation paths or RNG consumption.
- All randomness MUST be derived from the run seed (no ambient randomness).
- All iteration orders and tie-breaks MUST be deterministic (especially for graphs and seeded source generation).
- All fixed budgets MUST be enforced (no convergence loops).

### Determinism gates

- Runtime MUST validate that determinism prerequisites are met (budgets, finite values, stable array sizes).
- CI strict mode MUST run a “double-run equivalence” check on a small suite and compare stable fingerprints of key artifacts (truth first, projections second).

## Required Hard Gates (Tier 1)

This list is normative for the maximal engine. Gates are grouped by artifact stage.

### Mesh + adjacency

`artifact:foundation.mesh` MUST satisfy:

- `cellCount > 0`
- mesh coordinate arrays length == `cellCount`
- CSR adjacency arrays are well-formed (`neighborsOffsets.length == cellCount + 1`, offsets monotone)
- all neighbor indices in `[0..cellCount-1]`

### Mantle forcing (D02r)

`artifact:foundation.mantlePotential` MUST satisfy:

- all arrays lengths match `cellCount` and `sourceCount`
- `potential` finite and within declared range
- `sourceCell` indices in-range and `sourceType` values in expected enum set

`artifact:foundation.mantleForcing` MUST satisfy:

- all arrays lengths match `cellCount`
- finite values everywhere
- bounded domains are respected (e.g. `[0,1]` or `[-1,1]` per units contract)
- `upwellingClass` values in the expected enum set

### Plate motion (D03r)

`artifact:foundation.plateMotion` (or the canonical kinematics artifact chosen by the spec) MUST satisfy:

- arrays lengths match `cellCount` and/or `plateCount`
- finite values everywhere
- plate ids in-range

### Partition + segments

`artifact:foundation.plateGraph` MUST satisfy:

- `cellToPlate.length == cellCount`
- plate ids are in-range

`artifact:foundation.tectonicSegments` MUST satisfy:

- `segmentCount >= 0`
- all arrays length == `segmentCount`
- segment endpoints in `[0..cellCount-1]`
- segment plate ids in `[0..plateCount-1]`
- segment regime codes in known enum set

### Evolution outputs (D04r)

`artifact:foundation.tectonicHistory` MUST satisfy:

- `eraCount` matches the maximal fixed budget (or is within the spec’s hard max if dimension-derived)
- `eras.length == eraCount`
- all per-era tensors length == `cellCount`

`artifact:foundation.tectonicProvenance` MUST satisfy:

- `eraCount === tectonicHistory.eraCount`
- `tracerIndex[era].length == cellCount` for each era
- tracer indices are in `[0..cellCount-1]`
- provenance scalars obey sentinel and range rules

### Projection correctness (tile)

`artifact:foundation.tileToCellIndex` MUST satisfy:

- length == `width * height`
- each value is in `[0..cellCount-1]`

`artifact:foundation.tectonicHistoryTiles` MUST satisfy:

- dims == `width * height`
- `eraCount === tectonicHistory.eraCount`
- all per-era tensors length == `width * height`
- sentinel/range rules preserved

`artifact:foundation.tectonicProvenanceTiles` MUST satisfy:

- dims == `width * height`
- sentinel/range rules preserved

## Required Diagnostics (Tier 2; Strict Mode)

These diagnostics are required to support maximalism, but are not runtime gates by default.

### Mantle structure (not noise)

- coverage bounds: upwelling/downwelling occupancy fractions within configured limits
- coherence proxy: a low-order “structure first” proxy above threshold (implementation-defined)
- magnitude distribution bounds (mean/P90)

### Plate motion quality

- rigid-fit residual summaries (RMS, P90)
- bounds on mean speed/rotation relative to mantle forcing scales

### Segments/belts continuity

- connected component length distributions for belts (mesh or tile space as appropriate)
- flicker regressions: regime stability across adjacent eras

### Downstream explainability

- uplift driver correlates with elevation response distributionally (not per-tile exactness)
- volcanism driver correlates with volcano placement density where applicable

## Outputs (How Validation Reports)

Validation MUST report:

- structured errors for hard gates (actionable, includes artifact id + field name)
- trace events/metrics for diagnostics

Validation MUST NOT:

- republish artifacts to “store validation results” (violates write-once contract)
- depend on deck.gl rendering code

## Ecology + Placement Drift Gates (Swooper Maps)

For the ecology/hydrology/placement cutover:

- `map-hydrology/lakes` is a runtime hard failure when any planned-lake tile is not water in engine projection (`sinkMismatchCount > 0`).
- `map-ecology/plot-biomes` and `placement/placement` always emit parity diagnostics and remain strict-candidate gates until post-hydrology authoritative land-mask truth is formalized for those boundaries.

These diagnostics are contract-truth telemetry, not visualization-only noise.

## Trap List (Non-Negotiable)

- Do not gate correctness on visualization.
- Do not allow “shape-only” validation for maximal physics.
- Do not add convergence loops (budgets must be fixed).
- Do not normalize truth artifacts by per-run min/max (breaks thresholds and comparability).
- Do not allow diagnostics artifacts to become implicit truth dependencies.
