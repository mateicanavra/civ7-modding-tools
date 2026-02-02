<toc>
  <item id="purpose" title="Purpose"/>
  <item id="method" title="Method (how the scan was produced)"/>
  <item id="output" title="Raw scan output (untriaged)"/>
  <item id="notes" title="Triage notes"/>
</toc>

# Deprecation scan: raw candidates outside the canonical MapGen spine

## Purpose

This is a machine-assisted (search-based) inventory of MapGen/Studio/viz-adjacent markdown/docs **outside**
`docs/system/libs/mapgen/**`.

It is intentionally **untriaged**. The goal is to make it harder for superseded docs to hide “in random places”
and confuse humans/agents when the new canonical MapGen doc spine becomes the primary source of truth.

Use this in conjunction with:
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/DEPRECATION-MANIFEST.md` (curated manifest with decisions)

## Method (how the scan was produced)

Search terms (case-insensitive) included:
- `MapGen`, `mapgen`
- `hydrology`, `morphology`, `ecology`, `foundation`
- `deck.gl`, `mapgen-studio`
- `standard recipe`, `RunSettings`, `Env`

Exclusions:
- `docs/system/libs/mapgen/**` (canonical spine)
- `docs/projects/engine-refactor-v1/mapgen-docs-alignment/**` (this spike work)
- `docs/_archive/**`
- most “already archived” issue/milestone/review material (but not all project-level archives)

If this file feels too noisy, tighten the search terms and/or add additional exclusions, then regenerate.

## Raw scan output (untriaged)

- `docs/ROADMAP.md`
- `docs/process/LINEAR.md`
- `docs/projects/engine-refactor-v1/PROJECT-engine-refactor-v1.md`
- `docs/projects/engine-refactor-v1/deferrals.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-core-sdk.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/phase-2-modeling.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/verification-and-guardrails.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/structure-and-module-shape.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/op-and-config-design.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/references/domain-inventory-and-boundaries.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/prompts/ECOLOGY-CONTEXT.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/prompts/HYDROLOGY-IMPLEMENTATION.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/prompts/MORPHOLOGY-IMPLEMENTATION.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/prompts/GAMEPLAY-CONTEXT.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/morphology/spec/PHASE-2-CONTRACTS.md`
- `docs/projects/mapgen-orographic-precipitation/spike-feasibility.md`
- `docs/projects/mapgen-studio/ROADMAP.md`
- `docs/projects/mapgen-studio/V0-IMPLEMENTATION-PLAN.md`
- `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md`
- `docs/projects/mapgen-studio/BROWSER-ADAPTER.md`
- `docs/projects/mapgen-studio/VIZ-SDK-V1.md`
- `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md`
- `docs/projects/mapgen-studio/VIZ-DECLUTTER-SEMANTICS-GREENFIELD-PLAN.md`
- `docs/projects/mapgen-studio/architecture-assessment.md`
- `docs/projects/mapgen-studio/issues/LOCAL-TBD-pipeline-viz-surface.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`
- `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md`
- `docs/system/ADR.md`
- `docs/system/DEFERRALS.md`
- `docs/system/mods/swooper-maps/adrs/adr-002-plot-tagging-adapter.md`
- `docs/system/mods/swooper-maps/adrs/index.md`
- `docs/system/sdk/overview.md`

## Triage notes

- Many items above are **target authority** (engine-refactor-v1 specs + workflow docs). They should usually be `keep`,
  but they must be clearly framed as “WHAT SHOULD BE / workflow authority”, not “SDK how-to”.
- `docs/projects/mapgen-studio/**` is the highest confusion risk because it reads like actionable instructions but
  often represents prior planning iterations. Most of it should become `archive` or `keep-with-framing` and should
  link back to the canonical MapGen spine for contracts.
- Mod-level docs (like `docs/system/mods/swooper-maps/**`) should not define MapGen SDK contracts; they should route
  to `docs/system/libs/mapgen/**` for SDK posture.
