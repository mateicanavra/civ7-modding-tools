<toc>
  <item id="purpose" title="Purpose"/>
  <item id="canonical-spine" title="Canonical doc spine (proposed)"/>
  <item id="working-set" title="Working set (keep + tighten)"/>
  <item id="supersede" title="Supersede / archive / relabel"/>
  <item id="gaps" title="Missing docs to create"/>
</toc>

# Scratch: Canonical doc set proposal

## Purpose

Propose a coherent canonical doc set for MapGen that:
- teaches the DX-first “happy path” quickly
- explains the architecture + boundaries
- links into domain conceptual docs and code-facing contracts
- clearly separates legacy / research / superseded content

This scratch pad is the bridge between `docs-inventory.md` (what exists) and the final `../SPIKE.md` proposal.

## Canonical doc spine (proposed)

Goal: a new dev should be able to:
- run a recipe end-to-end without spelunking code, and
- know where to put new work (and where not to).

Proposed “spine” (minimal, durable, DX-first):

1) **SDK Quickstart (consumer POV)**
   - Run boundary (`Env`/`RunSettings`), adapter + context creation, pick a recipe, run sync/async.
   - Anchor to the real example: `apps/mapgen-studio/src/browser-runner/pipeline.worker.ts`.

2) **Architecture overview**
   - Ownership boundaries: core SDK vs content package.
   - Terminology: stage/step/op, artifact/field(buffer)/effect, overlays/story entries.
   - Anchor: `docs/system/libs/mapgen/architecture.md` + engine-refactor-v1 spec overview.

3) **Pipeline model + compilation**
   - Explain the two compilation layers and where validation/defaults happen.
   - Explain tag registry + satisfaction rules, and how artifacts are published/read.
   - Anchor: `packages/mapgen-core/src/compiler/recipe-compile.ts`, `packages/mapgen-core/src/engine/execution-plan.ts`, `packages/mapgen-core/src/engine/tags.ts`.

4) **Domains**
   - Keep domain conceptual docs as “what it means / ownership / causality”.
   - Provide at least one code-facing contract page where appropriate (Hydrology is the exemplar via `hydrology-api.md`).

5) **Studio as reference consumer**
   - Treat Studio docs as “reference implementation of the dev loop”, not as the canonical architecture.
   - Keep the seams docs, but harden them against drift (especially recipe artifacts import surfaces).
   - Consider adding 1–2 small, evergreen Studio docs that reflect the current code:
     - “Dev loop / browser runner overview”
     - “Recipes + artifacts seam” (two import surfaces: runtime vs UI artifacts)

## Working set (keep + tighten)

Working set candidates that already reflect the target mental model well:

- System / MapGen domain docs:
  - `docs/system/libs/mapgen/architecture.md` (strong causal spine + boundaries; needs broken-link cleanup)
  - `docs/system/libs/mapgen/foundation.md`
  - `docs/system/libs/mapgen/hydrology.md`
  - `docs/system/libs/mapgen/hydrology-api.md` (excellent code-facing contract page)
  - `docs/system/libs/mapgen/ecology.md`
  - `docs/system/libs/mapgen/narrative.md` (conceptual posture; must reconcile current wiring status)
  - `docs/system/libs/mapgen/placement.md`
  - `docs/system/libs/mapgen/realism-knobs-and-presets.md`
  - `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` (likely keep, but ensure it points to the current viz SDK)

- Target spec set (engine-refactor-v1):
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-core-sdk.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`
  - `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
  - `docs/projects/engine-refactor-v1/resources/spec/adr/ADR.md` (+ individual ADRs as needed)

## Supersede / archive / relabel

Primary candidates (high drift / misleading as a “how to” today):

- `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md` (valuable ideas, but references deleted packages; must be reconciled to `mod-swooper-maps/recipes/*`).

“Research spikes” that should not read as canonical engineering docs by default:

- `docs/system/libs/mapgen/research/**` (keep as research, but consider stronger labeling or relocation under `docs/projects/**`).

## Missing docs to create

Missing “DX-first” docs that would immediately reduce confusion:

- MapGen SDK Quickstart (the “one page to run a recipe end-to-end”).
- Pipeline + compilation model page (explicitly defines config compilation vs plan compilation).
- Drift explainer (short) that maps spec terms to current code terms (`settings` vs `env`, `buffer` vs `field`) and links to `drift-ledger.md`.
- Narrative integration status page (or an explicit section inside narrative.md) that states what is wired today and what is target-only.
- Studio runner docs that describe *implemented* behavior (protocol/cancel/recipe import surfaces) instead of leaving this only in “agent seams” docs.
