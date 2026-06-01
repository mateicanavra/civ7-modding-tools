# Source Material Notice

This document is preserved for provenance only. The active normalization
authority is `../architecture-normalization-packet.md`.

# MapGen Architecture Normalization Decisions (Codex Owner Pass)

Status: `source-material-only`
Date: `2026-05-29`
Working branch: `codex/resolve-normalization-decisions`
Packet branch: `codex/normalize-architecture-packet`

This is an independent decision document for resolving D1-D5 and 0e in
`../architecture-normalization-packet.md`.

It does not edit or supersede the packet. It is the sign-off artifact for the
next packet update.

## Scope

Resolve these open decisions:

- D1: SDK-native `{ knobs?, advanced? }` stage surface.
- D2: Hydrology-owned lake truth vs engine-derived lakes.
- D3: Placement decomposition into contract-bounded sub-steps.
- D4: Resource/discovery authority and fail-hard verification.
- D5: Ecology phase/stage/step decomposition.
- 0e: `@mapgen/*` import policy and guardrail G4.

Method:

- Current worktree and current source are implementation evidence.
- Existing packet and sibling Claude review are discovery/provenance, not
  authority.
- Civ7 official resources under `.civ7/outputs/resources` are game-data
  evidence. No Civ6 reference model is used.
- Reviewers were intentionally split into disjoint, adversarial, and Civ7/game
  grounding passes. The final decisions below are the owner/steward synthesis,
  not a vote.

## Decision Vocabulary

The packet needs these terms locked before implementation:

- **Phase**: a conceptual world/gameplay layer. It has no required code unit
  today. Example: "ecology phase." A phase groups causal meaning.
- **Stage**: a concrete recipe authoring and wiring boundary. A stage exists
  when a group of steps needs distinct external wiring: dependencies,
  produced artifacts/effects, projection boundary, author surface, or
  independently toggleable recipe posture.
- **Step**: the executable contract unit inside a stage. A step owns
  `requires`/`provides`, artifacts, config schema, op bindings, and one bounded
  orchestration responsibility.

Consequence: do not split into stages merely because a domain has many
sub-concerns. Split into stages when the recipe graph needs distinct wiring.
Otherwise use steps inside a stage and ops inside steps.

## Reference Model

The right reference model is contract-first implementation:

- ORPC contract-first docs describe defining the API shape once, then using
  `implement(contract)` for type-checked implementation. See
  https://mintlify.wiki/middleapi/orpc/server/contract/overview.
- MapGen's analog is: steps own contracts; stages compose steps and expose an
  author surface; recipe compilation validates and normalizes step config.

The important lesson is not that ORPC maps 1:1 to MapGen. It does not. The
lesson is that implementation should bind to declared contracts rather than
creating parallel "simple" and "advanced" schema systems.

## First-Principles Heuristic

The user's structural-first instinct is mostly right, but "structure" means
contract boundaries and ownership vocabulary, not file moves.

Apply structural-first to:

- D1, because SDK surface and validation rules control every later stage
  cleanup.
- 0e, because import policy controls which module boundaries are enforceable.
- D3, because D4 cannot be verified while placement hides many concerns behind
  one broad step.

Do not apply file-move-first to:

- D5, because current seven-stage ecology may be over-split relative to the
  phase/stage/step definition.
- D4, because splitting placement before deciding resource/discovery authority
  can bake in the wrong contracts.
- D2, because a lake truth artifact without adapter materialization/readback is
  just another unverified assertion.

## D1: SDK-Native `{ knobs?, advanced? }`

Decision: **Yes. The SDK should natively own `{ knobs?, advanced? }` for
default/no-public stages.**

### Scope

For stages that do not define a custom `public` schema, `createStage` should
expose:

```ts
{
  knobs?: <stage knobs>;
  advanced?: {
    [stepId]?: <partial step config input>;
  };
}
```

`advanced` is reserved alongside `knobs`. Step ids cannot be `knobs` or
`advanced`. Custom Shape-B stages (`public + compile`) do not receive an
implicit advanced merge path.

