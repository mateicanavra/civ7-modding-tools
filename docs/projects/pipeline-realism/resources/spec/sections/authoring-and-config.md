# Authoring and Config Surface (D08r)

## Purpose

Define the **normative authoring surface** for the Pipeline Realism Foundation stack, and the rules for compiling that surface into a strict, deterministic compiled config suitable for plan compilation and execution.

This section is intentionally scoped to **physics inputs / initial conditions**. It explicitly forbids authoring of derived motion fields (velocities) and derived shaping structures (belts).

## Definitions

- **Authoring surface**: the user-authored, schema-validated config object provided to the recipe/stage boundary.
- **Compiled config**: the strict per-stage/per-step config bundle produced by config compilation, inserted into `RecipeV2.steps[].config`.
- **Artifacts**: the pipeline’s immutable products published by steps and addressed by artifact tags (e.g., `artifact:foundation.plateGraph`).

## Contract

### Strict Compilation Alignment

The authoring surface and its compilation MUST align with `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`:
- Unknown keys SHALL be treated as errors (no silent ignore).
- Any normalization SHALL remain shape-preserving (the result MUST still validate against the step schema).
- Compilation MUST be deterministic (same inputs MUST produce identical compiled config and identical structured errors).

### Determinism Rule (Run-Reproducibility)

Given the same:
- seed,
- run environment inputs (dimensions, latitude bounds),
- recipe id (and exact code version),
- and authoring surface payload,

the system SHALL produce:
- an identical compiled config (byte-for-byte JSON equivalence after canonical serialization),
- and identical emitted artifacts (including visualization dumps / manifests when enabled), subject to the repo’s determinism posture for the active runtime.

### Authoring Scope (Physics Inputs Only)

The authoring surface MUST be limited to:
- initial conditions for Foundation physics (e.g., discretization preference, lithosphere constitutive intent, mantle forcing intent),
- and a small number of **semantic knobs** that scale those initial conditions deterministically.

The authoring surface MUST NOT allow:
- direct authoring of per-plate or per-cell velocity vectors,
- direct authoring of global vector fields,
- direct authoring of tectonic belts (mountain belt masks/corridors) or other derived shaping structures,
- direct authoring of boundary regime labels per cell/tile.

Budgets are **not author-controlled** in the maximal strategy. In particular, `eraCount`, tracer advection steps, solver passes, and smoothing iteration counts are fixed by the target architecture and validated by D09r.

