# Evidence Memo: D08r Authoring & Config Surface

Date: 2026-02-04

## Summary

D08r defines what users author for the Pipeline Realism Foundation stack. The evidence below supports a **profiles-first surface with a small set of stable semantic knobs**, compiled via MapGen’s strict config compilation pipeline. It also supports a hard boundary: authoring expresses **physics inputs / initial conditions only** and must not allow direct authoring of **velocities** (vector fields) or **belts** (derived shaping corridors).

Primary sources:
- Proposal C: unified schema + “semantic knobs” + knob-to-config mapping (`unified-foundation-refactor.md`, Part III).
- Proposal D: “authoring profiles” + “derived values hidden” rule (`foundation-refactor-proposal.md`, Authoring Surface section).
- Current contracts: strict config compilation and current Foundation/Morphology domain references.

## Current Contracts (Ground Truth)

### Strict config compilation (required posture)

Source: `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`

Config compilation is explicitly:
- strict (unknown keys are errors),
- shape-preserving (normalize then revalidate),
- deterministic (same inputs → same compiled config + same errors).

This directly constrains D08r:
- The authoring surface must be closed/strict.
- Any “knob → derived constants” mapping must happen deterministically inside `stage.toInternal(...)` and/or step `normalize(...)`.

### Stage/step authoring boundary (where D08r lives)

Source: `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`

Stages own the config compilation boundary:
- `surfaceSchema` defines the author-facing payload.
- `toInternal({ env, stageConfig })` compiles it into `knobs` + `rawSteps`.

D08r’s “authoring surface” is therefore a **stage surfaceSchema contract** problem, not a per-op/per-step schema problem.

### Current Foundation authoring knobs already exist (and are semantic)

Source: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (section `Knobs & Normalization`)

Today’s standard recipe already exposes stage-level semantic knobs:
- `plateCount` (scaled via dimension-aware normalization),
- `plateActivity` (scales kinematics and boundary influence in projection).

This supports a D08r posture where “studio-friendly semantic scalars” remain first-class, but are constrained to physics-first intent (not output sculpting).

### Morphology consumes Foundation drivers (so belts are downstream-derived)

Source: `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` (section `Contract → Requires`)

Morphology consumes Foundation tile-space drivers:
- `artifact:foundation.plates`
- `artifact:foundation.crustTiles`

This supports a clean boundary:
- Foundation authoring defines physics inputs and emits driver fields.
- Morphology derives belts/relief from those drivers (belt synthesis is downstream behavior, not authoring input).

## Proposal Evidence

### Proposal comparison document (explicit “Config / authoring” divergence)

Source: `docs/projects/pipeline-realism/resources/spec/proposal-comparison-foundation-evolutionary-refactor.md`
- Matrix row: `Config / authoring` (C: full schema + knob mapping; D: profiles → derived constants).
- Divergence: `4. Config surface: schema/knobs vs authoring profiles`.

This frames D08r as a real “this-or-this” decision: knob-first vs profile-first vs hybrid.

### Proposal C: semantic knobs + unified schema + knob mapping

Source: `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md`
- Part III `Chapter 9: Configuration Philosophy`:
  - “Single source of truth”, “Semantic knobs”, “Derived values hidden”.
- `9.2 Complete Configuration Schema` (explicit, wide knob surface).
- `9.4 Knob-to-Config Mapping Reference` (author intent → technical parameters mapping table).

Key takeaway for D08r:
- C demonstrates how to keep knobs meaningful and how to maintain a knob-to-parameter mapping reference, which is essential for Studio tuning loops.

### Proposal D: profiles-first authoring surface + derived-values-hidden rule

Source: `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
- Section `Authoring profiles (high-level axes)`:
  - `resolutionProfile`, `continentProfile`, `plateMotionPolicy`, `historyProfile`.
- Section `9) Authoring Surface (Profiles & Advanced Knobs)`:
  - top-level profiles,
  - “Rule: If a value is derived from dimensions or a profile, it is not author-facing.”

Key takeaway for D08r:
- D’s profile axes align with a strict, stable authoring surface.
- The “derived values hidden” rule is compatible with MapGen config compilation’s shape-preserving normalization posture.

## Studio Tuning Loop Evidence (Knobs ↔ Viz)

The current standard recipe already emits stable `dataTypeKey` layers that make “knob → observable change” mapping practical. For Foundation, these include:
- Mesh: `foundation.mesh.sites`, `foundation.mesh.edges`
- Plates: `foundation.plateGraph.cellToPlate`, `foundation.plates.tilePlateId`
- Motion: `foundation.plates.tileMovementU`, `foundation.plates.tileMovementV`, `foundation.plates.tileMovement`
- Tectonics/history: `foundation.tectonics.*`, `foundation.tectonicHistory.*`
- Crust: `foundation.crust.*`, `foundation.crustTiles.*`

Source (layer keys emitted by Foundation steps):
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/*`

This supports a D08r requirement that every authoring knob maps to at least one stable visualization layer, enabling a tight Studio tuning loop.

## Implications for D08r Decision

The evidence supports these constraints:
- Prefer a **profiles-first** surface (Proposal D), with a **small set of stable semantic knobs** (current Foundation posture + Proposal C’s knob mapping discipline).
- Use strict config compilation as the enforcement mechanism (unknown keys error; deterministic compilation).
- Explicitly forbid authoring of:
  - velocities / vector fields,
  - belts / corridors,
  - per-cell/per-tile boundary regime labels.