### Why It Matters

Five standard stages currently hand-write the same `advanced` public schema
and unwrap `compile`:

- `morphology-routing`
- `morphology-erosion`
- `morphology-features`
- `morphology-coasts`
- `map-hydrology`

That makes authoring style look like a local convention rather than SDK
contract. It also leaves the no-public fallback surface weak:
`packages/mapgen-core/src/authoring/stage.ts` currently uses `Type.Unknown()`
per step in the default surface.

### Rationale

The SDK can hide this cleanly, so it should. `advanced` is not a domain concept;
it is the SDK's expert override namespace for per-step config. Requiring stage
authors to hand-write it produces boilerplate and increases drift.

This preserves the contract-first model:

- Step contracts still own config schemas.
- Stage surface is only the authoring input shape.
- Recipe compilation still runs stage surface validation first, then op-default
  prefill, strict step schema validation, step normalization, op normalization,
  and final strict validation.

### Strongest Alternative

Keep explicit `public + compile` for `advanced` on every stage.

This is superficially more explicit, but it makes the common case noisier and
normalizes a pattern where every stage reimplements the same unwrap transform.
It also conflicts with the DX target: `foundation` already shows that the
default path should be nearly ceremony-free.

### Buts And What-Ifs

- **What if native advanced becomes magic?** It is acceptable magic because it
  is schema-derived from step contracts, reserved by the SDK, and visible in
  generated config schemas.
- **What if a stage needs a curated surface?** Use `public + compile`. That is
  the exception for genuine transforms.
- **What if a Shape-B stage also wants advanced?** Do not provide a second
  implicit path. Either make the public keys be step ids and return to the
  default surface, or own the custom transform explicitly.
- **What about partial config/defaults?** Do not strict-validate raw partial
  `advanced` entries against full step schemas before defaults/prefill. Preserve
  the existing two-phase validation behavior unless a correct partial authoring
  schema is introduced.

### Implementation Consequences

D1 requires SDK, Studio, tests, docs, maps/configs, and generated/source recipe
artifact migration. It is a public config contract change, not a small helper
cleanup.

## D2: Hydrology-Owned Lake Truth

Decision: **Yes, Hydrology should own deterministic lake intent, but the
fail-hard claim is not valid until adapter materialization/readback and
placement input migration exist.**

### Scope

Hydrology should publish an engine-agnostic lake plan artifact. `map-hydrology`
should project/materialize that plan into Civ7 terrain and verify drift.
Placement should consume the Hydrology lake plan, not the engine-derived
`engineProjectionLakes` artifact.

### Why It Matters

Current code delegates lake creation to Civ7:

- `map-hydrology/steps/lakes.ts` calls `context.adapter.generateLakes(...)`.
- The step publishes engine deltas as `engineProjectionLakes`.
- The comments explicitly demote hydrology sink mismatch to telemetry.
- `plan-lakes` exists only as a contract stub.

Placement then reads `engineProjectionLakes` as `lakePlan`, so downstream
gameplay planning currently depends on engine projection output.

### Civ7 Grounding

Civ7 maps define lake tuning values in `maps.xml` (`LakeSizeCutoff`,
`LakeGenerationFrequency`). Civ7 map scripts call `generateLakes`, then rebuild
areas/elevation/rainfall/rivers/water state before downstream systems. Civ7
start scoring also treats `GameplayMap.isLake(...)` as gameplay-relevant state.

So lakes are not cosmetic. They affect downstream map quality and placement.

### Rationale

For a physics-based map generator, lakes are hydrology truth. The engine may be
the materialization target, but it should not invent the surface after the
pipeline claims to model hydrography.

The current plan must not simply equate `sinkMask` with final lake truth.
Civ7's own lake generator is not sink-driven; it applies terrain/water/coastal/
impassable checks plus randomness. The Hydrology lake planner must be a real
lake-intent model, not a renamed diagnostic mask.

### Strongest Alternative