Normative budgets and invariants:
- `docs/projects/pipeline-realism/resources/spec/budgets.md`
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md`
- `docs/projects/pipeline-realism/resources/spec/sections/plate-motion.md`

## Authoring Surface Schema (Foundation; v1)

The Foundation stage authoring surface SHALL be a closed object with the following top-level keys:

```ts
type FoundationAuthoringSurfaceV1 = {
  version: 1;

  // Profiles are the default-facing UX. Profiles MUST compile into
  // deterministic internal constants and per-step configs.
  profiles: {
    resolutionProfile: "coarse" | "balanced" | "fine" | "ultra";
    lithosphereProfile: "maximal-basaltic-lid-v1";
    mantleProfile: "maximal-potential-v1";
  };

  // Semantic knobs are the stable, studio-friendly scalars.
  // They MUST remain physics-first (initial conditions), not output sculpting.
  knobs: {
    plateCount: number;      // integer >= 2; discretization preference only; dimension-scaled internally
    plateActivity: number;   // scalar in [0..1]; scales coupling/interaction intensity (does not author velocity)
  };

  // Advanced knobs are permitted only for physics inputs/initial conditions.
  // Derived constants MUST NOT be exposed here.
  advanced?: {
    mantleForcing?: {
      potentialMode?: "default";
      potentialAmplitude01?: number;     // [0..1]
      plumeCount?: number;              // integer >= 0
      downwellingCount?: number;        // integer >= 0
      lengthScale01?: number;           // [0..1] spectrum/coherence selector
    };

    lithosphere?: {
      yieldStrength01?: number;         // [0..1] baseline strength scale (units doc defines anchors)
      mantleCoupling01?: number;        // [0..1] coupling scale (maps to stress>strength gating)
      riftWeakening01?: number;         // [0..1] weakening scale when rifts form
    };
  };
};
```

Schema rules:
- `version` MUST be present and MUST equal `1`.
- `profiles` MUST be present and MUST be one of the allowed enum values.
- `knobs` MUST be present.
- `advanced` MAY be present; any `advanced.*` key not listed above MUST be a validation error.
- Any derived values (e.g., per-plate velocities, regime labels, belt masks, reference areas, internal multipliers, dimension-derived constants) MUST NOT appear in the authoring surface.

## Compilation Rules (Stage → Internal → Steps)

### Stage boundary

The Foundation stage contract SHALL provide:
- `surfaceSchema` validating `FoundationAuthoringSurfaceV1` (closed),
- `toInternal({ env, stageConfig })` that deterministically returns:
  - `knobs` (derived tuning values used by step normalize hooks),
  - `rawSteps` (per-step config objects).

This MUST follow the authoring-time model in `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`.

### Deterministic derivation rules

`toInternal(...)` SHALL:
- derive all internal constants only from `{ env, stageConfig }`,
- perform any dimensional scaling deterministically (no floating nondeterminism beyond the repo’s determinism posture),
- and never consult ambient randomness (all randomness MUST be an explicit function of `seed` via a label RNG).

### No “manual fields”

Compilation MUST NOT accept or manufacture authored fields that act as:
- per-cell/per-tile velocities,
- per-cell/per-tile boundary regime assignments,
- belt masks/corridors.

Any attempt to provide such fields in the authoring surface MUST be rejected during strict validation.

## Studio Tuning Loop (Knobs → Viz Layers)

Studio iteration SHALL treat authoring knobs as meaningful only if they can be validated visually through stable layers.

The following mapping MUST hold (layer ids are `dataTypeKey` values emitted by steps in Studio):

| Authoring knob/profile | Primary “did it change?” layer(s) | Secondary sanity layers |
|---|---|---|
| `profiles.resolutionProfile` | `foundation.mesh.sites`, `foundation.mesh.edges` | `foundation.tileToCellIndex`, `foundation.plateGraph.cellToPlate` |
| `knobs.plateCount` | `foundation.plateGraph.cellToPlate`, `foundation.plates.tilePlateId` | `foundation.plateGraph.plateSeeds`, `foundation.plateTopology.neighbors` |
| `knobs.plateActivity` | `foundation.plates.tileMovement`, `foundation.plates.tileBoundaryCloseness` | `foundation.tectonics.upliftPotential`, `foundation.tectonics.shearStress` |
| `profiles.lithosphereProfile` | `foundation.crust.*` (truth) + `foundation.crustTiles.*` | `foundation.mantle.forcing` (projected) |
| `profiles.mantleProfile` | `foundation.mantle.potential`, `foundation.mantle.forcing` | `foundation.plates.partition`, `foundation.plates.boundary.regime` |
| `advanced.mantleForcing.*` | `foundation.mantle.potential`, `foundation.mantle.forcing` | `foundation.events.boundary` |
| `advanced.lithosphere.*` | `foundation.crust.strength`, `foundation.events.boundary` | `foundation.belts.orogenyPotential` |

If new Foundation steps are introduced in the Pipeline Realism stack, they SHALL:
- emit layers using stable `dataTypeKey` naming consistent with the above taxonomy, and
- preserve the meaning of the existing keys where they remain present.

## Forbidden Authoring (Explicit)

The following are explicitly forbidden authoring categories:
- Any key that encodes a velocity or vector field directly (plate velocities, per-cell forcing vectors, “painted arrows”).
- Any key that encodes belts/corridors directly (uplift corridors, mountain belt masks, belt polylines).
- Any key that encodes boundary type labels directly (per-cell/per-tile boundary regime).

If a workflow requires a “scenario” (e.g., supercontinent breakup), it SHALL be expressed as an initial-condition selector that compiles into physics inputs, not as explicit vectors or belts.
