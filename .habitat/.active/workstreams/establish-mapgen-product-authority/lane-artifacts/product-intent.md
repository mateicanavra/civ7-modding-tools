# Product Intent: MapGen / Swooper Maps

Lane: `establish-mapgen-product-authority`
Scope: non-mutating investigation of assigned canonical product docs and accepted project authority.
Date: 2026-07-01

## Evidence Policy

Authority order used for this artifact:

1. Root `AGENTS.md` routing and repo process rules.
2. Accepted project baseline for MapGen / Swooper Maps normalization:
   `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
3. Canonical evergreen docs:
   `docs/PRODUCT.md`, `docs/SYSTEM.md`, `docs/system/ARCHITECTURE.md`.
4. Canonical/domain MapGen and Swooper Maps docs in assigned scope.

Claim labels:

- **Accepted authority**: supported by the active authority stack and not contradicted by a higher source in scope.
- **Intended-but-not-built**: a desired target or sequencing call explicitly marked as not implemented or gated by future capability.
- **Source-only**: useful evidence from a lower/stale source that should not control future packets by itself.
- **Stale/superseded**: explicitly marked as transitional, legacy, archived, or superseded by the packet.
- **Open**: unresolved by assigned sources, requiring current code inspection, OpenSpec slice, ADR/deferral, or runtime proof.

## Load-Bearing Claims

### 1. MapGen / Swooper normalization has one active project baseline

Status: **Accepted authority**

Provenance:

- `AGENTS.md:96-100` routes MapGen / Swooper Maps work to `docs/system/mods/swooper-maps/`, `docs/system/libs/mapgen/`, and says the architecture-normalization packet is the active project baseline.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:1-13` declares itself `authoritative-project-baseline` and the single authoritative packet, superseding source/review/debate artifacts.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:60-93` says the packet wins over older project notes and identifies known stale sources.
- `docs/system/libs/mapgen/MAPGEN.md:47-56` says the doc spine is target-architecture-first and routes active normalization through the packet; OpenSpec changes are downstream implementation slices, not competing authority.

Tight claim:

Future Layer 2 packet authors should treat the normalization packet as the current control plane for product/architecture normalization decisions. Domain docs remain important but lose where the packet explicitly disagrees.

### 2. The repo product intent is programmatic, type-safe mod creation, not manual XML editing

Status: **Accepted authority**

Provenance:

- `docs/PRODUCT.md:7-25` defines Civ7 Modding Tools as a monorepo for Civilization VII modding that provides tools, documentation, and an SDK for creating mods programmatically rather than manually editing XML files.
- `docs/system/ARCHITECTURE.md:45-52` describes data flow from extracted game resources, through SDK-generated mod XML, into mod build outputs and direct control for runtime commands.
- `docs/SYSTEM.md:12-27` frames the workspace as packages, apps, colocated mods, and config.

Tight claim:

MapGen/Swooper Maps work sits inside a broader product promise: technical modders should author and verify Civ7 mods through typed source, generated outputs, reusable tooling, and explicit control surfaces, not hand-edited output artifacts.

### 3. MapGen is a deterministic pipeline with explicit ownership boundaries

Status: **Accepted authority**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:94-115` defines MapGen as a deterministic pipeline with domain, step, stage, recipe, compilation, execution, and projection/runtime ownership rows.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:108-115` names the two dominant invariants: recipe owns ordering, and truth/projection stay separate.
- `docs/system/libs/mapgen/reference/GLOSSARY.md:19-35` defines recipe authoring, recipe config, execution plan, step, stage, artifacts, fields, and truth vs projection vocabulary.

Tight claim:

Layer 2 packets should classify every change by owner: domain truth, step contract, stage authoring surface, recipe ordering, compile validation, execution behavior, or projection/runtime materialization. Current path shape and generated output are not product authority.

### 4. Recipe order is the source of global stage/step ordering

Status: **Accepted authority**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:102-114` says stages own authoring/config surfaces, recipes own global stage/step order, and dependency tags are gates rather than a separate topology engine.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md:46-52` says the standard recipe is authored through the MapGen authoring SDK, stage order is explicit in the recipe module, and the recipe uses tag and ops registries.

Tight claim:

Do not infer product ordering from docs lists, manifests, hidden `shouldRun` skips, dependency tags, or generated artifacts. The recipe array is the ordering authority; tags validate wiring.

### 5. The standard recipe is content-owned by Swooper Maps, while MapGen core owns the authoring/runtime mechanism

Status: **Accepted authority**

Provenance:

- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md:39-45` says the standard recipe is content-owned, lives under `mods/mod-swooper-maps/**`, and uses `@swooper/mapgen-core` for authoring/runtime mechanism.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:98-107` separates domain, stage, recipe, compilation, execution, and projection responsibilities.
- `docs/system/mods/swooper-maps/architecture.md:1-10` says the Swooper Maps page documents the mod architecture and is not canonical SDK documentation.

Tight claim:

The Swooper standard recipe is product content. The pure MapGen core must provide reusable mechanics and contracts, while mod-specific recipe content, map variants, and package generation remain owned by `mods/mod-swooper-maps`.

### 6. The accepted default stage config surface is flat and strict

Status: **Accepted authority**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:36-45` decision D1: use flat default stage config `{ knobs?, [stepId]?: stepConfig }`; no persisted SDK-native `advanced`.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:244-268` expands D1 and calls it a public recipe config migration affecting Studio, presets, docs, tests, and config examples.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md:21-37` says the page is transitional and follows the packet when conflicts arise.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md:91-123` says config is strict and stage-scoped; wrapper-only `advanced` surfaces are removed.

Tight claim:

Public recipe config should be flat by default and strict. `advanced` can be a UI grouping concept, but persisted SDK-native `advanced.<stepId>` is not the accepted product surface.

### 7. Truth artifacts and projection/materialization must not be collapsed

Status: **Accepted authority**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:108-115` says physics/domain stages publish truth artifacts while `map-*` and gameplay stages project them into engine fields, adapter calls, effects, and parity evidence.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:195-215` identifies truth/projection authority leaks and says to make truth artifacts explicit first, then add adapter materialization/readback, then gate parity.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md:86-90` says foundation/morphology/hydrology/ecology stages are primarily truth producers, while `map-*` and placement are primarily projection/engine-facing surfaces.
- `docs/system/mods/swooper-maps/architecture.md:29-50` says pipeline artifacts are canonical truth and map/placement stages project artifacts to engine state.

