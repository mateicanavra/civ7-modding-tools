---
id: Q-003
title: Relief Bounds And Admitted Support
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "benchmark-relief-support"
    label: "Relief Benchmark Support"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts"
  - id: "morphology-mountain-planning"
    label: "Mountain And Hill Planning"
    relation: "related-producer"
    stage: "morphology-features"
    step: "mountains"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/step.ts"
assessments:
  - claim: "Relief acceptance defines separate representative and Huge-cohort bounds rather than one universal terrain law."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts"
  - claim: "The Huge orogeny protocol retains regional bounds after retiring only the mountain-spine-diameter floor."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md"
  - claim: "Current study policy treats remaining appearance shares and component bounds as product assumptions or regression guards, not independently calibrated Earth observations."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
  - claim: "These relief bounds are portable beyond their admitted map-size, terrain-representation and producer support."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Source inspection confirms the relief bounds and their unchanged source since the original pin; no map-size or terrain comparison was executed."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts"
  - kind: source-inspection
    scope: "Source inspection confirms the Huge orogeny cohort and preserved amendment, not physical adequacy or native movement through passes."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md"
  - kind: source-inspection
    scope: "Source inspection confirms the current product-assumption classification; it supplies no portability verification."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
---

# Q-003: Relief Bounds And Admitted Support

**Current source review (2026-10-10):** At
`2a31c96f8d61ee713075974838dfd36a0b008021`, the
[relief targets][current-relief-target] and
[Huge-map orogeny protocol][current-orogeny-protocol] are unchanged from the
original pin. [Current study policy][current-study-policy] explicitly classifies
remaining appearance shares and component bounds as product assumptions or
regression guards, not independently calibrated Earth observations. The related
terrain producer is [morphology-features / mountains][current-mountains-step],
which calls `planRidges`, `planFoothills` and `planRoughLands`; the benchmark
name does not make this a foundation-orogeny question. Source confirmation and
policy clarification do not establish portability beyond admitted support or
verify physical adequacy, movement or any new map outcome.

## Historical Evidence

The original packet below is preserved at
`fda02f26040a47f6bbd78ef685c1ad4fe909cc05`. Its linked tests and decisions are
historical evidence, not newly executed verification.

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

[relief-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts
[orogeny-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md
[current-relief-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts
[current-orogeny-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md
[current-study-policy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md
[current-mountains-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/step.ts
