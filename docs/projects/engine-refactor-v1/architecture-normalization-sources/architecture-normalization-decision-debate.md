# Source Material Notice

This document is preserved for provenance only. Its decisions have been folded
into `../architecture-normalization-packet.md`, which is now the active
normalization authority.

# MapGen Architecture Normalization Decision Debate

Status: `source-material-only`
Date: `2026-05-29`
Branch: `codex/resolve-normalization-decisions`

This document compares:

- Codex owner pass:
  `architecture-normalization-decisions-codex.md`
- Claude independent pass:
  `architecture-normalization-decisions-independent.md`
- Sibling consolidation note:
  `architecture-normalization-decisions-comparison.md`

It is the joint-review synthesis. It does not edit the packet and does not
start implementation.

## Evaluation Lens

The decision rule is:

- Prefer the simplest product surface that can support real authoring and
  debugging needs.
- Keep flexibility through the smallest useful abstraction: step contracts
  before stages, typed adapter capabilities before fail-hard claims, scoped
  guardrails before broad bans.
- Do not add wrapper structure merely to label complexity. Also do not remove
  structure that carries real ownership, verification, or compatibility value.

In the current SDK, a stage buys authoring/config surface, knobs scope, stage id
prefixing, and membership in the recipe's ordered stage array. Runtime execution
is a flat ordered step list; `requires`/`provides` gates execution but does not
create a separate stage-level runtime topology. That means stage splits should
be justified mostly by product/authoring surface and ownership, not by a vague
claim of "more wiring."

## Summary

| Decision | Codex position | Claude position | Strongest synthesis |
| --- | --- | --- | --- |
| D1 | SDK should synthesize nested `{ knobs?, advanced? }`. | Use existing flat `{ knobs?, [stepId]? }`; no SDK affordance. | **Adopt Claude.** Flat is simpler and already supported. Delete unwrap boilerplate; do not add `advanced`; tighten derived step-key schemas where possible. |
| D2 | Lakes are Hydrology truth, but fail-hard waits on materialization/readback. | Same, with adapter-first sequencing and DEF-020 split. | **Adopt both, sharpened by Claude.** Adapter capability first, then projection, then parity. |
| D3 | Split placement into product/effect steps, not every helper. | Split ratified, with dissent against fake contracts. | **Consensus.** Split only where contracts/effects are real. |
| D4 | Target plan-authoritative; current `placed === planned` is insufficient. | Plan-authoritative intent with typed reconciliation; fail only unexplained drift. | **Adopt Claude wording.** Typed reconciliation is the product/engineering middle path. |
| D5 | One explicit `ecology` truth stage plus `map-ecology`. | Keep seven ecology stages as plausible future knob owners. | **Revise both.** Use multiple ecology truth stages where input/authoring surfaces differ, but do not keep one stage per feature family without a real surface. |
| 0e | Scoped import matrix; no broad `@mapgen/*` ban. | Same, with narrow `src/recipes/**` G4 and sized remediation. | **Blend.** Keep matrix as policy, implement narrow first guardrail. |

## D1: Stage Config Surface

### Team Codex Steelman

Nested `advanced` gives users a clear product concept: `knobs` are curated
dials, `advanced` is expert per-step override space. It prevents top-level
stage config from becoming a loose bag of step ids, and it matches the pattern
already hand-written in morphology and map-hydrology stages. If several stages
are reimplementing the same unwrap compile, the SDK should own it.

### Tear-Down

The strongest part is the product label. The weak part is the added data shape.
The SDK already has a no-public stage path that accepts `{ knobs?, [stepId]? }`.
The recipe config schema generator expands step schemas for that flat shape, so
the UI/schema path can still see typed step config. Adding `advanced` would
create a second SDK-generated surface mostly to preserve a cosmetic grouping.
The one valid weakness in current Shape A is that `stage.surfaceSchema` uses
`Type.Unknown()` for step keys before later compile-time validation. If we keep
flat, we should tighten that default surface to use the actual step schemas
where the SDK already has them.

