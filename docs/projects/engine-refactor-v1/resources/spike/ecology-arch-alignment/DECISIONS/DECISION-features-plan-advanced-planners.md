# Decision Packet: Model `features-plan` “advanced planners” without breaking architecture

## Question

How should we model `vegetatedFeaturePlacements` / `wetFeaturePlacements` so that:
- steps do **not** import op implementations directly,
- the compiler owns op envelope prefill/normalize via `contract.ops`,
- and we still achieve **atomic per-feature ops** (no mega-ops),
- while preserving existing behavior (and ideally preserving existing config entrypoints)?

## Context (pointers only)

- Code:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/features-plan/contract.ts`
  - Compiler op defaults + normalize:
    - `packages/mapgen-core/src/compiler/recipe-compile.ts`
    - `packages/mapgen-core/src/compiler/normalize.ts`
  - Step schema merge rules:
    - `packages/mapgen-core/src/authoring/step/contract.ts`
- Config consumers (existing entrypoints):
  - `mods/mod-swooper-maps/src/presets/standard/earthlike.json`
  - `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
  - `mods/mod-swooper-maps/src/maps/configs/swooper-desert-mountains.config.ts`

## Why this is ambiguous

Current state mixes concerns:
- `features-plan` treats these as optional “advanced” toggles and wires them manually (manual schema + direct op calls).
- Target architecture requires:
  - compiler-owned op envelope normalization (declare ops in `contract.ops`),
  - orchestration in steps (not inside ops),
  - and atomic per-feature ops (no multi-feature mega-ops).

Additionally:
- Declaring an op in `contract.ops` implies the compiler will prefill defaults (making it “present” even when the author omits it).

## Why it matters

- Blocks/unblocks:
  - Unblocks Phase 3 refactor plan for `features-plan` and related ops.
  - Unblocks guardrails (“no step may import `@mapgen/domain/*/ops`”).
- Downstream contracts affected:
  - Ecology stage public schema and presets/configs that currently set these keys.

## Simplest greenfield answer

- `features-plan` is a step-level orchestrator over **atomic per-feature ops**.
- “Advanced planners” are expressed as:
  - compute substrate ops (layers), plus
  - per-feature plan ops (placements/intents),
  - orchestrated in the step.
- Public stage schema is curated and compiled into an internal step config shape.

## Why we might not yet simplify

- We have existing preset/config entrypoints using:
  - `vegetatedFeaturePlacements`
  - `wetFeaturePlacements`
- A pure greenfield internal config shape would require config migrations in multiple files (and possibly in any downstream tooling that assumes the old shape).

## Options

1) **Option A**: Treat `vegetatedFeaturePlacements` / `wetFeaturePlacements` as step-owned orchestration config (recommended)
   - Description:
     - Keep the existing top-level keys as part of the *public* step/stage schema.
     - Introduce internal atomic per-feature op envelopes under `contract.ops` (each defaulting to a “disabled/no-op” behavior so prefill is safe).
     - Stage `compile` translates the legacy/public config into internal per-op envelopes as needed.
   - Pros:
     - Obeys architecture: no direct op imports; ops remain pure; orchestration in step/stage compile.
     - Achieves atomic per-feature ops immediately (no mega-op).
     - Preserves existing config entrypoints with a clear compatibility story.
   - Cons:
     - Requires explicit compile-time translation logic (more machinery).
     - Public schema and internal schema diverge (needs crisp docs).

2) **Option B**: Fold “advanced planner” behavior into strategies on existing per-family ops
   - Description:
     - Replace separate “advanced planner” ops with strategies on the existing per-family op envelopes (vegetation/wetlands/etc).
   - Pros:
     - Uses an existing architecture mechanism (strategies) cleanly.
     - Fewer config keys long-term.
   - Cons:
     - Conflicts with atomic-per-feature intent when the “advanced” planner covers multiple feature keys (mega-op behavior).
     - Still requires migration from current config shape.

3) **Option C**: Keep mega-ops as ops (status quo, but declared in `contract.ops`)
   - Description:
     - Declare `vegetatedFeaturePlacements` / `wetFeaturePlacements` as op envelopes and keep multi-feature placement inside a single op.
   - Pros:
     - Minimal config migration.
   - Cons:
     - Violates the locked directive (atomic per-feature ops). Not acceptable.

## Proposed default

- Recommended: **Option A**
- Rationale:
  - It satisfies all locked directives simultaneously: atomic per-feature ops, compute-vs-plan substrate model, compiler-owned normalization, and config compatibility.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/FEASIBILITY.md` (section: spec-ready blueprint)
- [ ] Migration slice created/updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/PHASE-3-SKELETON.md` (prepare→cutover→cleanup shape updated to include compile-time translation)
- [ ] Follow-ups tracked: none (Phase 3 planning will turn this into explicit slices)

