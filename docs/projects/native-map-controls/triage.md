# MapGen Investigation Questions

This index collects research questions about the Earthlike pipeline and its
benchmarks. Each linked sheet explains a challenge, why it matters, what is
known and what evidence would distinguish possible answers. These are starting
points for inquiry, not investigation logs, a queue of presumed bugs or promises
to implement repairs. Related observations share a mechanism, operation or recipe
step rather than becoming one entry per symptom.

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

Keep a stable `Q-NNN` heading here with a concise summary and a link to its
question record. The [record contract](questions/README.md) keeps affected-scope
links, claim assessments and verification provenance distinct. Preserve these
meanings in the record, shaped for an explanatory reading path rather than an
execution checklist:

- **Pipeline context:** the mechanism, operation and step, affected inputs and
  outputs, and first controlling downstream consumers. Benchmark predicates
  have their own observation context, not invented generator ownership.
- **Question and consequence:** what is questionable and why the answer could
  matter. Separate pinned implementation facts, plausible concerns, proven
  defects and unresolved scientific evidence. A test count, merged PR, visual
  impression or absence of proof is not a scientific verdict.
- **Evidence and rivals:** immutable source revision, proof class and vintage,
  physical support where available, contrary evidence and valid alternative
  interpretations. Name missing artifacts, support/units or a possible
  simplification without treating an unbuilt artifact as required architecture.
- **Discriminating evidence:** a bounded comparison's held inputs, permitted
  variation, observed outputs and the result that could disprove the concern.
  Explain what each outcome would establish, not what an agent should execute
  next. No preferred repair disguised as a question.

Keep contribution instructions here and in the record contract. Individual
sheets do not carry agent assignments, handoffs, commands, progress or next-run
plans. Historical packets can be linked for provenance without reproducing
their working instructions. Source pins and evidence vintage remain explicit;
an editorial rewrite does not renew evidence. Assignment and scheduling belong
in Linear or messaging, while a scientific disposition belongs with the
question and its supporting rationale.

For benchmark questions, state the claim, admitted population, units, variation,
threshold rationale and counterexample before treating a check as a gate.
Swooper Earthlike is the selected core baseline. Desert Mountains, Archipelago
and other themed presets are not core baseline or gating benchmarks; revisit
them as configuration work after baseline confidence. Unsupported inherited
quotas, including the arbitrary 20-rainforest-tile cap, are not physics authority.
The [benchmark scope amendment][current-study-policy] selects `earthlike-core`
by default and [removes that cap from both Desert Mountains consumers][current-identity-protocol],
without retuning it or filtering failures. Remaining appearance guards are
product assumptions, not independently calibrated Earth observations. Benchmark
support questions remain in this book. Preserve older evidence with its original
selection and limits rather than rewriting history.

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
  [Q-006](questions/q-006-regional-thermal-response.md) explains its open
  response-and-qualification question without duplicating that active work.