That is exactly the kind of extra layer the product should avoid. A UI can
still group all non-`knobs` step config under an "advanced" section visually
without making `advanced` a persisted config key.

### Team Claude Steelman

Flat passthrough is already the SDK's simple solution. `foundation` proves it:
it has `knobs` plus top-level step keys and explicitly no `advanced`. The five
hand-written `advanced` stages are not evidence that the SDK is missing a
feature; they are evidence that those stages have drifted away from the simpler
default shape. Delete the boilerplate and use the existing mechanism.

### Tear-Down

The flat shape is less semantically labeled in raw JSON. A user looking at a
large stage config has to infer that top-level non-`knobs` keys are expert
overrides. Step-id collisions also remain a concept the SDK must police.

Those objections do not justify a new persisted wrapper. Collision handling is
already part of the Shape A/Shape B boundary: a stage with genuine curated
public fields should define `public + compile`. For the default case, extra
nesting is not product simplicity; it is a second representation of the same
thing.

### Final Call

Adopt Claude's D1.

- No SDK-native nested `advanced` affordance.
- Delete the hand-written unwrap `compile` blocks where they only map
  `advanced` to step configs.
- Use the flat default surface: `{ knobs?, [stepId]?: stepConfig }`.
- Replace the default `Type.Unknown()` step-key surface with derived step
  schemas where feasible, preserving the later compile-time validation pass.
- Keep `public + compile` for real transforms.
- Keep a guardrail against the empty unwrap pattern, but write it against the
  actual smell: `public.advanced` plus `compile => config.advanced`.

This is the clearest product-management win in the debate: it removes a layer,
reduces SDK work, and keeps the flexibility that already exists.

## D2: Lakes As Hydrology Truth

### Team Codex Steelman

For a physics-based map generator, lakes should be Hydrology truth. If
placement, starts, and downstream scoring consume lakes, the pipeline should
own lake intent rather than treating Civ7 random lake projection as source of
truth. But the current code cannot fail-hard yet because it delegates to
`generateLakes(...)` and treats sink mismatch as telemetry.

### Team Claude Steelman

Same target, with the implementation trap made explicit. The previous fail-hard
attempt failed because the adapter did not expose explicit lake stamping. The
first domino is not `plan-lakes`; it is an adapter capability such as
`stampLakeMask(...)`, followed by projection migration, followed by parity.
Also split DEF-020's lake and river concerns so lake work does not balloon.

### Tear-Down

There is no real disagreement on the destination. The only weak version is
"implement lake truth and immediately fail-hard." That repeats the known revert
pattern. Another weak version is "engine owns lakes forever" because Civ7's own
generator is random projection, not a domain-authoritative lake intent model.

### Final Call

Adopt the shared target and Claude's sequencing:

1. Add or expose explicit lake materialization/readback capability.
2. Implement `plan-lakes` as real Hydrology intent, not a renamed `sinkMask`.
3. Make `map-hydrology` stamp/project that plan.
4. Migrate placement off `engineProjectionLakes`.
5. Only then add fail-hard parity.

This keeps deterministic ownership without turning a missing adapter capability
into a brittle gate.

## D3: Placement Split

### Team Codex Steelman

Placement is currently too broad to reason about. Resource and discovery
authority cannot be settled while those flows are hidden inside one large apply
step. Contract-bounded sub-steps expose product/effect boundaries, trace, and
verification points.

### Team Claude Steelman

The split is only valuable if the contracts are real. The existing
`runPlacementStep(...)` blocks are a trace/error harness, not proof of contract
boundaries. Many operations mutate shared engine state in sequence and publish
no durable intermediate artifact. A naive split would manufacture fake
`requires -> provides` tags that only restate array order.

### Tear-Down

The argument against splitting is persuasive against a mechanical refactor, not
against decomposition itself. Keeping one broad step preserves too much hidden
behavior. Splitting every maintenance call is also wrong. The real line is
product/effect boundary: wonders, resources, starts, discoveries, and advanced
starts deserve explicit projection/verification surfaces; terrain validation,
area recalculation, water cache storage, and fertility recalculation may remain
transaction details until they have independent consumers.