Keep lakes engine-owned and rename every pipeline lake artifact to projection
or telemetry.

This is coherent and lower effort. It would also align with current behavior.
But it weakens the physics-engine ambition, keeps placement dependent on engine
generation, and conflicts with Swooper's accepted truth/projection ADR unless
that ADR is explicitly superseded.

### Buts And What-Ifs

- **What if adapter cannot stamp lakes directly?** Then D2 cannot close. The
  docs must keep engine lakes labeled as projection limitation until the adapter
  supports materialization/readback.
- **What if the lake planner differs from Civ7?** That is acceptable only if it
  is a deliberate Swooper physics model. If Civ7 compatibility is required, the
  planner should model Civ7 legality or use adapter legality checks.
- **What if fail-hard breaks maps too often?** Then the lake plan/materializer
  contract is wrong or incomplete. Do not soften the gate silently; either fix
  the contract or document engine-owned projection.

### Implementation Consequences

D2 should land after D1/0e and after the lake artifact contract is explicit. It
must include:

- Implement `plan-lakes` with `index.ts`, `types.ts`, strategies, and tests.
- Add or expose adapter lake stamping/readback needed for parity.
- Migrate placement input derivation off `engineProjectionLakes`.
- Update or close DEF-020 and reconcile Swooper ADR-003 with current docs.

## D3: Placement Contract Decomposition

Decision: **Yes. Split placement into contract-bounded steps, but split by
stable product contracts, not mechanically by every helper block.**

### Scope

The `placement` stage should remain the gameplay/placement stage unless a
sub-concern needs distinct recipe-level wiring. The broad final placement step
should be decomposed into steps with explicit artifacts/effects and failure
boundaries.

### Why It Matters

`applyPlacementPlan` already contains an internal `runPlacementStep(...)`
harness for:

- natural wonders
- floodplains
- terrain validation
- area recalculation
- water cache storage
- landmass region restamp
- resources
- starts
- discoveries
- fertility recalculation
- advanced start assignment

That is the code admitting there are boundaries, but keeping them invisible to
recipe compilation, config, trace, and dependency validation.

### Rationale

The split is necessary because D4 cannot be reasoned about while resources and
discoveries are hidden in one broad apply step. Contract-bounded steps give us
explicit inputs, outputs, effect tags, and verification points.

However, not every helper block deserves a stage or even a public step. Engine
maintenance operations such as `validateAndFixTerrain`, `recalculateAreas`,
`storeWaterData`, and `FertilityBuilder.recalculate` may be transaction details
unless they publish durable artifacts/effects consumed elsewhere.

### Strongest Alternative

Keep placement as one apply step and document the internal transaction.

This minimizes churn and preserves behavior. It loses because placement is now
the main hidden sub-pipeline in the repo. It prevents meaningful guardrails,
trace boundaries, and authority decisions for resources/discoveries.

### Buts And What-Ifs

- **What if splitting changes behavior?** Split one product boundary at a time,
  preserving order and engine maintenance calls inside the relevant step until
  proven safe to extract.
- **What if there are many tiny steps?** Do not split internal maintenance into
  first-class steps unless downstream dependencies need them.
- **What if resources/discoveries remain official-primary?** They still deserve
  explicit steps, but their artifacts must be named as diagnostics/constraints,
  not authoritative plans.

### Implementation Consequences

First-class candidate steps:

- `place-natural-wonders`
- `project-landmass-regions` or keep existing `plot-landmass-regions`
- `place-resources`
- `assign-starts`
- `place-discoveries`
- `assign-advanced-starts`

Transactional operations can stay inside those steps until a concrete consumer
requires independent effect tags.

## D4: Resource/Discovery Authority

Decision: **Target plan-authoritative resources/discoveries, but only after
Civ7 eligibility is modeled or delegated as an explicit legality oracle. Do
not ratify `placed === planned` as sufficient.**

### Scope

