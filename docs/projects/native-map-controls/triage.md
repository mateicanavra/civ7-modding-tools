# MapGen Investigation Questions

This is the shared intake for material, off-path questions found while building,
qualifying or explaining the Earthlike pipeline. It preserves enough evidence
to decide whether an investigation is worthwhile, not a queue of presumed bugs
or a promise to implement a repair. Group related observations under their
mechanism, operation and recipe step rather than creating an entry per symptom.

[Open questions](#open-questions) are distinct from accepted learning material,
active owner work and intentional deferrals. Linear owns task status, priority,
assignment and scheduling; this book owns the question, evidence and eventual
disposition. The [project workstream](WORKSTREAM.md) owns current scope. The
[calibration question sheet](calibration-question-sheet.md) retains its original
Earth benchmark, river-density and lake-height investigation, not this intake.

## Contribute Or Revisit A Question

Any team may propose a concise evidence packet. The notebook stewardship parent
is the editorial curator: deduplicate, group and maintain the entry. The
workstream owner admits and prioritizes investigations; the relevant domain
steward reviews scientific meaning. Existing evidence, explainer and notebook
editor roles can contribute within their read-only contracts. Their learning
eligibility decisions do not authorize scientific changes or repairs. No new
permanent team or generic defect agent is required.

Admit an entry only when it has a material consequence, an unresolved decision
and a bounded way to learn more. A minor defect with an obvious fix stays in its
normal owner workflow. A finding required to complete current work returns to
that active owner immediately; this book must not become a way to defer it.
Search the current owner documents and older triage first. Do not revive a
historical question whose later evidence already provides a disposition.

Use a stable `Q-NNN` heading and preserve these parts:

- **Context and type:** originating owner/review and durable links; `triage`
  while a research or scope decision remains. Name the mechanism, operation and
  step, affected inputs/outputs and first controlling downstream consumers.
- **Question and consequence:** what is questionable and why the answer could
  matter. Separate pinned implementation facts, plausible concerns, proven
  defects and unresolved scientific evidence. A test count, merged PR, visual
  impression or absence of proof is not a scientific verdict.
- **Evidence and rivals:** immutable source revision, proof class and vintage,
  physical support where available, contrary evidence and valid alternative
  interpretations. Name missing artifacts, support/units or a possible
  simplification without treating an unbuilt artifact as required architecture.
- **Smallest investigation:** held inputs, permitted variation, observed outputs
  and the result that could disprove the concern. No preferred repair disguised
  as a question. Stop when the bounded question is answered; reframe before
  expanding into a model, parameter sweep or full-map campaign.
- **Next check:** an event-based revisit trigger and a closure/promotion route.
  Refresh the source pin on revisit; do not silently treat old facts as current.

For benchmark questions, state the claim, admitted population, units, variation,
threshold rationale and counterexample before treating a check as a gate.
Swooper Earthlike is the selected core baseline. Desert Mountains, Archipelago
and other themed presets are not core baseline or gating benchmarks; revisit
them as configuration work after baseline confidence. Unsupported inherited
quotas, including the arbitrary 20-rainforest-tile cap, are not physics authority.
Removing that cap belongs to the active benchmark change, not a deferred item
here, and does not mean retuning it or filtering failures. Preserve older
evidence with its original selection and limits rather than rewriting history.

When definite work is accepted, create or link a right-sized Linear issue with
its outcome and acceptance evidence; leave a short promotion link here rather
than copying status. Close disproven concerns and accepted limitations with
pinned evidence, the owner's rationale and a reopening condition. An intentional
temporary compromise belongs in the owning project's deferrals record (or
[system deferrals](../../system/DEFERRALS.md) at system scope), with a trigger,
not as an indefinitely unresolved question. Follow [Linear conventions](../../process/LINEAR.md).

## Active Owners, Not Deferred Questions

