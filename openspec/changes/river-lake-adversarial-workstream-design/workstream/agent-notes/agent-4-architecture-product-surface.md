# Agent 4: Architecture and Product-Surface Prosecutor

Date: 2026-06-09
Worktree: `wt-agent-mapgen-physical-rivers`
Branch: `codex/river-lake-adversarial-synthesis`
Lane: architecture, owner drift, and public-surface prosecution

## 1. Framed objective

### Frame

This lane is not deciding where code could go. That question is already settled
by repo architecture. The job here is to attack every remaining place where the
river/lake recovery train still behaves as if ownership were negotiable:
wrong-package placement, wrong-stage public knobs, legacy aliases, internal
selector parameters leaking upward, or policy-package creep.

### Active goal

Establish the clean owner map and product-surface contract for rivers and lakes
so the recovery train removes wrong public models instead of preserving them,
keeps Civ facts in the policy package only, and gives users only decoupled knobs
that map to real physical or projection abstractions.

### Hard core

- Architecture authority is already decided.
- Public authoring surface is not a museum for legacy config.
- Every knob must map to a real product abstraction with one owner.
- `@civ7/map-policy` owns shared Civ facts and compliance helpers, not MapGen
  hydrology or projection policy.

### In scope

- Owner map for Hydrology, `map-rivers`, `map-hydrology`, and `@civ7/map-policy`
- River/lake public knobs
- Legacy aliases and dead config surfaces
- Stage vs domain vs policy-package boundaries

### Exterior

- Re-designing the hydrology algorithm itself
- Runtime proof implementation details
- Minor-river writer discovery except where it changes knob/owner decisions

### Falsifier

This frame fails if current authority still leaves the owner model open, or if
there is real consumer evidence that preserving the legacy river surfaces is a
required public contract rather than repo-local debt.

## 2. Investigation brief

### Type

- Architecture/product authority audit
- Doc-vs-code reconciliation
- Public-surface and knob-model prosecution

### Evidence standard

Audit-grade for owner and contract claims.

### Authority order

1. Root `AGENTS.md`
2. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
3. `docs/system/mods/swooper-maps/adrs/adr-003-physics-truth-projection-boundary.md`
4. `docs/system/ADR.md` with ADR-008
5. current domain references and stage authoring docs
6. active OpenSpec redesign packet
7. live source/tests/configs

### Primary questions

1. What owns river/lake truth, projection, Civ facts, and public knobs?
2. Which live surfaces still preserve the wrong model?
3. Which knobs are legitimate product abstractions, and which are forbidden?
4. Does any remaining logic belong in `@civ7/map-policy`, or is that package
   already at the right boundary?

### Exclusions

- No code edits outside this note
- No speculative new owner folders
- No compatibility-preservation as a default

### Search geometry

- Start from accepted architecture/product authority
- Trace live public schema and compile surfaces
- Trace internal selector contract leakage
- Trace tests/configs to see which legacy surfaces still have repo force
- Compare against peer notes where helpful

### Stop conditions

- Stop when each river/lake concern has one owner, explicit non-owners, and a
  public-surface disposition: keep, delete, or forbid.

## 3. Notes / evidence log

### A. The architecture already decides the layers