Resource and discovery plans can be authoritative only when the pipeline owns
typed placement intent and projection can verify exact outcomes: type, location,
and acceptance/rejection reason. Count equality alone is not enough.

### Why It Matters

Current code says official generators own final feasibility:

- discovery apply calls `generateOfficialDiscoveries(...)` and only validates
  finite/nonnegative placed count.
- resource apply calls `generateOfficialResources(...)` and only observes a
  placed count.
- ADR-ER1-020 explicitly says placement output counts are best-effort
  placeholders, not authoritative engine read-backs.
- Current placement docs say official resource/discovery generators are primary.

At the same time, Swooper ADR-003 says resource/natural wonder/discovery
placement is deterministic and plan-stamped. Those authorities conflict.

### Civ7 Grounding

Civ7 resource generation is real game logic, not a dumb materializer. It uses:

- `ResourceBuilder.getGeneratedMapResources(...)`
- landmass region eligibility
- Poisson scatter
- `ResourceBuilder.canHaveResource(...)`
- age-required resources and minimum-per-landmass rescue
- map-specific island resource replacement behavior

Civ7 discovery generation is also real game logic. It uses:

- age flags and discovery sifting options
- narrative-story availability
- distance from starts
- water/terrain/resource/natural-wonder exclusions
- visual/activation pools
- `MapConstructibles.addDiscovery(...)`

If Swooper replaces these generators, it must own those semantics or explicitly
delegate legality to adapter calls.

### Rationale

The target architecture should be plan-authoritative because this is a robust
map-generation SDK, not an engine-random wrapper. But the target is only
defensible when the plan contains enough typed intent and the adapter can prove
materialization.

Therefore D4 is a two-part decision:

1. Target: Swooper-owned typed resource/discovery plans are authoritative.
2. Gate: official generators remain primary until Civ7 legality is modeled or
   exposed as adapter legality/materialization APIs.

### Strongest Alternative

Keep official generators primary permanently and demote Swooper plans to
diagnostics or constraints.

This is defensible if the product goal is Civ7 fidelity over deterministic
ownership. It is also lower risk because official generators already encode
age, data-table, and legality behavior. But it must be explicit: supersede or
qualify Swooper ADR-003 and rename artifacts/docs so they do not claim
deterministic truth.

### Buts And What-Ifs

- **What if official generator behavior is too complex to port?** Then use the
  adapter as a legality oracle and materializer, but the plan must still be a
  typed list of intended placements.
- **What if exact verification is impossible?** Then D4 cannot close as
  plan-authoritative. Keep official-primary and label outputs accordingly.
- **What if `placed === planned` passes?** It proves too little. The wrong
  resource or discovery type could be placed in the wrong location with the
  right count.
- **What if plans are useful before they are authoritative?** Keep them, but
  call them diagnostics, candidate plans, or constraints until exact
  materialization exists.

### Implementation Consequences

D4 should come after D3 has exposed resource/discovery boundaries. The closure
gate is:

- typed plan includes location and resource/discovery identity;
- adapter can stamp or reject each planned item with reason;
- readback or materialization result verifies exact type/location, not only
  count;
- placement docs, ADR-ER1-020, Swooper ADR-003, and domain references agree.

## D5: Ecology Phase/Stage/Step Decomposition

Decision: **Target multiple ecology truth stages based on distinct
input/handoff surfaces, plus `map-ecology` as the projection/materialization
stage. Do not preserve the current seven-stage feature-family split as the
final answer.**

### Scope

The ecology phase should remain a conceptual phase. Concrete stage boundaries
should follow unique wiring and authoring surfaces, not current directories or
feature family names.

Recommended target:

1. `ecology-pedology`
   - Steps: pedology, resource basins.
   - Produces soils/pedology and resource basin truth.
2. `ecology-biomes`
   - Steps: biomes and any retained biome-edge refinement.
   - Produces biome classification truth.
3. `ecology-features`
   - Steps: feature substrate/score layers if needed, then plan ice, reefs,
     wetlands, vegetation, plus merge/finalize if needed.
   - Produces score/substrate artifacts when they are useful handoffs, feature
     intent artifacts, and final occupancy.