### Final Call

Consensus with Claude's caveat:

- Split placement into contract-bounded product/effect steps.
- Do it one boundary at a time.
- Do not create fake contracts for internal sequencing.
- Reframe G8 around hidden uncontracted sub-concerns, not raw line count alone.

This supports D4 without over-structuring the product.

## D4: Resource/Discovery Authority

### Team Codex Steelman

The target should be plan-authoritative resources and discoveries because the
SDK's purpose is deterministic, inspectable generation. But `placed === planned`
is not enough: current official generators return counts while owning
feasibility internally. Count equality can pass with the wrong type/location or
fail because the engine made a legitimate feasibility rejection.

### Team Claude Steelman

Make the plan authoritative for intent, then reconcile against engine
feasibility with typed outcomes. Fail hard only on unexplained drift:
placed-but-unplanned, wrong type/location, or planned-dropped with no reason.
Allow explained engine-feasibility rejection until the pipeline fully owns or
delegates legality.

### Tear-Down

"Exact plan-authoritative or diagnostics only" is clean, but too binary. It
would either force us to port all Civ7 resource/discovery semantics before we
can make progress, or leave plans in a second-class diagnostic role for too
long. Claude's typed reconciliation is better product design: it gives users
deterministic intent and useful rejection reasons without pretending the
pipeline already owns every legality rule.

The weak version of Claude's argument would be allowing reconciliation to
become a loophole where every drift is "explained" by the engine. That must be
guarded by typed reason categories and tests.

### Final Call

Adopt Claude's D4 phrasing:

- Plan is authority for typed intent.
- Adapter/materializer returns placed items and typed rejection reasons.
- Fail on unexplained drift, wrong type/location, or untyped rejection.
- Until that exists, official generator output remains projection diagnostics,
  not silent truth.

This is the best balance of deterministic SDK ambition and product simplicity.

## D5: Ecology Decomposition

### Team Codex Steelman

Use one `ecology` truth stage with explicit contracted steps, plus
`map-ecology` projection. The current seven ecology stages have empty knobs and
mostly one step each. Several exist only as wrappers around a stale sibling
`stages/ecology/` hub. Step contracts can express substrate, scoring, and
feature-intent topology without turning every ecology concern into a recipe
stage.

This is simpler for the product: users see one ecology truth surface, one
projection surface, and advanced step-level overrides inside ecology when
needed.

### Team Claude Steelman

Stage buys knobs scope, so preserve one stage per plausible future knob owner:
pedology, biomes, feature scoring, ice, reefs, wetlands, vegetation. Each of
those is a coherent author concern. Keeping seven avoids churn now and avoids
collapsing a deliberate prior split that may need to be re-promoted when tuning
surfaces arrive.

### Domain-Ops Input Constraint

The operation-input concern is real, but it needs to be placed precisely.
Domain ops consume plain data inputs and do not read runtime context or artifact
stores. Steps build those op inputs from artifacts/runtime state, call ops, and
publish outputs. Therefore:

- Splitting into more stages does **not** directly make a domain op's input
  schema smaller.
- Splitting into better steps and op-input builders **does** make op inputs
  smaller.
- Stage boundaries still matter when they define a distinct authoring/input
  surface around a group of steps: which upstream artifacts the group consumes,
  which handoff artifacts it produces, what knobs/config families belong there,
  and whether another recipe stage can be inserted before or after that group.

That means the prior "one `ecology` truth stage" call was too coarse. It
correctly rejected seven speculative namespaces, but it underweighted the value
of named ecology stages as input/handoff surfaces.

### Tear-Down

Claude correctly identifies what stage buys in the current SDK: authoring
surface, knobs scope, stage id prefixing, and recipe-array grouping. But it
weakens its case by relying on plausible future knobs for every feature family.
Current evidence says all seven stage knobs are empty, and the underlying step
schemas are also empty. If speculation is enough, every likely tuning concern
becomes a stage, and product simplicity loses by default.