Tight claim:

Future packets should label every surface as truth, projection/materialization, parity evidence, or open. Engine projection/readback can prove materialization behavior; it must not silently become source truth.

### 8. Swooper Maps runtime intent is physics-first and deterministic

Status: **Accepted authority**, with some product-design specifics as **source-only** where they are only in the mod vision doc.

Provenance:

- `docs/system/mods/swooper-maps/architecture.md:29-39` says ecology, lakes, and placement are intentionally physics-first: pipeline artifacts are canonical truth, map/placement stages project them, hydrology projection evidence is map-owned, and drift is emitted at contract boundaries.
- `docs/system/mods/swooper-maps/vision.md:53-60` says ecology and placement are deterministic for a given seed/config, random generator authority is removed from active placement paths, hydrology lake planning is sink-driven by default, projection is downstream evidence only, and drift is instrumented.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:269-287` accepts deterministic lake intent as Hydrology-owned, while sequencing adapter stamping/readback before fail-hard parity.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:309-323` accepts deterministic typed placement intent plus typed rejection reasons, while rejecting naive `placed === planned` gates.

Tight claim:

The product wants deterministic authored intent for ecology, lakes, resources, discoveries, starts, and related placement surfaces. Civ7 feasibility still matters at materialization time, so rejections and drift must be typed and explainable rather than hidden behind official generators.

### 9. Terrain generation philosophy is layered fields, not direct stamping

Status: **Source-only** for detailed terrain ratios and algorithms; **accepted directionally** as Swooper Maps mod design intent.

Provenance:

- `docs/system/mods/swooper-maps/vision.md:41-52` sets goals: fix mountain-wall / hill-band / no-plains behavior, preserve tectonic grounding, separate plate simulation, heightfield, classification, and presentation/debugging, support multiple world styles, and emit metadata for future climate/biome/river/culture systems.
- `docs/system/mods/swooper-maps/vision.md:81-82` says terrain placement should flow through `orogeny -> elevation -> terrain`, not directly stamped mountains/hills.
- `docs/system/mods/swooper-maps/vision.md:102-116` describes percentile/slope terrain classification and distribution statistics.
- `docs/system/mods/swooper-maps/vision.md:209-214` says this guarantees mountains, hills, and a plains majority.
- `docs/system/mods/swooper-maps/vision.md:340-345` says the generator should honor plate boundaries, avoid giant linear mountain walls, distribute hills naturally, and guarantee healthy normal land.

