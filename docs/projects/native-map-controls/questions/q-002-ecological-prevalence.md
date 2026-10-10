---
id: Q-002
title: Ecological Prevalence And Benchmark Authority
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "benchmark-ecological-prevalence"
    label: "Ecological Prevalence Benchmarks"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - id: "ecology-vegetation-planning"
    label: "Vegetation Planning"
    relation: "related-producer"
    stage: "ecology-features"
    step: "plan-vegetation"
    operation: "ecology.features.ops.planVegetation"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-vegetation/contract.ts"
  - id: "ecology-feature-application"
    label: "Feature Application"
    relation: "downstream-consumer"
    stage: "map-ecology"
    step: "features-apply"
    operation: "ecology.features.ops.applyFeatures"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-apply/contract.ts"
assessments:
  - claim: "The ecology benchmark contains explicit vegetation-share, feature-presence, cold-reef and floodplain-attempt predicates."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - claim: "The Earthlike identity bounds remain unchanged while the Desert Mountains absolute rainforest-tile cap is removed."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/shipped-identities.md"
  - claim: "Current study policy classifies remaining appearance counts and shares as product assumptions or regression guards, not physical laws or independently calibrated Earth observations."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
  - claim: "Each retained prevalence predicate has justified population, denominator and variability support, including habitat-conditioned numerical calibration where claimed."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Source inspection confirms the ecology predicates and their unchanged numerical bounds; no benchmark or generation was run."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - kind: source-inspection
    scope: "Source inspection confirms Earthlike identity values and removal of both Desert Mountains absolute-count consumers, not ecological adequacy."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts"
  - kind: source-inspection
    scope: "Source inspection confirms the Earthlike core selection and product-assumption classification, not predicate-level calibration provenance."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
---

# Q-002: Ecological Prevalence And Benchmark Authority

What does an ecological prevalence benchmark tell us: that a map expresses its
intended gameplay identity, that a test exercises a feature, or that the world
is ecologically plausible? These are different claims. A rainforest limit may
protect vegetation variety without estimating Earth's rainforest coverage; a
floodplain count may ensure a placement path is tested without asserting how
common floodplains should be.

The [study policy][study-policy] explicitly classifies appearance counts and
shares as product assumptions or regression guards, not physical laws or
independently calibrated Earth observations. The open question is therefore
more specific than whether these numbers are "scientific": does each retained
bound have a justified purpose, population, denominator and allowance for
variability? Confusing those supports could reward implausible coverage or
reject a coherent map, but neither consequence has been demonstrated here.

## The Benchmarks Judge Outcomes, Not Ecological Forcing

The relevant owner is the Standard recipe's metric targets, especially
[ecology targets][ecology-target] and [shipped identity targets][identity-target].
They consume measured feature and attempt counts, land and vegetation
populations, lake components and cohort identities. Their output is acceptance
evidence, not a command to generate more vegetation. Related production occurs
in `ecology-features / plan-vegetation`; `map-ecology / features-apply` realizes
feature intent on the Civ7 surface.

The default `earthlike-core` study scope qualifies Earthlike. Desert Mountains
and Archipelago are deliberately biased, opt-in configuration-stress studies
under `all`, not core Earthlike calibration or release gates. The former Desert
Mountains absolute `rainforest-tile-count <=20` cap is already removed from both
the identity and arid-climate consumers, not raised or replaced. That decision
does not remove the Earthlike bounds.

## Four Populations Behind the Numbers

### A Representative Earthlike Identity

The [identity study][identity-protocol] uses Huge (106 x 66, 10 players), seed
`1018`. It requires a projected lake component of at least four tiles and at
least five vegetation families, with forest, rainforest, taiga, savanna woodland
and sagebrush steppe present. Rainforest is limited to 65% of vegetation. These
bounds describe one representative product identity, not every seed or an
empirical Earth average.

### Vegetation Across Eight Standard Maps

The [ecology cohort][ecology-protocol] uses Standard (84 x 54, 8 players), seeds
`1018`, `1`, `2`, `3`, `42`, `99`, `1234` and `7777`. Every map requires
vegetation, at least four vegetation families, and vegetation on 8-55% of land.
Rainforest is limited to 70% of vegetation and 35% of land. Forest, rainforest
and taiga must appear in every map; savanna woodland and sagebrush steppe must
each appear in at least six of eight. The 65% representative and 70% cohort
rainforest ceilings have different sample supports and are not automatically
contradictory.

### Cold Reefs Across Eight Huge Maps

The [cold-reef cohort][cold-reef-protocol] uses the same eight seeds at Huge
(106 x 66, 10 players). Cold reefs must appear in at least four rolls and occupy
at most 15% of coast water in any roll. Presence frequency and local coverage
answer different questions: recurrence across seeds versus avoiding a carpet
within available shallow water.

### Floodplain Attempts in One Standard Map

The [floodplain study][floodplain-protocol] uses Standard (84 x 54, 8 players),
seed `1018`. It requires at least eight floodplain attempts, zero soft
rejections and zero final feature-surface violations. The attempt floor makes
the intent-to-surface path observable; the rejection and legality checks address
whether it works. A final count alone could conceal rejected attempts. This is
a strong alternative to interpreting the floor as a prevalence estimate.

## When the Denominator Changes the Question

Whole-land share, share of vegetation, share of coast water and frequency
across seed rolls are not interchangeable measures. Each preserves information
the others discard. A gameplay identity may legitimately constrain whole-map
composition; a coverage test may legitimately require enough events to exercise
a path. Neither purpose automatically calls for an eligible-habitat denominator.

For a claim about ecological adequacy, however, the amount of lawful habitat
may be essential. Scarce habitat, incompatible terrain, weak feature intent and
failed application can all produce a low observed count for different reasons.
A habitat-conditioned comparison could distinguish those explanations. It
would still need evidence supporting its numerical bound: changing the
denominator alone does not turn a product assumption into an Earth-calibrated
law.

## Evidence That Would Settle an Individual Bound

For a disputed predicate, its original purpose and exact sample support are
more informative than the number in isolation. An existing Earthlike case can
connect habitat eligibility, terrain and biome compatibility, feature intent,
and the observed result while holding the producer revision and cohort fixed.
Missing observations limit the inference; they do not establish a defective
scorer or justify retuning generation.

An authorized product or coverage requirement, supported by the stated
population and matching measurement, would disprove the allegation that this
predicate is an unsupported physics gate. A claim of ecological calibration
would need independent observational or habitat-conditioned support. That
predicate-level provenance has not been established by the source evidence
here, which is not proof that it cannot exist. The answer could clarify a
claim, justify a bound or expose a duplicated check without changing any
threshold, denominator or generator.

The [original evidence packet][original-question] retains the historical
context. The linked definitions establish source facts; they are not newly
executed benchmarks, ecological calibration or a blanket verdict on the
remaining bounds.

[identity-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts
[ecology-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts
[study-policy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md
[identity-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/shipped-identities.md
[ecology-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-ecology.md
[cold-reef-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-cold-reef.md
[floodplain-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-floodplain.md
[original-question]: https://github.com/mateicanavra/civ7-modding-tools/blob/92e1fff097e67f4bfedd3e2b3f6084d7642f04ef/docs/projects/native-map-controls/questions/q-002-ecological-prevalence.md