4. `map-ecology`
   - Projection/materialization stage.
   - Steps: plot biomes, apply features, plot effects.

Naming can change, but the boundary pattern should not: ecology truth is split
by concrete input/handoff surfaces, and map-facing writes stay in
`map-ecology`.

### Why It Matters

The current recipe has seven ecology truth stages:

- `ecology-pedology`
- `ecology-biomes`
- `ecology-features-score`
- `ecology-ice`
- `ecology-reefs`
- `ecology-wetlands`
- `ecology-vegetation`

Current code also has a stale `stages/ecology/` hub. Some stages import steps
from that sibling hub. Several feature stages are single-step wrappers with
empty knobs and nearly identical wiring. That proves split-brain layout, but it
does not prove seven stages are the right target.

### Civ7 Grounding

Civ7 feature/biome generation separates biome classification from feature
placement concerns, but it does not imply one recipe stage per feature family.
The useful split is between ecology truth and map projection/materialization,
with feature families modeled as bounded planning steps.

### Rationale

The current seven-stage split over-indexes on feature-family names rather than
stage-level input and handoff surfaces. The old one-stage `ecology` docs
under-index on those surfaces. The corrected owner call is therefore: keep
multiple named ecology truth stages, but make the split follow concrete
input/handoff boundaries:

- substrate truth feeds placement and projection;
- feature score/substrate seams feed feature-intent planners when planners
  need shared visibility;
- feature intents feed map-ecology feature materialization;
- map-ecology writes engine-facing fields/effects.

The domain-operation input concern is real but precise: domain ops consume
plain data inputs, while steps read artifacts/runtime state and build those op
inputs. Splitting stages does not directly shrink op input schemas; splitting
steps and op-input builders does. Stage boundaries matter when they name which
artifact families and authoring/knob surfaces belong together. By that rule,
pedology and biomes are useful stage surfaces. Feature scoring and feature
intent planning are useful step/artifact seams, but they should remain inside
one `ecology-features` stage unless score/substrate work gains a distinct
stage-level authoring surface, independent enablement/review identity, or a
real recipe insertion point between scoring and planning. Ice, reefs, wetlands,
and vegetation also remain steps inside feature planning until they gain
distinct stage-level surfaces.

### Strongest Alternatives

**Collapse to one `ecology` truth stage.** This simplifies recipe order and
keeps step contracts visible, but it makes the ecology authoring surface too
broad. It also hides the important distinction between pedology, biome
classification, and feature planning as input/handoff surfaces.

**Split feature scoring and feature intents into separate stages.** This names
the substrate/planning distinction, but it overstates the current boundary.
Score layers are a good internal handoff and may deserve a durable artifact;
that does not automatically make them a recipe stage. Promote this split only
if score/substrate has its own knobs, review gate, external consumer, or an
intervening stage that must run before feature planning.

**Keep all seven current stages.** This is closer to current code and makes each
feature family independently visible. It loses because most current feature
wrappers have identical author surfaces and are ordered by occupancy artifact
daisy-chain, not distinct recipe wiring.

**Collapse to one opaque `ecology` implementation.** This simplifies recipe
order but hides feature planning topology and fights the SDK's contract-first
execution model. This is not the recommended one-stage shape; the recommended
shape is one stage with many explicit steps.

### Buts And What-Ifs

- **What if we need per-feature toggles?** Put toggles in
  `ecology-features` and per-step overrides first. Promote a feature
  family to a stage only if it needs its own authoring surface, enablement, or
  recipe insertion point.
- **What if scoring needs to be reusable?** Publish an explicit
  score/substrate artifact from a step inside `ecology-features`. Reuse of an
  artifact is not enough by itself to split a stage; the split needs a distinct
  authoring, enablement, review, or ordering reason.
- **What if feature stages need independent viz/trace?** Steps already provide
  trace/artifact boundaries. Stage split is not required for observability.
