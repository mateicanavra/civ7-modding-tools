# Adversarial Review: Product Authority Framing

## Scope

This lane reviewed the product-authority framing brief, corpus inventory,
MapGen architecture normalization packet, current rule-remediation action
matrix, and focused current MapGen docs. Source anchors were inspected only
where needed to validate a named contradiction or missing owner surface.

No source, rule, test, generated output, or packet files were mutated.

## Evidence Policy Used

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` is
  the active MapGen/Swooper Maps normalization baseline.
- Current canonical MapGen docs under `docs/system/libs/mapgen/**` are authority
  only where they do not conflict with the packet or explicitly defer to it.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json` is the
  machine-readable operational record for the current Layer 2 queue.
- Source is implementation/constructibility evidence, not target authority.
- Archive, research, old closed-slice prose, and generated output are discovery
  or proof evidence only unless promoted by a current authority source.

## P1 Concerns

### P1-1: Stage-kind authority is needed, but naming it as a new blueprint kind can duplicate existing truth/projection authority

Concern: The queued `standard-stage-kind-truth-projection-authority` slice is
real pressure, but a new standalone "stage-kind taxonomy" could over-name an
already accepted concept. The packet, policy docs, and domain references already
define truth vs projection and product/materialization semantics. The actual
missing surface is not the concept; it is the absence of a source-visible,
validator-readable classification on the standard recipe/manifest.

Evidence:
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  target shape separates Domain/Step/Stage/Recipe/Projection, and D5 says
  `map-ecology` is projection only.
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`: defines truth and
  projection, and disallows truth depending on projection-only surfaces.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`: names current stage
  order and says truth stages are primarily truth producers while `map-*` and
  `placement` are projection/engine-facing surfaces.
- `mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts`: source
  lists stage and step order, but no explicit `kind` or classification field.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: queues
  `prohibit_map_projection_dependencies_in_physics_contracts`,
  `prohibit_runtime_continent_contract_tokens`,
  `prohibit_hydrology_runtime_continent_step_tokens`, and
  `prohibit_map_morphology_legacy_plate_driver_dependencies` under the stage
  kind slice.

Synthesis constraint:
- Treat this as "make existing truth/projection/product classification
  mechanically visible" rather than "invent a new architecture ontology".
- Do not create a parallel taxonomy that can drift from
  `TRUTH-VS-PROJECTION.md`, `STANDARD-RECIPE.md`, and the normalization packet.
- If a positive assertion is added, it should derive from or annotate the
  standard recipe/contract manifest and validate stage contracts by existing
  concepts: truth, projection/materialization, and product/effect.

Evidence that would overturn this concern:
- A current source or accepted docs artifact already has stage kind metadata
  consumed by validators.
- A Layer 2 packet proves the existing docs/policies are insufficient because
  the desired checks need a distinct semantic category not reducible to
  truth/projection/product.

### P1-2: Gameplay, Placement, and Narrative names collide; overlay authority is a semantic gate, not an internally decidable cleanup

Concern: Current docs say Gameplay absorbs legacy Narrative and Placement
ownership, while current stage/source names still use `placement`, and action
matrix rows still discuss Narrative/hotspot overlay ownership. A synthesis that
asserts "Narrative owns story overlays" or "Morphology must not publish story
artifacts" as positive authority would force a product decision and duplicate
the documented Gameplay target unless it is framed as a known semantic gate.

Evidence:
- `docs/system/libs/mapgen/reference/domains/DOMAINS.md`: Gameplay is the
  target engine-facing integration domain; Placement and Narrative are legacy
  mappings.
- `docs/system/libs/mapgen/reference/domains/GAMEPLAY.md`: Gameplay absorbs
  legacy Narrative and Placement, with a carve-out that `domain/resources` owns
  resource planning.
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`: Placement remains
  the current gameplay-product vertical and names `domain/placement` and
  `domain/resources` owners.
- `docs/system/ADR.md` ADR-008: `domain/resources` owns resource planning; a
  future Gameplay consolidation may absorb starts/discoveries/wonders but does
  not re-own resources.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: queues
  `morphology-story-overlay-ownership-gate` and marks morphology/story overlay
  rows as sealed semantic blockers.

Synthesis constraint:
- Do not promote Narrative as a durable current owner without a new accepted
  decision.
- In the final authority frame, call this a naming/ownership gate:
  "Gameplay owns narrative/playability surfaces in target posture; current
  Placement remains a legacy/current stage and domain surface; resource planning
  is carved out to `domain/resources`."
- Keep Morphology overlay prohibitions scoped to physics-input boundaries unless
  a product owner decides story overlays can or cannot be Morphology byproducts.

Evidence that would overturn this concern:
- A current ADR or Gameplay domain doc records the exact owner for story overlay
  artifacts and hotspot publishing.
- Source removes the legacy/current naming split by consolidating the affected
  domains and stage surfaces.

### P1-3: Generated-zone authority is valid pressure, but output-text checks must not become product policy

Concern: The queued generated-zone/resource-derived package slice is pointing at
real repeated generated/protected-surface rules. The overclaim risk is making a
generic generated-zone authority that treats generated output text as source
truth, or duplicates existing owner-workflow, generated artifact, and
map-policy generator verification authority.

Evidence:
- `AGENTS.md`: generated artifacts and lockfiles are read-only and should be
  regenerated through scripts.
- `docs/system/libs/mapgen/policies/NORMALIZATION-GUARDRAILS.md`: guardrails
  prove only structural/source/doc categories, not generated mod output or
  future target architecture.
- `.agents/skills/civ7-product-authority/references/policy-map.md`: generated
  output is proof, not policy.
- `docs/system/libs/mapgen/reference/domains/PLACEMENT.md`: policy data flows
  from generated `@civ7/map-policy` tables, regenerated via the owning verify
  command; recipe code should not read `globalThis.GameInfo`.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: queues
  `block_hand_edits_to_generated_civ7_types`,
  `block_hand_edits_to_generated_map_policy_tables`,
  `ensure_map_policy_dependency_independence`, and
  `preserve_evidence_provenance_labels` together.

Synthesis constraint:
- Name separate concerns: protected generated surface, resource-derived package
  purity, generator/verify command ownership, and generated-output proof.
- Retire or demote output-text checks when generator/verify authority owns the
  same claim.
- Do not let generated output define editable source truth or product policy.

Evidence that would overturn this concern:
- A current product authority record states that a specific generated artifact
  is the canonical source for a particular public contract.
- The generator/verify path cannot express the provenance/label invariant, and
  a Habitat output check remains the only executable proof surface.

## P2 Concerns

### P2-1: Domain-operation generic surfaces are real, but a closed structure rule needs an exception model first

Concern: Ecology-only op topology and Foundation-only strategy/config rows are
clear local-proxy smells. However, a broad domain-operation topology authority
would overclaim unless it handles legitimate differences among domain roots,
ops, support folders, shared policy modules, and legacy/current domain names.

Evidence:
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`: defines op
  contracts, strategies, envelopes, and compile-time binding.
- `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`: steps orchestrate,
  domain ops compute, strategies encode variants, and exports should stay
  intentional.
- `docs/system/libs/mapgen/policies/IMPORTS.md`: recipe imports should use
  named domain surfaces; op strategy schemas belong beside the owning op or
  named op family.
- `docs/system/libs/mapgen/reference/domains/ECOLOGY.md`: Ecology has shared
  artifact surfaces, planner-local policies, and some permissive artifact
  schemas still marked implementation detail.
- Source directory inspection shows multiple operation root shapes:
  `mods/mod-swooper-maps/src/domain/ecology/ops/**`,
  `mods/mod-swooper-maps/src/domain/foundation/ops/**`,
  `mods/mod-swooper-maps/src/domain/hydrology/ops/shared`,
  `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared`,
  `mods/mod-swooper-maps/src/domain/resources/ops/**`, and
  `mods/mod-swooper-maps/src/domain/placement/ops/**`.

Synthesis constraint:
- Model "domain-operation" as a kind with allowed support-dir variants, not as
  one rigid file tree copied from Ecology.
- Separate topology, contract quality, strategy locality, config facade, and
  rules-entrypoint concerns. They may share an owner but they are different
  assertions.
- Keep Ecology artifact-schema tightening as intended/open until typed schemas
  and ownership are accepted.

Evidence that would overturn this concern:
- A current manifest or generator defines the domain-operation layout for all
  domains including support-dir exceptions.
- A source scan proves the domains already conform to one closed structure with
  no meaningful exceptions.

### P2-2: Helper-surface consolidation has source support, but generic utility centralization can become a dumping ground

Concern: The helper-surface queue is legitimate because helper redeclarations
appear in multiple domains. The risk is turning "avoid duplicate generic
helpers" into a broad shared-utils authority that violates the packet's
no-dumping-ground principle.

Evidence:
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  helper logic should colocate with nearest real owner; stage-neutral shared
  surfaces are allowed only with explicit invariant and consumers.
- `docs/system/libs/mapgen/policies/MODULE-SHAPE.md`: exported surfaces should
  be small and intentional.
- Source search found reusable math helpers in `packages/mapgen-core/src/lib/**`
  and local helper implementations in multiple domains, including
  `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts`,
  `mods/mod-swooper-maps/src/domain/hydrology/ops/compute-thermal-state/rules/index.ts`,
  and `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/util.ts`.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: queues
  `mapgen-helper-surface-authority-consolidation` for
  `prohibit_runtime_helper_redeclarations` and
  `prohibit_foundation_duplicate_math_helper_redefinitions`.

Synthesis constraint:
- Define the helper surface by invariant and consumers, not by folder name.
- Allow domain-local helpers when they encode domain semantics or are not
  generic enough for core.
- Use narrow helper families such as numeric clamps or grid helpers before
  asserting a broad "helper surface" blueprint.

Evidence that would overturn this concern:
- A current helper catalog already lists allowed generic helpers and consumers.
- A source audit proves all local redeclarations are generic duplicates with no
  domain-specific semantics.

### P2-3: Dependency/effect tag family authority should not strengthen the target-divergent recipe-root catalog

Concern: The tag-family queue is correct that root-catalog string scans are a
weak proxy. But current source still centralizes owner metadata in
`mods/mod-swooper-maps/src/recipes/standard/tags.ts`, while the packet says
recipe/domain catalogs are divergent and should dissolve into real owners or
explicit shared surfaces.

Evidence:
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  recipe-root `tags.ts`, multi-owner catalogs, and stale hubs are ownership
  drift; decompose broad catalogs after owners are clear.
- `docs/system/libs/mapgen/reference/TAGS.md`: tags must be registered and
  catalog names should describe owner/surface, not milestone.
- `docs/system/libs/mapgen/policies/DEPENDENCY-IDS-AND-REGISTRIES.md`:
  requires/provides strings must be registered/validated.
- `mods/mod-swooper-maps/src/recipes/standard/tags.ts`: current source defines
  `STANDARD_TAG_DEFINITIONS` and `EFFECT_OWNERS` centrally.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: queues
  `dependency-effect-tag-family-authority`, while warning not to strengthen the
  root-catalog token scan.

Synthesis constraint:
- Frame the desired authority as registered tag-family and owner validation,
  not as preservation of `tags.ts`.
- Treat `tags.ts` as current implementation evidence and a migration source,
  not the final owner unless a Layer 2 packet explicitly accepts it as a named
  shared surface.
- Split retired-token garbage collection from positive tag-family schema.

Evidence that would overturn this concern:
- A current decision accepts `tags.ts` as an explicit shared surface with
  invariant and consumers.
- Source already colocates tag family definitions with real owners and
  `tags.ts` is only an assembly barrel.

### P2-4: Standard-stage public config authority may duplicate an already-positive all-stage surface

Concern: The queued standard-stage public config slice is plausible, but the
matrix already records `verify_standard_recipe_public_authoring_surface` as
positive standard-stage public authoring authority over all stage models,
schemas, keys, and focus paths. A new slice could duplicate that rail unless it
parameterizes or supersedes it.

Evidence:
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md` D1:
  default stage config is flat; wrapper-only `advanced` is rejected.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`: flat stage surfaces
  are current posture; wrapper-only `advanced` has been removed.
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md`: stages
  compile `stage.surfaceSchema` into knobs and raw step configs.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: says
  `verify_standard_recipe_public_authoring_surface` already owns exact standard
  stage public keys, strict schemas, focus paths, and raw-envelope constraints.
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` still says each
  Foundation sibling stage has "knobs + advanced op config", which is ambiguous
  and can be misread as contradicting D1.

Synthesis constraint:
- Reuse or parameterize the existing public-authoring surface rail before
  creating a new authority.
- Treat "advanced op config" wording as stale/ambiguous unless source proves a
  persisted SDK-native `advanced` wrapper.
- Split exact retired Foundation token garbage collection from generic
  public-schema metadata rules.

Evidence that would overturn this concern:
- The existing `verify_standard_recipe_public_authoring_surface` rail cannot
  express the metadata/sentinel/config-bag predicate.
- A source inspection proves Foundation still has unique migration residue that
  cannot be covered by an all-stage surface.

### P2-5: Studio/platform mixed-owner rails need splitting, not one umbrella authority

Concern: The queued `studio-platform-mixed-owner-rails` slice groups adapter
imports, adapter generator capability, Studio UI/runtime artifact boundary,
dev-runner topology, and visualization build-output currentness. These are
adjacent but not one owner. An umbrella "Studio/platform" authority would hide
the actual owner split.

Evidence:
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md`: UI owns recipe
  selection, schema, run requests, and rendering; worker owns validation,
  compilation, execution, and events; generated `dist/` files are build proof,
  not editable product policy.
- `.agents/skills/civ7-product-authority/references/policy-map.md`: adapter
  calls and generated artifacts have distinct proof boundaries.
- `packages/civ7-adapter/src/civ7-adapter.ts`: value imports from
  `/base-standard/**` and engine globals are in the adapter implementation.
- `packages/civ7-adapter/src/types.ts`: adapter type surface documents
  official generator and runtime methods.
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: says
  `enforce_adapter_only_base_standard_imports` overclaims runtime by matching
  `import type` and declaration-file fixtures; it also queues Studio UI,
  devops, and build-currentness rows together.

Synthesis constraint:
- Split value-runtime import authority from type/provenance policy.
- Keep adapter capability/approved native generator surfaces separate from
  Studio UI/runtime boundaries.
- Route build-output currentness to Nx/package proof unless a structural
  Habitat invariant remains.

Evidence that would overturn this concern:
- A current platform authority record intentionally groups these surfaces under
  one owner and defines subclaims.
- Source shows one package boundary enforces all of these concerns without
  needing separate proof classes.

### P2-6: Public-domain test import authority has a known execution falsifier

Concern: `require_public_domain_surfaces_in_tests` cannot be converted to a
plain Grit source predicate under current execution because test files are
ignored. A synthesis that treats it as a normal static import rule will
overstate verification.

Evidence:
- `.habitat/workstreams/rule-remediation-layer1-action-matrix.json`: records an
  implementation falsifier from 2026-07-01: Habitat/Grit source execution obeys
  `.gritignore`, excluding `**/test/` and `**/*.test.ts`; a temporary forbidden
  deep import in a test file was ignored by Grit.
- `docs/system/libs/mapgen/policies/IMPORTS.md`: tests use public surfaces by
  default, but may deep import focused internals under test.

Synthesis constraint:
- Do not classify this as solved by Grit until test-file scanning is explicit.
- Split public-contract test expectations from legitimate internal test
  contexts.
- Treat the current script/test-file corpus as the proof surface until tooling
  changes.

Evidence that would overturn this concern:
- Habitat/Grit gains an explicit test-file scan capability and proves the test
  corpus is included.
- A Layer 2 packet narrows the rule to non-test public surfaces and routes test
  policy elsewhere.

## P3 Concerns

### P3-1: Legacy router pages are intentionally live paths to archive, not authority

Several top-level MapGen pages under `docs/system/libs/mapgen/` are live
routers whose bodies point to `_archive` content, including `architecture.md`,
`ecology.md`, `foundation.md`, `hydrology.md`, `hydrology-api.md`,
`morphology.md`, `narrative.md`, `placement.md`, and
`realism-knobs-and-presets.md`. They are stale-source hazards because search
hits make them look live.

Synthesis constraint: cite the canonical domain/reference pages instead of
these router pages, except when documenting archive migration status.

### P3-2: Research SPIKE docs produce normative-looking language but remain discovery material

Focused `rg` hits under `docs/system/libs/mapgen/research/**` contain many
"must/should/stage/domain/projection" claims. The corpus inventory did not name
research docs as current authority, and the source maps classify research-like
material as discovery unless promoted.

Synthesis constraint: do not use research SPIKE language as authority unless a
canonical doc, ADR, or accepted project baseline promoted it.

### P3-3: Historical in-game proof in Hydrology is useful but not current product closure

`docs/system/libs/mapgen/reference/domains/HYDROLOGY.md` includes dated
same-run Studio/Civ proof around river terrain/metadata surfaces. The page
itself says that proof is historical evidence and not the current product
closure path.

Synthesis constraint: preserve the proof boundary. It can support why terrain
rows and river metadata are separate, but not "in-game verified current
closure" for Hydrology as a whole.

### P3-4: Morphology elevation units are an acknowledged open contradiction

`docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` records an open
question: artifact schema wording says "integer meters" while base-topography
quantization operates in normalized units scaled by `DEFAULT_ELEVATION_SCALE =
100`.

Synthesis constraint: do not turn Morphology elevation units into normative
authority until the open question is resolved.

### P3-5: Closed-slice prose conflicts with current queued state in places

The action matrix contains closed historical slices that say some rows were
admitted or converted, while current `rules[]`, `slices[]`, and `gateState`
reopen broader Layer 2 authority work. The JSON `recordPolicy` says this file
is the only machine-readable operational source.

Synthesis constraint: use current `rules[]`, `slices[]`, `gateState`, and
`staleRules[]` as current state. Treat closed-slice prose as provenance unless
it agrees with current rows.

## Local-Proxy Risks To Preserve In Synthesis

- Single-domain rules for Foundation config bags, strategy locality, rules
  shims, and helper redeclarations probably indicate broader
  domain-operation/helper-surface authority.
- Ecology-only topology and contract-quality rules probably indicate
  domain-operation topology/quality authority, not Ecology uniqueness.
- Morphology-only runtime/projection token checks probably indicate
  truth/projection/stage-kind authority or retired-token garbage collection.
- Recipe-root tag scans probably indicate registered tag-family/owner authority,
  not root catalog authority.
- Studio recipe-DAG/UI artifact rows probably indicate UI-vs-worker/runtime
  boundaries, not DAG-only authority.

## Over-Naming Risks

- "Stage-kind taxonomy" can duplicate truth-vs-projection policy unless it is
  an executable classification surface.
- "Gameplay", "Placement", and "Narrative" can become three names for one target
  ownership space unless legacy/current naming is kept explicit.
- "Generated-zone authority" can duplicate generated artifact policy,
  owner-workflow policy, and package-specific generator verification.
- "Helper-surface authority" can become a generic shared-utils bucket unless
  scoped by invariant and consumers.
- "Domain-operation authority" can become too large unless split into topology,
  strategy, config, rules-entrypoint, and contract-quality subclaims.

## Recommended Synthesis Constraints

1. Start from accepted concepts already present in the packet and current docs:
   truth, projection/materialization, product/effect, domain operation,
   registered tag family, generated/protected surface, and public authoring
   surface.
2. Add a positive authority only when it enables validation or collapses
   multiple local proxies; otherwise record a stale-source or open-decision
   concern.
3. Keep "current implementation evidence" separate from "target authority" for
   `tags.ts`, generated outputs, Stage/Recipe manifests, and Studio build
   artifacts.
4. Preserve explicit carve-outs:
   `domain/resources` owns resource planning; Gameplay target absorption does
   not re-own resources; tests may have focused internal import contexts;
   adapter type/provenance policy is not the same as value-runtime import
   policy.
5. Do not use archive, research SPIKE docs, generated output, closed-slice
   prose, or historical in-game proof as current authority without a current
   promoted source.
6. When a candidate authority duplicates an admitted rail, prefer
   parameterizing, superseding, or retiring the existing rail over creating a
   second same-concept rule.

## P1/P2 Candidate Disposition

All P1/P2 first-pass contradiction candidates from the docs/action matrix have
either supporting provenance or a missing-evidence condition recorded above:

- Stage-kind/truth-projection pressure: supported by docs and source absence of
  explicit kind metadata; missing evidence is an existing consumed stage-kind
  manifest.
- Gameplay/Placement/Narrative overlay ownership: supported as a semantic gate;
  missing evidence is an accepted owner decision for story overlays/hotspots.
- Generated-zone/resource package authority: supported as repeated local proxy;
  missing evidence is whether generator/verify can own provenance labels fully.
- Domain-operation generic surfaces: supported by repeated local rows and mixed
  source shapes; missing evidence is a closed structure manifest with exception
  model.
- Helper-surface consolidation: supported by repeated helper implementations;
  missing evidence is a helper catalog or proof that all duplicates are generic.
- Dependency/effect tag-family authority: supported by root-catalog drift and
  current central source; missing evidence is an accepted shared-surface
  decision or colocated owner migration.
- Standard-stage public config: supported but duplicate-risky due existing
  positive public authoring rail; missing evidence is proof the existing rail
  cannot express the queued predicates.
- Studio/platform mixed rails: supported as mixed-owner queue; missing evidence
  is a current umbrella platform authority with explicit subclaims.
- Public-domain test imports: supported by recorded tooling falsifier; missing
  evidence is test-file scan capability or narrowed non-test authority.

## Skills Used

- investigation-design
- ontology-design
- civ7-architecture-authority
- civ7-product-authority
