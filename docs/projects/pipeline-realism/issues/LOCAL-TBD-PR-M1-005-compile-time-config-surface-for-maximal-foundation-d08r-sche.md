id: LOCAL-TBD-PR-M1-005
title: Compile-time config surface for maximal Foundation (D08r) + schema/versioning posture
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: []
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Implement the compile-time authoring/config surface for maximal Foundation physics inputs (D08r), and lock schema/versioning posture so compilation is strict and deterministic.

## Deliverables
- Define the D08r authoring/config schema for maximal Foundation inputs:
  - **Allowed (“physics inputs”):** mantle source parameters, lithosphere initial state, budgets/iteration limits, and other inputs explicitly sanctioned by D08r.
  - **Forbidden (“kinematics outputs”):** direct authoring of plate velocities/rotations, belts, boundary regimes, or other downstream outputs.
- Wire the schema into the compile-time pipeline:
  - stage-level schema must compile via strict config compilation (unknown keys are errors),
  - compilation must be deterministic (same inputs => same compiled config bundle).
- Establish schema/versioning posture for this milestone:
  - how schema changes are introduced (additive vs breaking),
  - where version gating lives (recipe schema version vs artifact schema versioning),
  - and what “break & migrate allowed” means in practice for implementers.

## Acceptance Criteria
- The maximal Foundation config surface exists as an explicit TypeBox schema and is used by compilation (not by ad-hoc runtime parsing).
- Compilation is strict:
  - unknown keys cause a compile error (not ignored),
  - normalization is shape-preserving and re-validated post-normalize.
- The schema encodes “no kinematics hacks”:
  - plate motion outputs cannot be directly authored via config,
  - any “templates/presets” compile into explicit physics inputs (not hidden alternate engines).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend schema validation tests:
  - `mods/mod-swooper-maps/test/standard-compile-errors.test.ts` (unknown keys / strictness), and/or
  - `mods/mod-swooper-maps/test/config/*` for schema-valid fixtures/presets if new presets are introduced.
- Add at least one determinism sanity check that proves:
  - compiled config is identical across two compiles for the same inputs (byte-for-byte when serialized via stable stringify).

## Dependencies / Notes
- Blocked by: none
- Related:
  - (none)

### Implementation Anchors
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` (current authoring surface is knobs+advanced; D08r expands/supersedes this)
- `packages/mapgen-core/src/compiler/recipe-compile.ts` (strict compilation posture; unknown keys must error)
- `mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts` (build-time schema/defaults export for Studio; must reflect D08r authoring)
- `apps/mapgen-studio/test/config/defaultConfigSchema.test.ts` (pins that exported schema/defaults validate)
- `mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts` (good home for “no kinematics hacks” + determinism guardrails around config/presets)

### References
- docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md
- docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md
- docs/projects/pipeline-realism/resources/decisions/d08r-authoring-and-config-surface.md
- docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

Config compilation is already strict and shape-preserving in the core compiler:
- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`
- `packages/mapgen-core/src/compiler/recipe-compile.ts`

The standard recipe Foundation stage currently exposes:
- knobs: `plateCount`, `plateActivity` (see `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`)
- an “advanced” surface that maps to per-step config (same file).

This issue defines how maximal Foundation authoring fits into that model (or explicitly supersedes it).

### Proposed Change Surface

Likely implementation touchpoints:
- Stage authoring surface:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` (public schema + compile mapping)
  - and/or `packages/mapgen-core/src/authoring/types.ts` (if new dependency surfaces are needed)
- Domain knobs/normalization:
  - `@mapgen/domain/foundation/shared/knobs.js` and `@mapgen/domain/foundation/shared/knob-multipliers.js` patterns (existing posture for “knobs apply last”)
- Schema/versioning docs (normative):
  - `docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md`

### Pitfalls / Rakes

- Smuggling kinematics in through “presets” or “templates” that effectively set plate motion outputs directly.
- Creating a parallel config compilation path (runtime parsing) that bypasses strict compilation and makes determinism un-auditable.
- Introducing schema optionality that violates the “maximal-only” posture (if it’s in the spec, it must be produced/consumed; optionality should be strategy selection, not “maybe artifacts”).

### Wow Scenarios

- **Authoring with causality:** a single authored mantle source change causes an explainable cascade (mantle → plates → events → provenance → belts) and the compiled config snapshot is stable enough to diff meaningfully.

### Implementation Decisions

- Adopt the D08r authoring surface as the only public Foundation config shape: `foundation.version` + `foundation.profiles` + `foundation.knobs` + optional `foundation.advanced` (mantle/lithosphere only). Per-step `foundation.advanced.*` overrides are no longer part of the authoring surface.
- `foundation.knobs.plateCount` and `foundation.knobs.plateActivity` are numeric scalars (integer and `[0..1]` respectively). `plateCount` is the authored baseline for mesh + plate graph; `plateActivity` scales projection kinematics and boundary influence via a piecewise linear mapping (0.0 → 0.8 / -1, 0.5 → 1.0 / 0, 1.0 → 1.2 / +2).
- Resolution profiles map to the existing shipped baselines to preserve intent during the D08r cutover: `coarse` (desert-mountains), `balanced` (earthlike), `fine` (shattered-ring), `ultra` (sundered-archipelago). Map configs select the appropriate profile and set `plateCount` explicitly.
- Legacy realism preset strings map to numeric `plateActivity` targets for continuity: `low` → `0.25`, `normal` → `0.5`, `high` → `0.75`.
- `foundation.advanced` is validated but not yet consumed in runtime steps; upcoming Foundation engine issues will wire mantle/lithosphere inputs into the new ops.