Codex correctly resisted one wrapper stage per feature family, but it
over-corrected by collapsing all ecology truth into one stage. That makes the
stage too broad as a product and authoring surface. Pedology, biome
classification, and feature planning have different upstream artifact inputs
and different durable handoff outputs. Those are concrete stage-level needs,
not mere "more steps might appear later" conservatism.

The later challenge is also correct: `features-score` versus
`feature-intents` reads like a split by implementation variant. The real
distinction is substrate/suitability computation versus allocation/planning.
That is a valid step and artifact boundary, but it is not automatically a
recipe-stage boundary. Stage should not mean "a useful intermediate artifact
exists"; stage should mean that an author, reviewer, recipe, or downstream
consumer benefits from an independently named surface.

### Final Call

Revise D5 to multiple ecology truth stages, but not the current seven-stage
feature-family split:

1. `ecology-pedology`
   - Steps: pedology, resource basins.
   - Distinct input surface: morphology topography plus baseline climate, then
     pedology-derived resource basin planning.
   - Handoff: soils/pedology and resource basins.
2. `ecology-biomes`
   - Steps: biomes and any biome-edge refinement if retained.
   - Distinct input surface: refined climate/cryosphere plus topography and
     pedology.
   - Handoff: biome classification.
3. `ecology-features`
   - Steps: feature substrate/score layers if needed, then plan ice, reefs,
     wetlands, vegetation, plus merge/finalize if needed.
   - Distinct input surface: biome classification, pedology, hydrography,
     topography, coastline metrics, and the occupancy cascade.
   - Internal handoff: score/substrate layers and base occupancy when planners
     need shared visibility.
   - Stage handoff: feature intent artifacts and final occupancy.
4. `map-ecology`
   - Projection/materialization stage.

Concrete triggers for promoting a concern to its own stage:

- It has a distinct stage-level authoring or knobs surface, not just an empty
  placeholder.
- It has a distinct upstream input family and downstream handoff artifact set
  that would be hard to explain as part of a broader stage.
- It needs independent recipe placement or another stage must be able to run
  between it and the surrounding ecology work.
- It owns stage-scoped helpers/contracts shared by multiple steps that should
  not become cross-ecology shared catalogs.
- It needs independent enablement or review/trace identity at the recipe level.
- A substrate/scoring concern specifically promotes out of `ecology-features`
  only if it gains its own knobs, external consumer, review gate, or recipe
  insertion need before feature planning.

Non-triggers:

- One domain op does not automatically imply one stage.
- A plausible future knob alone is too weak.
- A useful intermediate artifact does not automatically imply one stage.
- Reducing domain op input schemas is not, by itself, a stage-count argument;
  op input size is controlled by step input builders and op contract design.

This is the stronger product-management call: plan for N > 1 ecology stages,
but let the named stages correspond to real input/handoff surfaces instead of
speculative per-feature wrappers or score-vs-intent implementation variants.

### Map-Ecology Extension

The same challenge applies to `map-ecology` and the other `map-*` stages, but
the answer is different. `features-score` versus `feature-intents` was an
internal seam being promoted too far. `map-ecology` is justified only if it is
the Gameplay projection/materialization lane: it consumes Ecology truth,
translates it into engine-facing fields/effects, performs adapter writes or
engine legality checks, and emits projection/parity evidence.

Evidence:

- Commit `c8a90c882` explicitly moved Hydrology/Ecology projection work into
  `map-*` stages. The diff mostly moved adapter-facing feature apply, biome
  binding, plot effects, lakes, and rivers out of truth stages and into
  `map-ecology` / `map-hydrology`.
- `SPEC-DOMAIN-MODELING-GUIDELINES.md` says Physics truth must not consume
  `artifact:map.*` or `effect:map.*`, and any step that touches the engine
  adapter is Gameplay-owned and must provide a matching map effect.
- Current `map-ecology` steps are `phase: "gameplay"` and provide engine/map
  effects or fields: `plot-biomes` applies engine biome ids,
  `features-apply` writes feature types and records projection diagnostics, and
  `plot-effects` applies engine plot effects.
