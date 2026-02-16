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
- simulation resolution / time-horizon budgets (physics-adjacent “how long / how many eras”),
- and a small number of **semantic knobs** that scale those initial conditions deterministically.

The authoring surface MUST NOT allow:
- direct authoring of per-plate or per-cell velocity vectors,
- direct authoring of global vector fields,
- direct authoring of tectonic belts (mountain belt masks/corridors) or other derived shaping structures,
- direct authoring of boundary regime labels per cell/tile.

Budgets are **author-controlled only as simulation resolution / time-horizon inputs**. In particular:
- Time-horizon / resolution budgets are not currently part of the public Foundation authoring surface in the M4 cutover.
- Budgets MUST remain physics-first (resolution/time) and MUST NOT become output sculpting (e.g., “target land%”, “painted belts”).

Other internal iteration counts (solver passes, smoothing iterations, etc.) remain fixed by the target architecture / internal defaults and validated by D09r unless explicitly promoted to the authoring surface as a physics-first resolution control.

Normative budgets and invariants:
- `docs/projects/pipeline-realism/resources/spec/budgets.md`
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md`
- `docs/projects/pipeline-realism/resources/spec/sections/plate-motion.md`

## Authoring Surface Schema (Foundation; current)

In the current standard recipe contract, the Foundation stage config is a **closed object** with:
- `knobs` (semantic, stable scalars), and
- optional per-step override objects keyed by step id (e.g. `mesh`, `mantle-potential`, `crust`, `projection`, ...).

There is no `version` or `profiles` envelope in the runtime contract.

The authoritative schema is generated from the stage/step contracts and published via:
- `mods/mod-swooper-maps/dist/recipes/standard.schema.json` (referenced by shipped map configs via `$schema`).

Example (minimal, knobs-first):

```jsonc
{
  "foundation": {
    "knobs": { "plateCount": 28, "plateActivity": 0.7 }
  }
}
```

Example (step-level override; use sparingly):

```jsonc
{
  "foundation": {
    "knobs": { "plateCount": 28, "plateActivity": 0.7 },
    "mesh": {
      "computeMesh": {
        "strategy": "default",
        "config": { "plateCount": 28 }
      }
    }
  }
}
```

Schema rules:
- Unknown keys are validation errors; only the stage’s `knobs` plus known step ids are accepted.
- Prefer `knobs` for author-facing tuning; step overrides are internal tuning and must remain physics-first (no output sculpting fields).

## Compilation Rules (Stage → Steps)

At compile time, the recipe compiler:
- validates stage config against the generated schema,
- applies deterministic defaults,
- and passes each step its config subtree (plus a `knobs` object used by normalize-time transforms).

### Deterministic derivation rules

Compilation and runtime transforms SHALL:
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
| `knobs.plateCount` | `foundation.plateGraph.cellToPlate`, `foundation.plates.tilePlateId` | `foundation.plateGraph.plateSeeds`, `foundation.plateTopology.neighbors` |
| `knobs.plateActivity` | `foundation.plates.tileMovement`, `foundation.plates.tileBoundaryCloseness` | `foundation.tectonics.upliftPotential`, `foundation.tectonics.shearStress` |
| `mesh.computeMesh.config.*` | `foundation.mesh.sites`, `foundation.mesh.edges` | `foundation.tileToCellIndex`, `foundation.plateGraph.cellToPlate` |

If new Foundation steps are introduced in the Pipeline Realism stack, they SHALL:
- emit layers using stable `dataTypeKey` naming consistent with the above taxonomy, and
- preserve the meaning of the existing keys where they remain present.

## Forbidden Authoring (Explicit)

The following are explicitly forbidden authoring categories:
- Any key that encodes a velocity or vector field directly (plate velocities, per-cell forcing vectors, “painted arrows”).
- Any key that encodes belts/corridors directly (uplift corridors, mountain belt masks, belt polylines).
- Any key that encodes boundary type labels directly (per-cell/per-tile boundary regime).

If a workflow requires a “scenario” (e.g., supercontinent breakup), it SHALL be expressed as an initial-condition selector that compiles into physics inputs, not as explicit vectors or belts.