- The normalization packet is explicit: domain owns pure semantics and rules,
  stage owns authoring/config surface and local composition, and projection /
  runtime owns engine materialization and verification, not domain truth.
  Ref: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md:94-145`
- ADR-003 says pipeline artifacts are authoritative truth and engine is
  projection only.
  Ref: `docs/system/mods/swooper-maps/adrs/adr-003-physics-truth-projection-boundary.md:13-24`
- ADR-008 says Hydrology owns canonical drainage truth, while `map-*` stages
  consume Hydrology truth for projection and must not synthesize fallback
  corridors.
  Ref: `docs/system/ADR.md:182-211`

### B. The active redesign packet already rejects the old river product model

- The execution redesign owner map assigns:
  - Hydrology: canonical routing, discharge, river class, lake intent
  - `@civ7/map-policy`: Civ facts and compliance tables
  - `map-rivers`: navigable river terrain subset selection from Hydrology truth
  - direct-control / Studio: rendered proof
  Ref: `openspec/changes/river-lake-adversarial-workstream-design/workstream/execution-redesign-plan.md:96-121`
- The same packet explicitly rejects:
  - `map-rivers.riverProjection.minLength/maxLength`
  - stage-owned selector semantics hidden behind `projection-policies/`
  - moving Hydrology selection logic into `@civ7/map-policy`
  - preserving broken legacy config because it already exists
  Ref: `openspec/changes/river-lake-adversarial-workstream-design/workstream/execution-redesign-plan.md:99-110`

### C. The live `map-rivers` surface is mostly right, but it still carries self-inflicted legacy debt

- `MapRiversPublicSchema` is intentionally empty and says public selector
  thresholds are not the product surface.
  Ref: `mods/mod-swooper-maps/src/recipes/standard/stages/map-projection-public-config.ts:58-65`
- The stage compiles one public knob into an internal selection profile:
  `map-rivers` reads the knob and compiles it into
  `selectNavigableRiverTerrain.strategy/config`.
  Ref: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts:11-46`