- **What if docs already say single ecology?** Update docs to the new
  phase/stage/step vocabulary and replace the one-truth-stage statement with
  the input/handoff-stage decomposition.
- **What if the recipe already has seven stages?** Current recipe shape is
  implementation evidence. It is not sufficient architecture authority.

### Implementation Consequences

Before moving files, build a connection table for ecology units:

- external inputs
- artifacts/effects produced
- downstream consumers
- authoring surface
- whether independent enablement is required

Then land D5 as a topology update before source-layout cleanup. The old
`stages/ecology/` hub should be dissolved into stage-local files or a
stage-neutral shared surface; sibling imports from wrapper stages should
disappear. Current `ecology-ice`, `ecology-reefs`, `ecology-wetlands`, and
`ecology-vegetation` wrappers should collapse into `ecology-features`
unless they gain concrete stage-level surfaces.

### Map-Ecology And Map-Dash Back-Application

Decision: **Keep `map-ecology` only as a projection/materialization stage. Do
not use `map-*` stages as a way to expose implementation details or satisfy
Studio navigation.**

The reason `map-ecology` survives the stage test is not that it is convenient
for Studio, and not that "map" work is inherently a separate stage. It survives
because it is the authority boundary between Ecology truth and Civ7/gameplay
materialization:

- it consumes Ecology truth artifacts;
- it applies engine-facing biome ids, features, and plot effects;
- it emits `field:*`, `effect:engine.*`, and `effect:map.*` guarantees;
- it records projection/parity diagnostics after adapter interaction.

History supports this reading. Commit `c8a90c882` moved Hydrology and Ecology
projection out of truth stages and into `map-*` stages. That was a
truth/projection correction: adapter-facing feature application, biome binding,
plot effects, lakes, and rivers moved into Gameplay/map-owned stages. Later
parity work (`453186387`) added observe-first diagnostics across these
projection stages. Those commits do not show a Studio-only rationale.

The SDK/Studio implication is important: Studio currently reflects recipe
stage ids in navigation, but that must remain presentation, not architecture.
If a future split is needed only for Studio grouping, the better fix is
presentation metadata or SDK/Studio grouping support, not an artificial recipe
stage.

Back-application rule:

- `map-morphology` is justified while it owns terrain/coast/mountain/volcano
  projection/build effects, real projection knobs, and engine drift checks.
- `map-hydrology` is justified as the river/lake projection lane, but D2 still
  requires lake truth to move upstream into Hydrology before map-hydrology can
  be considered clean.
- `map-ecology` is justified as the Ecology projection/materialization lane,
  but pure scoring/substrate/intent planning belongs in `ecology-features`.
- Any `map-*` stage with no adapter/effect boundary, no `artifact:map.*`
  handoff, no real authoring surface, and no independent recipe-ordering need
  should collapse into a broader projection stage or into step-level structure.

This is the same pattern as the feature-score correction: stages should expose
authority and authoring boundaries, not internal implementation variants.

## 0e: `@mapgen/*` Import Policy

Decision: **Use a scoped import matrix. Do not ban all `@mapgen/*` in mod
source.**

### Scope

G4 should enforce imports by audience and owner:

| Scope | Allowed | Forbidden |
| --- | --- | --- |
| Canonical docs/examples | Published `@swooper/mapgen-core/*` package entrypoints | Workspace-only `@mapgen/*` examples |
| Public consumers/apps | Package export maps and source-owned recipe artifacts where documented | `src`/`dist` deep imports |
| Standard recipe assembly | `@mapgen/domain/<domain>/ops` for `collectCompileOps`, plus stage-local relative imports | direct op internals like `ops/<op>/strategies/*` |
| Step contracts/implementations | `@mapgen/domain/<domain>` public domain surface; `@mapgen/domain/config` for schema/type-only fragments | unresolved deep internals when a public surface exists |
| Domain internals | relative imports inside one op/module; public domain aliases for cross-domain stable surfaces | cross-domain deep internals without an accepted public surface |
| Tests | same as the code under test, with explicit test-only exceptions where needed | teaching unstable import paths as examples |