Tight claim:

Swooper map quality is not just visual variety. The intended model is causal and inspectable: plates/boundaries feed orogeny, orogeny/noise feed elevation, elevation/slope feed terrain, and diagnostics prove distribution and drift.

### 10. Shipped map variants are canonical JSON configs that generate entrypoints and catalogs

Status: **Accepted authority**

Provenance:

- `docs/system/mods/swooper-maps/architecture.md:14-27` says shipped variants use canonical JSON map configs plus recipe selection; `*.config.json` files contain map id, display name, recipe id, sort order, latitude bounds, and full flat standard-recipe config; `gen:maps` validates and generates map entry modules, Civ7 map rows, modinfo imports, localization, and Studio catalog.
- `docs/system/ARCHITECTURE.md:49` says mods build to `./mod/` directories for game installation.
- `AGENTS.md:18` says generated artifacts such as `dist/` and `mod/` are read-only and regenerated via scripts.

Tight claim:

For shipped Swooper map variants, the source of product identity is JSON config plus recipe selection. Generated wrappers, map rows, localization, modinfo imports, Studio catalog entries, and `mod/` output are products of generation, not hand-authored policy.

### 11. Stages exist only for real product, authoring, handoff, placement, or projection surfaces

Status: **Accepted authority**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:116-145` defines the stage promotion rule and rejects folder/debug grouping/implementation seam as reasons to promote.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:288-307` says placement should split only at real product/effect boundaries, not helper-by-helper.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:325-348` accepts Ecology truth stages as `ecology-pedology`, `ecology-biomes`, and `ecology-features`, with `map-ecology` projection-only.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:349-358` says `map-*` stages are justified only as projection/materialization boundaries or should collapse into metadata/UI support.

Tight claim:

Future Layer 2 packets should reject stage proliferation for implementation variants, Studio grouping, debug navigation, or plausible future knobs. Stage identity must carry product/authoring/handoff/projection meaning.

### 12. Runtime/game-facing control and adapter boundaries must stay explicit

Status: **Accepted authority**

Provenance:

- `AGENTS.md:88-89` says runtime Civ7 control belongs in `@civ7/direct-control`; agents should not add alternate runtime transports or caller-local control scripts.
- `docs/system/ARCHITECTURE.md:50-52` says CLI, Studio, and future tools call `@civ7/direct-control` instead of owning tuner socket framing locally.
- `docs/system/mods/swooper-maps/architecture.md:46-50` says the adapter owns Civ7 feasibility checks and effect materialization, and resource readback mismatches are fail-hard drift evidence.
- `docs/system/mods/swooper-maps/architecture.md:104-106` says headless `InMemoryAdapter` was removed because the pipeline still depends on Civ7 engine globals, and direct control is the default repo-owned control path.

Tight claim:

Do not create local runtime transports or pretend pure/headless generation can prove game-facing materialization when Civ7 engine globals are required. Adapter/direct-control boundaries are part of the product guarantee.

## Desired Guarantees Future Packets Should Preserve

- **Typed authoring guarantee:** users author mods and maps through typed source contracts and strict config, not hand-edited generated output.
- **Determinism guarantee:** given the same seed/config and equivalent runtime inputs, MapGen-owned truth artifacts should be reproducible.
- **Truth/projection guarantee:** deterministic truth artifacts are distinct from Civ7 projection, adapter materialization, readback, telemetry, and generated mod output.
- **Ordering guarantee:** recipe order is explicit and authoritative; dependency tags validate execution wiring rather than creating a hidden topology engine.
- **Config guarantee:** default stage config is flat and strict; public surface transforms require genuine product semantics.
- **Stage identity guarantee:** stages represent real authoring, handoff, placement, enablement, trace, or projection surfaces.
- **Placement guarantee:** product placement plans are deterministic typed intent; runtime feasibility is reconciled with typed outcomes and rejection reasons.
- **Variant guarantee:** shipped Swooper map variants come from canonical JSON configs plus generation scripts.
- **Diagnostics guarantee:** distribution statistics, parity evidence, and drift records should make failures inspectable without promoting diagnostics to truth.
- **Runtime-boundary guarantee:** Civ7 engine-facing behavior belongs behind adapter/direct-control or explicit mod runtime integration.

## Contradictions, Stale Pressure, And Open Edges

### A. `docs/SYSTEM.md` still says Mapgen notes are archived

Status: **Stale pressure**