- But the same stage still accepts both `navigableRiverDensity` and
  `riverDensity`, with the latter described as a legacy alias.
  Ref: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/index.ts:11-20`
- The knob helper also preserves that alias and resolves it as equal to the
  current knob.
  Ref: `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/riverProjectionKnobs.ts:20-39`

### D. Internal selector semantics are correctly marked non-public

- The `hydrology/select-navigable-river-terrain` contract labels
  `endpointDischargePercentileMin` and `targetMajorTileFraction` as internal
  profile parameters, not the public authoring surface.
  Ref: `mods/mod-swooper-maps/src/domain/hydrology/ops/select-navigable-river-terrain/contract.ts:106-127`
- The active coherence design says the narrow public model is:
  - `map-rivers.knobs.navigableRiverDensity`
  - `hydrology-hydrography.knobs.riverDensity`
  - internal compiled selector defaults
  and explicitly rejects reintroducing `minLength/maxLength`.
  Ref: `openspec/changes/map-rivers-navigable-coherence/design.md:3-15`

### E. Shipped configs already abandoned the alias, so the alias is not carrying the product

- Catalog config tests assert shipped maps must not use the legacy alias and
  must use `navigableRiverDensity` or no density knob at all.
  Ref: `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts:460-473`
- The mountain comparison configs already use only `navigableRiverDensity`.
  Ref: `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts:450-457`
- The remaining alias force comes from tests that deliberately preserve it in
  compile behavior.
  Ref: `mods/mod-swooper-maps/test/hydrology-knobs.test.ts:212-244`

### F. The dead `riverProjection` threshold model is already treated as invalid

- Compile-error tests reject `map-rivers.riverProjection.minLength/maxLength`
  from the public config surface.
  Ref: `mods/mod-swooper-maps/test/standard-compile-errors.test.ts:427-445`
- The redesign packet classifies that threshold model as rejected history, not a
  contract to preserve.
  Ref: `openspec/changes/river-lake-adversarial-workstream-design/workstream/execution-redesign-plan.md:99-110`

### G. `@civ7/map-policy` is already on the right boundary

- The package router says it owns pure, deterministic Civ7 map policy facts and
  compliance helpers, and explicitly does not own MapGen physics, morphology,
  placement strategy, recipe order, or runtime calls.
  Ref: `packages/civ7-map-policy/AGENTS.md:1-9`
- The river constants file is exactly the right kind of content there: shared
  Civ river metadata values from live/runtime and official-data evidence, with a
  clear distinction between metadata and terrain rows.
  Ref: `packages/civ7-map-policy/src/river-constants.ts:3-19`

### H. There is still wording drift inside Hydrology that can pull the model backward

- The Hydrology domain reference still says `riverDensity` is a physical river
  network knob, but describes it using projection language and still documents
  the `map-rivers` alias.
  Ref: `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md:91-99`
- The shared Hydrology knob definition itself says `riverDensity` is a "river
  network projection density preset" and mentions "classification thresholds and
  length bounds." That language is stale against the current truth/projection
  split and against the rejection of public length-threshold modeling.
  Ref: `mods/mod-swooper-maps/src/domain/hydrology/shared/knobs.ts:100-118`

## 4. Findings, gaps, risks, and attacks

### Finding 1: there is no "lost land" for this code

The owner split is already decided:

- Hydrology owns canonical river/lake truth.
- `map-rivers` and `map-hydrology` own engine projection/materialization.
- `@civ7/map-policy` owns shared Civ facts/compliance tables.
- direct-control and Studio own rendered/runtime proof surfaces.

Any further "where should this live?" ambiguity is operator error, not missing
architecture.

### Finding 2: `map-rivers.knobs.riverDensity` is not a public contract worth preserving

This alias is the clearest remaining product-surface mistake.

Why:

- shipped configs already do not use it;
- the real product split now distinguishes physical network density from visible
  trunk density;
- leaving the alias alive teaches exactly the wrong mental model: that one knob
  name can ambiguously mean either hydrology truth or visible projection.

This is not user empathy. It is semantic sabotage.

### Finding 3: the right public river knob model is narrow, decoupled, and two-surface

Users should get:

- `hydrology-hydrography.knobs.riverDensity`
  - owner: Hydrology
  - meaning: physical network classification density
- `hydrology-hydrography.knobs.lakeiness`
  - owner: Hydrology
  - meaning: lake intent expansion posture over sink truth
- `map-rivers.knobs.navigableRiverDensity`
  - owner: `map-rivers`
  - meaning: Civ-visible navigable trunk projection density

That is the decoupled model. It lets users separately steer full river truth,
lakes, and the projected visible major-trunk subset.

### Finding 4: `minLength/maxLength` is not merely "legacy"; it is the wrong abstraction

Those thresholds are wrong because they speak in internal selector geometry
rather than product meaning. They force multiple behaviors to move together and
teach users to tune symptoms instead of the actual abstractions:

- physical network density,
- lake posture,
- visible major-trunk density.

That surface should stay dead.

### Finding 5: internal selector parameters must remain internal unless a new product abstraction is proven

The current internal parameters:

- `endpointDischargePercentileMin`
- `targetMajorTileFraction`

are acceptable as compiled profile internals. They are not public knobs today.

Exposing them now would recreate the exact failure pattern the user called out:
coupled engine-adjacent config pretending to be author meaning.

### Finding 6: `@civ7/map-policy` is not where river-selection behavior belongs

That package should keep owning shared facts like:

- `NO_RIVER`, `RIVER_MINOR`, `RIVER_NAVIGABLE`
- generated catalog/type surfaces derived from the same evidence
- compliance helpers when the same Civ rule matters in multiple consumers

It must not absorb:

- hydrology routing rules
- navigable subset selection profiles
- map-stage materialization policy
- Earth benchmark tuning

Those are MapGen domain or stage concerns, not Civ fact tables.

### Gap 1: alias-preserving tests and docs still exert the wrong design force

The repo currently says two different things:

- "the public model is narrow and the old surfaces are rejected"
- "the old alias is still supported"

That split keeps future operators in compatibility-preservation mode.

### Gap 2: Hydrology wording still leaks projection language into a truth knob

If `hydrology-hydrography.knobs.riverDensity` is a truth knob, it should not be
described as projection density or as length-bound tuning. That language will
pull future work back toward the discarded threshold model.

### Attack 1: stop calling the alias migration behavior unless a consumer gate exists

There is no evidence in this lane that an external consumer still requires
`map-rivers.knobs.riverDensity`. Current evidence says the opposite: shipped
configs already moved off it.

Absent a real consumer gate, the alias is just self-hosted drag.

### Attack 2: do not "help users" by exposing more engine-shaped knobs

Forbidden public knobs:

- `map-rivers.riverProjection.minLength`
- `map-rivers.riverProjection.maxLength`
- `map-rivers.endpointDischargePercentileMin`
- `map-rivers.targetMajorTileFraction`
- raw fallback/corridor toggles
- direct minor-river metadata toggles while the writer boundary is unresolved

Each of those is either internal selection machinery or an unresolved runtime
capability, not a stable product abstraction.

### Attack 3: lakes should not gain projection knobs just because rivers have one

Current architecture is coherent:

- Hydrology owns `lakeiness`
- `map-hydrology` owns projection, with no extra author-facing knobs

Do not invent a `map-lakes` projection knob family unless a genuine projection
surface exists that is decoupled from hydrology truth and meaningful to users.

## 5. Recommended workstream changes and explicit owner map

### Recommended change set A: delete the `map-rivers.knobs.riverDensity` alias

Why:

- shipped configs are already clean;
- the alias preserves the wrong mental model;
- the architecture already provides the replacement surface.

Required follow-through:

- remove alias acceptance from `map-rivers` stage schema and resolver;
- delete alias-preserving tests;
- remove alias wording from docs/specs;
- if a real external consumer exists, record that gate explicitly instead of
  silently preserving the alias.

### Recommended change set B: tighten Hydrology knob language to truth semantics

Repair wording drift so Hydrology docs and schemas say what the knob actually is:

- physical river-network classification density
- not projection density
- not length-bound tuning

This is small, but it matters. Vocabulary drift is how the wrong architecture
re-enters.

### Recommended change set C: keep `map-rivers` public surface narrow

Public river/lake knobs should be:

- `hydrology-hydrography.knobs.riverDensity`
- `hydrology-hydrography.knobs.lakeiness`
- `map-rivers.knobs.navigableRiverDensity`

No public `riverProjection` object. No threshold bags. No exposed selector
envelopes.

### Recommended change set D: keep `@civ7/map-policy` limited to shared Civ facts

Allowed:

- river metadata enums and generated type/catalog synchronization
- shared Civ compliance helpers used by more than one consumer

Forbidden:

- physical hydrology policy
- visible-river selection profiles
- stage compile logic
- proof closure logic

### Recommended change set E: add hard authoring-surface guardrails

The repo should enforce all of these:

- no live public schema path for `map-rivers.riverProjection`
- no live public alias `map-rivers.knobs.riverDensity`
- no public `strategy` / `config` envelope leakage for river projection
- no `minLength/maxLength` references in live river authoring docs except as
  rejected history

### Explicit owner map

| Concern | Owner | Non-owners | Public surface |
| --- | --- | --- | --- |
| Canonical drainage routing, discharge, river class, lake intent | Hydrology domain | `map-rivers`, `map-hydrology`, `@civ7/map-policy` | `hydrology-hydrography.knobs.riverDensity`, `lakeiness` |
| Civ river metadata values and generated shared constants/types | `@civ7/map-policy` and generated Civ types | Hydrology routing, `map-rivers` selector logic | no user knob |
| Visible navigable trunk projection authoring | `map-rivers` stage | Hydrology truth stages, policy package | `map-rivers.knobs.navigableRiverDensity` |
| Internal navigable-subset selector parameters | Hydrology op contract consumed by `map-rivers` compile | public config, policy package | none |
| River terrain stamping, validation, readback | `map-rivers` step + adapter | Hydrology truth, policy package | no user knob |
| Lake materialization/readback | `map-hydrology` stage + adapter | Hydrology truth owner, policy package | no projection knob today |
| Rendered proof and closure | direct-control, Studio/server proof, OpenSpec acceptance | map steps, policy package | no user knob |

## 6. Final synthesis

The architecture answer is already known, and the remaining product-surface
mistakes are local debt, not open questions. The most important correction from
this lane is simple:

- keep `@civ7/map-policy` small and factual,
- keep Hydrology responsible for physical truth knobs,
- keep `map-rivers` responsible for one visible-trunk projection knob,
- delete the legacy alias and keep `minLength/maxLength` dead.

If we do not delete those wrong surfaces, we will keep re-importing the wrong
model even after the upstream hydrology work is fixed.

Skills used: `framing-design`, `investigation-design`, `civ7-architecture-authority`, `civ7-product-authority`, `civ7-systematic-workstream`, `civ7-open-spec-workstream`.
