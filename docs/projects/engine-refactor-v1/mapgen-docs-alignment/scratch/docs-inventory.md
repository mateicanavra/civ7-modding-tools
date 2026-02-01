<toc>
  <item id="purpose" title="Purpose"/>
  <item id="working-set" title="Working set (salvageable)"/>
  <item id="partially-salvageable" title="Partially salvageable"/>
  <item id="non-canonical" title="Non-canonical / supersede / archive"/>
  <item id="unknowns" title="Unknowns + follow-ups"/>
</toc>

# Docs inventory + classification (MapGen)

## Classification legend
- ✅ **Working set**: mostly correct; tighten wording/examples; keep as active canon.
- 🟡 **Partially salvageable**: valuable but needs structural/API/architecture updates.
- ❌ **Obsolete / superseded**: misleading for current/target architecture; archive or clearly mark non-canonical.

## Notes on scope
- This is the curated inventory + classification.
- Raw/noisy discovery lives in `docs-inventory-auto.md`.
- Some “canon” lives under `docs/projects/**` today; part of this spike is surfacing those and proposing where they should live.

## Inventory (curated)

### docs/system/libs/mapgen/** (active)
- ✅ `docs/system/libs/mapgen/architecture.md` — canonical domain layering + causality spine (intentionally *not* SDK wiring).
- ✅ `docs/system/libs/mapgen/foundation.md` — canonical Foundation domain spec (model-first, mesh-first).
- 🟡 `docs/system/libs/mapgen/morphology.md` — conceptual/aspirational; explicitly *not* Phase 2 contract authority (links to Phase 2 specs).
- ✅ `docs/system/libs/mapgen/hydrology.md` — canonical Hydrology/Climate domain spec.
- ✅ `docs/system/libs/mapgen/hydrology-api.md` — code-facing Hydrology contract (schemas/ops/artifacts) aligned to `mods/mod-swooper-maps`.
- ✅ `docs/system/libs/mapgen/ecology.md` — canonical Ecology domain spec + ownership boundaries.
- ✅ `docs/system/libs/mapgen/placement.md` — canonical Placement domain spec + ownership boundaries.
- ✅ `docs/system/libs/mapgen/narrative.md` — canonical Narrative target model (story entries as canon; views derived).
- ✅ `docs/system/libs/mapgen/realism-knobs-and-presets.md` — author surface for semantic knobs/presets (points to locked test).
- 🟡 `docs/system/libs/mapgen/pipeline-visualization-deckgl.md` — proposed diagnostics/viz design; must be periodically reconciled with Studio + trace/dump reality.
- ✅ `docs/system/libs/mapgen/adrs/index.md`
- ✅ `docs/system/libs/mapgen/adrs/adr-001-era-tagged-morphology.md`
- ✅ `docs/system/libs/mapgen/adrs/adr-002-typebox-format-shim.md`
- 🟡 `docs/system/libs/mapgen/research/SPIKE-civ7-map-generation-features.md` — research; useful, but not “how to build”.
- 🟡 `docs/system/libs/mapgen/research/SPIKE-gameplay-mapgen-touchpoints.md` — research; useful, but not “how to build”.
- 🟡 `docs/system/libs/mapgen/research/SPIKE-earth-physics-systems-modeling.md` — research; useful, but not “how to build”.
- 🟡 `docs/system/libs/mapgen/research/SPIKE-earth-physics-systems-modeling-alt.md` — research; useful, but not “how to build”.
- 🟡 `docs/system/libs/mapgen/research/SPIKE-synthesis-earth-physics-systems-swooper-engine.md` — research synthesis; valuable but not a contract/spec.

### docs/system/mods/swooper-maps/** (mapgen-adjacent)
- ✅ `docs/system/mods/swooper-maps/architecture.md` — current mod runtime architecture + example run path.
- ✅ `docs/system/mods/swooper-maps/vision.md` — project direction + posture.
- ✅ `docs/system/mods/swooper-maps/adrs/index.md`
- ✅ `docs/system/mods/swooper-maps/adrs/adr-002-plot-tagging-adapter.md`

