## ADDED Requirements

### Requirement: Placement Steps Emit Artifact-Backed Decision-Substance Viz

Every placement step with per-plot decision or evidence data SHALL emit at
least one studio viz layer via `context.viz?.dumpGrid/dumpPoints` with
`defineVizMeta`, sourced from the step's published artifacts or op outputs
(never viz-only re-computation of truth). Plan-side scoring layers SHALL be
emitted from the PLAN output before materialization so they exist when
selection degrades or stamping fails. Stamp steps SHALL emit
placed-vs-rejected outcomes with their typed reasons. A step with genuinely
no per-plot data (currently only `assign-advanced-starts`) SHALL be
recorded as an explicit exception in the change's decision log, never
papered over with an unrelated layer.

#### Scenario: Start scoring survives degraded selection
- **WHEN** the plan-starts op returns a degraded plan and seat
  materialization subsequently throws
- **THEN** the viability score, tier, per-component, and seat-rung layers
  have already been emitted from the plan output

#### Scenario: Stamp outcomes are visible with reasons
- **WHEN** place-resources, place-natural-wonders, or place-discoveries
  records typed rejections
- **THEN** the step's outcome layer categorizes placed vs
  rejected-with-reason points backed by the published outcome artifact

### Requirement: Placement Viz Vocabulary Is Single-Sourced And Coverage-Guarded

The placement stage SHALL declare its viz group label, tile space id, and
shared score valueSpec once in a stage-local module imported by every emit
site. Score layers on a 0..1 scale SHALL carry an explicit unit-domain
valueSpec (stable legend across runs); categorical layers whose zero value
means "none" SHALL declare a transparent zero category. A pipeline-level
test SHALL pin the expected dataTypeKeys per placement step, validate layer
meta, and assert that every dataTypeKey referenced by a studio placement
overlay suggestion is actually emitted.

#### Scenario: Coverage cannot silently drift
- **WHEN** a placement step stops emitting one of its expected layers, or
  an overlay suggestion references an unpublished key
- **THEN** the placement viz-coverage test fails naming the step and key

### Requirement: Studio Placement Knob Surface Is Generated, Never Hand-Maintained

The studio config surface for placement SHALL come exclusively from the
generated recipe artifacts (`build:studio-recipes` → config schema,
defaults, and uiMeta); no hand-maintained shadow config or parallel schema
SHALL exist in the studio app. The placement stage's public knob groups
(naturalWonders, discoveries, resources, starts, support) and its full step
list SHALL be guarded by studio tests against the generated artifacts.

#### Scenario: Placement knobs reach the config panel
- **WHEN** studio loads the standard recipe artifacts
- **THEN** the placement stage exposes the knobs/naturalWonders/
  discoveries/resources/starts/support groups in the generated schema and
  all 11 placement steps in uiMeta, and no `src/ui/data` default-config
  shadow exists