### Why It Matters

Current sources already use `@mapgen/domain/*` as a mod-local path alias.
Specs explicitly allow `@mapgen/domain/<domain>` and
`@mapgen/domain/config`. Canonical docs/examples separately ban `@mapgen/*`
because those aliases are not public package contracts.

A broad ban would contradict the standard content package spec.

### Rationale

The problem is not the alias itself. The problem is unresolved deep imports and
docs teaching workspace-only imports to external consumers. The guardrail should
match the actual boundary:

- public docs teach public packages;
- recipe assembly imports domain op registries;
- steps import domain public surfaces;
- op internals stay relative;
- temporary deep internals receive owners and replacement surfaces.

### Strongest Alternative

Ban `@mapgen/*` everywhere outside `packages/mapgen-core`.

This is simple to enforce, but it would produce worse mod-source ergonomics and
fight existing specs. It would likely lead to long fragile relative paths rather
than better ownership.

### Buts And What-Ifs

- **What if the matrix becomes a loophole?** Every allowed lane must have a
  corresponding allowed entrypoint list. Temporary deep imports need owner and
  retirement trigger.
- **What if docs need to show mod-local examples?** Mark them explicitly as
  repo-internal examples. Public tutorials should use published package exports.
- **What if public surfaces do not exist yet?** Either create them before G4, or
  record a temporary exception with a target replacement.

## Domino Sequence

Recommended order of operations:

1. **Lock vocabulary and decisions.**
   - Update packet/spec with phase/stage/step definitions and the revised D1-D5
     decisions.
   - This prevents implementation slices from arguing about topology mid-work.

2. **D1 + 0e first.**
   - D1 settles the authoring/config surface.
   - 0e settles enforceable module boundaries.
   - These reduce later churn and clarify what guardrails can actually check.

3. **D5 topology before ecology file moves.**
   - Do the connection-graph audit.
   - Confirm the input/handoff-stage topology and internal step contracts.
   - Then dissolve stale hubs and empty per-feature wrapper stages to match
     the target.

4. **D2 lake truth before placement authority work.**
   - Implement lake plan/materialization/readback.
   - Migrate placement inputs away from engine-derived lakes.
   - Placement cannot be fully authoritative while a key physical input is
     engine projection.

5. **D3 placement split.**
   - Expose resource/discovery/start/wonder boundaries as steps.
   - Keep transactional engine maintenance inside product steps unless it needs
     independent contracts.

6. **D4 resource/discovery authority last.**
   - After resource/discovery steps exist, decide whether official generators
     are replaced, constrained, or explicitly retained as primary.
   - Close the ADR/doc conflict only when exact semantics and verification are
     available.

7. **Guardrails after code passes them.**
   - G4 waits for the import matrix and public surfaces.
   - D1 unwrap-compile guard waits for SDK migration.
   - Ecology sibling-step import guard waits for D5 topology/file cleanup.

## Final Calls

| Decision | Owner call |
| --- | --- |
| D1 | Yes: SDK-native default-stage `{ knobs?, advanced? }`, Shape-B remains explicit custom compile. |
| D2 | Yes target: Hydrology-owned lake intent. Fail-hard only after materialization/readback and placement input migration. |
| D3 | Yes: split placement into contract-bounded steps by product/effect boundary, not every helper block. |
| D4 | Target yes, immediate no: plan-authoritative resources/discoveries require typed exact materialization or legality-oracle support; `placed === planned` is insufficient. Otherwise rename as diagnostics and supersede conflicting truth claims. |
| D5 | Multiple ecology truth stages by input/handoff surface: pedology, biomes, `ecology-features`, plus `map-ecology` projection/materialization. Keep score/substrate and intent planning as step/artifact seams inside `ecology-features` unless a real stage-level surface emerges. |
| 0e | Scoped import matrix. Do not broad-ban `@mapgen/*` in mod source. |