- Local plant-water meaning and its ecological consumers remain with the
  [plant-water owner decision](terrestrial-water-influence.md#next-plant-water-owner).
- The [Earthlike core scope and Desert Mountains cap removal][current-study-policy]
  are decided and reflected in the [identity protocol][current-identity-protocol].
  This book retains unresolved benchmark-support questions, not a second
  implementation of that removal.

These are navigation pointers, not copied investigations or new dispositions.

## Open Questions

- [Low-shore neighborhood semantics](#q-001-low-shore-neighborhood-semantics)
- [Ecological prevalence and benchmark authority](#q-002-ecological-prevalence-and-benchmark-authority)
- [Relief bounds and admitted support](#q-003-relief-bounds-and-admitted-support)
- [Point-water habitat support](#q-004-point-water-habitat-support)
- [Wetland suitability and admission](#q-005-wetland-suitability-and-admission)
- [Regional thermal response and qualification](#q-006-regional-thermal-response-and-qualification)
- [Biome transition meaning](#q-007-biome-transition-meaning)
- [Start climate comfort](#q-008-start-climate-comfort)

### Hydrology / Baseline Climate / Regional Response

#### Q-006: Regional Thermal Response And Qualification

Stronger cooling through the existing relief control is locally adopted:
the original climate and placement studies pass, an independent production
source reproduces qualified results, and bounded Standard1/Huge1018 native
observations establish response and compatibility. Standard1's substantial
cooling and rainforest loss remain visible, as do native resource/wonder
refusals and lake-classification differences. This is empirical model-unit
terrain sensitivity, not SI-height calibration, exact plan-to-game parity or
a solution for geography at equal height. The separate precipitation/demand
experiment remains closed and disabled; its modest result and failed variation
floor are not promoted by the relief outcome. Physical calibration and broader
regional/gameplay adequacy remain open.
[Read the research question](questions/q-006-regional-thermal-response.md).

### Ecology / Biomes / Classification

#### Q-007: Biome Transition Meaning

The thermal comparison exposes an existing atmospheric-moisture adjustment
near the tropical boundary: 21 cells enter its guard and four cross adaptive
thresholds within it, without changing their plant-moisture/stress categories.
The bounded owner review retains its intentional empirical habitat envelope;
the shipped law is monotone at fixed other inputs. Cooling across a categorical
boundary is not a defect, and simultaneous cooling/wetting need not preserve
a class. Ecological calibration and the case for alternatives remain open;
retention does not turn visual-compensation provenance into Earth evidence.
[Read the research question](questions/q-007-biome-transition-meaning.md).

### Ecology / Features / Score Layers

#### Q-001: Low-Shore Neighborhood Semantics

The source distinguishes generic low-shore support from marine intertidal
eligibility. Whether its clipped square proximity window has the intended
boundary behavior and physical support remains open. This topology concern
is separate from mangrove occurrence and earlier wet-feature occupancy; no
quantified contribution to bulk rainforest scarcity or placement harm is
established. [Read the research question](questions/q-001-low-shore-neighborhood.md).

#### Q-004: Point-Water Habitat Support

With repaired source-led consumers retained, the six-case moisture comparison
produces watering holes in three of the six source-limited maps; oasis remains
absent despite new overlap between local supply and atmospheric dryness.
All 1,625 free-flat DESERT cells score below admission. With receiver climates
held, 91 score-capable source-only paths leave DESERT before the floor is reached;
atmospheric dryness caps the remaining eligible nonpolar climates.
A quantity-compatible local positive control is not a generated-world oasis.
The retained meaning is a coarse annual-source proxy for a localized vegetated
enclave in native DESERT, not a prediction of patch area or persistence. No
owner mismatch requiring repair is established; generated-world adequacy and
calibration remain open. That conclusion does not validate the thresholds or
justify a quota or lower floor.
[Read the research question](questions/q-004-point-water-support.md).

### Ecology / Features / Scoring And Wetland Planning

#### Q-005: Wetland Suitability And Admission

Wetland suitability, occurrence and admission are different claims. Earlier
mangrove intent reserves a flat tropical feature slot before otherwise admitted
rainforest; the open question is whether warm marine-low-shore support justifies
that priority or establishes only suitability. A coarse proxy is not inherently
defective, and more rainforest is not proof of improvement. The retained
six-pair moisture study and earlier consumer-only resource/seating tradeoffs
remain separate evidence. Broad habitat proxies, seasonal/tidal meaning and
shared admission remain open; no production repair or rainforest quota is selected.
[Read the research question](questions/q-005-wetland-suitability.md).

### Placement / Assign Starts / Climate Comfort

#### Q-008: Start Climate Comfort

Start climate comfort is deliberately relative to the generated world's land,
not an absolute habitability test. In a retained relief-cooling comparison, a
slightly cooler site enters the newly lower warm tail and loses preference
while remaining Primary. The original twenty-map placement study passes in
both arms; the isolated Standard1018 spacing result is not that cohort's
mean. Whether relative tail avoidance best serves start quality remains open,
without a demonstrated defect, placement blocker or selected threshold repair.
[Read the research question](questions/q-008-start-climate-comfort.md).

### Benchmark Authority / Ecological Prevalence

#### Q-002: Ecological Prevalence And Benchmark Authority

Current policy identifies appearance counts and shares as product assumptions
or regression guards, not calibrated physical laws. Predicate-level
justification for population, denominator and numerical support remains open;
the decided Desert Mountains cap removal is not reopened.
The retained rainforest comparison distinguishes modeled habitat, terrain
legality and earlier feature occupancy across fifteen configurations. Cooling
amplifies scarcity but is not established as its historical origin. A previous-lapse
river-representation intervention increases Rainforest features with climate,
lake geometry and rainforest-biome count held, supporting a partial occupancy
explanation rather than precipitation depletion or a new coverage target.
[Read the research question](questions/q-002-ecological-prevalence.md).

### Benchmark Authority / Relief And Orogeny

#### Q-003: Relief Bounds And Admitted Support

The three-seed orogeny contract retires its regional-span floor without
replacement, retaining seven mountain-presence, region-size and composition
requirements. Span remains diagnostic; the separate four-seed floor has different
support. This relinquishes a product length guarantee, not a physical law, and
does not retrospectively admit the historical rainfall candidate. Portability
and native passability remain unassessed.
[Read the research question](questions/q-003-relief-support.md).

[current-study-policy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md
[current-identity-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/shipped-identities.md