- Regional thermal response remains with the [current product goal](WORKSTREAM.md#current-product-goal)
  and [annual land-response owner](annual-land-response-owner-decision.md).
- Local plant-water meaning and its ecological consumers remain with the
  [plant-water owner decision](terrestrial-water-influence.md#next-plant-water-owner).
- Benchmark scope and removal of unsupported count caps remain active owner work
  under the Earthlike baseline decision above; this book does not schedule a
  second implementation.

These are navigation pointers, not copied investigations or new dispositions.

## Open Questions

- [Low-shore neighborhood semantics](#q-001-low-shore-neighborhood-semantics)
- [Ecological prevalence and benchmark authority](#q-002-ecological-prevalence-and-benchmark-authority)
- [Relief bounds and admitted support](#q-003-relief-bounds-and-admitted-support)

### Ecology / Features / Score Layers

#### Q-001: Low-Shore Neighborhood Semantics

**Type:** triage. **Evidence disposition:** confirmed implementation behavior;
plausible boundary/topology concern; physical adequacy and material downstream
harm unresolved. No defect or repair is admitted by this entry.

**Context:** Source qualification for the marine-shore learning lesson exposed
a shared neighborhood contract question, not a failure of marine provenance.
All implementation and acceptance facts below are pinned to
`fda02f26040a47f6bbd78ef685c1ad4fe909cc05`.

**Question:** Does the low-shore source-proximity window provide the intended
neighborhood semantics on the cylindrical hex map, or can a longitude boundary
or grid orientation change meaningful substrate eligibility? The authored
[configuration][substrate-config] explicitly promises a square radius, not hex
distance. The open question is its boundary treatment and physical support.
A periodic square window changes boundary behavior; a hex-distance neighborhood
would change the authored metric and needs a separate owner decision.

**Implementation and affected path:**
[computeCoastalLandMask][coastal-rule] scans an inclusive rectangular X/Y index
window, skips the target, clips both axes and does not wrap X. Radius one can
inspect eight other cells in an interior square, not the six native hex
neighbors. Its inputs are width/height, exposed `landMask`, `sourceWaterMask`
and radius. The [hydromorphic strategy][substrate-strategy] calls it separately
with resolved any-water sources and prescribed `externalWaterMask` sources.
Keep those populations separate throughout the investigation.

The [wetland substrate rule][wetland-rule] combines generic coast proximity
with relative elevation to derive low-shore support. That affects
`hydromorphicMask` and complementary `wellDrainedMask`; external-water proximity
additionally gates `intertidalCoastMask`. In [score-layers][score-step], marsh and
tundra-bog scorers consume hydromorphic support, while the mangrove scorer
consumes intertidal support. A proximity difference need not survive those
scores, terrain/biome compatibility and wetland arbitration into actual feature
intent. Track masks, scores and admitted intent separately; do not infer changed
placement or gameplay from changed eligibility alone.

**Why it may matter:** A jointly translated source/receiver arrangement could
lose support at the X boundary even when its local world relationship is held.
A square index window may also distinguish hex-equivalent local orientations.
Those are hypotheses about an intended invariance, not measured ecological
harm, a whole-world rotation requirement or proof that a new metric is better.
Latitude, bounded Y and row parity must not be changed accidentally.

**Contrary evidence and limits:** The square-radius label is explicit authoring
evidence, not an accidental undocumented hex implementation. The
[accepted marine-provenance repair][marine-decision]
explicitly held the existing geometry and radius while separating generic
finite-water shores from marine eligibility. The [focused substrate test][substrate-test]
checks that distinction, height gates and generic-mask preservation; it does
not declare periodicity or isotropy. Another owner's [periodic biome repair][biome-decision]
provides a precedent for a held longitude-translation discriminator, not
authority to copy its law into this operation. A deliberate clipped raster
approximation, an inactive downstream gate or a tolerated product limitation
could defeat the suspected consequence. No primary physical evidence assembled
for this entry selects a stencil/radius or proves this approximation harmful.

**Missing evidence and simplification opportunity:** The missing contract
evidence concerns required world-boundary behavior and justified physical
support for the authored square approximation, not a promised hex distance.
Missing receipts are a held boundary comparison and its
first-consumer consequences, not another permanent artifact or a new global
distance abstraction. If a later accepted contract matches an existing public
grid primitive, assess reuse then; do not preselect it now.

**Smallest discriminating investigation:** Begin with one synthetic exposed
low-shore target and one admitted source, once inland in the index domain and
once across the east-west boundary. Cyclically translate all relevant input
fields together at fixed row and fixed radius; keep elevation/sea datum,
climate, fertility, river fields and source identity held. Inverse-translate the
outputs before comparing them. Run generic finite-water and marine-source arms
separately. Observe the proximity masks, resulting hydromorphic/intertidal masks
and first controlling scores before considering any planner consequence.

Exact correspondence would disprove boundary sensitivity for that witness.
Different masks but identical controlling scores would refute a claimed scoring
failure for that witness, not all potential consumers. A source-only difference
establishes boundary sensitivity, not physical or gameplay harm. If the owner
accepts a deliberately bounded index contract, close the mismatch allegation
as an accepted limitation with rationale rather than rewriting the contract by
test. Only if hex-isotropic local proximity is actually required should a later
held interior hex-rotation fixture be considered; a full globe rotation is not
an invariant of latitude-dependent forcing or bounded Y.

**Next check:** Revisit before changing coastal adjacency radius/geometry or
before a retained Earthlike low-shore anomaly is attributed to local water
availability. If that anomaly blocks current work, return it immediately to
the active owner. The workstream owner may admit a bounded contract investigation
to Linear; any repair additionally requires a settled contract and qualified
consequence. This entry selects no implementation and executes no new experiment.

### Benchmark Authority / Ecological Prevalence

#### Q-002: Ecological Prevalence And Benchmark Authority

**Type:** triage. **Context:** source review of the Earthlike identity and ecology
targets at `fda02f26040a47f6bbd78ef685c1ad4fe909cc05`.
**Evidence disposition:** numerical predicates confirmed; their complete
decision/calibration provenance is not established by this review. This is not
proof that every threshold is wrong, nor a new plant-water release veto.

**Question and consequence:** Which bounds express authorized gameplay identity,
which ensure a test exercises a feature, and which claim ecological adequacy?
Should a particular expectation depend on available lawful habitat rather than
an unconditional count or whole-map share? Conflating these claims could reward
implausible coverage or reject a physically coherent map, but neither outcome
has been demonstrated here.

**Facts and affected path:** The [Earthlike identity target][identity-target]
requires a projected lake component of at least four tiles, five vegetation
families, named feature presence and rainforest at most 65% of vegetation.
The [ecology targets][ecology-target] separately require vegetation on 8-55% of
land, rainforest at most 70% of vegetation and 35% of land, named-feature
presence across rolls, cold-reef presence in four rolls and at least eight
floodplain attempts in the representative sample. Representative identity and
cohort constraints are different supports, not automatically contradictory
numbers. Inputs are measured feature/attempt counts, land and vegetation
denominators, lake components and cohort identities; outputs are benchmark
pass/fail receipts consumed by acceptance review, not new procedural forcing.

**Evidence, rivals and missing support:** The source explicitly labels many
bounds as product identity or representative coverage. The floodplain attempts
floor explicitly exercises an otherwise inactive row; it need not estimate
Earth prevalence. These are serious rival explanations to an arbitrary-physics
claim. What remains missing is a predicate-level trace from owner decision to
population, denominator, variability and justified bound. No independent
observational or habitat-conditioned calibration was established by this source
review; that is an evidence gap, not proof that such evidence cannot exist.

**Smallest investigation and disproof:** Select one disputed predicate and one
already retained Earthlike case. Trace its original decision and exact sample
support before any new run. Join the corresponding habitat eligibility,
compatibility, intent and observed result if retained, holding the producer
revision and cohort fixed. If those observations are absent, name the missing
receipt before proposing a capture. Recovering an authorized product/coverage
requirement with the stated support and a matching measurement can disprove the
claim that this predicate is an unsupported physics gate. Conversely, a number
alone cannot distinguish scarcity, illegal placement and an erroneous scorer.
The result may simply clarify a claim or remove duplicated checks; changing the
denominator, threshold or generator is not preselected.

**Next check:** Revisit when an Earthlike prevalence check would motivate a
scientific change or a new eligible-habitat support is proposed. Route a failure
needed by current work directly to its owner. This does not reopen the decided
themed-preset exclusion or 20-tile-cap removal. Close or promote the selected
predicate with its exact evidence; do not launch a sweep of all quotas.

### Benchmark Authority / Relief And Orogeny

#### Q-003: Relief Bounds And Admitted Support

**Type:** triage. **Context:** Earthlike relief targets and the orogeny protocol
at `fda02f26040a47f6bbd78ef685c1ad4fe909cc05`.
**Evidence disposition:** existing product bounds and their partial amendment
are confirmed; validity outside their admitted support is unresolved, not a
demonstrated terrain or test defect.

**Question and consequence:** Which relief bounds remain meaningful when map
scale, terrain representation or upstream inputs change? The [relief targets][relief-target]
include representative rough-upland coverage of 4-8%, component caps of 60
(representative) and 40 (Huge cohort), and orogeny-cohort floors of 38 for region
diameter, 450 region tiles and 300 flat-region tiles. Different cohorts and
dimensionless shares versus tile counts must not be collapsed into one universal
terrain law. An out-of-support size comparison could falsely blame generation;
an in-support failure could still reveal a meaningful product regression.

**Affected path and counterevidence:** Inputs are planned/observed terrain
populations and periodic-grid region topology; outputs are representative and
cohort acceptance predicates. They influence relief adoption decisions, not
physical ground directly. The [orogeny protocol][orogeny-protocol] explicitly
defines a Huge-map product and retains regional extent, interior composition,
mountain presence and peak-density bounds after retiring only the
`mountain-spine-diameter >=25` floor. That is positive policy evidence, not an
absence of rationale or permission to repeal the remaining bounds. A region
proxy also does not independently prove native movement through a pass.

**Missing evidence and smallest discriminator:** Before a proposed support
change, choose one bound and recover its authorized purpose, size/cohort and
metric geometry. Read its result on an existing retained sample within that
support. Compare another size or terrain representation only if the owner
actually claims portability to it, with physical fields and representation
differences explicitly accounted for. No generation, rescaling, retuning or
new study framework is selected by this entry. A documented Huge-only product
requirement can disprove an alleged cross-size inconsistency; a justified
portable normalization and qualified contrasting support can disprove the
broader scale-dependence concern. Missing evidence is a claim-to-support record,
not automatically another landscape metric.

**Next check:** Revisit before extending an existing relief gate to new sizes,
terrain semantics or producer regimes, or before using such a failure to alter
the physical model. Preserve the accepted amendment and old receipts. Close a
disproved concern or accepted support limit explicitly; scope any real repair
through the active owner and Linear rather than weakening a failing bound.

[coastal-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/coastal-land-mask.ts
[substrate-strategy]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/index.ts
[substrate-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/config.ts
[wetland-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts
[score-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[marine-decision]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/docs/projects/native-map-controls/terrestrial-water-influence.md#marine-habitat-provenance-prerequisite
[substrate-test]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/compute-feature-substrate/substrate.test.ts
[biome-decision]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/docs/projects/native-map-controls/biome-periodic-edges.md
[identity-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts
[ecology-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts
[relief-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts
[orogeny-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md