- Studio consumes stage ids generically from recipe metadata and dump
  manifests. It should never be the architectural reason to split a stage.

Decision:

- Keep `map-ecology` as a stage **only as projection/materialization**, not as
  a visible implementation detail or Studio grouping device.
- Do not move pure Ecology truth, scoring, substrate, or intent planning into
  `map-ecology` merely because those products are easier to inspect there.
- If `plot-effects` or any other `map-ecology` logic becomes reusable Ecology
  truth, move that compute/plan portion back into `ecology-features` and leave
  only projection/materialization in `map-ecology`.
- If a future `map-*` stage has no adapter/effect boundary, no `artifact:map.*`
  projection surface, no stage-level authoring surface, and exists only for
  navigation or viz grouping, collapse it or replace the tooling need with
  Studio/SDK presentation metadata.

This back-applies the same rule to the whole stack: a stage needs a durable
authority boundary, authoring surface, input/handoff surface, or recipe-ordering
surface. Tooling presentation, debug overlays, intermediate artifacts, and
implementation variants are not sufficient.

## 0e: Import Guardrail

### Team Codex Steelman

A scoped import matrix is the right policy because `@mapgen/*` is not one
thing. Public docs should not teach workspace-only aliases. Standard recipe
assembly can use sanctioned domain surfaces. Domain internals can use relative
imports. Tests should follow the code under test.

### Team Claude Steelman

Make G4 smaller and shippable. Most debt is clustered in a few recipe imports
of knobs and multipliers. Add public re-exports, repoint those recipe files,
route ecology types through the public ecology surface, then turn on a narrow
`src/recipes/**` guard. Do not let a broad policy matrix delay enforcement.

### Tear-Down

The matrix is useful as durable policy, but too broad as the first guardrail.
The narrow guardrail is shippable, but it must not become the whole policy
because public docs, public consumers, domain internals, and tests need
different rules.

### Final Call

Blend both:

- Use the scoped import matrix as the durable decision.
- Implement G4 first against `src/recipes/**` deep reach-ins.
- Add the small public-surface remediation first.
- Expand enforcement only after the corresponding public surfaces exist.

This keeps the policy principled and the implementation simple.

## Final Recommended Packet Calls

| Decision | Packet call to fold in |
| --- | --- |
| D1 | Existing flat Shape A wins: `{ knobs?, [stepId]?: stepConfig }`. Do not add SDK-native nested `advanced`. Delete boilerplate unwrap compiles and tighten derived step-key schemas where feasible. |
| D2 | Lakes are Hydrology truth, but sequence adapter materialization/readback before projection migration and fail-hard parity. |
| D3 | Split placement into real product/effect contract steps. Do not manufacture contracts for internal maintenance order. |
| D4 | Use typed plan-authoritative intent with reconciliation. Fail only unexplained drift or typed mismatch; no naive `placed === planned`. |
| D5 | Multiple ecology truth stages by input/handoff surface: `ecology-pedology`, `ecology-biomes`, `ecology-features`, plus `map-ecology` as projection/materialization only; keep score/substrate and intent planning as step/artifact seams inside `ecology-features` unless a real stage-level surface emerges. |
| 0e | Scoped import policy, narrow first G4 guardrail for recipe deep imports after small public-surface remediation. |

## Domino Sequence After Debate

1. Fold the final vocabulary and D1-D5/0e calls into the packet.
2. Land D1 by deleting unwrap-boilerplate stages and migrating configs/docs to
   the flat default surface.
3. Land 0e's public-surface remediation and narrow recipe import guardrail.
4. Land D5 topology: multiple ecology truth stages by input/handoff surface,
   no stale sibling hub, and no empty per-feature wrapper stages.
5. Add lake adapter materialization/readback, then implement D2.
6. Split placement one product/effect boundary at a time.
7. Implement D4 typed reconciliation once placement boundaries and adapter
   outcomes exist.

This order starts with product-surface simplification and enforceable module
boundaries, then handles topology, then truth/projection authority.