### docs/projects/engine-refactor-v1/resources/spec/** (target architecture)
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-architecture-overview.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-core-sdk.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-tag-registry.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-standard-content-package.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-global-invariants.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/SPEC-appendix-target-trees.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/ADR.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-001-ordering-source-of-truth-is-recipe-only-no-stage-order-stagemanifest.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-002-enablement-is-recipe-authored-and-compiled-no-shouldrun-no-silent-skips.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-003-pipeline-boundary-is-runrequest-recipe-settings-compiled-to-executionplan.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-004-the-standard-pipeline-is-packaged-as-a-mod-style-package-not-hard-wired.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-005-presets-are-removed-canonical-entry-is-explicit-recipe-settings-selection.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-006-tag-registry-is-canonical-registered-tags-only-fail-fast-collisions-effect-first-class.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-007-foundation-surface-is-artifact-based-m4-uses-monolithic-artifact-foundation-split-deferred-per-def-014.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-008-narrative-playability-contract-is-story-entry-artifacts-by-motif-views-derived-no-storytags-no-narrative-globals.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-009-engine-boundary-is-adapter-only-reification-first-state-engine-is-transitional-only-verified-effect-is-schedulable.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-010-climate-ownership-is-ts-canonical-artifact-climatefield-engine-reads-fenced-def-010-is-post-m4-reification.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-011-placement-consumes-explicit-artifact-placementinputs-v1-implementation-deferred-per-def-006.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-012-observability-baseline-is-required-runid-plan-fingerprint-structured-errors-rich-tracing-is-optional-and-toggleable.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-014-core-principles-taskgraph-pipeline-context-owned-state-offline-determinism.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-015-hydrology-river-product-is-artifact-riveradjacency-for-now-def-005-defers-artifact-rivergraph.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-016-pure-target-non-goals-no-compatibility-guarantees-no-migration-shims-in-the-spec.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-017-v1-explicit-deferrals-schema-must-allow-future-expansion-without-breaking-changes.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-019-cross-cutting-directionality-policy-is-runrequest-settings-not-per-step-config-duplication.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-020-effect-engine-placementapplied-is-verified-via-a-minimal-ts-owned-artifact-placementoutputs-v1.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-021-effect-engine-landmassapplied-effect-engine-coastlinesapplied-are-verified-via-cheap-invariants-call-evidence-adapter-read-back-apis-are-deferred.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-022-plan-fingerprint-excludes-observability-toggles-semantic-fingerprint-only.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-024-hotspot-categories-live-in-a-single-narrative-hotspots-artifact-no-split-artifacts-in-v1.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-025-ctx-overlays-remains-a-non-canonical-derived-debug-view-story-entry-artifacts-are-canonical.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-026-landmass-ocean-separation-do-not-rely-on-foundation-surface-policy-aliases-recipe-config-is-authoritative.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-027-dependency-terminology-and-registry-naming.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-028-dependency-key-ownership-model.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-029-mutation-modeling-policy.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-030-operation-inputs-policy.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-031-strategy-config-encoding.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-032-recipe-config-authoring-surface.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-033-step-schema-composition.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-034-operation-kind-semantics.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-035-config-normalization-and-derived-defaults.md`
- ✅ `docs/projects/engine-refactor-v1/resources/spec/adr/adr-er1-036-strategy-required-createop-sequencing.md`
- ❌ `docs/projects/engine-refactor-v1/resources/PRD-target-narrative-and-playability.md` — missing; treat ADR-ER1-008 as the current canonical narrative/playability authority (and keep links pointed at ADR-ER1-008).
- 🟡 `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/README.md` — still useful, but tends to be implementation-architecture heavy.
- 🟡 `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/DX-CLEANUP-PLAYBOOK.md`
- 🟡 `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/DX-ARTIFACTS-PROPOSAL.md`
- 🟡 `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/architecture/*.md` — likely to be distilled into a smaller set of evergreen policies.
- 🟡 `docs/projects/engine-refactor-v1/resources/spec/recipe-compile/examples/EXAMPLES.md` — examples need reconciliation with current `@swooper/mapgen-core/authoring`.

### docs/projects/mapgen-studio/** (examples + dev tooling)
- 🟡 `docs/projects/mapgen-studio/architecture-assessment.md` — useful constraints history; verify against current Studio.
- 🟡 `docs/projects/mapgen-studio/V0-IMPLEMENTATION-PLAN.md` — historical; likely drifted.
- 🟡 `docs/projects/mapgen-studio/VIZ-SDK-V1.md` — salvageable, but must match current `packages/mapgen-viz` and Studio.
- 🟡 `docs/projects/mapgen-studio/VIZ-LAYER-CATALOG.md` — salvageable intent; verify against actual produced layers.
- ✅ `docs/projects/mapgen-studio/BROWSER-ADAPTER.md` — browser adapter capability spec; aligns with current worker posture (`createMockAdapter`) and standard recipe “engine-coupled” boundaries.
- 🟡 `docs/projects/mapgen-studio/BROWSER-RUNNER-V0.1.md` — valuable design intent, but does not match current implemented protocol/cancel semantics; treat as proposal unless rewritten as “how it works today”.
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-RECIPES-ARTIFACTS.md` — contains useful patterns, but references deleted `packages/browser-recipes`.
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-CONFIG-OVERRIDES.md`
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-VIZ-DECKGL.md`
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-BROWSER-RUNNER.md` — some assertions about cancel/worker behavior are now outdated; treat as “agent notes” unless rewritten.
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-DUMP-VIEWER.md`
- 🟡 `docs/projects/mapgen-studio/resources/seams/SEAM-APP-SHELL.md`
- 🟡 `docs/projects/mapgen-studio/resources/SPIKE-mapgen-studio-arch.md` — exploration/history.
- 🟡 `docs/projects/mapgen-studio/reviews/REVIEW-M1.md` — review notes/history.

### Other projects
- 🟡 `docs/projects/mapgen-orographic-precipitation/spike-feasibility.md` — hydrology research; align with Hydrology direction.

### packages/** examples / READMEs
- ❌ `packages/sdk/README.md` — Civ7 modding SDK; not MapGen (ignore for this spike).

## Raw discovery
- `docs-inventory-auto.md` — noisy keyword scan to avoid missing buried references.