Provenance:

- `docs/SYSTEM.md:36-42` says "Mapgen notes are archived" and points to legacy Swooper Maps reference, while also listing Swooper Maps as large-scale procedural map generation.
- `AGENTS.md:96-100` and `docs/system/libs/mapgen/MAPGEN.md:47-56` identify live MapGen/Swooper docs and the active normalization packet.

Impact:

Packet authors should not use `docs/SYSTEM.md:36-38` to downgrade current MapGen docs. It is orientation drift against higher authority.

### B. `STANDARD-RECIPE.md` is useful but transitional

Status: **Stale pressure / accepted only where non-conflicting**

Provenance:

- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md:21-37` says the page records the current standard recipe surface but parts are transitional; if it conflicts with the packet, follow the packet and controlling OpenSpec slice.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:85-93` says `reference/STANDARD-RECIPE.md` still needs reconciliation with the live standard recipe.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:531-536` says guard scope is superseded by `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`, which was outside the assigned source scope.

Impact:

Stage lists and "current" recipe claims in `STANDARD-RECIPE.md` should be cited as transitional unless checked against current source or controlling OpenSpec slices.

### C. Swooper `vision.md` is product-rich but not canonical SDK documentation

Status: **Source-only for detailed algorithms and ratios**

Provenance:

- `docs/system/mods/swooper-maps/vision.md:1-9` says it is a working design doc for one mod's map style and not canonical MapGen SDK documentation.
- The same doc contains concrete targets and ratios at `docs/system/mods/swooper-maps/vision.md:41-60`, `docs/system/mods/swooper-maps/vision.md:102-116`, and `docs/system/mods/swooper-maps/vision.md:209-214`.

Impact:

Use the vision doc to preserve intent and quality bars, but do not promote every algorithm sketch or percentage into SDK/MapGen guarantees without code/spec acceptance.

### D. Lake truth is accepted, but fail-hard parity is intentionally sequenced

Status: **Intended-but-not-built / gated**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:269-287` says Hydrology should own deterministic lake intent, but fail-hard gates come only after adapter materialization/readback exists.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:465-485` says projection truth corrections are done when lake plan truth exists, placement consumes lake truth, and `map-*` stages either own projection/materialization or collapse.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:573-584` says the packet does not implement the refactor, claim in-game verification, or close projection limitations requiring adapter capability.

Impact:

Do not write Layer 2 acceptance criteria that require fail-hard lake parity before the adapter capability and lake truth artifact exist.

### E. Resource/discovery reconciliation is accepted as a target, but depends on adapter outcomes

Status: **Intended-but-not-built / gated**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:309-323` requires typed placement intent reconciliation and says D4 depends on adapter/materializer outcomes with per-tile placed items and typed rejection reasons.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:486-509` sequences placement decomposition and typed reconciliation late, after earlier contract and projection decisions.

Impact:

Layer 2 packets should design around typed outcomes, not naive count equality, but must not claim this target is fully implemented without source/test/runtime evidence.

### F. In-game verification is explicitly not claimed by the packet

Status: **Open for runtime proof**

Provenance:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:573-584` says the packet establishes baseline and sequencing but does not claim in-game verification.
- `docs/system/mods/swooper-maps/architecture.md:36-39` says drift is emitted and remains a strict-candidate gate until a post-hydrology authoritative land mask artifact is finalized.

Impact:

Product claims about gameplay correctness need separate in-game validation for the exact mod/game setup. The assigned docs support intent and architecture, not runtime success.

## High-Leverage Sources Outside Assigned Scope

These were named by assigned sources but were not inspected because the lane source scope was fixed:

- `docs/system/libs/mapgen/reference/REFERENCE.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/policies/POLICIES.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`
- `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`
- Current source anchors listed in `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md:140-145`
- Current source anchors listed in `docs/system/libs/mapgen/reference/GLOSSARY.md:44-49`
- OpenSpec changes under `openspec/changes/`

## Bottom Line For Layer 2 Packet Authors

Use the normalization packet as the active baseline, then use canonical MapGen/Swooper docs for standing domain vocabulary and product intent where non-conflicting. Preserve the product philosophy: deterministic, typed, inspectable map generation; causal field-based terrain; flat strict authoring surfaces; explicit recipe ordering; real product/effect boundaries; and honest truth/projection separation. Where adapter capability, current source, OpenSpec promotion, or in-game proof is missing, label the claim as open or gated instead of hardening it into a guarantee.
